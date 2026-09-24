// Simulatore di bilanciamento di Neon Partenope.
//
//   node strumenti/simula.mjs [clic-al-secondo] [ore]
//
// Carica le stesse formule del gioco (js/core) e fa giocare un "giocatore avido" che compra sempre
// la cosa che rende di più per lira spesa. Stampa quando arriva a ogni boss, così si vede subito se
// la curva ha muri troppo alti o se è troppo facile.
import fs from 'fs';
import vm from 'vm';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export function caricaFormule() {
  const ctx = { console, Math, Date, JSON, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  vm.createContext(ctx);
  for (const f of ['js/core/dati.js', 'js/core/formule.js', 'js/core/stato.js']) {
    vm.runInContext(fs.readFileSync(ROOT + f, 'utf8'), ctx, { filename: f });
  }
  vm.runInContext(`this.nuovo = () => { S = statoNuovo(); sporca(); }; this.getS = () => S;
    Object.assign(this, { BIL, ATTI, BOSS, QUARTIERE, AUTOMI, STAT, COLPI_F1, COLPI_F2, PRODUZIONE, CRITICO, CORAZZA, RIGENERA, OFFLINE, UP_GEN, INFINITI, OGGETTI, CIRCUITI });`, ctx);
  return ctx;
}

export function simula({ clic = 4, ore = 10, log = true, circuiti = null, braci = 0 } = {}) {
  const G = caricaFormule();
  G.nuovo();
  const S = G.getS();
  S.automiOn = true;
  if (circuiti) Object.assign(S.circuiti, circuiti);
  S.braci = braci;
  G.sporca();
  let t = 0;
  const tappe = [];
  let tempoStanza = 0;
  const fine = ore * 3600;

  // stima danno effettivo al secondo (sovraccarico medio compreso se si clicca)
  const dps = () => {
    const d = G.dannoColpo() * G.mediaColpo();
    const sovraMedio = clic > 0 ? 1 + 0.5 * (2.5 * (1 + 0.25 * S.stat.sovra) * (G.setAttivi().vesuvio >= 2 ? 2 : 1) - 1) : 1;
    return d * sovraMedio * (clic + G.colpiAutomi());
  };
  const reddito = (s) => {
    const w = G.dimOrda(s), D = dps() * (1 + G.quotaFendente() * (w - 1) * 0.5);
    const hp = G.hpNemico(s, 1, false);
    const perOnda = w * hp, tOnda = perOnda / D + 0.45;
    return { kill: (w * G.lireNemico(s, 1, false)) / tOnda, tStanza: G.BIL.ondePerStanza * tOnda + (2 * hp / D), prod: G.produzione() };
  };

  // opzioni d'acquisto: [costo, applica, annulla]
  function opzioni() {
    const o = [];
    o.push({ n: 'braccio', c: G.costoBraccio(S.braccio), fai: () => S.braccio++, via: () => S.braccio-- });
    for (const g of G.QUARTIERE) {
      o.push({ n: 'gen ' + g.id, c: G.costoGen(g, 1), fai: () => S.gen[g.id] = (S.gen[g.id] || 0) + 1, via: () => S.gen[g.id]-- });
    }
    for (const a of G.AUTOMI) o.push({ n: 'aut ' + a.id, c: G.costoAutoma(a), fai: () => S.automi[a.id] = (S.automi[a.id] || 0) + 1, via: () => S.automi[a.id]-- });
    for (const st of G.STAT) if (st.k !== 'fend' || G.dimOrda(S.stanza) > 1) o.push({ n: 'stat ' + st.k, c: G.costoStat(st), fai: () => S.stat[st.k]++, via: () => S.stat[st.k]-- });
    const una = (lista, req) => {
      for (const u of lista) if (!S.up.includes(u.id)) {
        if (u.req && S.maxStanza < u.req) continue;
        if (u.gen && (S.gen[u.gen] || 0) < u.req) continue;
        o.push({ n: u.id, c: u.costo, fai: () => S.up.push(u.id), via: () => S.up.pop() });
      }
    };
    una(G.COLPI_F1);
    if (G.catenaCompleta(G.COLPI_F1)) una(G.COLPI_F2);
    una(G.PRODUZIONE); una(G.CRITICO); una(G.UP_GEN);
    for (const k of ['click', 'prod', 'crit']) if (G.infSbloccato(k)) o.push({ n: 'inf ' + k, c: G.costoInf(k), fai: () => S.inf[k]++, via: () => S.inf[k]-- });
    return o;
  }
  function valore() {
    const r = reddito(Math.max(1, S.stanza));
    return Math.log(dps()) * 1.0 + Math.log(r.kill + r.prod + 1e-9) * 1.0;
  }
  function compra() {
    for (let giro = 0; giro < 200; giro++) {
      const base = valore();
      let best = null, bestV = 0;
      for (const op of opzioni()) {
        if (op.c > S.lire * 4) continue;
        op.fai(); G.sporca(); const v = valore() - base; op.via(); G.sporca();
        const rap = v / op.c;
        if (v > 0 && rap > bestV) { bestV = rap; best = op; }
      }
      if (!best || best.c > S.lire) return;
      S.lire -= best.c; best.fai(); G.sporca();
    }
  }

  let ultimoLog = -1;
  while (t < fine) {
    compra();
    const s = S.stanza;
    if (G.eBoss(s)) {
      const need = G.hpBoss(s) / dps();
      if (need <= G.tempoBoss()) {
        t += need + 1; S.lire += G.lireBoss(s); S.totLire += G.lireBoss(s);
        S.bossVinti++; S.stanza++; S.maxStanza = Math.max(S.maxStanza, S.stanza); G.sporca();
        tappe.push({ s, t, braccio: S.braccio, lire: S.totLire, prod: G.produzione(), aut: G.colpiAutomi() });
      } else {
        // farm alla stanza prima per 10 s
        const r = reddito(s - 1);
        S.lire += (r.kill + r.prod) * 10; S.totLire += (r.kill + r.prod) * 10; t += 10;
      }
    } else {
      const r = reddito(s);
      const dt = r.tStanza;
      S.lire += r.kill * dt + r.prod * dt; S.totLire += r.kill * dt + r.prod * dt; t += dt;
      S.stanza++; S.maxStanza = Math.max(S.maxStanza, S.stanza); G.sporca();
    }
    if (log && Math.floor(t / 1800) !== ultimoLog) {
      ultimoLog = Math.floor(t / 1800);
    }
    if (S.stanza > 160) break;
  }
  return { tappe, S, G };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const clic = Number(process.argv[2] ?? 4), ore = Number(process.argv[3] ?? 10);
  const { tappe, S, G } = simula({ clic, ore });
  const f = n => G.fmtNum ? G.fmtNum(n) : n.toExponential(2);
  console.log(`clic/s ${clic} · ${ore} h`);
  for (const x of tappe) {
    console.log(`boss stanza ${String(x.s).padStart(3)} · ${(x.t / 60).toFixed(1).padStart(6)} min · braccio ${String(x.braccio).padStart(4)} · lire tot ${x.lire.toExponential(2)} · prod ${x.prod.toExponential(2)}/s · automi ${x.aut.toFixed(0)}/s`);
  }
  console.log('stanza finale', S.stanza, 'up', S.up.length, 'gen', JSON.stringify(S.gen), 'automi', JSON.stringify(S.automi), 'stat', JSON.stringify(S.stat));
}
