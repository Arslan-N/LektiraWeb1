'use strict';
/* ============================================================================
   Provjera linkova, slika i ID-jeva:
   - svaki lokalni href/src mora postojati na disku
   - svaki anker (#id) mora postojati na ciljnoj stranici
   - upozorava na duple id atribute unutar iste stranice
   - provjerava da JS/CSS fajlovi nisu prazni
   Pokretanje:  node tools/check-links.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort();

const idsByFile = {};
PAGES.forEach((page) => {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const ids = [];
  let m;
  const re = /\sid="([^"]+)"/g;
  while ((m = re.exec(html)) !== null) ids.push(m[1]);
  idsByFile[page] = ids;
});

let problems = 0;

PAGES.forEach((page) => {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const refs = [];
  let m;

  const reHref = /(?:href|src)="([^"]+)"/g;
  while ((m = reHref.exec(html)) !== null) refs.push(m[1]);

  refs.forEach((ref) => {
    if (!ref || ref.startsWith('http') || ref.startsWith('mailto:') || ref.startsWith('data:') || ref === '#') return;

    if (ref.startsWith('#')) {
      if (idsByFile[page].indexOf(ref.slice(1)) === -1) {
        console.log('  ✗ ' + page + ' → anker ' + ref + ' ne postoji na stranici');
        problems += 1;
      }
      return;
    }

    const [filePart, hash] = ref.split('#');
    const target = filePart === '' ? page : filePart;

    if (!fs.existsSync(path.join(ROOT, target))) {
      console.log('  ✗ ' + page + ' → ne postoji fajl ' + target);
      problems += 1;
      return;
    }

    if (hash && target.endsWith('.html')) {
      const targetIds = idsByFile[target] || [];
      if (targetIds.indexOf(hash) === -1) {
        console.log('  ✗ ' + page + ' → ' + target + ' nema anker #' + hash);
        problems += 1;
      }
    }
  });

  // dupli ID-jevi
  const seen = {};
  idsByFile[page].forEach((id) => {
    if (seen[id]) {
      console.log('  ✗ ' + page + ' → dupli id "' + id + '"');
      problems += 1;
    }
    seen[id] = true;
  });
});

// JS/CSS fajlovi
['js/main.js', 'js/animations.js', 'js/gallery.js', 'css/style.css', 'css/pages.css'].forEach((rel) => {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.log('  ✗ nedostaje ' + rel);
    problems += 1;
    return;
  }
  const size = fs.statSync(full).size;
  if (size < 500) {
    console.log('  ✗ ' + rel + ' je sumnjivo mali (' + size + ' B)');
    problems += 1;
  }
});

console.log('\nBroj HTML stranica: ' + PAGES.length);
console.log(problems === 0 ? 'Svi linkovi, ankeri i ID-jevi su u redu.' : 'Pronađeno problema: ' + problems);
