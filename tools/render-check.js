'use strict';
/* ============================================================================
   Render provjera u pravom pregledniku (Chrome/Edge headless):
   - svaka stranica se učita lokalno (file://)
   - provjerava se da je JavaScript izvršen (JS dodaje .nav-backdrop i .lightbox)
   - ispisuju se greške iz konzole i stderr preglednika
   Pokretanje:  node tools/render-check.js
   ============================================================================ */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const PAGES = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
];

const browser = CANDIDATES.find((p) => fs.existsSync(p));
if (!browser) {
  console.log('Nema pronađenog preglednika (Chrome/Edge) — preskačem render provjeru.');
  process.exit(0);
}
console.log('Preglednik: ' + browser + '\n');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lektira-chrome-'));

function check(page) {
  return new Promise((resolve) => {
    const url = 'file:///' + path.join(ROOT, page).replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--virtual-time-budget=2500',
      '--user-data-dir=' + profile,
      '--dump-dom',
      url
    ];
    execFile(browser, args, { maxBuffer: 40 * 1024 * 1024 }, (error, stdout, stderr) => {
      const dom = stdout || '';
      const problems = [];
      if (error && dom.length === 0) problems.push('preglednik nije vratio DOM: ' + (error.message || ''));
      if (dom.indexOf('class="site-footer"') === -1) problems.push('footer nije u DOM-u');
      if (dom.indexOf('nav-backdrop') === -1) problems.push('JS nije dodao .nav-backdrop');
      if (dom.indexOf('--progress') === -1) problems.push('JS nije postavio traku napretka');
      if (dom.indexOf('data-missing="true"') !== -1) problems.push('neka slika nije učitana');
      // lightbox se stvara samo na stranicama koje imaju galeriju
      const hasGallery = dom.indexOf('data-lightbox=') !== -1;
      if (hasGallery && dom.indexOf('class="lightbox') === -1) problems.push('JS nije dodao .lightbox');
      if (!hasGallery && dom.indexOf('class="lightbox') !== -1) problems.push('nepotrebno dodan .lightbox');
      const jsErrors = (stderr || '')
        .split(/\r?\n/)
        .filter((l) => /Uncaught|SyntaxError|ReferenceError|TypeError|Failed to load/i.test(l));
      resolve({ page: page, problems: problems, jsErrors: jsErrors, size: dom.length });
    });
  });
}

(async () => {
  let failed = 0;
  for (const page of PAGES) {
    const result = await check(page);
    const ok = result.problems.length === 0 && result.jsErrors.length === 0;
    if (!ok) failed += 1;
    console.log((ok ? '✔' : '✗') + ' ' + result.page + '  (DOM ' + Math.round(result.size / 1024) + ' kB)');
    result.problems.forEach((p) => console.log('     → ' + p));
    result.jsErrors.slice(0, 4).forEach((e) => console.log('     → ' + e.trim()));
  }
  console.log('\n' + (failed === 0 ? 'Sve stranice se ispravno renderiraju.' : 'Stranica s problemima: ' + failed));
  fs.rmSync(profile, { recursive: true, force: true });
})();
