/* Auth gate: email + password, first-time setup code, invite-code join. No emails are sent from the client. */
const RemyAuth = (() => {
  let client = null;
  let session = null;
  let membership = null;
  let readyListeners = [];

  function cfg() {
    return window.REMY_CONFIG || {};
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function supabaseClient() {
    return client;
  }

  function currentSession() {
    return session;
  }

  function currentUser() {
    return session && session.user;
  }

  function currentFamilyId() {
    return membership && membership.family_id;
  }

  function currentRole() {
    return membership && membership.role;
  }

  function currentDisplayName() {
    return (membership && membership.display_name) || (session && session.user && session.user.email) || "";
  }

  function familyName() {
    return (membership && membership.family_name) || "Family";
  }

  function isParent() {
    return currentRole() === "parent";
  }

  function isDevice() {
    return currentRole() === "remy_device";
  }

  function onReady(fn) {
    readyListeners.push(fn);
  }

  function notifyReady() {
    readyListeners.forEach((fn) => {
      try { fn(session, membership); } catch { /* ignore */ }
    });
  }

  function showError(msg) {
    const el = $("#auth-error");
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.classList.remove("hidden");
    } else {
      el.textContent = "";
      el.classList.add("hidden");
    }
  }

  function showForm(name) {
    ["signin", "setup", "join"].forEach((n) => {
      const form = $("#auth-" + n);
      if (form) form.classList.toggle("hidden", n !== name);
    });
    showError("");
  }

  function setBusy(form, busy) {
    if (!form) return;
    form.querySelectorAll("button[type='submit']").forEach((b) => {
      b.disabled = !!busy;
    });
  }

  function hideGate() {
    const gate = $("#auth-gate");
    if (gate) {
      gate.classList.add("hidden");
      gate.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("auth-locked");
  }

  function showGate() {
    const gate = $("#auth-gate");
    if (gate) {
      gate.classList.remove("hidden");
      gate.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("auth-locked");
    showForm("signin");
  }

  async function loadMembership(userId) {
    const { data, error } = await client
      .from("members")
      .select("family_id, role, display_name, created_at")
      .eq("user_id", userId);
    if (error) throw error;
    const row = (data && data[0]) || null;
    if (!row) {
      membership = null;
      return null;
    }
    let fname = "Family";
    const { data: fam } = await client.from("families").select("name").eq("id", row.family_id).maybeSingle();
    if (fam && fam.name) fname = fam.name;
    membership = { ...row, family_name: fname };
    try {
      localStorage.setItem("remy-music-room-family-id", row.family_id);
      localStorage.setItem("remy-music-room-role", row.role);
    } catch { /* ignore */ }
    return membership;
  }

  async function acceptSession(sess) {
    session = sess;
    if (sess && sess.user) {
      await loadMembership(sess.user.id);
    } else {
      membership = null;
    }
  }

  async function callFunction(name, body, useUserAuth) {
    const c = cfg();
    const headers = {
      "Content-Type": "application/json",
      apikey: c.supabaseAnonKey
    };
    if (useUserAuth && session && session.access_token) {
      headers.Authorization = "Bearer " + session.access_token;
    } else {
      headers.Authorization = "Bearer " + c.supabaseAnonKey;
    }
    const res = await fetch(c.functionsUrl + "/" + name, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    let data = null;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok || (data && data.error)) {
      throw new Error((data && data.error) || ("Request failed (" + res.status + ")"));
    }
    return data;
  }

  async function applySessionFromFunction(data, email, password) {
    if (data && data.session && data.session.access_token && data.session.refresh_token) {
      const { error } = await client.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
      if (error) throw error;
      return;
    }
    if (data && data.needsSignIn) {
      const { data: signed, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await acceptSession(signed.session);
      return;
    }
    throw new Error("Could not start a session");
  }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password
    });
    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) {
        throw new Error("That email or password did not match. If this is your first time, set a password with your setup code.");
      }
      throw new Error(error.message || "Could not sign in");
    }
    await acceptSession(data.session);
  }

  async function completeSetup(email, code, password) {
    const data = await callFunction("complete-setup", {
      email: String(email).trim().toLowerCase(),
      code,
      password
    }, false);
    await applySessionFromFunction(data, email, password);
    if (!membership && session) await loadMembership(session.user.id);
  }

  async function joinWithInvite(email, password, code, displayName) {
    const data = await callFunction("redeem-invite", {
      email: String(email).trim().toLowerCase(),
      password,
      code,
      displayName: displayName || ""
    }, false);
    await applySessionFromFunction(data, email, password);
    if (!membership && session) await loadMembership(session.user.id);
  }

  async function signOut() {
    try { await client.auth.signOut(); } catch { /* ignore */ }
    session = null;
    membership = null;
    showGate();
    notifyReady();
  }

  async function createInvite(role, days, maxUses) {
    const { data, error } = await client.rpc("create_invite", {
      p_role: role,
      p_days: days || 14,
      p_max_uses: maxUses || 1,
      p_family_id: currentFamilyId()
    });
    if (error) throw new Error(error.message || "Could not create an invite code");
    return data;
  }

  async function listInvites() {
    const { data, error } = await client
      .from("invite_codes")
      .select("id, role, expires_at, max_uses, use_count, created_at, revoked_at")
      .eq("family_id", currentFamilyId())
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function revokeInvite(id) {
    const { error } = await client.rpc("revoke_invite", { p_id: id });
    if (error) throw new Error(error.message || "Could not revoke that code");
  }

  async function listMembers() {
    const { data, error } = await client
      .from("members")
      .select("id, user_id, role, display_name, created_at")
      .eq("family_id", currentFamilyId())
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  function bindUI() {
    document.querySelectorAll("[data-auth-show]").forEach((btn) => {
      btn.addEventListener("click", () => showForm(btn.getAttribute("data-auth-show")));
    });

    const signin = $("#auth-signin");
    if (signin) {
      signin.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        showError("");
        setBusy(signin, true);
        try {
          await signIn($("#auth-email").value, $("#auth-password").value);
          hideGate();
          notifyReady();
        } catch (err) {
          showError(err.message || "Could not sign in");
        } finally {
          setBusy(signin, false);
        }
      });
    }

    const setup = $("#auth-setup");
    if (setup) {
      setup.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        showError("");
        const pw = $("#setup-password").value;
        const pw2 = $("#setup-password-2").value;
        if (pw !== pw2) {
          showError("The two passwords did not match.");
          return;
        }
        if (pw.length < 12) {
          showError("Choose a password of at least 12 characters.");
          return;
        }
        setBusy(setup, true);
        try {
          await completeSetup($("#setup-email").value, $("#setup-code").value, pw);
          hideGate();
          notifyReady();
        } catch (err) {
          showError(err.message || "Could not set the password");
        } finally {
          setBusy(setup, false);
        }
      });
    }

    const join = $("#auth-join");
    if (join) {
      join.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        showError("");
        const pw = $("#join-password").value;
        const pw2 = $("#join-password-2").value;
        if (pw !== pw2) {
          showError("The two passwords did not match.");
          return;
        }
        if (pw.length < 12) {
          showError("Choose a password of at least 12 characters.");
          return;
        }
        setBusy(join, true);
        try {
          await joinWithInvite(
            $("#join-email").value,
            pw,
            $("#join-code").value,
            $("#join-name").value
          );
          hideGate();
          notifyReady();
        } catch (err) {
          showError(err.message || "Could not join");
        } finally {
          setBusy(join, false);
        }
      });
    }
  }

  async function init() {
    const c = cfg();
    if (!c.supabaseUrl || !c.supabaseAnonKey || !window.supabase) {
      showError("This copy of the app is missing its sign-in settings.");
      return null;
    }
    client = window.supabase.createClient(c.supabaseUrl, c.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage
      }
    });
    bindUI();
    const { data } = await client.auth.getSession();
    if (data && data.session) {
      try {
        await acceptSession(data.session);
        hideGate();
      } catch {
        session = null;
        membership = null;
        showGate();
      }
    } else {
      showGate();
    }
    client.auth.onAuthStateChange(async (event, sess) => {
      if (event === "SIGNED_OUT") {
        session = null;
        membership = null;
        showGate();
        notifyReady();
        return;
      }
      if (sess && (!session || sess.access_token !== session.access_token)) {
        try { await acceptSession(sess); } catch { /* ignore */ }
      }
    });
    return session;
  }

  return {
    init,
    onReady,
    signOut,
    createInvite,
    listInvites,
    revokeInvite,
    listMembers,
    supabase: supabaseClient,
    session: currentSession,
    user: currentUser,
    familyId: currentFamilyId,
    role: currentRole,
    displayName: currentDisplayName,
    familyName,
    isParent,
    isDevice,
    callFunction,
    showForm
  };
})();
window.RemyAuth = RemyAuth;
