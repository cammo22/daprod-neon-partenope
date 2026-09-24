// Controlli automatici di NEON PARTENOPE.
//
//   npm i --no-save playwright && npx playwright install chromium && node test/prove.mjs
//
// Apre il gioco in un browser vero (Chromium headless) su computer e telefono, con salvataggi nuovi,
// vecchi (VESUVIO.EXE) e rovinati, e verifica: avvio senza errori, intro e trama, colpi e bottino,
// quartiere, officina, boss (vittoria, tempo scaduto, ritirata, caduta), cambio d'atto, Merceria e set,
// minigiochi, commissioni, trofei, gocce di lava, Eruzione, salvataggio, assenza e aggiornamenti.
import { chromium } from 'playwright';
import { avviaServer } from './servi.mjs';

const { server, url } = await avviaServer(Number(process.env.PORT) || undefined);
let ok = 0, ko = 0;
const T = (nome, cond, extra = '') => {
  if (cond) { ok++; console.log('  ✔', nome, extra); }
  else { ko++; console.log('  ✘', nome, extra); }
};
const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });

async function nuovaPagina(opz = {}, salvataggi = null) {
  const ctx = await browser.newContext(opz);
  await ctx.route(/fonts\.(googleapis|gstatic)\.com|api\.github\.com/, r => r.abort());
  const page = await ctx.newPage();
  const errori = [];
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errori.push(m.text()); });
  page.on('pageerror', e => errori.push(String(e)));
  if (salvataggi) {
    await page.addInitScript(sv => {
      if (sessionStorage.getItem('provaCaricata')) return;
      sessionStorage.setItem('provaCaricata', '1');
      try { for (const k in sv) localStorage.setItem(k, sv[k]); } catch (e) { /* niente */ }
    }, salvataggi);
  }
  await page.goto(url);
  await page.waitForFunction(() => window.NP && NP.pronto, null, { timeout: 30000, polling: 100 });
  return { ctx, page, errori };
}
const ev = (page, f, a) => page.evaluate(f, a);

