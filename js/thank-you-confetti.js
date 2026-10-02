/**
 * ZAZISE thank-you confetti — full-viewport overlay (fixed inset 0).
 * Fires only when sessionStorage flag `zaziseJustRegistered` is set
 * (register.js sets it on success, then clears here). Respects reduced-motion.
 */
(function () {
  'use strict';

  var FLAG = 'zaziseJustRegistered';
  var COLORS = [
    '#E2AE41', /* brand gold */
    '#183D83', /* brand blue */
    '#317045', /* brand green */
    '#DE3831', /* SA red */
    '#002395', /* SA blue */
    '#007749', /* SA green */
    '#FFB612', /* SA gold */
    '#FFFFFF',
    '#000000'
  ];
  var DURATION_MS = 3200;
  var Z_INDEX = 2147483000;

  function consumeFlag() {
    try {
      var v = sessionStorage.getItem(FLAG);
      if (v) {
        sessionStorage.removeItem(FLAG);
        return true;
      }
    } catch (e) { /* storage blocked */ }
    try {
      var q = new URLSearchParams(window.location.search || '');
      if (q.get('registered') === '1') {
        // Strip query so refresh does not re-fire
        if (window.history && history.replaceState) {
          history.replaceState(null, '', window.location.pathname + (window.location.hash || ''));
        }
        return true;
      }
    } catch (e2) { /* ignore */ }
    return false;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function ensureCanvas() {
    var existing = document.getElementById('zazise-confetti-canvas');
    if (existing) return existing;
    var canvas = document.createElement('canvas');
    canvas.id = 'zazise-confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = [
      'position:fixed',
      'inset:0',
      'width:100vw',
      'height:100vh',
      'max-width:100%',
      'max-height:100%',
      'pointer-events:none',
      'z-index:' + Z_INDEX,
      'margin:0',
      'padding:0',
      'border:0',
      'display:block',
      'overflow:visible'
    ].join(';');
    document.documentElement.appendChild(canvas);
    return canvas;
  }

  function resize(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h, ctx: ctx };
  }

  function makeParticle(w, h, fromEdge) {
    var color = COLORS[(Math.random() * COLORS.length) | 0];
    var x, y, vx, vy;
    if (fromEdge === 'left') {
      x = -10; y = Math.random() * h * 0.6;
      vx = 4 + Math.random() * 8; vy = -2 - Math.random() * 6;
    } else if (fromEdge === 'right') {
      x = w + 10; y = Math.random() * h * 0.6;
      vx = -(4 + Math.random() * 8); vy = -2 - Math.random() * 6;
    } else {
      // Center / top burst covering full page
      x = w * (0.15 + Math.random() * 0.7);
      y = h * (0.2 + Math.random() * 0.35);
      vx = (Math.random() - 0.5) * 14;
      vy = -6 - Math.random() * 10;
    }
    return {
      x: x, y: y, vx: vx, vy: vy,
      w: 5 + Math.random() * 7,
      h: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      color: color,
      gravity: 0.12 + Math.random() * 0.08,
      drag: 0.988 + Math.random() * 0.008,
      life: 1,
      decay: 0.003 + Math.random() * 0.004,
      shape: Math.random() < 0.35 ? 'circle' : 'rect'
    };
  }

  function drawParticle(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    ctx.restore();
  }

  function softFlash() {
    var el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position:fixed',
      'inset:0',
      'pointer-events:none',
      'z-index:' + (Z_INDEX - 1),
      'background:radial-gradient(ellipse at center, rgba(226,174,65,0.22) 0%, transparent 70%)',
      'opacity:0',
      'transition:opacity 600ms ease'
    ].join(';');
    document.documentElement.appendChild(el);
    requestAnimationFrame(function () {
      el.style.opacity = '1';
      setTimeout(function () {
        el.style.opacity = '0';
        setTimeout(function () { el.remove(); }, 700);
      }, 400);
    });
  }

  function runBurst() {
    var canvas = ensureCanvas();
    var size = resize(canvas);
    var ctx = size.ctx;
    var particles = [];
    var i;
    for (i = 0; i < 90; i++) particles.push(makeParticle(size.w, size.h, 'center'));
    for (i = 0; i < 40; i++) particles.push(makeParticle(size.w, size.h, 'left'));
    for (i = 0; i < 40; i++) particles.push(makeParticle(size.w, size.h, 'right'));

    var start = performance.now();
    var lastSpawn = start;
    var running = true;
    var onResize = function () {
      size = resize(canvas);
      ctx = size.ctx;
    };
    window.addEventListener('resize', onResize);

    function frame(now) {
      if (!running) return;
      var elapsed = now - start;
      ctx.clearRect(0, 0, size.w, size.h);

      // Extra side cannons for first ~1.2s so edges fill
      if (elapsed < 1200 && now - lastSpawn > 90) {
        lastSpawn = now;
        particles.push(makeParticle(size.w, size.h, 'left'));
        particles.push(makeParticle(size.w, size.h, 'right'));
        particles.push(makeParticle(size.w, size.h, 'center'));
      }

      var alive = 0;
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        if (p.life <= 0) continue;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (elapsed > DURATION_MS * 0.55) p.life -= p.decay;
        if (p.life > 0 && p.y < size.h + 40) {
          drawParticle(ctx, p);
          alive++;
        } else {
          p.life = 0;
        }
      }

      if (elapsed < DURATION_MS || alive > 0) {
        requestAnimationFrame(frame);
      } else {
        running = false;
        window.removeEventListener('resize', onResize);
        ctx.clearRect(0, 0, size.w, size.h);
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  function init() {
    if (!consumeFlag()) return;
    if (prefersReducedMotion()) {
      softFlash();
      return;
    }
    // Defer one frame so layout (lang bar / card) is painted under the overlay
    requestAnimationFrame(function () {
      runBurst();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
