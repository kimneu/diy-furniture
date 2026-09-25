/* Jumbo-Preise nachführen: liest m²-Preis und max. Zuschnittmass pro Stärke von jumbo.ch.
   jumbo.ch sperrt normale Automatisierung, darum Patchright (getarntes Playwright) mit sichtbarem Chrome.

   Einrichten:  cd tools && npm install
   Suchen:      node jumbo-preise.mjs suche "Dreischichtplatte" "OSB"      → Produkte mit URL, um Quellen zu finden
                (statt Suchbegriff geht auch eine Kategorie-URL)
   Preise:      node jumbo-preise.mjs [schlüssel …]                        → alle (oder einzelne) Quellen aus jumbo-quellen.json
   Nachführen:  node jumbo-preise.mjs --schreiben [schlüssel …]            → wie oben, dann ../preise.js aktualisieren

   Ohne --schreiben vergleicht das Skript nur mit preise.js. Mit --schreiben übernimmt es Preis und max. Zuschnitt
   bekannter Stärken und setzt «stand» auf heute. Neue oder weggefallene Stärken meldet es nur (neue brauchen einen
   SPAN-Wert in reduit.js). Varianten («fichte~Langformat») werden nur verglichen, nie geschrieben.
   Schonend: eine Seite nach der anderen, einige Sekunden Pause dazwischen. */
import { chromium } from 'patchright';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const here = p => new URL(p, import.meta.url).pathname;
const require = createRequire(import.meta.url);
const { FILE, format } = require('./preise-datei.cjs');
const DATA = require(FILE);
const { BACKS } = require('../shared.js');
const SOURCES = JSON.parse(readFileSync(here('./jumbo-quellen.json'), 'utf8'));
const PAUSE = 4000;
const BASE = 'https://www.jumbo.ch/de';

const sleep = ms => new Promise(r => setTimeout(r, ms + Math.random() * 1500));

async function open(page, url) {
  await page.goto(url, { waitUntil:'domcontentloaded', timeout:60000 });
  // Die erste Antwort ist oft 403 (Browser-Prüfung); danach lädt die Seite normal nach.
  await page.waitForLoadState('networkidle', { timeout:20000 }).catch(() => {});
}

