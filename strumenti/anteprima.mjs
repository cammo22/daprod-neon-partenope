// Scatta img/anteprima.png (README e anteprima dei link) con una partita a metà Atto II.
//   node strumenti/anteprima.mjs
import { chromium } from 'playwright';
import path from 'path';
import { avviaServer, ROOT } from '../test/servi.mjs';

const { server, url } = await avviaServer();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
await page.route(/api\.github\.com/, r => r.abort());
await page.goto(url);
await page.waitForFunction(() => window.NP && NP.pronto, null, { timeout: 60000 });
await page.click('#introGioca');
await page.evaluate(() => {
  const S = NP.S;
  S.opz.notifiche = false; S.opz.borsaHud = false;
  S.lire = 8.4e8; S.rottami = 1840; S.biglietti = 23;
  for (const [id, n] of [['aut', 110], ['lav', 90], ['bar', 70], ['pacc', 55], ['mec', 40], ['pesc', 26], ['art', 12], ['carm', 4]]) S.gen[id] = n;
  S.braccio = 130; S.up.push('cv1', 'cv2', 'cv3', 'pu1', 'pu2', 'pu3', 'uc1', 'uc2', 'uhp1', 'uhp2');
  S.automi.ab1 = 30; S.automi.ab2 = 14; S.automi.ab3 = 4; S.stat.multi = 6; S.stat.fend = 3;
  S.maxStanza = 36; NP.cambiaStanza(36);
  S.rob.telaio = 'enforce'; S.rob.col1 = '#35e8ff'; S.rob.col2 = '#ffd54a';
  NP.compraOggetto('w_vesuvio'); NP.compraOggetto('h_mafia');
  NP.sporca(); NP.nuovaOnda();
  document.getElementById('radio').classList.remove('on');
  document.getElementById('annuncio').classList.remove('on');
});
await page.waitForTimeout(3000);
await page.evaluate(() => { for (let i = 0; i < 5; i++) NP.colpoManuale(null); });
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(ROOT, 'img/anteprima.png') });
await browser.close(); server.close();
console.log('✔ img/anteprima.png');
