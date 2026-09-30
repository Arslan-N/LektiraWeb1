'use strict';
/* ============================================================================
   Pregled stranice u pravom pregledniku uz tačnu širinu okvira:
   - postavlja viewport preko DevTools protokola (pouzdano za mobilne širine)
   - ispisuje eventualno horizontalno prelijevanje
   - snima screenshot (--full snima cijelu stranicu)
   Pokretanje:  node tools/preview.js <stranica> <širina> [visina] [--full]
   Primjer:     node tools/preview.js index.html 1440 1000 --full
   ============================================================================ */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, '_shots');

// Svaki preglednik dobija svoj slobodan port. U režimu --all preglednici se
// pokreću jedan za drugim, pa bi isti port znao još biti zauzet od prethodnog
// (Chrome tada ne otvori debug protokol i provjera „istekne“).
function freePort() {
  return 9300 + Math.floor(Math.random() * 600);
}

const page = process.argv[2] || 'index.html';
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 1000);
const full = process.argv.indexOf('--full') !== -1;
const yArg = process.argv.find((a) => a.startsWith('--y='));
const scrollY = yArg ? Number(yArg.split('=')[1]) : 0;
const sArg = process.argv.find((a) => a.startsWith('--scale='));
const scale = sArg ? Number(sArg.split('=')[1]) : 1;
const all = page === '--all';
const PAGES = all ? fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort() : [page];

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];
const browser = CANDIDATES.find((p) => fs.existsSync(p));

const OVERFLOW = `(() => {
  const vw = document.documentElement.clientWidth;
  const found = [];
  document.querySelectorAll('body *').forEach(function (el) {
    let a = el.parentElement, skip = false;
    while (a) {
      const cs = getComputedStyle(a);
      if (cs.position === 'fixed' || cs.overflowX === 'hidden' || cs.overflowX === 'clip') { skip = true; break; }
      a = a.parentElement;
    }
    if (skip) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      const cls = String(el.getAttribute('class') || '').split(/\\s+/).slice(0, 2).join('.');
      found.push(el.tagName.toLowerCase() + (cls ? '.' + cls : '') + '  [l ' + Math.round(r.left) + ', r ' + Math.round(r.right) + ']');
    }
  });
  return JSON.stringify({
    vw: vw,
    scrollWidth: document.documentElement.scrollWidth,
    docHeight: document.documentElement.scrollHeight,
    found: found.slice(0, 8)
  });
})()`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForTarget(port) {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/json/list');
      const list = await res.json();
      const found = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (found) return found;
    } catch (e) {
      /* još se pokreće */
    }
    await sleep(250);
  }
  throw new Error('Debug protokol nije dostupan.');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    let id = 0;
    ws.onopen = () => {
      resolve({
        send(method, params, timeoutMs) {
          id += 1;
          const message = { id: id, method: method, params: params || {} };
          return new Promise((res, rej) => {
            // Tajmer se čisti čim odgovor stigne; bez toga Node čeka do isteka
            // roka i nakon završenog posla (u --all to se skupi po stranici).
            const timer = setTimeout(() => {
              pending.delete(id);
              rej(new Error('Isteklo: ' + method));
            }, timeoutMs || 20000);
            pending.set(id, {
              res: (value) => { clearTimeout(timer); res(value); },
              rej: (err) => { clearTimeout(timer); rej(err); }
            });
            ws.send(JSON.stringify(message));
          });
        },
        close() {
          ws.close();
        }
      });
    };
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const item = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) item.rej(new Error(msg.error.message));
        else item.res(msg.result);
      }
    };
    ws.onerror = (err) => reject(new Error('WebSocket: ' + (err.message || '')));
  });
}

// Snimka cijele stranice (captureBeyondViewport) u headless pregledniku zna
// potrajati dulje od uobičajenog roka, pa joj dajemo više vremena i — ako ipak
// istekne — jedan ponovni pokušaj, da jedna spora snimka ne obori cijelu stranicu.
async function capture(client, full) {
  const params = { format: 'png', captureBeyondViewport: full };
  try {
    return await client.send('Page.captureScreenshot', params, full ? 60000 : 20000);
  } catch (err) {
    if (!full) throw err;
    console.log('  … snimka cijele stranice nije uspjela iz prvog pokušaja, ponavljam');
    await sleep(1500);
    return client.send('Page.captureScreenshot', params, 60000);
  }
}

async function inspect(page) {
  const port = freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lektira-preview-'));
  const url = 'file:///' + path.join(ROOT, page).replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');
  const child = spawn(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + profile,
    url
  ], { stdio: 'ignore' });

  try {
    const target = await waitForTarget(port);
    const client = await connect(target.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: width,
      height: height,
      deviceScaleFactor: scale,
      mobile: width < 700
    });
    await client.send('Page.reload', { ignoreCache: true });
    await sleep(2200);

    const evaluated = await client.send('Runtime.evaluate', { expression: OVERFLOW, returnByValue: true });
    const data = JSON.parse(evaluated.result.value);
    const ok = data.scrollWidth <= data.vw + 1 && data.found.length === 0;
    console.log((ok ? '✔' : '✗') + ' ' + page + ' @ ' + width + 'px  (viewport ' + data.vw + ', scrollWidth ' + data.scrollWidth + ', visina sadržaja ' + data.docHeight + ')');
    data.found.forEach((f) => console.log('     → ' + f));

    if (!all) {
      fs.mkdirSync(OUT, { recursive: true });
      if (scrollY) {
        await client.send('Runtime.evaluate', {
          expression: 'window.scrollTo(0, ' + scrollY + '); document.querySelectorAll(\'[data-reveal]\').forEach(function (el) { el.classList.add(\'is-visible\'); }); "ok"',
          returnByValue: true
        });
        await sleep(1200);
      }
      if (full) {
        // za snimku cijele stranice prikaži i elemente koji čekaju skrol
        await client.send('Runtime.evaluate', {
          expression: "document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-visible'); }); 'ok'",
          returnByValue: true
        });
        await sleep(900);
      }
      const shot = await capture(client, full);
      const safe = path.basename(page).replace(/\.(html?|svg)$/, '');
      const name = safe + '-' + width + (full ? '-full' : '') + '.png';
      fs.writeFileSync(path.join(OUT, name), Buffer.from(shot.data, 'base64'));
      console.log('  → tools/_shots/' + name);
    }
    client.close();
    return ok;
  } catch (err) {
    console.log('✗ ' + page + ' → ' + err.message);
    return false;
  } finally {
    // sačekaj da se preglednik zaista ugasi, da port bude slobodan za sljedeću stranicu
    await new Promise((done) => {
      let killer;
      try {
        killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch (e) {
        child.kill();
        done();
        return;
      }
      killer.on('close', done);
      killer.on('error', () => {
        child.kill();
        done();
      });
    });
    await sleep(700);
    // Chrome još kratko drži datoteke profila; pokušavamo nekoliko puta da
    // privremeni direktoriji ne ostanu u %TEMP%.
    for (let i = 0; i < 4; i += 1) {
      try {
        fs.rmSync(profile, { recursive: true, force: true });
        break;
      } catch (e) {
        await sleep(400);
      }
    }
  }
}

(async () => {
  if (!browser) {
    console.log('Nema Chrome/Edge — preskačem pregled.');
    return;
  }
  let bad = 0;
  for (const item of PAGES) {
    const ok = await inspect(item);
    if (!ok) bad += 1;
  }
  if (PAGES.length > 1) {
    console.log('\n' + (bad === 0
      ? 'Bez prelijevanja na svim stranicama.'
      : 'Stranica s prelijevanjem ili greškom: ' + bad));
  }
})();
