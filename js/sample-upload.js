/**
 * Upload sample. File bytes never leave this browser.
 * Desktop / Phone / Both is an explicit choice. Viewport only suggests a default.
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
    durationKnown: false,
    frames: [],
    thumb: "",
    thumbIndex: 0,
    ready: false,
    frameJob: null,
    saving: false,
    kindTouched: false,
    previewUrl: "",
    unplayable: false
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
  var previewVideo = document.getElementById("up-preview-video");
  var previewEmpty = document.getElementById("up-preview-empty");
  var previewChrome = document.getElementById("up-preview-chrome");
  var previewNote = document.getElementById("up-preview-note");
  var timeEl = document.getElementById("up-time");
  var scrub = document.getElementById("up-scrub");
  var playBtn = document.getElementById("up-play");
  var fileNameEl = document.getElementById("up-file-name");
  var fileSizeEl = document.getElementById("up-file-size");
  var fileMeta = document.getElementById("up-file-meta");
  var changeBtn = document.getElementById("change-file");
  var thumbRow = document.getElementById("up-thumbs");
  var progress = document.getElementById("upload-progress");
  var publishBtn = document.getElementById("publish-btn");
  var wrap = document.querySelector(".upload-wrap");
  var stepEls = [
    document.getElementById("step-select"),
    document.getElementById("step-details"),
    document.getElementById("step-visibility")
  ];
  var scrubbing = false;

  function toast(message, kind) {
    if (window.ZaziseCookingToast) ZaziseCookingToast.show(message, kind || "success");
  }

  function qsKind() {
    var picked = document.querySelector('input[name="kind"]:checked');
    return picked ? picked.value : "video";
  }

  function suggestedKind() {
    return S.isPhone() ? "clip" : "video";
  }

  function setKind(value) {
    var input = document.querySelector('input[name="kind"][value="' + value + '"]');
    if (input) input.checked = true;
    paintKind();
  }

  function paintKind() {
    document.body.classList.toggle("upload-is-phone", S.isPhone());
    var kind = qsKind();
    document.body.dataset.uploadChoice = kind;
    document.querySelectorAll(".type-card").forEach(function (card) {
      var input = card.querySelector("input");
      card.classList.toggle("is-selected", !!(input && input.checked));
    });
    var deskOn = kind === "video" || kind === "both";
    var phoneOn = kind === "clip" || kind === "both";
    document.querySelectorAll("[data-stage]").forEach(function (el) {
      var on = el.getAttribute("data-stage") === "desk" ? deskOn : phoneOn;
      el.classList.toggle("is-on", on);
      el.classList.toggle("is-off", !on);
    });
    var note = document.getElementById("choice-note");
    if (note) {
      if (kind === "clip") note.textContent = "Phone · Clips. This lands on the clips page only, not the home timeline.";
      else if (kind === "both") note.textContent = "Both. Home timeline and the clips page.";
      else note.textContent = "Desktop. Home timeline only. A phone can still choose this.";
    }
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

  function formatClock(sec) {
    if (!isFinite(sec) || sec < 0) return "\u2014";
    sec = Math.round(sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (m >= 60) {
      var h = Math.floor(m / 60);
      m = m % 60;
      return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function paintClock() {
    if (!timeEl) return;
    var cur = previewVideo && !previewVideo.hidden && isFinite(previewVideo.currentTime) ? previewVideo.currentTime : 0;
    var total = state.durationKnown ? formatClock(state.duration) : "\u2014";
    timeEl.textContent = formatClock(cur) + " / " + total;
    if (scrub && !scrubbing) {
      if (state.durationKnown && state.duration > 0 && !state.unplayable) {
        scrub.disabled = false;
        scrub.classList.remove("is-pending");
        scrub.value = String(Math.round((cur / state.duration) * 1000));
      } else {
        scrub.disabled = true;
        scrub.classList.add("is-pending");
        scrub.value = "0";
      }
    }
  }

  function paintPosters() {
    var src = state.thumb || "";
    document.querySelectorAll(".stage-poster").forEach(function (img) {
      if (src) {
        img.src = src;
        img.hidden = false;
      } else {
        img.removeAttribute("src");
        img.hidden = true;
      }
    });
    if (!previewImg) return;
    if (src) {
      previewImg.src = src;
      previewImg.hidden = false;
      if (previewVideo) previewVideo.poster = src;
    }
  }

  function paintMeta() {
    var name = state.file ? state.file.name : (state.filename || "No file yet");
    var size = state.file ? state.file.size : state.size || 0;
    if (fileNameEl) fileNameEl.textContent = name;
    if (fileSizeEl) fileSizeEl.textContent = size ? formatBytes(size) : "";
    var durText = state.durationKnown ? formatClock(state.duration) : (state.ready ? "unavailable in this browser" : "\u2014");
    fileMeta.textContent = "Duration: " + durText;
    paintPosters();
    paintClock();
    var hasFile = !!(state.file || state.existingBlob || state.filename);
    if (wrap) wrap.classList.toggle("has-file", hasFile);
    if (changeBtn) changeBtn.hidden = !hasFile;
    if (previewEmpty) previewEmpty.hidden = hasFile;
    if (previewChrome) previewChrome.hidden = !hasFile;
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

  function placeholderPoster(name) {
    var canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1c2430";
    ctx.fillRect(0, 0, 640, 360);
    ctx.fillStyle = "#E2AE41";
    ctx.beginPath();
    ctx.arc(320, 150, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1c2430";
    ctx.beginPath();
    ctx.moveTo(312, 136);
    ctx.lineTo(336, 150);
    ctx.lineTo(312, 164);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "600 22px sans-serif";
    ctx.fillText(String(name || "Video").slice(0, 40), 24, 310);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  function grabFrame(video) {
    try {
      var canvas = document.createElement("canvas");
      var w = 320;
      var h = 180;
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext("2d", { alpha: false });
      ctx.fillStyle = "#1c2430";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);
      return canvas.toDataURL("image/jpeg", 0.72);
    } catch (e) {
      return "";
    }
  }

  function finiteDuration(video) {
    var d = video && video.duration;
    return isFinite(d) && d > 0 ? d : 0;
  }

  function extractFramesFrom(video) {
    return new Promise(function (resolve) {
      var frames = [];
      var settled = false;
      function finish(duration) {
        if (settled) return;
        settled = true;
        video.onseeked = null;
        resolve({
          duration: isFinite(duration) && duration > 0 ? duration : 0,
          frames: frames.filter(Boolean)
        });
      }
      function startGrabs(dur) {
        var times = [Math.min(0.2, dur / 10), dur * 0.35, Math.max(0.25, Math.min(dur - 0.05, dur * 0.7))];
        var i = 0;
        video.onseeked = function () {
          var shot = grabFrame(video);
          if (shot) frames.push(shot);
          i += 1;
          if (i >= times.length) {
            try { video.currentTime = 0; } catch (e) {}
            finish(dur);
          } else {
            try { video.currentTime = times[i]; } catch (e2) { finish(dur); }
          }
        };
        try { video.currentTime = times[0]; } catch (e3) { finish(dur); }
      }
      function afterMeta() {
        var dur = finiteDuration(video);
        if (dur) {
          startGrabs(dur);
          return;
        }
        var fixed = false;
        function onTime() {
          var d2 = finiteDuration(video);
          if (!d2 || video.currentTime < 1) return;
          if (fixed) return;
          fixed = true;
          video.removeEventListener("timeupdate", onTime);
          startGrabs(d2);
        }
        video.addEventListener("timeupdate", onTime);
        try { video.currentTime = 1e101; } catch (e) { finish(0); }
      }
      if (video.readyState >= 1) afterMeta();
      else video.addEventListener("loadedmetadata", afterMeta, { once: true });
      video.addEventListener("error", function () { finish(0); }, { once: true });
      setTimeout(function () { finish(finiteDuration(video)); }, 12000);
    });
  }

  function attachPreview(file) {
    if (state.previewUrl) {
      try { URL.revokeObjectURL(state.previewUrl); } catch (e) {}
      state.previewUrl = "";
    }
    state.unplayable = false;
    if (previewNote) previewNote.hidden = true;
    if (!file || !previewVideo) return;
    state.previewUrl = URL.createObjectURL(file);
    previewVideo.hidden = true;
    previewVideo.removeAttribute("src");
    previewVideo.src = state.previewUrl;
    previewVideo.load();
    previewVideo.onerror = function () {
      state.unplayable = true;
      previewVideo.hidden = true;
      if (previewNote) previewNote.hidden = false;
      if (!state.thumb) {
        state.thumb = placeholderPoster(file.name);
        state.frames = state.frames.length ? state.frames : [state.thumb];
      }
      paintMeta();
    };
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
    state.duration = 0;
    state.durationKnown = false;
    state.frames = [];
    state.thumb = "";
    state.thumbIndex = 0;
    state.existingBlob = false;
    if (!titleEl.value.trim()) {
      titleEl.value = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
    }
    progress.hidden = false;
    publishBtn.disabled = true;
    setStep(1);
    attachPreview(file);
    paintMeta();
    var job = extractFramesFrom(previewVideo);
    state.frameJob = job;
    job.then(function (out) {
      if (state.frameJob !== job) return;
      if (out.duration) {
        state.duration = out.duration;
        state.durationKnown = true;
      }
      state.frames = out.frames || [];
      if (!state.frames.length) {
        var shot = previewVideo && !state.unplayable ? grabFrame(previewVideo) : "";
        if (shot) state.frames = [shot];
      }
      if (!state.frames.length) state.frames = [placeholderPoster(file.name)];
      state.thumb = state.frames[0] || "";
      state.thumbIndex = 0;
      state.ready = true;
      progress.hidden = true;
      publishBtn.disabled = false;
      if (previewVideo && !state.unplayable) previewVideo.hidden = false;
      renderThumbs();
      paintMeta();
      setStep(1);
      toast(state.durationKnown
        ? "Video ready (" + formatClock(state.duration) + "). Pick a thumbnail, then save or publish."
        : "Video ready. Pick a thumbnail, then save or publish.", "success");
    });
  }

  function visibility() {
    var input = document.querySelector('input[name="vis"]:checked');
    return input ? input.value : "public";
  }

  function collect(status) {
    var kind = qsKind();
    var ch = S.channelFromProfile();
    var schedule = scheduleEl.value || "";
    var caption = titleEl.value.trim();
    return {
      id: state.id || S.newId(),
      title: caption,
      caption: caption,
      description: descEl.value.trim(),
      playlist: playlistEl.value,
      category: categoryEl.value,
      visibility: visibility(),
      scheduleAt: schedule ? new Date(schedule).toISOString() : "",
      kind: kind,
      type: kind,
      affordance: kind,
      uploadedOnMobile: S.isPhone(),
      surfaces: S.surfacesFor(kind),
      createdAt: state.createdAt || Date.now(),
      updatedAt: Date.now(),
      duration: state.durationKnown ? state.duration : 0,
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
      /* Save and Publish both leave for Studio. Confetti nonce is one-time. */
      var nonce = meta.id + ":" + (meta.updatedAt || Date.now());
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
      state.durationKnown = state.duration > 0;
      state.filename = meta.filename || "";
      state.size = meta.size || 0;
      state.frames = meta.frames || [];
      state.thumb = meta.thumb || (state.frames[0] || "");
      state.thumbIndex = state.frames.indexOf(state.thumb);
      state.ready = true;
      state.kindTouched = true;
      titleEl.value = meta.caption || meta.title || "";
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
      if (meta.kind || meta.affordance || meta.type) setKind(meta.kind || meta.affordance || meta.type);
      renderThumbs();
      paintMeta();
      setStep(1);
      progress.hidden = true;
      publishBtn.disabled = false;
      return S.objectUrl(meta.id);
    }).then(function (url) {
      if (!url || !previewVideo) return;
      previewVideo.hidden = false;
      previewVideo.src = url;
      previewVideo.onerror = function () {
        state.unplayable = true;
        previewVideo.hidden = true;
        if (previewNote) previewNote.hidden = false;
        paintMeta();
      };
      previewVideo.onloadedmetadata = function () {
        var d = finiteDuration(previewVideo);
        if (d) {
          state.duration = d;
          state.durationKnown = true;
          paintMeta();
        }
      };
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
  if (changeBtn) changeBtn.addEventListener("click", function () { fileInput.click(); });
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
      state.kindTouched = true;
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
  if (playBtn && previewVideo) {
    playBtn.addEventListener("click", function () {
      if (state.unplayable || previewVideo.hidden) return;
      if (previewVideo.paused) {
        previewVideo.play().then(function () {
          playBtn.textContent = "\u23F8";
          playBtn.setAttribute("aria-label", "Pause preview");
        }).catch(function () {});
      } else {
        previewVideo.pause();
        playBtn.textContent = "\u25B6";
        playBtn.setAttribute("aria-label", "Play preview");
      }
    });
    previewVideo.addEventListener("timeupdate", paintClock);
    previewVideo.addEventListener("pause", function () {
      playBtn.textContent = "\u25B6";
      playBtn.setAttribute("aria-label", "Play preview");
    });
    previewVideo.addEventListener("ended", function () {
      playBtn.textContent = "\u25B6";
    });
  }
  if (scrub && previewVideo) {
    scrub.addEventListener("pointerdown", function () { scrubbing = true; });
    scrub.addEventListener("pointerup", function () { scrubbing = false; });
    scrub.addEventListener("input", function () {
      if (!state.durationKnown || state.unplayable) return;
      var t = (Number(scrub.value) / 1000) * state.duration;
      try { previewVideo.currentTime = t; } catch (e) {}
      paintClock();
    });
  }
  window.addEventListener("resize", function () {
    if (!state.kindTouched) setKind(suggestedKind());
    else paintKind();
  });

  if (!state.kindTouched) setKind(suggestedKind());
  else paintKind();
  paintVis();
  setStep(0);
  publishBtn.disabled = true;
  var params = new URLSearchParams(location.search);
  var existing = params.get("id");
  if (existing) loadExisting(existing);
})();