// Zuschnitt-Produktseite: m²-Preis, max. Masse, Stärken mit ihren Varianten-URLs.
async function readCutPage(page, url) {
  await open(page, url);
  await page.waitForSelector('#input-length', { timeout:30000 });
  return page.evaluate(() => {
    const text = document.body.innerText;
    const m = text.match(/([\d'.]+)(?:\.-)?\s*\n+\s*Grundpreis pro m2/);
    const num = s => s && Number(s.replace(/'/g, '').replace(/\.-$/, ''));
    const sel = document.querySelector('select[data-select-variant*="STAERKE"]');
    return {
      name: document.querySelector('h1')?.textContent.trim(),
      price: m ? num(m[1]) : null,
      maxL: Number(document.querySelector('#input-length')?.max) || null,
      maxB: Number(document.querySelector('#input-width')?.max) || null,
      thick: sel ? [...sel.options].map(o => ({ t: Number(o.value), url: o.dataset.url, selected: o.selected })) : []
    };
  });
}

// Ganze Platten mit Mass im Namen («2000 x 600 x 18 mm», «80x20 cm»): Stückpreis → CHF/m².
function perM2(r) {
  const price = Number(r.price.replace(/.*statt\s*/, '').replace(/'/g, '').replace(/\.-$/, '')) || Number((r.price.match(/([\d.]+)\s*statt/) || [])[1]);
  const d = r.name.match(/(\d+)\s*x\s*(\d+)(?:\s*x\s*(\d+))?\s*(mm|cm)?/i);
  if (!price || !d) return '';
  let [a, b, c] = [d[1], d[2], d[3]].map(Number), f = /cm/i.test(d[4] || '') ? 10 : 1;
  const dims = [a, b, c].filter(Boolean).map(x => x * f).sort((x, y) => y - x);   // grösste zwei = Fläche
  return (price / (dims[0] * dims[1] / 1e6)).toFixed(2) + '/m²';
}

async function search(page, terms) {
  for (const q of terms) {
    await open(page, /^https?:/.test(q) ? q : `${BASE}/search?text=${encodeURIComponent(q)}`);
    await page.waitForTimeout(3000);
    const rows = await page.evaluate(() => {
      const out = new Map();
      for (const a of document.querySelectorAll('a[href*="/p/"]')) {
        const url = a.href.split(/[?#]/)[0], txt = a.textContent.trim().replace(/\s+/g, ' ');
        const r = out.get(url) || { url, name:'', price:'' };
        if (/^[\d'.]+(\.-)?$/.test(txt) || /statt/.test(txt)) r.price ||= txt;
        else if (txt.length > r.name.length && !/^\(\d+\)$|Varianten$/.test(txt)) r.name = txt;
        out.set(url, r);
      }
      return [...out.values()];
    });
    console.log(`\n## ${q}`);
    for (const r of rows) console.log(`${r.url.includes('/holzzuschnitt/') ? 'Z' : ' '} ${r.price.padStart(8)} ${perM2(r).padStart(9)}  ${r.name}\n             ${r.url}`);
    await sleep(PAUSE);
  }
}

// Schlüssel = Eintrag in preise.js (platten/rueckwaende), optional mit «~Variante» für mehrere Jumbo-Produkte zum selben Material.
function current(src) {
  const key = src.split('~')[0], P = DATA.platten[key], B = DATA.rueckwaende[key];
  if (P) return { entry: P, sheet: P.sheet, price: t => P.prices[t], t: Object.keys(P.prices).map(Number) };
  return B && BACKS[key] && { entry: B, sheet: B.sheet, price: t => (t === BACKS[key].t ? B.price : undefined), t: BACKS[key].t };
}

async function prices(page, keys) {
  const rows = [];
  for (const key of keys) {
    const src = SOURCES[key];
    if (!src) { console.warn(`Keine Quelle für «${key}» in jumbo-quellen.json`); continue; }
    const cur = current(key);
    if (!cur) { console.warn(`«${key}» gibt es in preise.js weder unter platten noch unter rueckwaende`); continue; }
    const want = src.t || [cur.t].flat();
    const first = await readCutPage(page, src.url);
    // Ohne Stärke-Auswahl gibt es nur diese eine Stärke (aus dem Produktnamen).
    if (!first.thick.length) first.thick = [{ t: Number(first.name.match(/(\d+)\s*mm/i)?.[1]), url: src.url, selected: true }];
    const pages = new Map([[first.thick.find(o => o.selected)?.t, first]]);
    for (const t of want) {
      const opt = first.thick.find(o => o.t === t);
      if (!opt) { rows.push({ key, t, note:`Stärke nicht im Angebot (${first.thick.map(o => o.t).join('/') || '–'})` }); continue; }
      if (!pages.has(t)) { await sleep(PAUSE); pages.set(t, await readCutPage(page, BASE + opt.url.replace(/^\/de/, ''))); }
      const p = pages.get(t);
      rows.push({ key, t, name:p.name, price:p.price, was:cur.price(t), max:`${p.maxL} × ${p.maxB}`, sheet:cur.sheet.join(' × ') });
    }
    const extra = first.thick.map(o => o.t).filter(t => !want.includes(t));
    if (extra.length && !src.t) rows.push({ key, t:'', note:`weitere Stärken bei Jumbo: ${extra.join('/')} (neu aufnehmen: von Hand in preise.js und SPAN)` });
    await sleep(PAUSE);
  }
  console.log('\nSchlüssel              Stärke  Jumbo CHF/m²  Code CHF/m²  Jumbo max. Zuschnitt  Code Platte   Produkt');
  for (const r of rows) {
    if (r.note) { console.log(`${r.key.padEnd(22)} ${String(r.t).padStart(4)}   ${r.note}`); continue; }
    const flag = r.price !== r.was || r.max !== r.sheet ? '*' : ' ';
    console.log(`${flag}${r.key.padEnd(21)} ${String(r.t).padStart(4)}   ${String(r.price).padStart(10)}   ${String(r.was).padStart(10)}   ${r.max.padStart(18)}  ${String(r.sheet).padStart(12)}   ${r.name}`);
  }
  console.log('\n* = weicht von preise.js ab');
  return rows;
}

// Gelesene Werte in preise.js übernehmen: nur bekannte Stärken, keine Varianten.
function write(rows) {
  const today = new Date().toISOString().slice(0, 10), changed = [];
  for (const key of new Set(rows.map(r => r.key))) {
    if (key.includes('~')) continue;
    const cur = current(key), mine = rows.filter(r => r.key === key && !r.note && r.price != null && cur.price(r.t) !== undefined);
    if (!mine.length) continue;
    const E = cur.entry;
    for (const r of mine) {
      if (E.prices) { if (E.prices[r.t] !== r.price) changed.push(`${key} ${r.t} mm: ${E.prices[r.t]} → ${r.price}`); E.prices[r.t] = r.price; }
      else { if (E.price !== r.price) changed.push(`${key}: ${E.price} → ${r.price}`); E.price = r.price; }
    }
    // Ein Format pro Material: nur übernehmen, wenn alle gelesenen Stärken dasselbe max. Zuschnittmass haben.
    const maxes = new Set(mine.map(r => r.max));
    if (maxes.size > 1) console.warn(`${key}: max. Zuschnitt je Stärke verschieden (${[...maxes].join(', ')}) – Format nicht geändert`);
    else {
      const sheet = [...maxes][0].split(' × ').map(Number);
      if (sheet.every(v => v > 0) && sheet.join() !== E.sheet.join()) { changed.push(`${key} Format: ${E.sheet.join(' × ')} → ${sheet.join(' × ')}`); E.sheet = sheet; }
    }
    E.stand = today;
  }
  writeFileSync(FILE, format(DATA));
  console.log(changed.length ? `\npreise.js nachgeführt:\n  ${changed.join('\n  ')}` : '\npreise.js: keine Änderungen, nur «stand» aktualisiert');
  console.log('Danach: node --test (im Hauptordner) und den Diff von preise.js prüfen.');
}

const argv = process.argv.slice(2), doWrite = argv.includes('--schreiben');
const [cmd, ...args] = argv.filter(a => a !== '--schreiben');
const ctx = await chromium.launchPersistentContext(here('./.jumbo-profile'), { channel:'chrome', headless:false, viewport:null });
const page = ctx.pages()[0] || await ctx.newPage();
try {
  if (cmd === 'suche') await search(page, args);
  else {
    const rows = await prices(page, cmd ? [cmd, ...args] : Object.keys(SOURCES));
    if (doWrite) write(rows);
  }
} finally {
  await ctx.close();
}
