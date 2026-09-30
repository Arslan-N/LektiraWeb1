/* ============================================================
   Prosanjane jeseni — animations.js
   Suptilne animacije: reveal-on-scroll, parallax, brojači.
   Beznapojno (vanilla JS), bez zavisnosti.
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));

  /* ---------------------------------------------------------
     1. REVEAL ON SCROLL
     Elementi sa [data-reveal] dobijaju klasu .is-visible kad
     uđu u viewport. Elementi unutar [data-reveal-group] dobijaju
     automatski "stagger" (vremenski pomak).
     --------------------------------------------------------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const groupCounters = new Map();
    items.forEach((el) => {
      const group = el.closest('[data-reveal-group]') || el.parentElement;
      const index = groupCounters.get(group) || 0;
      groupCounters.set(group, index + 1);
      el.style.setProperty('--reveal-delay', Math.min(index, 7) * 70 + 'ms');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.1 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
     2. PARALLAX
     [data-parallax="0.15"] na slici unutar .media / .hero__bg.
     Vrijednost = brzina pomaka (0 = bez pomaka).
     --------------------------------------------------------- */
  function initParallax() {
    const layers = $$('[data-parallax]');
    if (!layers.length || reduceMotion) return;

    const host = layers.map((l) => l.parentElement).filter(Boolean);
    let ticking = false;

    function update() {
      const viewportH = window.innerHeight;
      layers.forEach((layer, i) => {
        const parent = host[i];
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > viewportH + 120) return;
        const speed = parseFloat(layer.dataset.parallax) || 0.12;
        const offset = -rect.top * speed;
        layer.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0) scale(1.1)';
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------------------------------------------------------
     3. BROJAČI
     <span data-count-to="6" data-count-pad="2">00</span>
     --------------------------------------------------------- */
  function initCounters() {
    const counters = $$('[data-count-to]');
    if (!counters.length) return;

    const pad = (value, size) => {
      let out = String(value);
      while (size && out.length < size) out = '0' + out;
      return out;
    };

    function run(el) {
      const to = parseFloat(el.dataset.countTo) || 0;
      const size = parseInt(el.dataset.countPad || '0', 10);
      if (reduceMotion) {
        el.textContent = pad(to, size);
        return;
      }
      const duration = 1100;
      const start = performance.now();
      function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pad(Math.round(to * eased), size);
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
     4. BLAGI FADE ZA NOVOUČITANE SADRŽAJE / GALERIJE
     Dijeli se sa main.js preko window.Lektira
     --------------------------------------------------------- */
  function init() {
    initReveal();
    initParallax();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.LektiraAnimations = { initReveal, initParallax, initCounters };
})();
