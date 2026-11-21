/* Local persistence: settings, logs, and media stay on this device and sync when signed in. */
const Store = (() => {
  const SETTINGS_KEY = "remy-music-room-settings";
  const LOG_KEY = "remy-music-room-choices";
  const EVENTS_KEY = "remy-music-room-events";
  const CONTRIB_KEY = "remy-music-room-contrib";
  const ROUTINE_DONE_KEY = "remy-music-room-routine-done";
  const VIDEOS_KEY = "remy-music-room-videos";
  const SCHOOL_KEY = "remy-music-room-school";
  const REMINDERS_KEY = "remy-music-room-reminders";
  const WALL_KEY = "remy-music-room-wall";
  const REMINDER_STATE_KEY = "remy-music-room-reminder-state";
  const DB_NAME = "remy-music-room";
  const DB_VERSION = 1;

  const DEFAULT_SETTINGS = {
    volume: 0.8,
    tempo: 1,
    tempoMin: 0.8,
    tempoMax: 1.6,
    chipmunk: false,
    reduceMotion: false,
    wantTiles: [
      { id: "pizza", label: "Pizza", emoji: "🍕", theme: "pizza" },
      { id: "car", label: "Car ride", emoji: "🚗", theme: "car" },
      { id: "music", label: "Music", emoji: "🎵", theme: "music-want" },
      { id: "drink", label: "Drink", emoji: "🥤", theme: "drink" },
      { id: "break", label: "Break", emoji: "⏸️", theme: "break" },
      { id: "bathroom", label: "Bathroom", emoji: "🚻", theme: "bathroom" },
      { id: "hug", label: "Hug", emoji: "💛", theme: "hug" },
      { id: "done", label: "All done", emoji: "✓", theme: "done" }
    ],
    family: [
      { id: "dad", label: "Dad", emoji: "🧢", color: "#8b6cff" },
      { id: "julie", label: "Julie", emoji: "🌷", color: "#ff6b8a" },
      { id: "nava", label: "Nava", emoji: "⭐", color: "#2ec4b6" },
      { id: "izzy", label: "Izzy", emoji: "⚡", color: "#ff9f43" }
    ],
    meds: [
      { id: "morning", label: "Morning" },
      { id: "evening", label: "Evening" }
    ],
    routine: [
      { id: "morning", label: "Morning", emoji: "🌅", theme: "want" },
      { id: "breakfast", label: "Breakfast", emoji: "🍳", theme: "pizza" },
      { id: "ready", label: "Get ready", emoji: "👕", theme: "car" },
      { id: "music", label: "Music", emoji: "🎵", theme: "music-want" },
      { id: "lunch", label: "Lunch", emoji: "🍽️", theme: "drink" },
      { id: "break", label: "Break", emoji: "⏸️", theme: "break" },
      { id: "dinner", label: "Dinner", emoji: "🍝", theme: "hug" },
      { id: "wind", label: "Wind down", emoji: "🌙", theme: "hum" }
    ],
    shortcuts: { netflix: true, youtubekids: true, disney: true },
    notifyReminders: false
  };

  function uid() {
    return (crypto.randomUUID && crypto.randomUUID()) || ("id-" + Date.now() + "-" + Math.random().toString(16).slice(2));
  }

  function dayKey(ts) {
    const d = new Date(ts == null ? Date.now() : ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  const KEY_COLLECTION = {
    [SETTINGS_KEY]: "settings",
    [LOG_KEY]: "choices",
    [EVENTS_KEY]: "events",
    [CONTRIB_KEY]: "contrib",
    [ROUTINE_DONE_KEY]: "routine",
    [VIDEOS_KEY]: "videos",
    [SCHOOL_KEY]: "school",
    [REMINDERS_KEY]: "reminders",
    [WALL_KEY]: "wall",
    [REMINDER_STATE_KEY]: "reminder_state"
  };

  function emitChange(collection, record, action) {
    if (window.__REMY_SYNC_SILENT) return;
    try {
      if (window.RemySync && typeof window.RemySync.onLocalChange === "function") {
        window.RemySync.onLocalChange(collection, record, action || "upsert");
      }
    } catch { /* ignore */ }
  }

  function touch(rec) {
    if (rec && typeof rec === "object") rec.updatedAt = Date.now();
    return rec;
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function mergeById(defaults, saved) {
    if (!Array.isArray(saved) || saved.length < 1) return structuredClone(defaults);
    const savedMap = new Map(saved.map((x) => [x.id, x]));
    const used = new Set();
    const out = defaults.map((def) => {
      const found = savedMap.get(def.id);
      used.add(def.id);
      return found ? { ...def, ...found } : def;
    });
    saved.forEach((item) => {
      if (!used.has(item.id)) out.push(item);
    });
    return out;
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return structuredClone(DEFAULT_SETTINGS);
      const parsed = JSON.parse(raw);
      const merged = { ...structuredClone(DEFAULT_SETTINGS), ...parsed };
      merged.wantTiles = mergeById(DEFAULT_SETTINGS.wantTiles, parsed.wantTiles);
      merged.family = Array.isArray(parsed.family) && parsed.family.length
        ? parsed.family
        : structuredClone(DEFAULT_SETTINGS.family);
      merged.meds = Array.isArray(parsed.meds)
        ? parsed.meds
        : structuredClone(DEFAULT_SETTINGS.meds);
      merged.routine = Array.isArray(parsed.routine) && parsed.routine.length
        ? parsed.routine
        : structuredClone(DEFAULT_SETTINGS.routine);
      merged.shortcuts = { ...structuredClone(DEFAULT_SETTINGS.shortcuts), ...(parsed.shortcuts || {}) };
      return merged;
    } catch {
      return structuredClone(DEFAULT_SETTINGS);
    }
  }

  function saveSettings(settings) {
    saveJson(SETTINGS_KEY, settings);
    emitChange("settings", settings, "upsert");
  }

  function loadLog() {
    return loadJson(LOG_KEY, []);
  }

  function saveLog(items) {
    saveList(LOG_KEY, items);
  }

  function loadEvents() {
    return loadJson(EVENTS_KEY, []);
  }

  function saveEvents(items) {
    saveJson(EVENTS_KEY, items.slice(0, 2000));
  }

  function logActivity(entry) {
    const items = loadEvents();
    const rec = {
      id: entry.id || uid(),
      type: entry.type,
      key: entry.key || "",
      label: entry.label || "",
      detail: entry.detail || "",
      emoji: entry.emoji || "",
      who: entry.who || "",
      whoLabel: entry.whoLabel || "",
      meta: entry.meta || {},
      ts: entry.ts || Date.now(),
      day: dayKey(entry.ts || Date.now())
    };
    items.unshift(rec);
    saveEvents(items);
    if (rec.type === "choice") {
      const log = loadLog();
      log.unshift({ id: rec.id, key: rec.key, label: rec.label, ts: rec.ts });
      saveLog(log.slice(0, 500));
    }
    return rec;
  }

  function addChoice(entry) {
    return logActivity({
      type: "choice",
      key: entry.key,
      label: entry.label,
      emoji: entry.emoji,
      ts: entry.ts
    });
  }

  function clearLog() {
    saveLog([]);
    const kept = loadEvents().filter((e) => e.type !== "choice");
    saveEvents(kept);
  }

  function eventsForDay(day) {
    const key = day || dayKey();
    return loadEvents().filter((e) => e.day === key);
  }

  function eventsForWeek(endTs) {
    const end = endTs ? new Date(endTs) : new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      d.setHours(12, 0, 0, 0);
      days.push(dayKey(d.getTime()));
    }
    const all = loadEvents();
    return days.map((day) => ({
      day,
      events: all.filter((e) => e.day === day)
    }));
  }

  function loadContrib() {
    return loadJson(CONTRIB_KEY, []);
  }

  function saveContrib(items) {
    saveList(CONTRIB_KEY, items);
  }

  function addContrib(entry) {
    const items = loadContrib();
    const rec = {
      id: entry.id || uid(),
      kind: entry.kind,
      from: entry.from,
      fromLabel: entry.fromLabel,
      title: entry.title || "",
      detail: entry.detail || "",
      emoji: entry.emoji || "",
      trackId: entry.trackId || "",
      mediaId: entry.mediaId || "",
      ts: entry.ts || Date.now()
    };
    items.unshift(rec);
    saveContrib(items);
    logActivity({
      type: "contribution",
      key: rec.kind,
      label: rec.title || rec.kind,
      detail: rec.fromLabel ? "From " + rec.fromLabel : "",
      who: rec.from,
      whoLabel: rec.fromLabel,
      emoji: rec.emoji,
      meta: { contribId: rec.id, kind: rec.kind }
    });
    return rec;
  }

  function deleteContrib(id) {
    saveContrib(loadContrib().filter((c) => c.id !== id));
  }


  function loadList(key) { return loadJson(key, []); }
  function saveList(key, items) {
    const prev = loadList(key);
    const next = Array.isArray(items) ? items : [];
    saveJson(key, next);
    const col = KEY_COLLECTION[key];
    if (!col) return;
    const nextIds = new Set(next.map((x) => x && x.id).filter(Boolean));
    next.forEach((row) => { if (row && row.id) emitChange(col, touch(row), "upsert"); });
    prev.forEach((row) => { if (row && row.id && !nextIds.has(row.id)) emitChange(col, row, "delete"); });
  }

  function loadVideos() { return loadList(VIDEOS_KEY); }
  function saveVideos(items) { saveList(VIDEOS_KEY, items); }
  function addVideo(entry) {
    const items = loadVideos();
    const rec = {
      id: entry.id || uid(),
      videoId: entry.videoId,
      title: entry.title || "Video",
      ts: entry.ts || Date.now()
    };
    items.unshift(rec);
    saveVideos(items);
    return rec;
  }
  function deleteVideo(id) { saveVideos(loadVideos().filter((v) => v.id !== id)); }

  function loadSchool() { return loadList(SCHOOL_KEY); }
  function saveSchool(items) { saveList(SCHOOL_KEY, items); }
  function upsertSchool(task) {
    const items = loadSchool();
    const rec = {
      id: task.id || uid(),
      title: task.title || "Task",
      emoji: task.emoji || "📘",
      imageId: task.imageId || "",
      due: task.due || "",
      note: task.note || "",
      steps: Array.isArray(task.steps) ? task.steps : [],
      ts: task.ts || Date.now()
    };
    const i = items.findIndex((t) => t.id === rec.id);
    if (i >= 0) items[i] = rec;
    else items.unshift(rec);
    saveSchool(items);
    return rec;
  }
  function deleteSchool(id) { saveSchool(loadSchool().filter((t) => t.id !== id)); }
  function toggleSchoolStep(taskId, stepId) {
    const items = loadSchool();
    const task = items.find((t) => t.id === taskId);
    if (!task) return null;
    const step = (task.steps || []).find((s) => s.id === stepId);
    if (!step) return null;
    const wasAll = (task.steps || []).length > 0 && task.steps.every((s) => s.done);
    step.done = !step.done;
    saveSchool(items);
    const allDone = (task.steps || []).length > 0 && task.steps.every((s) => s.done);
    return { task, step, allDone, justFinished: allDone && !wasAll };
  }

  function loadReminders() { return loadList(REMINDERS_KEY); }
  function saveReminders(items) { saveList(REMINDERS_KEY, items); }
  function upsertReminder(entry) {
    const items = loadReminders();
    const rec = {
      id: entry.id || uid(),
      phrase: entry.phrase || "Reminder",
      time: entry.time || "08:00",
      days: Array.isArray(entry.days) ? entry.days : [0, 1, 2, 3, 4, 5, 6],
      emoji: entry.emoji || "⏰",
      imageId: entry.imageId || "",
      enabled: entry.enabled !== false,
      ts: entry.ts || Date.now()
    };
    const i = items.findIndex((t) => t.id === rec.id);
    if (i >= 0) items[i] = rec;
    else items.unshift(rec);
    saveReminders(items);
    return rec;
  }
  function deleteReminder(id) { saveReminders(loadReminders().filter((t) => t.id !== id)); }
  function loadReminderState() { return loadJson(REMINDER_STATE_KEY, {}); }
  function saveReminderState(obj) {
    saveJson(REMINDER_STATE_KEY, obj);
    emitChange("reminder_state", obj, "upsert");
  }
  function reminderMark(day, id, patch) {
    const all = loadReminderState();
    const key = (day || dayKey()) + ":" + id;
    all[key] = { ...(all[key] || {}), ...patch };
    saveReminderState(all);
    return all[key];
  }
  function reminderStatus(day, id) {
    const all = loadReminderState();
    return all[(day || dayKey()) + ":" + id] || {};
  }

  function loadWall() { return loadList(WALL_KEY); }
  function saveWall(items) { saveList(WALL_KEY, items); }
  function addWallPost(entry) {
    const items = loadWall();
    const rec = {
      id: entry.id || uid(),
      caption: entry.caption || "",
      mediaId: entry.mediaId || "",
      from: entry.from || "",
      fromLabel: entry.fromLabel || "",
      emoji: entry.emoji || "",
      reactions: entry.reactions || {},
      ts: entry.ts || Date.now()
    };
    items.unshift(rec);
    saveWall(items);
    logActivity({
      type: "wall",
      key: rec.id,
      label: rec.caption || "A photo",
      detail: rec.fromLabel ? "From " + rec.fromLabel : "",
      who: rec.from,
      whoLabel: rec.fromLabel,
      emoji: rec.emoji || "📷"
    });
    return rec;
  }
  function deleteWallPost(id) { saveWall(loadWall().filter((p) => p.id !== id)); }
  function addWallReaction(postId, emoji) {
    const items = loadWall();
    const post = items.find((p) => p.id === postId);
    if (!post) return null;
    post.reactions = post.reactions || {};
    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    saveWall(items);
    logActivity({
      type: "reaction",
      key: postId,
      label: emoji,
      detail: post.caption ? "On “" + post.caption + "”" : "On a family photo",
      who: post.from,
      whoLabel: post.fromLabel,
      emoji
    });
    return post;
  }

  function loadRoutineDone() {
    return loadJson(ROUTINE_DONE_KEY, {});
  }

  function toggleRoutine(stepId, ts) {
    const day = dayKey(ts);
    const all = loadRoutineDone();
    const list = new Set(all[day] || []);
    const nowDone = !list.has(stepId);
    if (nowDone) list.add(stepId);
    else list.delete(stepId);
    all[day] = Array.from(list);
    saveJson(ROUTINE_DONE_KEY, all);
    emitChange("routine", all, "upsert");
    return nowDone;
  }

  function routineDoneFor(day) {
    const all = loadRoutineDone();
    return new Set(all[day || dayKey()] || []);
  }

  let dbPromise = null;
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains("voices")) {
          database.createObjectStore("voices", { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains("images")) {
          database.createObjectStore("images", { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function idbGet(store, id) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, "readonly");
      const req = tx.objectStore(store).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbPut(store, value) {
    const database = await db();
    await new Promise((resolve, reject) => {
      const tx = database.transaction(store, "readwrite");
      tx.objectStore(store).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    emitChange(store, value, "upsert");
  }

  async function idbDelete(store, id) {
    const database = await db();
    await new Promise((resolve, reject) => {
      const tx = database.transaction(store, "readwrite");
      tx.objectStore(store).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    emitChange(store, { id }, "delete");
  }

  async function idbGetAll(store) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, "readonly");
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  return {
    DEFAULT_SETTINGS,
    uid,
    dayKey,
    loadSettings,
    saveSettings,
    loadLog,
    addChoice,
    clearLog,
    logActivity,
    loadEvents,
    eventsForDay,
    eventsForWeek,
    loadContrib,
    addContrib,
    deleteContrib,
    loadVideos,
    saveVideos,
    addVideo,
    deleteVideo,
    loadSchool,
    saveSchool,
    upsertSchool,
    deleteSchool,
    toggleSchoolStep,
    loadReminders,
    saveReminders,
    upsertReminder,
    deleteReminder,
    reminderMark,
    reminderStatus,
    loadWall,
    addWallPost,
    deleteWallPost,
    addWallReaction,
    toggleRoutine,
    routineDoneFor,
    getVoice: (id) => idbGet("voices", id),
    putVoice: (rec) => idbPut("voices", rec),
    deleteVoice: (id) => idbDelete("voices", id),
    allVoices: () => idbGetAll("voices"),
    allImages: () => idbGetAll("images"),
    getImage: (id) => idbGet("images", id),
    putImage: (rec) => idbPut("images", rec),
    deleteImage: (id) => idbDelete("images", id)
  };
})();
window.Store = Store;
