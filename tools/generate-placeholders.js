'use strict';
/* ============================================================================
   Prosanjane jeseni — generator dekorativnih placeholder ilustracija (SVG)
   ----------------------------------------------------------------------------
   Pokretanje:  node tools/generate-placeholders.js
   Rezultat:    ../images/*.svg   (atmosferične ilustracije: jesen, Bosna,
                stare kuće, knjige, majka, žena, porodica, nekad / danas)

   NAPOMENA: ovo su *placeholder* grafike u stilu "papirnog kolaža".
   Kada grupa dostavi prave fotografije, zamijenite fajl istog imena
   (ili promijenite src u HTML-u) — ostatak dizajna se ne mijenja.
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'images');

/* ---------------------------------------------------------------------------
   PALETA — usklađena sa CSS varijablama u css/style.css
   --------------------------------------------------------------------------- */
const C = {
  ink900: '#150f0a',
  ink800: '#1e1712',
  ink700: '#2a2018',
  ink600: '#3a2c20',
  paper: '#f7f1e6',
  paper2: '#e9dfcd',
  paper3: '#d3c3a6',
  amber: '#d9a25a',
  amber2: '#c2833a',
  amber3: '#96601f',
  rust: '#a1502c',
  rust2: '#763623',
  moss: '#556141',
  moss2: '#3d4832',
  plum: '#5a3a48',
  plum2: '#3a2531',
  cream: '#f6ecdc',
  skyHi: '#f6d9a4',
  skyMid: '#d9a05e',
  skyLow: '#8a5b41',
  skyDark: '#3d2b28',
  coolHi: '#d7dee3',
  coolMid: '#9aa7b1',
  coolLow: '#55636e',
  sepiaHi: '#e4cfa6',
  sepiaMid: '#b9915c',
  sepiaLow: '#6c4f2e',
  sepiaDark: '#3c2c19'
};

/* ---------------------------------------------------------------------------
   POMOĆNE FUNKCIJE
   --------------------------------------------------------------------------- */
function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const r2 = (n) => Number(Number(n).toFixed(2));
const range = (rng, a, b) => a + rng() * (b - a);
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];

function linearGradient(id, stops, o) {
  const opt = o || {};
  const x1 = opt.x1 != null ? opt.x1 : 0;
  const y1 = opt.y1 != null ? opt.y1 : 0;
  const x2 = opt.x2 != null ? opt.x2 : 0;
  const y2 = opt.y2 != null ? opt.y2 : 1;
  const body = stops
    .map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`)
    .join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${body}</linearGradient>`;
}

function radialGradient(id, stops, o) {
  const opt = o || {};
  const cx = opt.cx != null ? opt.cx : 0.5;
  const cy = opt.cy != null ? opt.cy : 0.5;
  const r = opt.r != null ? opt.r : 0.75;
  const body = stops
    .map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`)
    .join('');
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${body}</radialGradient>`;
}

function grainFilter(id, freq) {
  const f = freq || 0.9;
  return (
    `<filter id="${id}" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="4" stitchTiles="stitch"/>` +
    '<feColorMatrix type="saturate" values="0"/></filter>'
  );
}

function blurFilter(id, dev) {
  return (
    `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feGaussianBlur stdDeviation="${dev}"/></filter>`
  );
}

/* Zrnatost preko cijele slike (daje "štampani" / analogni osjećaj) */
function grain(w, h, id, opacity) {
  return `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${opacity || 0.09}" style="mix-blend-mode:overlay"/>`;
}

/* Vinjeta — tamniji rubovi */
function vignette(w, h, id) {
  return `<rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

/* Slojeviti obronci / brda */
function ridge(w, h, baseY, amp, rng, step) {
  const s = step || 90;
  let d = `M0 ${r2(baseY)}`;
  let up = rng() > 0.45;
  for (let x = s; x <= w + s; x += s) {
    const factor = up ? 1 : 0.45;
    const y = baseY - factor * amp * (0.4 + rng() * 0.6);
    d += ` Q ${r2(x - s / 2)} ${r2(y - amp * 0.35)} ${r2(Math.min(x, w))} ${r2(y)}`;
    if (rng() > 0.55) up = !up;
  }
  d += ` L${w} ${h} L0 ${h} Z`;
  return d;
}

/* Stablo u jesenjem koloritu */
function tree(x, groundY, scale, rng, palette, trunkColor) {
  const th = 58 * scale;
  const tw = 5 * scale;
  const trunk = `<path d="M${r2(x)} ${r2(groundY)} L${r2(x - tw / 2)} ${r2(groundY - th)} L${r2(x + tw / 2)} ${r2(groundY - th)} Z" fill="${trunkColor || C.ink700}"/>`;
  let crowns = '';
  for (let i = 0; i < 5; i += 1) {
    const bx = x + range(rng, -30, 30) * scale;
    const by = groundY - th - range(rng, -20, 26) * scale;
    const r = range(rng, 15, 30) * scale;
    crowns += `<circle cx="${r2(bx)}" cy="${r2(by)}" r="${r2(r)}" fill="${pick(rng, palette)}" opacity="${r2(range(rng, 0.5, 0.92))}"/>`;
  }
  return `<g>${trunk}${crowns}</g>`;
}

/* List */
function leaf(x, y, size, rot, color, opacity) {
  const d = `M0 0 C ${r2(size * 0.55)} ${r2(-size * 0.5)} ${r2(size)} ${r2(-size * 0.15)} ${r2(size)} 0 C ${r2(size)} ${r2(size * 0.15)} ${r2(size * 0.55)} ${r2(size * 0.5)} 0 0 Z`;
  return (
    `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${rot})">` +
    `<path d="${d}" fill="${color}" opacity="${opacity}"/>` +
    `<path d="M0 0 L${r2(size)} 0" stroke="${C.ink800}" stroke-opacity="0.28" stroke-width="${r2(size * 0.05)}"/></g>`
  );
}

/* Ptica (silueta) */
function bird(x, y, s, color, opacity) {
  const d = `M${r2(x - s)} ${r2(y)} Q ${r2(x - s / 2)} ${r2(y - s * 0.7)} ${r2(x)} ${r2(y)} Q ${r2(x + s / 2)} ${r2(y - s * 0.7)} ${r2(x + s)} ${r2(y)}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${r2(s * 0.14)}" stroke-linecap="round" opacity="${opacity}"/>`;
}

/* Muška / opšta figura (stil papirnog kolaža) */
function figure(x, baseY, hgt, color, opacity) {
  const shoulder = baseY - hgt * 0.74;
  const w = hgt * 0.15;
  const headR = hgt * 0.085;
  const d =
    `M${r2(x - w)} ${r2(baseY)} L${r2(x - w * 1.02)} ${r2(shoulder + hgt * 0.1)} ` +
    `C ${r2(x - w * 0.98)} ${r2(shoulder)} ${r2(x - w * 0.6)} ${r2(shoulder - hgt * 0.02)} ${r2(x)} ${r2(shoulder - hgt * 0.02)} ` +
    `C ${r2(x + w * 0.6)} ${r2(shoulder - hgt * 0.02)} ${r2(x + w * 0.98)} ${r2(shoulder)} ${r2(x + w * 1.02)} ${r2(shoulder + hgt * 0.1)} ` +
    `L${r2(x + w)} ${r2(baseY)} Z`;
  const head = `<circle cx="${r2(x)}" cy="${r2(shoulder - headR * 1.15)}" r="${r2(headR)}" fill="${color}"/>`;
  return `<g fill="${color}" opacity="${opacity || 1}">${d}${head}</g>`;
}

/* Ženska figura (duža haljina, opciono marama) */
function womanFigure(x, baseY, hgt, color, opts) {
  const o = opts || {};
  const shoulder = baseY - hgt * 0.76;
  const w = hgt * 0.125;
  const hem = hgt * 0.2;
  const headR = hgt * 0.082;
  const dress =
    `M${r2(x - hem)} ${r2(baseY)} ` +
    `C ${r2(x - hem * 0.92)} ${r2(baseY - hgt * 0.34)} ${r2(x - w * 1.05)} ${r2(shoulder + hgt * 0.12)} ${r2(x - w)} ${r2(shoulder + hgt * 0.1)} ` +
    `C ${r2(x - w * 0.55)} ${r2(shoulder - hgt * 0.015)} ${r2(x + w * 0.55)} ${r2(shoulder - hgt * 0.015)} ${r2(x + w)} ${r2(shoulder + hgt * 0.1)} ` +
    `C ${r2(x + w * 1.05)} ${r2(shoulder + hgt * 0.12)} ${r2(x + hem * 0.92)} ${r2(baseY - hgt * 0.34)} ${r2(x + hem)} ${r2(baseY)} Z`;
  const headY = shoulder - headR * 1.15;
  let head = `<circle cx="${r2(x)}" cy="${r2(headY)}" r="${r2(headR)}" fill="${color}"/>`;
  if (o.scarf) {
    head =
      `<path d="M${r2(x - headR * 1.18)} ${r2(headY + headR * 0.15)} C ${r2(x - headR * 1.25)} ${r2(headY - headR * 1.55)} ${r2(x + headR * 1.25)} ${r2(headY - headR * 1.55)} ${r2(x + headR * 1.18)} ${r2(headY + headR * 0.15)} C ${r2(x + headR * 1.35)} ${r2(headY + headR * 1.7)} ${r2(x - headR * 1.35)} ${r2(headY + headR * 1.7)} ${r2(x - headR * 1.18)} ${r2(headY + headR * 0.15)} Z" fill="${o.scarf}"/>` +
      `<circle cx="${r2(x)}" cy="${r2(headY)}" r="${r2(headR * 0.84)}" fill="${color}"/>`;
  }
  return `<g fill="${color}">${dress}${head}</g>`;
}

