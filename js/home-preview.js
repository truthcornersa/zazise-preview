/**
 * ZAZISE home-preview — dummy early-adopter interactions.
 * Hover GIFs, search toast, burger drawer, cooking toast on CTAs.
 * Language pills use ZaziseI18n (no cooking toast).
 */
(function () {
  'use strict';

  var COOKING = "We're still cooking — be patient.";

  function toast() {
    if (window.ZaziseCookingToast) {
      window.ZaziseCookingToast.show(COOKING, 'cooking');
    }
  }

  function isLangPill(el) {
    return !!(el && el.closest && el.closest('.lang-pill, .lang-toggle, .lang-bar'));
  }

  /* ——— Hover GIF previews ——— */
  function bindHoverGifs(root) {
    root = root || document;
    root.querySelectorAll('[data-preview-gif]').forEach(function (card) {
      if (card.__gifBound) return;
      card.__gifBound = true;
      var thumb = card.querySelector('.thumb');
      if (!thumb) return;
      var gifUrl = card.getAttribute('data-preview-gif');
      if (!gifUrl) return;

      var gifImg = document.createElement('img');
      gifImg.className = 'thumb-gif';
      gifImg.alt = '';
      gifImg.setAttribute('aria-hidden', 'true');
      gifImg.decoding = 'async';
      // Lazy-assign src on first hover to save bandwidth
      var loaded = false;

      function show() {
        if (!loaded) {
          gifImg.src = gifUrl;
          loaded = true;
          if (!gifImg.parentNode) thumb.appendChild(gifImg);
        }
        thumb.classList.add('is-previewing');
      }
      function hide() {
        thumb.classList.remove('is-previewing');
      }

      card.addEventListener('mouseenter', show);
      card.addEventListener('mouseleave', hide);
      card.addEventListener('focusin', show);
      card.addEventListener('focusout', function (ev) {
        if (!card.contains(ev.relatedTarget)) hide();
      });
      // Touch: brief preview on first tap, cooking toast on second
      card.addEventListener(
        'touchstart',
        function () {
          show();
        },
        { passive: true }
      );
    });
  }

  /* ——— Horizontal scroll: wheel + chevrons + drag ——— */
  function bindHScroll(scroller, prevBtn, nextBtn) {
    if (!scroller) return;

    function step() {
      return Math.max(180, Math.floor(scroller.clientWidth * 0.7));
    }
    function updateChevrons() {
      if (!prevBtn && !nextBtn) return;
      var max = scroller.scrollWidth - scroller.clientWidth - 2;
      if (prevBtn) prevBtn.disabled = scroller.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = scroller.scrollLeft >= max;
    }

    scroller.addEventListener(
      'wheel',
      function (ev) {
        // Convert vertical wheel to horizontal when over the row
        if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
          scroller.scrollLeft += ev.deltaY;
          ev.preventDefault();
        }
      },
      { passive: false }
    );

    // Pointer drag
    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    scroller.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      dragging = true;
      startX = ev.clientX;
      startScroll = scroller.scrollLeft;
      scroller.classList.add('is-dragging');
      try {
        scroller.setPointerCapture(ev.pointerId);
      } catch (e) { /* ignore */ }
    });
    scroller.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      scroller.scrollLeft = startScroll - (ev.clientX - startX);
    });
    function endDrag(ev) {
      if (!dragging) return;
      dragging = false;
      scroller.classList.remove('is-dragging');
      try {
        scroller.releasePointerCapture(ev.pointerId);
      } catch (e) { /* ignore */ }
    }
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        scroller.scrollBy({ left: -step(), behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        scroller.scrollBy({ left: step(), behavior: 'smooth' });
      });
    }
    scroller.addEventListener('scroll', updateChevrons, { passive: true });
    updateChevrons();
    window.addEventListener('resize', updateChevrons);
  }

  /* ——— Burger / sidebar drawer ——— */
  function bindMenu() {
    var sidebar = document.getElementById('preview-sidebar');
    var burger = document.querySelector('.menu-btn');
    var scrim = document.getElementById('menu-scrim');
    if (!sidebar || !burger) return;

    function setOpen(open) {
      if (open) {
        sidebar.classList.remove('mini');
        document.body.classList.add('menu-open');
        burger.setAttribute('aria-expanded', 'true');
        if (scrim) {
          scrim.hidden = false;
          scrim.setAttribute('aria-hidden', 'false');
        }
      } else {
        sidebar.classList.add('mini');
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
        if (scrim) {
          scrim.hidden = true;
          scrim.setAttribute('aria-hidden', 'true');
        }
      }
    }

    burger.addEventListener('click', function (ev) {
      ev.preventDefault();
      var open = sidebar.classList.contains('mini');
      setOpen(open);
    });

    if (scrim) {
      scrim.addEventListener('click', function () {
        setOpen(false);
      });
    }

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && document.body.classList.contains('menu-open')) {
        setOpen(false);
      }
    });
  }

  /* ——— Search ——— */
  function bindSearch() {
    var box = document.querySelector('.search-box');
    if (!box) return;
    var input = box.querySelector('input[type="search"], input');
    var btn = box.querySelector('.search-btn');

    function submit(ev) {
      if (ev) ev.preventDefault();
      toast();
    }

    if (input) {
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') submit(ev);
      });
    }
    if (btn) {
      btn.addEventListener('click', submit);
    }
  }

  /* ——— Cooking toast on CTAs (except language) ——— */
  function bindCookingCtas() {
    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        if (isLangPill(t)) return; // i18n handles language pills
        if (t.closest('.menu-btn')) return; // burger toggles drawer
        if (t.closest('.lang-toggle')) return;
        if (t.closest('.trend-scroll-btn')) return; // chevrons scroll only
        if (t.closest('.brand')) return; // logo → registration
        if (t.closest('.trend-card')) return; // selection ring handled separately

        var hit =
          t.closest('.video-card') ||
          t.closest('.chip') ||
          t.closest('.nav-item') ||
          t.closest('.icon-btn') ||
          t.closest('.avatar') ||
          t.closest('.card-menu') ||
          t.closest('.side-av');

        if (!hit) return;

        // Don't toast on search button (handled separately) — already excluded via .icon-btn? search-btn is .search-btn
        if (hit.classList && hit.classList.contains('search-btn')) return;

        var a = hit.closest('a') || (hit.tagName === 'A' ? hit : null);
        if (a && a.getAttribute('href')) {
          ev.preventDefault();
        }
        toast();
      },
      true
    );

    // Chip active toggle (still toast)
    document.querySelectorAll('.chips .chip').forEach(function (chip) {
      chip.setAttribute('role', 'button');
      chip.tabIndex = 0;
      chip.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          chip.click();
        }
      });
    });
  }

  /* ——— Language: fast fallback while the shared i18n pack loads ——— */
  function bindLangFallback() {
    var region = document.querySelector('[data-i18n-region]');
    var supported = ['en', 'af', 'zu', 'xh', 'st', 'tn', 'nso', 'ts', 'ss', 've', 'nr', 'sasl'];

    function langForPill(pill) {
      var lang = (pill.getAttribute('data-lang') || pill.getAttribute('hreflang') || '').toLowerCase();
      if ((pill.textContent || '').trim().toUpperCase() === 'SASL') lang = 'sasl';
      return supported.indexOf(lang) >= 0 ? lang : 'en';
    }

    function applyFallback(lang) {
      try { localStorage.setItem('zazise.lang', lang); } catch (e) { /* ignore */ }
      document.documentElement.setAttribute('lang', lang === 'sasl' ? 'en' : lang);
      document.querySelectorAll('.lang-pill').forEach(function (pill) {
        var selected = langForPill(pill) === lang;
        pill.classList.toggle('active', selected);
        pill.setAttribute('aria-current', selected ? 'true' : 'false');
      });
      if (region) {
        region.textContent = 'South Africa · ' + (lang === 'sasl' ? 'EN' : lang.toUpperCase());
      }
    }

    // The shared i18n renderer owns the localized region once it has loaded.
    document.addEventListener('zazise:lang', function (ev) {
      if (window.ZaziseI18n) return;
      var code = (ev.detail && ev.detail.lang) || 'en';
      applyFallback(supported.indexOf(code) >= 0 ? code : 'en');
    });

    // Handle an immediate tap before i18n.json finishes loading, and persist it
    // so i18n.load() picks the same language when its fetch completes.
    document.querySelectorAll('.lang-pill').forEach(function (pill) {
      if (pill.__zaziseFallbackBound) return;
      pill.__zaziseFallbackBound = true;
      pill.addEventListener('click', function (ev) {
        ev.preventDefault();
        var lang = langForPill(pill);
        if (window.ZaziseI18n && typeof window.ZaziseI18n.setLang === 'function') {
          window.ZaziseI18n.setLang(lang);
        } else {
          applyFallback(lang);
        }
      });
    });
  }

  /* ——— Profile avatar initials from registration ——— */
  function applyPreviewProfile() {
    var avatar = document.getElementById('preview-profile-avatar')
      || document.querySelector('.topbar .avatar, header .avatar, .avatar');
    if (!avatar) return;
    var initials = 'MZ';
    try {
      var raw = sessionStorage.getItem('zazisePreviewProfile')
        || localStorage.getItem('zazisePreviewProfile');
      if (raw) {
        var profile = JSON.parse(raw);
        if (profile && profile.initials && String(profile.initials).trim()) {
          initials = String(profile.initials).trim().toUpperCase().slice(0, 3);
        }
      }
    } catch (e) { /* ignore */ }
    avatar.textContent = initials;
    avatar.setAttribute('title', initials);
    avatar.setAttribute('aria-label', 'Profile ' + initials);
  }


  /* ——— Top Trending: multi-colour ring = single selection ——— */
  function bindTrendSelect() {
    var root = document.querySelector('.top-trending-scroll');
    if (!root) return;
    var cards = root.querySelectorAll('.trend-card');
    if (!cards.length) return;
    // Ensure one selected (first) if none
    if (!root.querySelector('.trend-card--featured')) {
      cards[0].classList.add('trend-card--featured');
      cards[0].setAttribute('aria-current', 'true');
    }
    cards.forEach(function (card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      function select(ev) {
        if (ev) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        cards.forEach(function (c) {
          c.classList.remove('trend-card--featured');
          c.removeAttribute('aria-current');
        });
        card.classList.add('trend-card--featured');
        card.setAttribute('aria-current', 'true');
        // Keep selected card in view
        try {
          card.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
        } catch (e) { /* ignore */ }
      }
      card.addEventListener('click', select);
      card.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          select(ev);
        }
      });
    });
  }

  function init() {
    applyPreviewProfile();
    bindHoverGifs();
    bindMenu();
    bindSearch();
    bindCookingCtas();
    bindLangFallback();
    bindTrendSelect();

    var scroll = document.querySelector('.top-trending-scroll');
    var prev = document.querySelector('.trend-scroll-btn--prev');
    var next = document.querySelector('.trend-scroll-btn--next');
    bindHScroll(scroll, prev, next);

    // Category chips overflow scroll on small screens already via CSS; enable wheel→h
    var chips = document.querySelector('.chips');
    if (chips) {
      chips.addEventListener(
        'wheel',
        function (ev) {
          if (chips.scrollWidth <= chips.clientWidth + 4) return;
          if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
            chips.scrollLeft += ev.deltaY;
            ev.preventDefault();
          }
        },
        { passive: false }
      );
    }

    // Lang collapse (if i18n hasn't bound yet)
    var bar = document.querySelector('.lang-bar');
    var btn = document.querySelector('.lang-toggle');
    if (bar && btn && !btn.__zaziseBound) {
      btn.__zaziseBound = true;
      btn.addEventListener('click', function () {
        var collapsed = bar.getAttribute('data-collapsed') === 'true';
        bar.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
        btn.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
