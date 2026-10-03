/**
 * Studio sample. Own uploads from this browser. Banner in localStorage.
 */
(function () {
  "use strict";

  var S = window.ZaziseSample;
  var grid = document.getElementById("studio-grid");
  if (!S || !grid) return;

  var demoHtml = grid.innerHTML;
  var tab = "home";
  var rows = [];

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatDur(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (m >= 60) {
      var h = Math.floor(m / 60);
      m = m % 60;
      return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }
    return m + ":" + String(s).padStart(2, "0");
  }

  function when(ts) {
    var d = Date.now() - (ts || Date.now());
    var mins = Math.round(d / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + " hours ago";
    var days = Math.round(hrs / 24);
    if (days < 14) return days + " days ago";
    return new Date(ts).toLocaleDateString();
  }

  function profileOn() {
    var p = S.readProfile();
    if (p && (p.firstName || p.name || p.email || p.fromApi)) return p;
    if (window.ZaziseAuth && ZaziseAuth.user && (ZaziseAuth.user.name || ZaziseAuth.user.email)) return ZaziseAuth.user;
    return null;
  }

  function applyBanner() {
    var img = document.getElementById("studio-banner-img");
    var stored = S.banner();
    if (img && stored) img.src = stored;
  }

  function userMode() {
    return !!profileOn() || rows.length > 0;
  }

  function paintHeader() {
    var mine = userMode();
    var ch = S.channelFromProfile();
    var name = document.getElementById("studio-name");
    var handle = document.getElementById("studio-handle");
    var stats = document.getElementById("studio-stats");
    var avatar = document.getElementById("studio-avatar");
    var sub = document.getElementById("studio-subscribe");
    var note = document.getElementById("studio-sample-note");
    if (!mine) {
      if (note) note.hidden = true;
      return;
    }
    if (name) name.textContent = ch.name || "Your studio";
    if (handle) handle.textContent = "@" + (ch.handle || "you") + " · This browser";
    var views = rows.reduce(function (n, r) { return n + (r.views || 0); }, 0);
    var clips = rows.filter(function (r) { return (r.surfaces || []).indexOf("clips") !== -1; }).length;
    if (stats) stats.textContent = rows.length + " uploads · " + clips + " in Clips · " + views + " views";
    if (avatar) {
      avatar.innerHTML = "";
      if (ch.photo) {
        var img = document.createElement("img");
        img.src = ch.photo;
        img.alt = "";
        avatar.appendChild(img);
      } else {
        avatar.textContent = (ch.name || "Y").trim().charAt(0).toUpperCase();
        avatar.classList.add("studio-avatar-letter");
      }
    }
    if (sub) {
      sub.textContent = "Upload";
      sub.setAttribute("href", "upload.html");
      sub.removeAttribute("data-act");
    }
    if (note) note.hidden = false;
  }

  function filtered() {
    var list = rows.slice().sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    if (tab === "videos") {
      return list.filter(function (r) { return (r.surfaces || []).indexOf("timeline") !== -1; });
    }
    if (tab === "clips") {
      return list.filter(function (r) { return (r.surfaces || []).indexOf("clips") !== -1; });
    }
    return list;
  }

  function watchHref(item) {
    var surfaces = item.surfaces || [];
    var clipOnly = surfaces.indexOf("clips") !== -1 && surfaces.indexOf("timeline") === -1;
    if (clipOnly) return "clips.html?clip=" + encodeURIComponent(item.id);
    return "watch.html?v=" + encodeURIComponent(item.id) + "&sample=1";
  }

  function badge(item) {
    if (item.status === "draft") return "Draft";
    if (item.scheduleAt && Date.parse(item.scheduleAt) > Date.now()) return "Scheduled";
    if (item.visibility === "private") return "Private";
    if (item.visibility === "unlisted") return "Unlisted";
    return (item.views || 0) + " views";
  }

  function kindLabel(item) {
    if (item.uploadedOnMobile || item.kind === "clip") return "Clip";
    if (item.kind === "both") return "Video + Clip";
    return "Video";
  }

  function card(item) {
    var href = watchHref(item);
    var thumb = item.thumb || "";
    var art = document.createElement("article");
    art.className = "video-card studio-own-card";
    art.dataset.id = item.id;
    var thumbHtml = thumb
      ? '<img src="' + esc(thumb) + '" alt="" loading="lazy" decoding="async" />'
      : '<span class="studio-nothumb">No thumbnail</span>';
    art.innerHTML =
      '<a class="thumb" href="' + esc(href) + '">' + thumbHtml +
      '<span class="dur">' + esc(formatDur(item.duration)) + '</span></a>' +
      '<div class="video-meta"><div class="info">' +
      '<div class="title">' + esc(item.title || "Untitled") + '</div>' +
      '<div class="sub">' + esc(kindLabel(item)) + ' · ' + esc(badge(item)) + ' · ' + esc(when(item.createdAt)) + '</div>' +
      '</div></div>' +
      '<div class="studio-actions">' +
      '<a href="' + esc(href) + '">Watch</a>' +
      (item.kind === "both" ? '<a href="clips.html?clip=' + encodeURIComponent(item.id) + '">Clips</a>' : '') +
      '<a href="upload.html?id=' + encodeURIComponent(item.id) + '">Edit</a>' +
      '<button type="button" data-del="' + esc(item.id) + '">Delete</button>' +
      '</div>';
    return art;
  }

  function paintGrid() {
    if (!userMode()) {
      grid.innerHTML = demoHtml;
      return;
    }
    var list = filtered();
    grid.innerHTML = "";
    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "studio-empty";
      empty.textContent = rows.length
        ? "Nothing in this tab yet."
        : "No uploads on this device yet. Upload a video and it will show here.";
      grid.appendChild(empty);
      return;
    }
    list.forEach(function (item) { grid.appendChild(card(item)); });
  }

  function paint() {
    paintHeader();
    paintGrid();
  }

  function reload() {
    S.list().then(function (list) {
      rows = list || [];
      paint();
    }).catch(function () {
      rows = [];
      paint();
    });
  }

  document.querySelectorAll("[data-studio-tab]").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      var next = el.getAttribute("data-studio-tab");
      if (next === "playlists" || next === "community" || next === "about") {
        if (window.ZaziseCookingToast) {
          ZaziseCookingToast.show(null, "cooking", "pv_cooking");
        }
        return;
      }
      tab = next;
      document.querySelectorAll("[data-studio-tab]").forEach(function (t) {
        t.classList.toggle("active", t === el);
      });
      paintGrid();
    });
  });

  grid.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-del]");
    if (!btn) return;
    ev.preventDefault();
    var id = btn.getAttribute("data-del");
    if (!confirm("Delete this upload from this browser?")) return;
    S.remove(id).then(reload).catch(function () {
      if (window.ZaziseCookingToast) ZaziseCookingToast.show("Could not delete it.", "error");
    });
  });

  var bannerInput = document.getElementById("studio-banner-file");
  if (bannerInput) {
    bannerInput.addEventListener("change", function () {
      var file = bannerInput.files && bannerInput.files[0];
      bannerInput.value = "";
      if (!file) return;
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var maxW = 1600;
        var scale = Math.min(1, maxW / img.width);
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        try { URL.revokeObjectURL(url); } catch (e) {}
        var data = canvas.toDataURL("image/jpeg", 0.82);
        S.setBanner(data);
        applyBanner();
      };
      img.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} };
      img.src = url;
    });
  }

  var subBtn = document.getElementById("studio-subscribe");
  if (subBtn) {
    subBtn.addEventListener("click", function (ev) {
      if ((subBtn.getAttribute("href") || "") === "#") ev.preventDefault();
    });
  }

  document.addEventListener("zazise:auth", reload);
  applyBanner();
  reload();
})();
