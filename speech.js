// MIST Trainer — Speech recognition wrapper
// Handles Web Speech API lifecycle, errors, and text fallback.

const Speech = (() => {
  let recognition = null;
  let startTime = null;
  let onResult = null;
  let onError = null;
  let onTick = null; // called every second with { elapsed, limit }
  let tickInterval = null;
  let finalTranscript = "";
  let timeLimit = 30;
  let autoStopTimer = null;

  function isSupported() {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  }

  function start({ limit, onFinal, onErr, onTickFn }) {
    timeLimit = limit;
    onResult = onFinal;
    onError = onErr;
    onTick = onTickFn;
    finalTranscript = "";
    startTime = null;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          if (!startTime) {
            startTime = Date.now();
            startTick();
          }
          finalTranscript += t + " ";
        } else {
          interim += t;
        }
      }
      const conf = e.results[e.results.length - 1][0].confidence;
      if (conf > 0 && conf < 0.7) {
        document.getElementById("low-confidence-warning").hidden = false;
      }
      document.getElementById("interim-text").textContent = (finalTranscript + interim).trim();
    };

    recognition.onerror = (e) => {
      clearTick();
      if (e.error === "not-allowed") {
        onError("mic-denied");
      } else if (e.error === "no-speech") {
        onError("no-speech");
      } else if (e.error === "network") {
        onError("network");
      } else if (e.error === "aborted") {
        // auto-restart if under time limit
        const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
        if (elapsed < timeLimit) {
          recognition.start();
        } else {
          deliver();
        }
      } else {
        onError("unknown");
      }
    };

    recognition.onend = () => {
      // Fires after stop() is called — deliver final transcript
      clearTick();
      deliver();
    };

    recognition.start();

    // Hard cut at timeLimit
    autoStopTimer = setTimeout(() => stop(), timeLimit * 1000);
  }

  function stop() {
    if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
    clearTick();
    if (recognition) recognition.stop();
  }

  function startTick() {
    tickInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (onTick) onTick({ elapsed, limit: timeLimit });
      if (elapsed >= timeLimit) stop();
    }, 200);
  }

  function clearTick() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  }

  function deliver() {
    const durationSec = startTime ? (Date.now() - startTime) / 1000 : 0;
    const text = finalTranscript.trim();
    if (!text) { onError("no-speech"); return; }
    if (onResult) onResult({ transcript: text, durationSec });
  }

  return { isSupported, start, stop };
})();
