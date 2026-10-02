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
  // a3: Kopf eine Zeile, Steckbrief unter der Bühne (Handy) bzw. im Kopf (Desktop), Masse beschriftet, Leiste mit Preis-Blitz, Meldungs-Blende und Aufschlüsselung, Reduit ohne Querscrollen, Zustand «geändert» ohne Umbruch.
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
    // Zustand «geändert»: Entwurf über den Knopf sel sammeln, dann die Breite ändern; true, sobald der Knopf «Neue Variante» heisst.
    const aendern = async (page, sel) => {
      await page.evaluate(s => document.querySelector(s).click(), sel);
      await page.waitForFunction(s => document.querySelector(s).textContent === 'Gesammelt ✓', sel, { timeout:3000 }).catch(() => {});
      await page.evaluate(() => { const w = document.querySelector('#w'); w.value = String(Number(w.value) + 400); w.dispatchEvent(new Event('input', { bubbles:true })); });
      return page.waitForFunction(s => document.querySelector(s).textContent === 'Neue Variante', sel, { timeout:3000 }).then(() => true, () => false);
    };
    const kopfMass = (page) => page.evaluate(() => ({ h: document.querySelector('header.top').getBoundingClientRect().height, brief: document.querySelector('.top .kopfbrief').getBoundingClientRect().width }));

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

    // Handy, Sideboard im Zustand «geändert»: Preis bleibt ganz sichtbar, Knöpfe überdecken ihn nicht
    const hg = await ctx.handy();
    await ctx.oeffne(hg, 'entwerfen', { erst:true });
    await waehle(hg, 'sideboard');
    ctx.pruefe(await aendern(hg, '.mbar .js-sammeln') && await hg.locator('.mbar .js-ueberschreiben, .top .js-ueberschreiben').count() === 0,
      'Handy geändert: Knopf «Neue Variante», kein Überschreiben in Kopf und Leiste');
    const lage = await hg.evaluate(() => {
      const p = document.querySelector('#mPrice').getBoundingClientRect(), b = document.querySelector('.mbar .mbtns').getBoundingClientRect();
      return { schnitt: p.left < b.right && b.left < p.right && p.top < b.bottom && b.top < p.bottom, links: p.left, rechts: p.right };
    });
    ctx.pruefe(!lage.schnitt, `Handy geändert: #mPrice und Knöpfe überschneiden sich nicht (Preis ${Math.round(lage.links)}–${Math.round(lage.rechts)})`);
    ctx.pruefe(lage.links >= 0 && lage.rechts <= 390, 'Handy geändert: #mPrice ganz im Bild');
    await ctx.screenshot(hg, 'a3-handy-geaendert');

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
    // Zustand «geändert» am Desktop: Kopf bleibt eine Zeile, der Steckbrief behält Platz
    await d.setViewportSize({ width:1440, height:900 });
    await d.waitForFunction(() => innerWidth === 1440);
    ctx.pruefe(await aendern(d, '.top .js-sammeln'), 'Desktop geändert: Knopf «Neue Variante»');
    for (const breite of [1440, 921]) {
      await d.setViewportSize({ width:breite, height:800 });
      await d.waitForFunction(b => innerWidth === b, breite);
      const k = await kopfMass(d);
      ctx.pruefe(k.h <= 64 && k.brief >= 120, `Desktop geändert ${breite} px: Kopf höchstens 64 px, Steckbrief mindestens 120 px breit (${k.h} px, ${Math.round(k.brief)} px)`);
      await ctx.screenshot(d, `a3-desktop-geaendert-${breite}`);
    }
  },
  // a4: Erstbesuch ohne Pflichtdialog (Beispiel sichtbar), Möbel-Wahl als Sheet am Handy und mittig am Desktop, Wahl führt nach Entwerfen, Link-Meldungen beim Erstbesuch.
  a4: async (ctx) => {
    // planCode wie in test/link.test.js aus den Rechen-Dateien (die Seite ist nur über eine isolierte Welt erreichbar).
    const req = (await import('node:module')).createRequire(import.meta.url);
    Object.assign(globalThis, req('../shared.js'));
    Object.assign(globalThis, req('../sideboard.js'), req('../reduit.js'));
    const { planCode, startwerte } = req('../konfig.js');
    const offen = pg => pg.locator('dialog[open]').count();
    const box = pg => pg.evaluate(() => { const b = document.querySelector('#wahl').getBoundingClientRect(); return { bottom:b.bottom, width:b.width, vh:innerHeight, vw:innerWidth }; });
    // Warten per Abfrage: patchright-Wartefunktionen bleiben nach history.back() + Hash-Wechsel hängen.
    const warte = async (pg, fn) => { for (let i = 0; i < 30; i++, await pg.waitForTimeout(100)) { const v = await pg.evaluate(fn); if (v) return v; } return ''; };
    // Fehler der Seite über ctx.fehler (Init-Script plus Netzfehler); patchright meldet kein «pageerror».
    const ohneFehler = async (pg, text) => { const f = await ctx.fehler(pg); ctx.pruefe(f.length === 0, text + (f.length ? ': ' + f.join(' | ') : '')); };
    // Handy, Erstbesuch: kein Dialog, Beispiel sichtbar
    const p = await ctx.handy();
    await ctx.oeffne(p, '', { erst:true });
    ctx.pruefe(await offen(p) === 0, 'Erstbesuch Handy: kein Dialog offen');
    ctx.pruefe(await p.locator('#w').isVisible(), 'Erstbesuch Handy: Breite (#w) sichtbar');
    await ctx.screenshot(p, 'a4-erstbesuch-handy');
    if (await offen(p)) { ctx.pruefe(false, 'übrige Prüfungen übersprungen: der Pflichtdialog sperrt die Seite'); return; }
    // Sheet von unten, geöffnet aus Einkaufen
    await p.evaluate(() => { location.hash = 'einkaufen'; });
    await p.waitForSelector('body[data-ort="einkaufen"]');
    await p.tap('#bKind');
    await p.waitForSelector('dialog.wahl[open]');
    await p.waitForTimeout(350);
    const r = await box(p);
    ctx.pruefe(Math.abs(r.bottom - r.vh) <= 2 && r.width >= r.vw - 2, `Sheet unten, volle Breite (unten ${Math.round(r.bottom)}/${r.vh}, Breite ${Math.round(r.width)}/${r.vw})`);
    ctx.pruefe(await p.locator('#wahlZu').isVisible(), 'Sheet: «Schliessen» sichtbar');
    ctx.pruefe(await p.locator('.wahlsatz').textContent() === 'Masse eingeben – Einkaufsliste, Teile und Bauablauf erhalten.', 'Sheet: Satz unter dem Titel');
    ctx.pruefe(/^Dein Entwurf · ca\. CHF \d+$/.test(await p.locator('[data-zuletzt="sideboard"]').textContent()), 'Karte Sideboard: «Dein Entwurf · ca. CHF …»');
    ctx.pruefe(/^ab ca\. CHF \d+$/.test(await p.locator('[data-zuletzt="reduit"]').textContent()), 'Karte Reduit: «ab ca. CHF …» schon beim Erstbesuch');
    await ctx.screenshot(p, 'a4-sheet-handy');
    // Backdrop-Tipp schliesst, Ort bleibt
    await p.touchscreen.tap(195, 40);
    ctx.pruefe(await warte(p, () => !document.querySelector('#wahl').open && location.hash === '#einkaufen'), 'Backdrop-Tipp schliesst, Ort bleibt Einkaufen');
    // Wahl führt nach Entwerfen
    await p.waitForTimeout(200);
    await p.tap('#bKind');
    await p.waitForSelector('dialog.wahl[open]');
    await p.tap('.wahlbtn[data-kind="reduit"]');
    ctx.pruefe(await warte(p, () => location.hash === '#entwerfen' && !document.querySelector('#wahl').open), 'Wahl Reduit schliesst und führt nach #entwerfen');
    ctx.pruefe(await p.locator('#kindName').textContent() === 'Reduit', 'Möbel ist danach Reduit');
    await ohneFehler(p, 'Handy: keine Fehler auf der Seite');
    // Erstbesuch mit Link (ungültig, dann gültig)
    const q = await ctx.handy();
    await ctx.oeffne(q, 'entwerfen', { erst:true });
    const neuMitLink = async plan => {
      await q.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('sideboard-werkbank-v2')) localStorage.removeItem(k); });
      await q.goto(new URL(`/?plan=${plan}#entwerfen`, q.url()).href);
      await q.waitForSelector('form.ready', { state:'attached' });
    };
    const meldung = () => warte(q, () => { const m = [...document.querySelectorAll('.js-msg')].find(x => x.textContent && x.checkVisibility()); return m ? m.innerHTML : ''; });
    await neuMitLink('1kaputt');
    const m1 = await meldung();
    ctx.pruefe(m1 === 'Der Link ist ungültig – du siehst den Standard-Entwurf.', `ungültiger Link beim Erstbesuch: Meldung ohne Rückgängig (${m1})`);
    ctx.pruefe(await offen(q) === 0 && await q.locator('#kindName').textContent() === 'Sideboard', 'ungültiger Link: kein Dialog, Standard-Entwurf');
    await neuMitLink(await planCode({ kind:'reduit', bw:'R2', sys:'posts', mat:'fichtesp', t:'18', rw:'1800' }));
    const m2 = await meldung();
    ctx.pruefe(m2 === 'Entwurf von Link geladen.', `gültiger Link beim Erstbesuch: Meldung ohne Rückgängig (${m2})`);
    ctx.pruefe(await q.locator('#bwNotice').isHidden(), 'gültiger Link: kein Hinweis «Ältere Variante»');
    ctx.pruefe(await q.locator('#kindName').textContent() === 'Reduit' && await q.inputValue('#rw') === '1800', 'gültiger Link: geteilter Reduit-Entwurf geladen');
    await ohneFehler(q, 'Link: keine Fehler auf der Seite');
    // Desktop: kein Dialog beim Erstbesuch, Wahl mittig, Esc schliesst
    const d = await ctx.desktop();
    await ctx.oeffne(d, '', { erst:true });
    ctx.pruefe(await offen(d) === 0, 'Erstbesuch Desktop: kein Dialog offen');
    await d.click('#bKind');
    await d.waitForSelector('dialog.wahl[open]');
    await d.waitForTimeout(300);
    const rd = await box(d);
    ctx.pruefe(rd.bottom < rd.vh - 40 && rd.width <= 460, 'Desktop: Wahl mittig, höchstens 460 px breit');
    await ctx.screenshot(d, 'a4-wahl-desktop');
    await d.keyboard.press('Escape');
    ctx.pruefe(await warte(d, () => !document.querySelector('#wahl').open), 'Desktop: Esc schliesst die Wahl');
    // Reduzierte Bewegung: die Wahl öffnet ohne Gleiten (transform none), sichtbar innerhalb 500 ms
    const b = await ctx.handy();
    await ctx.oeffne(b, 'entwerfen', { erst:true });
    await b.emulateMedia({ reducedMotion:'reduce' });
    await b.tap('#bKind');
    const t0 = Date.now();
    let rm = null;
    while (Date.now() - t0 < 500) {
      rm = await b.evaluate(() => { const w = document.querySelector('dialog#wahl[open]'); if (!w) return null; const s = getComputedStyle(w), r = w.getBoundingClientRect();
        return { transform:s.transform, sichtbar: Number(s.opacity) > 0.9 && r.top < innerHeight && r.bottom <= innerHeight + 2 }; });
      if (rm && rm.sichtbar) break;
      await b.waitForTimeout(50);
    }
    ctx.pruefe(!!rm && rm.sichtbar && rm.transform === 'none', `reduzierte Bewegung – Wahl öffnet (${rm ? `transform ${rm.transform}, sichtbar ${rm.sichtbar}` : 'nicht offen'}, ${Date.now() - t0} ms)`);
    // Erstbesuch mit gültigem Reduit-Link aus den Startwerten (Formularwerte des Erstbesuchs als DEFAULTS)
    const e = await ctx.handy();
    await ctx.oeffne(e, 'entwerfen', { erst:true });
    const defaults = await e.evaluate(() => JSON.parse(localStorage.getItem('sideboard-werkbank-v2-entwuerfe')).sideboard);
    await ctx.oeffne(e, `?plan=${await planCode(startwerte(defaults, 'reduit'))}#entwerfen`, { erst:true });
    const geladen = await warte(e, () => document.querySelector('#kindName').textContent === 'Reduit');
    const tag = await e.evaluate(() => document.querySelector('#dimTag').textContent.trim());
    const fe = await ctx.fehler(e);
    ctx.pruefe(await offen(e) === 0 && !!geladen && tag.startsWith('Raum') && fe.length === 0,
      `Erstbesuch mit Reduit-Link (Dialog ${await offen(e)}, Möbel ${await e.locator('#kindName').textContent()}, Masstafel «${tag}»${fe.length ? ', Fehler: ' + fe.join(' | ') : ''})`);
  },
  // a5: Formular Stufe 1 – Masse zuerst, Aufteilung als eigene Gruppe, Zufall ans Ende unter «Mehr», Handy offen nur das Sichtbare, Bühne schrumpft bei Fokus auf ein Zahlenfeld, iPhone SE und alter Speicher.
  a5: async (ctx) => {
    const SB = ['Masse', 'Bauweise', 'Aufteilung', 'Aufbau im Detail', 'Front im Detail', 'Material', 'Platten & Preise', 'Zufall'];
    const RD = ['Raum', 'Bauweise', 'Form & Tablare', 'Tür', 'Tiefen & Abstände', 'Nische', 'Material', 'Platten & Preise', 'Zufall'];
    const OFFEN = ['Masse', 'Raum', 'Bauweise', 'Aufteilung', 'Form & Tablare'];
    const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const gruppen = p => p.$$eval('#cfg > .group', gs => gs.filter(g => g.checkVisibility())
      .map(g => ({ titel:g.querySelector(':scope > h2')?.textContent.trim() ?? '(ohne Titel)', zu:g.classList.contains('collapsed') })));
    const enthaelt = (p, sel, namen) => p.$eval(sel, (s, namen) => namen.every(n => s.querySelector(`[name="${n}"]`)), namen).catch(() => false);
    const istLetzte = (p, sel) => p.$eval(sel, e => e === e.parentElement.lastElementChild).catch(() => false);
    const hoehe = p => p.$eval('#stage', e => Math.round(e.getBoundingClientRect().height));
    const mitEntwurf = async (kind, extra) => {
      const p = await ctx.handy();
      await p.addInitScript(([kind, extra]) => localStorage.setItem('sideboard-werkbank-v2-entwuerfe',
        JSON.stringify({ kind, [kind]:{ kind, ...extra } })), [kind, extra]);
      await ctx.oeffne(p, 'entwerfen');
      return p;
    };

    // Handy, Sideboard, Erstbesuch
    let p = await ctx.handy();
    await ctx.oeffne(p, 'entwerfen', { erst:true });
    const w = await p.locator('#w').boundingBox();
    ctx.pruefe(w && w.y < 700, `Breite beim Erstbesuch ohne Scrollen (y ${w && Math.round(w.y)} < 700)`);
    let g = await gruppen(p);
    ctx.pruefe(gleich(g.map(x => x.titel), SB), `Gruppen Sideboard: ${g.map(x => x.titel).join(' · ')}`);
    ctx.pruefe(g.every(x => x.zu === !OFFEN.includes(x.titel)), 'Handy offen nur Masse, Bauweise, Aufteilung');
    ctx.pruefe(!(await p.$$eval('#cfg h2', hs => hs.some(h => h.textContent.trim() === 'Optik'))), 'keine Gruppe «Optik» mehr');
    ctx.pruefe(await istLetzte(p, '#row-room'), 'Einsatzort ist letzte Zeile von Masse');
    ctx.pruefe(await enthaelt(p, '#grp-aufteilung[data-lock="aufteilung"]', ['sections', 'front', 'base']), 'Aufteilung mit Fächern, Türen, Untergestell');
    ctx.pruefe(await istLetzte(p, '#grp-zufall') && await p.$eval('#grp-zufall', s => !!s.querySelector('#bZufall')
      && s.querySelector('.hint').textContent.trim() === 'Festgehaltene Gruppen bleiben beim Würfeln, wie sie sind.').catch(() => false),
      'Zufall als letzte Gruppe mit Knopf und kurzem Hinweis');
    ctx.pruefe(await p.$eval('#mehr', m => m.nextElementSibling.querySelector(':scope > h2').textContent.trim() === 'Platten & Preise').catch(() => false),
      '«Mehr» steht direkt vor Platten & Preise');
    await ctx.screenshot(p, 'a5-handy-sideboard');

    // Bühne schrumpft nur bei Fokus auf ein Zahlenfeld (Entwurf vorgeladen: kein Dialog, fester Zustand)
    await p.close();
    p = await mitEntwurf('sideboard', { bw:'S1' });
    const vorher = await hoehe(p);
    await p.focus('#w');
    const fokus = await hoehe(p);
    ctx.pruefe(fokus <= 130, `Bühne bei Fokus auf Breite ${fokus} px (≤ 130, vorher ${vorher})`);
    await p.focus('#w-r');
    ctx.pruefe(await hoehe(p) === vorher, 'Bühne bleibt beim Regler gross');
    await p.$eval('#w-r', e => e.blur());
    ctx.pruefe(await hoehe(p) === vorher, 'Bühne nach dem Verlassen wieder gross');

    // «Front im Detail» weg, solange die Fächer offen sind
    await p.click('label[for="fr-open"]', { timeout:2000 }).catch(() => {});
    ctx.pruefe(await p.$eval('#grp-front', s => s.hidden).catch(() => false), '«Front im Detail» weg bei offenen Fächern');
    await p.click('label[for="fr-hinged"]', { timeout:2000 }).catch(() => {});
    ctx.pruefe(await p.$eval('#grp-front', s => !s.hidden).catch(() => false), '«Front im Detail» zurück bei Drehtüren');

    // Handy, Reduit
    await p.close();
    p = await mitEntwurf('reduit', { bw:'R2', sys:'posts', mat:'fichtesp', t:'18' });
    const rw = await p.locator('#rw').boundingBox();
    ctx.pruefe(rw && rw.y < 700, `Raumbreite ohne Scrollen (y ${rw && Math.round(rw.y)} < 700)`);
    g = await gruppen(p);
    ctx.pruefe(gleich(g.map(x => x.titel), RD), `Gruppen Reduit: ${g.map(x => x.titel).join(' · ')}`);
    ctx.pruefe(g.every(x => x.zu === !OFFEN.includes(x.titel)), 'Handy offen nur Raum, Bauweise, Form & Tablare');
    ctx.pruefe(await p.$eval('#wall-solid', i => { const f = i.closest('.field'); return f === f.parentElement.lastElementChild; }).catch(() => false),
      'Wände sind letzte Zeile von Raum');
    ctx.pruefe(await enthaelt(p, '#grp-tuer', ['doorW', 'doorH', 'doorPos', 'doorOff', 'doorIn', 'hinge']), 'Tür mit Breite, Höhe, Lage, Abstand, innen, Band');
    ctx.pruefe(await enthaelt(p, '#cfg > .group[data-lock="form"]', ['shape', 'corner', 'nShelves']), 'Form & Tablare mit Form, Ecke, Anzahl');
    ctx.pruefe(await enthaelt(p, '#grp-tiefen[data-lock="tablare"]', ['dBack', 'dLeft', 'dRight', 'gapBottom', 'gapTop'])
      && await p.$eval('#grp-tiefen', s => !!s.querySelector('#depthHint')).catch(() => false), 'Tiefen & Abstände mit allen Tiefen und Tiefenhinweis');
    await ctx.screenshot(p, 'a5-handy-reduit');

    // Desktop: gleiche Reihenfolge, alles offen
    await p.close();
    p = await ctx.desktop();
    await ctx.oeffne(p, 'entwerfen', { erst:true });
    g = await gruppen(p);
    ctx.pruefe(gleich(g.map(x => x.titel), SB) && g.every(x => !x.zu), 'Desktop gleiche Reihenfolge, alle Gruppen offen');

    // iPhone SE (375×667), Erstbesuch: die Breite liegt ganz über der Leiste (etwa 134 px, 150 px Reserve)
    await p.close();
    p = await ctx.handy();
    await p.setViewportSize({ width:375, height:667 });
    await ctx.oeffne(p, 'entwerfen', { erst:true });
    const se = await p.locator('#w').boundingBox();
    ctx.pruefe(se && se.y + se.height < 667 - 150, `SE 375×667 – Breite über dem Falz (unten ${se && Math.round(se.y + se.height)} < ${667 - 150})`);
    await ctx.screenshot(p, 'a5-handy-se');

    // Alter Speicher: Schlösser «aufbau» und «front» von vor A5, Entwurf im Format { kind, sideboard:{…} }
    await p.close();
    p = await ctx.handy();
    await p.addInitScript(() => {
      localStorage.setItem('sideboard-werkbank-v2-schloss', JSON.stringify(['aufbau', 'front']));
      localStorage.setItem('sideboard-werkbank-v2-entwuerfe', JSON.stringify({ kind:'sideboard',
        sideboard:{ kind:'sideboard', bw:'S1', sections:'3', front:'hinged', base:'legs', top:'between', shelves:'2', handle:'knob', color:'salbei' } }));
    });
    await ctx.oeffne(p, 'entwerfen');
    const fl = await ctx.fehler(p);
    g = await gruppen(p);
    // Zufall ist am Handy zugeklappt: erst aufklappen, dann würfeln. Würfeln samt 3D-Neuaufbau braucht in SwiftShader mehr als 2 s.
    await p.click('#grp-zufall .gh', { timeout:5000 }).catch(() => {});
    const geklickt = await p.click('#bZufall', { timeout:10000 }).then(() => true, () => false);
    const gewuerfelt = geklickt && await p.waitForFunction(() => [...document.querySelectorAll('.js-msg')].some(m => m.textContent.includes('gewürfelt')), null, { timeout:5000 }).then(() => true, () => false);
    const fz = await ctx.fehler(p);
    ctx.pruefe(!fl.length && !fz.length && gleich(g.map(x => x.titel), SB) && gewuerfelt,
      `alter Speicher lädt ohne Fehler (Gruppen ${g.map(x => x.titel).join(' · ')}; Zufall ${gewuerfelt ? 'würfelt' : geklickt ? 'ohne Meldung' : 'nicht klickbar'}${[...fl, ...fz].length ? '; Fehler: ' + [...fl, ...fz].join(' | ') : ''})`);
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