/* Stara bosanska kuća: strm krov, dimnjak, mala okna */
function bosnianHouse(x, baseY, s, opts) {
  const o = opts || {};
  const wall = o.wall || C.paper2;
  const roof = o.roof || C.ink600;
  const win = o.windows || C.amber;
  const w = 190 * s;
  const h = 110 * s;
  const left = x - w / 2;
  const roofH = 118 * s;
  const body =
    `<rect x="${r2(left)}" y="${r2(baseY - h)}" width="${r2(w)}" height="${r2(h)}" fill="${wall}"/>` +
    `<path d="M${r2(left - 24 * s)} ${r2(baseY - h)} L${r2(x)} ${r2(baseY - h - roofH)} L${r2(left + w + 24 * s)} ${r2(baseY - h)} Z" fill="${roof}"/>`;
  let windows = '';
  for (let i = 0; i < 3; i += 1) {
    const wx = left + w * (0.18 + i * 0.28);
    windows +=
      `<rect x="${r2(wx)}" y="${r2(baseY - h * 0.72)}" width="${r2(w * 0.14)}" height="${r2(h * 0.3)}" rx="${r2(5 * s)}" fill="${win}" opacity="0.85"/>` +
      `<rect x="${r2(wx - 3 * s)}" y="${r2(baseY - h * 0.79)}" width="${r2(w * 0.14 + 6 * s)}" height="${r2(h * 0.05)}" rx="${r2(3 * s)}" fill="${C.ink700}" opacity="0.65"/>`;
  }
  const chimney = `<rect x="${r2(left + w * 0.74)}" y="${r2(baseY - h - roofH * 0.78)}" width="${r2(20 * s)}" height="${r2(roofH * 0.46)}" fill="${roof}"/>`;
  const smoke = o.smoke
    ? `<g opacity="0.35" filter="url(#soft)"><circle cx="${r2(left + w * 0.74 + 10 * s)}" cy="${r2(baseY - h - roofH * 0.95)}" r="${r2(16 * s)}" fill="${C.paper}"/><circle cx="${r2(left + w * 0.74 + 34 * s)}" cy="${r2(baseY - h - roofH * 1.14)}" r="${r2(22 * s)}" fill="${C.paper}"/><circle cx="${r2(left + w * 0.74 + 8 * s)}" cy="${r2(baseY - h - roofH * 1.34)}" r="${r2(27 * s)}" fill="${C.paper}"/></g>`
    : '';
  return `<g>${body}${chimney}${windows}${smoke}</g>`;
}

/* Drvena ograda */
function fence(x1, x2, y, s, color) {
  let posts = '';
  for (let x = x1; x <= x2; x += 26 * s) {
    posts += `<rect x="${r2(x)}" y="${r2(y - 40 * s)}" width="${r2(7 * s)}" height="${r2(40 * s)}" fill="${color}"/>`;
  }
  const rails =
    `<rect x="${r2(x1)}" y="${r2(y - 34 * s)}" width="${r2(x2 - x1)}" height="${r2(6 * s)}" fill="${color}"/>` +
    `<rect x="${r2(x1)}" y="${r2(y - 16 * s)}" width="${r2(x2 - x1)}" height="${r2(5 * s)}" fill="${color}" opacity="0.8"/>`;
  return `<g>${posts}${rails}</g>`;
}

/* Prozorsko svjetlo (topli pravougaonik na zidu) */
function windowLight(x, y, w, h, rotate) {
  return (
    `<g transform="rotate(${rotate || 0} ${r2(x + w / 2)} ${r2(y + h / 2)})">` +
    `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="6" fill="url(#light)"/>` +
    `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="6" fill="none" stroke="${C.ink900}" stroke-opacity="0.35" stroke-width="7"/>` +
    `<rect x="${r2(x + w / 2 - 3)}" y="${r2(y)}" width="6" height="${r2(h)}" fill="${C.ink900}" opacity="0.4"/></g>`
  );
}

/* Otvorena knjiga */
function openBook(cx, cy, s, pageColor, lineColor) {
  const pw = 230 * s;
  const ph = 150 * s;
  const pages =
    `<path d="M${r2(cx)} ${r2(cy)} C ${r2(cx - pw * 0.45)} ${r2(cy - ph * 0.16)} ${r2(cx - pw)} ${r2(cy - ph * 0.32)} ${r2(cx - pw)} ${r2(cy - ph * 0.12)} L${r2(cx - pw)} ${r2(cy + ph * 0.5)} C ${r2(cx - pw)} ${r2(cy + ph * 0.64)} ${r2(cx - pw * 0.5)} ${r2(cy + ph * 0.6)} ${r2(cx)} ${r2(cy + ph * 0.74)} Z" fill="${pageColor}"/>` +
    `<path d="M${r2(cx)} ${r2(cy)} C ${r2(cx + pw * 0.45)} ${r2(cy - ph * 0.16)} ${r2(cx + pw)} ${r2(cy - ph * 0.32)} ${r2(cx + pw)} ${r2(cy - ph * 0.12)} L${r2(cx + pw)} ${r2(cy + ph * 0.5)} C ${r2(cx + pw)} ${r2(cy + ph * 0.64)} ${r2(cx + pw * 0.5)} ${r2(cy + ph * 0.6)} ${r2(cx)} ${r2(cy + ph * 0.74)} Z" fill="${pageColor}" opacity="0.93"/>`;
  let lines = '';
  for (let i = 0; i < 7; i += 1) {
    const ly = cy + i * ph * 0.1;
    const len = i > 5 ? pw * 0.5 : pw * 0.78;
    lines +=
      `<line x1="${r2(cx - len - 12 * s)}" y1="${r2(ly + ph * 0.05)}" x2="${r2(cx - 24 * s)}" y2="${r2(ly)}" stroke="${lineColor}" stroke-opacity="0.32" stroke-width="${r2(5 * s)}" stroke-linecap="round"/>` +
      `<line x1="${r2(cx + 24 * s)}" y1="${r2(ly)}" x2="${r2(cx + len + 12 * s)}" y2="${r2(ly + ph * 0.05)}" stroke="${lineColor}" stroke-opacity="0.32" stroke-width="${r2(5 * s)}" stroke-linecap="round"/>`;
  }
  const spine = `<path d="M${r2(cx)} ${r2(cy)} L${r2(cx)} ${r2(cy + ph * 0.74)}" stroke="${lineColor}" stroke-opacity="0.45" stroke-width="${r2(6 * s)}"/>`;
  return `<g>${pages}${spine}${lines}</g>`;
}

/* Kameni luk mosta */
function stoneBridge(cx, baseY, s, color) {
  const w = 520 * s;
  const h = 190 * s;
  const left = cx - w / 2;
  const d =
    `M${r2(left)} ${r2(baseY)} L${r2(left)} ${r2(baseY - h * 0.6)} ` +
    `C ${r2(left + w * 0.14)} ${r2(baseY - h)} ${r2(cx - w * 0.16)} ${r2(baseY - h)} ${r2(cx - w * 0.1)} ${r2(baseY - h * 0.42)} ` +
    `C ${r2(cx - w * 0.06)} ${r2(baseY - h * 0.05)} ${r2(cx - w * 0.02)} ${r2(baseY - 4)} ${r2(cx + w * 0.02)} ${r2(baseY - 4)} ` +
    `C ${r2(cx + w * 0.06)} ${r2(baseY - 4)} ${r2(cx + w * 0.1)} ${r2(baseY - h * 0.05)} ${r2(cx + w * 0.14)} ${r2(baseY - h * 0.58)} ` +
    `C ${r2(cx + w * 0.22)} ${r2(baseY - h * 1.02)} ${r2(left + w * 0.96)} ${r2(baseY - h)} L${r2(left + w)} ${r2(baseY - h * 0.6)} L${r2(left + w)} ${r2(baseY)} Z`;
  let blocks = '';
  for (let i = 0; i < 5; i += 1) {
    blocks += `<rect x="${r2(left + w * (0.18 + i * 0.16))}" y="${r2(baseY - h * 0.88)}" width="${r2(w * 0.07)}" height="${r2(h * 0.13)}" rx="${r2(4 * s)}" fill="${C.paper3}" opacity="0.3"/>`;
  }
  return `<g><path d="${d}" fill="${color}"/>${blocks}</g>`;
}

