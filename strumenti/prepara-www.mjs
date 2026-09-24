// Prepara la cartella "www" delle app (Android, Windows, Mac): una copia del gioco web,
// così le app funzionano anche senza rete.
//
//   node strumenti/prepara-www.mjs android     -> android/app/src/main/assets/www
//   node strumenti/prepara-www.mjs desktop     -> desktop/www
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEST = { android: 'android/app/src/main/assets/www', desktop: 'desktop/www' };
const dove = process.argv[2];
if (!DEST[dove]) { console.error('uso: node strumenti/prepara-www.mjs android|desktop'); process.exit(1); }
const WWW = path.join(ROOT, DEST[dove]);
fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW, { recursive: true });
for (const f of ['index.html', 'daprod-lira.js', 'manifest.webmanifest', 'css', 'js', 'img', 'LICENSE']) {
  const da = path.join(ROOT, f);
  if (!fs.existsSync(da)) { console.error('manca', f); process.exit(1); }
  fs.cpSync(da, path.join(WWW, f), { recursive: true });
}
const html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
const v = (html.match(/const VERSIONE = '(v[0-9.]+)'/) || [])[1];
if (!v) { console.error('VERSIONE non trovata in index.html'); process.exit(1); }
console.log('gioco', v, 'pronto in', path.relative(ROOT, WWW));
