import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ChevronRight,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Sparkles,
  Volume2,
  Wifi,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const GEMINI_MODEL =
  "gemini-3.8-live";

const GEMINI_WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";

const INPUT_SAMPLE_RATE = 16000;

const OUTPUT_SAMPLE_RATE = 24000;

const arrayBufferToBase64 = (
  buffer
) => {
  const bytes =
    new Uint8Array(buffer);

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    binary +=
      String.fromCharCode(
        ...bytes.subarray(
          i,
          Math.min(
            i + chunkSize,
            bytes.length
          )
        )
      );
  }

  return btoa(binary);
};

const base64ToUint8Array =
  (base64) => {
    const binary =
      atob(base64);

    const bytes =
      new Uint8Array(
        binary.length
      );

    for (
      let i = 0;
      i < binary.length;
      i++
    ) {
      bytes[i] =
        binary.charCodeAt(i);
    }

    return bytes;
  };

const float32ToInt16 =
  (input) => {
    const output =
      new Int16Array(
        input.length
      );

    for (
      let i = 0;
      i < input.length;
      i++
    ) {
      const sample =
        Math.max(
          -1,
          Math.min(
            1,
            input[i]
          )
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
  if (
    inputSampleRate ===
    outputSampleRate
  ) {
    return buffer;
  }

  if (
    outputSampleRate >
    inputSampleRate
  ) {
    throw new Error(
      "Output sample rate cannot exceed input sample rate."
    );
  }

  const ratio =
    inputSampleRate /
    outputSampleRate;

  const newLength =
    Math.round(
      buffer.length / ratio
    );

  const result =
    new Float32Array(
      newLength
    );

  let resultOffset = 0;

  let bufferOffset = 0;

  while (
    resultOffset <
    result.length
  ) {
    const nextBufferOffset =
      Math.round(
        (resultOffset + 1) *
          ratio
      );

    let accumulator = 0;

    let count = 0;

    for (
      let i =
        bufferOffset;
      i <
        nextBufferOffset &&
      i <
        buffer.length;
      i++
    ) {
      accumulator +=
        buffer[i];

      count++;
    }

    result[
      resultOffset
    ] =
      count > 0
        ? accumulator /
          count
        : 0;

    resultOffset++;

    bufferOffset =
      nextBufferOffset;
  }

  return result;
};

const createPcm16Buffer =
  (float32Data) =>
    float32ToInt16(
      float32Data
    ).buffer;

const pcm16ToFloat32 =
  (arrayBuffer) => {
    const pcm =
      new Int16Array(
        arrayBuffer
      );

    const float32 =
      new Float32Array(
        pcm.length
      );

    for (
      let i = 0;
      i < pcm.length;
      i++
    ) {
      float32[i] =
        pcm[i] / 32768;
    }

    return float32;
  };

const decodePcmAudio =
  (base64Data) =>
    pcm16ToFloat32(
      base64ToUint8Array(
        base64Data
      ).buffer
    );

const getToken =
  async (
    jwtToken,
    targetRole,
    difficulty
  ) => {
    const response =
      await fetch(
        `${API_BASE_URL}/interview/live-token`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${jwtToken}`,
          },

          body: JSON.stringify({
            targetRole,
            difficulty,
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

const createLiveSession =
  async (
    jwtToken,
    targetRole,
    difficulty
  ) => {
    const response =
      await fetch(
        `${API_BASE_URL}/interview/live/session`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${jwtToken}`,
          },

          body: JSON.stringify({
            targetRole,
            difficulty,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to create live interview session."
      );
    }

    return data.data;
  };

const recordLiveTurn =
  async ({
    jwtToken,
    sessionId,
    question,
    answer,
    nextQuestion,
  }) => {
    const response =
      await fetch(
        `${API_BASE_URL}/interview/${sessionId}/live-turn`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${jwtToken}`,
          },

          body: JSON.stringify({
            question,
            answer,
            nextQuestion,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to save live interview turn."
      );
    }

    return data.data;
  };

const endLiveInterview =
  async ({
    jwtToken,
    sessionId,
  }) => {
    const response =
      await fetch(
        `${API_BASE_URL}/interview/${sessionId}/end`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${jwtToken}`,
          },
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to complete interview."
      );
    }

    return data.data;
  };

