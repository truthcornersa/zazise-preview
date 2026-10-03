/**
 * Count a view only after 3 seconds of playback. Sample uploads play from this device.
 */
(function () {
  "use strict";

  var video = document.getElementById("zz-public-player");
  var viewsEl = document.getElementById("watch-views");
  if (!video || !viewsEl) return;

  var params = new URLSearchParams(location.search);
  var id = params.get("v") || params.get("id") || "";
  var counted = false;
  var sample = params.get("sample") === "1" || (id.indexOf("up_") === 0);

  function format(n) {
    return Number(n || 0).toLocaleString();
  }

  function setLine(n, extra) {
    viewsEl.textContent = format(n) + " views" + (extra ? " · " + extra : "");
  }

  function arm(current, onTick) {
    video.addEventListener("timeupdate", function () {
      if (counted) return;
      if (video.currentTime >= 3 && !video.paused) {
        counted = true;
        onTick(current);
      }
    });
  }

  if (sample && window.ZaziseSample && id) {
    var S = window.ZaziseSample;
    S.getMeta(id).then(function (meta) {
      if (!meta) return;
      var title = document.querySelector(".watch-title");
      if (title) title.textContent = meta.title || "ZAZISE";
      var desc = document.querySelector(".description-box");
      if (desc) desc.textContent = meta.description || "Uploaded in this browser. It is not on zazise.africa.";
      var ch = document.querySelector(".channel-row .ch-name");
      if (ch) ch.textContent = meta.channel || "Your studio";
      var subs = document.querySelector(".channel-row .ch-subs");
      if (subs) subs.textContent = "@" + (meta.handle || "you");
      if (meta.thumb) video.poster = meta.thumb;
      setLine(meta.views || 0, meta.visibility === "public" ? "This device" : meta.visibility);
      return S.objectUrl(id).then(function (url) {
        if (!url) return;
        video.removeAttribute("src");
        var source = video.querySelector("source");
        if (source) source.remove();
        video.src = url;
        video.load();
        arm(meta.views || 0, function () {
          S.bumpView(id).then(function (n) { setLine(n, "This device"); }).catch(function () {});
        });
      });
    }).catch(function () {});
    return;
  }

  var base = parseInt(viewsEl.getAttribute("data-base") || "0", 10) || 0;
  arm(base, function () {
    setLine(base + 1, viewsEl.getAttribute("data-when") || "");
  });
})();
