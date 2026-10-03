/**
 * Drop this browser's public desktop uploads onto the preview timeline.
 * Newest first. Clip-only and phone uploads stay off this grid.
 */
(function () {
  "use strict";

  var S = window.ZaziseSample;
  if (!S || !document.getElementById("sample-grid")) return;

  var items = [];
  var lock = false;

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatDur(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function card(item) {
    var href = "watch.html?v=" + encodeURIComponent(item.id) + "&sample=1";
    var art = document.createElement("article");
    art.className = "video-card";
    art.setAttribute("data-sample-upload", item.id);
    var thumb = item.thumb
      ? '<img src="' + esc(item.thumb) + '" alt="" loading="lazy" decoding="async" />'
      : '<span class="studio-nothumb">ZAZISE</span>';
    var channel = item.channel || "Your studio";
    var views = (item.views || 0) + " views";
    var caption = item.caption || item.title || "ZAZISE";
    var blurb = item.description ? '<div class="card-desc">' + esc(item.description) + '</div>' : "";
    art.innerHTML =
      '<a class="thumb" href="' + esc(href) + '">' + thumb + '<span class="dur">' + esc(formatDur(item.duration)) + '</span></a>' +
      '<div class="video-meta"><a class="info" href="' + esc(href) + '">' +
      '<div class="title">' + esc(caption) + '</div>' + blurb +
      '<div class="sub"><span>' + esc(channel) + '</span><br/><span>' + esc(views) + '</span></div></a></div>';
    return art;
  }

  function paint() {
    var grid = document.getElementById("sample-grid");
    if (!grid) return;
    lock = true;
    grid.querySelectorAll("[data-sample-upload]").forEach(function (n) { n.remove(); });
    var frag = document.createDocumentFragment();
    items.forEach(function (item) { frag.appendChild(card(item)); });
    grid.insertBefore(frag, grid.firstChild);
    lock = false;
  }

  function load() {
    S.list().then(function (rows) {
      items = S.timelineItems(rows);
      paint();
    }).catch(function () {});
  }

  var grid = document.getElementById("sample-grid");
  if (window.MutationObserver && grid) {
    var obs = new MutationObserver(function () {
      if (lock || !items.length) return;
      var have = grid.querySelectorAll("[data-sample-upload]").length;
      if (have === items.length) return;
      paint();
    });
    obs.observe(grid, { childList: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})();
