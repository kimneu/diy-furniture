/* UI-Prüfung im Browser: jede Prüfung in PRUEFUNGEN öffnet die Seite in Chrome headless (über Patchright),
   prüft sichtbares Verhalten und schreibt Bilder. Jeder Task der Stufe A ergänzt eine Prüfung (t0, a1 …).

   Einrichten:  cd tools && npm install
   Alle:        node tools/ui-pruefung.mjs              (im Repo-Root)
   Einzeln:     node tools/ui-pruefung.mjs t0 a3

   Das Skript startet einen eigenen Server (python3 -m http.server) auf einem freien Port und beendet ihn am Schluss.
   Bilder landen in tools/ui-shots/ (gitignored). Braucht Internet: three.js von cdnjs/jsdelivr, Schriften von
   Google Fonts. Ausgabe je Bedingung «ok <id>: …» oder «FEHLT <id>: …», dann «<n> ok, <m> FEHLT».
   Exit-Code 1, sobald etwas FEHLT, sonst 0.

   Patchright-Eigenheiten:
   - Die Konsole der Seite ist abgeschaltet: page.on('console') und page.on('pageerror') liefern nichts.
     Fehler gibt es nur über ctx.fehler (Init-Script fehlerSammeln plus Netzfehler).
   - page.evaluate läuft in einer isolierten Welt: DOM, getComputedStyle, matchMedia und localStorage sind sichtbar,
     Seitenvariablen (THREE, entwuerfe …) nicht. Für die Hauptwelt ctx.haupt(page, fn, arg) nehmen. */
import { chromium } from 'patchright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SHOTS = fileURLToPath(new URL('./ui-shots/', import.meta.url));
const SPEICHER = 'sideboard-werkbank-v2';

export const PRUEFUNGEN = {
  // t0: Seite lädt am Handy und am Desktop (dunkel) ohne Fehler, Titel stimmt, Handy-Medienabfragen greifen.
  t0: async (ctx) => {
    const handy = await ctx.handy();
    await ctx.oeffne(handy, 'entwerfen', { erst:true });
    ctx.pruefe(await handy.title() === 'Martylko', 'Titel «Martylko»');
    const mq = await handy.evaluate(() => [matchMedia('(pointer:coarse)').matches, matchMedia('(hover:none)').matches, innerWidth]);
    ctx.pruefe(mq[0] && mq[1] && mq[2] === 390, `Handy: pointer:coarse, hover:none, 390 px breit (${mq.join(', ')})`);
    const fh = await ctx.fehler(handy);
    ctx.pruefe(fh.length === 0, 'Handy ohne Fehler' + (fh.length ? ': ' + fh.join(' | ') : ''));
    await ctx.screenshot(handy, 't0-handy');

    const desk = await ctx.desktop();
    await ctx.oeffne(desk, 'entwerfen', { dunkel:true });
    ctx.pruefe(await desk.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), 'Desktop dunkel: prefers-color-scheme dark greift');
    const fd = await ctx.fehler(desk);
    ctx.pruefe(fd.length === 0, 'Desktop ohne Fehler' + (fd.length ? ': ' + fd.join(' | ') : ''));
    await ctx.screenshot(desk, 't0-desktop-dunkel');
  },
};

// Läuft vor jedem Script der Seite in der Hauptwelt (context.addInitScript) und sammelt Fehler in window.__uiFehler.
function fehlerSammeln() {
  const f = window.__uiFehler = [];
  const orig = console.error.bind(console);
  console.error = (...a) => { f.push('console.error: ' + a.map(String).join(' ')); orig(...a); };
  addEventListener('error', e => f.push(e.target && e.target !== window
    ? 'nicht geladen: ' + (e.target.src || e.target.href)
    : 'Fehler: ' + e.message), true);
  addEventListener('unhandledrejection', e => f.push('Promise: ' + (e.reason && e.reason.message || e.reason)));
}

