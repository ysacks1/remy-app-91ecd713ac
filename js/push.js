/* Web push: subscribe this device and notify the rest of the family. */
const RemyPush = (() => {
  function cfg() {
    return window.REMY_CONFIG || {};
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  async function supported() {
    return !!(window.Notification && navigator.serviceWorker && window.PushManager && cfg().vapidPublicKey);
  }

  async function currentSubscription() {
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }

  async function saveSubscription(sub) {
    const sb = RemyAuth.supabase();
    const fid = RemyAuth.familyId();
    const uid = RemyAuth.user() && RemyAuth.user().id;
    if (!sb || !fid || !uid || !sub) return;
    const json = sub.toJSON();
    await sb.from("push_subscriptions").upsert({
      family_id: fid,
      user_id: uid,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent || ""
    }, { onConflict: "family_id,endpoint" });
  }

  async function enable() {
    if (!(await supported())) throw new Error("Push is not available in this browser.");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error("Notifications were not allowed.");
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cfg().vapidPublicKey)
      });
    }
    await saveSubscription(sub);
    return sub;
  }

  async function disable() {
    const sub = await currentSubscription();
    if (!sub) return;
    const sb = RemyAuth.supabase();
    const fid = RemyAuth.familyId();
    try {
      if (sb && fid) {
        await sb.from("push_subscriptions").delete().eq("family_id", fid).eq("endpoint", sub.endpoint);
      }
    } catch { /* ignore */ }
    try { await sub.unsubscribe(); } catch { /* ignore */ }
  }

  async function notifyFamily(title, body, tag) {
    if (!RemyAuth.session()) return;
    let exclude = "";
    try {
      const sub = await currentSubscription();
      if (sub) exclude = sub.endpoint;
    } catch { /* ignore */ }
    await RemyAuth.callFunction("send-push", {
      title: title || "Remy's Music Room",
      body: body || "Something new for Remy",
      tag: tag || "family",
      excludeEndpoint: exclude
    }, true);
  }

  async function start() {
    if (!(await supported())) return;
    if (Notification.permission !== "granted") return;
    try {
      const sub = await currentSubscription();
      if (sub) await saveSubscription(sub);
    } catch { /* ignore */ }
  }

  return { supported, enable, disable, notifyFamily, start, currentSubscription };
})();
window.RemyPush = RemyPush;
