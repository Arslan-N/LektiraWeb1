/* ---------------------------------------------------------------------------
   set-author.js — mijenja IME AUTORA u cijelom projektu (jedna komanda).

   Zašto postoji: ime autora se u projektu pojavljuje više od 60 puta i to u
   raznim padežima. Ova skripta ih mijenja sve odjednom i pazi na padež, tako da
   nijedno mjesto ne ostane „poluispravljeno“.

   Primjeri:
     node tools/set-author.js "Zija Dizdarević"     # izdanje djela se potpisuje ovako
     node tools/set-author.js "Zijo Dizdarević"     # trenutno stanje projekta
     node tools/set-author.js --check               # samo prikaži šta se trenutno koristi

   Skripta dira samo fajlove u kojima se ime stvarno pojavljuje (HTML, CSS,
   JS, MD i SVG naslovnica) i nikada ne dira mapu images/ osim naslovnice.
   --------------------------------------------------------------------------- */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/* Padeži imena koji se koriste u tekstu: nominativ, genitiv, dativ, instrumental. */
const BASES = {
  Zijad: { nom: 'Zijad', gen: 'Zijada', dat: 'Zijadu', ins: 'Zijadom' },
  Zijo: { nom: 'Zijo', gen: 'Zije', dat: 'Ziji', ins: 'Zijom' },
  Zija: { nom: 'Zija', gen: 'Zije', dat: 'Ziji', ins: 'Zijom' },
};

/* Svaki oblik -> bazno ime + padež. */
const FORMS = new Map();
for (const [base, forms] of Object.entries(BASES)) {
  for (const [kase, form] of Object.entries(forms)) {
    if (!FORMS.has(form)) FORMS.set(form, []);
    FORMS.get(form).push({ base, kase });
  }
}

/* Rečenica/zamjenica koja slijedi ime i po kojoj prepoznajemo da je to zaista autor. */
const SURNAME = 'Dizdarevi';
const PATTERN = new RegExp(`(${[...FORMS.keys()].join('|')})(\\s+${SURNAME})`, 'g');

const EXT = new Set(['.html', '.css', '.js', '.mjs', '.md', '.svg', '.json']);
const SKIP_DIRS = new Set(['node_modules', '.git', '_shots', '.vscode']);
/* Samu sebe ne diramo: u komentarima ove skripte ime se pojavljuje kao primjer. */
const SELF = path.resolve(__filename);

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const target = args.find((a) => !a.startsWith('--'));

/* ---------- popis fajlova koji se pregledaju --------------------------------- */
function collect(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('_')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'images' && dir !== root) continue;
      collect(p, out);
      continue;
    }
    if (EXT.has(path.extname(entry.name))) {
      const resolved = path.resolve(p);
      if (resolved !== SELF) out.push(p);
    }
  }
  return out;
}

const files = collect(root);

/* ---------- šta se trenutno koristi ----------------------------------------- */
const counts = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(PATTERN)) {
    for (const { base, kase } of FORMS.get(m[1]) || []) {
      const key = `${base} (${kase})`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
}

if (!counts.size) {
  console.error('✗ Nigdje ne nalazim ime autora („… Dizdarević“).');
  process.exit(1);
}

/* Bazno ime određujemo po obliku koji pripada samo jednom imenu (nominativ/genitiv). */
const unambiguous = [...counts.entries()].filter(([k]) => {
  const base = k.split(' ')[0];
  return FORMS.get(BASES[base].nom).length === 1;
});

console.log('Trenutno stanje u projektu:');
for (const [k, n] of [...counts.entries()].sort()) console.log(`   ${k.padEnd(18)} ${n}×`);

const current = BASES[unambiguous.length ? unambiguous[0][0].split(' ')[0] : 'Zijad'];
const targetFirst = target ? target.split(/\s+/)[0] : null;
const targetRest = target ? target.split(/\s+/).slice(1).join(' ') : null;

if (checkOnly || !target) {
  console.log(`\nPrepoznato ime: ${current.nom} ${SURNAME}ć`);
  console.log('Za promjenu:  node tools/set-author.js "Zija Dizdarević"');
  process.exit(0);
}

if (!BASES[targetFirst]) {
  console.error(`\n✗ Nepoznato ime „${targetFirst}“. Dozvoljeno: ${Object.keys(BASES).join(', ')}.`);
  process.exit(1);
}
if (targetRest && !targetRest.startsWith(SURNAME)) {
  console.error(`\n✗ Prezime mora biti „${SURNAME}ć“ (dobiveno: „${targetRest}“).`);
  process.exit(1);
}
if (targetFirst === current.nom) {
  console.log(`\nIme je već „${current.nom} ${SURNAME}ć“ — nema šta mijenjati.`);
  process.exit(0);
}

const next = BASES[targetFirst];
let changed = 0;
let replacements = 0;

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(PATTERN, (whole, first, tail) => {
    const entries = FORMS.get(first);
    if (!entries) return whole;
    const kase = entries[0].kase;          /* oblik ima isti padež u svim bazama */
    replacements += 1;
    return next[kase] + tail;
  });
  if (after === before) continue;
  fs.writeFileSync(file, after, 'utf8');
  changed += 1;
  console.log(`   uređeno: ${path.relative(root, file)}`);
}

console.log(`\n✔ Ime promijenjeno na „${next.nom} ${SURNAME}ć“ (${replacements} pojava u ${changed} fajlova).`);
console.log('  Sljedeće provjere su već spremne:');
console.log('     node tools/check-structure.js');
console.log('     node tools/check-links.js');
console.log('     node tools/render-check.js');