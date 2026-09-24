// Foto del gioco, per guardare come viene dopo una modifica grafica.
//
//   node test/foto.mjs [nome]
//
// Apre il gioco in Chromium headless su computer e telefono, gioca un po' da solo (stanza 34,
// quartiere avviato, un boss) e salva in test/.out/ le schermate principali.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { avviaServer, ROOT } from './servi.mjs';

const OUT = path.join(ROOT, 'test', '.out');
fs.mkdirSync(OUT, { recursive: true });
const nome = process.argv[2] || 'gioco';
const { server, url } = await avviaServer();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const [suff, opz] of [['', { viewport: { width: 1440, height: 900 } }],
                           ['-telefono', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const ctx = await browser.newContext(opz);
  await ctx.route(/api\.github\.com/, r => r.abort());
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', e => errori.push(String(e)));
  await page.goto(url);
  await page.waitForFunction(() => window.NP && NP.pronto, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, `${nome}-intro${suff}.png`) });
  await page.click('#introGioca');
  await page.evaluate(() => {
    const S = NP.S;
    S.opz.notifiche = false;
    S.lire = 5e7; S.rottami = 800; S.biglietti = 12;
    for (const [id, n] of [['aut', 60], ['lav', 45], ['bar', 30], ['pacc', 22], ['mec', 12], ['pesc', 4]]) S.gen[id] = n;
    S.braccio = 90; S.up.push('cv1', 'cv2', 'cv3', 'pu1', 'pu2', 'uc1', 'uhp1'); S.automi.ab1 = 20; S.automi.ab2 = 8;
    S.stat.multi = 4; S.maxStanza = 34; NP.cambiaStanza(34); S.onda = 1;
    NP.compraOggetto('a_enforcer'); NP.compraOggetto('w_enforcer'); NP.compraOggetto('h_mafia');
    NP.sporca(); NP.nuovaOnda();
    document.getElementById('radio').classList.remove('on');
  });
  await page.waitForTimeout(2500);
  for (let i = 0; i < 12; i++) { await page.evaluate(() => NP.colpoManuale(null)); await page.waitForTimeout(40); }
  await page.screenshot({ path: path.join(OUT, `${nome}-arena${suff}.png`) });
  for (const s of ['officina', 'merceria', 'giochi', 'robot', 'diario', 'borsa']) {
    await page.evaluate(x => NP.apriScheda(x), s);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `${nome}-${s}${suff}.png`) });
  }
  await page.evaluate(() => { NP.cambiaStanza(40); NP.S.onda = 0; NP.nuovaOnda(); });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `${nome}-bossintro${suff}.png`) });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, `${nome}-boss${suff}.png`) });
  console.log(suff || 'computer', errori.length ? errori : 'ok');
  await ctx.close();
}
await browser.close();
server.close();
console.log('foto in', path.relative(ROOT, OUT));
