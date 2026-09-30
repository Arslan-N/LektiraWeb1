'use strict';
/* ============================================================================
   Popis svih mjesta koja čekaju sadržaj:
   - data-todo oznake (tekst koji upisuje grupa)
   - kartice bez linka (data-link-todo)
   - oznake zamjenskih slika (images/*.svg) po stranici
   Pokretanje:  node tools/list-todos.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
let totalTodos = 0;
let totalLinks = 0;

files.forEach((file) => {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const todos = (html.match(/data-todo="[^"]+"/g) || []).map((m) => m.slice(11, -1));
  const links = (html.match(/data-link-todo="[^"]+"/g) || []).map((m) => m.slice(16, -1));
  const images = [...new Set((html.match(/images\/[a-z0-9-]+\.svg/g) || []))];
  totalTodos += todos.length;
  totalLinks += links.length;

  console.log('■ ' + file);
  console.log('   tekst za unos (' + todos.length + '):');
  [...new Set(todos)].forEach((item) => {
    const count = todos.filter((t) => t === item).length;
    console.log('     ' + (count > 1 ? count + 'x ' : '   ') + item);
  });
  if (links.length) {
    console.log('   linkovi za unos (' + links.length + '):');
    [...new Set(links)].forEach((item) => console.log('     • ' + item));
  }
  console.log('   slike: ' + (images.length ? images.join(', ') : '—'));
  console.log('');
});

console.log('Ukupno tekstualnih oznaka: ' + totalTodos + ' | linkova bez odredišta: ' + totalLinks);