/* Stog sijena */
function haystack(x, baseY, s, color1, color2) {
  const w = 120 * s;
  const h = 130 * s;
  const d = `M${r2(x - w / 2)} ${r2(baseY)} C ${r2(x - w / 2 - 12 * s)} ${r2(baseY - h * 0.5)} ${r2(x - w * 0.2)} ${r2(baseY - h * 0.92)} ${r2(x)} ${r2(baseY - h)} C ${r2(x + w * 0.2)} ${r2(baseY - h * 0.92)} ${r2(x + w / 2 + 12 * s)} ${r2(baseY - h * 0.5)} ${r2(x + w / 2)} ${r2(baseY)} Z`;
  let lines = '';
  for (let i = 1; i < 5; i += 1) {
    lines += `<path d="M${r2(x - w * 0.42)} ${r2(baseY - h * (i / 5.5))} Q ${r2(x)} ${r2(baseY - h * (i / 5.5) - 12 * s)} ${r2(x + w * 0.42)} ${r2(baseY - h * (i / 5.5))}" fill="none" stroke="${color2}" stroke-opacity="0.4" stroke-width="${r2(4 * s)}"/>`;
  }
  return `<g><path d="${d}" fill="${color1}"/>${lines}</g>`;
}

/* Okvir "ovdje ide fotografija" */
function emptyFrame(x, y, w, h, color, opacity) {
  const o = opacity == null ? 0.45 : opacity;
  return (
    `<g opacity="${o}">` +
    `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="12" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="16 12"/>` +
    `<path d="M${r2(x + w * 0.28)} ${r2(y + h * 0.66)} L${r2(x + w * 0.45)} ${r2(y + h * 0.42)} L${r2(x + w * 0.58)} ${r2(y + h * 0.58)} L${r2(x + w * 0.72)} ${r2(y + h * 0.34)}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<circle cx="${r2(x + w * 0.34)}" cy="${r2(y + h * 0.3)}" r="${r2(h * 0.04)}" fill="${color}"/></g>`
  );
}

/* Topli odsjaj lampe / svijeće */
function lampGlow(cx, cy, color, strength) {
  const k = strength == null ? 1 : strength;
  return `<g><circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(320 * k)}" fill="${color}" opacity="0.16" filter="url(#soft)"/><circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(150 * k)}" fill="${color}" opacity="0.22" filter="url(#soft)"/></g>`;
}

/* Moderni gradski blok */
function cityBlock(x, baseY, w, h, color, winColor, rng) {
  let wins = '';
  const cols = Math.max(2, Math.round(w / 46));
  const rows = Math.max(3, Math.round(h / 62));
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      if (rng() > 0.55) continue;
      wins += `<rect x="${r2(x + 14 + i * ((w - 28) / cols))}" y="${r2(baseY - h + 18 + j * ((h - 30) / rows))}" width="${r2(((w - 28) / cols) * 0.56)}" height="${r2(((h - 30) / rows) * 0.42)}" fill="${winColor}" opacity="${r2(range(rng, 0.35, 0.95))}"/>`;
    }
  }
  return `<g><rect x="${r2(x)}" y="${r2(baseY - h)}" width="${r2(w)}" height="${r2(h)}" fill="${color}"/>${wins}</g>`;
}

/* ---------------------------------------------------------------------------
   SASTAVLJANJE SVG DOKUMENTA
   Zajednički defs (soft blur, grain, vinjeta, svjetlo prozora) + tijelo scene.
   --------------------------------------------------------------------------- */
function doc(spec) {
  const w = spec.w;
  const h = spec.h;
  const defs = [
    blurFilter('soft', 30),
    blurFilter('softShadow', 12),
    grainFilter('grain'),
    radialGradient('vig', [
      ['0', '#000000', 0],
      ['0.55', '#000000', 0],
      ['1', '#000000', 0.45]
    ]),
    linearGradient('light', [
      ['0', '#ffe9c2', 0.95],
      ['1', '#e6b072', 0.55]
    ]),
    spec.defs || ''
  ].join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">\n` +
    '<defs>\n' + defs + '\n</defs>\n' +
    (spec.bg || '') + '\n' +
    (spec.body || '') + '\n' +
    grain(w, h, 'grain', spec.grain || 0.09) + '\n' +
    vignette(w, h, 'vig') + '\n' +
    '</svg>\n'
  );
}

/* Registar scena */
const SCENES = [];
function scene(name, w, h, fn) {
  SCENES.push({ name: name, w: w, h: h, fn: fn });
}

/* Minaret (silueta) — koristi se u panorami sela */
function minaret(x, baseY, s, color, dome) {
  const w = 26 * s;
  const hh = 240 * s;
  return (
    `<g><rect x="${r2(x - w / 2)}" y="${r2(baseY - hh)}" width="${r2(w)}" height="${r2(hh)}" fill="${color}"/>` +
    `<rect x="${r2(x - w * 1.3)}" y="${r2(baseY - hh * 0.72)}" width="${r2(w * 2.6)}" height="${r2(7 * s)}" fill="${color}"/>` +
    `<path d="M${r2(x - w * 1.1)} ${r2(baseY - hh)} C ${r2(x - w * 1.15)} ${r2(baseY - hh - 40 * s)} ${r2(x + w * 1.15)} ${r2(baseY - hh - 40 * s)} ${r2(x + w * 1.1)} ${r2(baseY - hh)} Z" fill="${dome || color}"/>` +
    `<line x1="${r2(x)}" y1="${r2(baseY - hh - 40 * s)}" x2="${r2(x)}" y2="${r2(baseY - hh - 78 * s)}" stroke="${color}" stroke-width="${r2(5 * s)}"/></g>`
  );
}

/* =========================== 1. HERO — JESEN ============================== */
scene('hero-jesen', 1600, 1000, function () {
  const rng = makeRng(11);
  const defs =
    linearGradient('sky', [[0, C.skyHi], [0.34, C.skyMid], [0.64, C.skyLow], [1, C.skyDark]]) +
    radialGradient('sunGlow', [[0, '#ffd79a', 0.85], [0.45, '#e8a45e', 0.3], [1, '#e8a45e', 0]]);
  let body = '';
  body += '<circle cx="1080" cy="590" r="230" fill="url(#sunGlow)"/>';
  body += '<circle cx="1080" cy="590" r="84" fill="#f9e0b6" opacity="0.95"/>';
  body += '<circle cx="1080" cy="590" r="84" fill="#ffcf94" opacity="0.6" filter="url(#soft)"/>';
  body += '<g opacity="0.4" filter="url(#soft)"><ellipse cx="470" cy="700" rx="640" ry="42" fill="#f7e0bb"/><ellipse cx="1260" cy="724" rx="520" ry="34" fill="#f7e0bb"/></g>';
  body += `<path d="${ridge(1600, 1000, 650, 130, rng, 150)}" fill="#7c5340" opacity="0.55"/>`;
  body += `<path d="${ridge(1600, 1000, 740, 115, rng, 130)}" fill="#5b3b2c" opacity="0.85"/>`;
  body += '<g opacity="0.3" filter="url(#soft)"><ellipse cx="900" cy="790" rx="700" ry="30" fill="#f2d6ad"/></g>';
  body += `<path d="${ridge(1600, 1000, 830, 95, rng, 115)}" fill="#3c2a20"/>`;
  body += '<path d="M0 890 C 380 872 720 906 1040 894 C 1320 884 1480 902 1600 890 L1600 1000 L0 1000 Z" fill="#241a13"/>';
  const autumn = ['#c2833a', '#a1502c', '#8a5b41', '#96601f', '#5a3a48', '#c9a25a'];
  for (let x = 40; x < 1620; x += range(rng, 68, 128)) {
    body += tree(x, 902, range(rng, 0.85, 1.7), rng, autumn, '#2a1c14');
  }
  body += bird(250, 270, 17, '#f6e6cc', 0.5) + bird(340, 232, 13, '#f6e6cc', 0.42) + bird(176, 330, 10, '#f6e6cc', 0.32);
  for (let i = 0; i < 14; i += 1) {
    body += leaf(range(rng, 60, 1540), range(rng, 120, 860), range(rng, 12, 26), range(rng, 0, 360), pick(rng, autumn), r2(range(rng, 0.35, 0.8)));
  }
  return {
    defs: defs,
    bg: '<rect width="1600" height="1000" fill="url(#sky)"/>',
    body: body
  };
});

