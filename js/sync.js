/* Offline-first family sync. Local Store is the working copy; changes queue and flush when online. */
const RemySync = (() => {
  const DOC_COLLECTIONS = new Set(["settings", "reminder_state", "routine"]);
  const LIST_COLLECTIONS = ["choices", "events", "contrib", "videos", "school", "reminders", "wall"];
  const MEDIA_COLLECTIONS = ["images", "voices"];
  const BUCKET = "family-media";

  let started = false;
  let pushing = false;
  let lastPull = null;
  let pending = new Map();
  let status = "idle";
  let channel = null;
  let notifyTimer = 0;
  const pendingNotify = new Set();

  const KEYS = {
    settings: "remy-music-room-settings",
    choices: "remy-music-room-choices",
    events: "remy-music-room-events",
    contrib: "remy-music-room-contrib",
    routine: "remy-music-room-routine-done",
    videos: "remy-music-room-videos",
    school: "remy-music-room-school",
    reminders: "remy-music-room-reminders",
    wall: "remy-music-room-wall",
    reminder_state: "remy-music-room-reminder-state",
    lastPull: "remy-music-room-last-pull"
  };

  function client() {
    return RemyAuth.supabase();
  }

  function familyId() {
    return RemyAuth.familyId();
  }

  function userId() {
    const u = RemyAuth.user();
    return u ? u.id : null;
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  // One document per family/collection; id must be a uuid column.
  function docId(collection) {
    return familyId();
  }

  function setStatus(next) {
    status = next;
    const el = document.getElementById("sync-pill");
    if (!el) return;
    const labels = {
      idle: "On all devices",
      pending: "Saved here — waiting to sync",
      syncing: "Syncing…",
      offline: "Saved on this device",
      error: "Couldn't sync just now",
      local: "On this device"
    };
    el.textContent = labels[next] || labels.idle;
    el.dataset.state = next;
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

  function saveJsonSilent(key, value) {
    const prev = window.__REMY_SYNC_SILENT;
    window.__REMY_SYNC_SILENT = true;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } finally {
      window.__REMY_SYNC_SILENT = prev;
    }
  }

  function queue(collection, id, action, data) {
    const key = collection + ":" + id;
    pending.set(key, {
      collection,
      id,
      action: action || "upsert",
      data: data == null ? {} : data,
      client_updated_at: new Date().toISOString()
    });
    try {
      const serial = [];
      pending.forEach((v) => serial.push(v));
      localStorage.setItem("remy-music-room-outbox", JSON.stringify(serial));
    } catch { /* ignore */ }
    if (!navigator.onLine) setStatus("offline");
    else setStatus("pending");
    scheduleFlush();
  }

  function restoreOutbox() {
    const rows = loadJson("remy-music-room-outbox", []);
    if (!Array.isArray(rows)) return;
    rows.forEach((row) => {
      if (!row || !row.collection || !row.id) return;
      if (DOC_COLLECTIONS.has(row.collection) && !isUuid(row.id)) row.id = familyId() || row.id;
      pending.set(row.collection + ":" + row.id, row);
    });
  }

  let flushTimer = 0;
  function scheduleFlush() {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => { flush().catch(() => {}); }, 400);
  }

  function snapshotCollection(collection) {
    if (collection === "settings") return Store.loadSettings();
    if (collection === "choices") return Store.loadLog();
    if (collection === "events") return Store.loadEvents();
    if (collection === "contrib") return Store.loadContrib();
    if (collection === "videos") return Store.loadVideos();
    if (collection === "school") return Store.loadSchool();
    if (collection === "reminders") return Store.loadReminders();
    if (collection === "wall") return Store.loadWall();
    if (collection === "reminder_state") return loadJson(KEYS.reminder_state, {});
    if (collection === "routine") return loadJson(KEYS.routine, {});
    return null;
  }

  function applyDocument(collection, data) {
    if (collection === "settings" && data) {
      saveJsonSilent(KEYS.settings, data);
      if (window.__REMY__ && window.__REMY__.reloadSettings) window.__REMY__.reloadSettings();
    } else if (collection === "reminder_state") {
      saveJsonSilent(KEYS.reminder_state, data || {});
    } else if (collection === "routine") {
      saveJsonSilent(KEYS.routine, data || {});
    }
  }

  function applyListItem(collection, record, deleted) {
    const loaders = {
      choices: [() => Store.loadLog(), KEYS.choices],
      events: [() => Store.loadEvents(), KEYS.events],
      contrib: [() => Store.loadContrib(), KEYS.contrib],
      videos: [() => Store.loadVideos(), KEYS.videos],
      school: [() => Store.loadSchool(), KEYS.school],
      reminders: [() => Store.loadReminders(), KEYS.reminders],
      wall: [() => Store.loadWall(), KEYS.wall]
    };
    const pair = loaders[collection];
    if (!pair) return;
    const items = pair[0]() || [];
    const next = items.filter((x) => x.id !== record.id);
    if (!deleted) next.push(record);
    next.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    saveJsonSilent(pair[1], next);
  }

  async function uploadMedia(collection, rec) {
    if (!rec || !rec.id || !rec.blob) return rec;
    const sb = client();
    const fid = familyId();
    const path = fid + "/" + collection + "/" + rec.id;
    const type = rec.type || rec.blob.type || "application/octet-stream";
    const { error } = await sb.storage.from(BUCKET).upload(path, rec.blob, {
      upsert: true,
      contentType: type
    });
    if (error) throw error;
    return { id: rec.id, type, path, created: rec.created || Date.now() };
  }

  async function downloadMedia(collection, meta) {
    if (!meta || !meta.id) return;
    const existing = collection === "images" ? await Store.getImage(meta.id) : await Store.getVoice(meta.id);
    if (existing && existing.blob) return;
    const path = meta.path || (familyId() + "/" + collection + "/" + meta.id);
    const { data, error } = await client().storage.from(BUCKET).download(path);
    if (error || !data) return;
    const rec = { id: meta.id, blob: data, type: meta.type || data.type, created: meta.created || Date.now() };
    window.__REMY_SYNC_SILENT = true;
    try {
      if (collection === "images") await Store.putImage(rec);
      else await Store.putVoice(rec);
    } finally {
      window.__REMY_SYNC_SILENT = false;
    }
    if (window.__REMY__ && window.__REMY__.refreshMedia) window.__REMY__.refreshMedia(meta.id);
  }

  async function flush() {
    if (pushing || !started) return;
    const sb = client();
    const fid = familyId();
    const uid = userId();
    if (!sb || !fid || !uid) return;
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }
    if (!pending.size) {
      setStatus("idle");
      return;
    }
    pushing = true;
    setStatus("syncing");
    try {
      const jobs = Array.from(pending.values());
      for (const job of jobs) {
        let data = job.data;
        if (MEDIA_COLLECTIONS.includes(job.collection) && job.action !== "delete") {
          const rec = job.collection === "images"
            ? await Store.getImage(job.id)
            : await Store.getVoice(job.id);
          if (rec && rec.blob) data = await uploadMedia(job.collection, rec);
        }
        const row = {
          id: job.id,
          family_id: fid,
          collection: job.collection,
          data: data || {},
          created_by: uid,
          client_updated_at: job.client_updated_at,
          deleted_at: job.action === "delete" ? job.client_updated_at : null
        };
        const { error } = await sb.from("sync_records").upsert(row, {
          onConflict: "family_id,collection,id"
        });
        if (error) throw error;
        pending.delete(job.collection + ":" + job.id);
        if (job.action !== "delete" && ["wall", "reminders", "school", "events", "choices"].includes(job.collection)) {
          pendingNotify.add(job.collection);
        }
      }
      const serial = [];
      pending.forEach((v) => serial.push(v));
      localStorage.setItem("remy-music-room-outbox", JSON.stringify(serial));
      setStatus(pending.size ? "pending" : "idle");
      scheduleNotify();
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    } finally {
      pushing = false;
      if (pending.size && navigator.onLine) scheduleFlush();
    }
  }

  function scheduleNotify() {
    if (!pendingNotify.size) return;
    clearTimeout(notifyTimer);
    notifyTimer = setTimeout(() => {
      const kinds = Array.from(pendingNotify);
      pendingNotify.clear();
      if (window.RemyPush && RemyPush.notifyFamily) {
        const labels = {
          wall: ["A new photo", "A family photo was shared"],
          reminders: ["A reminder was added", "A new reminder is waiting"],
          school: ["School update", "A school task changed"],
          events: ["Remy's day", "Something new was logged"],
          choices: ["Remy said something", "A new choice was logged"]
        };
        const first = kinds[0];
        const pair = labels[first] || ["Remy's Music Room", "Something new for Remy"];
        RemyPush.notifyFamily(pair[0], pair[1], first).catch(() => {});
      }
    }, 1500);
  }

  function remoteWins(localUpdated, remoteUpdated) {
    const l = Date.parse(localUpdated || 0) || 0;
    const r = Date.parse(remoteUpdated || 0) || 0;
    return r > l;
  }

  function recordUpdatedAt(rec) {
    if (!rec || typeof rec !== "object") return 0;
    return rec.updatedAt || rec.ts || rec.created || 0;
  }

  async function pull() {
    const sb = client();
    const fid = familyId();
    if (!sb || !fid) return;
    const since = lastPull || loadJson(KEYS.lastPull, null);
    let query = sb.from("sync_records").select("id, collection, data, client_updated_at, updated_at, deleted_at, created_by")
      .eq("family_id", fid);
    if (since) query = query.gt("updated_at", since);
    const { data, error } = await query.order("updated_at", { ascending: true });
    if (error) throw error;
    const rows = data || [];
    let maxUpdated = since;
    for (const row of rows) {
      if (!maxUpdated || row.updated_at > maxUpdated) maxUpdated = row.updated_at;
      const outboxKey = row.collection + ":" + row.id;
      const queued = pending.get(outboxKey);
      if (queued && !remoteWins(queued.client_updated_at, row.client_updated_at)) continue;

      if (DOC_COLLECTIONS.has(row.collection)) {
        if (row.deleted_at) continue;
        applyDocument(row.collection, row.data);
      } else if (LIST_COLLECTIONS.includes(row.collection)) {
        const local = snapshotCollection(row.collection) || [];
        const existing = Array.isArray(local) ? local.find((x) => x.id === row.id) : null;
        if (existing && !remoteWins(new Date(recordUpdatedAt(existing)).toISOString(), row.client_updated_at)) continue;
        applyListItem(row.collection, row.data && row.data.id ? row.data : { id: row.id, ...(row.data || {}) }, !!row.deleted_at);
      } else if (MEDIA_COLLECTIONS.includes(row.collection)) {
        if (row.deleted_at) {
          window.__REMY_SYNC_SILENT = true;
          try {
            if (row.collection === "images") await Store.deleteImage(row.id);
            else await Store.deleteVoice(row.id);
          } finally {
            window.__REMY_SYNC_SILENT = false;
          }
        } else {
          await downloadMedia(row.collection, { id: row.id, ...(row.data || {}) });
        }
      }
    }
    if (maxUpdated) {
      lastPull = maxUpdated;
      localStorage.setItem(KEYS.lastPull, JSON.stringify(maxUpdated));
    }
    if (window.__REMY__ && window.__REMY__.rerender) window.__REMY__.rerender();
  }

  async function seedIfRemoteEmpty() {
    const sb = client();
    const fid = familyId();
    const { count, error } = await sb.from("sync_records").select("id", { count: "exact", head: true }).eq("family_id", fid);
    if (error || count > 0) return;
    // First device in this family: push local data so existing on-device history is kept.
    queue("settings", docId("settings"), "upsert", Store.loadSettings());
    (Store.loadLog() || []).forEach((row) => queue("choices", row.id, "upsert", row));
    (Store.loadEvents() || []).forEach((row) => queue("events", row.id, "upsert", row));
    (Store.loadContrib() || []).forEach((row) => queue("contrib", row.id, "upsert", row));
    (Store.loadVideos() || []).forEach((row) => queue("videos", row.id, "upsert", row));
    (Store.loadSchool() || []).forEach((row) => queue("school", row.id, "upsert", row));
    (Store.loadReminders() || []).forEach((row) => queue("reminders", row.id, "upsert", row));
    (Store.loadWall() || []).forEach((row) => queue("wall", row.id, "upsert", row));
    queue("reminder_state", docId("reminder_state"), "upsert", loadJson(KEYS.reminder_state, {}));
    queue("routine", docId("routine"), "upsert", loadJson(KEYS.routine, {}));
    const images = Store.allImages ? await Store.allImages() : [];
    const voices = Store.allVoices ? await Store.allVoices() : [];
    images.forEach((rec) => queue("images", rec.id, "upsert", { id: rec.id, type: rec.type }));
    voices.forEach((rec) => queue("voices", rec.id, "upsert", { id: rec.id, type: rec.type }));
    await flush();
  }

  function onLocalChange(collection, record, action) {
    if (window.__REMY_SYNC_SILENT || !started) return;
    if (!familyId()) return;
    if (DOC_COLLECTIONS.has(collection)) {
      queue(collection, docId(collection), "upsert", snapshotCollection(collection) || record || {});
      return;
    }
    if (!record || !record.id) {
      // Collection-level change: queue the snapshot item if provided, else ignore
      return;
    }
    queue(collection, record.id, action || "upsert", record);
  }

  function subscribeRealtime() {
    const sb = client();
    const fid = familyId();
    if (!sb || !fid) return;
    try {
      if (channel) sb.removeChannel(channel);
    } catch { /* ignore */ }
    channel = sb.channel("sync-" + fid)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "sync_records",
        filter: "family_id=eq." + fid
      }, () => {
        pull().catch(() => {});
      })
      .subscribe();
  }


  async function pushMissingLocal() {
    const sb = client();
    const fid = familyId();
    if (!sb || !fid) return;
    const { data, error } = await sb.from("sync_records").select("collection, id").eq("family_id", fid);
    if (error) return;
    const have = new Set((data || []).map((r) => r.collection + ":" + r.id));
    function maybeQueue(col, id, rec, action) {
      if (!id || have.has(col + ":" + id)) return;
      queue(col, id, action || "upsert", rec);
    }
    maybeQueue("settings", docId("settings"), Store.loadSettings());
    maybeQueue("reminder_state", docId("reminder_state"), loadJson(KEYS.reminder_state, {}));
    maybeQueue("routine", docId("routine"), loadJson(KEYS.routine, {}));
    (Store.loadLog() || []).forEach((row) => maybeQueue("choices", row.id, row));
    (Store.loadEvents() || []).forEach((row) => maybeQueue("events", row.id, row));
    (Store.loadContrib() || []).forEach((row) => maybeQueue("contrib", row.id, row));
    (Store.loadVideos() || []).forEach((row) => maybeQueue("videos", row.id, row));
    (Store.loadSchool() || []).forEach((row) => maybeQueue("school", row.id, row));
    (Store.loadReminders() || []).forEach((row) => maybeQueue("reminders", row.id, row));
    (Store.loadWall() || []).forEach((row) => maybeQueue("wall", row.id, row));
    const images = Store.allImages ? await Store.allImages() : [];
    const voices = Store.allVoices ? await Store.allVoices() : [];
    images.forEach((rec) => maybeQueue("images", rec.id, { id: rec.id, type: rec.type }));
    voices.forEach((rec) => maybeQueue("voices", rec.id, { id: rec.id, type: rec.type }));
    await flush();
  }

  async function start() {
    if (!RemyAuth.session() || !familyId()) {
      setStatus("local");
      return;
    }
    restoreOutbox();
    started = true;
    setStatus(navigator.onLine ? "syncing" : "offline");
    try {
      await seedIfRemoteEmpty();
      await flush();
      await pull();
      await pushMissingLocal();
      subscribeRealtime();
      setStatus(navigator.onLine ? (pending.size ? "pending" : "idle") : "offline");
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    }
  }

  function stop() {
    started = false;
    pending.clear();
    if (channel && client()) {
      try { client().removeChannel(channel); } catch { /* ignore */ }
    }
    channel = null;
    setStatus("local");
  }

  window.addEventListener("online", () => {
    if (started) {
      setStatus("syncing");
      flush().then(() => pull()).catch(() => {});
    }
  });
  window.addEventListener("offline", () => {
    if (started) setStatus("offline");
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && started) pull().catch(() => {});
  });

  return { start, stop, onLocalChange, flush, pull, setStatus, status: () => status };
})();
window.RemySync = RemySync;
