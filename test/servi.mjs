// Piccolo server statico per le prove: serve la cartella del gioco (nessuna dipendenza).
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// fileURLToPath e non .pathname: su Windows .pathname dà /C:/... e il server non trova i file.
export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

export async function avviaServer(porta = 8100 + Math.floor(Math.random() * 800)) {
  const server = http.createServer((req, res) => {
    let f = decodeURIComponent(req.url.split('?')[0]);
    if (f.endsWith('/')) f += 'index.html';
    const p = path.join(ROOT, f);
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('no'); }
    res.writeHead(200, { 'content-type': TIPI[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(fs.readFileSync(p));
  });
  await new Promise(r => server.listen(porta, '127.0.0.1', r));
  return { server, url: `http://127.0.0.1:${porta}/index.html` };
}
