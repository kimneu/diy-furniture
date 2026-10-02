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
  // a1: Standards Mode mit lang de-CH und Gerüst im Quelltext; Layout wie vorher im Quirks Mode (kein Seitenscrollen bei 1440×900 und 1200×640, Feldbreite, Tabelle, Bühne, Handy).
  a1: async (ctx) => {
    const zu = (p) => p.evaluate(() => document.querySelectorAll('dialog[open]').forEach(d => d.close()));
    const modus = async (p) => (await p.evaluate(() => document.compatMode)) === 'CSS1Compat' ? 'standards' : 'quirks';
    const tdZeile = (p) => p.evaluate(() => getComputedStyle(document.querySelector('#cutTable td')).lineHeight);

    // Desktop, Entwerfen
    const d = await ctx.desktop();
    await ctx.oeffne(d, 'entwerfen'); await zu(d);
    const m = await modus(d);
    ctx.pruefe(m === 'standards', `Standards Mode (compatMode ${await d.evaluate(() => document.compatMode)})`);
    ctx.pruefe(await d.evaluate(() => document.documentElement.lang) === 'de-CH', '<html lang="de-CH">');
    const quelle = await d.evaluate(() => fetch('/index.html', { cache: 'no-store' }).then(r => r.text()));
    ctx.pruefe(/^<!doctype html>\n<html lang="de-CH">\n<head>\n<meta charset="utf-8">/.test(quelle)
      && /<\/style>\n<\/head>\n<body>\n<svg /.test(quelle)
      && /<\/script>\n<\/body>\n<\/html>\n?$/.test(quelle), 'Quelltext-Gerüst doctype/html/head/body');
    await ctx.screenshot(d, `a1-desktop-entwerfen-${m}`);
    const appUnten = await d.evaluate(() => document.querySelector('.app').getBoundingClientRect().bottom);
    await d.mouse.move(400, 30); await d.mouse.wheel(0, 800); await d.waitForTimeout(250);
    const y = await d.evaluate(() => scrollY);
    ctx.pruefe(appUnten <= 900 && y === 0, `Desktop 1440×900 scrollt nicht (.app unten ${Math.round(appUnten)}, scrollY ${y})`);
    const numB = await d.evaluate(() => Math.round(document.querySelector('.num input').getBoundingClientRect().width));
    ctx.pruefe(numB === 62, `.num input 62 px breit (${numB})`);
    await d.click('#tab-bauen'); await d.waitForTimeout(250);
    ctx.pruefe(await tdZeile(d) === 'normal', 'Tabelle Desktop line-height normal');
    await ctx.screenshot(d, `a1-desktop-bauen-${m}`);
    // Mindestfenster 1200×640: ab hier füllt die App genau das Fenster, die Seite scrollt nicht
    await d.setViewportSize({ width: 1200, height: 640 });
    await ctx.oeffne(d, 'entwerfen'); await zu(d);
    await d.mouse.move(400, 30); await d.mouse.wheel(0, 800); await d.waitForTimeout(250);
    const [yKlein, ueberlauf] = await d.evaluate(() => [scrollY, getComputedStyle(document.body).overflow]);
    ctx.pruefe(yKlein === 0 && ueberlauf === 'hidden', `1200×640 – Seite scrollt nicht (scrollY ${yKlein}, body overflow ${ueberlauf})`);
    await d.close();

    // Desktop ohne three.js: Ersatztext füllt die Bühne
    const n = await ctx.desktop();
    await n.route('**/three.min.js', r => r.abort());
    await ctx.oeffne(n, 'entwerfen'); await zu(n);
    const [hn, hs] = await n.evaluate(() => [document.querySelector('.nogl')?.getBoundingClientRect().height || 0, document.querySelector('#stage').getBoundingClientRect().height]);
    ctx.pruefe(hn > 0 && Math.round(hn) === Math.round(hs), `.nogl füllt #stage (${Math.round(hn)}/${Math.round(hs)})`);
    await n.close();

    // Handy, Entwerfen
    const h = await ctx.handy();
    await ctx.oeffne(h, 'entwerfen'); await zu(h);
    await ctx.screenshot(h, `a1-handy-entwerfen-${m}`);
    const [sw, iw] = await h.evaluate(() => [document.scrollingElement.scrollWidth, innerWidth]);
    ctx.pruefe(sw <= iw, `Handy ohne Querscrollen (${sw}/${iw})`);
    await h.evaluate(() => scrollTo(0, 1e6)); await h.waitForTimeout(250);
    const [fu, mo] = await h.evaluate(() => [document.querySelector('#cfg').getBoundingClientRect().bottom, document.querySelector('#mbar').getBoundingClientRect().top]);
    ctx.pruefe(fu <= mo, `Formular-Ende über der Leiste (${Math.round(fu)}/${Math.round(mo)})`);
    await h.close();

    // Handy, Bauen
    const hb = await ctx.handy();
    await ctx.oeffne(hb, 'bauen'); await zu(hb);
    ctx.pruefe(await tdZeile(hb) === 'normal', 'Tabelle Handy line-height normal');
    await ctx.screenshot(hb, `a1-handy-bauen-${m}`);
    await hb.close();
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
