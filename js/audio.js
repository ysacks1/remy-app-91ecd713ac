/* Original synth engine. No samples, no copyrighted audio, no network. */
const AudioEngine = (() => {
  const state = {
    ctx: null,
    master: null,
    musicGain: null,
    sfxGain: null,
    humGain: null,
    comp: null,
    unlocked: false,
    volume: 0.8,
    tempo: 1,
    chipmunk: false,
    isPlaying: false,
    currentTrackId: null,
    timerId: null,
    nextNoteTime: 0,
    beat: 0,
    noise: null,
    voicesReady: false
  };

  const TRACKS = [
    {
      id: "fast-lane",
      name: "Fast Lane",
      emoji: "🚗",
      theme: "car",
      bpm: 132,
      loop: 8,
      events: null
    },
    {
      id: "spark",
      name: "Spark",
      emoji: "✨",
      theme: "music-want",
      bpm: 126,
      loop: 8,
      events: null
    },
    {
      id: "bounce",
      name: "Bounce",
      emoji: "🎯",
      theme: "games",
      bpm: 140,
      loop: 8,
      events: null
    },
    {
      id: "cruise",
      name: "Cruise",
      emoji: "🌙",
      theme: "hum",
      bpm: 108,
      loop: 8,
      events: null
    },
    {
      id: "beat-box",
      name: "Beat Box",
      emoji: "🥁",
      theme: "break",
      bpm: 148,
      loop: 8,
      events: null
    },
    {
      id: "glow",
      name: "Glow",
      emoji: "☀️",
      theme: "want",
      bpm: 120,
      loop: 8,
      events: null
    }
  ];

  function ev(list) {
    /* helper: compact pattern builder used below after init */
    return list;
  }

  function buildTracks() {
    // Fast Lane — driving 4-on-the-floor, short major riff
    const fast = [];
    for (let b = 0; b < 8; b++) {
      fast.push({ t: b, typ: "kick", vel: 1 });
      fast.push({ t: b + 0.5, typ: "hat", vel: 0.55 });
      fast.push({ t: b + 0.25, typ: "hat", vel: 0.22 });
      fast.push({ t: b + 0.75, typ: "hat", vel: 0.28 });
      if (b % 2 === 1) fast.push({ t: b, typ: "snare", vel: 0.85 });
    }
    const bassA = [55, 55, 82.41, 55, 73.42, 73.42, 82.41, 61.74];
    bassA.forEach((f, i) => fast.push({ t: i, typ: "bass", freq: f, dur: 0.42, vel: 0.85 }));
    [
      [0, 440], [0.5, 523.25], [1, 659.25], [1.5, 523.25],
      [2, 587.33], [3, 440], [4, 392], [4.5, 440],
      [5, 523.25], [6, 587.33], [7, 659.25], [7.5, 523.25]
    ].forEach(([t, f]) => fast.push({ t, typ: "lead", freq: f, dur: 0.26, vel: 0.5 }));
    TRACKS[0].events = fast;

    // Spark — bright arpeggio, lighter drums
    const spark = [];
    for (let b = 0; b < 8; b++) {
      if (b % 2 === 0) spark.push({ t: b, typ: "kick", vel: 0.8 });
      else spark.push({ t: b, typ: "clap", vel: 0.7 });
      spark.push({ t: b + 0.5, typ: "hat", vel: 0.4 });
    }
    const arp = [659.25, 783.99, 987.77, 783.99, 880, 783.99, 659.25, 523.25,
                 659.25, 783.99, 880, 987.77, 880, 783.99, 659.25, 783.99];
    arp.forEach((f, i) => spark.push({ t: i * 0.5, typ: "lead", freq: f, dur: 0.22, vel: 0.48, wave: "triangle" }));
    [130.81, 164.81, 196, 164.81, 174.61, 196, 130.81, 146.83].forEach((f, i) =>
      spark.push({ t: i, typ: "bass", freq: f, dur: 0.5, vel: 0.7 })
    );
    TRACKS[1].events = spark;

    // Bounce — syncopated, playful (shines in Chipmunk mode)
    const bounce = [];
    for (let b = 0; b < 8; b++) {
      bounce.push({ t: b, typ: "kick", vel: b % 4 === 2 ? 0.7 : 1 });
      if (b % 2 === 1) bounce.push({ t: b, typ: "snare", vel: 0.8 });
      bounce.push({ t: b + 0.25, typ: "hat", vel: 0.3 });
      bounce.push({ t: b + 0.5, typ: "hat", vel: 0.5 });
      bounce.push({ t: b + 0.75, typ: "hat", vel: 0.3 });
      if (b === 3 || b === 7) bounce.push({ t: b + 0.75, typ: "kick", vel: 0.7 });
    }
    const bNotes = [
      [0, 329.63], [0.75, 392], [1.5, 493.88], [2.25, 392],
      [3, 523.25], [3.5, 493.88], [4, 329.63], [4.75, 392],
      [5.5, 440], [6, 493.88], [7, 587.33], [7.5, 523.25]
    ];
    bNotes.forEach(([t, f]) => bounce.push({ t, typ: "lead", freq: f, dur: 0.3, vel: 0.55, wave: "square" }));
    [82.41, 82.41, 98, 110, 82.41, 73.42, 98, 82.41].forEach((f, i) =>
      bounce.push({ t: i, typ: "bass", freq: f, dur: 0.4, vel: 0.8 })
    );
    TRACKS[2].events = bounce;

    // Cruise — mid-tempo, warmer
    const cruise = [];
    for (let b = 0; b < 8; b++) {
      if (b === 0 || b === 3 || b === 4 || b === 6) cruise.push({ t: b, typ: "kick", vel: 0.9 });
      if (b === 2 || b === 6) cruise.push({ t: b, typ: "snare", vel: 0.7 });
      cruise.push({ t: b + 0.5, typ: "hat", vel: 0.35 });
    }
    [
      [0, 261.63], [1, 329.63], [2, 392], [3.5, 349.23],
      [4, 329.63], [5, 261.63], [6, 293.66], [7, 329.63]
    ].forEach(([t, f]) => cruise.push({ t, typ: "lead", freq: f, dur: 0.7, vel: 0.42, wave: "sine" }));
    [65.41, 65.41, 98, 87.31, 73.42, 73.42, 98, 65.41].forEach((f, i) =>
      cruise.push({ t: i, typ: "bass", freq: f, dur: 0.7, vel: 0.75 })
    );
    TRACKS[3].events = cruise;

    // Beat Box — percussion first, little stabs
    const box = [];
    for (let b = 0; b < 8; b++) {
      box.push({ t: b, typ: "kick", vel: 1 });
      box.push({ t: b + 0.5, typ: "snare", vel: 0.75 });
      box.push({ t: b + 0.25, typ: "hat", vel: 0.4 });
      box.push({ t: b + 0.75, typ: "hat", vel: 0.55 });
      if (b % 2 === 0) box.push({ t: b + 0.75, typ: "clap", vel: 0.4 });
    }
    box.push({ t: 1.5, typ: "tom", freq: 180, vel: 0.7 });
    box.push({ t: 3.5, typ: "tom", freq: 140, vel: 0.7 });
    box.push({ t: 5.25, typ: "tom", freq: 200, vel: 0.55 });
    box.push({ t: 5.5, typ: "tom", freq: 150, vel: 0.6 });
    [220, 0, 247, 0, 262, 196, 220, 0].forEach((f, i) => {
      if (f) box.push({ t: i, typ: "lead", freq: f, dur: 0.18, vel: 0.35, wave: "square" });
    });
    TRACKS[4].events = box;

    // Glow — sunny major melody
    const glow = [];
    for (let b = 0; b < 8; b++) {
      glow.push({ t: b, typ: "kick", vel: 0.75 });
      if (b % 2 === 1) glow.push({ t: b, typ: "clap", vel: 0.6 });
      glow.push({ t: b + 0.5, typ: "hat", vel: 0.32 });
    }
    const melody = [
      [0, 523.25], [0.5, 587.33], [1, 659.25], [2, 783.99],
      [3, 659.25], [4, 587.33], [4.5, 523.25], [5, 587.33],
      [6, 659.25], [6.5, 783.99], [7, 880], [7.5, 783.99]
    ];
    melody.forEach(([t, f]) => glow.push({ t, typ: "lead", freq: f, dur: 0.36, vel: 0.52, wave: "triangle" }));
    [130.81, 130.81, 164.81, 174.61, 196, 174.61, 164.81, 130.81].forEach((f, i) =>
      glow.push({ t: i, typ: "bass", freq: f, dur: 0.55, vel: 0.7 })
    );
    TRACKS[5].events = glow;
  }
  buildTracks();

  function ensureNoise() {
    if (state.noise) return state.noise;
    const sr = state.ctx.sampleRate;
    const buf = state.ctx.createBuffer(1, Math.floor(sr * 1.2), sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    state.noise = buf;
    return buf;
  }

  async function unlock() {
    if (!state.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      state.ctx = new Ctx();
      state.master = state.ctx.createGain();
      state.musicGain = state.ctx.createGain();
      state.sfxGain = state.ctx.createGain();
      state.humGain = state.ctx.createGain();
      state.comp = state.ctx.createDynamicsCompressor();
      state.comp.threshold.value = -18;
      state.comp.knee.value = 10;
      state.comp.ratio.value = 4;
      state.comp.attack.value = 0.003;
      state.comp.release.value = 0.12;
      state.musicGain.gain.value = 0.85;
      state.sfxGain.gain.value = 0.9;
      state.humGain.gain.value = 0.65;
      state.master.gain.value = state.volume;
      state.musicGain.connect(state.master);
      state.sfxGain.connect(state.master);
      state.humGain.connect(state.master);
      state.master.connect(state.comp);
      state.comp.connect(state.ctx.destination);
      ensureNoise();
    }
    if (state.ctx.state === "suspended") {
      try { await state.ctx.resume(); } catch (_) { /* iOS may need a later gesture */ }
    }
    state.unlocked = state.ctx.state === "running";
    // Prime speech synthesis on iOS
    if (window.speechSynthesis && !state.voicesReady) {
      speechSynthesis.getVoices();
      state.voicesReady = true;
    }
    return state.unlocked;
  }

  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, v));
    if (state.master) {
      state.master.gain.setTargetAtTime(state.volume, state.ctx.currentTime, 0.03);
    }
  }

  function setTempo(t) {
    state.tempo = t;
  }

  function setChipmunk(on) {
    state.chipmunk = !!on;
  }

  function envGain(start, peak, attack, decay, time, dest) {
    const g = state.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), time + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
    g.connect(dest);
    return g;
  }

  function playOsc({ time, freq, dur, type, gain, dest, slideTo }) {
    const osc = state.ctx.createOscillator();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, time);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, time + dur);
    const g = envGain(0, gain, 0.008, dur, time, dest);
    osc.connect(g);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function playNoise({ time, dur, gain, dest, hipass, lopass }) {
    const src = state.ctx.createBufferSource();
    src.buffer = ensureNoise();
    src.loop = true;
    let node = src;
    if (hipass) {
      const f = state.ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = hipass;
      node.connect(f);
      node = f;
    }
    if (lopass) {
      const f = state.ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = lopass;
      node.connect(f);
      node = f;
    }
    const g = envGain(0, gain, 0.002, dur, time, dest);
    node.connect(g);
    src.start(time);
    src.stop(time + dur + 0.03);
  }

  function pitchMul() {
    return state.chipmunk ? 1.6 : 1;
  }

  function playEvent(e, time) {
    const dest = state.musicGain;
    const pm = pitchMul();
    const vel = e.vel == null ? 1 : e.vel;
    switch (e.typ) {
      case "kick":
        playOsc({ time, freq: 140 * pm, slideTo: 42 * pm, dur: 0.16, type: "sine", gain: 0.95 * vel, dest });
        playOsc({ time, freq: 80 * pm, slideTo: 30 * pm, dur: 0.1, type: "sine", gain: 0.4 * vel, dest });
        break;
      case "snare":
        playNoise({ time, dur: 0.12, gain: 0.45 * vel, dest, hipass: 1200, lopass: 7000 });
        playOsc({ time, freq: 180 * pm, dur: 0.08, type: "triangle", gain: 0.28 * vel, dest });
        break;
      case "hat":
        playNoise({ time, dur: 0.04 + (vel < 0.35 ? 0 : 0.02), gain: 0.22 * vel, dest, hipass: 7000 });
        break;
      case "clap":
        playNoise({ time, dur: 0.04, gain: 0.4 * vel, dest, hipass: 800, lopass: 5000 });
        playNoise({ time: time + 0.02, dur: 0.08, gain: 0.3 * vel, dest, hipass: 900, lopass: 4500 });
        break;
      case "tom":
        playOsc({ time, freq: (e.freq || 160) * pm, slideTo: (e.freq || 160) * pm * 0.6, dur: 0.18, type: "sine", gain: 0.7 * vel, dest });
        break;
      case "bass":
        playOsc({ time, freq: e.freq * pm, dur: e.dur || 0.4, type: "sine", gain: 0.55 * vel, dest });
        playOsc({ time, freq: e.freq * pm * 2, dur: (e.dur || 0.4) * 0.5, type: "triangle", gain: 0.12 * vel, dest });
        break;
      case "lead": {
        const typ = e.wave || "triangle";
        // Soften square waves so they are not harsh
        if (typ === "square") {
          const osc = state.ctx.createOscillator();
          osc.type = "square";
          osc.frequency.setValueAtTime(e.freq * pm, time);
          const filter = state.ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1800 * pm, time);
          const g = envGain(0, 0.22 * vel, 0.01, e.dur || 0.25, time, dest);
          osc.connect(filter);
          filter.connect(g);
          osc.start(time);
          osc.stop(time + (e.dur || 0.25) + 0.05);
        } else {
          playOsc({ time, freq: e.freq * pm, dur: e.dur || 0.25, type: typ, gain: 0.32 * vel, dest });
        }
        break;
      }
      default:
        break;
    }
  }

  function currentTrack() {
    return TRACKS.find((t) => t.id === state.currentTrackId) || TRACKS[0];
  }

  function scheduler() {
    if (!state.isPlaying || !state.ctx) return;
    const track = currentTrack();
    const bpm = track.bpm * state.tempo * (state.chipmunk ? 1.32 : 1);
    const step = 0.25;
    const stepSec = step * (60 / bpm);
    while (state.nextNoteTime < state.ctx.currentTime + 0.16) {
      const pos = ((state.beat % track.loop) + track.loop) % track.loop;
      for (const e of track.events) {
        if (Math.abs(e.t - pos) < 0.0001) playEvent(e, state.nextNoteTime);
      }
      state.nextNoteTime += stepSec;
      state.beat += step;
    }
    state.timerId = setTimeout(scheduler, 25);
  }

  function playTrack(id) {
    if (!state.ctx) return;
    const track = TRACKS.find((t) => t.id === id);
    if (!track) return;
    state.currentTrackId = id;
    state.isPlaying = true;
    state.beat = 0;
    state.nextNoteTime = state.ctx.currentTime + 0.06;
    if (state.timerId) clearTimeout(state.timerId);
    scheduler();
  }

  function stopMusic() {
    state.isPlaying = false;
    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
  }

  function togglePlay(id) {
    if (state.isPlaying && (!id || id === state.currentTrackId)) {
      stopMusic();
      return false;
    }
    playTrack(id || state.currentTrackId || TRACKS[0].id);
    return true;
  }

  /* ---- one-shot SFX ---- */
  function sfxDest() {
    return state.sfxGain;
  }

  function tap() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    playOsc({ time: t, freq: 660, dur: 0.09, type: "sine", gain: 0.22, dest: sfxDest() });
    playOsc({ time: t, freq: 990, dur: 0.06, type: "sine", gain: 0.1, dest: sfxDest() });
  }

  function success() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      playOsc({ time: t + i * 0.07, freq: f, dur: 0.18, type: "triangle", gain: 0.28, dest: sfxDest() });
    });
  }

  function tryAgain() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    playOsc({ time: t, freq: 349.23, dur: 0.16, type: "sine", gain: 0.16, dest: sfxDest() });
    playOsc({ time: t + 0.14, freq: 293.66, dur: 0.2, type: "sine", gain: 0.14, dest: sfxDest() });
  }

  function horn() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    playOsc({ time: t, freq: 400, dur: 0.42, type: "sawtooth", gain: 0.12, dest: sfxDest() });
    playOsc({ time: t, freq: 504, dur: 0.42, type: "sawtooth", gain: 0.12, dest: sfxDest() });
    playOsc({ time: t, freq: 400, dur: 0.42, type: "square", gain: 0.05, dest: sfxDest() });
  }

  function yum() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    [392, 494, 587, 740].forEach((f, i) => {
      playOsc({ time: t + i * 0.09, freq: f, dur: 0.2, type: "sine", gain: 0.24, dest: sfxDest() });
    });
  }

  function wood() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    playOsc({ time: t, freq: 880, dur: 0.04, type: "sine", gain: 0.3, dest: sfxDest() });
    playOsc({ time: t, freq: 440, dur: 0.06, type: "triangle", gain: 0.16, dest: sfxDest() });
    playNoise({ time: t, dur: 0.03, gain: 0.12, dest: sfxDest(), hipass: 2000 });
  }

  function whoosh() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    playNoise({ time: t, dur: 0.22, gain: 0.18, dest: sfxDest(), hipass: 400, lopass: 2000 });
  }

  function chime() {
    if (!state.ctx) return;
    const t = state.ctx.currentTime;
    [392, 523.25, 659.25].forEach((f, i) => {
      playOsc({ time: t + i * 0.16, freq: f, dur: 0.55, type: "sine", gain: 0.18, dest: sfxDest() });
    });
  }

  /* Metronome for Tap the Beat — kick on the beat, soft hat on the and */
  let metroTimer = null;
  let metroNext = 0;
  let metroOn = false;
  let metroBpm = 132;
  let metroCb = null;

  function startMetronome(bpm, onBeat) {
    if (!state.ctx) return;
    stopMetronome();
    metroBpm = bpm;
    metroOn = true;
    metroCb = onBeat;
    metroNext = state.ctx.currentTime + 0.05;
    function tick() {
      if (!metroOn) return;
      const step = 60 / metroBpm;
      while (metroNext < state.ctx.currentTime + 0.12) {
        playEvent({ typ: "kick", vel: 0.9 }, metroNext);
        playEvent({ typ: "hat", vel: 0.35 }, metroNext + step / 2);
        if (metroCb) metroCb(metroNext, step);
        metroNext += step;
      }
      metroTimer = setTimeout(tick, 25);
    }
    tick();
  }

  function stopMetronome() {
    metroOn = false;
    if (metroTimer) {
      clearTimeout(metroTimer);
      metroTimer = null;
    }
  }

  function pickVoice() {
    const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    if (!voices.length) return null;
    const prefer = (v) => /en(-|_)US/i.test(v.lang) || /^en/i.test(v.lang);
    const natural = voices.find((v) => prefer(v) && /samantha|siri|karen|moira|daniel|google|aria|jenny|natural|enhanced/i.test(v.name));
    return natural || voices.find(prefer) || voices[0];
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 1;
      u.volume = Math.max(0.2, state.volume);
      const voice = pickVoice();
      if (voice) u.voice = voice;
      speechSynthesis.speak(u);
    } catch (_) { /* some WebViews block this */ }
  }

  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.addEventListener("voiceschanged", () => {
      state.voicesReady = true;
    });
  }

  return {
    TRACKS,
    unlock,
    setVolume,
    setTempo,
    setChipmunk,
    playTrack,
    stopMusic,
    togglePlay,
    tap,
    success,
    tryAgain,
    horn,
    yum,
    wood,
    whoosh,
    chime,
    speak,
    startMetronome,
    stopMetronome,
    get isPlaying() { return state.isPlaying; },
    get currentTrackId() { return state.currentTrackId; },
    get ctx() { return state.ctx; },
    get humGain() { return state.humGain; },
    get unlocked() { return state.unlocked; },
    get state() { return state; }
  };
})();
window.AudioEngine = AudioEngine;
