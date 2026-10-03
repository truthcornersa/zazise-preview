/**
 * Clips destination for Phone · Clips and Both uploads.
 * Newest first. Keeps the existing like / message / share actions.
 * Demo clip stays after the user's uploads. Views use the shared 3s rule.
 */
(function () {
  "use strict";

  var S = window.ZaziseSample;
  var frame = document.querySelector(".clip-frame");
  if (!S || !frame) return;

  var cap = frame.querySelector(".r-cap");
  var nameEl = frame.querySelector(".r-user .name");
  var av = frame.querySelector(".r-user .av img");
  var bg = frame.querySelector("img.clip-bg");
  var audio = frame.querySelector(".r-audio");
  if (!cap || !bg) return;

  var video = document.createElement("video");
  video.className = "clip-bg clip-video";
  video.setAttribute("playsinline", "");
  video.loop = true;
  video.hidden = true;
  frame.insertBefore(video, frame.firstChild);

  var demo = {
    demo: true,
    html: cap.innerHTML,
    name: nameEl ? nameEl.textContent : "",
    av: av ? av.getAttribute("src") : "",
    bg: bg.getAttribute("src") || "",
    audio: audio ? audio.textContent : ""
  };

  var items = [];
  var index = 0;

  function showDemo() {
    video.pause();
    video.hidden = true;
    video.removeAttribute("src");
    bg.hidden = false;
    if (demo.bg) bg.src = demo.bg;
    cap.innerHTML = demo.html;
    if (nameEl) nameEl.textContent = demo.name;
    if (av && demo.av) av.src = demo.av;
    if (audio) audio.textContent = demo.audio;
  }

  function showItem(item) {
    var caption = item.caption || item.title || "Clip";
    cap.textContent = "";
    var title = document.createElement("span");
    title.className = "clip-title";
    title.textContent = caption;
    cap.appendChild(title);
    if (item.description) {
      var desc = document.createElement("span");
      desc.className = "clip-desc";
      desc.textContent = item.description;
      cap.appendChild(desc);
    }
    if (nameEl) nameEl.textContent = "@" + (item.handle || "you");
    if (av) {
      if (item.photo) av.src = item.photo;
      else av.removeAttribute("src");
    }
    if (audio) audio.textContent = item.visibility === "public" ? "Your clip · this device" : (item.visibility || "Clip");
    if (item.thumb) {
      bg.hidden = false;
      bg.src = item.thumb;
      video.poster = item.thumb;
    }
    S.objectUrl(item.id).then(function (url) {
      if (!url || items[index] !== item) return;
      video.hidden = false;
      video.src = url;
      video.load();
      var play = video.play();
      if (play && play.catch) play.catch(function () {});
      if (S.armView) S.armView(video, item.id);
    }).catch(function () {});
  }

  function show(i) {
    if (!items.length) {
      showDemo();
      return;
    }
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    index = i;
    var item = items[index];
    if (item.demo) showDemo();
    else showItem(item);
    try {
      var url = item.demo ? "clips.html" : ("clips.html?clip=" + encodeURIComponent(item.id));
      if (history.replaceState) history.replaceState(null, "", url);
    } catch (e) {}
  }

  function load() {
    S.list().then(function (rows) {
      var mine = S.clipItems(rows);
      items = mine.concat([demo]);
      var wanted = "";
      try { wanted = new URLSearchParams(location.search).get("clip") || ""; } catch (e) {}
      var start = 0;
      if (wanted) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === wanted) { start = i; break; }
        }
      }
      if (!mine.length) {
        items = [demo];
        showDemo();
        return;
      }
      show(start);
    }).catch(function () { showDemo(); });
  }

  var prev = document.querySelector(".clips-nav-hint .rn[title='Previous']");
  var next = document.querySelector(".clips-nav-hint .rn[title='Next']");
  if (prev) prev.addEventListener("click", function () { show(index - 1); });
  if (next) next.addEventListener("click", function () { show(index + 1); });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})();
