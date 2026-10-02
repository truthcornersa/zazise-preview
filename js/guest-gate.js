/**
 * ZAZISE guest view-only gate — shared login popup, welcome, limited tour hooks, like toggle.
 * Include on home / watch / clips / studio / upload. Safe no-op when signed in.
 */
(function (global) {
  "use strict";

  var AUTH_KEY = "zazisePreviewProfile";
  var WELCOME_KEY = "zazise.guest.welcome.done";
  var TOUR_OFF_KEY = "zazise.guest.tour.off";
  var LIKE_PREFIX = "zazise.guest.like.";

  function guestT(key, fallback) {
    if (window.ZaziseI18n && ZaziseI18n.t) {
      var said = ZaziseI18n.t(key);
      if (said && said !== key) return said;
    }
    return fallback || key;
  }

  function toast(msg, kind, key) {
    if (window.ZaziseCookingToast && ZaziseCookingToast.show) {
      ZaziseCookingToast.show(msg, kind || "cooking", key || null);
      return;
    }
  }

  function signedIn() {
    /* Prefer live API user from whoami. Stale localStorage preview profiles must not unlock the menu. */
    if (global.ZaziseAuth && global.ZaziseAuth.user) return true;
    if (global.ZaziseAuth && global.ZaziseAuth.guestConfirmed) return false;
    try {
      var p = JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null");
      if (p && (p.initials || p.firstName || p.photo) && p.fromApi) return true;
    } catch (e) {}
    return false;
  }

  function isGuest() {
    return !signedIn();
  }

  function ensureStyles() {
    if (document.getElementById("zz-guest-gate-css")) return;
    var css = document.createElement("style");
    css.id = "zz-guest-gate-css";
    css.textContent = [
      ".zz-gate-overlay{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(18,22,31,.28);}",
      ".zz-gate-overlay[hidden]{display:none!important;}",
      ".zz-gate-card{width:min(400px,100%);max-width:100%;box-sizing:border-box;overflow-wrap:anywhere;background:#fff;color:#12161f;border-radius:18px;padding:22px 22px 18px;box-shadow:0 18px 48px rgba(18,22,31,.28);font-family:inherit;}",
      "html.z-dark .zz-gate-card{background:#171c24;color:#f3f5f8;}",
      ".zz-gate-card h2{margin:0 0 8px;font-size:20px;line-height:1.25;}",
      ".zz-gate-card p{margin:0 0 18px;font-size:15px;line-height:1.45;color:#3d4654;}",
      "html.z-dark .zz-gate-card p{color:#c5ccd6;}",
      ".zz-gate-card .zz-gate-btn{display:block;width:100%;border:0;border-radius:999px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;background:#E2AE41;color:#1a1a1a;}",
      ".zz-gate-blur{filter:blur(5px);pointer-events:none;user-select:none;}",
      ".zz-welcome-overlay{position:fixed;inset:0;z-index:1300;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(18,22,31,.45);backdrop-filter:blur(2px);}",
      ".zz-welcome-overlay[hidden]{display:none!important;}",
      ".zz-welcome-card{width:min(440px,100%);max-width:100%;box-sizing:border-box;overflow-wrap:anywhere;background:#fff;color:#12161f;border-radius:18px;padding:24px 22px 18px;box-shadow:0 18px 48px rgba(18,22,31,.28);}",
      "html.z-dark .zz-welcome-card{background:#171c24;color:#f3f5f8;}",
      ".zz-welcome-card h2{margin:0 0 6px;font-size:22px;}",
      ".zz-welcome-card .lead{margin:0 0 10px;font-size:16px;font-weight:650;}",
      ".zz-welcome-card .body{margin:0 0 18px;font-size:15px;line-height:1.5;color:#3d4654;}",
      "html.z-dark .zz-welcome-card .body{color:#c5ccd6;}",
      ".zz-welcome-actions{display:flex;flex-direction:column;gap:10px;}",
      ".zz-welcome-actions .primary{border:0;border-radius:999px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;background:#E2AE41;color:#1a1a1a;}",
      ".zz-welcome-actions .secondary{border:0;background:transparent;color:#5c6573;font:inherit;font-weight:600;cursor:pointer;padding:8px;}",
      "html.z-dark .zz-welcome-actions .secondary{color:#aeb6c2;}",
      ".zz-tour-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:1250;display:flex;gap:8px;align-items:center;max-width:calc(100% - 24px);box-sizing:border-box;flex-wrap:wrap;justify-content:center;background:#fff;color:#12161f;border-radius:999px;padding:8px 10px;box-shadow:0 10px 30px rgba(18,22,31,.25);}",
      "html.z-dark .zz-tour-bar{background:#171c24;color:#f3f5f8;}",
      ".zz-tour-bar button{border:0;background:#f0f2f6;color:inherit;border-radius:999px;padding:8px 12px;font:inherit;font-weight:650;cursor:pointer;}",
      "html.z-dark .zz-tour-bar button{background:#2a3342;}",
      ".zz-tour-bar .primary{background:#E2AE41;color:#1a1a1a;}",
      ".zz-tour-tip{position:fixed;z-index:1240;width:min(280px,calc(100% - 24px));max-width:calc(100% - 24px);box-sizing:border-box;overflow-wrap:anywhere;background:#183D83;color:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 12px 28px rgba(18,22,31,.3);font-size:14px;line-height:1.4;}",
      ".zz-tour-tip strong{display:block;margin-bottom:4px;font-size:15px;}",
      ".nav-item .ico-logo{width:22px;height:22px;object-fit:contain;display:block;border-radius:0;}",
      ".nav-item .ico-logo--mask{width:22px;height:22px;display:block;background-color:currentColor;border-radius:0;-webkit-mask:url(assets/zazise-logo-bw-icon-black.png) center/contain no-repeat;mask:url(assets/zazise-logo-bw-icon-black.png) center/contain no-repeat;}",
      "html.zz-guest-no-menu .menu-btn,html.zz-guest-no-menu #preview-sidebar,html.zz-guest-no-menu .sidebar,html.zz-guest-no-menu #menu-scrim{display:none!important;visibility:hidden!important;pointer-events:none!important;}",
      "html.zz-guest-no-menu .menu-scrim{display:none!important;}",
      "html.zz-guest-no-menu .sidebar.mini ~ .main,html.zz-guest-no-menu .layout .main{margin-right:0!important;}",
      ".avatar.guest-za,.dock-avatar.guest-za{background:#183D83;color:#fff;font-weight:700;}",
      ".zz-guest-hide{display:none!important;}"
    ].join("");
    document.head.appendChild(css);
  }

  var blurEl = null;
  var overlay = null;

  function clearBlur() {
    if (blurEl) {
      blurEl.classList.remove("zz-gate-blur");
      blurEl = null;
    }
  }

  var leaveClipsOnClose = false;

  function leaveClipsForGuest() {
    location.replace("/");
  }

  function closeGate() {
    clearBlur();
    if (overlay) overlay.hidden = true;
    if (leaveClipsOnClose) {
      leaveClipsOnClose = false;
      leaveClipsForGuest();
    }
  }

  function loginUrl() {
    var path = location.pathname || "/index.html";
    // Prefer path-only next= (no open redirect via host/query tricks). Hash dropped.
    if (path.charAt(0) !== "/") path = "/" + path.replace(/^\.+\//, "");
    var allow = {
      "/": 1, "/index.html": 1, "/home.html": 1, "/home-preview.html": 1,
      "/watch.html": 1, "/clips.html": 1, "/reels.html": 1, "/later.html": 1,
      "/studio.html": 1, "/upload.html": 1, "/help.html": 1, "/channel.html": 1
    };
    if (!allow[path]) path = "/index.html";
    return "login.html?next=" + encodeURIComponent(path);
  }

  function openGate(opts) {
    opts = opts || {};
    if (!isGuest()) return false;
    ensureStyles();
    clearBlur();
    if (opts.leaveClipsOnClose) leaveClipsOnClose = true;
    if (opts.blurSelector) {
      if (typeof opts.blurSelector === "string") {
        blurEl = document.querySelector(opts.blurSelector);
      } else if (opts.blurSelector && opts.blurSelector.nodeType === 1) {
        blurEl = opts.blurSelector;
      }
      if (blurEl) blurEl.classList.add("zz-gate-blur");
    }
    function paintGateCard() {
      if (!overlay) return;
      var card = overlay.querySelector(".zz-gate-card");
      if (!card) {
        overlay.innerHTML =
          '<div class="zz-gate-card" role="dialog" aria-modal="true" aria-labelledby="zz-gate-title">' +
          '<h2 id="zz-gate-title"></h2><p data-zz-gate-body></p>' +
          '<button type="button" class="zz-gate-btn" data-zz-signin></button></div>';
        overlay.querySelector("[data-zz-signin]").addEventListener("click", function () {
          location.href = loginUrl();
        });
      }
      overlay.querySelector("#zz-gate-title").textContent = guestT("guest_gate_title", "Sign in to continue.");
      overlay.querySelector("[data-zz-gate-body]").textContent = guestT("guest_gate_body", "This needs an account. You can keep watching public videos.");
      overlay.querySelector("[data-zz-signin]").textContent = guestT("guest_gate_signin", "Sign in");
    }
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "zz-gate-overlay";
      overlay.id = "zz-guest-gate";
      paintGateCard();
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closeGate();
      });
    } else {
      paintGateCard();
    }
    overlay.hidden = false;
    toast(guestT("guest_err_needs_account", "This needs an account. Sign in to continue — you can keep watching public videos."), "error", "guest_err_needs_account");
    return true;
  }

  function markWelcomeDone() {
    try { sessionStorage.setItem(WELCOME_KEY, "1"); } catch (e) {}
  }

  function welcomeSeen() {
    try { return sessionStorage.getItem(WELCOME_KEY) === "1"; } catch (e) { return false; }
  }

  function tourOff() {
    try { return localStorage.getItem(TOUR_OFF_KEY) === "1"; } catch (e) { return false; }
  }

  function setTourOff() {
    try { localStorage.setItem(TOUR_OFF_KEY, "1"); } catch (e) {}
  }

  /** Guest limited tour steps — public home → public video → like → Help → limited Settings → ZA mark */
  function guestTourSteps() {
    return [
      { sel: ".brand, .app-bar", title: guestT("guest_tour_home_title", "Public home"), body: guestT("guest_tour_home_body", "Look around your home. Public videos stay open without an account.") },
      { sel: ".top-trending, .video-grid, .player, .watch-main", title: guestT("guest_tour_video_title", "Public video"), body: guestT("guest_tour_video_body", "Open a public video and watch with full controls.") },
      { sel: "[data-zz-like], .btn-like, [data-act='like']", title: guestT("guest_tour_like_title", "Like"), body: guestT("guest_tour_like_body", "Like is the only write that works as a guest — one like per visit, tap again to remove.") },
      { sel: "a[title='Help'], a[href*='help']", title: guestT("guest_tour_help_title", "Help"), body: guestT("guest_tour_help_body", "Help stays open for everyone.") },
      { sel: "[data-open-settings]", title: guestT("guest_tour_settings_title", "Limited Settings"), body: guestT("guest_tour_settings_body", "Guests get dark mode and Sign in only.") },
      { sel: "#preview-profile-avatar, #dock-profile, .avatar", title: guestT("guest_tour_za_title", "ZA mark"), body: guestT("guest_tour_za_body", "Your guest profile mark is ZA — no name, email, phone, or photo.") }
    ];
  }

  var tour = { i: 0, tip: null, bar: null, active: false };

  function placeTip(step) {
    if (!tour.tip) {
      tour.tip = document.createElement("div");
      tour.tip.className = "zz-tour-tip";
      document.body.appendChild(tour.tip);
    }
    tour.tip.textContent = "";
    var strong = document.createElement("strong");
    strong.textContent = step.title;
    tour.tip.appendChild(strong);
    tour.tip.appendChild(document.createTextNode(step.body));
    var el = document.querySelector(step.sel);
    if (el) {
      var r = el.getBoundingClientRect();
      var top = Math.min(window.innerHeight - 120, Math.max(12, r.bottom + 10));
      var left = Math.min(window.innerWidth - 300, Math.max(12, r.left));
      tour.tip.style.top = top + "px";
      tour.tip.style.left = left + "px";
    } else {
      tour.tip.style.top = "20%";
      tour.tip.style.left = "50%";
      tour.tip.style.transform = "translateX(-50%)";
    }
  }

  function endTour(permanent) {
    tour.active = false;
    if (tour.tip) { tour.tip.remove(); tour.tip = null; }
    if (tour.bar) { tour.bar.remove(); tour.bar = null; }
    if (permanent) setTourOff();
  }

  function showTourStep() {
    var GUEST_TOUR = guestTourSteps();
    var step = GUEST_TOUR[tour.i];
    if (!step) { endTour(true); return; }
    placeTip(step);
    var next = tour.bar.querySelector("[data-next]");
    next.textContent = tour.i === guestTourSteps().length - 1 ? guestT('guest_tour_done','Done') : guestT('guest_tour_next','Next');
  }

  function startGuestTour() {
    if (!isGuest() || tourOff()) return;
    ensureStyles();
    tour.active = true;
    tour.i = 0;
    if (!tour.bar) {
      tour.bar = document.createElement("div");
      tour.bar.className = "zz-tour-bar";
      tour.bar.innerHTML =
        '<button type="button" data-skip></button>' +
        '<button type="button" data-back></button>' +
        '<button type="button" class="primary" data-next></button>';
      tour.bar.querySelector('[data-skip]').textContent = guestT('guest_tour_skip','Skip');
      tour.bar.querySelector('[data-back]').textContent = guestT('guest_tour_back','Back');
      tour.bar.querySelector('[data-next]').textContent = guestT('guest_tour_next','Next');
      document.body.appendChild(tour.bar);
      tour.bar.querySelector("[data-skip]").onclick = function () { endTour(false); };
      tour.bar.querySelector("[data-back]").onclick = function () {
        tour.i = Math.max(0, tour.i - 1);
        showTourStep();
      };
      tour.bar.querySelector("[data-next]").onclick = function () {
        if (tour.i >= guestTourSteps().length - 1) endTour(true);
        else { tour.i += 1; showTourStep(); }
      };
    }
    showTourStep();
  }

  function showWelcome() {
    if (!isGuest() || welcomeSeen()) return;
    ensureStyles();
    var wrap = document.createElement("div");
    wrap.className = "zz-welcome-overlay";
    wrap.innerHTML =
      '<div class="zz-welcome-card" role="dialog" aria-modal="true" aria-labelledby="zz-welcome-title">' +
      '<h2 id="zz-welcome-title"></h2>' +
      '<p class="lead"></p>' +
      '<p class="body"></p>' +
      '<div class="zz-welcome-actions">' +
      '<button type="button" class="primary" data-start-tour></button>' +
      '<button type="button" class="secondary" data-welcome-signin></button>' +
      "</div></div>";
    wrap.querySelector("#zz-welcome-title").textContent = guestT("guest_welcome_title", "We’re making progress");
    wrap.querySelector(".lead").textContent = guestT("guest_welcome_lead", "We’re excited about this journey");
    wrap.querySelector(".body").textContent = guestT("guest_welcome_body", "ZAZISE is taking shape. Have a look around your home, then start the short tour when you're ready.");
    wrap.querySelector("[data-start-tour]").textContent = guestT("guest_welcome_tour", "Start limited tour");
    wrap.querySelector("[data-welcome-signin]").textContent = guestT("guest_welcome_signin", "Sign in");
    document.body.appendChild(wrap);
    function dismiss() {
      markWelcomeDone();
      wrap.remove();
    }
    wrap.querySelector("[data-start-tour]").onclick = function () {
      dismiss();
      startGuestTour();
    };
    wrap.querySelector("[data-welcome-signin]").onclick = function () {
      dismiss();
      location.href = loginUrl();
    };
  }

  function paintGuestProfile() {
    if (!isGuest()) return;
    ensureStyles();
    ["preview-profile-avatar", "dock-profile", "cmt-av"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = "ZA";
      el.classList.add("guest-za");
      el.classList.remove("has-photo");
      el.style.backgroundImage = "";
      el.setAttribute("title", "ZA");
      el.setAttribute("aria-label", guestT("guest_profile_za", "Guest profile ZA"));
    });
    document.querySelectorAll(".avatar:not(#preview-profile-avatar)").forEach(function (el) {
      if (el.closest(".zz-gate-card") || el.closest(".side-av")) return;
      if (!el.id && el.textContent && /^(MZ|ZA)$/i.test(el.textContent.trim())) {
        el.textContent = "ZA";
        el.classList.add("guest-za");
      }
    });
  }

  function guestSettings() {
    if (!isGuest()) return;
    var panel = document.getElementById("settings-panel");
    if (!panel) return;
    panel.querySelectorAll('[data-setting="account"], [data-setting="soon"]').forEach(function (row) {
      row.hidden = true;
      row.style.display = "none";
      row.classList.add("zz-guest-hide");
    });
    var out = document.getElementById("settings-signout");
    if (out) {
      out.textContent = guestT("guest_settings_signin", "Sign in");
      out.setAttribute("data-i18n", "guest_settings_signin");
      out.classList.remove("settings-row--out");
      out.onclick = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        location.href = loginUrl();
      };
    }
    var darkBtn = document.getElementById("settings-dark");
    if (darkBtn && !darkBtn.getAttribute("data-zz-guest-dark")) {
      darkBtn.setAttribute("data-zz-guest-dark", "1");
      darkBtn.addEventListener("click", function () {
        setTimeout(function () {
          var on = document.documentElement.classList.contains("z-dark");
          toast(on ? guestT("guest_ok_dark_on", "Dark mode is on.") : guestT("guest_ok_dark_off", "Dark mode is off."), "success", on ? "guest_ok_dark_on" : "guest_ok_dark_off");
        }, 0);
      });
    }
  }

  /** Re-hide Account/Playback/Privacy when Settings opens (display:flex overrides [hidden]). */
  function wireSettingsGuestRefresh() {
    if (document.documentElement.getAttribute("data-zz-settings-guest") === "1") return;
    document.documentElement.setAttribute("data-zz-settings-guest", "1");
    document.addEventListener("click", function (ev) {
      if (!isGuest()) return;
      var t = ev.target;
      if (!t || !t.closest) return;
      if (t.closest("[data-open-settings], #settings-panel")) {
        setTimeout(guestSettings, 0);
      }
    }, true);
    var panel = document.getElementById("settings-panel");
    if (panel && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        if (!isGuest()) return;
        if (!panel.hidden) guestSettings();
      }).observe(panel, { attributes: true, attributeFilter: ["hidden", "class"] });
    }
  }

  function likeKey(id) {
    return LIKE_PREFIX + (id || location.pathname);
  }

  function getLiked(id) {
    try { return localStorage.getItem(likeKey(id)) === "1"; } catch (e) { return false; }
  }

  function setLiked(id, on) {
    try {
      if (on) localStorage.setItem(likeKey(id), "1");
      else localStorage.removeItem(likeKey(id));
    } catch (e) {}
  }

  /** Toggle guest like — no auth. Returns new state. */
  function toggleLike(id, btn) {
    var on = !getLiked(id);
    setLiked(id, on);
    if (btn) {
      btn.classList.toggle("is-liked", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    return on;
  }

  function wireLikeButtons() {
    document.querySelectorAll("[data-zz-like], .btn-like, [data-act='like']").forEach(function (btn) {
      if (btn.getAttribute("data-zz-like-wired")) return;
      btn.setAttribute("data-zz-like-wired", "1");
      var id = btn.getAttribute("data-zz-like") || btn.getAttribute("data-video-id") || "default";
      if (getLiked(id)) {
        btn.classList.add("is-liked");
        btn.setAttribute("aria-pressed", "true");
      }
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var on = toggleLike(id, btn);
        toast(
          on ? guestT("guest_ok_liked", "Liked for this visit.") : guestT("guest_ok_unliked", "Like removed."),
          "success",
          on ? "guest_ok_liked" : "guest_ok_unliked"
        );
      });
    });
  }

  /**
   * Gate locked actions. opts.blurSelector limits blur to locked area.
   * Buttons stay visible; state does not flip to Subscribed/Saved/Deleted.
   */
  function gate(el, opts) {
    if (!el) return;
    opts = opts || {};
    el.addEventListener("click", function (ev) {
      if (!isGuest()) return;
      ev.preventDefault();
      ev.stopPropagation();
      openGate(opts);
    }, true);
  }

  function gateSelector(sel, opts) {
    document.querySelectorAll(sel).forEach(function (el) { gate(el, opts); });
  }

  /** Document capture runs before later chrome navigators (e.g. cooking-toast). */
  function wireDocumentGate() {
    if (document.documentElement.getAttribute("data-zz-doc-gate") === "1") return;
    document.documentElement.setAttribute("data-zz-doc-gate", "1");
    document.addEventListener("click", function (ev) {
      if (!isGuest()) return;
      var t = ev.target;
      if (!t || !t.closest) return;
      var hit =
        t.closest("[data-zz-gate], [data-act='upload'], [data-act='subscribe'], [data-act='dislike'], [data-act='save'], [data-act='edit'], [data-act='delete'], .btn-subscribe, #nav-yours, a[href*='studio'], a[href*='upload'], a[href*='clips'], a[href*='reels'], [data-dock='clips'], [data-dock='profile'], a[title='Clips'], button.icon-btn");
      if (!hit) return;
      // Allow pure like
      if (hit.matches("[data-zz-like], .btn-like, [data-act='like']") || hit.closest("[data-zz-like], .btn-like, [data-act='like']")) return;
      // Create plus button (same path glyph cooking-toast uses)
      var isCreate = hit.matches("button.icon-btn") && !hit.hasAttribute("data-bell") && hit.querySelector('path[d="M12 5v14M5 12h14"]');
      var isBell = hit.hasAttribute("data-bell") || (hit.matches("button.icon-btn") && hit.querySelector('path[d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7"]'));
      var isStudio = !!(hit.closest("#nav-yours, a[href*='studio'], [data-dock='profile'], #preview-profile-avatar"));
      var isClips = !!(hit.closest("a[href*='clips'], a[href*='reels'], [data-dock='clips'], a[title='Clips'], [data-zz-gate='clips']"));
      var isLockedWrite = !!(hit.closest("[data-zz-gate], [data-act='upload'], [data-act='subscribe'], [data-act='dislike'], [data-act='save'], [data-act='edit'], [data-act='delete'], .btn-subscribe, a[href*='upload']"));
      if (!(isCreate || isBell || isStudio || isClips || isLockedWrite)) return;
      var blur = null;
      if (isStudio) blur = "#nav-yours, #preview-profile-avatar, .studio-main";
      else if (isClips) blur = hit.closest("a[href*='clips'], a[href*='reels'], [data-dock='clips'], a[title='Clips']") || hit;
      else if (isCreate || isBell) blur = ".app-bar-actions";
      else if (hit.closest(".watch-actions, .channel-row")) blur = ".watch-actions, .channel-row";
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
      openGate({ blurSelector: blur });
    }, true);
  }

  function wireLockedActions(page) {
    if (!isGuest()) return;
    // Universal locked writes (stay visible)
    gateSelector(
      ".btn-subscribe, [data-act='subscribe'], [data-act='dislike'], [data-act='comment'], [data-act='save'], " +
      "[data-act='upload'], [data-act='edit'], [data-act='delete'], " +
      "a[href*='upload'], button[title='Create'], .icon-btn[title='Create'], " +
      "[data-card-act='save'], [data-card-act='not'], [data-open-upload]",
      { blurSelector: optsBlur(page, "action") }
    );

    // Studios — blur studio area only
    gateSelector("a[href*='studio'], #nav-yours, [data-dock='profile']", {
      blurSelector: page === "studio" ? ".studio-main, .channel-main, main, .layout" : "#nav-yours, .sidebar, #preview-sidebar"
    });

    // Clips nav / surfaces — stay visible but never navigate/play for guests
    gateSelector(
      "a[href*='clips'], a[href*='reels'], a[title='Clips'], [data-dock='clips'], [data-zz-gate='clips']",
      { blurSelector: "a[href*='clips'], a[href*='reels'], [data-dock='clips']" }
    );
    if (page === "clips" || page === "reels") {
      gateSelector(".clips-stage, .clip-stage, .reel-stage, video", {
        blurSelector: ".clips-stage, .clip-stage, .reel-stage, main"
      });
      document.querySelectorAll("video").forEach(function (v) {
        try { v.pause(); v.removeAttribute("src"); v.load(); } catch (e) {}
      });
    }
  }

  function optsBlur(page, kind) {
    if (page === "watch") return ".actions, .watch-actions, .meta-actions";
    if (page === "studio") return ".studio-main, main";
    if (page === "upload") return ".upload-main, main, .uploader";
    return null;
  }

  function applyStudioLogo() {
    var nav = document.getElementById("nav-yours");
    if (!nav) return;
    var ico = nav.querySelector(".ico");
    if (!ico) return;
    /* Menu gray via currentColor (same as other .ico strokes) */
    ico.innerHTML = '<span class="ico-logo ico-logo--mask" role="img" aria-hidden="true"></span>';
  }

  /** Main drawer/sidebar menu is registered users only */
  function gateGuestMenu() {
    if (!isGuest()) {
      document.documentElement.classList.remove("zz-guest-no-menu");
      return;
    }
    document.documentElement.classList.add("zz-guest-no-menu");
    var sidebar = document.getElementById("preview-sidebar") || document.querySelector(".sidebar");
    var burger = document.querySelector(".menu-btn");
    var scrim = document.getElementById("menu-scrim");
    if (sidebar) {
      sidebar.setAttribute("hidden", "");
      sidebar.setAttribute("aria-hidden", "true");
    }
    if (burger) {
      burger.setAttribute("hidden", "");
      burger.setAttribute("aria-disabled", "true");
      burger.setAttribute("aria-expanded", "false");
    }
    if (scrim) {
      scrim.setAttribute("hidden", "");
      scrim.setAttribute("aria-hidden", "true");
    }
    try {
      document.body.classList.remove("menu-open");
      if (sidebar) sidebar.classList.add("mini");
    } catch (e) {}
  }

  /** Signed-in-only tour stubs (subscriptions / their studio) */
  function tourStubs() {
    global.ZaziseTours = global.ZaziseTours || {};
    global.ZaziseTours.subscriptions = function () {
      /* gold fill = not subscribed, gold outline = subscribed; subscribed studios in menu */
      return { id: "subscriptions", signedInOnly: true };
    };
    global.ZaziseTours.theirStudio = function () {
      /* "this is not your studio"; unsubscribe drops from menu; Back returns signed in */
      return { id: "their-studio", signedInOnly: true };
    };
  }

  function init(page) {
    page = page || (document.body && document.body.getAttribute("data-zz-page")) || "home";
    ensureStyles();
    document.documentElement.classList.add("zz-guest-no-menu");
    tourStubs();
    applyStudioLogo();
    gateGuestMenu();
    document.addEventListener("zazise:auth", function () {
      gateGuestMenu();
      applyStudioLogo();
    });

    if (isGuest()) {
      paintGuestProfile();
      guestSettings();
      wireSettingsGuestRefresh();
      wireLikeButtons();
      wireDocumentGate();
      wireLockedActions(page);
      document.querySelectorAll("[data-zz-gate]").forEach(function (el) {
        var kind = el.getAttribute("data-zz-gate");
        var blur = kind === "studio" ? "#nav-yours, .studio-main, main" : (kind === "clips" ? el : (kind === "upload" ? ".upload-main, .app-bar-actions" : null));
        gate(el, { blurSelector: blur });
      });
      document.querySelectorAll("input[data-act='comment'], textarea[data-act='comment']").forEach(function (el) {
        el.addEventListener("focus", function (ev) {
          if (!isGuest()) return;
          ev.target.blur();
          openGate({ blurSelector: ".comments-header, .comment-row, .watch-actions" });
        });
      });
      if (page === "clips" || page === "reels") {
        document.querySelectorAll("video").forEach(function (v) {
          try { v.pause(); v.removeAttribute("src"); v.load(); } catch (e) {}
        });
        openGate({
          blurSelector: ".clips-stage, .clip-stage, .reel-stage, main",
          leaveClipsOnClose: true
        });
      }
      if (page === "home" || page === "preview") {
        // Defer welcome slightly so chrome paints first
        setTimeout(showWelcome, 200);
      }
    }

    // Expose for page scripts
    document.addEventListener("zazise:lang", function () {
      if (!isGuest()) return;
      guestSettings();
      paintGuestProfile();
      var g = document.getElementById("zz-guest-gate");
      if (g && !g.hidden) {
        var title = g.querySelector("#zz-gate-title");
        var body = g.querySelector("[data-zz-gate-body]");
        var btn = g.querySelector("[data-zz-signin]");
        if (title) title.textContent = guestT("guest_gate_title", "Sign in to continue.");
        if (body) body.textContent = guestT("guest_gate_body", "This needs an account. You can keep watching public videos.");
        if (btn) btn.textContent = guestT("guest_gate_signin", "Sign in");
      }
      if (tour.bar) {
        var skip = tour.bar.querySelector("[data-skip]");
        var back = tour.bar.querySelector("[data-back]");
        var next = tour.bar.querySelector("[data-next]");
        if (skip) skip.textContent = guestT("guest_tour_skip", "Skip");
        if (back) back.textContent = guestT("guest_tour_back", "Back");
        if (next) next.textContent = tour.i >= guestTourSteps().length - 1 ? guestT("guest_tour_done", "Done") : guestT("guest_tour_next", "Next");
        if (tour.active) showTourStep();
      }
    });

    global.ZaziseGuest = {
      isGuest: isGuest,
      gateGuestMenu: gateGuestMenu,
      openGate: openGate,
      closeGate: closeGate,
      toggleLike: toggleLike,
      getLiked: getLiked,
      startGuestTour: startGuestTour,
      showWelcome: showWelcome,
      paintGuestProfile: paintGuestProfile,
      loginUrl: loginUrl
    };
  }

  var bootTag = document.currentScript;
  function boot() {
    var tag = bootTag || document.querySelector("script[src*='guest-gate']");
    init(tag && tag.getAttribute("data-page"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
