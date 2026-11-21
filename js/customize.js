/* Family look, home tiles, and connectors. Local fallback; parents sync to Supabase. */
const RemyCustomize = (() => {
  const KEY = "remy-music-room-customization";
  const USAGE_KEY = "remy-music-room-connector-usage";
  const SECTION_TILES = [
    { id: "music", label: "Music", theme: "music", screen: "music" },
    { id: "watch", label: "Watch", theme: "watch", screen: "watch" },
    { id: "want", label: "I Want", theme: "want", screen: "want" },
    { id: "school", label: "School", theme: "school", screen: "school" },
    { id: "hum", label: "Hum", theme: "hum", screen: "hum" },
    { id: "games", label: "Games", theme: "games", screen: "games" },
    { id: "family", label: "Family", theme: "family", screen: "family" },
    { id: "health", label: "Health", theme: "health", screen: "health" }
  ];

  const THEMES = [
    { id: "calm", label: "Calm", hint: "Soft night, gentle teal" },
    { id: "bright", label: "Bright", hint: "Warm light, easy contrast" },
    { id: "dark", label: "Dark", hint: "Deep and quiet" },
    { id: "race", label: "Cars", hint: "Asphalt and amber" },
    { id: "pizza", label: "Pizza", hint: "Warm kitchen night" }
  ];

  const ACCENTS = [
    { id: "", label: "Theme default", color: "" },
    { id: "#2ec4b6", label: "Mint", color: "#2ec4b6" },
    { id: "#8b6cff", label: "Lilac", color: "#8b6cff" },
    { id: "#ff9f43", label: "Amber", color: "#ff9f43" },
    { id: "#ff6b8a", label: "Rose", color: "#ff6b8a" },
    { id: "#5b9fd6", label: "Sky", color: "#5b9fd6" },
    { id: "#7bd36a", label: "Leaf", color: "#7bd36a" }
  ];

  const BUILTIN_CONNECTORS = [
    { id: "netflix", label: "Netflix", url: "https://www.netflix.com/", emoji: "🎬", group: "Watch" },
    { id: "youtube", label: "YouTube", url: "https://www.youtube.com/", emoji: "▶", group: "Watch" },
    { id: "youtubekids", label: "YouTube Kids", url: "https://www.youtubekids.com/", emoji: "🧸", group: "Watch" },
    { id: "disney", label: "Disney+", url: "https://www.disneyplus.com/", emoji: "✨", group: "Watch" },
    { id: "prime", label: "Prime Video", url: "https://www.primevideo.com/", emoji: "📺", group: "Watch" },
    { id: "spotify", label: "Spotify", url: "https://open.spotify.com/", emoji: "🎵", group: "Listen" },
    { id: "applemusic", label: "Apple Music", url: "https://music.apple.com/", emoji: "🎧", group: "Listen" },
    { id: "khan", label: "Khan Academy Kids", url: "https://learn.khanacademy.org/khan-kids/", emoji: "📚", group: "Learn" },
    { id: "classroom", label: "Google Classroom", url: "https://classroom.google.com/", emoji: "🎒", group: "Learn" },
    { id: "zoom", label: "Zoom", url: "", emoji: "💻", group: "Call", needsUrl: true, placeholder: "https://zoom.us/j/…" },
    { id: "facetime", label: "FaceTime", url: "", emoji: "📞", group: "Call", needsUrl: true, placeholder: "facetime://email-or-number" },
    { id: "whatsapp", label: "WhatsApp", url: "", emoji: "💬", group: "Call", needsUrl: true, placeholder: "https://wa.me/15551234567" }
  ];

  const DEFAULT_ENABLED = { netflix: true, youtubekids: true, disney: true };

  let state = null;
  let saveTimer = 0;
  let channel = null;
  let openedConnector = null;

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function defaultState() {
    const shortcuts = (window.Store && Store.loadSettings && (Store.loadSettings().shortcuts || {})) || {};
    const connectors = BUILTIN_CONNECTORS.map((c) => {
      const enabled = shortcuts[c.id] != null ? shortcuts[c.id] !== false : !!DEFAULT_ENABLED[c.id];
      return {
        id: c.id,
        builtin: true,
        enabled,
        url: c.url || "",
        showOnHome: false,
        dailyLimitMin: null,
        hoursStart: "",
        hoursEnd: "",
        label: c.label,
        emoji: c.emoji
      };
    });
    return {
      theme: "calm",
      accent: "",
      tileSize: "comfortable",
      homeTiles: SECTION_TILES.map((t) => ({ id: t.id, kind: "section", visible: true })),
      customTiles: [],
      connectors,
      updatedAt: 0
    };
  }

  function normalize(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== "object") return base;
    const next = { ...base, ...raw };
    if (!["calm", "bright", "dark", "race", "pizza"].includes(next.theme)) next.theme = "calm";
    if (!["comfortable", "compact", "large"].includes(next.tileSize)) next.tileSize = "comfortable";
    if (!Array.isArray(next.homeTiles) || !next.homeTiles.length) next.homeTiles = base.homeTiles;
    const seen = new Set();
    next.homeTiles = next.homeTiles.filter((t) => {
      if (!t || !t.id || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    SECTION_TILES.forEach((t) => {
      if (!seen.has(t.id)) next.homeTiles.push({ id: t.id, kind: "section", visible: true });
    });
    next.customTiles = Array.isArray(next.customTiles) ? next.customTiles : [];
    const byId = new Map((Array.isArray(next.connectors) ? next.connectors : []).map((c) => [c.id, c]));
    const builtins = BUILTIN_CONNECTORS.map((c) => {
      const saved = byId.get(c.id) || {};
      byId.delete(c.id);
      return {
        id: c.id,
        builtin: true,
        enabled: saved.enabled != null ? !!saved.enabled : !!DEFAULT_ENABLED[c.id],
        url: saved.url || c.url || "",
        showOnHome: !!saved.showOnHome,
        dailyLimitMin: saved.dailyLimitMin || null,
        hoursStart: saved.hoursStart || "",
        hoursEnd: saved.hoursEnd || "",
        label: saved.label || c.label,
        emoji: saved.emoji || c.emoji
      };
    });
    const customs = [];
    byId.forEach((c) => {
      if (c && c.id) customs.push({ ...c, builtin: false, enabled: c.enabled !== false });
    });
    next.connectors = builtins.concat(customs);
    return next;
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(KEY);
      return normalize(raw ? JSON.parse(raw) : null);
    } catch {
      return defaultState();
    }
  }

  function writeLocal(data) {
    state = normalize(data);
    state.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
    apply();
    return state;
  }

  function current() {
    if (!state) state = loadLocal();
    return state;
  }

  function canEdit() {
    if (!window.RemyAuth || !RemyAuth.session || !RemyAuth.session()) return true;
    return !!(RemyAuth.isParent && RemyAuth.isParent());
  }

  function apply() {
    const c = current();
    const root = document.documentElement;
    root.dataset.theme = c.theme || "calm";
    root.dataset.tileSize = c.tileSize || "comfortable";
    if (c.accent) {
      root.dataset.accent = "custom";
      root.style.setProperty("--accent-override", c.accent);
    } else {
      root.removeAttribute("data-accent");
      root.style.removeProperty("--accent-override");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim() || "#0e1318";
    if (meta) meta.setAttribute("content", bg);
  }

  function save(patch) {
    if (!canEdit()) return current();
    const next = normalize({ ...current(), ...(patch || {}) });
    writeLocal(next);
    schedulePush();
    return next;
  }

  function schedulePush() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { pushRemote().catch(() => {}); }, 400);
  }

  async function pushRemote() {
    if (!canEdit()) return;
    if (!window.RemyAuth || !RemyAuth.supabase || !RemyAuth.familyId || !RemyAuth.familyId()) return;
    const sb = RemyAuth.supabase();
    const fid = RemyAuth.familyId();
    const uid = RemyAuth.user() && RemyAuth.user().id;
    if (!sb || !fid) return;
    const payload = { family_id: fid, data: current(), updated_by: uid };
    const { error } = await sb.from("family_customization").upsert(payload, { onConflict: "family_id" });
    if (error) throw error;
  }

  async function pullRemote() {
    if (!window.RemyAuth || !RemyAuth.supabase || !RemyAuth.familyId || !RemyAuth.familyId()) return current();
    const sb = RemyAuth.supabase();
    const fid = RemyAuth.familyId();
    const { data, error } = await sb.from("family_customization").select("data, updated_at").eq("family_id", fid).maybeSingle();
    if (error || !data) return current();
    const remote = normalize(data.data || {});
    const remoteTs = Date.parse(data.updated_at || 0) || remote.updatedAt || 0;
    if (remoteTs >= (current().updatedAt || 0)) writeLocal({ ...remote, updatedAt: remoteTs });
    else await pushRemote();
    return current();
  }

  function subscribe() {
    if (!window.RemyAuth || !RemyAuth.supabase) return;
    const sb = RemyAuth.supabase();
    const fid = RemyAuth.familyId && RemyAuth.familyId();
    if (!sb || !fid) return;
    try { if (channel) sb.removeChannel(channel); } catch { /* ignore */ }
    channel = sb.channel("customize-" + fid)
      .on("postgres_changes", { event: "*", schema: "public", table: "family_customization", filter: "family_id=eq." + fid }, () => {
        pullRemote().then(() => {
          if (window.__REMY__ && window.__REMY__.rerender) window.__REMY__.rerender();
        }).catch(() => {});
      })
      .subscribe();
  }

  async function start() {
    state = loadLocal();
    apply();
    try {
      await pullRemote();
      subscribe();
    } catch { /* offline is fine */ }
    apply();
  }

  function builtinById(id) {
    return BUILTIN_CONNECTORS.find((c) => c.id === id);
  }

  function resolvedConnectors() {
    return current().connectors.map((c) => {
      const b = builtinById(c.id);
      return {
        ...c,
        label: c.label || (b && b.label) || "Connector",
        emoji: c.emoji || (b && b.emoji) || "🔗",
        url: c.url || (b && b.url) || "",
        group: (b && b.group) || "Custom",
        needsUrl: !!(b && b.needsUrl),
        placeholder: (b && b.placeholder) || "https://"
      };
    });
  }

  function enabledConnectors() {
    return resolvedConnectors().filter((c) => c.enabled && c.url);
  }

  function homeEntries() {
    const c = current();
    const customMap = new Map(c.customTiles.map((t) => [t.id, t]));
    const connMap = new Map(resolvedConnectors().map((t) => [t.id, t]));
    const entries = [];
    c.homeTiles.forEach((slot) => {
      if (slot.visible === false) return;
      if (slot.kind === "custom" || customMap.has(slot.id)) {
        const t = customMap.get(slot.id);
        if (t) entries.push({ kind: "custom", tile: t });
        return;
      }
      if (slot.kind === "connector" || connMap.has(slot.id) && !SECTION_TILES.some((s) => s.id === slot.id)) {
        const t = connMap.get(slot.id);
        if (t && t.enabled && t.url) entries.push({ kind: "connector", tile: t });
        return;
      }
      const section = SECTION_TILES.find((s) => s.id === slot.id);
      if (section) entries.push({ kind: "section", tile: section });
    });
    c.customTiles.forEach((t) => {
      if (!c.homeTiles.some((s) => s.id === t.id)) entries.push({ kind: "custom", tile: t });
    });
    enabledConnectors().forEach((t) => {
      if (t.showOnHome && !c.homeTiles.some((s) => s.id === t.id)) {
        entries.push({ kind: "connector", tile: t });
      }
    });
    return entries;
  }

  function usage() {
    try {
      const raw = JSON.parse(localStorage.getItem(USAGE_KEY) || "{}");
      const today = (window.Store && Store.dayKey) ? Store.dayKey() : new Date().toISOString().slice(0, 10);
      if (raw.day !== today) return { day: today, minutes: {} };
      return { day: today, minutes: raw.minutes || {} };
    } catch {
      const today = new Date().toISOString().slice(0, 10);
      return { day: today, minutes: {} };
    }
  }

  function saveUsage(u) {
    try { localStorage.setItem(USAGE_KEY, JSON.stringify(u)); } catch { /* ignore */ }
  }

  function minutesNow() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function parseHour(s) {
    if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return null;
    const [h, m] = s.split(":").map(Number);
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
  }

  function connectorGate(conn) {
    const now = minutesNow();
    const start = parseHour(conn.hoursStart);
    const end = parseHour(conn.hoursEnd);
    if (start != null && end != null) {
      const inWindow = start <= end ? (now >= start && now < end) : (now >= start || now < end);
      if (!inWindow) {
        return {
          ok: false,
          title: "Not right now",
          message: conn.label + " is only available " + conn.hoursStart + "–" + conn.hoursEnd + " on this device."
        };
      }
    }
    const limit = conn.dailyLimitMin && Number(conn.dailyLimitMin);
    if (limit && limit > 0) {
      const used = usage().minutes[conn.id] || 0;
      if (used >= limit) {
        return {
          ok: false,
          title: "That's enough for today",
          message: conn.label + " has already been opened for about " + Math.round(used) + " minutes today. A parent can change this limit in settings."
        };
      }
    }
    return { ok: true };
  }

  function markOpen(conn) {
    closeOpenSession();
    openedConnector = { id: conn.id, started: Date.now() };
  }

  function closeOpenSession() {
    if (!openedConnector) return;
    const elapsed = Math.max(0, (Date.now() - openedConnector.started) / 60000);
    const u = usage();
    u.minutes[openedConnector.id] = (u.minutes[openedConnector.id] || 0) + elapsed;
    saveUsage(u);
    openedConnector = null;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) closeOpenSession();
  });
  window.addEventListener("pagehide", closeOpenSession);

  function setTheme(id) { return save({ theme: id }); }
  function setAccent(color) { return save({ accent: color || "" }); }
  function setTileSize(size) { return save({ tileSize: size }); }

  function setHomeVisible(id, visible) {
    const homeTiles = current().homeTiles.map((t) => t.id === id ? { ...t, visible: !!visible } : t);
    return save({ homeTiles });
  }

  function moveHome(id, dir) {
    const homeTiles = current().homeTiles.slice();
    const i = homeTiles.findIndex((t) => t.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= homeTiles.length) return current();
    const tmp = homeTiles[i];
    homeTiles[i] = homeTiles[j];
    homeTiles[j] = tmp;
    return save({ homeTiles });
  }

  function addCustomTile(tile) {
    const id = tile.id || ((crypto.randomUUID && crypto.randomUUID()) || ("tile-" + Date.now()));
    const rec = {
      id,
      label: (tile.label || "Tile").trim(),
      emoji: tile.emoji || "⭐",
      imageId: tile.imageId || "",
      action: tile.action || "speak",
      url: tile.url || "",
      phrase: tile.phrase || "",
      screen: tile.screen || "",
      trackId: tile.trackId || "",
      theme: tile.theme || "want"
    };
    const customTiles = current().customTiles.concat([rec]);
    const homeTiles = current().homeTiles.concat([{ id, kind: "custom", visible: true }]);
    return save({ customTiles, homeTiles });
  }

  function updateCustomTile(id, patch) {
    const customTiles = current().customTiles.map((t) => t.id === id ? { ...t, ...patch } : t);
    return save({ customTiles });
  }

  function removeCustomTile(id) {
    return save({
      customTiles: current().customTiles.filter((t) => t.id !== id),
      homeTiles: current().homeTiles.filter((t) => t.id !== id)
    });
  }

  function updateConnector(id, patch) {
    let connectors = current().connectors;
    if (!connectors.some((c) => c.id === id)) {
      connectors = connectors.concat([{ id, builtin: false, enabled: true }]);
    }
    connectors = connectors.map((c) => c.id === id ? { ...c, ...patch } : c);
    let homeTiles = current().homeTiles;
    const show = (connectors.find((c) => c.id === id) || {}).showOnHome;
    const has = homeTiles.some((t) => t.id === id);
    if (show && !has) homeTiles = homeTiles.concat([{ id, kind: "connector", visible: true }]);
    if (!show && has) homeTiles = homeTiles.filter((t) => t.id !== id);
    return save({ connectors, homeTiles });
  }

  function addCustomConnector(tile) {
    const id = (crypto.randomUUID && crypto.randomUUID()) || ("conn-" + Date.now());
    const rec = {
      id,
      builtin: false,
      enabled: true,
      label: (tile.label || "App").trim(),
      emoji: tile.emoji || "🔗",
      url: tile.url || "",
      showOnHome: !!tile.showOnHome,
      dailyLimitMin: tile.dailyLimitMin || null,
      hoursStart: tile.hoursStart || "",
      hoursEnd: tile.hoursEnd || ""
    };
    const connectors = current().connectors.concat([rec]);
    const homeTiles = rec.showOnHome
      ? current().homeTiles.concat([{ id, kind: "connector", visible: true }])
      : current().homeTiles;
    return save({ connectors, homeTiles });
  }

  function removeConnector(id) {
    const conn = current().connectors.find((c) => c.id === id);
    if (!conn || conn.builtin) {
      return updateConnector(id, { enabled: false, showOnHome: false });
    }
    return save({
      connectors: current().connectors.filter((c) => c.id !== id),
      homeTiles: current().homeTiles.filter((t) => t.id !== id)
    });
  }

  return {
    KEY,
    THEMES,
    ACCENTS,
    BUILTIN_CONNECTORS,
    SECTION_TILES,
    current,
    loadLocal,
    canEdit,
    apply,
    save,
    start,
    pullRemote,
    setTheme,
    setAccent,
    setTileSize,
    setHomeVisible,
    moveHome,
    addCustomTile,
    updateCustomTile,
    removeCustomTile,
    updateConnector,
    addCustomConnector,
    removeConnector,
    resolvedConnectors,
    enabledConnectors,
    homeEntries,
    connectorGate,
    markOpen,
    closeOpenSession,
    usage
  };
})();
window.RemyCustomize = RemyCustomize;
