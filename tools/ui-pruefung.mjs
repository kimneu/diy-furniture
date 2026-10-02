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
  // a2: Mobile-Native-Paket – Kopf-Tags, Icons, Manifest, 16-px-Eingaben mit passender Tastatur, Touch-Feinheiten, Ortsknöpfe, Querformat, Namensfeld der Sammlung.
  a2: async (ctx) => {
    const page = await ctx.handy();
    await ctx.oeffne(page, 'entwerfen', { erst: true });
    await page.evaluate(() => { const w = document.querySelector('#wahl'); if (w.open) w.querySelector('[data-kind="sideboard"]').click(); });

    // Kopf: theme-color, color-scheme, Icons, Manifest
    const kopf = await page.evaluate(async () => {
      const breite = async (src) => { if (!src) return 0; const i = new Image(); i.src = src; try { await i.decode(); } catch (e) {} return i.naturalWidth; };
      const link = document.querySelector('link[rel="manifest"]');
      const r = link ? await fetch(link.href) : null;
      const man = r && r.ok ? await r.json() : null;
      const icons = [];
      for (const i of man?.icons || []) icons.push((await fetch(new URL(i.src, link.href))).status);
      // Patchright bricht jede Anfrage ab, deren URL auf «/favicon.ico» endet (Failed to fetch); die Query umgeht das, der Server liefert dieselbe Datei.
      const ico = await fetch('favicon.ico?pruefung');
      const b = ico.ok ? new Uint8Array(await ico.arrayBuffer()) : new Uint8Array(0);
      return {
        theme: [...document.querySelectorAll('meta[name="theme-color"]')].map(m => `${m.media}=${m.content}`).sort().join(' '),
        schema: document.querySelector('meta[name="color-scheme"]')?.content,
        icon: [...document.querySelectorAll('link[rel="icon"]')].map(l => l.getAttribute('href')).join(' '),
        ico: `${ico.status} ${[...b.slice(0, 4)].join(',')}`,
        png: [await breite(document.querySelector('link[rel="apple-touch-icon"]')?.href), await breite('icon-192.png'), await breite('icon-512.png')].join('/'),
        man, icons,
        quelle: await (await fetch(location.pathname)).text(),
      };
    });
    ctx.pruefe(kopf.theme === '(prefers-color-scheme: dark)=#131A1C (prefers-color-scheme: light)=#EDF0EE', `theme-color hell/dunkel (${kopf.theme || '–'})`);
    ctx.pruefe(kopf.schema === 'light dark', 'meta color-scheme «light dark»');
    ctx.pruefe(kopf.icon === 'favicon.ico icon.svg', `link rel=icon favicon.ico + icon.svg (${kopf.icon || '–'})`);
    ctx.pruefe(kopf.ico === '200 0,0,1,0', `favicon.ico lädt, ICO-Kopf (${kopf.ico})`);
    ctx.pruefe(kopf.png === '180/192/512', `PNG-Icons 180/192/512 (${kopf.png})`);
    ctx.pruefe(kopf.man?.name === 'Martylko' && kopf.man.short_name === 'Martylko' && kopf.man.display === 'standalone' && kopf.man.start_url === './', 'Manifest lädt: Martylko, standalone, start_url ./');
    ctx.pruefe(kopf.icons.length === 3 && kopf.icons.every(s => s === 200), `Manifest-Icons laden (${kopf.icons.join(',') || '–'})`);
    const ohne = (kopf.quelle.match(/(?<!-webkit-)backdrop-filter:/g) || []).length;
    const mit = (kopf.quelle.match(/-webkit-backdrop-filter:/g) || []).length;
    ctx.pruefe(ohne > 0 && mit === ohne, `-webkit-backdrop-filter vor jedem backdrop-filter (${mit}/${ohne})`);

    // Eingaben: kein Fokus-Zoom, passende Tastatur
    const ein = await page.evaluate(() => {
      const px = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
      return {
        w: px('#w'), select: px('#mat'),
        ohne: [...document.querySelectorAll('input[type="number"]')].filter(i => !i.inputMode).map(i => i.id),
        kerf: document.querySelector('#kerf').inputMode,
      };
    });
    ctx.pruefe(ein.w >= 16 && ein.select >= 16, `Eingaben ≥ 16 px (#w ${ein.w}, select ${ein.select})`);
    ctx.pruefe(!ein.ohne.length, `inputmode an allen Zahlfeldern (fehlt: ${ein.ohne.join(',') || '–'})`);
    ctx.pruefe(ein.kerf === 'decimal', '#kerf inputmode decimal');

    // Touch: kein Tap-Blitz, Trefferhöhe, Übergang, Auswahl, Overscroll
    const touch = await page.evaluate(() => {
      const cs = (sel) => getComputedStyle(document.querySelector(sel));
      return {
        blitz: ['html', '.mnav button', '.wahlbtn', '.lock', '.gh', '.linkbtn']
          .filter(s => document.querySelector(s) && cs(s).getPropertyValue('-webkit-tap-highlight-color') !== 'rgba(0, 0, 0, 0)'),
        hoehen: [...document.querySelectorAll('.mnav button')].map(b => Math.round(b.getBoundingClientRect().height)),
        uebergang: cs('.mnav button').transitionProperty,
        auswahl: ['.mnav button', '.wahlbtn', '.gh', 'body'].map(s => cs(s).getPropertyValue('user-select')).join('/'),
        scroll: `${cs('html').overscrollBehaviorY}/${cs('html').overscrollBehaviorX}/${cs('.controls').overscrollBehaviorY}`,
      };
    });
    ctx.pruefe(!touch.blitz.length, `Tap-Highlight transparent (blitzt: ${touch.blitz.join(', ') || '–'})`);
    ctx.pruefe(touch.hoehen.length === 4 && touch.hoehen.every(h => h >= 44 && h <= 48), `Ortsknöpfe 44 px (${touch.hoehen.join('/')})`);
    ctx.pruefe(touch.uebergang === 'color, background-color, transform', `Ortsknopf-Übergang (${touch.uebergang})`);
    ctx.pruefe(touch.auswahl === 'none/none/none/auto', `user-select auf Bedienelementen, nicht auf body (${touch.auswahl})`);
    ctx.pruefe(touch.scroll === 'none/auto/contain', `overscroll html y none, x auto, .controls contain (${touch.scroll})`);

    // Ortsknopf-Zustände per DevTools-Protokoll erzwingen
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.mnav button' });
    const zustand = async (pseudo) => {
      await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: pseudo });
      await page.waitForTimeout(250); // Übergang 160 ms auslaufen lassen
      return page.evaluate(() => { const s = getComputedStyle(document.querySelector('.mnav button')); return `${s.transform} ${s.outlineStyle} ${s.outlineOffset}`; });
    };
    ctx.pruefe((await zustand(['active'])).startsWith('matrix(0.97, 0, 0, 0.97, 0, 0)'), 'Ortsknopf :active scale(.97)');
    ctx.pruefe((await zustand(['focus-visible'])).endsWith('solid -2px'), 'Ortsknopf :focus-visible Ring innen');
    await zustand([]);
    await cdp.detach();

    // Farbschema und Querformat
    await page.emulateMedia({ colorScheme: 'dark' });
    const dunkel = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    await page.emulateMedia({ colorScheme: 'light' });
    const hell = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    ctx.pruefe(dunkel === 'dark' && hell === 'light', `color-scheme folgt System (${hell}/${dunkel})`);
    const lage = () => page.evaluate(() => getComputedStyle(document.querySelector('.viewer')).position);
    await page.setViewportSize({ width: 844, height: 390 });
    const quer = await lage();
    await page.setViewportSize({ width: 390, height: 844 });
    const hoch = await lage();
    ctx.pruefe(quer === 'static' && hoch === 'sticky', `Bühne quer static, hoch sticky (${quer}/${hoch})`);

    // Namensfeld der Sammlung: 16 px, «Fertig»-Taste, Enter speichert und schliesst
    await page.evaluate(() => { document.querySelector('.js-sammeln').click(); location.hash = 'sammlung'; });
    const name = page.locator('#collList input').first();
    await name.waitFor();
    const nf = await name.evaluate(i => ({ hint: i.enterKeyHint, px: parseFloat(getComputedStyle(i).fontSize) }));
    await name.fill('Prüfung Enter');
    await name.press('Enter');
    const nach = await page.evaluate(() => ({
      fokus: !!document.activeElement?.matches('#collList input'),
      gespeichert: JSON.parse(localStorage.getItem('sideboard-werkbank-v2-sammlung') || '[]').some(e => e.name === 'Prüfung Enter'),
    }));
    ctx.pruefe(nf.hint === 'done' && nf.px >= 16, `Namensfeld enterkeyhint done, ${nf.px} px`);
    ctx.pruefe(!nach.fokus && nach.gespeichert, `Enter im Namensfeld: Tastatur zu, Name gespeichert (${JSON.stringify(nach)})`);
    await ctx.screenshot(page, 'a2-handy-sammlung');
    await page.close();
  },
  // a3: Kopf eine Zeile, Steckbrief unter der Bühne (Handy) bzw. im Kopf (Desktop), Masse beschriftet, Leiste mit Preis-Blitz, Meldungs-Blende und Aufschlüsselung, Reduit ohne Querscrollen.
  a3: async (ctx) => {
    const waehle = async (page, kind) => {
      if (!(await page.evaluate(() => document.querySelector('#wahl').open))) await page.click('#bKind');
      await page.click(`#wahl .wahlbtn[data-kind="${kind}"]`);
      await page.waitForFunction(k => !document.querySelector('#wahl').open && document.querySelector('#kind').value === k, kind);
    };
    const hoehe = (page, sel) => page.evaluate(s => document.querySelector(s).getBoundingClientRect().height, sel);
    const text = (page, sel) => page.evaluate(s => document.querySelector(s)?.textContent.trim() ?? '', sel);
    const sichtbar = (page, sel) => page.locator(sel).first().isVisible();
    const binnen = (page, fn, ms) => page.waitForFunction(fn, null, { timeout:ms }).then(() => true, () => false);

    // Handy, Sideboard
    const h = await ctx.handy();
    await ctx.oeffne(h, 'entwerfen', { erst:true });
    await waehle(h, 'sideboard');
    ctx.pruefe(await hoehe(h, 'header.top') <= 64, 'Handy: Kopf höchstens 64 px hoch');
    ctx.pruefe(await h.locator('#summary, .brand p').count() === 0, 'Handy: dl.summary und Untertitel entfernt');
    ctx.pruefe(await sichtbar(h, '#steckbrief') && (await text(h, '#steckbrief .sb-was')).includes('Teile'), 'Handy: Steckbrief unter der Bühne nennt die Teile');
    ctx.pruefe(await text(h, '#steckbrief .sb-zustand') === 'Entwurf', 'Handy: Zustand «Entwurf» ohne geladene Variante');
    ctx.pruefe(/^B \d+ · H \d+ · T \d+ mm$/.test(await text(h, '#dimTag')), 'Handy: Masstafel Sideboard «B … · H … · T … mm»');
    const stage = await hoehe(h, '#stage');
    ctx.pruefe(stage >= 200 && stage <= 0.3 * 844 + 1, 'Handy: Bühne 30 svh, mindestens 200 px');
    ctx.pruefe(await h.locator('.mbar .btn:not(.ghost):visible').count() === 1, 'Handy: genau ein gefüllter Knopf in der Leiste (Sammeln)');
    await h.evaluate(() => document.querySelector('#mMeta')?.click());
    ctx.pruefe(await h.evaluate(() => document.querySelector('#aufschl')?.matches(':popover-open') ?? false), 'Handy: ▸ öffnet die Aufschlüsselung');
    ctx.pruefe((await text(h, '#aufschl')).includes('Ohne Beschläge'), 'Handy: Aufschlüsselung Sideboard «Ohne Beschläge»');
    ctx.pruefe(await h.evaluate(() => { const a = document.querySelector('#aufschl'); return !!a && a.getBoundingClientRect().bottom <= document.querySelector('#mbar').getBoundingClientRect().top; }), 'Handy: Aufschlüsselung liegt über der Leiste');
    await ctx.screenshot(h, 'a3-handy-aufschluesselung');
    await h.evaluate(() => document.querySelector('#aufschl')?.hidePopover?.());
    // Preis-Blitz: Breite ändern; .blitz sofort da, danach wieder weg
    const blitz = await h.evaluate(() => {
      const w = document.querySelector('#w'), vorher = document.querySelector('#mPrice').textContent;
      w.value = String(Number(w.value) + 400); w.dispatchEvent(new Event('input', { bubbles:true }));
      const p = document.querySelector('#mPrice');
      return { an: p.classList.contains('blitz'), anders: p.textContent !== vorher };
    });
    ctx.pruefe(blitz.an && blitz.anders, 'Handy: Preis blitzt bei Preisänderung (.blitz)');
    ctx.pruefe(await binnen(h, () => !document.querySelector('#mPrice').classList.contains('blitz'), 1000), 'Handy: .blitz nach 300 ms entfernt');
    // Meldung als Blende über der Meta-Zeile, Leistenhöhe bleibt
    const leiste = await hoehe(h, '#mbar');
    await h.evaluate(() => document.querySelector('#bZufall').click());
    ctx.pruefe(await binnen(h, () => { const m = document.querySelector('.mbar .js-msg'), meta = document.querySelector('#mMeta');
      return m.classList.contains('an') && m.textContent.includes('gewürfelt') && Number(getComputedStyle(m).opacity) > 0.9 && Number(getComputedStyle(meta).opacity) < 0.1; }, 1500),
      'Handy: Meldung blendet über die Meta-Zeile');
    ctx.pruefe(Math.abs(await hoehe(h, '#mbar') - leiste) < 1, 'Handy: Leistenhöhe während der Meldung unverändert');
    await ctx.screenshot(h, 'a3-handy-meldung');
    // Sammeln/Link nur in Entwerfen
    ctx.pruefe(await sichtbar(h, '.mbar .js-sammeln') && await sichtbar(h, '.mbar .js-link'), 'Handy: Sammeln und Link in Entwerfen sichtbar');
    await h.evaluate(() => { location.hash = 'einkaufen'; });
    await h.waitForFunction(() => document.body.dataset.ort === 'einkaufen');
    ctx.pruefe(!(await sichtbar(h, '.mbar .js-sammeln')) && !(await sichtbar(h, '.mbar .js-link')), 'Handy: in Einkaufen kein Sammeln/Link in der Leiste');
    ctx.pruefe(await sichtbar(h, '#mPrice'), 'Handy: Preis in Einkaufen sichtbar');

    // Handy, Reduit
    await h.evaluate(() => { location.hash = 'entwerfen'; });
    await h.waitForFunction(() => document.body.dataset.ort === 'entwerfen');
    await waehle(h, 'reduit');
    ctx.pruefe(/^Raum B \d+ · T \d+ · H \d+ mm$/.test(await text(h, '#dimTag')), 'Handy: Masstafel Reduit «Raum B … · T … · H … mm»');
    ctx.pruefe(await h.evaluate(() => document.scrollingElement.scrollWidth) <= 390, 'Handy: Reduit ohne horizontalen Überlauf');
    ctx.pruefe(await hoehe(h, 'header.top') <= 64, 'Handy: Kopf beim Reduit höchstens 64 px hoch');
    await h.evaluate(() => document.querySelector('#mMeta')?.click());
    const aufR = await text(h, '#aufschl');
    ctx.pruefe(aufR.includes('Kaufteile') && !aufR.includes('Ohne Beschläge'), 'Handy: Aufschlüsselung Reduit mit Kaufteile, ohne Beschläge-Hinweis');
    await h.evaluate(() => document.querySelector('#aufschl')?.hidePopover?.());
    await ctx.screenshot(h, 'a3-handy-reduit');

    // Desktop
    const d = await ctx.desktop();
    await ctx.oeffne(d, 'entwerfen', { erst:true });
    await waehle(d, 'sideboard');
    ctx.pruefe(await hoehe(d, 'header.top') <= 64, 'Desktop: Kopf eine Zeile, höchstens 64 px');
    ctx.pruefe(await sichtbar(d, '.top .kopfbrief') && (await text(d, '.top .kopfbrief')).includes('Teile'), 'Desktop: Steckbrief im Kopf');
    ctx.pruefe(await d.locator('#steckbrief').count() === 1 && !(await sichtbar(d, '#steckbrief')), 'Desktop: Steckbrief unter der Bühne vorhanden, aber ausgeblendet');
    ctx.pruefe(await d.locator('.top .btn:not(.ghost):visible').count() === 1, 'Desktop: genau ein gefüllter Knopf im Kopf (Sammeln)');
    ctx.pruefe(/^CHF \d+$/.test(await text(d, '#kPrice')), 'Desktop: Preis im Kopf');
    await ctx.screenshot(d, 'a3-desktop');
    // Zwischenbreite (Tablet quer, 921–1199 px): Kopf bleibt einzeilig, nichts läuft über
    await d.setViewportSize({ width:1000, height:800 });
    await d.waitForFunction(() => innerWidth === 1000);
    ctx.pruefe(await hoehe(d, 'header.top') <= 64 && await d.evaluate(() => document.scrollingElement.scrollWidth) <= 1000 && await sichtbar(d, '.top .kopfbrief'),
      'Zwischenbreite 1000 px: Kopf eine Zeile mit Steckbrief, kein Überlauf');
    await ctx.screenshot(d, 'a3-zwischenbreite');
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
