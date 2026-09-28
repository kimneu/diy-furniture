/* Sideboard: Berechnung und Bauablauf. Braucht die Globals aus shared.js. */
'use strict';

/* ---------- Berechnung ---------- */
// Fronten höchstens 19 mm: dickere Türen sind schwer, und Scharniere und Schiebetürbeschläge sind für 16–19 mm gemacht.
const FRONT_MAX = 19;
const frontTs = M => M.t.filter(v => v <= FRONT_MAX);
// Frontmaterial: frontMat = Plattenmaterial (keine ganzen Bretter) oder leer/'korpus' = wie der Korpus.
// Stärke frontT, sonst die Korpusstärke, sonst die Standardstärke, sonst die dickste bis 19 mm.
// «Wie Korpus» bei einem Korpus über 19 mm: dasselbe Material in der dicksten Stärke bis 19 mm.
function frontMaterial(c){
  const F = MATS[c.frontMat], own = !!F && !F.boards && frontTs(F).length > 0;
  const fmat = own ? c.frontMat : c.mat, MF = MATS[fmat], ts = frontTs(MF);
  if (!own) return { fmat, MF, tf: c.t <= FRONT_MAX || !ts.length ? c.t : Math.max(...ts) };
  const tf = ts.includes(c.frontT) ? c.frontT : ts.includes(c.t) ? c.t : ts.includes(MF.tDef) ? MF.tDef : Math.max(...ts);
  return { fmat, MF, tf };
}
function computeSideboard(c){
  const M = MATS[c.mat], t = c.t, Bk = BACKS[c.back], bt = Bk ? Bk.t : 0;
  const warn = [];
  const W = clamp(c.W, 300, 2400), H = clamp(c.H, 300, 1400), D = clamp(c.D, 250, 650);
  let bh = 0;
  if (c.base === 'plinth') bh = clamp(c.baseH, 40, 150);
  if (c.base === 'legs') bh = clamp(c.baseH, 60, 350);
  const maxBh = H - 2*t - 150;
  if (bh > maxBh) { bh = Math.max(0, maxBh); warn.push(`Untergestell auf ${bh} mm begrenzt – sonst bleibt kein Innenraum.`); }
  const Hc = H - bh, Dp = D - bt, Wi = W - 2*t, Hi = Hc - 2*t, n = c.sections;
  const s = (Wi - (n-1)*t) / n;
  const hinged = c.front === 'hinged', sliding = c.front === 'sliding';
  const topOver = c.top === 'over';
  // Fronten: eigenes Plattenmaterial und eigene Stärke, oder wie der Korpus (frontMat leer/'korpus').
  const { fmat, MF, tf } = frontMaterial(c);
  const slideSet = sliding ? 2*tf + 16 : 0;
  const dd = Dp - slideSet;            // Tiefe Mittelwände
  const sd = dd - 10;                  // Tiefe Einlegeböden
  const paint = c.front === 'open' ? null : (c.color === 'korpus' ? (fmat === 'mdf' ? COLORS.weiss : null) : COLORS[c.color]);
  const carcFin = { color: c.mat === 'mdf' ? COLORS.weiss : M.color, ply:M.ply, grain:M.grain, plyColor:M.color };
  const frontFin = paint ? { color:paint, ply:MF.ply, grain:false, plyColor:MF.color, painted:true }
    : fmat === c.mat ? carcFin : { color: fmat === 'mdf' ? COLORS.weiss : MF.color, ply:MF.ply, grain:MF.grain, plyColor:MF.color };
  const backFin = Bk ? { color:Bk.color, ply:Bk.ply, grain:false, plyColor:Bk.color } : null;
  const bath = c.room === 'bath';
  const nameOf = k => bath && k === 'mdf' ? 'MDF MR feuchtfest' : MATS[k].name;
  const matShort = nameOf(c.mat);
  const ss = bath ? ', Edelstahl A2' : '';
  const glueName = bath ? 'Holzleim D4 (wasserfest)' : 'Holzleim D3';
  const gMain = `${matShort} ${t} mm`, gBack = Bk ? `${Bk.name} ${Bk.t} mm` : null;
  const gFront = `${nameOf(fmat)} ${tf} mm`;   // = gMain, wenn die Fronten wie der Korpus sind
  const cup = tf < 15 ? 26 : 35;               // Topfscharnier: dünne Türen brauchen den kleinen Topf
  const z0 = -D/2 + bt, z1 = D/2, zc = (z0 + z1) / 2;

  const raw = [], boxes = [], doors = [], slides = [], extras = [];
  function add(name, L, B, th, group, note, kind, box){
    const key = [name, r0(L), r0(B), th, group, note].join('|');
    raw.push({ key, name, L:r0(L), B:r0(B), t:th, group, note, kind });
    if (box) { box.key = key; boxes.push(box); }
    return key;
  }

  // Korpus
  const sideH = topOver ? Hc - t : Hc;
  for (const sx of [-1, 1]) add('Seite', sideH, Dp, t, gMain, c.shelves ? 'Lochreihe Bodenträger innen' : 'Vorderkante sichtbar', 'korpus',
    { size:[t, sideH, Dp], pos:[sx*(W/2 - t/2), bh + sideH/2, zc], thin:'x', grain:'y', fin:carcFin, ex:[sx*150, 0, 0] });
  const topW = topOver ? W : Wi;
  add('Deckel', topW, Dp, t, gMain, topOver ? 'liegt auf den Seiten · Oberseite = Sichtseite' : 'zwischen den Seiten', 'korpus',
    { size:[topW, t, Dp], pos:[0, bh + Hc - t/2, zc], thin:'y', grain:'x', fin:carcFin, ex:[0, 170, 0] });
  add('Boden', Wi, Dp, t, gMain, 'zwischen den Seiten', 'korpus',
    { size:[Wi, t, Dp], pos:[0, bh + t/2, zc], thin:'y', grain:'x', fin:carcFin, ex:[0, -60, 0] });
  const divX = [];
  for (let i = 1; i < n; i++) {
    const x = -Wi/2 + i*s + (i-1)*t + t/2; divX.push(x);
    add('Mittelwand', Hi, dd, t, gMain, sliding ? `${slideSet} mm zurückversetzt (Schiene)` : (c.shelves ? 'Lochreihen beidseitig, versetzt' : ''), 'korpus',
      { size:[t, Hi, dd], pos:[x, bh + t + Hi/2, z0 + dd/2], thin:'x', grain:'y', fin:carcFin, ex:[0, 0, -40] });
  }
  for (let j = 0; j < n; j++) {
    const cx = -Wi/2 + j*(s + t) + s/2;
    for (let k = 1; k <= c.shelves; k++) {
      const y = bh + t + Hi * k / (c.shelves + 1);
      add('Einlegeboden', Math.floor(s - 2), sd, t, gMain, '2 mm Luft, auf 4 Bodenträgern', 'korpus',
        { size:[s - 2, t, sd], pos:[cx, y, z0 + sd/2], thin:'y', grain:'x', fin:carcFin, ex:[0, 0, 200] });
    }
  }
  if (Bk) add('Rückwand', W - 2, Hc - 2, Bk.t, gBack, 'hinten aufgeschraubt, 1 mm rundum zurück', 'back',
    { size:[W - 2, Hc - 2, bt], pos:[0, bh + Hc/2, -D/2 + bt/2], thin:'z', grain:'x', fin:backFin, ex:[0, 0, -220] });

  // Untergestell
  let legs = 0;
  if (c.base === 'plinth') {
    const sb = 30, L1 = W - 2*sb, L2 = D - 2*sb - 2*t;
    for (const sz of [1, -1]) add('Sockelblende', L1, bh, t, gMain, sz > 0 ? 'vorne' : 'hinten', 'korpus',
      { size:[L1, bh, t], pos:[0, bh/2, sz*(D/2 - sb - t/2)], thin:'z', grain:'x', fin:carcFin, ex:[0, -110, 0] });
    for (const sx of [1, -1]) add('Sockel seitlich', L2, bh, t, gMain, 'zwischen den Blenden', 'korpus',
      { size:[t, bh, L2], pos:[sx*(W/2 - sb - t/2), bh/2, 0], thin:'x', grain:'z', fin:carcFin, ex:[0, -110, 0] });
  }
  if (c.base === 'legs') {
    const xs = W > 1300 ? [-1, 0, 1] : [-1, 1];
    const rBot = c.legShape === 'straight' ? 21 : 21 * (1 - clamp(c.taper, 10, 60) / 100);
    const legColor = c.legColor === 'black' ? '#1F2122' : '#B98B58';
    for (const xf of xs) for (const zf of [-1, 1]) extras.push({ type:'leg', x: xf*(W/2 - 55), z: zf*(D/2 - 55), h: bh, rBot, color: legColor });
    legs = xs.length * 2;
  }

  // Fronten
  const hingeCount = { full:0, half:0 };
  let handleCount = 0, frontCount = 0, doorsText = '';
  if (hinged) {
    const bounds = [-W/2, ...divX, W/2];
    const yb = bh + 1.5, yt = bh + Hc - 1.5, dh = yt - yb;
    const hpd = dh <= 900 ? 2 : dh <= 1600 ? 3 : 4;
    for (let j = 0; j < n; j++) {
      const span = bounds[j+1] - bounds[j];
      const dp = c.doorsPer === 'auto' ? (span > 620 ? 2 : 1) : Number(c.doorsPer);
      for (let k = 0; k < dp; k++) {
        const left = bounds[j] + k*span/dp, dw = span/dp - 3, cx = left + span/dp/2;
        const side = dp === 2 ? (k === 0 ? 'L' : 'R') : (n > 1 && j === n-1 ? 'R' : 'L');
        const hb = side === 'L' ? j : j + 1;
        const outer = hb === 0 || hb === n;
        hingeCount[outer ? 'full' : 'half'] += hpd;
        const key = add('Tür', dh, dw, tf, gFront, `${hpd}× Topfbohrung Ø ${cup} · Scharnier ${outer ? 'aufliegend' : 'halb aufliegend'}`, 'front');
        doors.push({ key, cx, dw, dh, yc: yb + dh/2, side });
        if (dw > 600) warn.push(`Eine Tür ist ${r0(dw)} mm breit. Ab etwa 600 mm werden Türen schwer und schwingen weit auf – wähle 2 Türen pro Fach.`);
      }
    }
    frontCount = doors.length;
    handleCount = c.handle === 'knob' ? frontCount : 0;
    doorsText = `${frontCount} Drehtür${frontCount > 1 ? 'en' : ''}`;
    if (c.base === 'none') warn.push('Ohne Füsse oder Sockel liegen die Türen nur 1,5 mm über dem Boden. Filzgleiter (mind. 3 mm) oder ein Untergestell verhindern Schleifen.');
  }
  let ns = 0, ws = 0, trackDepth = 0;
  if (sliding) {
    ns = c.slideN === 'auto' ? (Wi > 1500 ? 3 : 2) : Number(c.slideN);
    const ov = 30; ws = (Wi + (ns - 1)*ov) / ns;
    const dhs = Hi - 20;
    const zf = D/2 - 5 - tf/2, zb = zf - tf - 6;
    trackDepth = 2*tf + 12;
    for (let i = 0; i < ns; i++) {
      const left = -Wi/2 + i*(ws - ov);
      const key = add('Schiebetür', dhs, ws, tf, gFront, `${ov} mm Überlappung · Höhe nach Beschlag prüfen`, 'front');
      slides.push({ key, cx: left + ws/2, ws, dh: dhs, yc: bh + t + 10 + dhs/2, z: i % 2 === 0 ? zf : zb, shift: i === 0 ? ws - ov : 0, idx:i, last: i === ns - 1 });
    }
    extras.push({ type:'track', y: bh + t + 4, z: (zf + zb)/2, len: Wi, depth: trackDepth });
    extras.push({ type:'track', y: bh + t + Hi - 4, z: (zf + zb)/2, len: Wi, depth: trackDepth });
    frontCount = ns;
    doorsText = `${ns} Schiebetüren`;
    if (ws > 900) warn.push(`Schiebetüren mit ${r0(ws)} mm Breite sind schwer zu führen – nimm 3 Türen.`);
    if (tf < 16) warn.push(`Die meisten Schiebetürbeschläge für den Korpus sind für 16–19 mm Türen gemacht. Bei ${tf} mm im Datenblatt nach der Mindeststärke schauen oder dickere Fronten wählen.`);
  }
  // Dünne Türen verziehen sich (Richtwerte): 12 mm bis 600 mm Türhöhe, 15 mm bis 900 mm; Leimholz erst ab 18 mm.
  const doorH = hinged ? doors[0].dh : sliding ? slides[0].dh : 0;
  if (doorH) {
    const solid = !MF.ply && MF.grain && !MF.coated;
    if (solid && tf < 18) warn.push(`Türen aus ${MF.name} unter 18 mm werfen sich leicht – Massivholz arbeitet. 18 mm wählen.`);
    else if ((tf <= 12 && doorH > 600) || (tf <= 15 && doorH > 900)) warn.push(`Die Türen sind ${r0(doorH)} mm hoch – bei ${tf} mm verziehen sie sich leicht. Richtwert: 12 mm bis 600 mm, 15 mm bis 900 mm Türhöhe, darüber 18 mm.`);
  }

  // Aggregieren
  const rowsMap = new Map();
  for (const p of raw) {
    const r = rowsMap.get(p.key);
    if (r) r.qty++; else rowsMap.set(p.key, { ...p, qty:1 });
  }
  const rows = [...rowsMap.values()];
  rows.forEach((r, i) => { r.pos = String.fromCharCode(65 + i); });

  // Warnungen Statik & Sicherheit
  const span = t <= 16 ? 700 : t <= 19 ? 800 : 900;
  if (c.shelves && s > span) warn.push(`Die Einlegeböden sind ${r0(s)} mm breit. Bei ${t} mm Stärke biegen sie sich ab ca. ${span} mm unter Last durch – mehr Fächer wählen oder dickere Platte.`);
  if (!c.shelves && n === 1 && Wi > span + 200) warn.push(`Der Boden spannt ${r0(Wi)} mm frei. Eine Mittelwand macht den Korpus deutlich steifer.`);
  if (s < 180) warn.push(`Die Fächer sind nur ${r0(s)} mm breit – weniger Fächer wählen oder breiter bauen.`);
  if (!Bk) warn.push('Ohne Rückwand kann sich der Korpus verziehen. Setz hinten Metallwinkel in die Ecken oder wähle eine Rückwand.');
  if (c.joint === 'screws' && topOver) warn.push('Beim aufgesetzten Deckel sieht man die Schraubenköpfe auf der Oberseite. Tipp: Deckel mit Taschenlöchern oder Dübeln befestigen, oder Abdeckkappen verwenden.');
  if (c.joint === 'cam' && t >= 26) warn.push('Exzenterverbinder sind für 16–22 mm Platten gemacht. Bei dieser Stärke besser Dübel oder Taschenloch.');
  if (H > 1000 || H > 2.4*D) warn.push('Hoch und schmal kippt leicht, besonders mit offenen Türen. Den Korpus oben mit einem Kippschutz an der Wand sichern.');
  if (Hi < 150) warn.push('Der Innenraum ist sehr niedrig – mehr Höhe oder ein niedrigeres Untergestell wählen.');

  // Zuschnitt packen
  const groups = [];
  const mainItems = [], frontItems = [], backItems = [];
  for (const r of rows) for (let q = 0; q < r.qty; q++) (r.kind === 'back' ? backItems : r.group === gMain ? mainItems : frontItems).push(r);
  const sheetL = clamp(c.sheetL, 500, 3100), sheetB = clamp(c.sheetB, 300, 2100), kerf = clamp(c.kerf, 0, 8);
  groups.push({ label: gMain, sheet:[sheetL, sheetB], price: clamp(c.price, 0, 500), rotate: !(c.grain && M.grain), ...pack(mainItems, sheetL, sheetB, kerf, 10, !(c.grain && M.grain)) });
  // Fronten aus anderem Material oder anderer Stärke: eigene Platte mit Katalogformat und -preis.
  if (frontItems.length) {
    const rot = !(c.grain && MF.grain);
    groups.push({ label: gFront, sheet: MF.sheet, price: matPrice(MF, tf), rotate: rot, ...pack(frontItems, MF.sheet[0], MF.sheet[1], kerf, 10, rot) });
  }
  if (Bk) groups.push({ label: gBack, sheet: Bk.sheet, price: Bk.price, rotate: true, ...pack(backItems, Bk.sheet[0], Bk.sheet[1], kerf, 10, true) });
  for (const g of groups) for (const u of g.unplaced) warn.push(`Teil ${u.pos} (${u.name}, ${u.L} × ${u.B} mm) passt nicht auf die Platte ${g.sheet[0]} × ${g.sheet[1]} mm. Grösseres Plattenformat eintragen${g.rotate ? '' : ' oder Maserung freigeben'}.`);

  // Beschläge
  const hw = [];
  const lens = [Dp, Dp, Dp, Dp]; for (let i = 1; i < n; i++) lens.push(dd, dd);
  hw.push(...jointHardware(c, lens, t, bath, 'für Deckel, Boden und Mittelwände'));
  if (Bk) hw.push([Math.ceil(2*(W + Hc)/150) + (n - 1)*Math.ceil(Hc/200), 'Senkkopfschrauben 3 × 16 mm' + ss, 'Rückwand, alle 15 cm, auch in die Mittelwände']);
  else hw.push([4, 'Metallwinkel 40 × 40 mm inkl. Schrauben', 'hinten in die Ecken, gegen Verziehen']);
  if (c.shelves) hw.push([4*n*c.shelves, bath ? 'Bodenträger Ø 5 mm, Edelstahl' : 'Bodenträger Ø 5 mm (Metall)', '4 pro Einlegeboden']);
  if (hinged) {
    const typ = c.handle === 'push' ? 'ohne Feder (für Push-to-open)' : 'mit Softclose';
    const plate = (bath ? 'vernickelt oder Edelstahl, inkl. Montageplatte' : 'inkl. Montageplatte') + (cup === 26 ? `, für ${tf} mm dünne Türen` : '');
    if (hingeCount.full) hw.push([hingeCount.full, `Topfscharnier Ø ${cup} mm, 110°, aufliegend, ${typ}`, plate]);
    if (hingeCount.half) hw.push([hingeCount.half, `Topfscharnier Ø ${cup} mm, 110°, halb aufliegend (Mittelwand), ${typ}`, plate]);
    if (c.handle === 'knob') hw.push([frontCount, 'Holzknopf Ø 30 mm inkl. Schraube', 'Eiche oder Buche']);
    if (c.handle === 'push') hw.push([frontCount, 'Push-to-open-Beschlag (Magnet oder Tip-On)', 'einer pro Tür, oben an der Grifffseite']);
  }
  if (sliding) {
    hw.push([1, `Schiebetürbeschlag für Holztüren im Korpus, doppelspurig`, `Lauf- und Führungsschiene je ${r0(Wi)} mm, Gleiter für ${ns} Türen`]);
    if (c.handle === 'shell') hw.push([ns, 'Griffmuschel rund Ø 35 mm zum Einpressen', 'eine pro Tür']);
  }
  if (c.base === 'legs') {
    const shape = c.legShape === 'straight' ? 'gerade, Ø 42 mm' : `konisch, Ø 42 → ${r0(42 * (1 - clamp(c.taper, 10, 60) / 100))} mm`;
    hw.push([legs, `Möbelfüsse ${c.legColor === 'black' ? 'schwarz lackiert' : 'Eiche natur'}, ${bh} mm, ${shape}`, 'inkl. Anschraubplatte']);
    hw.push([legs*4, 'Holzschrauben 4 × 16 mm' + ss, 'für die Anschraubplatten']);
  }
  if (c.base === 'plinth') {
    hw.push([8, 'Holzschrauben 4 × 40 mm', 'Sockelecken verschrauben']);
    hw.push([4, 'Stahlwinkel 40 × 40 mm + Schrauben 4 × 16', 'Sockel unter den Boden schrauben']);
  }
  if (c.base === 'none') hw.push([4, 'Filzgleiter Ø 25 mm, 3–5 mm hoch', 'schont den Boden']);
  if (H > 1000 || H > 2.4*D) hw.push([1, 'Kippschutz-Set (Wandbefestigung)', 'Dübel passend zur Wand']);

  // Oberfläche
  const areaOf = kind => rows.filter(r => kind(r)).reduce((a, r) => a + r.qty * r.L * r.B / 1e6, 0);
  const finish = [];
  // Geölt wird rohes Holz; MDF und lackierte Fronten werden lackiert, beschichtete Platten bleiben, wie sie sind.
  const bodyOil = c.mat !== 'mdf' && !M.coated, frontOil = !paint && fmat !== 'mdf' && !MF.coated;
  const woodArea = areaOf(r => r.kind === 'front' ? frontOil : bodyOil && (r.kind === 'korpus' || bath)) * 2;
  const paintArea = areaOf(r => r.kind === 'front' ? !!paint : c.mat === 'mdf' && (r.kind === 'korpus' || bath)) * 2;
  const coats = bath ? 3 : 2;
  if (woodArea > 0) {
    if (bath) finish.push([`${Math.max(1, Math.ceil(woodArea * 3 / 10 * 10))} dl`, 'Wasserbasierter PU-Klarlack seidenmatt (für Feuchträume)', `${woodArea.toFixed(1)} m² rundum inkl. Rückwand, 3 Schichten, Kanten 1× extra`]);
    else finish.push([`${Math.max(1, Math.ceil(woodArea * 2 / 22 * 10))} dl`, 'Hartwachsöl, farblos oder weiss pigmentiert', `${woodArea.toFixed(1)} m² beidseitig, 2 Anstriche`]);
  }
  if (paintArea > 0) {
    finish.push([`${Math.max(1, Math.ceil(paintArea / 10 * 10))} dl`, bath ? 'Isoliergrund (feuchtigkeitssperrend), Kanten 2×' : c.mat === 'mdf' || fmat === 'mdf' ? 'Grundierung für MDF (Kanten 2×)' : 'Haftgrund', `${paintArea.toFixed(1)} m²`]);
    finish.push([`${Math.max(1, Math.ceil(paintArea * coats / 10 * 10))} dl`, `${bath ? 'PU-Möbellack' : 'Möbellack'} seidenmatt${paint ? ', ' + (COLOR_NAMES[c.color] || 'Weiss') : ''}`, `${coats} Schichten, Zwischenschliff Körnung 240`]);
  }
  if (bath) {
    for (const k of new Set([c.mat, fmat])) {
      if (k === 'mdf') warn.push('Bad: Normales MDF quillt bei Feuchtigkeit auf. Kauf MDF MR (feuchtigkeitsbeständig, meist mit grünem Kern) und versiegle alle Kanten doppelt.');
      if (MATS[k].ply) warn.push(`Bad: Verlang beim Kauf wasserfest verleimtes ${MATS[k].name} (EN 314-2 Klasse 3 bzw. «AW 100»). Die Schichtkanten saugen stark – mehrfach lackieren.`);
    }
    if (c.mat === 'fichte' || fmat === 'fichte') warn.push('Bad: Fichte ist weich und nimmt schnell Wasser auf. Rundum gut versiegeln oder für Spritzwasserbereiche Eiche bzw. wasserfestes Multiplex wählen.');
    if (c.back === 'hdf3') warn.push('Bad: Eine dünne MDF-Rückwand quillt bei Feuchtigkeit. Nimm besser eine Sperrholz-Rückwand und lackier sie beidseitig.');
    if (c.back === 'hf3') warn.push('Bad: Eine Hartfaser-Rückwand quillt bei Feuchtigkeit. Nimm besser eine Sperrholz-Rückwand und lackier sie beidseitig.');
    if (c.back === 'ply6') warn.push('Bad: Die Pappel-Rückwand beidseitig lackieren und hinten ein paar Millimeter Luft zur Wand lassen.');
    if (c.base === 'none') warn.push('Bad: Stell den Schrank auf Füsse oder montier ihn an der Wand – so steht er nie in einer Pfütze und du kannst darunter putzen.');
  }
  const coated = rows.filter(r => r.kind === 'front' ? MF.coated : M.coated);
  if (coated.length) finish.push([`${Math.ceil(coated.reduce((a, r) => a + r.qty * 2 * (r.L + r.B), 0) / 1000 / 5) * 5} m`, 'Kantenband zum Aufbügeln, passend zur Beschichtung', 'für sichtbare Kanten']);
  finish.push(['1', 'Schleifpapier Körnung 120, 180' + (paintArea || bath ? ', 240' : ''), 'Kanten leicht brechen']);

  // Werkzeug
  const tools = new Set(['Akkuschrauber mit Bit-Set', 'Holzbohrer 3–8 mm mit Tiefenstopp', 'Schraubzwingen (mind. 4)', 'Anschlagwinkel und Doppelmeter', 'Schwingschleifer oder Schleifklotz', 'Bleistift und Vorstecher']);
  jointTools(c, t, tools);
  if (c.shelves) tools.add('Lochreihen-Bohrschablone (32-mm-Raster) + Bohrer Ø 5 mm');
  if (hinged) tools.add(`Forstnerbohrer Ø ${cup} mm + Scharnier-Bohrlehre`);
  if (sliding) { tools.add('Eisensäge zum Kürzen der Schienen'); if (c.handle === 'shell') tools.add('Forstnerbohrer Ø 35 mm'); }
  if (c.front !== 'open' && c.handle === 'hole') tools.add('Forstnerbohrer Ø 30 mm + Restholz gegen Ausrisse');
  tools.add(paintArea || bath ? 'Schaumstoffrolle und Lackpinsel' : 'Baumwolllappen oder Pinsel für Öl');

  // Bauablauf
  const steps = buildSteps({ c, bath, glueName, t, n, topOver, hinged, sliding, Bk, bh, dd, slideSet, paint, paintArea, ns, MF, cup });

  const level = Math.min(3, JOINTS[c.joint].level + (c.front === 'open' ? 0 : 1));
  const Dtot = hinged ? D + tf + 1 : D;
  return { W, H, D, Dtot, t, bh, Hc, Dp, Wi, Hi, n, s, M, Bk, rows, boxes, doors, slides, extras, groups, hw, finish, tools:[...tools], steps, warn:[...new Set(warn)], carcFin, frontFin, level, doorsText, handle:c.handle, front:c.front, joint:c.joint, matShort, tf, MF, gFront };
}

