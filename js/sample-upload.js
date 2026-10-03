/**
 * Upload sample. File bytes never leave this browser.
 */
(function () {
  "use strict";

  var S = window.ZaziseSample;
  if (!S || !document.getElementById("upload-drop")) return;

  var state = {
    id: null,
    file: null,
    existingBlob: false,
    duration: 0,
    frames: [],
    thumb: "",
    thumbIndex: 0,
    ready: false,
    frameJob: null,
    saving: false
  };

  var drop = document.getElementById("upload-drop");
  var fileInput = document.getElementById("upload-file");
  var thumbInput = document.getElementById("thumb-file");
  var titleEl = document.getElementById("up-title");
  var descEl = document.getElementById("up-desc");
  var playlistEl = document.getElementById("up-playlist");
  var categoryEl = document.getElementById("up-category");
  var scheduleEl = document.getElementById("up-schedule");
  var previewImg = document.getElementById("up-preview-img");
  var fileMeta = document.getElementById("up-file-meta");
  var thumbRow = document.getElementById("up-thumbs");
  var progress = document.getElementById("upload-progress");
  var publishBtn = document.getElementById("publish-btn");
  var stepEls = [
    document.getElementById("step-select"),
    document.getElementById("step-details"),
    document.getElementById("step-visibility")
  ];

  function toast(message, kind) {
    if (window.ZaziseCookingToast) ZaziseCookingToast.show(message, kind || "success");
  }

  function qsKind() {
    var picked = document.querySelector('input[name="kind"]:checked');
    return picked ? picked.value : "video";
  }

  function setKind(value) {
    var input = document.querySelector('input[name="kind"][value="' + value + '"]');
    if (input) input.checked = true;
    paintKind();
  }

  function paintKind() {
    var phone = S.isPhone();
    document.body.classList.toggle("upload-is-phone", phone);
    if (phone) setKindSilent("clip");
    document.querySelectorAll(".type-card").forEach(function (card) {
      var input = card.querySelector("input");
      card.classList.toggle("is-selected", !!(input && input.checked));
    });
  }

  function setKindSilent(value) {
    var input = document.querySelector('input[name="kind"][value="' + value + '"]');
    if (input && !input.checked) input.checked = true;
  }

  function setStep(n) {
    stepEls.forEach(function (el, i) {
      if (!el) return;
      el.classList.toggle("done", i < n);
      el.classList.toggle("active", i === n);
    });
  }

  function formatBytes(n) {
    if (!n && n !== 0) return "";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(1) + " MB";
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

  function paintMeta() {
    var name = state.file ? state.file.name : (state.filename || "No file yet");
    var size = state.file ? state.file.size : state.size || 0;
    fileMeta.textContent = "Filename: " + name + "\nSize: " + (size ? formatBytes(size) : "—") + " · Duration: " + (state.duration ? formatDur(state.duration) : "—");
    if (state.thumb) {
      previewImg.src = state.thumb;
      previewImg.hidden = false;
    }
  }

  function renderThumbs() {
    thumbRow.querySelectorAll("[data-frame]").forEach(function (n) { n.remove(); });
    state.frames.forEach(function (src, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb-pick" + (state.thumbIndex === i ? " is-on" : "");
      btn.dataset.frame = String(i);
      btn.innerHTML = '<img alt="" decoding="async" />';
      btn.querySelector("img").src = src;
      btn.addEventListener("click", function () {
        state.thumbIndex = i;
        state.thumb = src;
        renderThumbs();
        paintMeta();
      });
      thumbRow.insertBefore(btn, thumbRow.firstChild);
    });
    var custom = document.getElementById("thumb-custom");
    if (custom) custom.classList.toggle("is-on", state.thumbIndex === -1);
  }

  function extractFrames(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.style.cssText = "position:fixed;left:-9999px;top:0;width:160px;height:90px;opacity:0;pointer-events:none";
      document.body.appendChild(video);
      var frames = [];
      var settled = false;
      function finish(duration) {
        if (settled) return;
        settled = true;
        try { URL.revokeObjectURL(url); } catch (e) {}
        if (video.parentNode) video.parentNode.removeChild(video);
        resolve({ duration: duration || 0, frames: frames });
      }
      function grab() {
        try {
          var canvas = document.createElement("canvas");
          var w = 320;
          var h = 180;
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d", { alpha: false });
          ctx.drawImage(video, 0, 0, w, h);
          frames.push(canvas.toDataURL("image/jpeg", 0.72));
        } catch (e) {}
      }
      video.onerror = function () { finish(0); };
      video.onloadedmetadata = function () {
        var dur = video.duration;
        if (!isFinite(dur) || dur <= 0) {
          video.currentTime = 0;
          video.onseeked = function () {
            grab();
            finish(0);
          };
          return;
        }
        var times = [Math.min(0.15, dur / 10), dur * 0.35, Math.max(0, dur * 0.7)];
        var i = 0;
        video.onseeked = function () {
          grab();
          i += 1;
          if (i >= times.length) finish(dur);
          else {
            try { video.currentTime = times[i]; } catch (e2) { finish(dur); }
          }
        };
        try { video.currentTime = times[0]; } catch (e3) { finish(dur); }
      };
      video.src = url;
      setTimeout(function () { finish(0); }, 12000);
    });
  }

  function onFile(file) {
    if (!file) return;
    if (file.type && file.type.indexOf("video/") !== 0 && !/\.(mp4|webm|mov|m4v|ogg)$/i.test(file.name)) {
      toast("Choose a video file.", "error");
      return;
    }
    state.file = file;
    state.filename = file.name;
    state.size = file.size;
    state.ready = false;
    state.frames = [];
    state.thumb = "";
    state.thumbIndex = 0;
    if (!titleEl.value.trim()) {
      titleEl.value = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
    }
    progress.hidden = false;
    publishBtn.disabled = true;
    setStep(1);
    paintMeta();
    var job = extractFrames(file);
    state.frameJob = job;
    job.then(function (out) {
      if (state.frameJob !== job) return;
      state.duration = out.duration || 0;
      state.frames = out.frames || [];
      state.thumb = state.frames[0] || state.thumb || "";
      state.thumbIndex = state.frames.length ? 0 : -1;
      state.ready = true;
      progress.hidden = true;
      publishBtn.disabled = false;
      renderThumbs();
      paintMeta();
      setStep(1);
      toast(state.frames.length
        ? "Video ready. Pick a thumbnail, then save or publish."
        : "Video ready. Upload a thumbnail if the preview stayed blank.", "success");
    });
  }

  function visibility() {
    var input = document.querySelector('input[name="vis"]:checked');
    return input ? input.value : "public";
  }

  function collect(status) {
    var phone = S.isPhone();
    var kind = phone ? "clip" : qsKind();
    var ch = S.channelFromProfile();
    var schedule = scheduleEl.value || "";
    return {
      id: state.id || S.newId(),
      title: titleEl.value.trim(),
      description: descEl.value.trim(),
      playlist: playlistEl.value,
      category: categoryEl.value,
      visibility: visibility(),
      scheduleAt: schedule ? new Date(schedule).toISOString() : "",
      kind: kind,
      uploadedOnMobile: phone,
      surfaces: S.surfacesFor(kind, phone),
      createdAt: state.createdAt || Date.now(),
      updatedAt: Date.now(),
      duration: state.duration || 0,
      filename: state.filename || (state.file && state.file.name) || "",
      size: state.size || (state.file && state.file.size) || 0,
      thumb: state.thumb || "",
      frames: state.frames || [],
      status: status,
      views: state.views || 0,
      channel: ch.name,
      handle: ch.handle,
      photo: ch.photo || ""
    };
  }

  function save(status) {
    if (state.saving) return;
    if (!state.file && !state.existingBlob) {
      toast("Select a video first.", "error");
      setStep(0);
      return;
    }
    if (status === "published" && !titleEl.value.trim()) {
      toast("Add a title before you publish.", "error");
      titleEl.focus();
      return;
    }
    if (status === "draft" && !titleEl.value.trim()) {
      titleEl.value = state.filename || "Untitled draft";
    }
    state.saving = true;
    publishBtn.disabled = true;
    var pending = state.frameJob || Promise.resolve();
    pending.then(function () {
      var meta = collect(status);
      state.id = meta.id;
      state.createdAt = meta.createdAt;
      var blob = state.file || null;
      return S.put(meta, blob);
    }).then(function (meta) {
      state.saving = false;
      publishBtn.disabled = false;
      if (state.file) {
        state.existingBlob = true;
        state.file = null;
      }
      if (status === "draft") {
        toast("Draft saved on this device.", "success");
        if (history.replaceState) {
          history.replaceState(null, "", "upload.html?id=" + encodeURIComponent(meta.id));
        }
        return;
      }
      var nonce = meta.id + ":" + Date.now();
      try { sessionStorage.setItem("zazisePublishConfetti", nonce); } catch (e) {}
      location.href = "studio.html";
    }).catch(function () {
      state.saving = false;
      publishBtn.disabled = false;
      toast("Could not save in this browser. Check storage space.", "error");
    });
  }

  function loadExisting(id) {
    S.getMeta(id).then(function (meta) {
      if (!meta) return;
      state.id = meta.id;
      state.createdAt = meta.createdAt;
      state.views = meta.views || 0;
      state.existingBlob = true;
      state.duration = meta.duration || 0;
      state.filename = meta.filename || "";
      state.size = meta.size || 0;
      state.frames = meta.frames || [];
      state.thumb = meta.thumb || (state.frames[0] || "");
      state.thumbIndex = state.frames.indexOf(state.thumb);
      state.ready = true;
      titleEl.value = meta.title || "";
      descEl.value = meta.description || "";
      if (meta.playlist) playlistEl.value = meta.playlist;
      if (meta.category) categoryEl.value = meta.category;
      if (meta.scheduleAt) {
        var d = new Date(meta.scheduleAt);
        if (!isNaN(d.getTime())) {
          var local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          scheduleEl.value = local;
        }
      }
      var vis = document.querySelector('input[name="vis"][value="' + (meta.visibility || "public") + '"]');
      if (vis) vis.checked = true;
      paintVis();
      if (!S.isPhone() && meta.kind) setKind(meta.kind);
      renderThumbs();
      paintMeta();
      setStep(1);
      progress.hidden = true;
      publishBtn.disabled = false;
      return S.objectUrl(meta.id);
    }).then(function (url) {
      if (!url) return;
      var vid = document.getElementById("up-preview-video");
      if (!vid) return;
      vid.src = url;
      vid.hidden = false;
    }).catch(function () {});
  }

  function paintVis() {
    document.querySelectorAll(".visibility-opts label").forEach(function (label) {
      var input = label.querySelector("input");
      label.classList.toggle("selected", !!(input && input.checked));
    });
  }

  function resizeImage(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var maxW = 640;
        var scale = Math.min(1, maxW / img.width);
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        try { URL.revokeObjectURL(url); } catch (e) {}
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = function () {
        try { URL.revokeObjectURL(url); } catch (e) {}
        resolve("");
      };
      img.src = url;
    });
  }

  drop.addEventListener("dragover", function (ev) {
    ev.preventDefault();
    drop.classList.add("is-hot");
  });
  drop.addEventListener("dragleave", function () { drop.classList.remove("is-hot"); });
  drop.addEventListener("drop", function (ev) {
    ev.preventDefault();
    drop.classList.remove("is-hot");
    var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    onFile(file);
  });
  document.getElementById("select-files").addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function () {
    onFile(fileInput.files && fileInput.files[0]);
    fileInput.value = "";
  });
  document.getElementById("thumb-custom").addEventListener("click", function () { thumbInput.click(); });
  thumbInput.addEventListener("change", function () {
    var file = thumbInput.files && thumbInput.files[0];
    thumbInput.value = "";
    if (!file) return;
    resizeImage(file).then(function (url) {
      if (!url) return;
      state.thumb = url;
      state.thumbIndex = -1;
      renderThumbs();
      paintMeta();
    });
  });
  document.querySelectorAll('input[name="kind"]').forEach(function (input) {
    input.addEventListener("change", function () {
      if (S.isPhone()) setKindSilent("clip");
      paintKind();
    });
  });
  document.querySelectorAll('input[name="vis"]').forEach(function (input) {
    input.addEventListener("change", function () {
      paintVis();
      setStep(2);
    });
  });
  scheduleEl.addEventListener("focus", function () { setStep(2); });
  document.getElementById("save-draft").addEventListener("click", function () { save("draft"); });
  document.getElementById("save-draft-2").addEventListener("click", function () { save("draft"); });
  publishBtn.addEventListener("click", function () { save("published"); });
  document.getElementById("upload-back").addEventListener("click", function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  });
  window.addEventListener("resize", paintKind);

  paintKind();
  paintVis();
  setStep(0);
  publishBtn.disabled = true;
  var params = new URLSearchParams(location.search);
  var existing = params.get("id");
  if (existing) loadExisting(existing);
})();
