/* Remy's Music Room — UI, navigation, games, health, family, settings. */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const HOME_TILES = [
    { id: "music", label: "Music", theme: "music", screen: "music" },
    { id: "watch", label: "Watch", theme: "watch", screen: "watch" },
    { id: "want", label: "I Want", theme: "want", screen: "want" },
    { id: "school", label: "School", theme: "school", screen: "school" },
    { id: "hum", label: "Hum", theme: "hum", screen: "hum" },
    { id: "games", label: "Games", theme: "games", screen: "games" },
    { id: "family", label: "Family", theme: "family", screen: "family" },
    { id: "health", label: "Health", theme: "health", screen: "health" }
  ];

  const APP_SHORTCUTS = [
    { id: "netflix", label: "Netflix", url: "https://www.netflix.com/", emoji: "N", theme: "shortcut" },
    { id: "youtubekids", label: "YouTube Kids", url: "https://www.youtubekids.com/", emoji: "▶", theme: "shortcut" },
    { id: "disney", label: "Disney+", url: "https://www.disneyplus.com/", emoji: "D+", theme: "shortcut" }
  ];

  const WALL_REACTS = ["💛", "😊", "👏", "⭐", "🎵"];
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const MOODS = [
    { id: "good", label: "Good", emoji: "🙂", theme: "games" },
    { id: "okay", label: "Okay", emoji: "😐", theme: "break" },
    { id: "tired", label: "Tired", emoji: "😴", theme: "sleep" },
    { id: "upset", label: "Upset", emoji: "😣", theme: "body" },
    { id: "hurts", label: "Hurts", emoji: "🤕", theme: "hug" },
    { id: "excited", label: "Excited", emoji: "🤩", theme: "want" }
  ];

  const SLEEP = [
    { id: "well", label: "Slept well", emoji: "😴", theme: "hum" },
    { id: "okay", label: "Okay sleep", emoji: "🌙", theme: "sleep" },
    { id: "tough", label: "Tough night", emoji: "🌑", theme: "body" }
  ];

  const MEALS = [
    { id: "breakfast", label: "Breakfast", emoji: "🍳", theme: "pizza" },
    { id: "lunch", label: "Lunch", emoji: "🍽️", theme: "meals" },
    { id: "dinner", label: "Dinner", emoji: "🍝", theme: "hug" },
    { id: "snack", label: "Snack", emoji: "🍎", theme: "want" },
    { id: "water", label: "Water", emoji: "💧", theme: "water" }
  ];

  const BODY = [
    { id: "head", label: "Head", emoji: "🧠", theme: "sleep" },
    { id: "throat", label: "Throat", emoji: "🗣️", theme: "drink", speak: "Throat" },
    { id: "ear", label: "Ear", emoji: "👂", theme: "hum" },
    { id: "teeth", label: "Teeth", emoji: "🦷", theme: "break" },
    { id: "chest", label: "Chest", emoji: "🫁", theme: "car" },
    { id: "stomach", label: "Stomach", emoji: "🌀", theme: "pizza" },
    { id: "arm", label: "Arm", emoji: "💪", theme: "games" },
    { id: "hand", label: "Hand", emoji: "✋", theme: "want" },
    { id: "back", label: "Back", emoji: "⬆️", theme: "music-want" },
    { id: "leg", label: "Leg", emoji: "🦵", theme: "family" },
    { id: "other", label: "Somewhere else", emoji: "❓", theme: "done", speak: "Somewhere else" }
  ];

  const EMOJI_PICK = "🙂😐😴😣🤩💛🎵🚗🍕🥤👕🌅🌙⭐⚡🧢🌷🍎💧🥁✨🎯🍳🍽️🍝🍎✅⏸️🚻🧠🦷💪✋".split("");

  const ICONS = {
    music: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="28" cy="42" r="8" fill="currentColor"/><circle cx="48" cy="38" r="6" fill="currentColor"/><path d="M36 42V14l20-4v28" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    want: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="8" y="12" width="48" height="36" rx="10" stroke="currentColor" stroke-width="4"/><path d="M16 48v4a8 8 0 0 0 8 0" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M20 26h10M20 34h18" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
    hum: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="24" y="10" width="16" height="28" rx="8" fill="currentColor"/><path d="M18 30a14 14 0 0 0 28 0M32 44v8M22 54h20" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
    games: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="8" y="22" width="48" height="26" rx="13" fill="currentColor" opacity="0.9"/><circle cx="22" cy="35" r="3.5" fill="#0e1318"/><circle cx="42" cy="31" r="2.5" fill="#0e1318"/><circle cx="48" cy="36" r="2.5" fill="#0e1318"/><path d="M20 31v8M16 35h8" stroke="#0e1318" stroke-width="3" stroke-linecap="round"/></svg>`,
    family: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="8" fill="currentColor"/><circle cx="44" cy="20" r="8" fill="currentColor"/><circle cx="32" cy="28" r="7" fill="currentColor"/><path d="M8 54c1-12 7-18 12-18s10 4 12 10c2-6 7-10 12-10s11 6 12 18" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
    health: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 54s-20-12-20-26a12 12 0 0 1 20-9 12 12 0 0 1 20 9c0 14-20 26-20 26z" fill="currentColor"/></svg>`,
    watch: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="8" y="14" width="48" height="36" rx="10" fill="currentColor"/><path d="M28 24v16l14-8z" fill="#0e1318"/></svg>`,
    school: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M8 24 32 12l24 12-24 12L8 24z" fill="currentColor"/><path d="M16 32v12c6 6 26 6 32 0V32" stroke="currentColor" stroke-width="4" fill="none"/><path d="M52 26v18" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`
  };

  let settings = Store.loadSettings();
  if (window.RemyCustomize) RemyCustomize.apply();
  let stack = ["home"];
  let imageUrls = new Map();
  let recRecorder = null;
  let recChunks = [];
  let recTarget = null;
  let recStream = null;
  let overlayTimer = 0;
  let beatCount = 0;
  let beatBursts = [];
  let beatRaf = 0;
  let matchAnswer = null;
  let matchChoices = [];
  let contribDraft = { from: "dad", kind: "reward" };
  let openTaskId = null;
  let activeReminder = null;
  let reminderTimer = 0;

  function applyMotionPref() {
    document.body.classList.toggle("reduce-motion", !!settings.reduceMotion);
  }

  function clampTempo(v) {
    const min = settings.tempoMin || 0.8;
    const max = settings.tempoMax || 1.6;
    return Math.max(min, Math.min(max, v));
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function formatDay(dayKey) {
    const [y, m, dd] = dayKey.split("-").map(Number);
    const d = new Date(y, m - 1, dd);
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }

  function weekdayShort(dayKey) {
    const [y, m, dd] = dayKey.split("-").map(Number);
    const d = new Date(y, m - 1, dd);
    return d.toLocaleDateString([], { weekday: "short" });
  }

  async function artFor(imageId, fallback) {
    if (!imageId) return fallback;
    if (imageUrls.has(imageId)) {
      return `<img src="${imageUrls.get(imageId)}" alt="">`;
    }
    const rec = await Store.getImage(imageId);
    if (!rec || !rec.blob) return fallback;
    const url = URL.createObjectURL(rec.blob);
    imageUrls.set(imageId, url);
    return `<img src="${url}" alt="">`;
  }

  function tileHTML({ id, label, theme, emoji, icon, imageId, tag, counter, extraClass, attr }) {
    const cls = ["tile", theme || "", extraClass || "", imageId ? "has-photo" : ""].filter(Boolean).join(" ");
    const artInner = imageId
      ? `<img data-img="${imageId}" alt="">`
      : (icon ? icon : `<span class="emoji">${emoji || ""}</span>`);
    return `<button type="button" class="${cls}" data-id="${id}" ${attr || ""}>
      ${tag ? `<span class="from-tag">${tag}</span>` : ""}
      <span class="art">${artInner}</span>
      <span class="label">${escapeHtml(label)}</span>
      ${counter != null ? `<span class="counter-pill">${counter}</span>` : ""}
    </button>`;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function hydrateImages(root) {
    const imgs = $$("img[data-img]", root);
    for (const img of imgs) {
      const html = await artFor(img.getAttribute("data-img"), "");
      if (html) {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const next = tmp.firstElementChild;
        if (next) img.replaceWith(next);
      }
    }
  }

  function press(el) {
    if (!el) return;
    el.classList.add("pressed", "pulse");
    setTimeout(() => el.classList.remove("pressed", "pulse"), 400);
    AudioEngine.tap();
  }

  async function unlock() {
    await AudioEngine.unlock();
    AudioEngine.setVolume(settings.volume);
    AudioEngine.setTempo(settings.tempo);
    AudioEngine.setChipmunk(settings.chipmunk);
  }

  /* ---------- navigation ---------- */
  function currentScreen() {
    return stack[stack.length - 1];
  }

  function go(name, replace) {
    leave(currentScreen(), name);
    if (replace) stack[stack.length - 1] = name;
    else if (currentScreen() !== name) stack.push(name);
    show(name);
    enter(name);
  }

  function back() {
    if (stack.length < 2) {
      go("home", true);
      return;
    }
    const leaving = stack.pop();
    leave(leaving, currentScreen());
    show(currentScreen());
    enter(currentScreen());
  }

  function show(name) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.dataset.screen === name));
  }

  function leave(from, to) {
    if (from === "hum" && to !== "hum") HumRoom.stop();
    if (from === "beat" && to !== "beat") stopBeat();
    if (from === "match" && to !== "match") { /* keep quiet */ }
    if (recRecorder && from === "family") cancelRecord();
    if (from === "watch" && to !== "watch") closePlayer();
  }

  function enter(name) {
    const map = {
      home: renderHome,
      music: renderMusic,
      want: renderWant,
      hum: renderHum,
      games: renderGamesMenu,
      beat: startBeat,
      match: startMatch,
      family: renderFamily,
      settings: renderSettings,
      health: renderHealth,
      mood: renderMood,
      sleep: renderSleep,
      meals: renderMeals,
      meds: renderMeds,
      body: renderBody,
      day: renderDay,
      routine: renderRoutine,
      watch: renderWatch,
      school: renderSchool,
      "school-task": renderSchoolTask
    };
    if (map[name]) map[name]();
  }

  /* ---------- overlay ---------- */
  function showChoice({ emoji, label, imageId, speakText }) {
    const art = $("#choice-art");
    const word = $("#choice-word");
    word.textContent = label;
    if (imageId && imageUrls.has(imageId)) {
      art.innerHTML = `<img src="${imageUrls.get(imageId)}" alt="">`;
    } else if (imageId) {
      art.innerHTML = `<span class="emoji">${emoji || ""}</span>`;
      Store.getImage(imageId).then((rec) => {
        if (!rec) return;
        const url = URL.createObjectURL(rec.blob);
        imageUrls.set(imageId, url);
        art.innerHTML = `<img src="${url}" alt="">`;
      });
    } else {
      art.innerHTML = `<span class="emoji">${emoji || ""}</span>`;
    }
    const ov = $("#choice-overlay");
    ov.classList.add("show");
    if (speakText !== false) AudioEngine.speak(speakText || label);
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(hideChoice, 2400);
  }

  function hideChoice() {
    $("#choice-overlay").classList.remove("show");
    clearTimeout(overlayTimer);
  }

  /* ---------- screens ---------- */
  function renderHome() {
    const grid = $("#home-grid");
    const entries = (window.RemyCustomize && RemyCustomize.homeEntries())
      || HOME_TILES.map((t) => ({ kind: "section", tile: t }));
    grid.innerHTML = entries.map((e) => {
      if (e.kind === "custom") {
        return tileHTML({
          id: e.tile.id,
          label: e.tile.label,
          theme: e.tile.theme || "want",
          emoji: e.tile.emoji,
          imageId: e.tile.imageId,
          attr: 'data-custom-tile="' + e.tile.id + '"'
        });
      }
      if (e.kind === "connector") {
        return tileHTML({
          id: e.tile.id,
          label: e.tile.label,
          theme: "shortcut",
          emoji: e.tile.emoji,
          extraClass: "shortcut",
          attr: 'data-connector="' + e.tile.id + '"'
        });
      }
      return tileHTML({ ...e.tile, icon: ICONS[e.tile.id] });
    }).join("");
    hydrateImages(grid);
  }

  function renderMusic() {
    const favs = Store.loadContrib().filter((c) => c.kind === "song");
    const grid = $("#music-grid");
    grid.innerHTML = AudioEngine.TRACKS.map((t) => {
      const fav = favs.find((f) => f.trackId === t.id);
      const playing = AudioEngine.isPlaying && AudioEngine.currentTrackId === t.id;
      return tileHTML({
        id: t.id,
        label: t.name,
        theme: t.theme,
        emoji: t.emoji,
        tag: fav ? "From " + fav.fromLabel : "",
        extraClass: playing ? "playing" : ""
      });
    }).join("");
    syncMusicDock();
    const tempo = $("#tempo");
    tempo.min = Math.round((settings.tempoMin || 0.8) * 100);
    tempo.max = Math.round((settings.tempoMax || 1.6) * 100);
    tempo.value = Math.round((settings.tempo || 1) * 100);
    $("#tempo-val").textContent = tempo.value + "%";
    $("#chipmunk").setAttribute("aria-pressed", settings.chipmunk ? "true" : "false");
  }

  function syncMusicDock() {
    const track = AudioEngine.TRACKS.find((t) => t.id === AudioEngine.currentTrackId);
    $("#now-playing").textContent = track ? track.name : "Nothing yet";
    const on = AudioEngine.isPlaying;
    $("#icon-play").classList.toggle("hidden", on);
    $("#icon-stop").classList.toggle("hidden", !on);
    $("#music-play").classList.toggle("stop", on);
    $("#music-play").setAttribute("aria-label", on ? "Stop" : "Play");
    $$("#music-grid .tile").forEach((el) => {
      el.classList.toggle("playing", on && el.dataset.id === AudioEngine.currentTrackId);
    });
  }

  function selectTrack(id, autoPlay) {
    const track = AudioEngine.TRACKS.find((t) => t.id === id);
    if (!track) return;
    if (autoPlay === false && !AudioEngine.isPlaying) {
      AudioEngine.playTrack(id); // set current by playing? better just mark
    }
    const wasSame = AudioEngine.currentTrackId === id && AudioEngine.isPlaying;
    if (wasSame) {
      AudioEngine.stopMusic();
    } else {
      AudioEngine.playTrack(id);
      Store.logActivity({ type: "music", key: track.id, label: track.name, emoji: track.emoji });
    }
    syncMusicDock();
  }

  function renderWant() {
    const grid = $("#want-grid");
    grid.innerHTML = settings.wantTiles.map((t) =>
      tileHTML({ id: t.id, label: t.label, theme: t.theme, emoji: t.emoji, imageId: t.imageId })
    ).join("");
    hydrateImages(grid);
  }

  function pickWant(id) {
    const t = settings.wantTiles.find((x) => x.id === id);
    if (!t) return;
    Store.addChoice({ key: t.id, label: t.label, emoji: t.emoji });
    showChoice({ emoji: t.emoji, label: t.label, imageId: t.imageId });
  }

  function renderHum() {
    $("#hum-intro").classList.toggle("hidden", HumRoom.running);
    $("#hum-denied").classList.add("hidden");
    $("#hum-hud").classList.toggle("hidden", !HumRoom.running);
    if (HumRoom.running) HumRoom.resize();
  }

  async function startHum() {
    $("#hum-intro").classList.add("hidden");
    $("#hum-denied").classList.add("hidden");
    const res = await HumRoom.start({
      canvasEl: $("#hum-canvas"),
      stageEl: $("#hum-stage"),
      status: $("#pitch-chip")
    });
    if (!res.ok) {
      $("#hum-denied").classList.remove("hidden");
      $("#hum-hud").classList.add("hidden");
      const p = $("#hum-denied p");
      if (res.reason === "file") {
        p.textContent = "The microphone needs this app to be opened as a local page (not a raw file). Run the local server in the README, then try again.";
      } else if (res.reason === "missing") {
        p.textContent = "No microphone was found. Music, I Want, and Games still work.";
      }
      return;
    }
    $("#hum-hud").classList.remove("hidden");
    $("#hum-intro").classList.add("hidden");
  }

  function renderGamesMenu() {
    const tiles = [
      { id: "beat", label: "Tap the Beat", theme: "games", emoji: "🥁", screen: "beat" },
      { id: "match", label: "Sound Match", theme: "want", emoji: "🎧", screen: "match" },
      { id: "routine", label: "Daily routine", theme: "hum", emoji: "📋", screen: "routine" }
    ];
    $("#games-menu-grid").innerHTML = tiles.map((t) =>
      tileHTML({ ...t, attr: `data-nav="${t.screen}"` })
    ).join("");
  }

  /* Tap the Beat */
  function startBeat() {
    beatCount = 0;
    beatBursts = [];
    $("#beat-count").textContent = "0";
    $("#beat-cheer").textContent = "Tap with the pulse";
    $("#pulse-ring").classList.add("go");
    const bpm = Math.round(132 * (settings.tempo || 1) * (settings.chipmunk ? 1.2 : 1));
    AudioEngine.startMetronome(bpm, () => {});
    const canvas = $("#beat-canvas");
    const stage = $("#beat-stage");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = stage.clientWidth * dpr;
    canvas.height = stage.clientHeight * dpr;
    const ctx = canvas.getContext("2d");
    cancelAnimationFrame(beatRaf);
    const reduce = document.body.classList.contains("reduce-motion") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      beatBursts.forEach((b) => {
        b.life -= reduce ? 1 : 0.02;
        const a = Math.max(0, b.life);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${b.hue}, 80%, 65%, ${a * 0.7})`;
        ctx.arc(b.x * canvas.width, b.y * canvas.height, b.r * canvas.width * a, 0, Math.PI * 2);
        ctx.fill();
      });
      beatBursts = beatBursts.filter((b) => b.life > 0);
      if (AudioEngine.state && currentScreen() === "beat") beatRaf = requestAnimationFrame(loop);
    }
    loop();
  }

  function tapBeat(ev) {
    beatCount += 1;
    $("#beat-count").textContent = String(beatCount);
    const cheers = {
      4: "Nice",
      8: "You got it",
      16: "Keep going",
      24: "Great rhythm",
      32: "On fire",
      48: "Still going"
    };
    if (cheers[beatCount]) $("#beat-cheer").textContent = cheers[beatCount];
    AudioEngine.wood();
    const stage = $("#beat-stage");
    const rect = stage.getBoundingClientRect();
    const x = ev && ev.clientX ? (ev.clientX - rect.left) / rect.width : 0.5;
    const y = ev && ev.clientY ? (ev.clientY - rect.top) / rect.height : 0.5;
    for (let i = 0; i < 7; i++) {
      beatBursts.push({
        x: x + (Math.random() - 0.5) * 0.15,
        y: y + (Math.random() - 0.5) * 0.15,
        r: 0.03 + Math.random() * 0.06,
        hue: 80 + Math.random() * 80,
        life: 1
      });
    }
  }

  function stopBeat() {
    AudioEngine.stopMetronome();
    $("#pulse-ring").classList.remove("go");
    cancelAnimationFrame(beatRaf);
  }

  /* Sound Match */
  const MATCH_BANK = [
    { id: "car", label: "Car", emoji: "🚗", theme: "car", play: () => AudioEngine.horn() },
    { id: "pizza", label: "Pizza", emoji: "🍕", theme: "pizza", play: () => AudioEngine.yum() },
    { id: "beat", label: "Beat", emoji: "🥁", theme: "games", play: () => { AudioEngine.wood(); setTimeout(() => AudioEngine.wood(), 160); } },
    { id: "music", label: "Music", emoji: "🎵", theme: "music-want", play: () => AudioEngine.success() }
  ];

  function startMatch() {
    nextMatch(true);
  }

  function nextMatch(autoPlay) {
    const bank = MATCH_BANK.slice();
    const answer = bank.splice(Math.floor(Math.random() * bank.length), 1)[0];
    const others = bank.sort(() => Math.random() - 0.5).slice(0, 2);
    matchAnswer = answer;
    matchChoices = [answer, ...others].sort(() => Math.random() - 0.5);
    $("#match-cheer").textContent = "Which one was that?";
    const row = $("#match-row");
    row.innerHTML = matchChoices.map((t) =>
      tileHTML({ id: t.id, label: t.label, theme: t.theme, emoji: t.emoji })
    ).join("");
    if (autoPlay !== false) setTimeout(() => { matchAnswer && matchAnswer.play(); }, 350);
  }

  function pickMatch(id) {
    if (!matchAnswer) return;
    if (id === matchAnswer.id) {
      AudioEngine.success();
      $("#match-cheer").textContent = "Yes — " + matchAnswer.label;
      Store.logActivity({ type: "game", key: "match", label: "Matched " + matchAnswer.label, emoji: matchAnswer.emoji });
      setTimeout(() => nextMatch(true), 900);
    } else {
      AudioEngine.tryAgain();
      $("#match-cheer").textContent = "Try again — hear it once more";
      setTimeout(() => matchAnswer && matchAnswer.play(), 400);
    }
  }

  /* Family */
  async function renderFamily() {
    const grid = $("#family-grid");
    const people = settings.family.map((p) =>
      tileHTML({ id: p.id, label: p.label, theme: "family", emoji: p.emoji })
    ).join("");
    const add = tileHTML({ id: "add", label: "Add", theme: "done", emoji: "＋" });
    grid.innerHTML = people + add;

    const contribs = Store.loadContrib();
    let extra = $("#family-extra");
    if (!extra) {
      extra = document.createElement("div");
      extra.id = "family-extra";
      extra.className = "family-extra";
      grid.after(extra);
    }
    if (!contribs.length) {
      extra.innerHTML = "";
      extra.classList.add("hidden");
    } else {
      extra.classList.remove("hidden");
      extra.innerHTML = `<h3>From family</h3><div class="contrib-row" id="contrib-row">${
        contribs.map((c) => tileHTML({
          id: c.id,
          label: c.title || prettyKind(c.kind),
          theme: c.kind === "reward" ? "reward" : c.kind === "song" ? "music" : "family",
          emoji: c.emoji || kindEmoji(c.kind),
          imageId: c.kind === "photo" ? c.mediaId : "",
          tag: "From " + (c.fromLabel || ""),
          attr: `data-contrib="${c.id}"`
        })).join("")
      }</div>`;
      hydrateImages(extra);
    }
    renderWall();
  }

  function prettyKind(k) {
    return ({ song: "A song", photo: "A photo", voice: "A message", reward: "A reward" })[k] || k;
  }
  function kindEmoji(k) {
    return ({ song: "🎵", photo: "🖼️", voice: "🎙️", reward: "🎁" })[k] || "💛";
  }

  async function playFamilyVoice(id) {
    const rec = await Store.getVoice(id);
    if (!rec || !rec.blob) {
      toast("No message yet. A parent can record one in settings.");
      return;
    }
    const url = URL.createObjectURL(rec.blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    try { await audio.play(); } catch { toast("Tap again to hear the message."); }
  }

  async function playContrib(id) {
    const c = Store.loadContrib().find((x) => x.id === id);
    if (!c) return;
    const from = c.fromLabel ? " from " + c.fromLabel : "";
    if (c.kind === "song") {
      showChoice({ emoji: c.emoji || "🎵", label: c.title, speakText: (c.title || "A song") + from });
      if (c.trackId) selectTrack(c.trackId, true);
      go("music");
      return;
    }
    if (c.kind === "voice") {
      showChoice({ emoji: "🎙️", label: c.title || "Message", speakText: (c.title || "A message") + from });
      await playFamilyVoice(c.mediaId || c.id);
      return;
    }
    if (c.kind === "photo") {
      showChoice({ emoji: c.emoji || "🖼️", label: c.title || "Photo", imageId: c.mediaId, speakText: (c.title || "A photo") + from });
      return;
    }
    if (c.kind === "reward") {
      showChoice({ emoji: c.emoji || "🎁", label: c.title, speakText: (c.title || "A reward") + from });
    }
  }

  /* Health */
  function todayCount(type, key) {
    return Store.eventsForDay().filter((e) => e.type === type && (!key || e.key === key)).length;
  }

  function renderHealth() {
    const waterN = todayCount("water");
    const tiles = [
      { id: "mood", label: "Mood", theme: "mood", emoji: "🙂", screen: "mood" },
      { id: "sleep", label: "Sleep", theme: "sleep", emoji: "🌙", screen: "sleep" },
      { id: "meals", label: "Meals", theme: "meals", emoji: "🍽️", screen: "meals" },
      { id: "water", label: "Water", theme: "water", emoji: "💧", counter: waterN || null },
      { id: "meds", label: "Medicine", theme: "meds", emoji: "💊", screen: "meds" },
      { id: "body", label: "Sick or hurt", theme: "body", emoji: "🩹", screen: "body" }
    ];
    $("#health-grid").innerHTML = tiles.map((t) =>
      tileHTML({ ...t, attr: t.screen ? `data-nav="${t.screen}"` : 'data-water="1"' })
    ).join("");
  }

  function logHealth(type, item, extraSpeak) {
    Store.logActivity({
      type,
      key: item.id,
      label: item.label,
      emoji: item.emoji,
      detail: extraSpeak || ""
    });
    showChoice({ emoji: item.emoji, label: item.label, speakText: extraSpeak || item.label });
  }

  function renderMood() {
    $("#mood-grid").innerHTML = MOODS.map((t) => tileHTML(t)).join("");
  }
  function renderSleep() {
    $("#sleep-grid").innerHTML = SLEEP.map((t) => tileHTML(t)).join("");
  }
  function renderMeals() {
    $("#meals-grid").innerHTML = MEALS.map((t) => {
      const type = t.id === "water" ? "water" : "meal";
      const n = todayCount(type, t.id === "water" ? "" : t.id);
      return tileHTML({ ...t, counter: n || null });
    }).join("");
  }
  function renderMeds() {
    const grid = $("#meds-grid");
    if (!settings.meds.length) {
      grid.innerHTML = `<p class="tl-empty">No medicines listed. A parent can add labels in settings.</p>`;
      return;
    }
    grid.innerHTML = settings.meds.map((m) => {
      const taken = todayCount("meds", m.id) > 0;
      return tileHTML({
        id: m.id,
        label: m.label,
        theme: taken ? "meds" : "break",
        emoji: taken ? "✓" : "💊",
        extraClass: taken ? "done" : "",
        tag: taken ? "Taken" : ""
      });
    }).join("");
  }
  function renderBody() {
    $("#body-grid").innerHTML = BODY.map((t) => tileHTML(t)).join("");
  }

  function renderDay() {
    const today = Store.dayKey();
    $("#day-sub").textContent = formatDay(today) + " · shared with family";
    const week = Store.eventsForWeek();
    $("#week-strip").innerHTML = week.map((col) => {
      const moods = col.events.filter((e) => e.type === "mood");
      const lastMood = moods[0];
      const meals = col.events.filter((e) => e.type === "meal").length;
      const water = col.events.filter((e) => e.type === "water").length;
      const meds = col.events.filter((e) => e.type === "meds").length;
      const body = col.events.filter((e) => e.type === "body").length;
      const schoolN = col.events.filter((e) => e.type === "school" || e.type === "school-done").length;
      const watchN = col.events.filter((e) => e.type === "watch").length;
      const remN = col.events.filter((e) => e.type === "reminder" || e.type === "reminder-missed").length;
      const marks = [];
      if (meals) marks.push(meals + " meal" + (meals > 1 ? "s" : ""));
      if (water) marks.push(water + " water");
      if (meds) marks.push("meds");
      if (body) marks.push("hurt");
      if (schoolN) marks.push("school");
      if (watchN) marks.push("watch");
      if (remN) marks.push("reminder");
      const isToday = col.day === today;
      return `<div class="week-day${isToday ? " today" : ""}" data-day="${col.day}">
        <div class="wd">${weekdayShort(col.day)}</div>
        <div class="wmood">${lastMood ? lastMood.emoji : "·"}</div>
        <div class="wmarks">${marks.join(" · ") || "&nbsp;"}</div>
      </div>`;
    }).join("");
    renderTimeline(today);
  }

  function renderTimeline(day) {
    const evs = Store.eventsForDay(day).slice().sort((a, b) => b.ts - a.ts);
    const el = $("#day-timeline");
    if (!evs.length) {
      el.innerHTML = `<div class="tl-empty">Nothing logged yet ${day === Store.dayKey() ? "today" : "on this day"}. Choices, music, school, watch, reminders, mood, and routine steps will show up here.</div>`;
      return;
    }
    el.innerHTML = evs.map((e) => {
      const known = ["choice","music","mood","routine","contribution","school","school-done","watch","reminder","reminder-missed","wall","reaction"];
      const cls = known.indexOf(e.type) >= 0 ? e.type.replace("-missed","").replace("-done","") : "health";
      const detail = e.detail || (e.whoLabel ? "From " + e.whoLabel : "");
      return `<div class="tl-item ${cls}">
        <div class="when">${formatTime(e.ts)}</div>
        <div class="dotcol"><span class="dot"></span></div>
        <div class="tl-card">
          <div class="tl-label">${e.emoji ? e.emoji + " " : ""}${escapeHtml(e.label)}</div>
          ${detail ? `<div class="tl-detail">${escapeHtml(typeLabel(e.type) + (detail ? " · " + detail : ""))}</div>` : `<div class="tl-detail">${escapeHtml(typeLabel(e.type))}</div>`}
        </div>
      </div>`;
    }).join("");
  }

  function typeLabel(t) {
    return ({
      choice: "Choice",
      music: "Music",
      mood: "Mood",
      sleep: "Sleep",
      meal: "Meal",
      water: "Water",
      meds: "Medicine",
      body: "Sick or hurt",
      routine: "Routine",
      contribution: "From family",
      game: "Game",
      watch: "Watch",
      school: "School",
      "school-done": "School",
      reminder: "Reminder",
      "reminder-missed": "Reminder missed",
      wall: "Family wall",
      reaction: "Reaction"
    })[t] || t;
  }

  function renderRoutine() {
    const done = Store.routineDoneFor();
    const steps = settings.routine;
    const n = steps.filter((s) => done.has(s.id)).length;
    $("#routine-progress").textContent = n + " of " + steps.length + " done today";
    $("#routine-list").innerHTML = steps.map((s) => {
      const isDone = done.has(s.id);
      return `<button type="button" class="routine-step${isDone ? " done" : ""}" data-id="${s.id}">
        <span class="art">${s.emoji || ""}</span>
        <span class="label">${escapeHtml(s.label)}</span>
        <span class="check" aria-hidden="true">✓</span>
      </button>`;
    }).join("");
  }


  /* ---------- Watch / School / Reminders / Wall ---------- */
  function parseYouTubeId(input) {
    const raw = String(input || "").trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] || null;
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[2];
    } catch (_) {}
    return null;
  }

  function youtubeThumb(id) {
    return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
  }

  function youtubeEmbed(id) {
    const q = "rel=0&modestbranding=1&playsinline=1&fs=1&iv_load_policy=3&disablekb=1";
    return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?" + q;
  }

  function renderWatch() {
    const grid = $("#watch-grid");
    const videos = Store.loadVideos();
    const parts = [];
    const connectors = (window.RemyCustomize && RemyCustomize.enabledConnectors()) || [];
    connectors.forEach((s) => {
      parts.push(tileHTML({
        id: s.id,
        label: s.label,
        theme: "shortcut",
        emoji: s.emoji,
        extraClass: "shortcut",
        attr: `data-connector="${s.id}"`
      }));
    });
    videos.forEach((v) => {
      const thumb = v.videoId
        ? `<img src="${youtubeThumb(v.videoId)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'thumb-fallback',textContent:'▶'}))">`
        : `<span class="thumb-fallback">▶</span>`;
      parts.push(`<button type="button" class="tile watch video-tile" data-id="${v.id}" data-video="${v.id}">
        <span class="art">${thumb}</span>
        <span class="label">${escapeHtml(v.title || "Video")}</span>
      </button>`);
    });
    if (!parts.length) {
      grid.innerHTML = `<p class="tl-empty">No videos or apps yet. A parent can add approved YouTube links, or turn on connectors in settings.</p>`;
      return;
    }
    grid.innerHTML = parts.join("");
  }

  function openShortcut(id) {
    openConnector(id);
  }

  function showConnectorBlock(title, message) {
    const ov = $("#connector-block");
    if (!ov) return;
    $("#connector-block-title").textContent = title || "Not right now";
    $("#connector-block-msg").textContent = message || "";
    ov.classList.remove("hidden");
  }

  function openConnector(id) {
    const list = (window.RemyCustomize && RemyCustomize.resolvedConnectors()) || [];
    const c = list.find((x) => x.id === id);
    if (!c) return;
    if (!c.url) {
      toast("A parent still needs to add a link for this.");
      return;
    }
    if (window.RemyCustomize) {
      const gate = RemyCustomize.connectorGate(c);
      if (!gate.ok) {
        showConnectorBlock(gate.title, gate.message);
        return;
      }
      RemyCustomize.markOpen(c);
    }
    Store.logActivity({ type: "connector", key: c.id, label: c.label, emoji: c.emoji || "🔗" });
    window.open(c.url, "_blank", "noopener,noreferrer");
  }

  function runCustomTile(id) {
    const t = window.RemyCustomize && RemyCustomize.current().customTiles.find((x) => x.id === id);
    if (!t) return;
    Store.logActivity({ type: "custom-tile", key: t.id, label: t.label, emoji: t.emoji || "⭐" });
    if (t.action === "section" && t.screen) {
      go(t.screen);
    } else if (t.action === "song" && t.trackId) {
      go("music");
      selectTrack(t.trackId);
      AudioEngine.play();
    } else if (t.action === "link" && t.url) {
      window.open(t.url, "_blank", "noopener,noreferrer");
    } else {
      AudioEngine.speak(t.phrase || t.label);
      showChoice({ emoji: t.emoji, label: t.label, imageId: t.imageId, speakText: false });
    }
  }

  function openApprovedVideo(id) {
    const v = Store.loadVideos().find((x) => x.id === id);
    if (!v || !v.videoId) return;
    Store.logActivity({ type: "watch", key: v.videoId, label: v.title || "Video", emoji: "▶" });
    $("#player-title").textContent = v.title || "Video";
    const src = youtubeEmbed(v.videoId);
    $("#player-frame").innerHTML = `<iframe src="${src}" title="${escapeHtml(v.title || "Video")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    $("#player-overlay").classList.add("show");
  }

  function closePlayer() {
    const ov = $("#player-overlay");
    if (ov) ov.classList.remove("show");
    const frame = $("#player-frame");
    if (frame) frame.innerHTML = "";
  }

  function renderSchool() {
    const list = $("#school-list");
    const tasks = Store.loadSchool();
    if (!tasks.length) {
      list.innerHTML = `<p class="tl-empty">No school tasks yet. A parent or teacher can add one in settings.</p>`;
      return;
    }
    const today = Store.dayKey();
    list.innerHTML = tasks.map((t) => {
      const steps = t.steps || [];
      const doneN = steps.filter((s) => s.done).length;
      const all = steps.length && doneN === steps.length;
      const late = t.due && t.due < today && !all;
      const due = t.due
        ? (late ? "Due " + formatDay(t.due) + " · overdue" : "Due " + formatDay(t.due))
        : (steps.length ? doneN + " of " + steps.length + " steps" : "No due date");
      const art = t.imageId
        ? `<img data-img="${t.imageId}" alt="">`
        : (t.emoji || "📘");
      return `<button type="button" class="school-card tile school${all ? " done" : ""}" data-id="${t.id}" data-task="${t.id}">
        <span class="art">${art}</span>
        <span class="meta"><span class="label">${escapeHtml(t.title)}</span><span class="due${late ? " late" : ""}">${escapeHtml(due)}</span></span>
      </button>`;
    }).join("");
    hydrateImages(list);
  }

  function renderSchoolTask() {
    const task = Store.loadSchool().find((t) => t.id === openTaskId);
    if (!task) {
      go("school", true);
      return;
    }
    $("#school-task-title").textContent = task.title;
    const note = $("#teacher-note");
    if (task.note) {
      note.classList.remove("hidden");
      $("#teacher-note-text").textContent = task.note;
    } else {
      note.classList.add("hidden");
    }
    const steps = task.steps || [];
    const doneN = steps.filter((s) => s.done).length;
    $("#school-task-progress").textContent = steps.length
      ? doneN + " of " + steps.length + " done"
      : "No steps — mark it done when you finish";
    $("#school-task-sub").textContent = task.due ? "Due " + formatDay(task.due) : "Tap a step when it is done";
    if (!steps.length) {
      $("#school-task-steps").innerHTML = `<button type="button" class="routine-step${task._done ? " done" : ""}" data-finish-task="${task.id}">
        <span class="art">${task.emoji || "📘"}</span>
        <span class="label">All done</span>
        <span class="check">✓</span>
      </button>`;
      return;
    }
    $("#school-task-steps").innerHTML = steps.map((st) =>
      `<button type="button" class="routine-step${st.done ? " done" : ""}" data-task-step="${task.id}" data-step="${st.id}">
        <span class="art">${st.emoji || task.emoji || "•"}</span>
        <span class="label">${escapeHtml(st.label)}</span>
        <span class="check">✓</span>
      </button>`
    ).join("");
  }

  function showReward() {
    const ov = $("#reward-overlay");
    const dots = $("#reward-dots");
    dots.innerHTML = "";
    const reduce = document.body.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      for (let i = 0; i < 14; i++) {
        const sp = document.createElement("span");
        const ang = (Math.PI * 2 * i) / 14;
        const dist = 80 + Math.random() * 120;
        sp.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        sp.style.setProperty("--dy", Math.sin(ang) * dist + "px");
        sp.style.left = "50%";
        sp.style.top = "50%";
        sp.style.background = ["#7ee0c6", "#8b6cff", "#ff9f43", "#ff6b8a", "#7bd36a"][i % 5];
        dots.appendChild(sp);
      }
    }
    ov.classList.add("show");
    AudioEngine.success();
    setTimeout(() => ov.classList.remove("show"), 1200);
  }

  async function renderWall() {
    const el = $("#family-wall");
    if (!el) return;
    const posts = Store.loadWall();
    if (!posts.length) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML = `<h3>Family wall</h3>` + (await Promise.all(posts.map(async (p) => {
      let photo = "";
      if (p.mediaId) {
        const html = await artFor(p.mediaId, "");
        photo = html ? `<div class="wall-photo">${html}</div>` : "";
      }
      const reacts = WALL_REACTS.map((e) => {
        const n = (p.reactions && p.reactions[e]) || 0;
        return `<button type="button" data-react="${p.id}" data-emoji="${e}">${e}${n ? `<span class="n">${n}</span>` : ""}</button>`;
      }).join("");
      return `<article class="wall-post">
        ${photo}
        <div class="wall-body">
          <div class="wall-caption">${escapeHtml(p.caption || "")}</div>
          <div class="wall-from">${p.fromLabel ? "From " + escapeHtml(p.fromLabel) : ""}</div>
          <div class="react-row">${reacts}</div>
        </div>
      </article>`;
    }))).join("");
  }

  function nowHM() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function tickReminders() {
    if ($("#reminder-overlay").classList.contains("show")) return;
    const now = new Date();
    const hm = nowHM();
    const dow = now.getDay();
    const day = Store.dayKey();
    const list = Store.loadReminders().filter((r) => r.enabled !== false);
    list.forEach((r) => {
      const st = Store.reminderStatus(day, r.id);
      const days = Array.isArray(r.days) ? r.days : [];
      if (days.length && days.indexOf(dow) < 0) return;
      if (st.done || st.missed) return;
      if (r.time === hm && !st.fired) {
        Store.reminderMark(day, r.id, { fired: true, shownAt: Date.now() });
        showReminder(r);
      } else if (r.time < hm && !st.done) {
        if (st.fired) {
          const age = Date.now() - (st.shownAt || 0);
          if (age > 15 * 60 * 1000) {
            Store.reminderMark(day, r.id, { missed: true });
            Store.logActivity({ type: "reminder-missed", key: r.id, label: r.phrase, emoji: r.emoji || "⏰", detail: "Missed" });
            closeReminder(false);
          }
        } else {
          Store.reminderMark(day, r.id, { missed: true, fired: true });
          Store.logActivity({ type: "reminder-missed", key: r.id, label: r.phrase, emoji: r.emoji || "⏰", detail: "Missed" });
        }
      }
    });
  }

  async function showReminder(r) {
    activeReminder = r;
    const art = $("#reminder-art");
    $("#reminder-phrase").textContent = r.phrase || "Reminder";
    if (r.imageId) {
      art.innerHTML = await artFor(r.imageId, `<span class="emoji">${r.emoji || "⏰"}</span>`);
    } else {
      art.innerHTML = `<span class="emoji">${r.emoji || "⏰"}</span>`;
    }
    $("#reminder-overlay").classList.add("show");
    try { await unlock(); } catch (_) {}
    if (AudioEngine.chime) AudioEngine.chime();
    AudioEngine.speak(r.phrase || "Reminder");
    maybeNotify(r.phrase || "Reminder");
  }

  function closeReminder(done) {
    const r = activeReminder;
    $("#reminder-overlay").classList.remove("show");
    if (r && done) {
      const day = Store.dayKey();
      Store.reminderMark(day, r.id, { done: true, missed: false });
      Store.logActivity({ type: "reminder", key: r.id, label: r.phrase, emoji: r.emoji || "⏰", detail: "Done" });
    }
    activeReminder = null;
  }

  function maybeNotify(body) {
    if (!settings.notifyReminders) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification("Remy's Music Room", { body, silent: true });
    } catch (_) {}
  }

  function renderEditWatch() {
    const el = $("#edit-watch");
    if (!el) return;
    const rows = Store.loadVideos().map((v) =>
      `<div class="log-item"><span>${escapeHtml(v.title)} <span class="when">${escapeHtml(v.videoId)}</span></span>
       <button type="button" class="secondary" data-del-video="${v.id}">Remove</button></div>`
    ).join("") || `<div class="sub">No YouTube videos yet.</div>`;
    el.innerHTML = `
      <p class="honesty-note">Approved videos play here, inside the app. Netflix, Disney+, and other services are shortcuts in Connectors — they open the real app or website.</p>
      <div class="contrib-preview">
        <input type="text" id="watch-url" placeholder="Paste a YouTube link">
        <input type="text" id="watch-title" placeholder="Title Remy will see">
        <button type="button" class="primary" id="watch-add">Add video</button>
      </div>
      <div style="margin-top:12px">${rows}</div>`;
  }

  function renderEditSchool() {
    const el = $("#edit-school");
    if (!el) return;
    const rows = Store.loadSchool().map((t) =>
      `<div class="log-item"><span>${escapeHtml((t.emoji || "") + " " + t.title)}${t.due ? " · " + t.due : ""}</span>
       <button type="button" class="secondary" data-del-school="${t.id}">Remove</button></div>`
    ).join("") || `<div class="sub">No tasks yet.</div>`;
    el.innerHTML = `
      <div class="contrib-preview">
        <input type="text" id="school-title" placeholder="Task title">
        <input type="text" id="school-emoji" placeholder="Emoji" style="max-width:8rem" value="📘">
        <label class="file-btn">Photo (optional)<input type="file" accept="image/*" id="school-file"></label>
        <label class="sub">Due date <input type="date" id="school-due" class="field-input"></label>
        <textarea id="school-steps" class="field-input" rows="4" placeholder="One step per line"></textarea>
        <textarea id="school-note" class="field-input" rows="3" placeholder="Teacher note (optional)"></textarea>
        <button type="button" class="primary" id="school-add">Add task</button>
      </div>
      <div style="margin-top:12px">${rows}</div>`;
  }

  function renderEditReminders() {
    const el = $("#edit-reminders");
    if (!el) return;
    const days = DAY_NAMES.map((n, i) =>
      `<label><input type="checkbox" data-day="${i}" checked> ${n}</label>`
    ).join("");
    const rows = Store.loadReminders().map((r) => {
      const d = (r.days || []).map((i) => DAY_NAMES[i]).join(" ");
      return `<div class="log-item"><span>${escapeHtml((r.emoji || "") + " " + r.phrase)} · ${escapeHtml(r.time)} · ${escapeHtml(d)}</span>
        <button type="button" class="secondary" data-del-reminder="${r.id}">Remove</button></div>`;
    }).join("") || `<div class="sub">No reminders yet. Try “Brush teeth”, “Medicine”, or “Pack bag”.</div>`;
    const perm = ("Notification" in window) ? Notification.permission : "unsupported";
    const notifyOn = !!settings.notifyReminders && perm === "granted";
    el.innerHTML = `
      <div class="contrib-preview">
        <input type="text" id="rem-phrase" placeholder="Spoken phrase, like Brush teeth">
        <input type="time" id="rem-time" class="field-input" value="08:00">
        <input type="text" id="rem-emoji" placeholder="Emoji" style="max-width:8rem" value="⏰">
        <label class="file-btn">Picture (optional)<input type="file" accept="image/*" id="rem-file"></label>
        <div class="sub">Repeat on</div>
        <div class="day-checks" id="rem-days">${days}</div>
        <button type="button" class="primary" id="rem-add">Add reminder</button>
      </div>
      <div class="row" style="margin-top:12px">
        <span>Device banners when this browser allows them</span>
        <button type="button" class="toggle" id="rem-notify" aria-pressed="${notifyOn}">${notifyOn ? "On" : "Off"}</button>
      </div>
      <p class="sub">Banners may not appear when the app is closed. Background reminders for Remy and family are planned for Phase B (family sync and web push).</p>
      <div style="margin-top:12px">${rows}</div>`;
  }

  function renderEditWall() {
    const el = $("#edit-wall");
    if (!el) return;
    if (!contribDraft.from && settings.family[0]) contribDraft.from = settings.family[0].id;
    const who = settings.family.map((p) =>
      `<button type="button" data-from="${p.id}" aria-pressed="${contribDraft.from === p.id}">${escapeHtml(p.label)}</button>`
    ).join("");
    const rows = Store.loadWall().map((p) =>
      `<div class="log-item"><span>${escapeHtml(p.caption || "Photo")} · from ${escapeHtml(p.fromLabel || "")}</span>
       <button type="button" class="secondary" data-del-wall="${p.id}">Remove</button></div>`
    ).join("") || `<div class="sub">Nothing on the wall yet.</div>`;
    el.innerHTML = `
      <div class="sub">Who is this from?</div>
      <div class="who-row">${who}</div>
      <div class="contrib-preview">
        <input type="text" id="wall-caption" placeholder="Caption">
        <label class="file-btn">Choose photo<input type="file" accept="image/*" id="wall-file"></label>
        <button type="button" class="primary" id="wall-add">Post to the wall</button>
      </div>
      <div style="margin-top:12px">${rows}</div>`;
  }

  /* ---------- settings ---------- */


  async function renderFamilySync() {
    const wrap = $("#sync-account");
    const sub = $("#sync-account-sub");
    if (!wrap) return;
    if (!window.RemyAuth || !RemyAuth.session()) {
      if (sub) sub.textContent = "Sign in to share photos, reminders, and Remy's day across devices.";
      wrap.innerHTML = `<p class="sub">You are not signed in.</p>`;
      return;
    }
    const role = RemyAuth.role() || "family";
    const roleLabel = ({ parent: "parent", family: "family", teacher: "teacher", remy_device: "Remy device" })[role] || role;
    if (sub) {
      sub.textContent = RemyAuth.familyName() + " · signed in as " + (RemyAuth.displayName() || (RemyAuth.user() && RemyAuth.user().email) || "") + " (" + roleLabel + ")";
    }
    let membersHtml = "";
    try {
      const members = await RemyAuth.listMembers();
      membersHtml = members.map((m) =>
        `<div class="member-row"><span>${escapeHtml(m.display_name || "Family member")}</span><span class="role-tag">${escapeHtml(String(m.role || "").replace("_", " "))}</span></div>`
      ).join("");
    } catch {
      membersHtml = "";
    }
    let inviteHtml = "";
    if (RemyAuth.isParent()) {
      inviteHtml = `
        <h4 style="margin:16px 0 6px">Invite someone</h4>
        <p class="sub">The code is shown once. Share it in person or in a private message — the app will not send email.</p>
        <div class="invite-actions">
          <button type="button" class="secondary" data-make-invite="family">Family code</button>
          <button type="button" class="secondary" data-make-invite="teacher">Teacher code</button>
          <button type="button" class="secondary" data-make-invite="remy_device">Remy device code</button>
          <button type="button" class="secondary" data-make-invite="parent">Another parent</button>
        </div>
        <div id="fresh-invite"></div>
        <div id="invite-list"></div>
      `;
    }
    const pushHtml = `
      <h4 style="margin:16px 0 6px">Notifications</h4>
      <p class="sub">On an installed app (or a supporting browser), family can get a banner when something new is shared.</p>
      <button type="button" class="secondary" id="enable-push">Turn on family notifications</button>
      <div class="sub" id="push-status"></div>
    `;
    const signOutHtml = RemyAuth.isDevice()
      ? `<p class="sub" style="margin-top:14px">This device stays signed in so Remy can keep using it.</p>`
      : `<button type="button" class="sign-out-btn" id="sign-out">Sign out</button>`;
    wrap.innerHTML = `<div class="member-list">${membersHtml}</div>${inviteHtml}${pushHtml}${signOutHtml}`;
    if (RemyAuth.isParent()) await renderInviteList();
    updatePushStatus();
  }

  async function renderInviteList() {
    const el = $("#invite-list");
    if (!el) return;
    try {
      const rows = await RemyAuth.listInvites();
      const active = rows.filter((r) => !r.revoked_at && !(r.expires_at && new Date(r.expires_at) < new Date()) && r.use_count < r.max_uses);
      if (!active.length) {
        el.innerHTML = `<p class="sub">No unused invite codes right now.</p>`;
        return;
      }
      el.innerHTML = active.map((r) => {
        const exp = r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "no expiry";
        return `<div class="invite-row"><span><span class="role-tag">${escapeHtml(String(r.role).replace("_", " "))}</span> · ${r.use_count}/${r.max_uses} used · until ${escapeHtml(exp)}</span><button type="button" class="secondary" data-revoke-invite="${r.id}">Revoke</button></div>`;
      }).join("");
    } catch {
      el.innerHTML = "";
    }
  }

  async function updatePushStatus() {
    const el = $("#push-status");
    if (!el || !window.RemyPush) return;
    const ok = await RemyPush.supported();
    if (!ok) {
      el.textContent = "Push is not available in this browser. On iPhone, install the app to the Home Screen first (iOS 16.4+).";
      return;
    }
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      el.textContent = "Family notifications are on for this device.";
    } else {
      el.textContent = "Family notifications are off on this device.";
    }
  }

  function reloadSettings() {
    settings = Store.loadSettings();
    if (window.RemyCustomize) RemyCustomize.apply();
    applyMotionPref();
    AudioEngine.setVolume(settings.volume);
    AudioEngine.setTempo(settings.tempo);
    AudioEngine.setChipmunk(settings.chipmunk);
    if (window.__REMY__) window.__REMY__.settings = settings;
  }

  function rerender() {
    reloadSettings();
    enter(currentScreen());
  }

  function refreshMedia(id) {
    if (id && imageUrls.has(id)) {
      try { URL.revokeObjectURL(imageUrls.get(id)); } catch { /* ignore */ }
      imageUrls.delete(id);
    }
    enter(currentScreen());
  }


  function renderLookPanel() {
    const themeGrid = $("#theme-grid");
    const accentGrid = $("#accent-grid");
    const sizeRow = $("#size-row");
    const order = $("#home-order");
    const customList = $("#custom-tiles-list");
    const form = $("#custom-tile-form");
    if (!themeGrid || !window.RemyCustomize) return;
    const c = RemyCustomize.current();
    const editable = RemyCustomize.canEdit();
    const disable = editable ? "" : "disabled";
    themeGrid.innerHTML = RemyCustomize.THEMES.map((th) =>
      `<button type="button" class="theme-card" data-theme-id="${th.id}" aria-pressed="${c.theme === th.id}" ${disable}>
        <div class="k">${escapeHtml(th.label)}</div>
        <div class="hint">${escapeHtml(th.hint)}</div>
      </button>`
    ).join("");
    accentGrid.innerHTML = RemyCustomize.ACCENTS.map((a) => {
      const on = (c.accent || "") === (a.color || "");
      const style = a.color ? `background:${a.color}` : "background:var(--bg-elev)";
      return `<button type="button" class="accent-swatch" data-accent="${a.color}" title="${escapeHtml(a.label)}" aria-label="${escapeHtml(a.label)}" aria-pressed="${on}" style="${style}" ${disable}></button>`;
    }).join("");
    sizeRow.innerHTML = ["compact", "comfortable", "large"].map((s) =>
      `<button type="button" class="size-chip" data-tile-size="${s}" aria-pressed="${c.tileSize === s}" ${disable}>${s[0].toUpperCase() + s.slice(1)}</button>`
    ).join("");
    const labels = {};
    RemyCustomize.SECTION_TILES.forEach((s) => { labels[s.id] = s.label; });
    c.customTiles.forEach((s) => { labels[s.id] = s.label || "Custom"; });
    RemyCustomize.resolvedConnectors().forEach((s) => { labels[s.id] = s.label; });
    order.innerHTML = c.homeTiles.map((slot, i) => {
      const vis = slot.visible !== false;
      return `<div class="order-row">
        <span class="lab">${escapeHtml(labels[slot.id] || slot.id)}</span>
        <button type="button" class="icon-btn vis-toggle" data-home-vis="${slot.id}" aria-pressed="${vis}" aria-label="${vis ? "Hide" : "Show"}" ${disable}>${vis ? "●" : "○"}</button>
        <button type="button" class="icon-btn" data-home-move="${slot.id}" data-dir="-1" aria-label="Move up" ${disable || i === 0 ? "disabled" : ""}>↑</button>
        <button type="button" class="icon-btn" data-home-move="${slot.id}" data-dir="1" aria-label="Move down" ${disable || i === c.homeTiles.length - 1 ? "disabled" : ""}>↓</button>
      </div>`;
    }).join("");
    customList.innerHTML = c.customTiles.map((tile) =>
      `<div class="connector-card">
        <div class="head"><span class="emoji">${escapeHtml(tile.emoji || "⭐")}</span> ${escapeHtml(tile.label)}</div>
        <button type="button" class="secondary" data-del-custom-tile="${tile.id}" ${disable}>Remove</button>
      </div>`
    ).join("") || `<p class="sub">No custom tiles yet.</p>`;
    const screens = RemyCustomize.SECTION_TILES.map((s) =>
      `<option value="${s.screen}">${escapeHtml(s.label)}</option>`
    ).join("");
    const tracks = (window.AudioEngine ? AudioEngine.TRACKS : []).map((tr) =>
      `<option value="${tr.id}">${escapeHtml(tr.name)}</option>`
    ).join("");
    form.innerHTML = editable ? `
      <label>Label <input id="ct-label" type="text" placeholder="Cars"></label>
      <label>Emoji <input id="ct-emoji" type="text" value="⭐" style="max-width:6rem"></label>
      <label>Action
        <select id="ct-action">
          <option value="speak">Speak a phrase</option>
          <option value="section">Open a section</option>
          <option value="song">Play a song</option>
          <option value="link">Open a link or app</option>
        </select>
      </label>
      <label>Phrase <input id="ct-phrase" type="text" placeholder="I want a car ride"></label>
      <label>Section <select id="ct-screen">${screens}</select></label>
      <label>Song <select id="ct-track">${tracks}</select></label>
      <label>Link or deep link <input id="ct-url" type="url" placeholder="https://"></label>
      <button type="button" class="primary" id="ct-add">Add custom tile</button>
    ` : `<p class="sub">Only a parent can change the look, tiles, and connectors.</p>`;
  }

  function renderConnectorsPanel() {
    const list = $("#connectors-list");
    const form = $("#custom-connector-form");
    if (!list || !window.RemyCustomize) return;
    const editable = RemyCustomize.canEdit();
    const disable = editable ? "" : "disabled";
    const used = RemyCustomize.usage().minutes;
    let html = "";
    let lastGroup = "";
    RemyCustomize.resolvedConnectors().forEach((c) => {
      if (c.group !== lastGroup) {
        lastGroup = c.group;
        html += `<div class="group-label">${escapeHtml(c.group)}</div>`;
      }
      const mins = Math.round(used[c.id] || 0);
      html += `<div class="connector-card">
        <div class="head"><span class="emoji">${escapeHtml(c.emoji)}</span><span>${escapeHtml(c.label)}</span></div>
        <button type="button" class="toggle" data-conn-toggle="${c.id}" aria-pressed="${!!c.enabled}" ${disable}>${c.enabled ? "On" : "Off"}</button>
        ${c.needsUrl || !c.builtin ? `<label>Link or deep link<input type="url" data-conn-url="${c.id}" value="${escapeHtml(c.url)}" placeholder="${escapeHtml(c.placeholder || "https://")}" ${disable}></label>` : ""}
        <div class="connector-meta">
          <label>Show on home
            <select data-conn-home="${c.id}" ${disable}>
              <option value="no"${c.showOnHome ? "" : " selected"}>Watch only</option>
              <option value="yes"${c.showOnHome ? " selected" : ""}>Also on home</option>
            </select>
          </label>
          <label>Daily minutes (optional)
            <input type="number" min="0" max="240" data-conn-limit="${c.id}" value="${c.dailyLimitMin || ""}" placeholder="No limit" ${disable}>
          </label>
          <label>Allowed from
            <input type="time" data-conn-start="${c.id}" value="${escapeHtml(c.hoursStart || "")}" ${disable}>
          </label>
          <label>Allowed until
            <input type="time" data-conn-end="${c.id}" value="${escapeHtml(c.hoursEnd || "")}" ${disable}>
          </label>
        </div>
        <div class="sub">${mins ? ("Used about " + mins + " min today on this device. ") : ""}Time is counted from when the tile is opened until this app is used again.</div>
        ${c.builtin ? "" : `<button type="button" class="secondary" data-del-connector="${c.id}" ${disable}>Remove</button>`}
      </div>`;
    });
    list.innerHTML = html;
    form.innerHTML = editable ? `
      <label>Name <input id="cc-label" type="text" placeholder="PBS Kids"></label>
      <label>Emoji <input id="cc-emoji" type="text" value="🔗" style="max-width:6rem"></label>
      <label>Link or deep link <input id="cc-url" type="url" placeholder="https://"></label>
      <button type="button" class="primary" id="cc-add">Add custom connector</button>
    ` : "";
  }

  function renderSettings() {
    $("#vol").value = Math.round((settings.volume || 0) * 100);
    $("#vol-val").textContent = $("#vol").value + "%";
    $("#tempo-min").value = Math.round((settings.tempoMin || 0.8) * 100);
    $("#tempo-max").value = Math.round((settings.tempoMax || 1.6) * 100);
    $("#tempo-min-val").textContent = $("#tempo-min").value + "%";
    $("#tempo-max-val").textContent = $("#tempo-max").value + "%";
    const rm = $("#reduce-motion");
    rm.setAttribute("aria-pressed", settings.reduceMotion ? "true" : "false");
    rm.textContent = settings.reduceMotion ? "On" : "Off";
    renderChoiceLog();
    renderEditWant();
    renderEditFamily();
    renderEditMeds();
    renderEditRoutine();
    renderContribForm();
    renderContribList();
    renderEditWatch();
    renderEditSchool();
    renderEditReminders();
    renderEditWall();
    renderFamilySync();
    renderLookPanel();
    renderConnectorsPanel();
  }

  function renderChoiceLog() {
    const items = Store.loadLog();
    const counts = {};
    items.forEach((i) => { counts[i.label] = (counts[i.label] || 0) + 1; });
    $("#log-counts").innerHTML = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([k, n]) => `<span class="count-chip"><span>${escapeHtml(k)}</span><span>${n}</span></span>`)
      .join("") || `<span class="sub">No choices yet.</span>`;
    $("#log-list").innerHTML = items.slice(0, 40).map((i) =>
      `<div class="log-item"><span>${escapeHtml(i.label)}</span><time class="when">${new Date(i.ts).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></div>`
    ).join("") || "";
  }

  function emojiPicker(selected, dataId) {
    return `<div class="emoji-pick" data-for="${dataId}">${EMOJI_PICK.map((e) =>
      `<button type="button" data-emoji="${e}" class="${e === selected ? "sel" : ""}">${e}</button>`
    ).join("")}</div>`;
  }

  function renderEditWant() {
    $("#edit-want").innerHTML = settings.wantTiles.map((t) =>
      `<div class="edit-card" data-want="${t.id}">
        <div class="edit-top">
          <strong>${escapeHtml(t.emoji)} ${escapeHtml(t.label)}</strong>
        </div>
        <input type="text" value="${escapeHtml(t.label)}" data-field="label" aria-label="Label for ${escapeHtml(t.label)}">
        ${emojiPicker(t.emoji, t.id)}
        <label class="file-btn">Upload picture<input type="file" accept="image/*" data-field="image"></label>
        <button type="button" class="secondary" data-del-want="${t.id}">Remove</button>
      </div>`
    ).join("") + `<button type="button" class="secondary" id="add-want">Add a board item</button>`;
  }

  function renderEditFamily() {
    $("#edit-family").innerHTML = settings.family.map((p) =>
      `<div class="edit-card" data-person="${p.id}">
        <div class="edit-top"><strong>${escapeHtml(p.emoji || "")} ${escapeHtml(p.label)}</strong></div>
        <input type="text" value="${escapeHtml(p.label)}" data-field="label" aria-label="Name">
        ${emojiPicker(p.emoji, p.id)}
        <button type="button" class="secondary" data-record="${p.id}">Record message</button>
        <button type="button" class="secondary" data-playvoice="${p.id}">Play</button>
      </div>`
    ).join("") + `<div class="edit-card"><button type="button" class="primary" id="add-person">Add a person</button></div>`;
  }

  function renderEditMeds() {
    $("#edit-meds").innerHTML = settings.meds.map((m) =>
      `<div class="med-row" data-med="${m.id}">
        <input type="text" value="${escapeHtml(m.label)}" data-field="label" aria-label="Medicine label">
        <button type="button" class="secondary" data-del-med="${m.id}">Remove</button>
      </div>`
    ).join("") + `<button type="button" class="secondary" id="add-med">Add a label</button>`;
  }

  function renderEditRoutine() {
    $("#edit-routine").innerHTML = settings.routine.map((s) =>
      `<div class="routine-edit-row" data-step="${s.id}">
        <input type="text" value="${escapeHtml(s.emoji || "")}" data-field="emoji" style="max-width:4.5rem" aria-label="Emoji">
        <input type="text" value="${escapeHtml(s.label)}" data-field="label" aria-label="Step name">
        <button type="button" class="secondary" data-del-step="${s.id}">Remove</button>
      </div>`
    ).join("") + `<button type="button" class="secondary" id="add-step">Add a step</button>`;
  }

  function renderContribForm() {
    if (!contribDraft.from) contribDraft.from = settings.family[0] && settings.family[0].id;
    const who = settings.family.map((p) =>
      `<button type="button" data-from="${p.id}" aria-pressed="${contribDraft.from === p.id}">${escapeHtml(p.label)}</button>`
    ).join("");
    const kinds = [
      ["song", "Song"],
      ["photo", "Photo"],
      ["voice", "Voice"],
      ["reward", "Reward"]
    ].map(([k, l]) =>
      `<button type="button" data-kind="${k}" aria-pressed="${contribDraft.kind === k}">${l}</button>`
    ).join("");
    let fields = "";
    if (contribDraft.kind === "song") {
      fields = `<select class="field-input" id="contrib-track">${AudioEngine.TRACKS.map((t) =>
        `<option value="${t.id}">${escapeHtml(t.name)}</option>`
      ).join("")}</select>`;
    } else if (contribDraft.kind === "photo") {
      fields = `<input type="text" id="contrib-title" placeholder="Photo title">
        <label class="file-btn">Choose photo<input type="file" accept="image/*" id="contrib-file"></label>`;
    } else if (contribDraft.kind === "voice") {
      fields = `<input type="text" id="contrib-title" placeholder="Message title">
        <button type="button" class="secondary" id="contrib-rec">Record a short message</button>`;
    } else {
      fields = `<input type="text" id="contrib-title" placeholder="Pizza night, car ride…">
        <input type="text" id="contrib-emoji" placeholder="Optional emoji" style="max-width:8rem">`;
    }
    $("#contrib-form").innerHTML = `
      <div class="sub">Who is this from?</div>
      <div class="who-row">${who}</div>
      <div class="sub">What are you adding?</div>
      <div class="kind-row">${kinds}</div>
      <div class="contrib-preview">${fields}</div>
      <button type="button" class="primary" id="contrib-save">Save for Remy</button>`;
  }

  function renderContribList() {
    const items = Store.loadContrib();
    $("#contrib-list").innerHTML = items.length
      ? items.map((c) =>
        `<div class="log-item"><span>${escapeHtml(kindEmoji(c.kind) + " " + (c.title || prettyKind(c.kind)))} · from ${escapeHtml(c.fromLabel)}</span>
         <button type="button" class="secondary" data-del-contrib="${c.id}">Remove</button></div>`
      ).join("")
      : `<div class="sub">Nothing added yet.</div>`;
  }

  async function saveContrib() {
    const person = settings.family.find((p) => p.id === contribDraft.from) || settings.family[0];
    if (!person) return toast("Add a family member first.");
    const kind = contribDraft.kind;
    const rec = {
      kind,
      from: person.id,
      fromLabel: person.label,
      title: ($("#contrib-title") && $("#contrib-title").value.trim()) || "",
      emoji: ($("#contrib-emoji") && $("#contrib-emoji").value.trim()) || kindEmoji(kind)
    };
    if (kind === "song") {
      const id = $("#contrib-track").value;
      const track = AudioEngine.TRACKS.find((t) => t.id === id);
      rec.trackId = id;
      rec.title = rec.title || (track ? track.name : "Song");
      rec.emoji = track ? track.emoji : "🎵";
    } else if (kind === "photo") {
      const file = $("#contrib-file") && $("#contrib-file").files[0];
      if (!file) return toast("Choose a photo first.");
      rec.title = rec.title || "Photo";
      rec.mediaId = Store.uid();
      await Store.putImage({ id: rec.mediaId, blob: file, type: file.type });
    } else if (kind === "voice") {
      if (!contribDraft.voiceBlob) return toast("Record a short message first.");
      rec.title = rec.title || "Message";
      rec.mediaId = Store.uid();
      rec.emoji = "🎙️";
      await Store.putVoice({ id: rec.mediaId, blob: contribDraft.voiceBlob, type: contribDraft.voiceType || "audio/webm", created: Date.now() });
      contribDraft.voiceBlob = null;
    } else {
      if (!rec.title) return toast("Name the reward, like Pizza night.");
      rec.emoji = rec.emoji || "🎁";
    }
    Store.addContrib(rec);
    toast("Saved for Remy — from " + person.label);
    renderContribForm();
    renderContribList();
    renderEditWatch();
    renderEditSchool();
    renderEditReminders();
    renderEditWall();
  }

  /* recording */
  function pickMime() {
    const types = ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm"];
    if (!window.MediaRecorder) return "";
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  }

  async function startRecord(targetId, isContrib) {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      toast("Recording is not available in this browser.");
      return;
    }
    try {
      recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast("Microphone permission is needed to record a message.");
      return;
    }
    recChunks = [];
    const mime = pickMime();
    recRecorder = mime ? new MediaRecorder(recStream, { mimeType: mime }) : new MediaRecorder(recStream);
    recTarget = { id: targetId, isContrib };
    recRecorder.ondataavailable = (e) => { if (e.data && e.data.size) recChunks.push(e.data); };
    recRecorder.onstop = async () => {
      const type = recRecorder.mimeType || mime || "audio/webm";
      const blob = new Blob(recChunks, { type });
      if (recTarget && recTarget.isContrib) {
        contribDraft.voiceBlob = blob;
        contribDraft.voiceType = type;
        toast("Message captured. Tap Save for Remy.");
      } else if (recTarget) {
        await Store.putVoice({ id: recTarget.id, blob, type, created: Date.now() });
        toast("Message saved.");
      }
      cleanupStream();
      $("#record-bar").classList.remove("show");
      recRecorder = null;
    };
    recRecorder.start();
    $("#record-bar").classList.add("show");
    $("#record-label").textContent = "Recording…";
    if (currentScreen() !== "family" && currentScreen() !== "settings") go("family");
  }

  function stopRecord(save) {
    if (!recRecorder) return;
    if (!save) {
      recRecorder.onstop = () => { cleanupStream(); recRecorder = null; };
      $("#record-bar").classList.remove("show");
    }
    if (recRecorder.state !== "inactive") recRecorder.stop();
  }

  function cancelRecord() { stopRecord(false); }

  function cleanupStream() {
    if (recStream) {
      recStream.getTracks().forEach((t) => t.stop());
      recStream = null;
    }
  }

  /* ---------- events ---------- */
  function persist() {
    Store.saveSettings(settings);
    AudioEngine.setVolume(settings.volume);
    AudioEngine.setTempo(settings.tempo);
    AudioEngine.setChipmunk(settings.chipmunk);
    applyMotionPref();
  }

  document.addEventListener("pointerdown", function firstUnlock() {
    unlock();
  }, { passive: true });

  document.addEventListener("click", async (ev) => {
    const backBtn = ev.target.closest("[data-back]");
    if (backBtn) { await unlock(); press(backBtn); back(); return; }

    const nav = ev.target.closest("[data-nav]");
    if (nav && !ev.target.closest("[data-id][data-nav]") && nav.dataset.nav) {
      await unlock();
      press(nav);
      go(nav.dataset.nav);
      return;
    }

    const tile = ev.target.closest(".tile");
    if (tile) {
      await unlock();
      press(tile);
      const screen = currentScreen();
      const id = tile.dataset.id;
      if (tile.dataset.contrib) { await playContrib(tile.dataset.contrib); return; }
      if (tile.dataset.video) { openApprovedVideo(tile.dataset.video); return; }
      if (tile.dataset.shortcut) { openShortcut(tile.dataset.shortcut); return; }
      if (tile.dataset.connector) { openConnector(tile.dataset.connector); return; }
      if (tile.dataset.customTile) { runCustomTile(tile.dataset.customTile); return; }
      if (tile.dataset.task) { openTaskId = tile.dataset.task; go("school-task"); return; }
      if (tile.dataset.water) {
        logHealth("water", { id: "water", label: "Water", emoji: "💧" });
        renderHealth();
        return;
      }
      if (tile.dataset.nav && (screen === "home" || screen === "games" || screen === "health")) {
        go(tile.dataset.nav);
        return;
      }
      if (screen === "home") {
        const t = HOME_TILES.find((x) => x.id === id);
        if (t) go(t.screen);
      } else if (screen === "music") {
        selectTrack(id);
      } else if (screen === "want") {
        pickWant(id);
      } else if (screen === "games") {
        if (id === "beat") go("beat");
        else if (id === "match") go("match");
        else if (id === "routine") go("routine");
      } else if (screen === "match") {
        pickMatch(id);
      } else if (screen === "family") {
        if (id === "add") toast("Press and hold the gear to add someone in parent settings.");
        else playFamilyVoice(id);
      } else if (screen === "health") {
        if (id === "water") {
          logHealth("water", { id: "water", label: "Water", emoji: "💧" });
          renderHealth();
        } else if (id) go(id);
      } else if (screen === "mood") {
        const item = MOODS.find((x) => x.id === id);
        if (item) logHealth("mood", item);
      } else if (screen === "sleep") {
        const item = SLEEP.find((x) => x.id === id);
        if (item) logHealth("sleep", item);
      } else if (screen === "meals") {
        const item = MEALS.find((x) => x.id === id);
        if (item) {
          logHealth(item.id === "water" ? "water" : "meal", item);
          renderMeals();
        }
      } else if (screen === "meds") {
        const item = settings.meds.find((x) => x.id === id);
        if (item) {
          logHealth("meds", item, item.label + " taken");
          renderMeds();
        }
      } else if (screen === "body") {
        const item = BODY.find((x) => x.id === id);
        if (item) {
          const phrase = item.speak || item.label;
          logHealth("body", item, phrase);
        }
      }
      return;
    }

    const step = ev.target.closest(".routine-step");
    if (step) {
      await unlock();
      press(step);
      const nowDone = Store.toggleRoutine(step.dataset.id);
      const item = settings.routine.find((s) => s.id === step.dataset.id);
      if (nowDone && item) {
        AudioEngine.success();
        Store.logActivity({ type: "routine", key: item.id, label: item.label, emoji: item.emoji });
        AudioEngine.speak(item.label);
      } else {
        AudioEngine.tap();
      }
      renderRoutine();
      return;
    }
  });

  $("#music-play").addEventListener("click", async () => {
    await unlock();
    if (!AudioEngine.currentTrackId) {
      selectTrack(AudioEngine.TRACKS[0].id);
    } else if (AudioEngine.isPlaying) {
      AudioEngine.stopMusic();
      syncMusicDock();
    } else {
      selectTrack(AudioEngine.currentTrackId);
    }
  });

  $("#tempo").addEventListener("input", () => {
    const v = clampTempo(Number($("#tempo").value) / 100);
    settings.tempo = v;
    $("#tempo").value = Math.round(v * 100);
    $("#tempo-val").textContent = $("#tempo").value + "%";
    AudioEngine.setTempo(v);
    persist();
  });

  $("#chipmunk").addEventListener("click", async () => {
    await unlock();
    settings.chipmunk = !settings.chipmunk;
    AudioEngine.setChipmunk(settings.chipmunk);
    $("#chipmunk").setAttribute("aria-pressed", settings.chipmunk ? "true" : "false");
    persist();
  });

  $("#choice-overlay").addEventListener("click", hideChoice);

  $("#hum-start").addEventListener("click", async () => { await unlock(); startHum(); });
  $("#hum-retry").addEventListener("click", async () => { await unlock(); startHum(); });
  $("#hum-stop").addEventListener("click", () => {
    HumRoom.stop();
    $("#hum-hud").classList.add("hidden");
    $("#hum-intro").classList.remove("hidden");
    $("#hum-denied").classList.add("hidden");
  });
  $("#hum-echo").addEventListener("click", () => {
    const on = $("#hum-echo").getAttribute("aria-pressed") !== "true";
    $("#hum-echo").setAttribute("aria-pressed", on ? "true" : "false");
    HumRoom.setEcho(on);
  });

  $("#beat-hit").addEventListener("pointerdown", async (ev) => {
    await unlock();
    tapBeat(ev);
  });

  $("#match-play").addEventListener("click", async () => {
    await unlock();
    if (matchAnswer) matchAnswer.play();
  });
  $("#match-next").addEventListener("click", async () => {
    await unlock();
    nextMatch(true);
  });

  $("#record-stop").addEventListener("click", () => stopRecord(true));
  $("#record-cancel").addEventListener("click", cancelRecord);

  /* settings controls */
  $("#vol").addEventListener("input", () => {
    settings.volume = Number($("#vol").value) / 100;
    $("#vol-val").textContent = $("#vol").value + "%";
    persist();
  });
  $("#tempo-min").addEventListener("input", () => {
    settings.tempoMin = Number($("#tempo-min").value) / 100;
    if (settings.tempoMax < settings.tempoMin) settings.tempoMax = settings.tempoMin;
    settings.tempo = clampTempo(settings.tempo);
    $("#tempo-min-val").textContent = $("#tempo-min").value + "%";
    persist();
  });
  $("#tempo-max").addEventListener("input", () => {
    settings.tempoMax = Number($("#tempo-max").value) / 100;
    if (settings.tempoMax < settings.tempoMin) settings.tempoMin = settings.tempoMax;
    settings.tempo = clampTempo(settings.tempo);
    $("#tempo-max-val").textContent = $("#tempo-max").value + "%";
    persist();
  });
  $("#reduce-motion").addEventListener("click", () => {
    settings.reduceMotion = !settings.reduceMotion;
    persist();
    renderSettings();
  });
  $("#clear-log").addEventListener("click", () => {
    Store.clearLog();
    renderChoiceLog();
    toast("Choice log cleared.");
  });

  $("#settings-wrap").addEventListener("input", (ev) => {
    const want = ev.target.closest("[data-want]");
    if (want && ev.target.dataset.field === "label") {
      const t = settings.wantTiles.find((x) => x.id === want.dataset.want);
      if (t) { t.label = ev.target.value; persist(); }
    }
    const person = ev.target.closest("[data-person]");
    if (person && ev.target.dataset.field === "label") {
      const p = settings.family.find((x) => x.id === person.dataset.person);
      if (p) { p.label = ev.target.value; persist(); }
    }
    const med = ev.target.closest("[data-med]");
    if (med && ev.target.dataset.field === "label") {
      const m = settings.meds.find((x) => x.id === med.dataset.med);
      if (m) { m.label = ev.target.value; persist(); }
    }
    const step = ev.target.closest("[data-step]");
    if (step) {
      const s = settings.routine.find((x) => x.id === step.dataset.step);
      if (s) {
        if (ev.target.dataset.field === "label") s.label = ev.target.value;
        if (ev.target.dataset.field === "emoji") s.emoji = ev.target.value;
        persist();
      }
    }
  });

  $("#settings-wrap").addEventListener("click", async (ev) => {
    const emojiBtn = ev.target.closest(".emoji-pick button");
    if (emojiBtn) {
      const pack = emojiBtn.closest(".emoji-pick");
      const id = pack.dataset.for;
      const t = settings.wantTiles.find((x) => x.id === id);
      const p = settings.family.find((x) => x.id === id);
      if (t) t.emoji = emojiBtn.dataset.emoji;
      if (p) p.emoji = emojiBtn.dataset.emoji;
      persist();
      renderEditWant();
      renderEditFamily();
      return;
    }
    if (ev.target.id === "add-want") {
      settings.wantTiles.push({ id: Store.uid(), label: "New", emoji: "⭐", theme: "want" });
      persist();
      renderEditWant();
      return;
    }
    const delWant = ev.target.closest("[data-del-want]");
    if (delWant) {
      settings.wantTiles = settings.wantTiles.filter((w) => w.id !== delWant.dataset.delWant);
      persist();
      renderEditWant();
      return;
    }
    const themeBtn = ev.target.closest("[data-theme-id]");
    if (themeBtn && window.RemyCustomize && RemyCustomize.canEdit()) {
      RemyCustomize.setTheme(themeBtn.dataset.themeId);
      renderLookPanel();
      renderHome();
      return;
    }
    const accentBtn = ev.target.closest("[data-accent]");
    if (accentBtn && window.RemyCustomize && RemyCustomize.canEdit()) {
      RemyCustomize.setAccent(accentBtn.dataset.accent || "");
      renderLookPanel();
      return;
    }
    const sizeBtn = ev.target.closest("[data-tile-size]");
    if (sizeBtn && window.RemyCustomize && RemyCustomize.canEdit()) {
      RemyCustomize.setTileSize(sizeBtn.dataset.tileSize);
      renderLookPanel();
      renderHome();
      return;
    }
    const vis = ev.target.closest("[data-home-vis]");
    if (vis && window.RemyCustomize && RemyCustomize.canEdit()) {
      const now = vis.getAttribute("aria-pressed") === "true";
      RemyCustomize.setHomeVisible(vis.dataset.homeVis, !now);
      renderLookPanel();
      renderHome();
      return;
    }
    const mover = ev.target.closest("[data-home-move]");
    if (mover && window.RemyCustomize && RemyCustomize.canEdit()) {
      RemyCustomize.moveHome(mover.dataset.homeMove, Number(mover.dataset.dir));
      renderLookPanel();
      renderHome();
      return;
    }
    if (ev.target.id === "ct-add" && window.RemyCustomize && RemyCustomize.canEdit()) {
      const label = (($("#ct-label") && $("#ct-label").value.trim()) || "Tile");
      RemyCustomize.addCustomTile({
        label,
        emoji: (($("#ct-emoji") && $("#ct-emoji").value.trim()) || "⭐"),
        action: ($("#ct-action") && $("#ct-action").value) || "speak",
        phrase: ($("#ct-phrase") && $("#ct-phrase").value.trim()) || label,
        screen: $("#ct-screen") && $("#ct-screen").value,
        trackId: $("#ct-track") && $("#ct-track").value,
        url: $("#ct-url") && $("#ct-url").value.trim()
      });
      toast("Custom tile added.");
      renderLookPanel();
      renderHome();
      return;
    }
    const delCust = ev.target.closest("[data-del-custom-tile]");
    if (delCust && window.RemyCustomize && RemyCustomize.canEdit()) {
      RemyCustomize.removeCustomTile(delCust.dataset.delCustomTile);
      renderLookPanel();
      renderHome();
      return;
    }
    const togC = ev.target.closest("[data-conn-toggle]");
    if (togC && window.RemyCustomize && RemyCustomize.canEdit()) {
      const cur = RemyCustomize.resolvedConnectors().find((c) => c.id === togC.dataset.connToggle);
      RemyCustomize.updateConnector(togC.dataset.connToggle, { enabled: !(cur && cur.enabled) });
      renderConnectorsPanel();
      renderLookPanel();
      renderWatch();
      renderHome();
      return;
    }
    if (ev.target.id === "cc-add" && window.RemyCustomize && RemyCustomize.canEdit()) {
      const label = (($("#cc-label") && $("#cc-label").value.trim()) || "");
      const url = (($("#cc-url") && $("#cc-url").value.trim()) || "");
      if (!label || !url) { toast("Add a name and a link."); return; }
      RemyCustomize.addCustomConnector({
        label,
        emoji: (($("#cc-emoji") && $("#cc-emoji").value.trim()) || "🔗"),
        url
      });
      toast("Connector added.");
      renderConnectorsPanel();
      renderLookPanel();
      return;
    }
    const delConn = ev.target.closest("[data-del-connector]");
    if (delConn && window.RemyCustomize && RemyCustomize.canEdit()) {
      RemyCustomize.removeConnector(delConn.dataset.delConnector);
      renderConnectorsPanel();
      renderLookPanel();
      renderWatch();
      renderHome();
      return;
    }
    if (ev.target.id === "add-person") {
      const name = prompt("Name");
      if (!name) return;
      settings.family.push({ id: Store.uid(), label: name.trim(), emoji: "💛", color: "#7ee0c6" });
      persist();
      renderEditFamily();
      return;
    }
    if (ev.target.id === "add-med") {
      settings.meds.push({ id: Store.uid(), label: "New label" });
      persist();
      renderEditMeds();
      return;
    }
    if (ev.target.id === "add-step") {
      settings.routine.push({ id: Store.uid(), label: "New step", emoji: "•", theme: "break" });
      persist();
      renderEditRoutine();
      return;
    }
    const delMed = ev.target.closest("[data-del-med]");
    if (delMed) {
      settings.meds = settings.meds.filter((m) => m.id !== delMed.dataset.delMed);
      persist();
      renderEditMeds();
      return;
    }
    const delStep = ev.target.closest("[data-del-step]");
    if (delStep) {
      settings.routine = settings.routine.filter((s) => s.id !== delStep.dataset.delStep);
      persist();
      renderEditRoutine();
      return;
    }
    const rec = ev.target.closest("[data-record]");
    if (rec) { await unlock(); startRecord(rec.dataset.record, false); return; }
    const play = ev.target.closest("[data-playvoice]");
    if (play) { await unlock(); playFamilyVoice(play.dataset.playvoice); return; }
    const from = ev.target.closest("[data-from]");
    if (from) { contribDraft.from = from.dataset.from; renderContribForm(); return; }
    const kind = ev.target.closest("[data-kind]");
    if (kind) { contribDraft.kind = kind.dataset.kind; renderContribForm(); return; }
    if (ev.target.id === "contrib-save") { await saveContrib(); return; }
    if (ev.target.id === "contrib-rec") { await unlock(); startRecord("contrib", true); return; }
    const shT = ev.target.closest("[data-shortcut-toggle]");
    if (shT) {
      settings.shortcuts = settings.shortcuts || {};
      const id = shT.dataset.shortcutToggle;
      settings.shortcuts[id] = settings.shortcuts[id] === false;
      persist();
      renderEditWatch();
      return;
    }
    if (ev.target.id === "watch-add") {
      const url = ($("#watch-url") && $("#watch-url").value) || "";
      const vid = parseYouTubeId(url);
      if (!vid) { toast("Paste a full YouTube link."); return; }
      const title = (($("#watch-title") && $("#watch-title").value.trim()) || "Video");
      Store.addVideo({ videoId: vid, title });
      toast("Video added for Remy.");
      renderEditWatch();
      return;
    }
    const delV = ev.target.closest("[data-del-video]");
    if (delV) { Store.deleteVideo(delV.dataset.delVideo); renderEditWatch(); return; }
    if (ev.target.id === "school-add") {
      const title = ($("#school-title") && $("#school-title").value.trim()) || "";
      if (!title) { toast("Add a task title."); return; }
      const stepsRaw = ($("#school-steps") && $("#school-steps").value) || "";
      const steps = stepsRaw.split("\n").map((l) => l.trim()).filter(Boolean).map((label) => ({ id: Store.uid(), label, done: false }));
      const rec = {
        title,
        emoji: ($("#school-emoji") && $("#school-emoji").value.trim()) || "📘",
        due: ($("#school-due") && $("#school-due").value) || "",
        note: ($("#school-note") && $("#school-note").value.trim()) || "",
        steps
      };
      const file = $("#school-file") && $("#school-file").files[0];
      if (file) {
        rec.imageId = Store.uid();
        await Store.putImage({ id: rec.imageId, blob: file, type: file.type });
      }
      Store.upsertSchool(rec);
      toast("School task saved.");
      renderEditSchool();
      return;
    }
    const delS = ev.target.closest("[data-del-school]");
    if (delS) { Store.deleteSchool(delS.dataset.delSchool); renderEditSchool(); return; }
    if (ev.target.id === "rem-add") {
      const phrase = ($("#rem-phrase") && $("#rem-phrase").value.trim()) || "";
      if (!phrase) { toast("Add a spoken phrase."); return; }
      const days = $$("#rem-days input[type=checkbox]:checked").map((c) => Number(c.dataset.day));
      const rec = {
        phrase,
        time: ($("#rem-time") && $("#rem-time").value) || "08:00",
        emoji: ($("#rem-emoji") && $("#rem-emoji").value.trim()) || "⏰",
        days: days.length ? days : [0,1,2,3,4,5,6]
      };
      const file = $("#rem-file") && $("#rem-file").files[0];
      if (file) {
        rec.imageId = Store.uid();
        await Store.putImage({ id: rec.imageId, blob: file, type: file.type });
      }
      Store.upsertReminder(rec);
      toast("Reminder saved.");
      renderEditReminders();
      return;
    }
    const delR = ev.target.closest("[data-del-reminder]");
    if (delR) { Store.deleteReminder(delR.dataset.delReminder); renderEditReminders(); return; }
    if (ev.target.id === "rem-notify") {
      if (!("Notification" in window)) { toast("This browser does not support banners."); return; }
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        settings.notifyReminders = perm === "granted";
      } else {
        settings.notifyReminders = !settings.notifyReminders;
      }
      persist();
      renderEditReminders();
      return;
    }
    if (ev.target.id === "wall-add") {
      const person = settings.family.find((p) => p.id === contribDraft.from) || settings.family[0];
      const caption = ($("#wall-caption") && $("#wall-caption").value.trim()) || "";
      const file = $("#wall-file") && $("#wall-file").files[0];
      if (!file) { toast("Choose a photo first."); return; }
      const mediaId = Store.uid();
      await Store.putImage({ id: mediaId, blob: file, type: file.type });
      Store.addWallPost({
        caption: caption || "Photo",
        mediaId,
        from: person && person.id,
        fromLabel: person && person.label,
        emoji: "📷"
      });
      toast("Posted to the wall.");
      renderEditWall();
      return;
    }
    const delW = ev.target.closest("[data-del-wall]");
    if (delW) {
      const post = Store.loadWall().find((x) => x.id === delW.dataset.delWall);
      if (post && post.mediaId) { try { await Store.deleteImage(post.mediaId); } catch (_) {} }
      Store.deleteWallPost(delW.dataset.delWall);
      renderEditWall();
      return;
    }
    const delC = ev.target.closest("[data-del-contrib]");
    if (delC) {
      const c = Store.loadContrib().find((x) => x.id === delC.dataset.delContrib);
      if (c && c.mediaId) {
        try { await Store.deleteVoice(c.mediaId); } catch (_) {}
        try { await Store.deleteImage(c.mediaId); } catch (_) {}
      }
      Store.deleteContrib(delC.dataset.delContrib);
      renderContribList();
      return;
    }
  });

  $("#settings-wrap").addEventListener("change", async (ev) => {
    if (window.RemyCustomize && RemyCustomize.canEdit()) {
      const t = ev.target;
      if (t.dataset.connUrl != null) {
        RemyCustomize.updateConnector(t.dataset.connUrl, { url: t.value.trim() });
      } else if (t.dataset.connHome != null) {
        RemyCustomize.updateConnector(t.dataset.connHome, { showOnHome: t.value === "yes" });
        renderLookPanel();
        renderHome();
      } else if (t.dataset.connLimit != null) {
        const n = parseInt(t.value, 10);
        RemyCustomize.updateConnector(t.dataset.connLimit, { dailyLimitMin: n > 0 ? n : null });
      } else if (t.dataset.connStart != null) {
        RemyCustomize.updateConnector(t.dataset.connStart, { hoursStart: t.value });
      } else if (t.dataset.connEnd != null) {
        RemyCustomize.updateConnector(t.dataset.connEnd, { hoursEnd: t.value });
      }
    }
    if (ev.target.dataset.field === "image") {
      const card = ev.target.closest("[data-want]");
      const file = ev.target.files && ev.target.files[0];
      if (!card || !file) return;
      const t = settings.wantTiles.find((x) => x.id === card.dataset.want);
      if (!t) return;
      const id = t.imageId || ("want-" + t.id);
      await Store.putImage({ id, blob: file, type: file.type });
      t.imageId = id;
      if (imageUrls.has(id)) {
        URL.revokeObjectURL(imageUrls.get(id));
        imageUrls.delete(id);
      }
      persist();
      toast("Picture saved on this device.");
    }
  });


  document.addEventListener("click", async (ev) => {
    if (ev.target.closest("#connector-block-ok") || ev.target.id === "connector-block") {
      const ov = $("#connector-block");
      if (ov) ov.classList.add("hidden");
      return;
    }
    if (ev.target.closest("#player-close") || ev.target.closest("#player-done")) {
      closePlayer();
      return;
    }
    if (ev.target.closest("#reminder-done")) {
      await unlock();
      closeReminder(true);
      AudioEngine.success();
      return;
    }
    const react = ev.target.closest("[data-react]");
    if (react) {
      await unlock();
      press(react);
      Store.addWallReaction(react.dataset.react, react.dataset.emoji);
      AudioEngine.tap();
      renderWall();
      return;
    }
    const tstep = ev.target.closest("[data-task-step]");
    if (tstep) {
      await unlock();
      press(tstep);
      const res = Store.toggleSchoolStep(tstep.dataset.taskStep, tstep.dataset.step);
      if (res && res.step.done) AudioEngine.success();
      else AudioEngine.tap();
      if (res && res.justFinished) {
        Store.logActivity({ type: "school-done", key: res.task.id, label: res.task.title, emoji: res.task.emoji || "📘" });
        AudioEngine.speak(res.task.title || "All done");
        showReward();
      } else if (res && res.step.done) {
        Store.logActivity({ type: "school", key: res.task.id, label: res.step.label, emoji: res.task.emoji || "📘" });
      }
      renderSchoolTask();
      return;
    }
    const finish = ev.target.closest("[data-finish-task]");
    if (finish) {
      await unlock();
      const task = Store.loadSchool().find((t) => t.id === finish.dataset.finishTask);
      if (task) {
        Store.logActivity({ type: "school-done", key: task.id, label: task.title, emoji: task.emoji || "📘" });
        AudioEngine.speak(task.title || "All done");
        showReward();
        finish.classList.add("done");
      }
      return;
    }
  });


  document.addEventListener("click", async (ev) => {
    const make = ev.target.closest("[data-make-invite]");
    if (make) {
      ev.preventDefault();
      const role = make.getAttribute("data-make-invite");
      make.disabled = true;
      try {
        const code = await RemyAuth.createInvite(role, 14, 1);
        const box = $("#fresh-invite");
        if (box) {
          box.innerHTML = `<div class="invite-code-box"><div class="sub">Share this code now. It will not be shown again.</div><strong>${escapeHtml(code)}</strong><button type="button" class="secondary" id="copy-invite">Copy code</button></div>`;
          const copy = $("#copy-invite");
          if (copy) copy.addEventListener("click", async () => {
            try { await navigator.clipboard.writeText(code); toast("Copied"); } catch { /* ignore */ }
          });
        }
        await renderInviteList();
      } catch (err) {
        toast(err.message || "Could not create a code");
      } finally {
        make.disabled = false;
      }
      return;
    }
    const revoke = ev.target.closest("[data-revoke-invite]");
    if (revoke) {
      ev.preventDefault();
      try {
        await RemyAuth.revokeInvite(revoke.getAttribute("data-revoke-invite"));
        await renderInviteList();
      } catch (err) {
        toast(err.message || "Could not revoke");
      }
      return;
    }
    if (ev.target.closest("#sign-out")) {
      ev.preventDefault();
      if (RemyAuth.isDevice()) return;
      await RemyAuth.signOut();
      return;
    }
    if (ev.target.closest("#enable-push")) {
      ev.preventDefault();
      try {
        await RemyPush.enable();
        toast("Notifications are on");
        updatePushStatus();
      } catch (err) {
        toast(err.message || "Could not enable notifications");
        updatePushStatus();
      }
    }
  });

  /* parent gate */
  const gate = $("#parent-gate");
  let holdTimer = 0;
  function startHold() {
    gate.classList.add("holding");
    $("#hold-progress").classList.add("show");
    holdTimer = setTimeout(async () => {
      gate.classList.remove("holding");
      $("#hold-progress").classList.remove("show");
      await unlock();
      go("settings");
    }, 2000);
  }
  function endHold() {
    clearTimeout(holdTimer);
    gate.classList.remove("holding");
    $("#hold-progress").classList.remove("show");
  }
  gate.addEventListener("pointerdown", (ev) => { ev.preventDefault(); startHold(); });
  gate.addEventListener("pointerup", endHold);
  gate.addEventListener("pointerleave", endHold);
  gate.addEventListener("pointercancel", endHold);

  /* week day click to filter timeline */
  document.addEventListener("click", (ev) => {
    const day = ev.target.closest(".week-day");
    if (!day || currentScreen() !== "day") return;
    $("#day-sub").textContent = formatDay(day.dataset.day) + " · shared with family";
    renderTimeline(day.dataset.day);
  });

  /* service worker — only on http/https, never file:// */
  if ("serviceWorker" in navigator && location.protocol !== "file:" && !window.__REMY_NO_SW__) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  applyMotionPref();
  AudioEngine.setVolume(settings.volume);
  AudioEngine.setTempo(settings.tempo);
  AudioEngine.setChipmunk(settings.chipmunk);
  renderHome();
  tickReminders();
  reminderTimer = setInterval(tickReminders, 5000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tickReminders(); });

  // Expose a tiny test hook for Playwright
  window.__REMY__ = {
    go,
    back,
    settings,
    currentScreen,
    unlock,
    showReminder,
    closeReminder,
    closePlayer,
    parseYouTubeId,
    tickReminders,
    reloadSettings,
    rerender,
    refreshMedia,
    renderFamilySync
  };

  async function afterAuth(session) {
    if (window.RemyCustomize) await RemyCustomize.start();
    if (session) {
      document.body.classList.remove("auth-locked");
      if (window.RemySync) await RemySync.start();
      if (window.RemyPush) RemyPush.start();
      rerender();
    } else {
      if (window.RemySync) RemySync.stop();
      document.body.classList.add("auth-locked");
    }
  }

  if (window.RemyAuth) {
    RemyAuth.onReady(afterAuth);
    RemyAuth.init().then((session) => afterAuth(session)).catch(() => {
      document.body.classList.add("auth-locked");
    });
  } else {
    document.body.classList.remove("auth-locked");
  }
})();
