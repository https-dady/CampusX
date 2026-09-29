import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const GEMINI_MODEL =
    "gemini-2.5-flash-native-audio-preview-12-2025";

const GEMINI_WS_URL =
    "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

/*
 * Client-side VAD configuration.
 *
 * We keep automatic server VAD enabled as a fallback.
 * Client VAD only detects when the user has stopped speaking
 * and sends audioStreamEnd to finalize the turn faster.
 */
const VAD_SILENCE_MS = 500;

/*
 * RMS threshold.
 *
 * This is intentionally conservative so normal background
 * microphone noise does not continuously trigger speech.
 */
const VAD_MIN_RMS = 0.015;

const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);

    let binary = "";
    const chunkSize = 0x8000;

    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {
        binary += String.fromCharCode(
            ...bytes.subarray(
                i,
                Math.min(i + chunkSize, bytes.length)
            )
        );
    }

    return btoa(binary);
};

const base64ToUint8Array = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
};

const float32ToInt16 = (input) => {
    const output = new Int16Array(input.length);

    for (let i = 0; i < input.length; i++) {
        const sample = Math.max(
            -1,
            Math.min(1, input[i])
        );

        output[i] =
            sample < 0
                ? sample * 0x8000
                : sample * 0x7fff;
    }

    return output;
};

const downsampleBuffer = (
    buffer,
    inputSampleRate,
    outputSampleRate
) => {
    if (inputSampleRate === outputSampleRate) {
        return buffer;
    }

    if (outputSampleRate > inputSampleRate) {
        throw new Error(
            "Output sample rate cannot exceed input sample rate."
        );
    }

    const ratio =
        inputSampleRate / outputSampleRate;

    const newLength = Math.round(
        buffer.length / ratio
    );

    const result =
        new Float32Array(newLength);

    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
        const nextOffsetBuffer =
            Math.round(
                (offsetResult + 1) * ratio
            );

        let accumulator = 0;
        let count = 0;

        for (
            let i = offsetBuffer;
            i < nextOffsetBuffer &&
            i < buffer.length;
            i++
        ) {
            accumulator += buffer[i];
            count++;
        }

        result[offsetResult] =
            count > 0
                ? accumulator / count
                : 0;

        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }

    return result;
};

const createPcm16Buffer = (float32Data) => {
    const pcm =
        float32ToInt16(float32Data);

    return pcm.buffer;
};

const pcm16ToFloat32 = (arrayBuffer) => {
    const pcm =
        new Int16Array(arrayBuffer);

    const float32 =
        new Float32Array(pcm.length);

    for (let i = 0; i < pcm.length; i++) {
        float32[i] = pcm[i] / 32768;
    }

    return float32;
};

const decodePcmAudio = (base64Data) => {
    const bytes =
        base64ToUint8Array(base64Data);

    return pcm16ToFloat32(bytes.buffer);
};

const calculateRms = (audioData) => {
    if (!audioData || audioData.length === 0) {
        return 0;
    }

    let sum = 0;

    for (let i = 0; i < audioData.length; i++) {
        const sample = audioData[i];
        sum += sample * sample;
    }

    return Math.sqrt(
        sum / audioData.length
    );
};