// ============================================================ COMPUTER
console.log('\n== COMPUTER ==');
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1366, height: 820 } });
  const VER = await ev(page, () => NP.VERSIONE);
  T('versione scritta nel marchio e nell\'intro', (await page.locator('.marchio .versione').textContent()) === VER && (await page.locator('#intro .versione').textContent()) === VER, VER);
  T('schermata iniziale col titolo', await page.locator('#intro').isVisible() && /NEON/.test(await page.locator('.i-titolo').textContent()));
  T('marchio DaProd presente', await page.locator('svg.logoDP').count() >= 1);
  T('scena di sfondo disegnata', await ev(page, () => { const c = document.getElementById('scena'); return c.width > 100 && c.height > 100; }));
  await page.click('#introGioca');
  await page.waitForTimeout(700);
  T('INIZIA chiude l\'intro', await page.locator('#intro.via').count() === 1);
  T('parte la trama di Radio Partenope', await page.locator('#radio.on').count() === 1 && await ev(page, () => NP.S.diario.length) >= 5);

  // --- COLPI E BOTTINO ---
  const prima = await ev(page, () => ({ k: NP.S.kills, l: NP.S.lire, hp: NP.W.nemici[0].hp }));
  const box = await page.locator('#orda .nemico').first().boundingBox();
  for (let i = 0; i < 6; i++) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 3); await page.waitForTimeout(45); }
  const dopo = await ev(page, () => ({ c: NP.S.stats.click, hp: NP.W.nemici[0].hp, cal: NP.S.calore }));
  T('toccare un nemico lo colpisce', dopo.c >= 3 && (dopo.hp < prima.hp || (await ev(page, () => NP.S.kills)) > prima.k), JSON.stringify(dopo));
  T('i colpi scaldano il nucleo (calore)', dopo.cal > 0);
  await ev(page, () => { for (let i = 0; i < 400; i++) NP.colpisci(null, true, 5); });
  await page.waitForTimeout(600);
  const k2 = await ev(page, () => ({ k: NP.S.kills, l: NP.S.lire, s: NP.S.stanza, onda: NP.S.onda }));
  T('i nemici muoiono e lasciano lire', k2.k > prima.k && k2.l > prima.l, JSON.stringify(k2));
  T('le ondate avanzano verso la stanza successiva', k2.s > 1 || k2.onda > 0, JSON.stringify(k2));

  // --- QUARTIERE ---
  await ev(page, () => { NP.S.lire = 1e5; });
  await page.click('[data-scheda="quartiere"]');
  await page.waitForTimeout(150);
  await page.locator('[data-azione="gen"][data-id="aut"]').click();
  T('si compra un Piccolo Automa', await ev(page, () => NP.S.gen.aut) === 1);
  T('il quartiere produce lire', await ev(page, () => NP.produzione()) > 0);
  await page.locator('[data-azione="quantita"][data-v="10"]').click();
  await page.waitForTimeout(100);
  await page.locator('[data-azione="gen"][data-id="aut"]').click();
  T('acquisto ×10', await ev(page, () => NP.S.gen.aut) === 11);
  T('costo ×10 = serie geometrica', await ev(page, () => { const g = NP.QUARTIERE[0]; return Math.abs(NP.costoGen(g, 1) - 15 * Math.pow(1.15, 11)) < 1e-6; }));
  const l0 = await ev(page, () => NP.S.lire);
  await page.waitForTimeout(1100);
  T('la produzione arriva col tempo', await ev(page, () => NP.S.lire) > l0);

  // --- OFFICINA ---
  await page.click('[data-scheda="officina"]');
  await page.waitForTimeout(150);
  const d0 = await ev(page, () => NP.dannoBase());
  await page.locator('[data-azione="quantita"][data-v="1"]').click();
  await page.locator('[data-azione="braccio"]').click();
  T('il Braccio Meccanico sale di livello e aumenta il danno', await ev(page, () => NP.S.braccio) === 2 && await ev(page, () => NP.dannoBase()) > d0);
  await page.locator('[data-azione="up"][data-id="cv1"]').click();
  T('potenziamento Vigore Meccanico (×2)', await ev(page, () => NP.S.up.includes('cv1')));
  for (const c of ['automi', 'stat', 'prod', 'difesa', 'inf']) {
    await page.locator(`[data-azione="catOff"][data-v="${c}"]`).click();
    await page.waitForTimeout(80);
  }
  await page.locator('[data-azione="catOff"][data-v="automi"]').click();
  await page.waitForTimeout(80);
  await page.locator('[data-azione="automa"][data-id="ab1"]').click();
  await page.waitForTimeout(250);
  T('si compra un automa e compare il pulsante degli automi', await ev(page, () => NP.S.automi.ab1) === 1 && await page.locator('#bAutomi:not([hidden])').count() === 1);

  // --- BOSS: vittoria ---
  await ev(page, () => { NP.cambiaStanza(10); NP.S.onda = 0; NP.nuovaOnda(); });
  T('stanza 10: arriva Il Capitano', await ev(page, () => NP.W.boss && NP.W.nemici[0].bossId === 'capitano'));
  T('intro del boss a schermo', await page.locator('#introBoss.on').count() === 1);
  T('barra del boss con vita e tempo', await page.locator('#bossBarra.on').count() === 1);
  await page.waitForTimeout(2800);
  T('dopo l\'intro parte il tempo', await ev(page, () => NP.W.bossFine > Date.now()));
  const bossPrima = await ev(page, () => NP.S.bossVinti);
  await ev(page, () => { const b = NP.W.nemici[0]; NP.colpisci(0, true, b.max); });
  await page.waitForTimeout(900);
  T('boss sconfitto: si passa alla stanza 11', await ev(page, () => NP.S.bossVinti) === bossPrima + 1 && await ev(page, () => NP.S.stanza) === 11);
  T('trofeo e ricompense del boss', await ev(page, () => NP.S.biglietti) >= 1);

  // --- BOSS: tempo scaduto e ritirata ---
  await ev(page, () => { NP.cambiaStanza(20); NP.S.onda = 0; NP.nuovaOnda(); });
  await page.waitForTimeout(2800);
  await ev(page, () => { NP.W.bossFine = Date.now() - 1; NP.tickArena(0.016); });
  await page.waitForTimeout(200);
  const rit = await ev(page, () => ({ s: NP.S.stanza, r: NP.S.bossRitirata, a: NP.S.autoAvanza }));
  T('tempo scaduto: respinto alla stanza 19, avanza spento', rit.s === 19 && rit.r === 20 && rit.a === false, JSON.stringify(rit));
  T('compare "Riprova"', await page.locator('#bRiprova:not([hidden])').count() === 1);
  await page.click('#bRiprova');
  await page.waitForTimeout(200);
  T('Riprova riporta al boss', await ev(page, () => NP.S.stanza === 20 && NP.W.boss));
  // caduta
  await page.waitForTimeout(2700);
  await ev(page, () => { NP.S.energia = 1; NP.W.bossColpo = 0; NP.tickArena(0.016); });
  await page.waitForTimeout(100);
  T('il boss colpisce e il robot cade', await ev(page, () => NP.S.giu) && await page.locator('#abbattuto.on').count() === 1);
  await ev(page, () => { NP.S.rottami = 1000; });
  await page.click('#bRipara');
  T('riparazione coi rottami', await ev(page, () => !NP.S.giu && NP.S.energia > 0));
  await page.click('#bbRitirata');
  T('ritirata volontaria', await ev(page, () => NP.S.stanza === 19 && !NP.W.boss));

  // --- CAMBIO D'ATTO ---
  await ev(page, () => { NP.S.autoAvanza = true; NP.cambiaStanza(21); NP.nuovaOnda(); });
  await page.waitForTimeout(300);
  T('stanza 21: Atto II · IL GOLFO', (await page.locator('#attoNome').textContent()) === 'IL GOLFO');
  T('i nemici cambiano con l\'atto', await ev(page, () => NP.W.nemici.every(n => ['Gabbiano di Ferro', 'Granchio di Titanio', 'Polpo delle Profondità', 'Squalo del Golfo'].includes(n.n))));

  // --- SOVRACCARICO E PROTOCOLLO ---
  await ev(page, () => NP.attivaSovra());
  T('sovraccarico moltiplica il danno', await ev(page, () => { const a = NP.dannoColpo(); NP.S.sovraFino = 0; const b = NP.dannoColpo(); return a > b * 2; }));
  await ev(page, () => { NP.S.automi.ab1 = 60; NP.sporca(); NP.S.protoPronto = 0; });
  await page.waitForTimeout(250);
  T('protocollo sbloccato a 60 livelli automa', await page.locator('#bProto:not([hidden])').count() === 1);
  await page.click('#bProto');
  T('protocollo attivo', await ev(page, () => NP.S.protoFino > Date.now()));

  // --- MERCERIA ---
  await ev(page, () => { NP.S.lire = 1e12; NP.S.biglietti = 10; });
  await page.click('[data-scheda="merceria"]');
  await page.waitForTimeout(150);
  T('vetrina con 6 oggetti', await page.locator('.oggetto').count() === 6);
  await ev(page, () => { NP.compraOggetto('a_enforcer'); NP.compraOggetto('w_enforcer'); });
  await page.waitForTimeout(700);
  T('due pezzi Enforcer accendono la sinergia', await ev(page, () => NP.energiaMax()) > 0 && await page.locator('.sinergia.on').count() >= 1);
  await ev(page, () => NP.apriPacco());
  T('pacco misterioso', await ev(page, () => NP.S.inv.length) >= 3);
  await ev(page, () => { NP.compraLab(); });
  T('laboratorio costruito', await ev(page, () => NP.S.lab.lv) === 1);

  // --- ROBOT ---
  await page.click('[data-scheda="robot"]');
  await page.waitForTimeout(150);
  T('anteprima grande del robot', await page.locator('#robotGrande svg').count() === 1);
  await ev(page, () => { NP.S.rottami = 1000; });
  await page.locator('[data-azione="pezzo"][data-campo="telaio"][data-v="enforce"]').click();
  // Il gioco intanto va avanti e ogni tanto cade un rottame: si guarda che ne siano usciti 500, non che ne restino 500 esatti.
  const rott = await ev(page, () => ({ t: NP.S.rob.telaio, r: NP.S.rottami }));
  T('telaio Enforcer comprato coi rottami', rott.t === 'enforce' && rott.r <= 500 && rott.r > 400, JSON.stringify(rott));

  // --- MINIGIOCHI E COMMISSIONI ---
  await page.click('[data-scheda="giochi"]');
  await page.waitForTimeout(150);
  T('tre commissioni', await page.locator('.riga.comm').count() === 3);
  T('cinque minigiochi', await page.locator('.gioco').count() === 5);
  for (const id of ['sfera', 'pesca', 'botte', 'carte', 'ruota']) {
    await ev(page, i => NP.avviaMini(i, true), id);
    await page.waitForTimeout(250);
    const aperto = await page.locator('#modale.on').count() === 1;
    await ev(page, () => NP.chiudiModale());
    await page.waitForTimeout(80);
    T('minigioco ' + id + ' si apre e si chiude', aperto);
  }
  // sfera giocata fino in fondo
  await ev(page, () => { NP.S.mini = {}; NP.avviaMini('sfera'); });
  for (let i = 0; i < 8; i++) { await page.click('#mgColpo'); await page.waitForTimeout(60); }
  await page.waitForTimeout(700);
  T('la Sfera finisce col premio e va in ricarica', await page.locator('.mg-esito').count() === 1 && await ev(page, () => NP.S.mini.sfera > Date.now()));
  await ev(page, () => NP.chiudiModale());

  // --- GOCCE DI LAVA ---
  await ev(page, () => NP.creaGoccia());
  await page.waitForTimeout(1500);
  const g0 = await ev(page, () => NP.S.stats.gocce);
  await page.locator('.goccia').first().dispatchEvent('pointerdown');
  T('goccia di lava raccolta', await ev(page, () => NP.S.stats.gocce) === g0 + 1);

  // --- ALTRE SCHEDE ---
  await page.click('[data-scheda="borsa"]');
  await page.waitForTimeout(200);
  T('Borsa: grafico disegnato', await ev(page, () => { const c = document.getElementById('borsaTela'); return !!c && c.width > 50; }));
  for (const s of ['diario', 'trofei']) { await page.click(`[data-scheda="${s}"]`); await page.waitForTimeout(120); }
  await page.click('#bOpz');
  await page.waitForTimeout(150);
  T('opzioni aperte', await page.locator('.opzioni-griglia').count() === 1);
  await page.click('#oEsporta');
  const codice = await page.locator('#oCodice').inputValue();
  T('esporta codice di salvataggio', codice.startsWith('NP2:'));
  await page.click('#modChiudi');

  // --- ERUZIONE ---
  await ev(page, () => { NP.S.visto.liberata = true; NP.S.maxStanza = 120; NP.S.lireCiclo = 1e13; });
  const b = await ev(page, () => NP.braciEruzione());
  T('braci dall\'eruzione', b > 10, String(b));
  await ev(page, () => NP.erutta());
  await page.waitForTimeout(400);
  const dopoE = await ev(page, () => ({ c: NP.S.ciclo, br: NP.S.braci, s: NP.S.stanza, gen: Object.keys(NP.S.gen).length, inv: NP.S.inv.length, lire: NP.S.lire }));
  T('eruzione: nuovo ciclo, braci tenute, quartiere azzerato, oggetti tenuti', dopoE.c === 2 && dopoE.br === b && dopoE.s === 1 && dopoE.gen === 0 && dopoE.inv >= 3, JSON.stringify(dopoE));

  // --- SALVATAGGIO ---
  await ev(page, () => { NP.S.lire = 12345; NP.salva(); });
  await page.reload();
  await page.waitForFunction(() => window.NP && NP.pronto, null, { timeout: 30000 });
  T('dopo ricarica: ciclo e lire tornano', await ev(page, () => NP.S.ciclo === 2 && NP.S.lire >= 12345));
  T('intro con "CONTINUA"', /CONTINUA/.test(await page.locator('#introGioca').textContent()));
  T('nessun errore in console', errori.length === 0, errori.slice(0, 3).join(' | '));
  await ctx.close();
}

