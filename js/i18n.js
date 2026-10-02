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
        var collapsed = bar.getAttribute('data-collapsed') === 'true';
        if (collapsed) expandLangBar(bar, btn);
        else collapseLangBar(bar, btn);
      });
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
        ev.preventDefault();
        ev.stopPropagation();
        var lang = normalize(pill.getAttribute('data-lang') || pill.getAttribute('hreflang'));
        setLang(lang);
        // Always collapse after a pick on phone so the sheet never sticks open.
        if (isPhone()) collapseLangBar(bar, btn);
      });
    });
  }

  async function load() {
    var saved = DEFAULT_LANG;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch (e) { /* ignore */ }
    current = normalize(saved);

    var res = await fetch('i18n/ui.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('i18n load failed');
    catalog = await res.json();
    bindLangBar();
    applyDom();
    return current;
  }

  global.ZaziseI18n = {
    load: load,
    t: t,
    setLang: setLang,
    getLang: function () { return current; },
    apply: applyDom,
    supported: SUPPORTED.slice(),
  };
})(window);
