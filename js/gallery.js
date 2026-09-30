/* ============================================================
   Prosanjane jeseni — gallery.js
   Lightbox za slike i filteri galerije (npr. Nekad / Danas).
   ============================================================ */
(function () {
  'use strict';

  const doc = document;
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));

  const ICON_CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICON_PREV =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const ICON_NEXT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';

  /* 1. LIGHTBOX ---------------------------------------------- */
  function initLightbox() {
    const items = $$('[data-lightbox]');
    if (!items.length) return;

    const box = doc.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Uvećani prikaz slike');
    box.innerHTML =
      '<button class="lightbox__close" type="button" data-lb-close aria-label="Zatvori prikaz">' + ICON_CLOSE + '</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" data-lb-prev aria-label="Prethodna slika">' + ICON_PREV + '</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" data-lb-next aria-label="Sljedeća slika">' + ICON_NEXT + '</button>' +
      '<figure class="lightbox__figure"><img src="" alt=""><figcaption class="lightbox__cap"></figcaption></figure>';
    doc.body.appendChild(box);

    const viewImg = $('img', box);
    const viewCap = $('.lightbox__cap', box);
    let index = 0;
    let lastFocus = null;

    const visible = () => items.filter((item) => !item.classList.contains('is-hidden'));

    function show(next) {
      const list = visible();
      if (!list.length) return;
      index = (next + list.length) % list.length;
      const item = list[index];
      const inner = $('img', item);
      const src = item.getAttribute('data-lightbox') || (inner ? inner.getAttribute('src') : '');
      const caption = item.getAttribute('data-caption') || (inner ? inner.getAttribute('alt') : '');
      if (src) viewImg.setAttribute('src', src);
      viewImg.setAttribute('alt', caption || '');
      viewCap.textContent = caption || '';
      viewCap.hidden = !caption;
    }

    function open(item) {
      const list = visible();
      const at = list.indexOf(item);
      if (at < 0) return;
      lastFocus = doc.activeElement;
      show(at);
      box.classList.add('is-open');
      doc.body.classList.add('is-locked');
      $('[data-lb-close]', box).focus();
    }

    function close() {
      box.classList.remove('is-open');
      doc.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    items.forEach((item) => {
      item.addEventListener('click', () => open(item));
    });

    $('[data-lb-close]', box).addEventListener('click', close);
    box.addEventListener('click', (event) => {
      if (event.target === box) close();
    });
    $('[data-lb-prev]', box).addEventListener('click', (event) => {
      event.stopPropagation();
      show(index - 1);
    });
    $('[data-lb-next]', box).addEventListener('click', (event) => {
      event.stopPropagation();
      show(index + 1);
    });

    doc.addEventListener('keydown', (event) => {
      if (!box.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
    });
  }

  /* 2. FILTERI GALERIJE ------------------------------------- */
  function initFilters() {
    $$('[data-filter-group]').forEach((group) => {
      const buttons = $$('[data-filter]', group);
      const targetSel = group.getAttribute('data-filter-target');
      const target = targetSel ? $(targetSel) : null;
      if (!buttons.length || !target) return;

      const items = $$('[data-tags]', target);

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const value = button.getAttribute('data-filter');
          buttons.forEach((other) => {
            const active = other === button;
            other.classList.toggle('is-active', active);
            other.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          items.forEach((item) => {
            const tags = (item.getAttribute('data-tags') || '').split(/\s+/);
            const show = value === 'sve' || value === 'all' || tags.indexOf(value) !== -1;
            item.classList.toggle('is-hidden', !show);
          });
        });
      });
    });
  }

  function init() {
    initLightbox();
    initFilters();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
