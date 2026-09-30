'use strict';
/* ============================================================================
   Provjera ponašanja kviza u pravom pregledniku (headless Chrome/Edge):
   - netačan odgovor → crveno i prelazak na sljedeće pitanje je blokiran
   - tačan odgovor  → zeleno i tek tada je prelazak dozvoljen
   - rezultat broji odgovore tačne iz prvog pokušaja + pregled i ponovno
     pokretanje kviza
   - ponuda odgovora se miješa, pa se mjesto tačnog odgovora ne može
     unaprijed znati — pronalazi se poređenjem teksta sa js/kviz.js
   Pokretanje:  node tools/test-kviz.js
   ============================================================================ */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const CLONE = path.join(ROOT, '_test-kviz-flow.html');
const HARNESS_NAME = '_test-kviz-flow-harness.js';
const HARNESS = path.join(ROOT, HARNESS_NAME);

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
];

const HARNESS_SRC = `
(function () {
  /* Podaci o pitanjima iz js/kviz.js (tekstovi ponuđenih odgovora i
     tačan odgovor). Node ih ubacuje na ovo mjesto. Potrebni su zato
     što kviz.js miješa ponudu odgovora pri svakom pokretanju, pa se
     mjesto tačnog odgovora ne može unaprijed znati. */
  var DATA = JSON.parse(__DATA__);
  var out = [];
  function pass(name, ok, extra) {
    out.push((ok ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' [' + extra + ']' : ''));
    document.title = 'KVZTEST::RUN::' + out.join(' ;; ');
  }
  function one(sel, ctx) { return (ctx || document).querySelector(sel); }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function opts() { return all('.quiz__option'); }
  function choose(i) {
    var input = all('.quiz__option input')[i];
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function rgb(c) {
    var m = /(\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c || '');
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
  }
  function isRed(c) { var v = rgb(c); return v[0] > v[1] && v[1] >= v[2]; }
  function isGreen(c) { var v = rgb(c); return v[1] > v[0] && v[1] >= v[2]; }

  /* Mjesto tačnog odgovora u trenutnoj ponudi (0 = prvi ponuđeni).
     Traži se poređenjem teksta sa podacima iz izvora, jer se ponuda
     mijenja od pokretanja do pokretanja. */
  function correctIndex(qi) {
    var list = opts();
    var wanted = String(DATA[qi].options[DATA[qi].correct]).trim();
    for (var i = 0; i < list.length; i++) {
      if (String(one('span', list[i]).textContent).trim() === wanted) return i;
    }
    return -1;
  }
  function wrongIndex(qi) { return correctIndex(qi) === 0 ? 1 : 0; }
  function stepText() { return one('[data-quiz-step]').textContent; }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      try { run(); } catch (err) {
        document.title = document.title + ' ;; FAIL izuzetak: ' + err.message;
      }
    }, 500);
  });

  function run() {
    var errors = [];
    window.addEventListener('error', function (e) {
      errors.push(e.message);
    });
    var TOTAL = DATA.length;
    var nextBtn = one('[data-quiz-next]');
    var step = one('[data-quiz-step]');
    var result = one('[data-quiz-result]');
    var feedback = one('[data-quiz-feedback]');
    var positions = [];   /* mjesto tačnog odgovora u svakom pitanju */
    var unmatched = 0;    /* koliko tekstova odgovora nije prepoznato */

    pass('pocetak: brojac pokazuje 1 / ' + TOTAL, stepText() === 'Pitanje 1 / ' + TOTAL, stepText());
    pass('pocetak: dugme blokirano', nextBtn.disabled === true, nextBtn.disabled);

    /* 1) NETAČAN odgovor (odabire se mjesto koje nije tačno) */
    var ok0 = correctIndex(0);
    if (ok0 === -1) unmatched += 1;
    positions.push(ok0);
    var bad0 = wrongIndex(0);
    choose(bad0);
    var wrongLabel = opts()[bad0];
    pass('netacno: dugme ostaje blokirano', nextBtn.disabled === true, nextBtn.disabled);
    pass('netacno: odgovor ima klasu is-wrong', wrongLabel.classList.contains('is-wrong'));
    pass('netacno: tekst odgovora je crven', isRed(getComputedStyle(one('span', wrongLabel)).color), getComputedStyle(one('span', wrongLabel)).color);
    pass('netacno: poruka je prikazana', !!feedback && feedback.textContent.indexOf('Neta') === 0, feedback ? feedback.textContent.slice(0, 24) : 'nema');
    pass('netacno: poruka je crvena', isRed(getComputedStyle(feedback).color), getComputedStyle(feedback).color);
    nextBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    pass('netacno: prelazak nije moguc ni programski', stepText() === 'Pitanje 1 / ' + TOTAL, stepText());

    /* 2) TAČAN odgovor */
    choose(ok0);
    var okLabel = opts()[ok0];
    pass('tacno: dugme otkljucano', nextBtn.disabled === false, nextBtn.disabled);
    pass('tacno: odgovor ima klasu is-correct', okLabel.classList.contains('is-correct'));
    pass('tacno: tekst odgovora je zelen', isGreen(getComputedStyle(one('span', okLabel)).color), getComputedStyle(one('span', okLabel)).color);
    pass('tacno: poruka je zelena', isGreen(getComputedStyle(feedback).color), getComputedStyle(feedback).color);
    pass('tacno: odgovori su zakljucani', all('.quiz__option input').every(function (i) { return i.disabled; }));
    pass('netacno: prethodni pogresan ostaje crven', wrongLabel.classList.contains('is-wrong'));

    /* 3) ostala pitanja: odmah tačan odgovor */
    for (var q = 1; q < TOTAL; q++) {
      nextBtn.click();
      pass('pitanje ' + (q + 1) + ': prikazano novo pitanje', stepText() === 'Pitanje ' + (q + 1) + ' / ' + TOTAL, stepText());
      pass('pitanje ' + (q + 1) + ': dugme resetovano', nextBtn.disabled === true, nextBtn.disabled);
      var pos = correctIndex(q);
      if (pos === -1) unmatched += 1;
      positions.push(pos);
      choose(pos);
      pass('pitanje ' + (q + 1) + ': tacno zeleno + prelazak', pos >= 0 && opts()[pos].classList.contains('is-correct') && nextBtn.disabled === false);
    }
    nextBtn.click();

    /* 4) Rezultat i pregled */
    pass('rezultat: prikazan', !!result && result.hidden === false);
    var score = one('.quiz-result__score', result);
    var expected = (TOTAL - 1) + ' / ' + TOTAL;
    pass('rezultat: ' + expected + ' (prvi pokusaj)', !!score && score.textContent.trim() === expected, score ? score.textContent.trim() : 'nema');
    pass('rezultat: objasnjenje bodovanja', !!one('.quiz-result__note', result));
    var items = all('.quiz__review-item', result);
    pass('pregled: ' + TOTAL + ' stavki', items.length === TOTAL, items.length);
    pass('pregled: 1. pitanje = netacno iz 1. pokusaja', items.length > 0 && items[0].classList.contains('is-wrong') && items[0].textContent.indexOf('tvoj prvi odgovor') !== -1);
    pass('pregled: ostala pitanja tacna', items.slice(1).every(function (li) { return li.classList.contains('is-correct'); }));

    /* 5) Miješanje ponude: tačan odgovor nije stalno na istom mjestu */
    var distinct = positions.filter(function (p, i) { return p !== -1 && positions.indexOf(p) === i; });
    pass('mijesanje: tacni odgovori nisu stalno na jednom mjestu', distinct.length > 1, 'mjesta (0 = prvi): ' + positions.join(', '));
    pass('mijesanje: svi tekstovi odgovora prepoznati', unmatched === 0, unmatched);

    /* 6) Ponovi kviz (ponuda se ponovo miješa) */
    var restart = one('[data-quiz-restart]', result);
    restart.click();
    pass('ponovi kviz: nazad na 1. pitanje', stepText() === 'Pitanje 1 / ' + TOTAL, stepText());
    pass('ponovi kviz: rezultat skriven', result.hidden === true);
    pass('ponovi kviz: brojac resetovan', one('[data-quiz-score]').textContent.indexOf('0 / ' + TOTAL) !== -1, one('[data-quiz-score]').textContent);
    pass('ponovi kviz: boje ociscene', opts().every(function (el) { return !el.classList.contains('is-correct') && !el.classList.contains('is-wrong'); }));
    var badAfter = wrongIndex(0);
    choose(badAfter);
    pass('ponovi kviz: netacno opet crveno i blokirano', opts()[badAfter].classList.contains('is-wrong') && nextBtn.disabled === true);

    pass('nema neuhvacene greske u JS-u', errors.length === 0, errors.slice(0, 2).join(' | '));

    var fails = out.filter(function (l) { return l.indexOf('FAIL') === 0; }).length;
    document.title = 'KVZTEST::' + (fails === 0 ? 'OK' : fails + ' FAIL') + '::' + out.join(' ;; ');
  }
})();
`;

