# Changelog NEON PARTENOPE 🌋🧜

Tutte le versioni notevoli del gioco. Le date sono in formato AAAA-MM-GG.
Ogni versione pubblicata ha anche una [release GitHub](https://github.com/cammo22/daprod-neon-partenope/releases)
con le app per Android, Windows e Mac, e va online su [GitHub Pages](https://cammo22.github.io/daprod-neon-partenope/)
subito dopo il push su `main`.

**Come si pubblica una versione:** si alza `const VERSIONE` in `index.html`, si aggiunge qui sotto la
sezione `## [X.Y.Z]` e si unisce su `main`. Il resto (prove, APK, EXE, DMG, release) lo fa GitHub Actions.
Chi gioca dal browser vede comparire "È online la vX.Y.Z — Aggiorna ora"; chi usa l'app vede "Scarica".

## [2.1.2] — 2026-09-24 · La ricarica dalla suite, quanto vuoi

- Dentro la [DaProd Suite](https://github.com/cammo22/DaProdSuite) la ricarica è un portafoglio: scegli quante lire della
  suite passare al gioco, e ogni L.100 diventa un minuto di produzione del quartiere.

## [2.1.1] — 2026-09-24 · Qui è una demo, le lire stanno nella suite

- **Sul sito e nelle app il gioco torna la sua demo**: niente barra delle Lire DaProd, niente saldo diviso
  fra i giochi nel browser. Le Lire DaProd, la Borsa e le carte ci sono solo giocando dalla sala giochi della
  [DaProd Suite](https://github.com/cammo22/DaProdSuite).
- Nella suite, se il computer DaProd non risponde, il gioco continua lo stesso.

## [2.1.0] — 2026-09-24 · Le Lire DaProd: un portafoglio per tutti i giochi 💶

### 💶 Le Lire DaProd: un portafoglio solo per tutti i giochi DaProd
- **Le Lire DaProd** (`daprod-lira.js`): lo stesso portafoglio nella Coin Dozer, nella Claw Machine e in
  Neon Partenope. Stanno tutti su `cammo22.github.io`, quindi il browser tiene **un saldo solo**: le lire
  staccate in un gioco si spendono negli altri.
- **La partita e lo stacco**: quello che vinci nel gioco fa **punti**. Quando vuoi smettere premi **Stacca**
  e i punti diventano lire, alla **quotazione** di adesso, per la tua fetta (15%). Qui le lire del gioco esplodono, quindi contano gli **ordini di grandezza**. Al massimo L.3.000 al
  giorno: il resto della partita resta per domani.
- **La Borsa della Lira**: la quotazione sale quando si spende (le ricariche) e scende quando si incassa
  (gli stacchi), con un'onda lenta uguale per tutti. Staccare adesso o aspettare è parte del gioco.
- **Ricarica** con le Lire: un gettone da L.100 ti dà **un minuto di produzione del quartiere**.
- **Dentro la DaProd Suite** il gioco sta nella sala giochi, e il portafoglio è quello vero del computer:
  lì le cose grosse (boss battuti, l'eruzione del Vesuvio) ti danno **carte** da giocare nella slot delle combinazioni.
- Il portafoglio è la barra in basso (sul telefono il tondo **₤**): toccala per vedere Borsa, fetta e tetto.

## [2.0.0] — 2026-09-24 · Il remake: NEON PARTENOPE 🌋🧜

VESUVIO.EXE rinasce da zero con un nome nuovo, una trama vera e un'anima identica: il clicker
cyberpunk napoletano di DaProd, con i robot del quartiere, la lava, le lire e i boss.

### La trama
- **Napoli, 2099.** sinteticoMC, la Sfera Cromata, si è presa la Rete del Golfo e ha trasformato il
  Vesuvio in un server a lava. Ha chiuso nel Nucleo **PARTENOPE**, l'IA che teneva accese le luci della città.
- Tu sei **Ferro Vecchio**, un robot di rottami riacceso nel garage DaProd di Ponticelli. Partenope ti
  guida da una frequenza pirata: **Radio Partenope 88.0**, con un diario che conserva ogni trasmissione.
- **Cinque atti** con cielo, luci e nemici propri: Ponticelli, Il Golfo, Spaccanapoli, Napoli Sotterranea
  e Il Cratere. Poi si va *Oltre il Cratere*, all'infinito.
- **Dieci boss**, uno ogni dieci stanze: tornano Il Capitano, Mister K, Ruggine, La Vipera, I Gemelli,
  la Madonnina Nera, Bomba e sinteticoMC, e arrivano **'O Munaciello** e l'**Eco di Partenope**.
  Ognuno ha la sua entrata in scena, le sue battute e 30 secondi di tempo per batterlo.

### Il gioco
- **Stanze e ondate**: tre ondate per stanza, orde fino a otto nemici, un'élite ogni stanza. Pulsante
  AVANZA/FERMO per scendere o restare a farmare.
- **Boss con tempo limite** che colpiscono davvero: se cadi ti ripari coi rottami o aspetti il riavvio;
  se il tempo scade ti ritiri alla stanza prima e riprovi quando vuoi (e la rivincita vale un trofeo).
- **Braccio Meccanico** a livelli infiniti (danno ×2 ogni 25 livelli), le catene di colpi Fase 1 e
  Fase 2, gli **automi** con i loro droni che sparano laser e il **Protocollo Vesuvio** a 60 livelli.
- **Il Quartiere** (i 14 personaggi di sempre) produce lire e **accende le finestre della città** sullo
  sfondo. Traguardi a 50, 100, 200… copie: produzione ×2 (e questa volta il bonus c'è davvero).
- **Sovraccarico Termico**, Multicolpo e Fendente come prima, con le statistiche infinite.
- **Merceria di Pacco** ridisegnata: vetrina, pacchi misteriosi, livelli oggetto coi rottami, sei set
  (compreso il nuovo **Set Partenope**) con bonus a 2 e a 3 pezzi.
- **Commissioni del Quartiere**: tre lavoretti alla volta per rottami e biglietti.
- **Sala Giochi**: Sfera, Pesca con COMBO, Botte a Ruggine, Carte della Cartomante e Ruota del Mercante,
  con premi che crescono col quartiere e 3 minuti di ricarica (o un biglietto per giocare subito).
- **Gocce di lava** che cadono dal cratere: prendile al volo per lire, furie e biglietti.
- **Eruzione** (il prestigio che mancava): dopo aver liberato Partenope fai eruttare il Vesuvio,
  ricominci dalla stanza 1 e tieni le **Braci**, da spendere nei **Circuiti di Partenope**.
- **Borsa del Golfo** con tre scale di tempo, cinque serie e l'indice di Fiducia; mini-Borsa trascinabile.
- **36 trofei**, statistiche complete, valore in euro del patrimonio (1 € = 1.936,27 ₤).

### Grafica e suono
- **Restyle DaProd**: neon oro, magenta e ciano, vetro scuro, Orbitron + Rajdhani + Space Mono.
- **La cartolina di Napoli al neon** disegnata dal vivo: sole synthwave a strisce, Vesuvio col cratere
  che pulsa e le colate, golfo a griglia, Castel dell'Ovo, pino marittimo, droni ed eruzioni.
- Numeri del danno, scintille e monete su un canvas dedicato; Ferro Vecchio tira pugni ad ogni colpo.
- **Colonna sonora synthwave generata dal vivo** (Web Audio): cambia tonalità ad ogni atto e accelera
  contro i boss. Tutti gli effetti sono sintetizzati, nessun file audio.
- Si gioca bene **da telefono**: arena in alto, pannelli sotto, barra delle schede in basso.

### Aggiornamenti e app
- **Metodo di aggiornamento**: la versione vive in `index.html` (`VERSIONE`) e finisce in coda a CSS e JS,
  così GitHub Pages non serve mai file vecchi. Il gioco controlla da solo se è online una versione nuova.
- **App per Android, Windows e Mac** in ogni release (APK, EXE portatile, DMG), funzionano offline e
  avvisano quando esce una nuova versione.
- **Salvataggi**: automatici ogni 10 secondi, codice da esportare/importare, riparazione dei salvataggi
  rovinati. Chi arriva da **VESUVIO.EXE** riceve un'eredità: rottami, biglietti, Braci e i colori del robot.
- **Prove automatiche** nel browser (computer e telefono) e un simulatore che controlla la curva di progressione.

## [1.1.0] — 2026-09-01 · VESUVIO.EXE

L'ultima versione col vecchio nome: clicker nell'arena, borsa telemetrica con HUD trascinabile,
merceria coi set, minigiochi, laboratorio biglietti e interruttore delle notifiche.
