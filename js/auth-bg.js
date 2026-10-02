/**
 * Full-bleed auth background: cycle 3 images every 6s with crossfade.
 * Used on register + thank-you.
 */
(function () {
  'use strict';
  var INTERVAL_MS = 6000;

  function init() {
    var root = document.querySelector('.auth-bg');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.auth-bg__slide'));
    if (slides.length < 2) return;
    var i = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
    if (i < 0) { i = 0; slides[0].classList.add('is-active'); }

    setInterval(function () {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, INTERVAL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
