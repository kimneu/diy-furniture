/* App-Icons aus icon.svg rendern: apple-touch-icon.png (180), icon-192.png, icon-512.png und favicon.ico (32 px)
   ins Repo-Root. Einmalig nach einer Änderung an icon.svg ausführen; die Bilder werden mit committet.

   Einrichten:  cd tools && npm install
   Aufruf:      node tools/icons.mjs              (ohne Argumente)

   Je Grösse eine Seite mit Viewport px×px, das SVG füllt sie, Screenshot mit deviceScaleFactor 1.
   favicon.ico ist ein ICO-Container mit einem einzigen 32-px-PNG. */
import { chromium } from 'patchright';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const svg = await readFile(root + 'icon.svg', 'utf8');
const browser = await chromium.launch({ channel:'chrome', headless:true });

// PNG in px×px als Buffer
async function png(px) {
  const page = await browser.newPage({ viewport:{ width:px, height:px } });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${px}px;height:${px}px}</style>` + svg);
  const bild = await page.screenshot();
  await page.close();
  return bild;
}

try {
  for (const [datei, px] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await writeFile(root + datei, await png(px));
  }
  const p32 = await png(32);               // Buffer aus page.screenshot()
  const kopf = Buffer.alloc(22);           // 6 Byte ICONDIR + 16 Byte ICONDIRENTRY
  kopf.writeUInt16LE(1, 2); kopf.writeUInt16LE(1, 4);          // Typ 1 = Icon, 1 Bild
  kopf.writeUInt8(32, 6); kopf.writeUInt8(32, 7);              // 32 × 32
  kopf.writeUInt16LE(1, 10); kopf.writeUInt16LE(32, 12);       // 1 Ebene, 32 Bit
  kopf.writeUInt32LE(p32.length, 14); kopf.writeUInt32LE(22, 18); // Länge, Offset
  await writeFile(root + 'favicon.ico', Buffer.concat([kopf, p32]));
} finally {
  await browser.close();
}
