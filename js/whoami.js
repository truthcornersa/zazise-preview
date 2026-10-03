(function () {
  "use strict";

  function slots() {
    return [
      document.getElementById("preview-profile-avatar"),
      document.getElementById("dock-profile"),
      document.getElementById("cmt-av")
    ];
  }

  function clearPreviewProfile() {
    try { sessionStorage.removeItem("zazisePreviewProfile"); } catch (e) {}
    try { localStorage.removeItem("zazisePreviewProfile"); } catch (e) {}
  }

  function read() {
    try {
      return JSON.parse(sessionStorage.getItem("zazisePreviewProfile") || "null");
    } catch (e) {
      return null;
    }
  }

  function paintGuestZa() {
    slots().forEach(function (el) {
      if (!el) return;
      el.style.backgroundImage = "";
      el.classList.remove("has-photo");
      el.classList.add("guest-za");
      el.textContent = "ZA";
      el.setAttribute("title", "ZA");
      el.setAttribute("aria-label", "Guest profile ZA");
    });
    var avatar = document.getElementById("preview-profile-avatar");
    if (avatar) avatar.setAttribute("aria-label", "Guest profile ZA");
  }

  function paint(profile) {
    profile = profile || read();
    if (!profile) {
      paintGuestZa();
      return;
    }
    slots().forEach(function (el) {
      if (!el) return;
      el.classList.remove("guest-za");
      if (profile.photo) {
        el.style.backgroundImage = 'url("' + String(profile.photo).replace(/"/g, "") + '")';
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.classList.add("has-photo");
        el.textContent = "";
      } else {
        el.style.backgroundImage = "";
        el.classList.remove("has-photo");
        if (profile.initials) el.textContent = profile.initials;
      }
    });
    var avatar = document.getElementById("preview-profile-avatar");
    if (avatar) avatar.setAttribute("aria-label", "Profile");
  }

  function announce(signedIn) {
    try {
      document.dispatchEvent(new CustomEvent("zazise:auth", { detail: { signedIn: !!signedIn } }));
    } catch (e) {}
    if (window.ZaziseGuest && ZaziseGuest.gateGuestMenu) {
      try { ZaziseGuest.gateGuestMenu(); } catch (e2) {}
    }
  }

  window.ZaziseProfileChrome = { paint: paint, paintGuestZa: paintGuestZa };
  window.ZaziseAuth = window.ZaziseAuth || { user: null, guestConfirmed: false };

  function onGithubPages() {
    var host = "";
    try { host = String(location.hostname || "").toLowerCase(); } catch (e) {}
    return host === "github.io" || host.slice(-10) === ".github.io";
  }

  function readStoredProfile() {
    var raw = null;
    try { raw = sessionStorage.getItem("zazisePreviewProfile"); } catch (e) {}
    if (!raw) {
      try { raw = localStorage.getItem("zazisePreviewProfile"); } catch (e2) {}
    }
    if (!raw) return null;
    try {
      var profile = JSON.parse(raw);
      if (!profile || !profile.fromApi) return null;
      if (!profile.firstName && profile.name) profile.firstName = profile.name;
      return profile;
    } catch (e3) {
      return null;
    }
  }

  function keepStoredProfile(profile) {
    var raw = JSON.stringify(profile);
    try { sessionStorage.setItem("zazisePreviewProfile", raw); } catch (e) {}
    try { localStorage.setItem("zazisePreviewProfile", raw); } catch (e2) {}
  }

  function acceptStored(profile) {
    window.ZaziseAuth.user = {
      name: profile.name || profile.firstName || "",
      surname: profile.surname || "",
      email: profile.email || "",
      photo: profile.photo || ""
    };
    window.ZaziseAuth.guestConfirmed = false;
    keepStoredProfile(profile);
    paint(profile);
    announce(true);
  }

  /* Pages demo only; real auth is build.couchwraps.
     On github.io do not call /api/me.php — a 404 would wipe the demo profile. */
  if (onGithubPages()) {
    var pagesProfile = readStoredProfile();
    if (pagesProfile) acceptStored(pagesProfile);
    else {
      window.ZaziseAuth.user = null;
      window.ZaziseAuth.guestConfirmed = true;
      paintGuestZa();
      announce(false);
    }
  } else {
  /* Fresh loads stay guest until /api/me.php confirms a real session. */
  try {
    var cached = JSON.parse(sessionStorage.getItem("zazisePreviewProfile") || "null");
    if (!cached || !cached.fromApi) sessionStorage.removeItem("zazisePreviewProfile");
  } catch (e) { try { sessionStorage.removeItem("zazisePreviewProfile"); } catch (e2) {} }
  try { localStorage.removeItem("zazisePreviewProfile"); } catch (e) {}
  window.ZaziseAuth.user = null;
  window.ZaziseAuth.guestConfirmed = false;

  // Guest path: paint ZA immediately, never redirect to login.
  paintGuestZa();

  fetch("/api/me.php", { credentials: "same-origin", headers: { Accept: "application/json" } })
    .then(function (res) {
      return res.json().then(function (data) { return { res: res, data: data }; });
    })
    .then(function (out) {
      // Not signed in → STOP. Do NOT location.replace to login.html.
      if (!out.res.ok || !out.data || !out.data.ok) {
        clearPreviewProfile();
        window.ZaziseAuth.user = null;
        window.ZaziseAuth.guestConfirmed = true;
        paintGuestZa();
        announce(false);
        return;
      }
      var user = out.data.user || {};
      window.ZaziseAuth.user = user;
      window.ZaziseAuth.guestConfirmed = false;
      var a = String(user.name || "").replace(/[^A-Za-z]/g, "");
      var b = String(user.surname || "").replace(/[^A-Za-z]/g, "");
      var initials = a && b ? (a.charAt(0) + b.charAt(0)).toUpperCase() : "MZ";
      var profile = {
        firstName: user.name || "",
        surname: user.surname || "",
        initials: initials,
        photo: user.photo || "",
        fromApi: true
      };
      try { sessionStorage.setItem("zazisePreviewProfile", JSON.stringify(profile)); } catch (e) {}
      try { localStorage.removeItem("zazisePreviewProfile"); } catch (e) {}
      paint(profile);
      announce(true);
    })
    .catch(function () {
      // No PHP API (static host) — keep a Pages-style demo profile if one was stored.
      var stored = readStoredProfile();
      if (stored) {
        acceptStored(stored);
        return;
      }
      clearPreviewProfile();
      window.ZaziseAuth.user = null;
      window.ZaziseAuth.guestConfirmed = true;
      paintGuestZa();
      announce(false);
    });
  }
})();