/* Pitanja se čitaju iz js/kviz.js (jedini izvor istine za kviz).
   U test se ubacuju kao JSON, a znakovi izvan ASCII-a se zapisuju kao
   \uXXXX escape-ovi da sadržaj ne zavisi od kodne stranice datoteke. */
function readQuestionData() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'kviz.js'), 'utf8');
  const decl = src.indexOf('const QUESTIONS = [');
  if (decl === -1) throw new Error('u js/kviz.js nije pronađen niz QUESTIONS');
  const from = src.indexOf('[', decl);
  let depth = 0;
  let quote = '';
  let end = -1;
  for (let i = from; i < src.length; i += 1) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; continue; }
    if (ch === '[' || ch === '{') depth += 1;
    else if (ch === ']' || ch === '}') {
      depth -= 1;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) throw new Error('niz QUESTIONS u js/kviz.js nije zatvoren');
  return new Function('return ' + src.slice(from, end + 1))();
}

function harnessData(data) {
  /* JSON tekst sa \uXXXX escape-ovima (ne zavisi od kodne stranice
     datoteke), a onda još jednom kroz JSON.stringify — tako nastaje
     ispravan JS string literal koji harness parsira sa JSON.parse. */
  const ascii = JSON.stringify(data)
    .replace(/[^\x20-\x7e]/g, (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
  return JSON.stringify(ascii);
}

const browser = CANDIDATES.find((p) => fs.existsSync(p));

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function runBrowser() {
  return new Promise((resolve) => {
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lektira-kviz-'));
    const url = 'file:///' + CLONE.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--virtual-time-budget=6000',
      '--user-data-dir=' + profile,
      '--dump-dom',
      url
    ];
    execFile(browser, args, { maxBuffer: 40 * 1024 * 1024 }, (error, stdout, stderr) => {
      fs.rmSync(profile, { recursive: true, force: true });
      resolve({ dom: stdout || '', stderr: stderr || '', error: error });
    });
  });
}

(async () => {
  if (!browser) {
    console.log('Nema pronađenog preglednika (Chrome/Edge) — preskačem test.');
    return;
  }

  let questionsData;
  try {
    questionsData = readQuestionData();
  } catch (err) {
    console.log('Pitanja se ne mogu pročitati iz js/kviz.js: ' + err.message);
    process.exitCode = 1;
    return;
  }
  console.log('Pitanja u js/kviz.js: ' + questionsData.length);

  let html = fs.readFileSync(path.join(ROOT, 'kviz.html'), 'utf8');
  html = html.replace('</body>', '  <script src="' + HARNESS_NAME + '"></script>\n</body>');
  fs.writeFileSync(CLONE, html, 'utf8');
  fs.writeFileSync(HARNESS, HARNESS_SRC.trim().replace('__DATA__', harnessData(questionsData)) + '\n', 'utf8');

  try {
    const { dom, stderr, error } = await runBrowser();
    const m = /<title>([\s\S]*?)<\/title>/.exec(dom);
    if (!m) {
      console.log('Nema rezultata testa u naslovu dokumenta.');
      console.log('Dužina DOM-a: ' + dom.length + (error ? ' · greška: ' + error.message : ''));
      process.exitCode = 1;
      return;
    }
    const parts = decode(m[1]).split('::');
    if (parts.length < 3) {
      console.log('Test nije vratio rezultat. Naslov: ' + decode(m[1]).slice(0, 300));
      console.log('stderr: ' + stderr.split(/\r?\n/).filter(Boolean).slice(0, 8).join(' | '));
      process.exitCode = 1;
      return;
    }
    const head = parts.length > 1 ? parts[1] : '?';
    const lines = parts.length > 2 ? parts[2].split(' ;; ') : [];
    console.log('Kviz — provjera ponašanja (' + browser + ')\n');
    lines.forEach((l) => console.log((l.indexOf('FAIL') === 0 ? '✗ ' : '✔ ') + l.replace(/^(PASS|FAIL) /, '')));
    stderr
      .split(/\r?\n/)
      .filter((l) => /Uncaught|SyntaxError|ReferenceError|TypeError/.test(l))
      .slice(0, 5)
      .forEach((e) => console.log('   → ' + e.trim()));
    const failed = lines.filter((l) => l.indexOf('FAIL') === 0).length;
    console.log('\n' + head + ' — prolaz: ' + (lines.length - failed) + ' / ' + lines.length);
    process.exitCode = failed === 0 && head === 'OK' ? 0 : 1;
  } finally {
    fs.rmSync(CLONE, { force: true });
    fs.rmSync(HARNESS, { force: true });
  }
})();

