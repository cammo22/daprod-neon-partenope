// Disegna le icone del gioco (web, PWA, app desktop) partendo dall'emblema vettoriale.
//
//   node strumenti/icone.mjs
//
// Serve Playwright (Chromium): npm i --no-save playwright && npx playwright install chromium
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const EMBLEMA = (lato, margine) => `<!doctype html><html><body style="margin:0;background:transparent">
<svg xmlns="http://www.w3.org/2000/svg" width="${lato}" height="${lato}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3df2"/><stop offset="1" stop-color="#35e8ff"/></linearGradient>
    <radialGradient id="f" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#2a0f45"/><stop offset="1" stop-color="#07041a"/></radialGradient>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".6" stop-color="#ff8ad8"/><stop offset="1" stop-color="#ff3df2"/></linearGradient>
  </defs>
  <g transform="translate(${margine} ${margine}) scale(${(64 - 2 * margine) / 64})">
    <rect x="1" y="1" width="62" height="62" rx="14" fill="url(#f)" stroke="url(#m)" stroke-width="2.5"/>
    <circle cx="44" cy="24" r="10" fill="url(#s)"/>
    <g fill="#07041a"><rect x="33" y="26" width="22" height="1.3"/><rect x="33" y="29" width="22" height="1.8"/><rect x="33" y="32.5" width="22" height="2.2"/></g>
    <path d="M6 46 L20 31 L25 35 L31 23 L38 23 L44 34 L58 46 Z" fill="#150a28" stroke="#ff3df2" stroke-width="1.6" stroke-linejoin="round"/>
    <ellipse cx="34.5" cy="23" rx="4" ry="1.6" fill="#ff5a1f"/>
    <path d="M32 23 q-2 -8 3 -12 q-1 6 3 8" fill="none" stroke="#ffd54a" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M6 49 H58" stroke="#35e8ff" stroke-width="2"/>
    <path d="M10 53 H54 M16 57 H48" stroke="#35e8ff" stroke-width="1.2" opacity=".55"/>
  </g>
</svg></body></html>`;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
for (const [file, lato, margine] of [
  ['img/icona-192.png', 192, 0], ['img/icona-512.png', 512, 0], ['img/icona-maskable.png', 512, 7], ['desktop/build/icon.png', 1024, 0]
]) {
  await page.setViewportSize({ width: lato, height: lato });
  await page.setContent(EMBLEMA(lato, margine));
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  await page.locator('svg').screenshot({ path: path.join(ROOT, file), omitBackground: true });
  console.log('✔', file);
}
await browser.close();
