/* Hum room: microphone pitch (autocorrelation) drives color and a matching note.
   Nothing is recorded or uploaded. */
const HumRoom = (() => {
  let stream = null;
  let source = null;
  let analyser = null;
  let running = false;
  let raf = 0;
  let echoOn = false;
  let lastFreq = 0;
  let lastNoteAt = 0;
  let lastRms = 0;
  let hue = 170;
  let canvas, ctx2d, stage;
  let statusEl;
  let particles = [];
  let denied = false;

  function explainError(err) {
    if (!err) return "denied";
    const name = err.name || "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
    if (name === "NotFoundError") return "missing";
    if (location.protocol === "file:") return "file";
    return "denied";
  }

  /* Standard autocorrelation pitch detector. */
  function detectPitch(buf, sampleRate) {
    const size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / size);
    lastRms = rms;
    if (rms < 0.02) return null;

    // Remove DC
    let mean = 0;
    for (let i = 0; i < size; i++) mean += buf[i];
    mean /= size;

    const minF = 80;
    const maxF = 900;
    const minLag = Math.floor(sampleRate / maxF);
    const maxLag = Math.min(Math.floor(sampleRate / minF), size - 1);

    let bestCorr = 0;
    let bestLag = -1;
    let prev = 0;
    let falling = false;

    for (let lag = minLag; lag <= maxLag; lag++) {
      let corr = 0;
      for (let i = 0; i < size - lag; i++) {
        const a = buf[i] - mean;
        const b = buf[i + lag] - mean;
        corr += a * b;
      }
      corr = corr / (size - lag);
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
        falling = false;
      } else if (bestLag > 0 && corr < prev) {
        falling = true;
      }
      prev = corr;
      if (falling && corr < bestCorr * 0.7) break;
    }

    // Normalize-ish threshold so noise doesn't lock
    const thresh = rms * rms * 0.15;
    if (bestLag < 0 || bestCorr < thresh) return null;

    // Parabolic interpolation around the peak for a slightly stabler pitch
    return sampleRate / bestLag;
  }

  function freqToHue(freq) {
    const min = 110;
    const max = 660;
    const t = Math.max(0, Math.min(1, (Math.log(freq) - Math.log(min)) / (Math.log(max) - Math.log(min))));
    return 170 + t * 160; // teal through rose/violet
  }

  function playFollowNote(freq) {
    const audioCtx = AudioEngine.ctx;
    const dest = AudioEngine.humGain;
    if (!audioCtx || !dest || !freq) return;
    const now = audioCtx.currentTime;
    // Retrigger when pitch jumps or after a short decay
    const jumped = lastFreq && Math.abs(Math.log2(freq / lastFreq)) > 0.08;
    if (now - lastNoteAt < 0.09 && !jumped) return;
    lastNoteAt = now;
    lastFreq = freq;

    const play = (f, gain, start, dur) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, start);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(g);
      g.connect(dest);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    play(freq, 0.22, now, 0.28);
    if (echoOn) {
      play(freq * 1.6, 0.16, now + 0.12, 0.22);
      play(freq * 2.0, 0.08, now + 0.18, 0.16);
    }
  }

  function spawn(freq, rms) {
    const n = Math.min(6, 1 + Math.floor(rms * 18));
    for (let i = 0; i < n; i++) {
      particles.push({
        x: 0.5 + (Math.random() - 0.5) * 0.2,
        y: 0.55 + (Math.random() - 0.5) * 0.15,
        vx: (Math.random() - 0.5) * 0.006,
        vy: -0.004 - Math.random() * 0.008,
        r: 0.03 + rms * 0.12 + Math.random() * 0.03,
        life: 1,
        hue: freq ? freqToHue(freq) + (Math.random() - 0.5) * 24 : hue
      });
    }
    if (particles.length > 120) particles.splice(0, particles.length - 120);
  }

  function resize() {
    if (!canvas || !stage) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }

  function draw() {
    if (!ctx2d || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const reduce = document.body.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    ctx2d.fillStyle = "rgba(10, 14, 18, 0.22)";
    ctx2d.fillRect(0, 0, w, h);

    // Soft background wash
    const cx = w / 2;
    const cy = h * 0.52;
    const radius = Math.max(w, h) * (0.28 + lastRms * 1.2);
    const g = ctx2d.createRadialGradient(cx, cy, 10, cx, cy, radius);
    g.addColorStop(0, `hsla(${hue}, 80%, 60%, ${0.12 + lastRms * 0.55})`);
    g.addColorStop(1, "rgba(10,14,18,0)");
    ctx2d.fillStyle = g;
    ctx2d.fillRect(0, 0, w, h);

    // Central orb
    const orb = 40 + lastRms * 180;
    const og = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, orb);
    og.addColorStop(0, `hsla(${hue}, 90%, 78%, ${0.35 + lastRms * 0.5})`);
    og.addColorStop(0.55, `hsla(${hue}, 80%, 50%, ${0.18 + lastRms * 0.25})`);
    og.addColorStop(1, "rgba(10,14,18,0)");
    ctx2d.fillStyle = og;
    ctx2d.beginPath();
    ctx2d.arc(cx, cy, orb, 0, Math.PI * 2);
    ctx2d.fill();

    if (!reduce) {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012;
        const pr = p.r * w * p.life;
        ctx2d.beginPath();
        ctx2d.fillStyle = `hsla(${p.hue}, 85%, 65%, ${Math.max(0, p.life) * 0.45})`;
        ctx2d.arc(p.x * w, p.y * h, Math.max(1, pr), 0, Math.PI * 2);
        ctx2d.fill();
      }
      particles = particles.filter((p) => p.life > 0);
    }

    // Waveform ribbon
    if (analyser) {
      const buf = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(buf);
      ctx2d.beginPath();
      ctx2d.strokeStyle = `hsla(${hue}, 80%, 75%, 0.7)`;
      ctx2d.lineWidth = Math.max(2, w / 400);
      const mid = h * 0.8;
      const amp = h * 0.12;
      for (let i = 0; i < buf.length; i++) {
        const x = (i / (buf.length - 1)) * w;
        const y = mid + ((buf[i] - 128) / 128) * amp;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
    }
  }

  function loop() {
    if (!running) return;
    const audioCtx = AudioEngine.ctx;
    if (analyser && audioCtx) {
      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      const freq = detectPitch(buf, audioCtx.sampleRate);
      if (freq) {
        hue += (freqToHue(freq) - hue) * 0.18;
        spawn(freq, lastRms);
        playFollowNote(freq);
        if (statusEl) statusEl.textContent = Math.round(freq) + " Hz";
      } else {
        lastRms *= 0.9;
        if (statusEl && lastRms < 0.015) statusEl.textContent = "Listening…";
      }
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  async function start({ canvasEl, stageEl, status }) {
    canvas = canvasEl;
    stage = stageEl;
    statusEl = status;
    ctx2d = canvas.getContext("2d");
    await AudioEngine.unlock();
    resize();
    window.addEventListener("resize", resize);

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
    } catch (err) {
      denied = true;
      return { ok: false, reason: explainError(err) };
    }

    const audioCtx = AudioEngine.ctx;
    if (audioCtx.state === "suspended") await audioCtx.resume();
    source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;
    source.connect(analyser);
    // Do not connect mic to destination — that would cause feedback.
    running = true;
    denied = false;
    lastFreq = 0;
    particles = [];
    loop();
    return { ok: true };
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (source) {
      try { source.disconnect(); } catch (_) {}
      source = null;
    }
    analyser = null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    lastRms = 0;
    particles = [];
  }

  function setEcho(on) {
    echoOn = !!on;
  }

  return {
    start,
    stop,
    setEcho,
    resize,
    get running() { return running; },
    get denied() { return denied; }
  };
})();