/* ======================= 2. PANORAMA SELA (BOSNA) ======================== */
scene('panorama-sela', 1600, 1000, function () {
  const rng = makeRng(23);
  const defs =
    linearGradient('sky2', [[0, '#eef1e5'], [0.45, '#eee3c9'], [1, '#dcc9a2']]) +
    linearGradient('river', [[0, '#9db6ab'], [1, '#6f8d86']]) +
    radialGradient('sun2', [[0, '#fff2d0', 0.9], [1, '#fff2d0', 0]]);
  let body = '';
  body += '<circle cx="1290" cy="190" r="200" fill="url(#sun2)"/>';
  body += '<circle cx="1290" cy="190" r="56" fill="#fdf0cf" opacity="0.85"/>';
  body += `<path d="${ridge(1600, 1000, 520, 110, rng, 170)}" fill="#a9a17f" opacity="0.6"/>`;
  body += `<path d="${ridge(1600, 1000, 610, 95, rng, 140)}" fill="#7d8a63" opacity="0.9"/>`;
  body += '<path d="M0 700 C 300 690 620 716 900 706 C 1200 696 1420 714 1600 702 L1600 1000 L0 1000 Z" fill="#b9a678"/>';
  body += '<path d="M0 800 C 320 780 640 812 980 796 C 1260 784 1440 806 1600 794 L1600 1000 L0 1000 Z" fill="#cdbb90"/>';
  body += `<path d="M0 884 C 300 848 520 918 820 886 C 1120 856 1360 916 1600 878 L1600 1000 L0 1000 Z" fill="url(#river)"/>`;
  const autumn = ['#a1502c', '#96601f', '#7d8a63', '#c2833a'];
  const houses = [[300, 706, 0.26], [470, 714, 0.3], [650, 704, 0.24], [930, 708, 0.3], [1120, 716, 0.25], [1310, 706, 0.28]];
  houses.forEach((h, i) => {
    body += bosnianHouse(h[0], h[1], h[2], {
      wall: i % 2 ? '#f3ead6' : '#e9dfcd',
      roof: i % 3 === 0 ? '#6b4a34' : '#4a3527',
      windows: '#c2833a',
      smoke: i % 2 === 0
    });
  });
  body += minaret(800, 700, 0.85, '#e9dfcd', '#4a3527');
  body += fence(200, 660, 742, 0.8, '#6b5334');
  body += haystack(1420, 792, 0.8, '#d8bf8b', '#8a6b38');
  body += haystack(1500, 796, 0.6, '#d3b884', '#8a6b38');
  for (let i = 0; i < 7; i += 1) {
    body += tree(range(rng, 60, 1560), range(rng, 760, 830), range(rng, 0.7, 1.25), rng, autumn, '#4a3527');
  }
  body += bird(420, 250, 15, '#6b5b45', 0.45) + bird(500, 216, 12, '#6b5b45', 0.38) + bird(604, 262, 10, '#6b5b45', 0.3);
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#sky2)"/>', body: body };
});


