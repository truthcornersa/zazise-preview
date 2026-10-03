/**
 * ZAZISE offline i18n for register + thank-you.
 * Curated JSON for 11 official languages; SASL uses EN UI strings.
 * Optional live translate: only if GOOGLE_TRANSLATE_API_KEY / LIBRETRANSLATE_URL
 * is configured server-side (not used by default — see README).
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'zazise.lang';
  var DEFAULT_LANG = 'en';
  var SUPPORTED = ['en', 'af', 'zu', 'xh', 'st', 'tn', 'nso', 'ts', 'ss', 've', 'nr'];
  var catalog = null;
  var current = DEFAULT_LANG;

  function normalize(code) {
    if (!code) return DEFAULT_LANG;
    var c = String(code).toLowerCase();
    if (c === 'nso' || c === 'sepedi') return 'nso';
    return SUPPORTED.indexOf(c) >= 0 ? c : DEFAULT_LANG;
  }

  function t(key) {
    var pack = (catalog && catalog[current]) || (catalog && catalog.en) || {};
    if (pack[key] != null) return pack[key];
    if (catalog && catalog.en && catalog.en[key] != null) return catalog.en[key];
    return key;
  }

  function applyDom(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = t(key);
      if (el.tagName === 'TITLE') {
        document.title = val;
      } else {
        el.textContent = val;
      }
    });
    root.querySelectorAll('[data-i18n-content]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-content');
      if (!key) return;
      el.setAttribute('content', t(key));
    });

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && document.title) ogTitle.setAttribute('content', document.title);
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && document.title) twTitle.setAttribute('content', document.title);
    var descEl = document.querySelector('meta[name="description"]');
    var desc = descEl ? descEl.getAttribute('content') : '';
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && desc) ogDesc.setAttribute('content', desc);
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && desc) twDesc.setAttribute('content', desc);

    root.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    var region = root.querySelector('[data-i18n-region]');
    if (region) {
      var code = current === 'sasl' ? 'EN' : current.toUpperCase();
      region.textContent = t('region') + ' · ' + code;
    }

    var htmlLang = current === 'sasl' ? 'en' : current;
    document.documentElement.setAttribute('lang', htmlLang);

    root.querySelectorAll('.lang-pill').forEach(function (pill) {
      var lang = normalize(pill.getAttribute('data-lang') || pill.getAttribute('hreflang') || pill.textContent);
      pill.classList.toggle('active', lang === current);
      pill.setAttribute('aria-current', lang === current ? 'true' : 'false');
    });
  }

  function setLang(code, opts) {
    current = normalize(code);
    try { localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* ignore */ }
    applyDom();
    if (!opts || !opts.silent) {
      document.dispatchEvent(new CustomEvent('zazise:lang', { detail: { lang: current } }));
    }
  }

  function isPhone() {
    try { return window.matchMedia('(max-width: 820px)').matches; } catch (e) { return false; }
  }

  function collapseLangBar(bar, btn) {
    if (!bar) return;
    bar.setAttribute('data-collapsed', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function expandLangBar(bar, btn) {
    if (!bar) return;
    bar.setAttribute('data-collapsed', 'false');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function bindLangBar(root) {
    root = root || document;
    var bar = root.querySelector('.lang-bar');
    var btn = root.querySelector('.lang-toggle');
    if (!bar || !btn) return;

    if (isPhone()) {
      collapseLangBar(bar, btn);
    } else {
      expandLangBar(bar, btn);
    }

    if (!btn.__zaziseBound) {
      btn.__zaziseBound = true;
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
        var collapsed = bar.getAttribute('data-collapsed') === 'true';
        if (collapsed) expandLangBar(bar, btn);
        else collapseLangBar(bar, btn);
      }, true);
    }

    if (!bar.__zaziseOutside) {
      bar.__zaziseOutside = true;
      document.addEventListener('click', function (ev) {
        if (!isPhone()) return;
        if (bar.getAttribute('data-collapsed') === 'true') return;
        var t = ev.target;
        if (bar.contains(t)) return;
        collapseLangBar(bar, btn);
      }, true);
      document.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Escape') return;
        if (bar.getAttribute('data-collapsed') === 'true') return;
        collapseLangBar(bar, btn);
      });
      window.addEventListener('resize', function () {
        if (isPhone()) collapseLangBar(bar, btn);
        else expandLangBar(bar, btn);
      });
    }

    root.querySelectorAll('.lang-pill').forEach(function (pill) {
      if (pill.__zaziseBound) return;
      pill.__zaziseBound = true;
      pill.addEventListener('click', function (ev) {
        var href = pill.getAttribute('href') || '';
        var navigates = href && href !== '#' && href.indexOf('javascript:') !== 0;
        var lang = normalize(pill.getAttribute('data-lang') || pill.getAttribute('hreflang'));
        if (navigates && !pill.hasAttribute('data-lang')) {
          try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
          collapseLangBar(bar, btn);
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        setLang(lang);
        collapseLangBar(bar, btn);
      });
    });
  }

  function uiJsonUrl() {
    // Catalog is served with the project, including GitHub Pages /zazise-preview/i18n/ui.json.
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('i18n.js') === -1) continue;
      try {
        return new URL('../i18n/ui.json', new URL(src, window.location.href)).href;
      } catch (e) { break; }
    }
    var path = (window.location && window.location.pathname) || '/';
    var marker = '/zazise-preview/';
    var at = path.indexOf(marker);
    if (at >= 0) return path.slice(0, at + marker.length) + 'i18n/ui.json';
    return 'i18n/ui.json';
  }

  async function load() {
    var saved = DEFAULT_LANG;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch (e) { /* ignore */ }
    current = normalize(saved);

    var url = uiJsonUrl();
    var res = await fetch(url, { cache: 'no-store' });
    if (!res.ok && url !== 'i18n/ui.json') {
      res = await fetch('i18n/ui.json', { cache: 'no-store' });
    }
    if (!res.ok) throw new Error('i18n load failed');
    catalog = await res.json();
    bindLangBar();
    applyDom();
    return current;
  }

  function bootBar() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { bindLangBar(); });
    } else {
      bindLangBar();
    }
  }
  bootBar();

  global.ZaziseI18n = {
    load: load,
    t: t,
    setLang: setLang,
    getLang: function () { return current; },
    apply: applyDom,
    supported: SUPPORTED.slice(),
  };
})(window);
