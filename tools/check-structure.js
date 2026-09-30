'use strict';
/* ============================================================================
   Provjera strukture HTML stranica:
   - uravnoteženost oznaka (div, section, article, aside, nav, main, ul, li ...)
   - prisutnost ključnih elemenata (data-page, header, main, footer, skripte)
   Pokretanje:  node tools/check-structure.js
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

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr', 'path', 'circle', 'line', 'ellipse',
  'rect', 'polyline', 'polygon', 'stop', 'use', 'feTurbulence', 'feColorMatrix',
  'feGaussianBlur', 'feGaussianBlur', 'textPath'
]);

function checkFile(page) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) return { page: page, error: 'fajl ne postoji' };

  const html = fs.readFileSync(file, 'utf8');
  const lines = html.split(/\r?\n/);
  const stack = [];
  const problems = [];
  const counts = {};

  const re = /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;

  lines.forEach((line, index) => {
    let m;
    const lineRe = new RegExp(re.source, 'g');
    while ((m = lineRe.exec(line)) !== null) {
      if (m[0].startsWith('<!--') || m[0].startsWith('<!')) continue;

      if (m[1]) {
        const tag = m[1].toLowerCase();
        counts[tag] = (counts[tag] || 0) + 1;
        const top = stack.pop();
        if (!top) {
          problems.push('linija ' + (index + 1) + ': zatvorena oznaka </' + tag + '> bez otvorene');
        } else if (top.tag !== tag) {
          problems.push('linija ' + (index + 1) + ': </' + tag + '> zatvara <' + top.tag + '> (otvorena na liniji ' + top.line + ')');
        }
      } else if (m[2]) {
        const tag = m[2].toLowerCase();
        const selfClosing = m[4] === '/';
        if (selfClosing || VOID.has(tag)) continue;
        stack.push({ tag: tag, line: index + 1 });
      }
    }
  });

  stack.forEach((open) => {
    problems.push('linija ' + open.line + ': <' + open.tag + '> nikad nije zatvoren');
  });

  const required = [
    ['data-page', /<body[^>]*data-page="[^"]+"/],
    ['zaglavlje', /class="site-header"/],
    ['glavni sadržaj', /<main id="main">/],
    ['footer', /class="site-footer"/],
    ['skip link', /class="skip-link"/],
    ['progress', /data-progress/],
    ['CSS style.css', /href="css\/style\.css"/],
    ['CSS pages.css', /href="css\/pages.css"/],
    ['JS animations', /src="js\/animations\.js"/],
    ['JS main', /src="js\/main\.js"/],
    ['JS gallery', /src="js\/gallery\.js"/]
  ];

  const missing = required.filter((pair) => !pair[1].test(html)).map((pair) => pair[0]);

  return {
    page: page,
    problems: problems,
    missing: missing,
    counts: counts,
    lines: lines.length
  };
}

let failed = 0;
PAGES.forEach((page) => {
  const result = checkFile(page);
  if (result.error) {
    console.log('✗ ' + page + ' — ' + result.error);
    failed += 1;
    return;
  }
  const ok = result.problems.length === 0 && result.missing.length === 0;
  if (!ok) failed += 1;
  console.log(
    (ok ? '✔' : '✗') + ' ' + page +
    '  (' + result.lines + ' linija, div:' + (result.counts.div || 0) +
    ', section:' + (result.counts.section || 0) +
    ', article:' + (result.counts.article || 0) +
    ', aside:' + (result.counts.aside || 0) + ')'
  );
  result.problems.forEach((p) => console.log('     → ' + p));
  if (result.missing.length) console.log('     → nedostaje: ' + result.missing.join(', '));
});

console.log('\n' + (failed === 0 ? 'Sve stranice su strukturno ispravne.' : 'Stranica s problemima: ' + failed));