const GeminiLiveInterviewTest =
  ({
    targetRole = "Software Developer",
    difficulty = "medium",
    embedded = false,
  }) => {
    const { token: authToken } =
      useAuth();

    const [token, setToken] =
      useState("");

    const [status, setStatus] =
      useState(
        "Disconnected"
      );

    const [error, setError] =
      useState("");

    const [
      aiTranscript,
      setAiTranscript,
    ] = useState("");

    const [
      transcript,
      setTranscript,
    ] = useState("");

    const [
      interimTranscript,
      setInterimTranscript,
    ] = useState("");

    const [
      questionNumber,
      setQuestionNumber,
    ] = useState(0);

    const [
      isInterviewActive,
      setIsInterviewActive,
    ] = useState(false);

    const [
      isAnswering,
      setIsAnswering,
    ] = useState(false);

    const [
      isProcessingAnswer,
      setIsProcessingAnswer,
    ] = useState(false);

    const [
      isEndingInterview,
      setIsEndingInterview,
    ] = useState(false);

    const [
      report,
      setReport,
    ] = useState(null);

    const websocketRef =
      useRef(null);

    const mediaStreamRef =
      useRef(null);

    const micAudioContextRef =
      useRef(null);

    const micSourceRef =
      useRef(null);

    const scriptProcessorRef =
      useRef(null);

    const silentGainRef =
      useRef(null);

    const audioContextRef =
      useRef(null);

    const audioSourcesRef =
      useRef(new Set());

    const nextAudioTimeRef =
      useRef(0);

    /* Small jitter buffer keeps streamed Gemini audio smooth
     * when individual WebSocket chunks arrive slightly late. */
    const audioPlaybackStartedRef =
      useRef(false);

    const AUDIO_JITTER_BUFFER_SECONDS =
      0.18;

    const jwtTokenRef =
      useRef("");

    const sessionIdRef =
      useRef("");

    const currentQuestionRef =
      useRef("");

    const answerQuestionRef =
      useRef("");

    const currentAiTurnTextRef =
      useRef("");

    const currentUserTurnTextRef =
      useRef("");

    const questionCountRef =
      useRef(0);

    const answerInProgressRef =
      useRef(false);

    const processingAnswerRef =
      useRef(false);

    const endingInterviewRef =
      useRef(false);

    const interviewStartedRef =
      useRef(false);

    /* Prevent duplicate async interview initialization. */
    const interviewStartLockRef =
      useRef(false);

    const liveSetupCompleteRef =
      useRef(false);

    const liveTurnFinalizedRef =
      useRef(false);

    /*
     * Candidate transcription can arrive slightly after
     * activityEnd. These timers finalize the answer from
     * the transcript itself instead of waiting for the AI
     * response lifecycle.
     */
    const answerFinalizeTimerRef =
      useRef(null);

    const answerFinalizeTimeoutRef =
      useRef(null);

    const appendText = (
      previous,
      next
    ) => {
      const value =
        String(
          next || ""
        );

      if (!value) {
        return previous;
      }

      return `${previous}${value}`;
    };

    const clearAnswerFinalizeTimers =
      () => {
        if (
          answerFinalizeTimerRef.current
        ) {
          window.clearTimeout(
            answerFinalizeTimerRef.current
          );

          answerFinalizeTimerRef.current =
            null;
        }

        if (
          answerFinalizeTimeoutRef.current
        ) {
          window.clearTimeout(
            answerFinalizeTimeoutRef.current
          );

          answerFinalizeTimeoutRef.current =
            null;
        }
      };

    const stopMicrophone =
      () => {
        if (
          scriptProcessorRef.current
        ) {
          try {
            scriptProcessorRef.current.disconnect();
          } catch {}
        }

        if (
          silentGainRef.current
        ) {
          try {
            silentGainRef.current.disconnect();
          } catch {}
        }

        if (
          micSourceRef.current
        ) {
          try {
            micSourceRef.current.disconnect();
          } catch {}
        }

        if (
          mediaStreamRef.current
        ) {
          mediaStreamRef.current
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        }

        if (
          micAudioContextRef.current
        ) {
          micAudioContextRef.current
            .close()
            .catch(() => {});
        }

        mediaStreamRef.current =
          null;

        micAudioContextRef.current =
          null;

        micSourceRef.current =
          null;

        scriptProcessorRef.current =
          null;

        silentGainRef.current =
          null;

        answerInProgressRef.current =
          false;

        setIsAnswering(
          false
        );
      };

    const stopGeminiAudio =
      () => {
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

        audioPlaybackStartedRef.current =
          false;
      };

    const closeWebSocket =
      () => {
        if (
          websocketRef.current
        ) {
          try {
            websocketRef.current.close();
          } catch {}
        }

        websocketRef.current =
          null;
      };

    const cleanup = () => {
      clearAnswerFinalizeTimers();

      stopMicrophone();

      stopGeminiAudio();

      closeWebSocket();

      if (
        audioContextRef.current
      ) {
        audioContextRef.current
          .close()
          .catch(() => {});
      }

      audioContextRef.current =
        null;

      processingAnswerRef.current =
        false;

      endingInterviewRef.current =
        false;

      interviewStartedRef.current =
        false;

      liveSetupCompleteRef.current =
        false;
    };

    const playAudioChunk =
      (base64Data) => {
        if (
          !base64Data ||
          endingInterviewRef.current
        ) {
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
          audioContext
            .resume()
            .catch(() => {});
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

        /*
         * Do not start the very first chunk immediately.
         * Gemini Live audio arrives as a stream of small
         * WebSocket messages and their arrival time is not
         * perfectly uniform. A short initial buffer absorbs
         * normal network jitter and prevents audible gaps.
         */
        if (
          !audioPlaybackStartedRef.current
        ) {
          const bufferedStartTime =
            audioContext.currentTime +
            AUDIO_JITTER_BUFFER_SECONDS;

          nextAudioTimeRef.current =
            bufferedStartTime;

          audioPlaybackStartedRef.current =
            true;
        } else {
          /*
           * If the browser has caught up with the scheduled
           * audio because a chunk arrived late, restart from
           * a tiny safety lead instead of allowing the next
           * chunk to be scheduled in the past.
           */
          const minimumStartTime =
            audioContext.currentTime +
            0.015;

          if (
            nextAudioTimeRef.current <
            minimumStartTime
          ) {
            nextAudioTimeRef.current =
              minimumStartTime;
          }
        }

        const source =
          audioContext.createBufferSource();

        source.buffer =
          audioBuffer;

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

        const startTime =
          Math.max(
            nextAudioTimeRef.current,
            audioContext.currentTime +
              0.015
          );

        try {
          source.start(
            startTime
          );
        } catch {
          audioSourcesRef.current.delete(
            source
          );
          return;
        }

        nextAudioTimeRef.current =
          startTime +
          audioBuffer.duration;
      };

    const startMicrophone =
      async () => {
        const websocket =
          websocketRef.current;

        if (
          !websocket ||
          websocket.readyState !==
            WebSocket.OPEN ||
          !liveSetupCompleteRef.current
        ) {
          throw new Error(
            "Gemini Live connection is not ready."
          );
        }

        if (
          answerInProgressRef.current
        ) {
          return;
        }

        if (
          processingAnswerRef.current
        ) {
          return;
        }

        stopGeminiAudio();

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                channelCount: 1,

                echoCancellation:
                  true,

                noiseSuppression:
                  true,

                autoGainControl:
                  true,
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

        await micAudioContext.resume();

        micAudioContextRef.current =
          micAudioContext;

        const source =
          micAudioContext.createMediaStreamSource(
            stream
          );

        micSourceRef.current =
          source;

        const processor =
          micAudioContext.createScriptProcessor(
            1024,
            1,
            1
          );

        scriptProcessorRef.current =
          processor;

        currentUserTurnTextRef.current =
          "";

        setTranscript("");

        setInterimTranscript(
          ""
        );

        /*
         * Store the question that this
         * answer actually belongs to.
         *
         * This prevents the next AI
         * question from replacing the
         * current question before the
         * answer is saved.
         */

        answerQuestionRef.current =
          currentQuestionRef.current.trim();

        answerInProgressRef.current =
          true;

        setIsAnswering(
          true
        );

        setStatus(
          "Recording answer..."
        );

        /*
         * Configure the audio processor before
         * opening the Gemini activity window.
         * This avoids a race where activityStart
         * reaches Gemini before the first audio
         * frames are ready.
         */

        processor.onaudioprocess =
          (audioEvent) => {
            if (
              !answerInProgressRef.current
            ) {
              return;
            }

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

        const silentGain =
          micAudioContext.createGain();

        silentGain.gain.value =
          0;

        silentGainRef.current =
          silentGain;

        processor.connect(
          silentGain
        );

        silentGain.connect(
          micAudioContext.destination
        );

        /*
         * Manual push-to-talk starts only after
         * the browser audio pipeline is ready.
         */
        websocket.send(
          JSON.stringify({
            realtimeInput: {
              activityStart: {},
            },
          })
        );
      };

    const stopAnswer =
      () => {
        const websocket =
          websocketRef.current;

        if (
          !answerInProgressRef.current
        ) {
          return;
        }

        processingAnswerRef.current =
          true;

        liveTurnFinalizedRef.current =
          false;

        clearAnswerFinalizeTimers();

        setIsProcessingAnswer(
          true
        );

        setStatus(
          "AI is processing your answer..."
        );

        /*
         * End the Gemini activity first.
         */
        if (
          websocket &&
          websocket.readyState ===
            WebSocket.OPEN
        ) {
          websocket.send(
            JSON.stringify({
              realtimeInput: {
                activityEnd: {},
              },
            })
          );
        }

        /*
         * Stop the browser microphone immediately.
         */
        stopMicrophone();

        /*
         * IMPORTANT:
         *
         * Do not wait for generationComplete /
         * turnComplete here. Those events belong to
         * the AI response and can arrive later.
         *
         * If we already have the candidate's final
         * transcription, submit it immediately.
         * This keeps Stop -> save nearly instant.
         */
        if (
          currentUserTurnTextRef.current.trim()
        ) {
          void handleCompletedModelTurn();

          return;
        }

        /*
         * Rare case:
         * the final input transcription has not arrived
         * yet. Give Gemini a short window to deliver it.
         *
         * This is intentionally only 300ms, not seconds.
         */
        answerFinalizeTimeoutRef.current =
          window.setTimeout(
            () => {
              answerFinalizeTimeoutRef.current =
                null;

              if (
                !processingAnswerRef.current ||
                liveTurnFinalizedRef.current
              ) {
                return;
              }

              if (
                currentUserTurnTextRef.current.trim()
              ) {
                void handleCompletedModelTurn();

                return;
              }

              /*
               * Do not leave the UI stuck forever if
               * Gemini sends no final transcription.
               */
              processingAnswerRef.current =
                false;

              liveTurnFinalizedRef.current =
                true;

              setIsProcessingAnswer(
                false
              );

              setError(
                "Your answer transcript was not received. Please try answering again."
              );

              setStatus(
                "Answer transcript unavailable"
              );
            },
            300
          );
      };

    const handleCompletedModelTurn =
      async () => {
        if (
          !processingAnswerRef.current ||
          liveTurnFinalizedRef.current
        ) {
          return;
        }

        const question =
          answerQuestionRef.current.trim();

        const answer =
          currentUserTurnTextRef.current.trim();

        if (!answer) {
          return;
        }

        if (!question) {
          clearAnswerFinalizeTimers();

          liveTurnFinalizedRef.current =
            true;

          processingAnswerRef.current =
            false;

          setIsProcessingAnswer(
            false
          );

          setError(
            "The active interview question was not captured."
          );

          setStatus(
            "Error"
          );

          return;
        }

        try {
          /*
           * Lock before the request so multiple transcript
           * chunks cannot create duplicate /live-turn calls.
           */
          liveTurnFinalizedRef.current =
            true;

          clearAnswerFinalizeTimers();

          const result =
            await recordLiveTurn({
              jwtToken:
                jwtTokenRef.current,

              sessionId:
                sessionIdRef.current,

              question,

              answer,
            });

          const answered =
            Number(
              result?.questionsAnswered ||
                0
            );

          questionCountRef.current =
            answered;

          setQuestionNumber(
            answered
          );

          processingAnswerRef.current =
            false;

          setIsProcessingAnswer(
            false
          );

          currentUserTurnTextRef.current =
            "";

          setTranscript("");

          setInterimTranscript(
            ""
          );

          setStatus(
            "Ready for your answer"
          );

          return true;
        } catch (
          turnError
        ) {
          clearAnswerFinalizeTimers();

          liveTurnFinalizedRef.current =
            false;

          processingAnswerRef.current =
            false;

          setIsProcessingAnswer(
            false
          );

          setError(
            turnError?.message ||
              "Unable to save interview answer."
          );

          setStatus(
            "Error"
          );

          return true;
        }
      };

    const scheduleAnswerFinalization =
      () => {
        if (
          !processingAnswerRef.current ||
          liveTurnFinalizedRef.current
        ) {
          return;
        }

        if (
          !currentUserTurnTextRef.current.trim()
        ) {
          return;
        }

        if (
          answerFinalizeTimerRef.current
        ) {
          window.clearTimeout(
            answerFinalizeTimerRef.current
          );
        }

        /*
         * No artificial debounce here. The final transcript
         * is already accumulated in currentUserTurnTextRef.
         */
        void handleCompletedModelTurn();
      };

    const handleGeminiMessage =
      async (event, activeWebSocket) => {
        try {
          let rawData =
            event.data;

          if (
            rawData instanceof
            Blob
          ) {
            rawData =
              await rawData.text();
          }

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

          if (
            message.error
          ) {
            throw new Error(
              message.error
                .message ||
                "Gemini Live API returned an error."
            );
          }

          if (
            message.setupComplete
          ) {
            liveSetupCompleteRef.current = true;

            setStatus(
              "AI is preparing the first question..."
            );

            const websocket =
              activeWebSocket ||
              websocketRef.current;

            if (!websocket) {
              return;
            }

            websocket.send(
              JSON.stringify({
                clientContent: {
                  turns: [
                    {
                      role:
                        "user",

                      parts: [
                        {
                          text:
                            "Start the technical interview now. Ask the first technical question only.",
                        },
                      ],
                    },
                  ],

                  turnComplete:
                    true,
                },
              })
            );

            return;
          }

          const serverContent =
            message.serverContent;

          if (
            !serverContent
          ) {
            return;
          }

          /*
           * Candidate transcript.
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

            currentUserTurnTextRef.current =
              appendText(
                currentUserTurnTextRef.current,

                text
              );

            setTranscript(
              currentUserTurnTextRef.current
            );

            setInterimTranscript(
              ""
            );

            /*
             * Final candidate transcription can arrive
             * after activityEnd. If Stop is already waiting
             * for it, submit immediately.
             */
            if (
              processingAnswerRef.current
            ) {
              void handleCompletedModelTurn();
            }
          }

          /*
           * Low-latency interim
           * candidate transcript.
           */

          if (
            serverContent
              .interimInputTranscription
              ?.text
          ) {
            setInterimTranscript(
              serverContent
                .interimInputTranscription
                .text
            );
          }

          /*
           * AI question transcript.
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

            currentAiTurnTextRef.current =
              appendText(
                currentAiTurnTextRef.current,

                text
              );

            setAiTranscript(
              (previous) =>
                appendText(
                  previous,

                  text
                )
            );
          }

          /*
           * AI audio.
           */

          if (
            serverContent
              .modelTurn
              ?.parts
          ) {
            for (
              const part of
              serverContent
                .modelTurn
                .parts
            ) {
              const audioData =
                part
                  .inlineData
                  ?.data;

              if (
                audioData
              ) {
                playAudioChunk(
                  audioData
                );
              }
            }
          }

          if (
            serverContent.interrupted
          ) {
            stopGeminiAudio();
          }

          /*
           * For AUDIO responses, generationComplete
           * is the primary completion signal.
           * turnComplete may wait for audio playback.
           */
          if (
            serverContent.generationComplete &&
            processingAnswerRef.current
          ) {
            const generatedQuestion =
              currentAiTurnTextRef.current.trim();

            if (generatedQuestion) {
              currentQuestionRef.current =
                generatedQuestion;

              setAiTranscript(
                generatedQuestion
              );

              await handleCompletedModelTurn();
            }
          }

          /* turnComplete remains a fallback. */
          if (
            serverContent.turnComplete
          ) {
            const completedModelText =
              currentAiTurnTextRef.current.trim();

            if (
              completedModelText
            ) {
              currentQuestionRef.current =
                completedModelText;

              setAiTranscript(
                completedModelText
              );
            }

            if (
              interviewStartedRef.current &&
              processingAnswerRef.current
            ) {
              await handleCompletedModelTurn();
            } else if (
              interviewStartedRef.current &&
              !answerInProgressRef.current
            ) {
              setStatus(
                "Ready for your answer"
              );
            }

            currentAiTurnTextRef.current =
              "";
          }
        } catch (
          messageError
        ) {
          console.error(
            "Gemini Live message error:",
            messageError
          );

          setError(
            messageError?.message ||
              "Unable to process Gemini Live response."
          );

          setStatus(
            "Error"
          );

          processingAnswerRef.current =
            false;

          setIsProcessingAnswer(
            false
          );
        }
      };

    const startInterview =
      async () => {
        /*
         * Lock BEFORE the first await. The embedded
         * auto-start effect can be replayed by React
         * StrictMode while the first start is still
         * creating the session/token.
         */
        if (
          interviewStartLockRef.current ||
          interviewStartedRef.current
        ) {
          return;
        }

        interviewStartLockRef.current =
          true;

        try {
          setError("");

          setReport(null);

          setAiTranscript("");

          setTranscript("");

          setInterimTranscript("");

          setQuestionNumber(0);

          questionCountRef.current =
            0;

          currentQuestionRef.current =
            "";

          answerQuestionRef.current =
            "";

          currentAiTurnTextRef.current =
            "";

          currentUserTurnTextRef.current =
            "";

          endingInterviewRef.current =
            false;

          processingAnswerRef.current =
            false;

          interviewStartedRef.current =
            false;

          liveSetupCompleteRef.current =
            false;

          liveTurnFinalizedRef.current =
            false;

          cleanup();

          const effectiveToken =
            authToken || token.trim();

          if (!effectiveToken) {
            throw new Error(
              "Authentication token is missing."
            );
          }

          jwtTokenRef.current =
            effectiveToken;

          setStatus(
            "Creating interview session..."
          );

          const sessionData =
            await createLiveSession(
              jwtTokenRef.current,
              targetRole,
              difficulty
            );

          sessionIdRef.current =
            sessionData.sessionId;

          setStatus(
            "Creating Gemini Live token..."
          );

          const tokenData =
            await getToken(
              jwtTokenRef.current,
              targetRole,
              difficulty
            );

          if (
            tokenData.model !==
            GEMINI_MODEL
          ) {
            throw new Error(
              `Unexpected Gemini model: ${tokenData.model}`
            );
          }

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
              setStatus(
                "Connecting to Gemini Live..."
              );

              /*
               * Manual push-to-talk mode.
               *
               * Automatic VAD is disabled.
               *
               * Start Answer sends
               * activityStart.
               *
               * Stop Answer sends
               * activityEnd.
               */

              const setupMessage =
                {
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

                    realtimeInputConfig:
                      {
                        automaticActivityDetection:
                          {
                            disabled:
                              true,
                          },
                      },
                  },
                };

              websocket.send(
                JSON.stringify(
                  setupMessage
                )
              );
            };

          websocket.onmessage =
            (event) =>
              handleGeminiMessage(
                event,
                websocket
              );

          websocket.onerror =
            () => {
              setError(
                "Gemini Live WebSocket error."
              );

              setStatus(
                "Error"
              );
            };

          websocket.onclose =
            (event) => {
              liveSetupCompleteRef.current = false;

              if (
                !endingInterviewRef.current
              ) {
                const closeReason =
                  String(event?.reason || "").trim();

                const closeDetails =
                  closeReason
                    ? `Connection closed (${event?.code ?? "unknown"}): ${closeReason}`
                    : `Connection closed (${event?.code ?? "unknown"}).`;

                interviewStartLockRef.current =
                  false;

                console.warn(
                  "Gemini Live WebSocket closed:",
                  event?.code,
                  event?.reason
                );

                setError(closeDetails);
                setStatus("Disconnected");

                setIsInterviewActive(
                  false
                );
              }

              setIsAnswering(
                false
              );

              answerInProgressRef.current = false;
            };

          interviewStartedRef.current =
            true;

          setIsInterviewActive(
            true
          );
        } catch (
          startError
        ) {
          console.error(
            "Start Gemini Live interview error:",
            startError
          );

          interviewStartLockRef.current =
            false;

          cleanup();

          setError(
            startError?.message ||
              "Unable to start Gemini Live interview."
          );

          setStatus(
            "Error"
          );
        }
      };

    const handleStartAnswer =
      async () => {
        if (
          !isInterviewActive
        ) {
          return;
        }

        if (
          isProcessingAnswer ||
          isAnswering ||
          isEndingInterview
        ) {
          return;
        }

        if (
          !currentQuestionRef.current.trim()
        ) {
          setError(
            "Please wait until the AI question is ready."
          );

          return;
        }

        try {
          setError("");

          await startMicrophone();
        } catch (
          startError
        ) {
          setError(
            startError?.message ||
              "Unable to access the microphone."
          );

          setStatus(
            "Microphone error"
          );
        }
      };

    const handleStopAnswer =
      () => {
        if (
          isAnswering
        ) {
          stopAnswer();
        }
      };

    const handleEndInterview =
      async () => {
        if (
          !isInterviewActive ||
          isEndingInterview
        ) {
          return;
        }

        /*
         * We intentionally don't allow
         * ending while an answer is still
         * being recorded or processed.
         *
         * This prevents losing the last
         * answer.
         */

        if (
          answerInProgressRef.current ||
          processingAnswerRef.current
        ) {
          setError(
            "Please stop your answer and wait until it is processed before ending the interview."
          );

          return;
        }

        try {
          setError("");

          setIsEndingInterview(
            true
          );

          setStatus(
            "Generating your final interview report..."
          );

          endingInterviewRef.current =
            true;

          const result =
            await endLiveInterview({
              jwtToken:
                jwtTokenRef.current,

              sessionId:
                sessionIdRef.current,
            });

          setReport(
            result
          );

          setIsInterviewActive(
            false
          );

          setStatus(
            "Interview completed"
          );

          stopMicrophone();

          stopGeminiAudio();

          closeWebSocket();

          interviewStartLockRef.current =
            false;
        } catch (
          endError
        ) {
          endingInterviewRef.current =
            false;

          setIsEndingInterview(
            false
          );

          setError(
            endError?.message ||
              "Unable to generate the final interview report."
          );

          setStatus(
            "Unable to end interview"
          );
        } finally {
          setIsEndingInterview(
            false
          );
        }
      };

    useEffect(() => {
      if (!embedded || !authToken) {
        return undefined;
      }

      if (interviewStartedRef.current) {
        return undefined;
      }

      startInterview();

      return undefined;
    }, [embedded, authToken, targetRole, difficulty]);

    useEffect(() => {
      return () => {
        cleanup();
      };
    }, []);

    return (
      <main
        className="h-[calc(100vh-88px)] w-full overflow-hidden bg-[#08111f] text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(45,212,191,0.10), transparent 30%), radial-gradient(circle at 85% 75%, rgba(59,130,246,0.08), transparent 28%)",
        }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
          {/* Top interview-room bar */}
          <header className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10 text-teal-200">
                <Sparkles size={19} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white sm:text-[15px]">
                  CampusX AI Interview Room
                </p>
                <p className="truncate text-[11px] text-slate-400 sm:text-xs">
                  {targetRole} · {difficulty} difficulty
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-xs text-slate-300 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.9)]" />
                Live session
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-200">
                Q {questionNumber}
              </div>
            </div>
          </header>

          {/* Interview room */}
          <section className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1728]/90 shadow-[0_30px_100px_rgba(0,0,0,0.38)]">
            {/* Ambient room lights */}
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex h-full min-h-0 flex-col">
              {/* Floating AI transcript bubble */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`ai-${aiTranscript}`}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className="absolute left-4 top-4 z-20 w-[calc(100%-32px)] max-w-[430px] sm:left-6 sm:top-6 sm:w-[42%]"
                >
                  <div className="relative rounded-[22px] rounded-tl-[8px] border border-white/12 bg-[#111d30]/88 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 border-b border-r border-white/10 bg-[#111d30]" />
                    <div className="relative flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200">
                        <Volume2 size={17} />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-200">
                            AI Interviewer
                          </span>
                          <span className="h-1 w-1 rounded-full bg-teal-300" />
                          <span className="text-[10px] text-slate-500">Live transcript</span>
                        </div>
                        <p className="max-h-28 overflow-y-auto pr-1 text-sm leading-6 text-slate-200 sm:max-h-32">
                          {aiTranscript || "The interviewer question will appear here..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* AI video / avatar stage */}
              <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-32 pt-28 sm:px-8 sm:pb-32 sm:pt-28 lg:px-14">
                <div className="relative w-full max-w-[900px]">
                  <div className="absolute -inset-5 rounded-[38px] bg-teal-300/5 blur-2xl" />
                  <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#111b2b] shadow-[0_35px_90px_rgba(0,0,0,0.42)]">
                    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/45 to-transparent px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] text-slate-200 backdrop-blur-md">
                        <Wifi size={13} className="text-teal-200" />
                        AI is listening
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
                        No fixed question limit
                      </div>
                    </div>

                    <img
                      src="/interview-ai.jpg"
                      alt="AI interviewer"
                      className="aspect-video w-full object-cover object-center"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08111f]/90 via-transparent to-black/10" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 sm:bottom-5 sm:left-6 sm:right-6">
                      <div>
                        <p className="text-sm font-semibold text-white sm:text-base">
                          AI Interviewer
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {status}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.95)]" />
                        <span className="text-[11px] text-slate-200">Live</span>
                      </div>
                    </div>
                  </div>

                  {/* Voice activity ring */}
                  {isAnswering && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: [0.98, 1.02, 0.98] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="pointer-events-none absolute -inset-2 rounded-[34px] border border-teal-300/30"
                    />
                  )}
                </div>
              </div>

              {/* Candidate transcript bubble */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`candidate-${transcript}-${interimTranscript}`}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className="absolute bottom-[126px] right-4 z-20 w-[calc(100%-32px)] max-w-[430px] sm:bottom-[130px] sm:right-6 sm:w-[42%]"
                >
                  <div className="relative rounded-[22px] rounded-br-[8px] border border-white/12 bg-[#111d30]/88 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="absolute -bottom-2 right-7 h-4 w-4 rotate-45 border-b border-r border-white/10 bg-[#111d30]" />
                    <div className="relative flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-200">
                        <MessageSquareText size={17} />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                            Your answer
                          </span>
                          <span className="h-1 w-1 rounded-full bg-blue-300" />
                          <span className="text-[10px] text-slate-500">Live transcript</span>
                        </div>
                        <p className="max-h-28 overflow-y-auto pr-1 text-sm leading-6 text-slate-200 sm:max-h-32">
                          {transcript || interimTranscript || "Your spoken answer will appear here..."}
                          {isAnswering && interimTranscript && (
                            <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300" />
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Error / processing message */}
              <AnimatePresence>
                {(error || isProcessingAnswer || isEndingInterview) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-[116px] left-1/2 z-30 w-[calc(100%-32px)] max-w-xl -translate-x-1/2 sm:bottom-[120px]"
                  >
                    <div
                      role={error ? "alert" : "status"}
                      className={`rounded-2xl border px-4 py-3 text-center text-xs shadow-2xl backdrop-blur-xl ${
                        error
                          ? "border-red-400/20 bg-red-950/75 text-red-100"
                          : "border-teal-300/15 bg-[#0d1c2e]/90 text-slate-200"
                      }`}
                    >
                      {error ? (
                        error
                      ) : isEndingInterview ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          Generating your final interview report...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          Processing your answer...
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom interview control dock */}
              <div className="absolute inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#08111f]/88 px-4 py-4 backdrop-blur-2xl sm:px-6 sm:py-5">
                <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleStartAnswer}
                    disabled={
                      !isInterviewActive ||
                      isAnswering ||
                      isProcessingAnswer ||
                      isEndingInterview
                    }
                    aria-label="Start answer"
                    className="group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-teal-200/20 bg-teal-300 text-[#05201d] shadow-[0_12px_35px_rgba(45,212,191,0.20)] transition hover:scale-105 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:w-16"
                  >
                    <Mic size={22} strokeWidth={2.4} />
                    <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-2 py-1 text-[10px] text-white group-hover:block">
                      Start answer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAnswer}
                    disabled={!isAnswering || isEndingInterview}
                    aria-label="Stop answer"
                    className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-slate-200 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-35 sm:h-14 sm:w-14"
                  >
                    {isAnswering ? <MicOff size={20} /> : <Volume2 size={20} />}
                    <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-2 py-1 text-[10px] text-white group-hover:block">
                      Stop answer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEndInterview}
                    disabled={
                      !isInterviewActive ||
                      isAnswering ||
                      isProcessingAnswer ||
                      isEndingInterview
                    }
                    aria-label="End interview"
                    className="group relative flex h-12 min-w-[118px] items-center justify-center gap-2 rounded-full border border-red-300/15 bg-red-500/10 px-4 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-35 sm:h-14 sm:min-w-[138px] sm:text-sm"
                  >
                    {isEndingInterview ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <PhoneOff size={17} />
                    )}
                    {isEndingInterview ? "Finishing..." : "End interview"}
                    <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-2 py-1 text-[10px] text-white group-hover:block">
                      End interview
                    </span>
                  </button>
                </div>

                <div className="mx-auto mt-3 flex max-w-3xl items-center justify-center gap-4 text-[10px] text-slate-500 sm:text-[11px]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isAnswering ? "bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.9)]" : "bg-slate-600"}`} />
                    {isAnswering ? "Recording" : "Ready"}
                  </span>
                  <span>•</span>
                  <span>{questionNumber} answered</span>
                  <span>•</span>
                  <span>End whenever you are ready</span>
                </div>
              </div>
            </div>
          </section>

          {/* Report view */}
          <AnimatePresence>
            {report && (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-7"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
                      Interview completed
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      Your interview report
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Based only on the questions you actually answered.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Attempted</p>
                      <p className="mt-1 text-lg font-semibold text-white">{report.questionsAnswered ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-teal-300/15 bg-teal-300/10 px-4 py-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-teal-200/70">Score</p>
                      <p className="mt-1 text-lg font-semibold text-teal-100">{report.overallScore ?? 0}/100</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Technical", report.feedback?.technicalScore],
                    ["Communication", report.feedback?.communicationScore],
                    ["Relevance", report.feedback?.relevanceScore],
                    ["Completeness", report.feedback?.completenessScore],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-xl font-semibold text-white">{value ?? "-"}<span className="text-xs font-normal text-slate-500">/100</span></p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <MessageSquareText size={17} className="text-teal-200" />
                      Summary
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {report.feedback?.summary || "-"}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {[
                      ["Strengths", report.feedback?.strengths || [], "text-teal-200"],
                      ["Weaknesses", report.feedback?.weaknesses || [], "text-amber-200"],
                      ["Recommendations", report.feedback?.recommendations || [], "text-blue-200"],
                    ].map(([title, items, titleClass]) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className={`text-xs font-semibold ${titleClass}`}>{title}</p>
                        <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-300">
                          {items.length ? items.map((item, index) => <li key={`${title}-${index}`}>• {item}</li>) : <li>—</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <ChevronRight size={17} className="text-teal-200" />
                      Question-wise performance
                    </div>
                    <span className="text-[11px] text-slate-500">{report.questionsAnswered ?? 0} answered</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {(report.feedback?.questionResults || []).map((item) => (
                      <div key={item.questionNumber} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-semibold text-slate-300">
                          {item.questionNumber}
                        </div>
                        <p className="min-w-0 flex-1 text-xs leading-5 text-slate-300">{item.feedback}</p>
                        <div className="shrink-0 rounded-lg bg-teal-300/10 px-2.5 py-1.5 text-xs font-semibold text-teal-200">
                          {item.score}/100
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.10]"
                >
                  <RotateCcw size={15} />
                  Start another interview
                </button>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Test-only JWT fallback */}
          {!embedded && !authToken && !isInterviewActive && !report && (
            <section className="mt-5 rounded-2xl border border-amber-200/10 bg-amber-100/[0.03] p-4">
              <label htmlFor="jwt-token" className="text-xs font-semibold text-slate-300">
                JWT Token (development test route)
              </label>
              <textarea
                id="jwt-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-teal-300/30"
                placeholder="Paste your JWT token"
              />
            </section>
          )}
        </div>
      </main>
    );
  };

export default GeminiLiveInterviewTest;