// ============================================================ TELEFONO
console.log('\n== TELEFONO ==');
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2.6 });
  await page.tap('#introGioca');
  await page.waitForTimeout(500);
  T('niente scorrimento orizzontale', await ev(page, () => document.documentElement.scrollWidth <= innerWidth + 1));
  T('barra delle schede in basso', await page.locator('#barraMobile').isVisible());
  T('scena grande quanto lo schermo', await ev(page, () => { const c = document.getElementById('scena').getBoundingClientRect(); return Math.abs(c.width - innerWidth) < 2 && Math.abs(c.height - innerHeight) < 2; }));
  const p = await page.locator('#orda .nemico').first().boundingBox();
  const c0 = await ev(page, () => NP.S.stats.click);
  for (let i = 0; i < 5; i++) { await page.touchscreen.tap(p.x + p.width / 2, p.y + p.height / 3); await page.waitForTimeout(60); }
  T('il tocco colpisce', await ev(page, () => NP.S.stats.click) >= c0 + 4);
  await page.tap('#bAltro');
  await page.waitForTimeout(250);
  T('menu Altro', await page.locator('#altroMenu.on').isVisible());
  await page.tap('#altroMenu [data-scheda="diario"]');
  await page.waitForTimeout(200);
  T('Diario dal menu Altro', await page.locator('.mappa').count() === 1);
  await ev(page, () => { NP.S.lire = 1e9; });
  await page.tap('#barraMobile [data-scheda="quartiere"]');
  await page.waitForTimeout(200);
  const btn = page.locator('[data-azione="gen"][data-id="aut"]');
  await btn.scrollIntoViewIfNeeded();
  await btn.tap();
  T('comprare dal telefono', await ev(page, () => NP.S.gen.aut) === 1);

  // 2.1.3: una zona per volta, e l'arena nel riquadro trascinabile.
  const pip = await ev(page, () => {
    const a = document.getElementById('colArena').getBoundingClientRect();
    const pn = document.getElementById('colPannelli').getBoundingClientRect();
    return { vista: document.body.classList.contains('vista-pannello'), aw: a.width, ah: a.height, pw: pn.width, ph: pn.height, pos: getComputedStyle(document.getElementById('colArena')).position };
  });
  T('su una scheda: il pannello a tutto schermo', pip.vista && pip.pw > 340 && pip.ph > 500, JSON.stringify(pip));
  T('e l\'arena in un riquadro piccolo sopra', pip.pos === 'fixed' && pip.aw <= 215 && pip.ah < 330, JSON.stringify(pip));
  // Si tocca quando l'arena e' libera: durante l'entrata di un boss o un riavvio non si colpisce, ed e' giusto.
  await page.waitForFunction(() => !arenaFerma() && document.querySelector('#orda .nemico'), null, { timeout: 15000 });
  await page.waitForTimeout(300);
  // Il centro del palco del riquadro: un tocco li' e' un colpo anche senza mirare, e i nemici si muovono.
  const nPip = await page.locator('#palco').boundingBox();
  const c1 = await ev(page, () => NP.S.stats.click);
  for (let i = 0; i < 4; i++) { await page.touchscreen.tap(nPip.x + nPip.width * 0.6, nPip.y + nPip.height * 0.5); await page.waitForTimeout(80); }
  T('nel riquadro si colpisce ancora', await ev(page, () => NP.S.stats.click) >= c1 + 2);
  const m = await page.locator('#pipManiglia span').boundingBox();
  const prima = await ev(page, () => document.getElementById('colArena').getBoundingClientRect().left);
  await page.mouse.move(m.x + 10, m.y + 5); await page.mouse.down(); await page.mouse.move(m.x - 120, m.y + 200, { steps: 6 }); await page.mouse.up();
  const dopo = await ev(page, () => document.getElementById('colArena').getBoundingClientRect().left);
  T('il riquadro si trascina', dopo < prima - 60, prima + ' -> ' + dopo);
  await page.tap('#pipApri');
  await page.waitForTimeout(200);
  const arena = await ev(page, () => ({ v: document.body.classList.contains('vista-arena'), h: document.getElementById('colArena').getBoundingClientRect().height, p: getComputedStyle(document.getElementById('colPannelli')).display }));
  T('⤢ riporta l\'arena a tutto schermo', arena.v && arena.h > 600 && arena.p === 'none', JSON.stringify(arena));
  await page.waitForTimeout(1300);
  const hud = await ev(page, () => ({ on: document.getElementById('borsaHud').classList.contains('on'), pat: document.getElementById('hudPat').textContent, dps: document.getElementById('hudDps').textContent }));
  T('mini borsa sul telefono: patrimonio e danni', hud.on && /₤/.test(hud.pat) && /💥/.test(hud.dps), JSON.stringify(hud));
  await ev(page, () => { codaRadio.length = 0; prossimaRadio(); radio('primo messaggio della prova', { noLog: true }); radio('secondo messaggio della prova', { noLog: true }); });
  await page.waitForTimeout(150);
  await page.tap('#radio');
  await page.waitForTimeout(150);
  T('un tocco sulla Radio la salta', await ev(page, () => document.getElementById('radio').dataset.testo) === 'secondo messaggio della prova');
  T('nessun errore in console (telefono)', errori.length === 0, errori.slice(0, 3).join(' | '));
  await ctx.close();
}