/* ======================= 3. STARA BOSANSKA KUĆA ========================== */
scene('stara-kuca', 1600, 1000, function () {
  const rng = makeRng(37);
  const defs =
    linearGradient('day', [[0, '#f7f1e6'], [0.5, '#eae0c9'], [1, '#d9c9a6']]) +
    radialGradient('daySun', [[0, '#fff6dd', 0.85], [1, '#fff6dd', 0]]);
  let body = '';
  body += '<circle cx="300" cy="180" r="280" fill="url(#daySun)"/>';
  body += '<path d="M0 640 C 320 608 640 664 980 636 C 1260 612 1440 650 1600 630 L1600 1000 L0 1000 Z" fill="#c3b184"/>';
  body += '<path d="M0 760 C 300 736 640 782 1000 758 C 1280 740 1440 772 1600 754 L1600 1000 L0 1000 Z" fill="#b09d6f"/>';
  body += bosnianHouse(600, 800, 1.25, { wall: '#f3ead6', roof: '#4a3527', windows: '#c2833a', smoke: true });
  body += bosnianHouse(1180, 782, 0.85, { wall: '#e9dfcd', roof: '#6b4a34', windows: '#a1502c', smoke: false });
  body += fence(200, 940, 868, 1, '#6b5334');
  body += '<path d="M0 892 C 300 872 620 908 960 890 C 1260 874 1420 900 1600 884 L1600 1000 L0 1000 Z" fill="#8a7a52"/>';
  body += '<path d="M640 866 C 700 900 720 940 700 1000 L860 1000 C 820 930 780 892 740 862 Z" fill="#cbb489" opacity="0.75"/>';
  body += tree(230, 900, 1.9, rng, ['#a1502c', '#96601f', '#c2833a'], '#4a3527');
  body += tree(1450, 888, 1.4, rng, ['#96601f', '#a1502c', '#7d8a63'], '#4a3527');
  body += tree(880, 880, 0.8, rng, ['#c9a25a', '#a1502c'], '#4a3527');
  body += bird(760, 220, 16, '#6b5b45', 0.4) + bird(860, 186, 12, '#6b5b45', 0.32);
  for (let i = 0; i < 9; i += 1) {
    body += leaf(range(rng, 80, 1520), range(rng, 140, 800), range(rng, 12, 24), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#96601f']), r2(range(rng, 0.3, 0.7)));
  }
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#day)"/>', body: body };
});

/* ==================== 4. KNJIGA / ČITAONICA UZ LAMPU ==================== */
scene('knjiga', 1600, 1000, function () {
  const rng = makeRng(53);
  const defs =
    linearGradient('night', [[0, '#241a12'], [0.55, '#191110'], [1, '#0f0a08']]) +
    radialGradient('lamp', [[0, '#ffdca8', 0.5], [0.5, '#c2833a', 0.16], [1, '#c2833a', 0]]);
  let body = '';
  body += '<circle cx="1180" cy="230" r="620" fill="url(#lamp)"/>';
  body += lampGlow(1180, 250, '#ffd7a0', 0.9);
  body += '<ellipse cx="800" cy="880" rx="720" ry="70" fill="#000000" opacity="0.35" filter="url(#soft)"/>';
  body += '<g opacity="0.95"><rect x="150" y="742" width="290" height="34" rx="8" fill="#7c3a22"/><rect x="166" y="712" width="266" height="32" rx="8" fill="#556141"/><rect x="150" y="684" width="300" height="30" rx="8" fill="#3a2531"/><rect x="178" y="656" width="240" height="30" rx="8" fill="#96601f"/></g>';
  body += openBook(800, 640, 1.35, '#f6ecdc', '#3a2c20');
  body += '<g stroke="#c9a25a" stroke-width="7" fill="none" opacity="0.9" transform="translate(1180 730)"><circle cx="0" cy="0" r="42"/><circle cx="112" cy="0" r="42"/><path d="M42 0 L70 0"/><path d="M-42 -6 L-110 -34"/></g>';
  body += '<g opacity="0.95"><rect x="1320" y="654" width="118" height="96" rx="16" fill="#e9dfcd"/><rect x="1332" y="666" width="94" height="20" rx="10" fill="#6b4a34"/><path d="M1438 682 C 1490 686 1490 742 1436 744" fill="none" stroke="#e9dfcd" stroke-width="16"/><ellipse cx="1379" cy="652" rx="52" ry="12" fill="#4a3527"/></g>';
  body += '<g transform="rotate(-26 1330 840)"><rect x="1100" y="834" width="230" height="9" rx="4" fill="#e9dfcd" opacity="0.85"/><path d="M1330 839 L1392 806 L1398 844 Z" fill="#c9a25a" opacity="0.85"/></g>';
  for (let i = 0; i < 10; i += 1) {
    body += leaf(range(rng, 120, 1500), range(rng, 120, 900), range(rng, 14, 30), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#96601f', '#5a3a48']), r2(range(rng, 0.2, 0.55)));
  }
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#night)"/>', body: body };
});

/* ===================== 5. MAJKA (PORTRETNA SCENA) ====================== */
scene('majka', 1200, 1500, function () {
  const rng = makeRng(71);
  const defs =
    linearGradient('room', [[0, '#3a2531'], [0.55, '#221820'], [1, '#140e0c']]) +
    radialGradient('warmPool', [[0, '#d9a25a', 0.32], [1, '#d9a25a', 0]]);
  let body = '';
  body += windowLight(96, 250, 320, 600, 0);
  body += '<g opacity="0.5" filter="url(#soft)"><path d="M96 850 L416 850 L640 1500 L40 1500 Z" fill="#f0c78f"/></g>';
  body += '<circle cx="700" cy="1080" r="620" fill="url(#warmPool)"/>';
  body += '<rect x="0" y="1250" width="1200" height="250" fill="#160f0a"/>';
  // rim light iza figure
  body += '<g opacity="0.55" filter="url(#soft)">' + womanFigure(688, 1246, 900, '#c2833a', { scarf: '#8a5b41' }) + '</g>';
  body += womanFigure(664, 1246, 900, '#120c09', { scarf: '#2a2018' });
  // dijete u naručju
  body += '<g><circle cx="600" cy="900" r="52" fill="#2a2018"/><path d="M540 1246 C 520 1080 560 964 604 950 C 656 934 700 1050 706 1246 Z" fill="#2a2018"/></g>';
  // sto sa činijom
  body += '<g><rect x="760" y="1180" width="440" height="26" rx="8" fill="#3a2c20"/><rect x="820" y="1206" width="22" height="140" fill="#2a2018"/><rect x="1120" y="1206" width="22" height="140" fill="#2a2018"/><ellipse cx="980" cy="1170" rx="98" ry="26" fill="#e9dfcd" opacity="0.9"/><path d="M882 1170 C 898 1122 1062 1122 1078 1170 Z" fill="#c9a25a" opacity="0.35"/></g>';
  for (let i = 0; i < 7; i += 1) {
    body += leaf(range(rng, 60, 1140), range(rng, 180, 1120), range(rng, 14, 30), range(rng, 0, 360), pick(rng, ['#c2833a', '#96601f', '#a1502c']), r2(range(rng, 0.2, 0.5)));
  }
  return { defs: defs, bg: '<rect width="1200" height="1500" fill="url(#room)"/>', body: body };
});

/* =========================== 6. ŽENA (PORTRET) ========================== */
scene('zena', 1200, 1500, function () {
  const rng = makeRng(89);
  const defs =
    linearGradient('room2', [[0, '#5a3a48'], [0.5, '#3a2531'], [1, '#170f12']]) +
    radialGradient('coolPool', [[0, '#d7dee3', 0.24], [1, '#d7dee3', 0]]);
  let body = '';
  body += windowLight(772, 210, 330, 560, 0);
  body += '<g opacity="0.45" filter="url(#soft)"><path d="M772 770 L1102 770 L1200 1500 L680 1500 Z" fill="#e7d9c4"/></g>';
  body += '<circle cx="520" cy="1000" r="600" fill="url(#coolPool)"/>';
  body += '<rect x="0" y="1270" width="1200" height="230" fill="#150e10"/>';
  // kosa
  body += '<ellipse cx="512" cy="628" rx="96" ry="112" fill="#1d1216"/>';
  body += '<g opacity="0.5" filter="url(#soft)">' + womanFigure(556, 1264, 910, '#d9a25a', {}) + '</g>';
  body += womanFigure(532, 1264, 910, '#150e10', {});
  // knjiga u rukama
  body += '<g transform="rotate(-8 540 1010)"><rect x="404" y="968" width="270" height="150" rx="10" fill="#f6ecdc"/><rect x="534" y="968" width="10" height="150" fill="#c2833a" opacity="0.6"/><line x1="430" y1="1008" x2="514" y2="1008" stroke="#3a2c20" stroke-opacity="0.35" stroke-width="7"/><line x1="430" y1="1046" x2="514" y2="1046" stroke="#3a2c20" stroke-opacity="0.35" stroke-width="7"/><line x1="566" y1="1008" x2="650" y2="1008" stroke="#3a2c20" stroke-opacity="0.35" stroke-width="7"/><line x1="566" y1="1046" x2="618" y2="1046" stroke="#3a2c20" stroke-opacity="0.35" stroke-width="7"/></g>';
  // stolica
  body += '<g opacity="0.85"><rect x="700" y="1140" width="300" height="24" rx="8" fill="#3a2c20"/><rect x="722" y="1164" width="20" height="150" fill="#2a2018"/><rect x="958" y="1164" width="20" height="150" fill="#2a2018"/><rect x="700" y="1000" width="24" height="150" fill="#3a2c20"/></g>';
  for (let i = 0; i < 8; i += 1) {
    body += leaf(range(rng, 60, 1140), range(rng, 160, 1160), range(rng, 14, 32), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#c9a25a']), r2(range(rng, 0.2, 0.5)));
  }
  return { defs: defs, bg: '<rect width="1200" height="1500" fill="url(#room2)"/>', body: body };
});

/* ===================== 7. PORODICA (UNUTRAŠNJOST) ====================== */
scene('porodica', 1600, 1000, function () {
  const rng = makeRng(101);
  const defs =
    linearGradient('home', [[0, '#3a2c20'], [0.55, '#241a12'], [1, '#120c09']]) +
    radialGradient('hearth', [[0, '#ffd9a3', 0.3], [1, '#ffd9a3', 0]]);
  let body = '';
  body += windowLight(600, 110, 470, 660, 0);
  body += '<g opacity="0.45" filter="url(#soft)"><path d="M600 770 L1070 770 L1220 1000 L440 1000 Z" fill="#f3d3a0"/></g>';
  body += '<circle cx="820" cy="760" r="620" fill="url(#hearth)"/>';
  body += '<rect x="0" y="866" width="1600" height="134" fill="#160f0a"/>';
  body += '<g opacity="0.4" filter="url(#soft)">' + figure(548, 872, 470, '#c2833a', 1) + '</g>';
  body += figure(536, 872, 470, '#100b08', 1);
  body += '<g opacity="0.4" filter="url(#soft)">' + womanFigure(952, 872, 452, '#c2833a', { scarf: '#8a5b41' }) + '</g>';
  body += womanFigure(940, 872, 452, '#100b08', { scarf: '#241a12' });
  body += figure(700, 872, 268, '#100b08', 1);
  body += womanFigure(1092, 872, 236, '#100b08', {});
  body += '<g opacity="0.9"><rect x="1140" y="820" width="420" height="28" rx="8" fill="#3a2c20"/><rect x="1196" y="848" width="22" height="130" fill="#2a2018"/><rect x="1476" y="848" width="22" height="130" fill="#2a2018"/><ellipse cx="1348" cy="812" rx="92" ry="24" fill="#e9dfcd" opacity="0.85"/></g>';
  body += lampGlow(1348, 772, '#ffd7a0', 0.7);
  for (let i = 0; i < 6; i += 1) {
    body += leaf(range(rng, 60, 1540), range(rng, 120, 900), range(rng, 14, 28), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#96601f']), r2(range(rng, 0.15, 0.4)));
  }
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#home)"/>', body: body };
});

/* ===================== 8. NEKAD — STARIJE VRIJEME ====================== */
scene('nekad', 1400, 1000, function () {
  const rng = makeRng(131);
  const defs =
    linearGradient('sepia', [[0, C.sepiaHi], [0.42, C.sepiaMid], [1, C.sepiaLow]]) +
    radialGradient('sepiaSun', [[0, '#f7e6c0', 0.7], [1, '#f7e6c0', 0]]);
  let body = '';
  body += '<circle cx="1120" cy="200" r="300" fill="url(#sepiaSun)"/>';
  body += `<path d="${ridge(1400, 1000, 540, 95, rng, 160)}" fill="#8a6b3f" opacity="0.5"/>`;
  body += `<path d="${ridge(1400, 1000, 640, 80, rng, 130)}" fill="#6c4f2e" opacity="0.65"/>`;
  body += '<path d="M0 730 C 280 712 620 752 900 732 C 1140 716 1280 742 1400 726 L1400 1000 L0 1000 Z" fill="#a98552"/>';
  body += bosnianHouse(500, 800, 1.05, { wall: '#e4cfa6', roof: '#3c2c19', windows: '#8a6b3f', smoke: true });
  body += bosnianHouse(1080, 786, 0.72, { wall: '#dcc49a', roof: '#4a3524', windows: '#8a6b3f', smoke: false });
  body += '<path d="M0 880 C 320 862 640 896 980 878 C 1200 866 1320 886 1400 874 L1400 1000 L0 1000 Z" fill="#6c4f2e"/>';
  // konop za rublje
  body += '<g stroke="#4a3a22" stroke-width="4"><path d="M300 620 C 500 668 760 664 980 612" fill="none"/><path d="M300 620 L300 700"/><path d="M980 612 L980 700"/></g>';
  body += '<g fill="#e4cfa6" opacity="0.9"><rect x="392" y="640" width="74" height="96" rx="6"/><rect x="596" y="654" width="86" height="70" rx="6"/><path d="M740 648 L806 648 L806 700 L740 700 Z"/><path d="M500 636 L560 636 L530 700 Z"/></g>';
  body += fence(180, 1000, 890, 1, '#4a3524');
  // kola / točak
  body += '<g stroke="#3c2c19" stroke-width="7" fill="none"><circle cx="1240" cy="906" r="62"/><circle cx="1240" cy="906" r="10" fill="#3c2c19"/><path d="M1240 844 L1240 968"/><path d="M1178 906 L1302 906"/><path d="M1196 862 L1284 950"/><path d="M1284 862 L1196 950"/></g>';
  body += haystack(760, 900, 0.7, '#c9a86e', '#6c4f2e');
  body += haystack(880, 904, 0.5, '#c2a069', '#6c4f2e');
  body += tree(120, 890, 1.6, rng, ['#6c4f2e', '#8a6b3f', '#a98552'], '#3c2c19');
  body += tree(1340, 886, 1.1, rng, ['#8a6b3f', '#6c4f2e'], '#3c2c19');
  body += bird(360, 200, 15, '#6c4f2e', 0.4) + bird(450, 168, 11, '#6c4f2e', 0.3);
  return { defs: defs, bg: '<rect width="1400" height="1000" fill="url(#sepia)"/>', body: body, grain: 0.16 };
});

/* ===================== 9. DANAS — SAVREMENO VRIJEME ===================== */
scene('danas', 1400, 1000, function () {
  const rng = makeRng(157);
  const defs =
    linearGradient('coolSky', [[0, '#dbe4e9'], [0.45, '#a9b6bf'], [1, '#5b6873']]) +
    linearGradient('asphalt', [[0, '#4a545e'], [1, '#2b323a']]);
  let body = '';
  body += cityBlock(60, 780, 150, 300, '#5f6c76', '#ffd9a0', rng);
  body += cityBlock(240, 780, 190, 430, '#4f5b65', '#ffd9a0', rng);
  body += cityBlock(470, 780, 130, 250, '#6b7883', '#ffd9a0', rng);
  body += cityBlock(880, 780, 210, 500, '#414c56', '#ffd9a0', rng);
  body += cityBlock(1130, 780, 170, 340, '#5a6672', '#ffd9a0', rng);
  // staklena kula
  body += '<g><rect x="640" y="180" width="190" height="600" fill="#3f4b56"/><g fill="#cfe0e8" opacity="0.35">';
  for (let i = 0; i < 12; i += 1) {
    body += `<rect x="${r2(652 + (i % 3) * 60)}" y="${r2(200 + Math.floor(i / 3) * 145)}" width="44" height="128" rx="4"/>`;
  }
  body += '</g><rect x="640" y="180" width="190" height="600" fill="none" stroke="#2b323a" stroke-width="6"/></g>';
  body += '<rect x="0" y="780" width="1400" height="220" fill="url(#asphalt)"/>';
  body += '<g stroke="#e6d7b4" stroke-width="7" opacity="0.6" stroke-linecap="round">';
  for (let x = 40; x < 1400; x += 150) {
    body += `<line x1="${x}" y1="900" x2="${x + 76}" y2="900"/>`;
  }
  body += '</g>';
  body += '<g stroke="#c9d6dd" stroke-width="6" opacity="0.5"><path d="M0 962 L1400 962"/></g>';
  // ulična svjetiljka
  body += '<g><rect x="1276" y="560" width="12" height="226" fill="#2b323a"/><path d="M1282 560 C 1282 520 1330 516 1344 548" fill="none" stroke="#2b323a" stroke-width="12"/><ellipse cx="1350" cy="556" rx="34" ry="12" fill="#ffd9a0"/></g>';
  body += lampGlow(1350, 570, '#ffd9a0', 0.55);
  body += tree(146, 786, 1.1, rng, ['#c2833a', '#96601f'], '#3a2c20');
  body += tree(1246, 792, 0.9, rng, ['#a1502c', '#c2833a'], '#3a2c20');
  body += bird(300, 220, 14, '#5b6873', 0.4) + bird(390, 190, 11, '#5b6873', 0.3);
  for (let i = 0; i < 7; i += 1) {
    body += leaf(range(rng, 60, 1340), range(rng, 200, 780), range(rng, 12, 24), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c']), r2(range(rng, 0.15, 0.4)));
  }
  return { defs: defs, bg: '<rect width="1400" height="1000" fill="url(#coolSky)"/>', body: body };
});

/* ==================== 10. MOST I RIJEKA (KRAJOLIK) ==================== */
scene('most-rijeka', 1600, 1000, function () {
  const rng = makeRng(173);
  const defs =
    linearGradient('autumnSky', [[0, '#f0dcb4'], [0.5, '#dbb887'], [1, '#9c7350']]) +
    linearGradient('water', [[0, '#8fa89e'], [1, '#4f6b66']]);
  let body = '';
  body += '<circle cx="300" cy="200" r="240" fill="#fff0cf" opacity="0.5" filter="url(#soft)"/>';
  body += `<path d="${ridge(1600, 1000, 430, 90, rng, 170)}" fill="#9c7350" opacity="0.5"/>`;
  body += `<path d="${ridge(1600, 1000, 520, 85, rng, 140)}" fill="#7b5540" opacity="0.75"/>`;
  body += '<path d="M0 600 C 320 574 660 620 1000 592 C 1280 570 1440 600 1600 578 L1600 1000 L0 1000 Z" fill="#4c5a45"/>';
  body += '<rect x="0" y="782" width="1600" height="218" fill="url(#water)"/>';
  body += '<g opacity="0.55" stroke="#e7efe6" stroke-width="5" stroke-linecap="round"><path d="M60 840 L 460 838"/><path d="M700 884 L 1160 880"/><path d="M240 926 L 620 924"/><path d="M980 950 L 1440 946"/></g>';
  body += '<g transform="translate(0 1564) scale(1 -1)" opacity="0.3" filter="url(#soft)">' + stoneBridge(800, 782, 1.15, '#c9bda2') + '</g>';
  body += stoneBridge(800, 782, 1.15, '#d6cbb0');
  body += '<path d="M160 782 C 200 760 260 764 300 782" fill="#4c5a45"/>';
  body += '<path d="M1300 782 C 1350 756 1420 762 1470 782" fill="#4c5a45"/>';
  body += tree(150, 790, 1.35, rng, ['#c2833a', '#a1502c', '#96601f'], '#3a2c20');
  body += tree(430, 782, 0.9, rng, ['#96601f', '#7b5540'], '#3a2c20');
  body += tree(1210, 788, 1.2, rng, ['#a1502c', '#c2833a'], '#3a2c20');
  body += tree(1470, 786, 1.5, rng, ['#c2833a', '#96601f'], '#3a2c20');
  body += bird(880, 210, 15, '#6b4f3a', 0.4) + bird(980, 178, 11, '#6b4f3a', 0.3);
  for (let i = 0; i < 9; i += 1) {
    body += leaf(range(rng, 60, 1540), range(rng, 120, 900), range(rng, 14, 28), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#c9a25a']), r2(range(rng, 0.2, 0.5)));
  }
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#autumnSky)"/>', body: body };
});

/* ======================== 11. POLJE / RAD U NJIVI ======================= */
scene('polje', 1600, 1000, function () {
  const rng = makeRng(191);
  const defs =
    linearGradient('fieldSky', [[0, '#eef1e5'], [0.5, '#e7dcc0'], [1, '#d6c49c']]) +
    linearGradient('soil', [[0, '#c2a875'], [0.55, '#a98e5d'], [1, '#8a7048']]);
  let body = '';
  body += '<circle cx="1180" cy="170" r="230" fill="#fff3d4" opacity="0.6" filter="url(#soft)"/>';
  body += `<path d="${ridge(1600, 1000, 400, 90, rng, 180)}" fill="#a9a17f" opacity="0.55"/>`;
  body += `<path d="${ridge(1600, 1000, 470, 70, rng, 150)}" fill="#83906a" opacity="0.8"/>`;
  body += '<rect x="0" y="500" width="1600" height="500" fill="url(#soil)"/>';
  body += '<g stroke="#7a6440" stroke-width="5" opacity="0.5" stroke-linecap="round">';
  for (let i = 0; i < 17; i += 1) {
    const x = 800 + (i - 8) * 30;
    body += `<path d="M${x} 500 L${r2(800 + (i - 8) * 190)} 1000"/>`;
  }
  body += '</g>';
  body += '<g stroke="#d8c193" stroke-width="3" opacity="0.35">';
  for (let y = 560; y < 1000; y += 70) {
    body += `<path d="M0 ${y} L1600 ${r2(y + 14)}"/>`;
  }
  body += '</g>';
  body += haystack(300, 830, 1, '#d8bf8b', '#8a6b38');
  body += haystack(520, 812, 0.78, '#d1b784', '#8a6b38');
  body += haystack(1310, 858, 1.1, '#dcc38e', '#8a6b38');
  body += '<g stroke="#5a4326" stroke-width="9" stroke-linecap="round"><line x1="1000" y1="700" x2="1052" y2="880"/></g>';
  body += womanFigure(1010, 880, 540, '#3a2c20', { scarf: '#5a3a48' });
  body += '<path d="M1052 880 L1076 806 L1104 800 Z" fill="#5a4326"/>';
  body += tree(100, 760, 1.5, rng, ['#a1502c', '#96601f', '#c2833a'], '#4a3527');
  body += tree(1520, 740, 1.3, rng, ['#96601f', '#c2833a'], '#4a3527');
  body += bird(420, 190, 15, '#6b5b45', 0.4) + bird(520, 158, 11, '#6b5b45', 0.3);
  for (let i = 0; i < 10; i += 1) {
    body += leaf(range(rng, 60, 1540), range(rng, 120, 900), range(rng, 14, 28), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#c9a25a']), r2(range(rng, 0.2, 0.5)));
  }
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#fieldSky)"/>', body: body };
});

/* ==================== 12. STARA KUHINJA / OGNJIŠTE ==================== */
scene('kuhinja', 1400, 1000, function () {
  const rng = makeRng(211);
  const defs =
    linearGradient('kuh', [[0, '#2f2318'], [0.5, '#1f1710'], [1, '#120c09']]) +
    radialGradient('fire', [[0, '#ffbe6a', 0.9], [0.4, '#d9662c', 0.45], [1, '#d9662c', 0]]);
  let body = '';
  body += '<rect x="0" y="780" width="1400" height="220" fill="#170f0a"/>';
  // ognjište (luk)
  body += '<path d="M420 800 L420 520 C 420 400 700 400 700 520 L700 800 Z" fill="#0e0a07"/>';
  body += '<path d="M400 800 L400 510 C 400 372 720 372 720 510 L720 800 L760 800 L760 500 C 760 330 360 330 360 500 L360 800 Z" fill="#3a2c20"/>';
  body += '<circle cx="560" cy="700" r="320" fill="url(#fire)"/>';
  body += '<g filter="url(#soft)"><path d="M470 790 C 480 700 520 660 560 640 C 600 660 640 700 652 790 Z" fill="#ff9d3d"/></g>';
  body += '<path d="M498 790 C 506 720 536 692 560 676 C 586 694 614 722 622 790 Z" fill="#ffd08a" opacity="0.9"/>';
  body += '<g><ellipse cx="560" cy="690" rx="96" ry="26" fill="#1b1410"/><path d="M464 690 C 464 606 656 606 656 690 Z" fill="#4a3527"/><path d="M654 660 C 706 662 706 714 656 716" fill="none" stroke="#4a3527" stroke-width="16"/><ellipse cx="560" cy="606" rx="70" ry="16" fill="#5a4326"/></g>';
  // police s posuđem
  body += '<g><rect x="880" y="430" width="440" height="14" fill="#4a3527"/><rect x="880" y="640" width="440" height="14" fill="#4a3527"/>';
  for (let i = 0; i < 4; i += 1) {
    body += `<ellipse cx="${r2(950 + i * 100)}" cy="416" rx="38" ry="14" fill="#e9dfcd" opacity="0.9"/><circle cx="${r2(950 + i * 100)}" cy="400" r="14" fill="#c9a25a" opacity="0.7"/>`;
  }
  body += '<path d="M900 640 L900 566 C 900 540 986 540 986 566 L986 640 Z" fill="#7c3a22" opacity="0.95"/><ellipse cx="943" cy="566" rx="43" ry="14" fill="#3a2c20"/>';
  body += '<g fill="#a1502c" opacity="0.9"><circle cx="1060" cy="612" r="20"/><circle cx="1092" cy="618" r="17"/><circle cx="1122" cy="612" r="19"/></g>';
  body += '<path d="M1040 596 C 1060 570 1104 570 1130 596" fill="none" stroke="#5a4326" stroke-width="5"/></g>';
  // prozor
  body += windowLight(110, 180, 190, 300, 0);
  body += '<g opacity="0.3" filter="url(#soft)"><path d="M110 480 L300 480 L360 800 L60 800 Z" fill="#e7c894"/></g>';
  // žena uz ognjište
  body += '<g opacity="0.45" filter="url(#soft)">' + womanFigure(330, 800, 520, '#c2833a', { scarf: '#8a5b41' }) + '</g>';
  body += womanFigure(316, 800, 520, '#0f0a07', { scarf: '#241a12' });
  for (let i = 0; i < 8; i += 1) {
    body += leaf(range(rng, 40, 1360), range(rng, 120, 780), range(rng, 12, 24), range(rng, 0, 360), pick(rng, ['#c2833a', '#96601f']), r2(range(rng, 0.15, 0.4)));
  }
  return { defs: defs, bg: '<rect width="1400" height="1000" fill="url(#kuh)"/>', body: body, grain: 0.12 };
});

/* ===================== 13. RADNI STO / MATERIJALI ===================== */
scene('radni-sto', 1600, 1000, function () {
  const rng = makeRng(233);
  const defs =
    linearGradient('study', [[0, '#2a1f16'], [0.55, '#1c1410'], [1, '#0f0a08']]) +
    radialGradient('cone', [[0, '#ffe3b4', 0.5], [1, '#ffe3b4', 0]]);
  let body = '';
  body += '<circle cx="640" cy="300" r="560" fill="url(#cone)"/>';
  body += '<ellipse cx="800" cy="640" rx="620" ry="150" fill="#ffe3b4" opacity="0.07" filter="url(#soft)"/>';
  // svjetiljka
  body += '<g><rect x="624" y="60" width="14" height="150" fill="#3a2c20"/><path d="M560 240 L700 240 L672 190 L588 190 Z" fill="#4a3527"/><ellipse cx="630" cy="240" rx="70" ry="14" fill="#ffd9a0"/></g>';
  body += lampGlow(630, 250, '#ffd9a0', 0.85);
  // stol
  body += '<rect x="0" y="646" width="1600" height="354" fill="#33261b"/><rect x="0" y="646" width="1600" height="10" fill="#4a3527"/>';
  // papiri
  body += '<g transform="rotate(-6 420 800)"><rect x="230" y="690" width="380" height="260" rx="10" fill="#f6ecdc"/><g stroke="#3a2c20" stroke-opacity="0.28" stroke-width="6" stroke-linecap="round"><path d="M270 740 L570 740"/><path d="M270 786 L570 786"/><path d="M270 832 L520 832"/><path d="M270 878 L560 878"/></g></g>';
  body += '<g transform="rotate(5 900 830)"><rect x="740" y="710" width="360" height="250" rx="10" fill="#e9dfcd"/><g stroke="#3a2c20" stroke-opacity="0.25" stroke-width="6" stroke-linecap="round"><path d="M780 760 L1060 760"/><path d="M780 806 L1060 806"/><path d="M780 852 L960 852"/></g></g>';
  // olovka
  body += '<g transform="rotate(-32 1120 800)"><rect x="1010" y="792" width="250" height="16" rx="6" fill="#c9a25a"/><path d="M1260 792 L1310 800 L1260 808 Z" fill="#f6ecdc"/></g>';
  // knjige
  body += '<g><rect x="1180" y="600" width="330" height="42" rx="8" fill="#7c3a22"/><rect x="1198" y="560" width="296" height="40" rx="8" fill="#556141"/><rect x="1180" y="520" width="340" height="40" rx="8" fill="#3a2531"/></g>';
  // šolja
  body += '<g><rect x="1050" y="560" width="104" height="90" rx="14" fill="#e9dfcd"/><path d="M1152 586 C 1200 590 1200 640 1150 642" fill="none" stroke="#e9dfcd" stroke-width="14"/><ellipse cx="1102" cy="558" rx="46" ry="12" fill="#4a3527"/></g>';
  // naočale
  body += '<g stroke="#c9a25a" stroke-width="7" fill="none" opacity="0.85" transform="translate(770 600)"><circle cx="0" cy="0" r="38"/><circle cx="100" cy="0" r="38"/><path d="M38 0 L62 0"/></g>';
  for (let i = 0; i < 12; i += 1) {
    body += leaf(range(rng, 60, 1540), range(rng, 80, 940), range(rng, 14, 30), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#96601f', '#c9a25a']), r2(range(rng, 0.15, 0.5)));
  }
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#study)"/>', body: body };
});

/* ===================== 14. JESENJE LIŠĆE (TEKSTURA) ==================== */
scene('jesen-lisce', 1600, 1000, function () {
  const rng = makeRng(251);
  const defs =
    linearGradient('leafBg', [[0, '#c2833a'], [0.45, '#96601f'], [1, '#5a3a48']]) +
    radialGradient('leafLight', [[0, '#ffe0ad', 0.45], [1, '#ffe0ad', 0]]);
  let body = '';
  body += '<circle cx="1180" cy="200" r="700" fill="url(#leafLight)"/>';
  const palette = ['#e2b878', '#c2833a', '#a1502c', '#7c3a22', '#96601f', '#c9a25a', '#5a3a48'];
  for (let i = 0; i < 16; i += 1) {
    body += '<g opacity="0.22" filter="url(#soft)">' + leaf(range(rng, 0, 1600), range(rng, 0, 1000), range(rng, 90, 190), range(rng, 0, 360), pick(rng, palette), 1) + '</g>';
  }
  for (let i = 0; i < 46; i += 1) {
    body += leaf(range(rng, -40, 1640), range(rng, -40, 1040), range(rng, 18, 54), range(rng, 0, 360), pick(rng, palette), r2(range(rng, 0.45, 0.95)));
  }
  body += '<g opacity="0.14"><path d="M-100 900 L700 100 L900 100 L100 900 Z" fill="#fff2d8"/><path d="M300 1060 L1100 260 L1220 260 L420 1060 Z" fill="#fff2d8"/></g>';
  return { defs: defs, bg: '<rect width="1600" height="1000" fill="url(#leafBg)"/>', body: body, grain: 0.13 };
});

/* ==================== 15. PORTRET PISCA (PLACEHOLDER) ================== */
scene('portret-pisac', 1200, 1500, function () {
  const rng = makeRng(271);
  const defs =
    linearGradient('ateli', [[0, '#4a3527'], [0.45, '#2a2018'], [1, '#140e0a']]) +
    radialGradient('rim', [[0, '#f0c78f', 0.42], [1, '#f0c78f', 0]]);
  let body = '';
  body += '<circle cx="880" cy="420" r="620" fill="url(#rim)"/>';
  body += '<g opacity="0.12"><path d="M-60 1500 L700 120 L860 120 L100 1500 Z" fill="#ffe9c2"/><path d="M420 1500 L1040 260 L1150 260 L540 1500 Z" fill="#ffe9c2"/></g>';
  body += '<rect x="62" y="62" width="1076" height="1376" rx="18" fill="none" stroke="#c9a25a" stroke-opacity="0.45" stroke-width="6"/>';
  body += '<rect x="92" y="92" width="1016" height="1316" rx="12" fill="none" stroke="#c9a25a" stroke-opacity="0.22" stroke-width="3"/>';
  // ramena i glava (silueta)
  body += '<g opacity="0.5" filter="url(#soft)">' + figure(612, 1236, 980, '#c2833a', 1) + '</g>';
  body += figure(592, 1236, 980, '#0f0a08', 1);
  body += '<circle cx="592" cy="430" r="118" fill="#0f0a08"/>';
  // nagovještaj naočala i knjige
  body += '<g stroke="#c9a25a" stroke-width="6" fill="none" opacity="0.75"><circle cx="556" cy="424" r="34"/><circle cx="642" cy="424" r="34"/><path d="M590 424 L608 424"/></g>';
  body += '<g transform="rotate(-6 600 1090)"><rect x="424" y="1010" width="330" height="190" rx="12" fill="#e9dfcd" opacity="0.92"/><rect x="586" y="1010" width="12" height="190" fill="#c2833a" opacity="0.55"/><g stroke="#3a2c20" stroke-opacity="0.3" stroke-width="7" stroke-linecap="round"><path d="M456 1058 L566 1058"/><path d="M456 1104 L566 1104"/><path d="M618 1058 L728 1058"/><path d="M618 1104 L690 1104"/></g></g>';
  for (let i = 0; i < 10; i += 1) {
    body += leaf(range(rng, 80, 1120), range(rng, 100, 1400), range(rng, 14, 30), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#96601f']), r2(range(rng, 0.18, 0.5)));
  }
  return { defs: defs, bg: '<rect width="1200" height="1500" fill="url(#ateli)"/>', body: body, grain: 0.11 };
});

/* ==================== 16. KARTA / VIZUELNI PRIKAZ ==================== */
scene('mapa', 1400, 1000, function () {
  const rng = makeRng(293);
  let contours = '';
  for (let ring = 1; ring <= 7; ring += 1) {
    const rx = 130 + ring * 92;
    const ry = 92 + ring * 62;
    let d = '';
    const steps = 14;
    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * Math.PI * 2;
      const wob = 1 + range(rng, -0.06, 0.06);
      const x = 620 + Math.cos(a) * rx * wob;
      const y = 500 + Math.sin(a) * ry * wob;
      d += (i === 0 ? 'M' : 'L') + r2(x) + ' ' + r2(y) + ' ';
    }
    contours += `<path d="${d}Z" fill="none" stroke="#8a6b3f" stroke-opacity="${r2(0.12 + ring * 0.03)}" stroke-width="${r2(2.5 + ring * 0.4)}"/>`;
  }
  let body = '';
  body += contours;
  body += '<path d="M-40 700 C 240 660 380 780 640 742 C 900 704 1080 800 1440 748" fill="none" stroke="#6f8d86" stroke-width="14" stroke-linecap="round" opacity="0.85"/>';
  body += '<g stroke="#4a3527" stroke-width="5" stroke-dasharray="18 14" opacity="0.5"><path d="M140 880 C 420 800 700 860 980 700 C 1140 610 1220 420 1330 300"/><path d="M60 260 C 320 380 640 340 900 420 C 1120 488 1220 520 1400 500"/></g>';
  const pins = [[430, 470, 'Mjesto 1'], [880, 690, 'Mjesto 2'], [1080, 300, 'Mjesto 3']];
  pins.forEach((p) => {
    const x = p[0];
    const y = p[1];
    body += `<g><circle cx="${x}" cy="${y}" r="52" fill="#c2833a" opacity="0.18" filter="url(#soft)"/><path d="M${x} ${y + 46} C ${x - 34} ${y - 6} ${x - 34} ${y - 46} ${x} ${y - 46} C ${x + 34} ${y - 46} ${x + 34} ${y - 6} ${x} ${y + 46} Z" fill="#a1502c"/><circle cx="${x}" cy="${y - 14}" r="14" fill="#f6ecdc"/><rect x="${x + 26}" y="${y + 52}" width="${p[2].length * 17 + 34}" height="48" rx="10" fill="#f6ecdc" opacity="0.95"/><text x="${x + 43}" y="${y + 84}" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#2a2018">${p[2]}</text></g>`;
  });
  body += '<g transform="translate(1230 170)" opacity="0.75"><circle r="66" fill="none" stroke="#4a3527" stroke-width="5"/><path d="M0 -54 L16 0 L0 54 L-16 0 Z" fill="#a1502c"/><path d="M0 -54 L0 54" stroke="#f6ecdc" stroke-width="3"/><text x="-8" y="-74" font-family="Georgia, serif" font-size="26" fill="#4a3527">S</text></g>';
  return {
    defs: grainFilter('paperGrain', 0.7),
    bg: '<rect width="1400" height="1000" fill="#f2e9d8"/>',
    body: '<g opacity="0.5"><rect width="1400" height="1000" filter="url(#paperGrain)" style="mix-blend-mode:multiply"/></g>' +
      '<g stroke="#c3b497" stroke-width="2" opacity="0.5">' +
      Array.from({ length: 14 }, (_, i) => `<path d="M${i * 100} 0 L${i * 100} 1000"/>`).join('') +
      Array.from({ length: 10 }, (_, i) => `<path d="M0 ${i * 100} L1400 ${i * 100}"/>`).join('') +
      '</g>' + body
  };
});

/* ================= 17. TEKSTURA PAPIRA (POPLOČIVO) ==================== */
scene('tekstura-papir', 800, 800, function () {
  return {
    defs: grainFilter('tileGrain', 0.75),
    bg: '<rect width="800" height="800" fill="#f7f1e6"/>',
    body: '<g opacity="0.55"><rect width="800" height="800" filter="url(#tileGrain)" style="mix-blend-mode:multiply"/></g>',
    grain: 0
  };
});

/* ==================== 18. KORICE KNJIGE (PRESEK) ===================== */
scene('korice', 1100, 1500, function () {
  const rng = makeRng(311);
  const defs =
    linearGradient('cover', [[0, '#2f2318'], [0.5, '#1c1410'], [1, '#120c0a']]) +
    radialGradient('coverGlow', [[0, '#d9a25a', 0.32], [1, '#d9a25a', 0]]);
  let body = '';
  body += '<circle cx="780" cy="300" r="600" fill="url(#coverGlow)"/>';
  body += '<rect x="60" y="60" width="980" height="1380" rx="14" fill="none" stroke="#c9a25a" stroke-opacity="0.5" stroke-width="6"/>';
  body += '<g stroke="#c9a25a" stroke-opacity="0.7" stroke-width="4"><path d="M170 250 L930 250"/><path d="M170 264 L930 264"/></g>';
  body += '<text x="550" y="200" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="34" letter-spacing="14" fill="#d9a25a" opacity="0.85">LEKTIRA</text>';
  body += '<text x="550" y="480" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="112" fill="#f6ecdc">Prosanjane</text>';
  body += '<text x="550" y="612" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="112" font-style="italic" fill="#d9a25a">jeseni</text>';
  body += '<g stroke="#c9a25a" stroke-opacity="0.7" stroke-width="4"><path d="M170 700 L930 700"/><path d="M170 714 L930 714"/></g>';
  body += '<text x="550" y="800" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="52" fill="#e9dfcd">Zija Dizdarević</text>';
  body += '<text x="550" y="1300" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="40" fill="#c2833a" opacity="0.9">Rad 3. grupe</text>';
  for (let i = 0; i < 14; i += 1) {
    body += leaf(range(rng, 120, 980), range(rng, 880, 1240), range(rng, 24, 62), range(rng, 0, 360), pick(rng, ['#c2833a', '#a1502c', '#96601f', '#c9a25a']), r2(range(rng, 0.25, 0.6)));
  }
  return { defs: defs, bg: '<rect width="1100" height="1500" fill="url(#cover)"/>', body: body };
});

/* ======================== 19. FAVICON (ZNAK) ========================= */
scene('favicon', 64, 64, function () {
  return {
    defs: linearGradient('fav', [[0, '#c2833a'], [1, '#a1502c']], { x1: 0, y1: 0, x2: 1, y2: 1 }),
    bg: '<rect width="64" height="64" rx="14" fill="#1c1410"/>',
    body:
      '<path d="M32 18 C 27 14 19 13 13 14 L13 46 C 19 45 27 46 32 50 Z" fill="url(#fav)"/>' +
      '<path d="M32 18 C 37 14 45 13 51 14 L51 46 C 45 45 37 46 32 50 Z" fill="#d9a25a"/>' +
      '<path d="M32 18 L32 50" stroke="#1c1410" stroke-opacity="0.5" stroke-width="2"/>',
    grain: 0
  };
});

/* ---------------------------------------------------------------------------
   ZAPISIVANJE
   --------------------------------------------------------------------------- */
function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  let total = 0;
  SCENES.forEach((s) => {
    const markup = doc(Object.assign({ w: s.w, h: s.h }, s.fn() || {}));
    const file = path.join(OUT_DIR, s.name + '.svg');
    fs.writeFileSync(file, markup, 'utf8');
    total += 1;
    console.log('  ✔ images/' + s.name + '.svg  (' + (markup.length / 1024).toFixed(1) + ' kB)');
  });
  console.log('\nGotovo: ' + total + ' ilustracija zapisano u ' + OUT_DIR);
}

run();

