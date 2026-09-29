import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MAX_TEST_QUESTIONS = 3;

const getAudioMimeType = () => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return (
    types.find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || ""
  );
};

const base64ToBlob = (base64, mimeType = "audio/mpeg") => {
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index++) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
};

const playBlob = async (blob) => {
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);

  try {
    await audio.play();
  } finally {
    audio.addEventListener(
      "ended",
      () => URL.revokeObjectURL(audioUrl),
      { once: true }
    );
  }
};

const speakQuestion = async (text, token) => {
  const response = await fetch(
    `${API_BASE_URL}/interview/voice/speak`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    }
  );

  if (!response.ok) {
    let message = "Unable to generate question audio.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  const audioBlob = await response.blob();

  await playBlob(audioBlob);
};

export default function VoiceInterviewTest() {
  const [token, setToken] = useState("");
  const [targetRole, setTargetRole] =
    useState("Software Developer");
  const [difficulty, setDifficulty] =
    useState("medium");

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] =
    useState(1);

  const [transcription, setTranscription] =
    useState("");

  const [evaluation, setEvaluation] =
    useState(null);

  const [finalResult, setFinalResult] =
    useState(null);

  const [isStarting, setIsStarting] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [isRecording, setIsRecording] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [isEnding, setIsEnding] =
    useState(false);

  const [error, setError] = useState("");

  const [statusMessage, setStatusMessage] =
    useState(
      "Enter your JWT token and start the interview."
    );

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const cleanupMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupMediaStream();

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  const handleStartInterview = async () => {
    if (!token.trim()) {
      setError("JWT token is required.");
      return;
    }

    if (!targetRole.trim()) {
      setError("Target role is required.");
      return;
    }

    setError("");
    setFinalResult(null);
    setEvaluation(null);
    setTranscription("");
    setQuestion("");
    setQuestionNumber(1);

    setIsStarting(true);
    setStatusMessage(
      "Creating interview session..."
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/interview/session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetRole: targetRole.trim(),
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create interview session."
        );
      }

      const newSessionId =
        data?.data?.sessionId;

      const firstQuestion =
        data?.data?.question;

      if (!newSessionId || !firstQuestion) {
        throw new Error(
          "Invalid interview session response."
        );
      }

      setSessionId(newSessionId);
      setQuestion(firstQuestion);

      setStatusMessage(
        "Interview started. Preparing the first question voice..."
      );

      setIsSpeaking(true);

      try {
        await speakQuestion(
          firstQuestion,
          token.trim()
        );

        setStatusMessage(
          "Question played. Start recording your answer."
        );
      } catch (speechError) {
        setStatusMessage(
          "Question generated. Audio could not be played."
        );

        setError(
          speechError.message ||
            "Unable to play question audio."
        );
      } finally {
        setIsSpeaking(false);
      }
    } catch (requestError) {
      console.error(
        "Start interview error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to start interview."
      );

      setStatusMessage(
        "Interview could not be started."
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handlePlayQuestion = async () => {
    if (!question || !token.trim()) {
      return;
    }

    setError("");
    setIsSpeaking(true);
    setStatusMessage(
      "Playing interviewer question..."
    );

    try {
      await speakQuestion(
        question,
        token.trim()
      );

      setStatusMessage(
        "Question finished. You can answer now."
      );
    } catch (speechError) {
      console.error(
        "Question audio error:",
        speechError
      );

      setError(
        speechError.message ||
          "Unable to play question audio."
      );

      setStatusMessage(
        "Question audio failed."
      );
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStartRecording = async () => {
    if (!sessionId) {
      setError(
        "Start an interview before recording."
      );
      return;
    }

    if (isSpeaking) {
      setError(
        "Wait until the interviewer finishes speaking."
      );
      return;
    }

    if (isProcessing || isEnding) {
      return;
    }

    setError("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Microphone access is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mimeType = getAudioMimeType();

      const recorderOptions = mimeType
        ? { mimeType }
        : undefined;

      const recorder = new MediaRecorder(
        stream,
        recorderOptions
      );

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onerror = (event) => {
        console.error(
          "MediaRecorder error:",
          event
        );

        setError(
          "Microphone recording failed."
        );

        setIsRecording(false);
        cleanupMediaStream();
      };

      recorder.onstop = async () => {
        const chunks = audioChunksRef.current;

        const audioBlob = new Blob(chunks, {
          type:
            recorder.mimeType ||
            "audio/webm",
        });

        audioChunksRef.current = [];

        cleanupMediaStream();

        if (!audioBlob.size) {
          setError(
            "No audio was recorded."
          );
          setIsRecording(false);
          return;
        }

        await submitVoiceAnswer(audioBlob);
      };

      recorder.start();

      setIsRecording(true);
      setStatusMessage(
        "Recording... Speak your answer clearly."
      );
    } catch (recordingError) {
      console.error(
        "Start recording error:",
        recordingError
      );

      setError(
        recordingError.message ||
          "Unable to access microphone."
      );

      cleanupMediaStream();
    }
  };

  const handleStopRecording = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state === "inactive"
    ) {
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);
    setStatusMessage(
      "Recording stopped. Processing your answer..."
    );

    recorder.stop();
  };

  const submitVoiceAnswer = async (audioBlob) => {
    if (!sessionId || !token.trim()) {
      setIsProcessing(false);
      return;
    }

    try {
      const formData = new FormData();

      const extension =
        audioBlob.type.includes("mp4")
          ? "m4a"
          : audioBlob.type.includes("ogg")
          ? "ogg"
          : "webm";

      formData.append(
        "audio",
        audioBlob,
        `interview-answer.${extension}`
      );

      const response = await fetch(
        `${API_BASE_URL}/interview/${sessionId}/voice-answer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to process voice answer."
        );
      }

      const result = data?.data;

      const transcriptText =
        result?.transcription?.text || "";

      setTranscription(transcriptText);

      const interviewResult =
        result?.interview;

      setEvaluation(
        interviewResult?.evaluation || null
      );

      if (interviewResult?.completed) {
        setFinalResult(
          interviewResult.finalResult || null
        );

        setStatusMessage(
          "Interview completed successfully."
        );

        return;
      }

      const nextQuestion =
        interviewResult?.nextQuestion;

      if (!nextQuestion) {
        throw new Error(
          "No next interview question received."
        );
      }

      const nextNumber =
        questionNumber + 1;

      setQuestionNumber(nextNumber);
      setQuestion(nextQuestion);

      if (
        nextNumber <= MAX_TEST_QUESTIONS
      ) {
        setStatusMessage(
          "Answer evaluated. Preparing the next question..."
        );

        const audioBase64 = result?.audio;

        if (audioBase64) {
          setIsSpeaking(true);

          try {
            const audioBlob = base64ToBlob(
              audioBase64
            );

            await playBlob(audioBlob);

            setStatusMessage(
              "Next question played. Start recording your answer."
            );
          } catch (speechError) {
            console.error(
              "Next question audio error:",
              speechError
            );

            setError(
              "Next question was generated, but audio playback failed."
            );

            setStatusMessage(
              "Next question is ready. Use Play Question."
            );
          } finally {
            setIsSpeaking(false);
          }
        } else {
          setStatusMessage(
            "Next question is ready. Use Play Question."
          );
        }
      }

      if (
        nextNumber > MAX_TEST_QUESTIONS
      ) {
        await handleEndInterview();
      }
    } catch (requestError) {
      console.error(
        "Voice answer error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to process voice answer."
      );

      setStatusMessage(
        "Voice answer processing failed."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndInterview = async () => {
    if (!sessionId || !token.trim()) {
      return;
    }

    setError("");
    setIsEnding(true);
    setStatusMessage(
      "Generating final interview feedback..."
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/interview/${sessionId}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to end interview."
        );
      }

      setFinalResult(data?.data || null);

      setStatusMessage(
        "Interview completed successfully."
      );
    } catch (requestError) {
      console.error(
        "End interview error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to complete interview."
      );

      setStatusMessage(
        "Unable to complete interview."
      );
    } finally {
      setIsEnding(false);
    }
  };

  const interviewStarted =
    Boolean(sessionId);

  const interviewCompleted =
    Boolean(finalResult);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-indigo-400">
            CampusX
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            AI Mock Interview
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Temporary voice interview test environment.
            Gemini handles the interview logic while
            ElevenLabs handles voice.
          </p>
        </header>

        {!interviewStarted && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
            <h2 className="text-xl font-semibold">
              Start Interview
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Use the JWT token from your current
              authenticated session.
            </p>

            <div className="mt-6 grid gap-5">
              <div>
                <label
                  htmlFor="jwt-token"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  JWT Token
                </label>

                <textarea
                  id="jwt-token"
                  value={token}
                  onChange={(event) =>
                    setToken(event.target.value)
                  }
                  rows={4}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Paste your JWT token here"
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="target-role"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Target Role
                  </label>

                  <input
                    id="target-role"
                    value={targetRole}
                    onChange={(event) =>
                      setTargetRole(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="difficulty"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Difficulty
                  </label>

                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="easy">
                      Easy
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="hard">
                      Hard
                    </option>
                  </select>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleStartInterview}
                disabled={isStarting}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isStarting
                  ? "Starting Interview..."
                  : "Start Interview"}
              </button>
            </div>
          </section>
        )}

        {interviewStarted && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-slate-700 bg-slate-800">
                <img
                  src="/interviewer.jpg"
                  alt="AI interviewer"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    event.currentTarget.parentElement.innerHTML =
                      '<span class="text-5xl" aria-hidden="true">👨‍💼</span>';
                  }}
                />
              </div>

              <div className="mt-5 text-center">
                <h2 className="font-semibold">
                  AI Interviewer
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {targetRole}
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-slate-950 p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Question
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {Math.min(
                    questionNumber,
                    MAX_TEST_QUESTIONS
                  )}
                  <span className="text-slate-500">
                    /{MAX_TEST_QUESTIONS}
                  </span>
                </p>
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
              <div
                aria-live="polite"
                className="mb-5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
              >
                {statusMessage}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Interview Question
                </p>

                <h2 className="mt-3 text-xl font-semibold leading-relaxed text-slate-100 sm:text-2xl">
                  {question}
                </h2>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePlayQuestion}
                  disabled={
                    isSpeaking ||
                    isRecording ||
                    isProcessing ||
                    isEnding ||
                    interviewCompleted
                  }
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSpeaking
                    ? "🔊 Speaking..."
                    : "🔊 Play Question"}
                </button>

                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={
                      isSpeaking ||
                      isProcessing ||
                      isEnding ||
                      interviewCompleted
                    }
                    className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    🎤 Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    ⏹ Stop Recording
                  </button>
                )}

                {!interviewCompleted && (
                  <button
                    type="button"
                    onClick={handleEndInterview}
                    disabled={
                      isRecording ||
                      isProcessing ||
                      isEnding
                    }
                    className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isEnding
                      ? "Ending..."
                      : "End Interview"}
                  </button>
                )}
              </div>

              {isRecording && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3">
                  <span
                    className="h-3 w-3 animate-pulse rounded-full bg-red-500"
                    aria-hidden="true"
                  />

                  <span className="text-sm text-red-300">
                    Recording your answer...
                  </span>
                </div>
              )}

              {isProcessing && (
                <div className="mt-5 rounded-xl border border-indigo-900/60 bg-indigo-950/30 px-4 py-3 text-sm text-indigo-300">
                  Converting speech to text and
                  evaluating your answer...
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {transcription && (
                <div className="mt-7">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Your Transcribed Answer
                  </h3>

                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-300">
                    {transcription}
                  </div>
                </div>
              )}

              {evaluation && (
                <div className="mt-7">
                  <h3 className="text-sm font-semibold text-slate-300">
                    AI Evaluation
                  </h3>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Overall
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {evaluation.score}
                        <span className="text-sm text-slate-500">
                          /100
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Technical Accuracy
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {evaluation.technicalAccuracy}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Relevance
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {evaluation.relevance}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Completeness
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {evaluation.completeness}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                      <p className="text-xs text-slate-500">
                        Communication
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {evaluation.communication}
                      </p>
                    </div>
                  </div>

                  {evaluation.feedback && (
                    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Feedback
                      </p>

                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {evaluation.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {finalResult && (
                <div className="mt-8 rounded-2xl border border-indigo-900/70 bg-indigo-950/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Interview Complete
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Overall Score:{" "}
                    {finalResult.overallScore}
                    /100
                  </h3>

                  {finalResult.feedback && (
                    <div className="mt-5 space-y-5">
                      {finalResult.feedback
                        .summary && (
                        <div>
                          <h4 className="font-semibold">
                            Summary
                          </h4>

                          <p className="mt-1 text-sm leading-relaxed text-slate-300">
                            {
                              finalResult.feedback
                                .summary
                            }
                          </p>
                        </div>
                      )}

                      {Array.isArray(
                        finalResult.feedback
                          .strengths
                      ) &&
                        finalResult.feedback
                          .strengths.length > 0 && (
                          <div>
                            <h4 className="font-semibold">
                              Strengths
                            </h4>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                              {finalResult.feedback.strengths.map(
                                (item, index) => (
                                  <li key={index}>
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {Array.isArray(
                        finalResult.feedback
                          .weaknesses
                      ) &&
                        finalResult.feedback
                          .weaknesses.length > 0 && (
                          <div>
                            <h4 className="font-semibold">
                              Areas to Improve
                            </h4>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                              {finalResult.feedback.weaknesses.map(
                                (item, index) => (
                                  <li key={index}>
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {Array.isArray(
                        finalResult.feedback
                          .recommendations
                      ) &&
                        finalResult.feedback
                          .recommendations.length >
                          0 && (
                          <div>
                            <h4 className="font-semibold">
                              Recommendations
                            </h4>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                              {finalResult.feedback.recommendations.map(
                                (item, index) => (
                                  <li key={index}>
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}