function buildSteps(o){
  const { c, bath, glueName, t, n, topOver, hinged, sliding, Bk, bh, slideSet, paint, paintArea, ns, MF, cup } = o;
  const st = [];
  const mdf = c.mat === 'mdf';
  // Fronten mit anderer Oberfläche als der Korpus: ein Satz mehr beim Oberflächen-Schritt.
  const bodyKind = mdf ? 'lack' : MATS[c.mat].coated ? 'coated' : 'oil';
  const frontKind = c.front === 'open' ? bodyKind : paint ? 'lack' : MF.coated ? 'coated' : 'oil';
  const frontNote = frontKind === bodyKind || (bodyKind === 'oil' && frontKind === 'lack') ? '' : {
    lack: ' Die Fronten grundieren und zweimal lackieren.',
    oil: ' Die Fronten mit Hartwachsöl zweimal ölen.',
    coated: ' Die Fronten sind fertig beschichtet – nur ihre sichtbaren Kanten mit Kantenband bekleben.'
  }[frontKind];
  st.push(['Zuschnitt organisieren', 'Kopier die Zuschnittliste und lass die Platten im Baumarkt oder bei einer Schreinerei zuschneiden – das ist auf den Millimeter genauer als zu Hause mit der Handkreissäge. Die erste Zahl liegt jeweils in Faserrichtung.', 'Frag nach dem Zuschnitt, ob die Teile beschriftet werden können.']);
  st.push(['Teile beschriften und schleifen', 'Schreib jedem Teil den Positionsbuchstaben auf die Innenseite und markier «vorne» und «oben». Flächen und Kanten mit Körnung 120, dann 180 schleifen, Kanten leicht brechen.', null]);
  if (c.shelves) st.push(['Löcher für Bodenträger bohren', `Mit der Lochreihen-Schablone Löcher Ø 5 mm in die Innenseiten der Seiten${n > 1 ? ' und in beide Seiten der Mittelwände' : ''} bohren, je ca. 40 mm von vorne und hinten, 10 mm tief.${n > 1 ? ' Bei den Mittelwänden nur 8 mm tief und die zweite Seite um 16 mm versetzt bohren, damit nichts durchbricht.' : ''}`, 'Tiefenstopp auf dem Bohrer setzen – ein Stück Klebeband tut es auch.']);
  const between = topOver ? 'den Boden' : 'Deckel und Boden';
  if (c.joint === 'pocket') st.push(['Taschenlöcher bohren', `Bohrlehre auf ${t} mm Plattenstärke einstellen. Taschenlöcher an beiden Enden von ${between}${n > 1 ? ' und der Mittelwände' : ''} bohren, alle ca. 15 cm und 40 mm von vorne und hinten.${topOver ? ' Für den aufgesetzten Deckel die Taschenlöcher oben innen in die Seiten bohren.' : ''} Die Löcher kommen immer auf Innen- oder Unterseiten – beim Boden auf die Unterseite.`, null]);
  if (c.joint === 'screws') st.push(['Schraublöcher vorbohren', `Schraubpositionen anreissen: ${t/2} mm von der Plattenkante, alle ca. 15 cm, 40 mm von vorne und hinten. In ${topOver ? 'Deckel (von oben) und Seiten' : 'die Seiten'} Ø ${mdf ? '5' : '4'} mm durchbohren und ansenken. In die Stirnkante des Gegenstücks Ø ${mdf ? '5 mm mit Stufenbohrer (Konfirmat)' : '2,5–3 mm'} vorbohren.`, mdf ? 'MDF reisst ohne Vorbohren an den Kanten auf.' : 'Mittig in die Kante bohren – ein Anschlag an der Bohrmaschine hilft.']);
  if (c.joint === 'dowels') st.push(['Dübellöcher bohren', `Dübel alle ca. 12 cm setzen, 40 mm von vorne und hinten. Mit Dübellehre oder Dübelmarkierern die Positionen übertragen. In der Plattenfläche ${t <= 16 ? '10' : '12'} mm tief bohren (nie durch!), in der Stirnkante ${t <= 16 ? '20' : '28'} mm.`, 'Erst eine Probeverbindung mit Reststücken machen.']);
  if (c.joint === 'cam') st.push(['Bohrungen für Exzenter', `Exzentergehäuse Ø 15 mm mit dem Forstnerbohrer in die Innenseiten von ${between}${n > 1 ? ' und die Mittelwände' : ''} bohren, Tiefe und Randabstand gemäss Hersteller (meist 12,5 mm tief, 24 oder 34 mm von der Kante). Passende Löcher für die Bolzen in die Gegenstücke.`, 'Eine Bohrschablone spart viel Anreissen und Fehler.']);
  const glue = c.joint === 'dowels' ? ` Dübel und Kontaktflächen dünn mit ${glueName} bestreichen, zusammenschieben und mit Zwingen pressen. Austretenden Leim sofort feucht abwischen.` : '';
  if (bath) st.push(['Alle Teile rundum versiegeln – vor der Montage', `Im Bad muss jedes Teil von allen Seiten geschützt sein, auch Innenseiten, Unterseite und Rückwand. ${hinged || (c.front !== 'open' && (c.handle === 'hole' || c.handle === 'shell')) ? 'Bohr die Topfbohrungen und Grifflöcher schon jetzt, damit auch sie versiegelt werden. ' : ''}${mdf ? 'Isoliergrund auftragen, Kanten zweimal, dann ' : 'Dann '}${mdf || paint ? 'PU-Lack' : 'wasserbasierten PU-Klarlack'} in 3 dünnen Schichten auftragen, mit Zwischenschliff Körnung 240. Alle Kanten und Bohrlöcher bekommen eine Schicht extra. Die Verbindungsflächen für den Leim frei lassen.`, 'Leg die Teile auf Leisten oder Nägel, dann kannst du beide Seiten nacheinander streichen.']);
  st.push(['Korpus zusammenbauen', `Zuerst alles trocken zusammenstecken. Dann den Boden zwischen die Seiten setzen, ${topOver ? 'den Deckel oben auflegen' : 'den Deckel zwischen die Seiten setzen'}${n > 1 ? ' und die Mittelwände dazwischen einpassen' : ''}.${glue} Arbeite auf einer ebenen Fläche und kontrollier jede Ecke mit dem Winkel.`, 'Zu zweit geht es deutlich einfacher.']);
  if (Bk) st.push(['Rechtwinklig ausrichten, Rückwand montieren', 'Beide Diagonalen messen – sind sie gleich lang, ist der Korpus rechtwinklig. Rückwand auflegen, rundum 1 mm zurück, und alle 15 cm verschrauben, auch in die Hinterkanten der Mittelwände. Die Rückwand macht den Korpus stabil.', null]);
  else st.push(['Rechtwinklig ausrichten und aussteifen', 'Beide Diagonalen messen, bis sie gleich lang sind. Dann hinten in allen vier Ecken Metallwinkel setzen.', null]);
  if (c.base === 'legs') st.push(['Füsse montieren', `Korpus auf eine Decke legen. Anschraubplatten ca. 55 mm von den Aussenkanten unter den Boden schrauben und die ${bh} mm hohen Füsse eindrehen.`, 'Schrauben nicht länger als Bodenstärke minus 3 mm.']);
  if (c.base === 'plinth') st.push(['Sockel bauen und montieren', 'Die vier Sockelteile zu einem Rahmen verschrauben (Blenden aussen, Seitenteile dazwischen). Rahmen 30 mm zurückversetzt unter den Boden stellen und mit den Stahlwinkeln festschrauben.', 'Der zurückgesetzte Sockel lässt das Möbel schweben.']);
  if (bath) { /* bereits vor der Montage versiegelt */ }
  else if (mdf) st.push(['Grundieren und lackieren', 'MDF-Kanten saugen stark: Kanten zweimal grundieren, dann alles mit Körnung 240 zwischenschleifen und zweimal lackieren.' + frontNote, null]);
  else if (MATS[c.mat].coated) st.push(['Kanten versäubern', 'Die Flächen sind fertig beschichtet. Sichtbare Kanten mit dem Bügeleisen und Kantenband bekleben, Überstand mit dem Kantenfräser oder Cutter abnehmen.' + frontNote, null]);
  else st.push(['Oberfläche ölen', `Staub entfernen und Hartwachsöl dünn mit Lappen oder Pinsel auftragen, nach 15 Minuten Überschuss abnehmen. Nach dem Trocknen ein zweites Mal.${paint ? ' Die Fronten vorher grundieren und zweimal lackieren.' : frontNote}`, 'Weiss pigmentiertes Öl gibt den hellen, nordischen Ton.']);
  if (hinged) st.push(['Türen anschlagen', `In jede Tür Topfbohrungen Ø ${cup} mm, ${cup === 35 ? 'ca. 12 mm tief' : 'Tiefe laut Datenblatt (die Tür ist dünn – nie durchbohren)'}, Randabstand meist 3–5 mm (Datenblatt!), ca. 100 mm von oben und unten. Montageplatten an die Seiten bzw. Mittelwände schrauben, Scharniere einklipsen und mit den Stellschrauben auf gleichmässige 3-mm-Fugen einstellen.`, 'Eine Scharnier-Bohrlehre sorgt für gerade, gleich tiefe Löcher.']);
  if (sliding) st.push(['Schiebetüren einsetzen', `Untere Laufschiene auf den Boden und obere Führungsschiene unter den Deckel schrauben, 5 mm hinter der Vorderkante, beide auf ${r0(o.c.W - 2*t)} mm gekürzt. Gleiter an die ${ns} Türen montieren, Türen oben einheben und unten einsetzen.`, 'Die Türhöhe hängt vom Beschlag ab – im Zweifel die Türen erst zuschneiden, wenn der Beschlag da ist.']);
  if (c.front !== 'open') {
    if (c.handle === 'hole') st.push(['Grifflöcher bohren', 'Position anzeichnen, Restholz hinter die Tür spannen und mit dem Forstnerbohrer Ø 30 mm durchbohren. Kante innen und aussen leicht brechen.', null]);
    if (c.handle === 'knob') st.push(['Knöpfe montieren', 'Position anzeichnen (ca. 45 mm vom Rand, 70 mm von oben), Ø 5 mm durchbohren und Knöpfe von hinten festschrauben.', null]);
    if (c.handle === 'push') st.push(['Push-to-open einbauen', 'Beschlag innen an die Seite bzw. Mittelwand auf der Griffseite schrauben, Türen so einstellen, dass etwa 2 mm Luft zum Drücken bleibt.', null]);
    if (c.handle === 'shell') st.push(['Griffmuscheln einsetzen', 'Mit dem Forstnerbohrer Ø 35 mm nach Herstellerangabe tief bohren (nicht durch) und die Griffmuscheln einpressen.', null]);
  }
  if (c.shelves) st.push(['Einlegeböden einlegen', 'Bodenträger in die gewünschte Höhe stecken und die Einlegeböden auflegen.', null]);
  return st;
}

if (typeof module !== 'undefined') module.exports = { computeSideboard, buildSteps, frontMaterial, frontTs, FRONT_MAX };