// ============================================================ SALVATAGGI VECCHI E ROVINATI
console.log('\n== SALVATAGGI ==');
{
  const vecchio = JSON.stringify({ lire: 5e9, totalLire: 3e12, rottami: 900, biglietti: 12, lvl: 140, rob: { col1: '#ff4824', col2: '#5ff5c5', eyesCol: '#bb86fc' } });
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1280, height: 800 } }, { vesuvioEXE_saveV3: vecchio });
  T('VESUVIO.EXE diventa un\'eredità', await page.locator('#introEredita:not([hidden])').count() === 1);
  const s = await ev(page, () => ({ r: NP.S.rottami, b: NP.S.biglietti, br: NP.S.braci, c: NP.S.rob.col1, lire: NP.S.lire }));
  T('eredità: rottami, biglietti, braci e colori del robot', s.r === 900 && s.b === 12 && s.br > 0 && s.c === '#ff4824' && s.lire === 0, JSON.stringify(s));
  T('nessun errore (eredità)', errori.length === 0, errori.join(' | '));
  await ctx.close();
}
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1280, height: 800 } }, { neonPartenope_v2: '{"lire":"tanti","stanza":-4,"inv":[{"id":"nonEsiste"}],"gen":null' });
  T('salvataggio illeggibile: si riparte senza bloccarsi', await ev(page, () => NP.S.stanza === 1 && NP.S.lire === 0));
  await ctx.close();
  const rov = JSON.stringify({ lire: 'tanti', stanza: -4, maxStanza: 'x', braccio: null, inv: [{ id: 'nonEsiste' }, { id: 'a_vesuvio', lv: 3, eq: true }], gen: null, up: 'no' });
  const q = await nuovaPagina({ viewport: { width: 1280, height: 800 } }, { neonPartenope_v2: rov });
  const r = await ev(q.page, () => ({ l: NP.S.lire, s: NP.S.stanza, b: NP.S.braccio, inv: NP.S.inv.length, up: Array.isArray(NP.S.up) }));
  T('salvataggio rovinato riparato', r.l === 0 && r.s === 1 && r.b === 1 && r.inv === 1 && r.up, JSON.stringify(r));
  T('nessun errore (rovinato)', q.errori.length === 0 && errori.length === 0, q.errori.concat(errori).join(' | '));
  await q.ctx.close();
}
{
  // assenza: 2 ore fa, con produzione
  const st = JSON.stringify({ gen: { aut: 50, lav: 20 }, ultimo: Date.now() - 2 * 3600 * 1000, visto: { intro: true }, versione: 'v0.0.1' });
  const { ctx, page } = await nuovaPagina({ viewport: { width: 1280, height: 800 } }, { neonPartenope_v2: st });
  T('guadagni da assenza accreditati', await ev(page, () => NP.S.lire) > 1000);
  await page.click('#introGioca');
  await page.waitForTimeout(300);
  T('finestra "Bentornato"', await page.locator('.bentornato').count() === 1);
  await ctx.close();
}

