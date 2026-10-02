/**
 * Shared status toast. Message follows the language already chosen.
 */
(function (global) {
  'use strict';

  var TOAST_MARK = 'assets/zazise-toast-mark.png';
  var DEFAULTS = {
    pv_cooking: "We're still cooking — be patient.",
    pv_err_video: "This video could not play. Please try again."
  };
  var hideTimer = null;
  var currentEl = null;
  var currentKey = null;

  function textFor(key, fallback) {
    if (window.ZaziseI18n && ZaziseI18n.t && key) {
      var said = ZaziseI18n.t(key);
      if (said && said !== key) return said;
    }
    return fallback || DEFAULTS[key] || DEFAULTS.pv_cooking;
  }

  function ensureHost() {
    var host = document.getElementById('toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast-host';
      host.className = 'toast-host';
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    return host;
  }

  function refresh() {
    if (!currentEl || !currentEl.parentNode || !currentKey) return;
    var node = currentEl.querySelector('.toast__msg');
    if (node) node.textContent = textFor(currentKey, DEFAULTS[currentKey]);
  }

  function showCookingToast(message, kind, key) {
    var i18nKey = key || null;
    if (!message && !i18nKey) i18nKey = (kind === 'error' ? 'pv_err_video' : 'pv_cooking');
    var host = ensureHost();
    host.innerHTML = '';
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    var el = document.createElement('div');
    el.className = 'toast toast--' + (kind || 'cooking');
    el.setAttribute('role', 'status');

    var mark = document.createElement('img');
    mark.className = 'toast__mark';
    mark.src = (kind === "success") ? "assets/zazise-toast-mark-white.png" : TOAST_MARK;
    mark.alt = '';
    mark.setAttribute('aria-hidden', 'true');
    mark.width = 28;
    mark.height = 28;
    el.appendChild(mark);

    var msg = document.createElement('span');
    msg.className = 'toast__msg';
    msg.textContent = message || textFor(i18nKey, DEFAULTS[i18nKey]);
    el.appendChild(msg);

    host.appendChild(el);
    currentEl = el;
    currentKey = key || null;
    requestAnimationFrame(function () {
      el.classList.add('toast--show');
    });

    hideTimer = setTimeout(function () {
      el.classList.remove('toast--show');
      setTimeout(function () {
        if (el.parentNode) el.remove();
        if (currentEl === el) {
          currentEl = null;
          currentKey = null;
        }
      }, 320);
      hideTimer = null;
    }, kind === 'error' ? 5600 : 3200);

    return el;
  }

  document.addEventListener('zazise:lang', refresh);

  function menuWorks(item) {
    if (item.hasAttribute('data-open-settings')) return true;
    var href = (item.getAttribute('href') || '').trim();
    if (href && href !== '#' && href.indexOf('javascript:') !== 0) return true;
    var key = item.getAttribute('data-i18n-title') || '';
    var path = location.pathname || '';
    return key === 'pv_home' && (path.indexOf('home-preview') !== -1 || /\/(index\.html)?$/.test(path) || path.endsWith('/index.html'));
  }

  function paintIdle() {
    document.querySelectorAll('a.nav-item').forEach(function (item) {
      var idle = !menuWorks(item);
      item.classList.toggle('is-idle', idle);
      if (idle) item.setAttribute('aria-disabled', 'true');
      else item.removeAttribute('aria-disabled');
    });
  }

  if (!document.getElementById('zz-idle-nav')) {
    var css = document.createElement('style');
    css.id = 'zz-idle-nav';
    css.textContent = [
      'a.nav-item.is-idle{color:#c5ccd4!important}',
      'a.nav-item .zz-mark{display:block;width:22px;height:22px;background:currentColor;-webkit-mask:url(assets/zazise-toast-mark-white.png) center/contain no-repeat;mask:url(assets/zazise-toast-mark-white.png) center/contain no-repeat}',
      'a.nav-item.is-idle .ico,a.nav-item.is-idle .ico-svg,a.nav-item.is-idle .zz-mark{color:#c5ccd4}',
      'a.nav-item.is-idle:hover{color:#317045!important;background:color-mix(in srgb,#317045 12%,#fff)!important}',
      'a.nav-item.is-idle:hover .ico,a.nav-item.is-idle:hover .ico-svg,a.nav-item.is-idle:hover .zz-mark{color:#317045!important}',
      'a.nav-item.is-idle .side-av{filter:grayscale(1);opacity:.45}',
      'a.nav-item.is-idle:hover .side-av{filter:none;opacity:1}',
      'body.home.clips-body .sidebar a.nav-item.is-idle{color:#c8c8c8!important}',
      'body.home.clips-body .sidebar a.nav-item.is-idle:hover{color:#fff!important;background:#1a1a1a!important}',
      'body.home.clips-body .sidebar a.nav-item.is-idle:hover .ico,body.home.clips-body .sidebar a.nav-item.is-idle:hover .ico-svg,body.home.clips-body .sidebar a.nav-item.is-idle:hover .zz-mark{color:#fff!important}',
      '@media (max-width:768px){body.home-preview-page a.nav-item[data-i18n-title="pv_clips"],body.home-preview-page a.nav-item[href*="clips.html"]{display:none!important}}',
      '.avatar.has-photo,.dock-avatar.has-photo{background-position:center!important;background-size:cover!important;color:transparent!important}',
      '.toast-host{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:500;display:flex;flex-direction:column;gap:8px;width:min(440px,calc(100% - 20px));pointer-events:none}@media (max-width:640px){.toast-host{top:auto;bottom:calc(80px + env(safe-area-inset-bottom));}}',
      ' .toast{pointer-events:none;display:flex;align-items:center;gap:12px;background:#1a2332;color:#fff;border-radius:12px;padding:12px 16px;font-size:13.5px;font-weight:650;line-height:1.4;box-shadow:0 14px 36px rgba(18,22,31,.32);opacity:0;transform:translateY(-120%);transition:opacity .28s ease,transform .32s cubic-bezier(.22,1,.36,1)}',
      '.toast--show{opacity:1;transform:none}',
      '.toast__mark{flex-shrink:0;width:28px;height:28px;border-radius:8px;object-fit:contain;display:block;background:rgba(255,255,255,.12)}',
      '.toast__msg{flex:1;min-width:0;color:#fff}',
      '.toast--success{background:#317045;color:#fff}',
      '.toast--success .toast__mark{background:rgba(255,255,255,.16)}',
      '.toast--error{background:#c62828;color:#fff}'
    ].join('');
    document.head.appendChild(css);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintIdle);
  else paintIdle();

  function closeMenu() {
    document.body.classList.remove('menu-open');
    var sidebar = document.getElementById('preview-sidebar');
    if (sidebar) sidebar.classList.add('mini');
    var burger = document.querySelector('.menu-btn');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.menu-btn').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    var scrim = document.getElementById('menu-scrim');
    if (scrim) {
      scrim.hidden = true;
      scrim.setAttribute('aria-hidden', 'true');
    }
  }

  document.addEventListener('click', function (ev) {
    var item = ev.target && ev.target.closest && ev.target.closest('a.nav-item');
    if (!item) return;
    var href = (item.getAttribute('href') || '');
    if (/clips|reels/i.test(href) || item.getAttribute('title') === 'Clips' || item.getAttribute('data-zz-gate') === 'clips') {
      if (guestGate(ev, '.clips-stage, .clip-stage, .reel-stage, main, a[href*="clips"], [data-dock="clips"]')) return;
    }
    if (menuWorks(item)) return;
    ev.preventDefault();
    closeMenu();
    showCookingToast(textFor('pv_cooking', DEFAULTS.pv_cooking), 'cooking', 'pv_cooking');
  });

  function paintChrome() {
    if ((location.pathname || '').indexOf('home-preview') !== -1 || document.body.classList.contains('home-preview') || document.body.getAttribute('data-zz-page')==='home') document.body.classList.add('home-preview-page');
    var play = '<svg class="ico-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l5-2.5-5-2.5z"/></svg>';
    document.querySelectorAll('a.nav-item').forEach(function (a) {
      var key = a.getAttribute('data-i18n-title') || '';
      var yours = key === 'pv_yours' || a.id === 'nav-yours' || !!a.querySelector('[data-i18n="pv_yours"]');
      var subs = key === 'pv_subs' || !!a.querySelector('[data-i18n="pv_subs"]');
      if (yours || subs) {
        a.setAttribute('href', 'studio.html');
        if (subs) {
          a.setAttribute('data-i18n-title', 'pv_yours');
          a.setAttribute('title', 'Your studio');
          var label = a.querySelector('[data-i18n="pv_subs"]');
          if (label) {
            label.setAttribute('data-i18n', 'pv_yours');
            label.textContent = 'Your studio';
          }
        }
        var ico = a.querySelector('.ico');
        if (ico && !ico.querySelector('img')) {
          var svg = ico.querySelector('svg');
          var drawn = svg ? svg.innerHTML : '';
          if (drawn.indexOf('M10 9.5v5l5-2.5-5-2.5z') === -1) ico.innerHTML = play;
        }
      }
      if (key === 'pv_later' || a.querySelector('[data-i18n="pv_later"]')) {
        a.setAttribute('href', 'later.html');
      }
    });
    paintIdle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintChrome);
  else paintChrome();
  document.addEventListener('zazise:lang', function () { setTimeout(paintChrome, 0); });

  function guestGate(ev, blurSelector) {
    if (!(window.ZaziseGuest && ZaziseGuest.isGuest && ZaziseGuest.isGuest())) return false;
    ev.preventDefault();
    ev.stopPropagation();
    ZaziseGuest.openGate({ blurSelector: blurSelector || null });
    return true;
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    // Guests must not navigate to clips/reels (guest-gate capture is primary; this is a backstop)
    var clipsNav = t.closest('a[href*="clips"], a[href*="reels"], [data-dock="clips"], a[title="Clips"], [data-zz-gate="clips"]');
    if (clipsNav) {
      if (guestGate(ev, '.clips-stage, .clip-stage, .reel-stage, main, a[href*="clips"], [data-dock="clips"]')) {
        if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
        return;
      }
    }
    var plus = t.closest('button.icon-btn');
    if (plus && !plus.hasAttribute('data-bell') && plus.querySelector('path[d="M12 5v14M5 12h14"]')) {
      if ((location.pathname || '').indexOf('/upload.html') !== -1) return;
      if (guestGate(ev, '.app-bar-actions')) return;
      ev.preventDefault();
      ev.stopPropagation();
      location.href = 'upload.html';
      return;
    }
    var bell = t.closest('[data-bell], button.icon-btn');
    if (bell && (bell.hasAttribute('data-bell') || (bell.querySelector && bell.querySelector('path[d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7"]')))) {
      if ((location.pathname || '').indexOf('notifications') !== -1) return;
      if (guestGate(ev, '.app-bar-actions')) return;
      ev.preventDefault();
      ev.stopPropagation();
      location.href = 'notifications.html';
      return;
    }
    var avatar = t.closest('#preview-profile-avatar');
    var dockProfile = t.closest('[data-dock="profile"]');
    if ((avatar && avatar.tagName === 'BUTTON') || dockProfile) {
      if (guestGate(ev, '#preview-profile-avatar, #nav-yours')) return;
      ev.preventDefault();
      ev.stopPropagation();
      if ((location.pathname || '').indexOf('studio.html') === -1) location.href = 'studio.html';
    }
  }, true);

  global.ZaziseCookingToast = {
    show: showCookingToast,
    refresh: refresh,
    text: textFor,
    MESSAGE: DEFAULTS.pv_cooking
  };
})(window);
