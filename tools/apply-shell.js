'use strict';
/* ============================================================================
   Ubacuje zajednički footer i <script> tagove u sve HTML stranice.
   Pokretanje:  node tools/apply-shell.js
   Koristi se samo jednom (kod izrade) ili kad se footer mijenja na svim
   stranicama odjednom. Skripta preskače stranice koje već imaju footer.
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = [
  'index.html',
  'pitanje1.html',
  'pitanje2.html',
  'pitanje3.html',
  'pitanje4.html',
  'pitanje5.html',
  'pitanje6.html',
  'kviz.html',
  'materijali.html'
];

const FOOTER = `  </main>

  <footer class="site-footer">
    <div class="container container--wide footer__grid">
      <div class="footer__brand">
        <span class="eyebrow eyebrow--bare">Školska lektira · Rad 3. grupe</span>
        <p class="footer__title">Prosanjane jeseni</p>
        <p class="footer__text">Autor: Zija Dizdarević. Grupna prezentacija lektire 3. grupe: šest pitanja s odgovorima, kviz za provjeru znanja i materijali za čitanje.</p>
      </div>
      <nav class="footer__col" aria-labelledby="footer-pitanja">
        <p class="footer__heading" id="footer-pitanja">Pitanja</p>
        <ul class="footer__list">
          <li><a href="pitanje1.html">01 · Dizdarevićeva slika ljudi</a></li>
          <li><a href="pitanje2.html">02 · Mentalitet bosanskog čovjeka</a></li>
          <li><a href="pitanje3.html">03 · Toksični odnosi među ljudima</a></li>
          <li><a href="pitanje4.html">04 · Portret majke</a></li>
          <li><a href="pitanje5.html">05 · Majčin položaj nekad i sad</a></li>
          <li><a href="pitanje6.html">06 · Položaj žene nekad i sad</a></li>
        </ul>
      </nav>
      <nav class="footer__col" aria-labelledby="footer-stranice">
        <p class="footer__heading" id="footer-stranice">Stranice</p>
        <ul class="footer__list">
          <li><a href="index.html">Početna</a></li>
          <li><a href="kviz.html">Kviz</a></li>
          <li><a href="materijali.html">Materijali</a></li>
        </ul>
      </nav>
      <div class="footer__col">
        <p class="footer__heading">Materijali</p>
        <ul class="footer__list">
          <li><a href="materijali.html#pdf">PDF verzija djela</a></li>
          <li><a href="materijali.html#audio">Audio knjiga</a></li>
          <li><a href="materijali.html#dodatno">Dodatni materijali</a></li>
          <li><a href="materijali.html#izvori">Izvori i literatura</a></li>
        </ul>
      </div>
    </div>
    <div class="container container--wide footer__bottom">
      <p>© <span data-year>2026</span> <strong>Arslan Nanić</strong> · Rad 3. grupe · Školska lektira</p>
      <p>Djelo: <strong>Prosanjane jeseni</strong> — Zija Dizdarević</p>
    </div>
  </footer>

  <button class="to-top" type="button" data-to-top aria-label="Na vrh stranice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>

  <script src="js/animations.js" defer></script>
  <script src="js/main.js" defer></script>
  <script src="js/gallery.js" defer></script>
</body>
</html>
`;

const NEEDLE = /\r?\n  <\/main>\r?\n<\/body>\r?\n<\/html>\r?\n?$/;
let changed = 0;

PAGES.forEach((page) => {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) {
    console.log('  – preskočeno (nema fajla): ' + page);
    return;
  }
  let html = fs.readFileSync(file, 'utf8');
  if (html.indexOf('class="site-footer"') !== -1) {
    console.log('  = već ima footer: ' + page);
    return;
  }
  if (!NEEDLE.test(html)) {
    console.log('  ! obrazac nije pronađen: ' + page);
    return;
  }
  if (/###\s*(NASTAVAK|BLOKOVI|ASIDE|SADRZAJ|ZAKLJUCAK)/.test(html)) {
    console.log('  ! stranica ima nezavršene oznake: ' + page);
    return;
  }
  const newline = html.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
  const tail = newline === '\r\n' ? FOOTER.replace(/\n/g, '\r\n') : FOOTER;
  html = html.replace(NEEDLE, newline + tail);
  fs.writeFileSync(file, html, 'utf8');
  changed += 1;
  console.log('  ✔ footer dodan: ' + page);
});

console.log('\nUkupno izmijenjeno stranica: ' + changed);