// ============================================================ AGGIORNAMENTI
console.log('\n== AGGIORNAMENTI ==');
{
  const { ctx, page } = await nuovaPagina({ viewport: { width: 1280, height: 800 } });
  const conf = await ev(page, () => [Aggiornamenti.piuNuova('v2.1.0', 'v2.0.9'), Aggiornamenti.piuNuova('v2.0.0', 'v2.0.0'), Aggiornamenti.piuNuova('v10.0.0', 'v9.9.9'), Aggiornamenti.piuNuova('v1.9.9', 'v2.0.0')]);
  T('confronto versioni', JSON.stringify(conf) === '[true,false,true,false]', JSON.stringify(conf));
  // la pagina pubblicata ha una versione più nuova: compare il banner
  await ctx.route(/index\.html\?controllo=/, r => r.fulfill({ status: 200, contentType: 'text/html', body: "const VERSIONE = 'v99.0.0';" }));
  await ev(page, () => Aggiornamenti.controlla(true));
  await page.waitForTimeout(200);
  T('banner "è online una nuova versione"', await page.locator('#aggiorna:not([hidden])').count() === 1 && /v99\.0\.0/.test(await page.locator('#aggiorna').textContent()));
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${ok} ok · ${ko} falliti`);
process.exit(ko ? 1 : 0);