// Freien Port holen: Server auf Port 0 öffnen, Port lesen, wieder schliessen.
function freierPort() {
  return new Promise((ok, nein) => {
    const s = createServer();
    s.once('error', nein);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });
}

// Bis zu 50 Mal im Abstand von 100 ms anfragen, bis der Server antwortet.
async function warteAuf(url) {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Server antwortet nicht: ' + url);
}

async function main(ids) {
  const port = await freierPort();
  const BASE = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd:ROOT, stdio:'ignore' });
  let browser, nOk = 0, nFehlt = 0;
  try {
    await warteAuf(BASE + '/');
    // Ohne SwiftShader gibt es headless kein WebGL für three.js.
    browser = await chromium.launch({ channel:'chrome', headless:true, args:['--enable-unsafe-swiftshader'] });
    const netzFehler = new WeakMap();   // Page → Liste der Netzfehler seit dem letzten oeffne
    const ohneFavicon = url => !url.endsWith('/favicon.ico');

    async function neueSeite(optionen) {
      const context = await browser.newContext(optionen);
      await context.addInitScript(fehlerSammeln);
      const page = await context.newPage();
      const liste = [];
      netzFehler.set(page, liste);
      page.on('response', r => { if (r.status() >= 400 && ohneFavicon(r.url())) liste.push(`${r.status()} ${r.url()}`); });
      page.on('requestfailed', q => { if (ohneFavicon(q.url())) liste.push('nicht erreichbar: ' + q.url()); });
      return page;
    }

    for (const id of ids) {
      const ctx = {
        handy: () => neueSeite({ viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true, deviceScaleFactor:2 }),
        desktop: () => neueSeite({ viewport:{ width:1440, height:900 } }),
        async oeffne(page, hash = '', { erst = false, dunkel = false } = {}) {
          await page.emulateMedia({ colorScheme: dunkel ? 'dark' : 'light' });
          await page.goto(BASE + '/preise.js');   // anderes Dokument: das Ziel lädt danach sicher neu, auch bei gleichem Pfad
          if (erst) await page.evaluate(p => { for (const k of Object.keys(localStorage)) if (k.startsWith(p)) localStorage.removeItem(k); }, SPEICHER);
          netzFehler.get(page).length = 0;
          await page.goto(hash.startsWith('?') ? `${BASE}/${hash}` : `${BASE}/${hash ? '#' + hash : ''}`);
          await page.waitForSelector('form#cfg.ready', { state:'attached', timeout:15000 });
        },
        pruefe(bedingung, text) {
          if (bedingung) nOk++; else nFehlt++;
          console.log(`${bedingung ? 'ok' : 'FEHLT'} ${id}: ${text}`);
        },
        async screenshot(page, name) {
          mkdirSync(SHOTS, { recursive:true });
          await page.screenshot({ path: SHOTS + name + '.png', animations:'disabled' });
        },
        haupt: (page, fn, arg) => page.evaluate(fn, arg, undefined, false),
        fehler: async (page) => [...await page.evaluate(() => window.__uiFehler || ['Fehlersammler fehlt'], undefined, undefined, false), ...netzFehler.get(page)],
      };
      if (!Object.hasOwn(PRUEFUNGEN, id)) { ctx.pruefe(false, 'unbekannte Prüfung'); continue; }
      try {
        await PRUEFUNGEN[id](ctx);
      } catch (e) {
        ctx.pruefe(false, 'Abbruch – ' + String(e?.message ?? e).split('\n')[0]);
      } finally {
        await Promise.all(browser.contexts().map(c => c.close()));
      }
    }
  } finally {
    await browser?.close();
    server.kill();
  }
  console.log(`${nOk} ok, ${nFehlt} FEHLT`);
  return nFehlt ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ids = process.argv.slice(2);
  process.exitCode = await main(ids.length ? ids : Object.keys(PRUEFUNGEN));
}
