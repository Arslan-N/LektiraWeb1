/* ============================================================
   Prosanjane jeseni — main.js
   Zaglavlje, navigacija, mobilna fioka, traka napretka čitanja,
   dugme "na vrh", glatki ankeri, godina u footeru.
   ============================================================ */
(function () {
  'use strict';

  const doc = document;
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));

  const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileNav = () => window.matchMedia('(max-width: 1040px)').matches;
  const headerOffset = () => {
    const header = $('[data-header]');
    return (header ? header.offsetHeight : 78) + 12;
  };

  /* 1. Zaglavlje — promjena stanja pri skrolu ------------------ */
  function initHeaderState() {
    const header = $('[data-header]');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* 2. Podmeni "Pitanja" (klik + tastatura; hover je u CSS-u) -- */
  function initDropdowns() {
    const items = $$('[data-sub]');
    if (!items.length) return;

    function close(item) {
      item.classList.remove('is-open');
      const toggle = $('.nav__sub-toggle', item);
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function open(item) {
      items.forEach((other) => {
        if (other !== item) close(other);
      });
      item.classList.add('is-open');
      const toggle = $('.nav__sub-toggle', item);
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }

    items.forEach((item) => {
      const toggle = $('.nav__sub-toggle', item);
      if (!toggle) return;
      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        if (item.classList.contains('is-open')) close(item);
        else open(item);
      });
      item.addEventListener('mouseenter', () => {
        if (!isMobileNav()) open(item);
      });
      item.addEventListener('mouseleave', () => {
        if (!isMobileNav()) close(item);
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          close(item);
          toggle.focus();
        }
      });
    });

    doc.addEventListener('click', (event) => {
      items.forEach((item) => {
        if (!item.contains(event.target)) close(item);
      });
    });
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') items.forEach(close);
    });
  }

  /* 3. Mobilna fioka (hamburger) ------------------------------ */
  function initDrawer() {
    const nav = $('[data-nav]');
    const burger = $('[data-burger]');
    if (!nav || !burger) return;

    let backdrop = $('.nav-backdrop');
    if (!backdrop) {
      backdrop = doc.createElement('div');
      backdrop.className = 'nav-backdrop';
      backdrop.setAttribute('data-nav-backdrop', '');
      doc.body.appendChild(backdrop);
    }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      backdrop.classList.toggle('is-visible', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
      doc.body.classList.toggle('is-locked', open);
    }

    burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    backdrop.addEventListener('click', () => setOpen(false));
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    $$('a', nav).forEach((link) => {
      link.addEventListener('click', () => {
        if (isMobileNav()) setOpen(false);
      });
    });

    const mq = window.matchMedia('(max-width: 1040px)');
    const onChange = (event) => {
      if (!event.matches) setOpen(false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
  }

  /* 4. Traka napretka čitanja --------------------------------- */
  function initProgress() {
    const bar = $('[data-progress]');
    if (!bar) return;
    const update = () => {
      const root = doc.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const value = max > 0 ? Math.min(root.scrollTop / max, 1) : 0;
      bar.style.setProperty('--progress', value.toFixed(4));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* 5. "Na vrh" i glatki ankeri ------------------------------- */
  function initToTop() {
    const button = $('[data-to-top]');
    if (!button) return;
    const update = () => button.classList.toggle('is-visible', window.scrollY > 720);
    window.addEventListener('scroll', update, { passive: true });
    update();
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
    });
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      link.addEventListener('click', (event) => {
        const target = doc.getElementById(href.slice(1));
        if (!target) return;
        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
        window.scrollTo({ top: Math.max(top, 0), behavior: prefersReduced() ? 'auto' : 'smooth' });
        if (history.replaceState) history.replaceState(null, '', href);
      });
    });
  }

  /* 6. Godina u footeru -------------------------------------- */
  function initYear() {
    const year = String(new Date().getFullYear());
    $$('[data-year]').forEach((el) => {
      el.textContent = year;
    });
  }

  /* 7. Rezerva ako slika nije dostupna ----------------------- */
  function initImageFallback() {
    $$('img').forEach((img) => {
      img.addEventListener('error', () => {
        const holder = img.closest('figure, .media, .gallery__item, .feature__media, .portrait');
        if (holder) holder.classList.add('media--missing');
        img.setAttribute('data-missing', 'true');
      });
    });
  }

  /* 8. Linkovi koji još nisu uneseni (data-link-todo) --------- */
  function initPendingLinks() {
    $$('a[data-link-todo]').forEach((link) => {
      if (link.getAttribute('href') !== '#') return;
      link.setAttribute('title', String(link.getAttribute('data-link-todo')));
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => {
        event.preventDefault();
      });
    });
  }

  /* 9. Sadržaj (TOC) — aktivna sekcija pri skrolu ------------- */
  function initTocSpy() {
    const links = $$('.toc__link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map();
    links.forEach((link) => {
      const section = doc.getElementById(link.getAttribute('href').slice(1));
      if (section) map.set(section, link);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.classList.remove('is-active'));
          const link = map.get(entry.target);
          if (link) link.classList.add('is-active');
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    map.forEach((link, section) => observer.observe(section));
  }

  function init() {
    initHeaderState();
    initDropdowns();
    initDrawer();
    initProgress();
    initToTop();
    initAnchors();
    initYear();
    initImageFallback();
    initPendingLinks();
    initTocSpy();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();

