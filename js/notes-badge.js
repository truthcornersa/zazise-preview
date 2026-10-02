/* Unread inbox count on the bell and beside Notifications in the menu. */
(function () {
  if (window.ZaziseNotesBadge) return;
  var css = document.createElement("style");
  css.textContent = [
    "[data-bell],#clip-bell,#bell-btn,.icon-btn[data-i18n-aria='pv_notifications']{position:relative}",
    ".zz-note-badge{position:absolute;top:2px;right:0;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#E2AE41;color:#12161f;font-size:10px;font-weight:700;line-height:1;display:grid;place-items:center;border:2px solid #fff;pointer-events:none;z-index:2}",
    ".zz-note-count{margin-left:8px;min-width:18px;height:18px;padding:0 6px;border-radius:999px;background:#E2AE41;color:#12161f;font-size:11px;font-weight:700;line-height:18px;text-align:center;flex:none}",
    ".sidebar.mini .zz-note-count{display:none!important}"
  ].join("");
  document.head.appendChild(css);
  function bells() { return document.querySelectorAll("[data-bell], #clip-bell, #bell-btn, .icon-btn[data-i18n-aria='pv_notifications']"); }
  function menus() { return document.querySelectorAll("a.nav-item[href*='notifications-sample']"); }
  function label(n) { return n > 99 ? "99+" : String(n); }
  function paint(n) {
    n = n | 0;
    var text = label(n);
    bells().forEach(function (btn) {
      var badge = btn.querySelector(".note-badge, .zz-note-badge");
      if (!n) { if (badge) { badge.hidden = true; badge.textContent = ""; } return; }
      if (!badge) { badge = document.createElement("span"); badge.className = "zz-note-badge"; btn.appendChild(badge); }
      badge.hidden = false; badge.textContent = text;
    });
    menus().forEach(function (link) {
      var count = link.querySelector(".zz-note-count");
      if (!n) { if (count) count.remove(); return; }
      if (!count) { count = document.createElement("span"); count.className = "zz-note-count"; link.appendChild(count); }
      count.textContent = text;
    });
  }
  function unreadOf(notes) {
    var n = 0;
    (notes || []).forEach(function (note) {
      if (!note || note.read || note.box === "history") return;
      if (note.kind === "comments" || note.kind === "likes" || note.kind === "mentions" || note.kind === "uploads") n++;
    });
    return n;
  }
  function refresh() {
    fetch("/api/notifications.php", { credentials: "same-origin", headers: { Accept: "application/json" } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data && data.ok) paint(unreadOf(data.notes)); })
      .catch(function () {});
  }
  document.addEventListener("zazise:inbox", function (ev) {
    if (ev.detail && typeof ev.detail.unread === "number") paint(ev.detail.unread);
  });
  window.ZaziseNotesBadge = { paint: paint, refresh: refresh };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();
  document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
  window.addEventListener("focus", refresh);
  setInterval(refresh, 25000);
})();
