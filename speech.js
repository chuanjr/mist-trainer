// MIST Trainer — Speech module (Groq Whisper)
// Records audio with MediaRecorder, sends to Groq whisper-large-v3-turbo for zh-TW transcription.
// Interface: { isSupported, start, stop }

const Speech = (() => {
  let mediaRecorder = null;
  let audioChunks = [];
  let startTime = null;
  let onResult = null;
  let onError = null;
  let onTick = null;
  let tickInterval = null;
  let timeLimit = 30;
  let autoStopTimer = null;
  let groqKey = null;
  let stream = null;

  function isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }

  // start({ limit, onFinal, onErr, onTickFn, groqKey })
  function start({ limit, onFinal, onErr, onTickFn, groqKey: key }) {
    timeLimit = limit;
    onResult = onFinal;
    onError = onErr;
    onTick = onTickFn;
    groqKey = key;
    audioChunks = [];
    startTime = null;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(s => {
        stream = s;
        startTime = Date.now();
        startTick();

        // Pick the best supported audio format
        const mimeType = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/ogg',
          'audio/mp4'
        ].find(t => {
          try { return MediaRecorder.isTypeSupported(t); } catch { return false; }
        }) || '';

        mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        mediaRecorder.ondataavailable = e => {
          if (e.data && e.data.size > 0) audioChunks.push(e.data);
        };
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          await transcribeWithGroq();
        };
        mediaRecorder.start(200); // collect chunks every 200ms

        // Show recording indicator in transcript area
        const interimEl = document.getElementById("interim-text");
        if (interimEl) interimEl.textContent = "🎙 錄音中...";

        // Hard cut at timeLimit
        autoStopTimer = setTimeout(() => stop(), timeLimit * 1000);
      })
      .catch(err => {
        const name = err.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
          onError("mic-denied");
        } else {
          onError("unknown");
        }
      });
  }

  async function transcribeWithGroq() {
    const durationSec = startTime ? (Date.now() - startTime) / 1000 : 0;

    if (audioChunks.length === 0) {
      onError("no-speech");
      return;
    }

    const mimeType = (audioChunks[0] && audioChunks[0].type) || 'audio/webm';
    const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(audioChunks, { type: mimeType });

    const interimEl = document.getElementById("interim-text");
    if (interimEl) interimEl.textContent = "⏳ 語音轉文字中...";

    const form = new FormData();
    form.append('file', blob, `audio.${ext}`);
    form.append('model', 'whisper-large-v3-turbo');
    form.append('language', 'zh');
    form.append('response_format', 'json');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}` },
        body: form
      });

      if (res.status === 401) { onError("groq-invalid-key"); return; }
      if (res.status === 429) { onError("network"); return; }
      if (!res.ok) { onError("network"); return; }

      const data = await res.json();
      const text = (data.text || '').trim();

      if (!text) { onError("no-speech"); return; }

      if (interimEl) interimEl.textContent = text;
      onResult({ transcript: text, durationSec });

    } catch {
      onError("network");
    }
  }

  function stop() {
    if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
    clearTick();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop(); // triggers onstop → transcribeWithGroq
    }
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

  return { isSupported, start, stop };
})();