const getToken = async (token) => {
    const response = await fetch(
        `${API_BASE_URL}/interview/live-token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                targetRole:
                    "Software Developer",
                difficulty: "medium",
            }),
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data?.message ||
            "Unable to create Gemini Live token."
        );
    }

    return data.data;
};

const GeminiLiveInterviewTest = () => {
    const [token, setToken] =
        useState("");

    const [status, setStatus] =
        useState("Disconnected");

    const [transcript, setTranscript] =
        useState("");

    const [
        interimTranscript,
        setInterimTranscript,
    ] = useState("");

    const [aiTranscript, setAiTranscript] =
        useState("");

    const [error, setError] =
        useState("");

    const [isListening, setIsListening] =
        useState(false);

    const websocketRef =
        useRef(null);

    const mediaStreamRef =
        useRef(null);

    const audioContextRef =
        useRef(null);

    const micAudioContextRef =
        useRef(null);

    const micSourceRef =
        useRef(null);

    const scriptProcessorRef =
        useRef(null);

    const silentGainRef =
        useRef(null);

    const nextAudioTimeRef =
        useRef(0);

    const audioSourcesRef =
        useRef(new Set());

    /*
     * Client-side VAD state.
     */
    const speechActiveRef =
        useRef(false);

    const silenceStartedAtRef =
        useRef(null);

    const vadSpeechDetectedRef =
        useRef(false);

    /*
     * Prevent duplicate audioStreamEnd
     * events for the same speech turn.
     */
    const audioStreamEndSentRef =
        useRef(false);

    /*
     * Track whether Gemini is currently
     * generating a response.
     */
    const modelSpeakingRef =
        useRef(false);

    const cleanup = () => {
        setIsListening(false);

        /*
         * Stop any scheduled/playing Gemini
         * audio immediately.
         */
        for (
            const source of
            audioSourcesRef.current
        ) {
            try {
                source.stop();
            } catch {}
        }

        audioSourcesRef.current.clear();

        /*
         * Reset audio scheduling.
         */
        nextAudioTimeRef.current = 0;

        /*
         * Reset client VAD state.
         */
        speechActiveRef.current = false;
        silenceStartedAtRef.current = null;
        vadSpeechDetectedRef.current = false;
        audioStreamEndSentRef.current = false;
        modelSpeakingRef.current = false;

        if (scriptProcessorRef.current) {
            try {
                scriptProcessorRef.current.disconnect();
            } catch {}
        }

        if (silentGainRef.current) {
            try {
                silentGainRef.current.disconnect();
            } catch {}
        }

        if (micSourceRef.current) {
            try {
                micSourceRef.current.disconnect();
            } catch {}
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });
        }

        if (websocketRef.current) {
            try {
                websocketRef.current.close();
            } catch {}
        }

        if (micAudioContextRef.current) {
            micAudioContextRef.current
                .close()
                .catch(() => {});
        }

        if (audioContextRef.current) {
            audioContextRef.current
                .close()
                .catch(() => {});
        }

        websocketRef.current = null;
        mediaStreamRef.current = null;
        micAudioContextRef.current = null;
        audioContextRef.current = null;
        micSourceRef.current = null;
        scriptProcessorRef.current = null;
        silentGainRef.current = null;
    };

    const sendAudioStreamEnd = (
        websocket
    ) => {
        if (
            !websocket ||
            websocket.readyState !==
                WebSocket.OPEN
        ) {
            return;
        }

        if (
            audioStreamEndSentRef.current
        ) {
            return;
        }

        /*
         * Do not repeatedly send end events
         * while the microphone is silent.
         */
        audioStreamEndSentRef.current =
            true;

        console.log(
            "Client VAD: speech ended. Sending audioStreamEnd."
        );

        try {
            websocket.send(
                JSON.stringify({
                    realtimeInput: {
                        audioStreamEnd: true,
                    },
                })
            );
        } catch (error) {
            console.error(
                "Unable to send audioStreamEnd:",
                error
            );

            audioStreamEndSentRef.current =
                false;
        }

        speechActiveRef.current = false;
        silenceStartedAtRef.current = null;
        vadSpeechDetectedRef.current = false;
    };

    const playAudioChunk = (
        base64Data
    ) => {
        if (!base64Data) {
            return;
        }

        let audioContext =
            audioContextRef.current;

        if (!audioContext) {
            audioContext =
                new AudioContext({
                    sampleRate:
                        OUTPUT_SAMPLE_RATE,
                    latencyHint:
                        "interactive",
                });

            audioContextRef.current =
                audioContext;
        }

        if (
            audioContext.state ===
            "suspended"
        ) {
            audioContext.resume();
        }

        const audioData =
            decodePcmAudio(
                base64Data
            );

        if (!audioData.length) {
            return;
        }

        const audioBuffer =
            audioContext.createBuffer(
                1,
                audioData.length,
                OUTPUT_SAMPLE_RATE
            );

        audioBuffer.copyToChannel(
            audioData,
            0
        );

        const source =
            audioContext.createBufferSource();

        source.buffer = audioBuffer;

        source.connect(
            audioContext.destination
        );

        audioSourcesRef.current.add(
            source
        );

        source.onended = () => {
            audioSourcesRef.current.delete(
                source
            );
        };

        const currentTime =
            audioContext.currentTime;

        const startTime =
            Math.max(
                currentTime,
                nextAudioTimeRef.current
            );

        source.start(startTime);

        nextAudioTimeRef.current =
            startTime +
            audioBuffer.duration;

        modelSpeakingRef.current =
            true;
    };

    const startMicrophone = async (
        websocket
    ) => {
        const stream =
            await navigator.mediaDevices.getUserMedia(
                {
                    audio: {
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                }
            );

        mediaStreamRef.current =
            stream;

        const micAudioContext =
            new AudioContext({
                latencyHint:
                    "interactive",
            });

        micAudioContextRef.current =
            micAudioContext;

        const source =
            micAudioContext.createMediaStreamSource(
                stream
            );

        micSourceRef.current =
            source;

        /*
         * 1024 frames gives a much smaller
         * realtime processing interval than 4096.
         */
        const processor =
            micAudioContext.createScriptProcessor(
                1024,
                1,
                1
            );

        scriptProcessorRef.current =
            processor;

        /*
         * Reset VAD state whenever microphone
         * starts.
         */
        speechActiveRef.current =
            false;

        silenceStartedAtRef.current =
            null;

        vadSpeechDetectedRef.current =
            false;

        audioStreamEndSentRef.current =
            false;

        processor.onaudioprocess =
            (audioEvent) => {
                if (
                    websocket.readyState !==
                    WebSocket.OPEN
                ) {
                    return;
                }

                const inputData =
                    audioEvent.inputBuffer.getChannelData(
                        0
                    );

                /*
                 * Calculate the current audio
                 * volume for client-side VAD.
                 */
                const rms =
                    calculateRms(
                        inputData
                    );

                const now =
                    performance.now();

                const isSpeech =
                    rms >= VAD_MIN_RMS;

                /*
                 * Speech detected.
                 */
                if (isSpeech) {
                    speechActiveRef.current =
                        true;

                    vadSpeechDetectedRef.current =
                        true;

                    silenceStartedAtRef.current =
                        null;

                    /*
                     * A new speech segment means
                     * we can send audio again.
                     */
                    audioStreamEndSentRef.current =
                        false;
                } else if (
                    speechActiveRef.current
                ) {
                    /*
                     * Speech was previously active
                     * and now silence is detected.
                     */
                    if (
                        silenceStartedAtRef.current ===
                        null
                    ) {
                        silenceStartedAtRef.current =
                            now;
                    }

                    const silenceDuration =
                        now -
                        silenceStartedAtRef.current;

                    /*
                     * Finalize the user's turn
                     * after 500ms of continuous silence.
                     */
                    if (
                        silenceDuration >=
                            VAD_SILENCE_MS &&
                        vadSpeechDetectedRef.current
                    ) {
                        sendAudioStreamEnd(
                            websocket
                        );
                    }
                }

                /*
                 * Always continue streaming the
                 * raw PCM audio to Gemini.
                 *
                 * Client VAD is only used to send
                 * the early turn-finalization signal.
                 */
                const downsampled =
                    downsampleBuffer(
                        inputData,
                        micAudioContext.sampleRate,
                        INPUT_SAMPLE_RATE
                    );

                const pcmBuffer =
                    createPcm16Buffer(
                        downsampled
                    );

                websocket.send(
                    JSON.stringify({
                        realtimeInput: {
                            audio: {
                                data:
                                    arrayBufferToBase64(
                                        pcmBuffer
                                    ),
                                mimeType:
                                    "audio/pcm;rate=16000",
                            },
                        },
                    })
                );
            };

        source.connect(
            processor
        );

        /*
         * ScriptProcessorNode needs to be connected
         * to an output to reliably execute in browsers.
         *
         * Gain 0 prevents microphone audio from
         * being played through the speakers.
         */
        const silentGain =
            micAudioContext.createGain();

        silentGain.gain.value = 0;

        silentGainRef.current =
            silentGain;

        processor.connect(
            silentGain
        );

        silentGain.connect(
            micAudioContext.destination
        );

        setIsListening(true);
        setStatus("Listening");
    };

    const handleGeminiMessage =
        async (event) => {
            try {
                let rawData =
                    event.data;

                /*
                 * Gemini WebSocket responses
                 * can arrive as Blob in browsers.
                 */
                if (
                    rawData instanceof Blob
                ) {
                    rawData =
                        await rawData.text();
                }

                /*
                 * Also support ArrayBuffer.
                 */
                if (
                    rawData instanceof
                    ArrayBuffer
                ) {
                    rawData =
                        new TextDecoder().decode(
                            new Uint8Array(
                                rawData
                            )
                        );
                }

                const message =
                    typeof rawData ===
                    "string"
                        ? JSON.parse(
                              rawData
                          )
                        : rawData;

                console.log(
                    "Gemini server message:",
                    message
                );

                /*
                 * Gemini has completed setup.
                 */
                if (
                    message.setupComplete
                ) {
                    console.log(
                        "Gemini Live setup completed."
                    );

                    setStatus(
                        "Connected"
                    );

                    /*
                     * Explicitly start the interview.
                     */
                    websocketRef.current.send(
                        JSON.stringify({
                            clientContent: {
                                turns: [
                                    {
                                        role: "user",
                                        parts: [
                                            {
                                                text:
                                                    "Start the technical interview now. You are interviewing me for a Software Developer role. Ask me the first interview question. Ask only one question and do not provide the answer.",
                                            },
                                        ],
                                    },
                                ],
                                turnComplete:
                                    true,
                            },
                        })
                    );

                    console.log(
                        "First interview prompt sent."
                    );

                    /*
                     * Start microphone only after
                     * Gemini setup has completed.
                     */
                    await startMicrophone(
                        websocketRef.current
                    );

                    return;
                }

                /*
                 * Gemini API error.
                 */
                if (message.error) {
                    console.error(
                        "Gemini API error:",
                        message.error
                    );

                    setError(
                        message.error.message ||
                        "Gemini Live API returned an error."
                    );

                    setStatus(
                        "Error"
                    );

                    return;
                }

                const serverContent =
                    message.serverContent;

                if (!serverContent) {
                    return;
                }

                /*
                 * User final transcription.
                 */
                if (
                    serverContent
                        .inputTranscription
                        ?.text
                ) {
                    const text =
                        serverContent
                            .inputTranscription
                            .text;

                    console.log(
                        "User transcript:",
                        text
                    );

                    setTranscript(
                        (previous) =>
                            `${previous}${text}`
                    );

                    setInterimTranscript(
                        ""
                    );
                }

                /*
                 * User interim transcription.
                 */
                if (
                    serverContent
                        .interimInputTranscription
                        ?.text
                ) {
                    const text =
                        serverContent
                            .interimInputTranscription
                            .text;

                    console.log(
                        "Interim user transcript:",
                        text
                    );

                    setInterimTranscript(
                        text
                    );
                }

                /*
                 * Gemini output transcription.
                 */
                if (
                    serverContent
                        .outputTranscription
                        ?.text
                ) {
                    const text =
                        serverContent
                            .outputTranscription
                            .text;

                    console.log(
                        "Gemini transcript:",
                        text
                    );

                    setAiTranscript(
                        (previous) =>
                            `${previous}${text}`
                    );
                }

                /*
                 * Gemini native audio.
                 */
                if (
                    serverContent
                        .modelTurn
                        ?.parts
                ) {
                    for (
                        const part of
                        serverContent
                            .modelTurn.parts
                    ) {
                        const audioData =
                            part.inlineData
                                ?.data;

                        if (audioData) {
                            console.log(
                                "Gemini audio received:",
                                part.inlineData
                                    ?.mimeType
                            );

                            playAudioChunk(
                                audioData
                            );
                        }
                    }
                }

                /*
                 * Gemini interrupted response.
                 *
                 * Google recommends immediately
                 * clearing queued client-side audio
                 * when this event is received.
                 */
                if (
                    serverContent.interrupted
                ) {
                    console.log(
                        "Gemini response interrupted."
                    );

                    for (
                        const source of
                        audioSourcesRef.current
                    ) {
                        try {
                            source.stop();
                        } catch {}
                    }

                    audioSourcesRef.current.clear();

                    nextAudioTimeRef.current =
                        0;

                    modelSpeakingRef.current =
                        false;
                }

                /*
                 * Gemini completed its turn.
                 */
                if (
                    serverContent.turnComplete
                ) {
                    console.log(
                        "Gemini turn completed."
                    );

                    modelSpeakingRef.current =
                        false;

                    /*
                     * Prepare client VAD for the
                     * next user answer.
                     */
                    speechActiveRef.current =
                        false;

                    silenceStartedAtRef.current =
                        null;

                    vadSpeechDetectedRef.current =
                        false;

                    audioStreamEndSentRef.current =
                        false;

                    setInterimTranscript(
                        ""
                    );

                    setStatus(
                        "Listening"
                    );
                }
            } catch (error) {
                console.error(
                    "Gemini message error:",
                    error
                );

                setError(
                    error?.message ||
                    "Unable to process Gemini response."
                );
            }
        };

    const startInterview =
        async () => {
            try {
                setError("");
                setTranscript("");
                setInterimTranscript("");
                setAiTranscript("");

                /*
                 * Clean any previous session
                 * before creating a new one.
                 */
                cleanup();

                if (!token.trim()) {
                    throw new Error(
                        "Please enter your JWT token."
                    );
                }

                setStatus(
                    "Creating Gemini Live token..."
                );

                /*
                 * Create audio context from
                 * the user's button interaction.
                 *
                 * This helps satisfy browser
                 * autoplay restrictions.
                 */
                const audioContext =
                    new AudioContext({
                        sampleRate:
                            OUTPUT_SAMPLE_RATE,
                        latencyHint:
                            "interactive",
                    });

                audioContextRef.current =
                    audioContext;

                await audioContext.resume();

                const tokenData =
                    await getToken(
                        token.trim()
                    );

                if (
                    tokenData.model !==
                    GEMINI_MODEL
                ) {
                    throw new Error(
                        `Unexpected Gemini model: ${tokenData.model}`
                    );
                }

                const websocketUrl =
                    `${GEMINI_WS_URL}?access_token=${encodeURIComponent(
                        tokenData.token
                    )}`;

                const websocket =
                    new WebSocket(
                        websocketUrl
                    );

                websocketRef.current =
                    websocket;

                websocket.onopen =
                    () => {
                        console.log(
                            "Gemini Live WebSocket connected."
                        );

                        setStatus(
                            "Sending setup..."
                        );

                        /*
                         * FIRST WebSocket message
                         * must be setup.
                         */
                        const setupMessage = {
                            setup: {
                                model:
                                    `models/${GEMINI_MODEL}`,

                                generationConfig: {
                                    responseModalities:
                                        ["AUDIO"],
                                },

                                inputAudioTranscription:
                                    {},

                                outputAudioTranscription:
                                    {},

                                /*
                                 * Automatic server VAD
                                 * remains enabled.
                                 *
                                 * Client-side VAD below
                                 * sends audioStreamEnd
                                 * earlier when speech ends.
                                 */
                                realtimeInputConfig: {
                                    automaticActivityDetection:
                                        {
                                            disabled:
                                                false,

                                            prefixPaddingMs:
                                                20,

                                            silenceDurationMs:
                                                500,
                                        },
                                },
                            },
                        };

                        console.log(
                            "Sending Gemini setup:",
                            setupMessage
                        );

                        websocket.send(
                            JSON.stringify(
                                setupMessage
                            )
                        );
                    };

                websocket.onmessage =
                    handleGeminiMessage;

                websocket.onerror =
                    (event) => {
                        console.error(
                            "Gemini Live WebSocket error:",
                            event
                        );

                        setError(
                            "Gemini Live WebSocket error."
                        );

                        setStatus(
                            "Error"
                        );
                    };

                websocket.onclose =
                    (event) => {
                        console.log(
                            "Gemini Live WebSocket closed:",
                            {
                                code:
                                    event.code,
                                reason:
                                    event.reason,
                                wasClean:
                                    event.wasClean,
                            }
                        );

                        setStatus(
                            "Disconnected"
                        );

                        setIsListening(
                            false
                        );
                    };
            } catch (error) {
                console.error(
                    "Start Gemini Live error:",
                    error
                );

                cleanup();

                setError(
                    error?.message ||
                    "Unable to start Gemini Live interview."
                );

                setStatus(
                    "Error"
                );
            }
        };

    const stopInterview =
        () => {
            cleanup();
            setStatus(
                "Disconnected"
            );
        };

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "32px",
                fontFamily:
                    "Arial, sans-serif",
            }}
        >
            <section
                style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                }}
            >
                <h1>
                    Gemini Native Audio Interview
                </h1>

                <p>
                    Real-time Gemini Live API
                    voice test.
                </p>

                <div
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    <label htmlFor="jwt-token">
                        JWT Token
                    </label>

                    <textarea
                        id="jwt-token"
                        value={token}
                        onChange={(event) =>
                            setToken(
                                event.target.value
                            )
                        }
                        rows={4}
                        style={{
                            width: "100%",
                            marginTop: "8px",
                            padding: "10px",
                        }}
                        placeholder="Paste your JWT token"
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "20px",
                    }}
                >
                    <button
                        type="button"
                        onClick={
                            startInterview
                        }
                        disabled={
                            status ===
                                "Listening" ||
                            status ===
                                "Connected" ||
                            status ===
                                "Sending setup..."
                        }
                    >
                        Start Interview
                    </button>

                    <button
                        type="button"
                        onClick={
                            stopInterview
                        }
                    >
                        Stop
                    </button>
                </div>

                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    <strong>
                        Status:
                    </strong>{" "}
                    {status}
                </div>

                {error && (
                    <div
                        role="alert"
                        style={{
                            marginBottom: "20px",
                        }}
                    >
                        <strong>
                            Error:
                        </strong>{" "}
                        {error}
                    </div>
                )}

                <section
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    <h2>
                        AI Response
                    </h2>

                    <div
                        style={{
                            minHeight: "100px",
                            border:
                                "1px solid #ccc",
                            padding: "16px",
                            borderRadius: "8px",
                        }}
                    >
                        {aiTranscript ||
                            "AI response transcript will appear here."}
                    </div>
                </section>

                <section>
                    <h2>
                        Your Speech
                    </h2>

                    <div
                        style={{
                            minHeight: "100px",
                            border:
                                "1px solid #ccc",
                            padding: "16px",
                            borderRadius: "8px",
                        }}
                    >
                        {transcript ||
                            interimTranscript ||
                            "Your speech transcript will appear here."}
                    </div>
                </section>

                <p
                    style={{
                        marginTop: "20px",
                    }}
                >
                    🎤{" "}
                    {isListening
                        ? "Microphone is active"
                        : "Microphone is inactive"}
                </p>
            </section>
        </main>
    );
};

export default GeminiLiveInterviewTest;