/* Konfigurationen als Formularwerte: umrechnen, würfeln, sammeln. Ohne DOM; braucht die Globals aus shared.js, sideboard.js, reduit.js. */
'use strict';

// Formularwerte (wie gespeichert: name → Wert) in die Eingabe der Berechnung.
function cfgFromData(d){
  const n = k => Number(d[k]), on = k => d[k] === true || d[k] === 'on';
  return {
    W:n('w'), H:n('h'), D:n('d'), room:d.room, mat:d.mat, t:n('t'), back:d.back, top:d.top,
    sections:n('sections'), shelves:n('shelves'), base:d.base, baseH:n('baseH'), legShape:d.legShape, taper:n('taper'), legColor:d.legColor, joint:d.joint,
    front:d.front, doorsPer:d.doorsPer, slideN:d.slideN, handle:d.handle, color:d.color, frontMat:d.frontMat, frontT:n('frontT'),
    sheetL:n('sheetL'), sheetB:n('sheetB'), kerf:n('kerf'), grain:on('grain'), price:n('price'),
    kind:d.kind, bw:d.bw,
    rw:n('rw'), rd:n('rd'), rh:n('rh'), doorW:n('doorW'), doorPos:d.doorPos, doorOff:n('doorOff'), doorH:n('doorH'), doorIn:on('doorIn'), hinge:d.hinge, wall:d.wall,
    shape:d.shape, corner:d.corner, build:d.build, sys:d.sys,
    dBack:n('dBack'), dLeft:n('dLeft'), dRight:n('dRight'), nShelves:n('nShelves'), gapBottom:n('gapBottom'), gapTop:n('gapTop'),
    nicheL:on('nicheL'), nicheLW:n('nicheLW'), nicheLH:n('nicheLH'),
    nicheR:on('nicheR'), nicheRW:n('nicheRW'), nicheRH:n('nicheRH')
  };
}

// Katalogpreis und -format zum Material; wie beim Wechsel im Formular.
function withCatalog(d){
  const M = MATS[d.mat], t = M.t.includes(Number(d.t)) ? Number(d.t) : M.tDef;
  return { ...d, t, price:matPrice(M, t), sheetL:M.sheet[0], sheetB:M.sheet[1] };
}

/* ---------- Regeln ---------- */
// Sofort-Sperren aus dem Schreiner-Review (docs/review/2026-09-28-eingrenzung-regeln.md, Kapitel 3.4 im Bericht).
// sperren:     die Option ist im Formular aus, mit Grund; ist sie trotzdem gesetzt (alter Entwurf, Sammlung, Zufall),
//              weicht der Wert auf den nächsten erlaubten aus und meldet das als Korrektur.
// grenze:      Zahlenfeld mit eigenem min/max (Grund im Formular), Werte ausserhalb werden angepasst.
// warnen:      Meldung, der Wert bleibt.
// Eine Sperre trifft immer das spätere Feld: Einsatzort, Wand → Bauart → Material → Stärke → Front → Rückwand → Verbindung → Maserung → Masse.
const LEIMHOLZ = k => { const M = MATS[k]; return !!M && M.grain && !M.ply && !M.coated; };
const istSideboard = c => c.kind !== 'reduit', freiStehend = c => c.kind === 'reduit' && c.build === 'free';
const eingebaut = c => c.kind === 'reduit' && c.build !== 'free';
const mitVerbindung = c => istSideboard(c) || freiStehend(c);   // Korpusverbindung: Sideboard und selbststehende Module
// Ausweichreihenfolge, wenn der gesetzte Wert gesperrt ist (Stärke: nächste erlaubte Stärke des Materials).
const AUSWEICH = {
  joint:['pocket', 'dowels', 'cam', 'screws'], front:['hinged', 'sliding', 'open'], back:['hdf3', 'ply6', 'hf3', 'none'],
  sys:['posts', 'battens', 'cheeks', 'rails', 'brackets'], mat:['birke', 'mdf', 'fichtesp', 'birkesi'], frontMat:['korpus'], grain:['true'],
  top:['over', 'between'], build:['built', 'free'], sections:['1', '2', '3', '4'],
  bw:{ sideboard:['S1', 'S2', 'S4', 'S6', 'S5', 'S3'], reduit:['R2', 'R6', 'R5', 'R3', 'R4', 'R1'] }
};
// Wandschienen: kürzeste Konsole 250 mm + Schiene 12 mm + 10 mm Luft vorne, gerundet.
const TIEFE_MAX_WINKEL = 375, TIEFE_MIN_SCHIENE = 280;
// Seitenregale höchstens so viel tiefer als hinten (Entscheid 28.09.2026: begrenzen statt durchlaufen lassen).
const SEITE_MEHR = 100;
// Tiefenfelder der Regale, die es in dieser Form gibt.
const tiefenFelder = c => ['dBack', ...(c.shape === 'U' || (c.shape === 'L' && c.corner !== 'R') ? ['dLeft'] : []), ...(c.shape === 'U' || (c.shape === 'L' && c.corner === 'R') ? ['dRight'] : [])];
// Wandschenkel der Tablarwinkel für das tiefste Regal dieser Form.
const winkelWand = c => WINKEL_WAND[winkelFuer(Math.max(...tiefenFelder(c).map(k => c[k])))];
// Höhe der untersten Auflage unter dem Tablar (Leiste, Latte, Schiene, Wandschenkel des Tablarwinkels).
function auflageUnten(c){
  if (c.sys === 'battens' || c.sys === 'posts') return 48;   // Dachlatte hochkant
  if (c.sys === 'rails') return 60;
  if (c.sys === 'brackets') return winkelWand(c);
  return 0;
}
// Tablarwinkel: Der Wandschenkel hängt unter dem Tablar und darf das Tablar darunter nicht treffen (Review K09,
// «lichte Höhe < Wandschenkel → ein Tablar weniger»). Lichte Höhe mindestens Wandschenkel + 10 mm.
const tablareMaxWinkel = c => Math.max(1, Math.floor((c.rh - c.gapTop - c.gapBottom) / (winkelWand(c) + c.t + 10)) + 1);
// Wandschienen: Jede Schiene reicht 60 mm unter das unterste bis 40 mm über das oberste Tablar. Die kleinste Deckenlücke,
// bei der eine Schiene 2000 mm reicht; liegt sie höchstens 300 mm über dem Standard (300 mm), gilt sie als Grenze,
// statt für einen kleinen Rest ein zweites Stück zu kaufen (Review K08, TR-13). Darüber: zwei Stücke je ≥ 500 mm.
const DECKE_STANDARD = 300, SCHIENE_TIEFER = 300;
const deckeFuerSchiene = c => Math.ceil((c.rh - c.gapBottom + 100 - RAIL_MAX) / 10) * 10;
const schieneReicht = c => eingebaut(c) && c.sys === 'rails' && c.nShelves > 1 && deckeFuerSchiene(c) <= DECKE_STANDARD + SCHIENE_TIEFER;
// Korpus beim Sideboard sowie Wangen und hohe Module im Reduit: mindestens 18 mm (Entscheid 28.09.2026).
const KORPUS_MIN = 18;
const fachSpan = c => maxSpan(c.mat, c.t) + (c.shelves ? 0 : 200);
const hoheSeiten = c => c.kind === 'reduit' && (c.build === 'free' ? c.rh - c.gapTop > 1200 : c.sys === 'cheeks');
// Brettbreiten, die in [a, b] liegen (ganze Bretter); bei Plattenmaterial null.
const breitenIn = (c, a, b) => { const M = MATS[c.mat]; return M && M.boards ? M.widths.filter(w => w >= a && w <= b) : null; };
const TIEFEN = ['dBack', 'dLeft', 'dRight'];
// Tiefe, mit der gerechnet wird: Bei ganzen Brettern rundet normReduit auf die nächste Brettbreite auf.
const brettTiefe = (c, v) => { const M = MATS[c.mat]; return M && M.boards ? M.widths.find(w => w >= v) ?? M.widths[M.widths.length - 1] : v; };
/* ---------- Bauweisen ---------- */
// Eine Bauweise bündelt Material, Stärke, Verbindung, Rückwand und Oberfläche zu einer geprüften Kombination
// (docs/review/2026-09-28-eingrenzung-bauweisen.md; Entscheide 28. und 30.09.2026). Frei bleiben Masse, Aufteilung
// und die Optik innerhalb der Bauweise. mats: Material → erlaubte Stärken; bad: Materialien im Bad (fehlt: nicht
// im Bad); front: Frontmaterialien (korpus = wie Korpus); Reduit: build und sys legen die Bauart fest.
const SPERRHOLZ = { birke:[18], birkesi:[18], fichtesp:[18], dreischicht:[19] };
// Reduit: Sperrholz Fichte zuerst (Reduit-Standard). Weicht ein Material auf die Bauweise aus, nimmt es das erste – Birke mit
// Maserung längs der 1500er-Seite hätte für raumhohe Wangen und Modulseiten keine passende Platte.
const SPERRHOLZ_REDUIT = { fichtesp:[18], birke:[18], birkesi:[18], dreischicht:[19] };
// Tablare für Leisten, Pfosten, Schienen, Winkel: Platten und ganze Bretter ab 15 mm; MDF nur beim Pfostenrahmen (19 mm).
const tablarMats = mitMdf => Object.fromEntries(Object.entries(MATS)
  .map(([k, M]) => [k, k === 'mdf' ? (mitMdf ? [19] : []) : M.t.filter(t => t >= 15)]).filter(([, ts]) => ts.length));
const BAUWEISEN = {
  sideboard: [
    { id:'S1', name:'Sperrholz geölt', desc:'Für den Einstieg, heller Skandi-Look mit sichtbaren Schichtkanten.', niveau:[1, 2],
      mats:SPERRHOLZ, bad:['birke', 'birkesi'], joint:'pocket', backs:['hdf3', 'hf3', 'ply6'], front:['korpus', 'mdf'],
      oberflaeche:'Hartwachsöl – Farbe nur mit Isoliergrund' },
    { id:'S2', name:'MDF lackiert', desc:'Glatte Flächen in Farbe. Gedübelt und verleimt, vor dem Zusammenbau lackiert.', niveau:[2, 3],
      mats:{ mdf:[19] }, bad:['mdf'], joint:'dowels', backs:['hdf3'], front:['korpus', 'mdf'],
      oberflaeche:'Grundierung und Möbellack' },
    { id:'S3', name:'Weiss beschichtet, zerlegbar', desc:'Günstig und zerlegbar wie ein Fertigmöbel. Exzenter, Kanten mit Kantenband.', niveau:[2, 3],
      mats:{ dekorspan:[19] }, joint:'cam', backs:['hdf3', 'hf3'], front:['korpus', 'mdf'],
      oberflaeche:'Kantenband, nicht schleifen' },
    { id:'S4', name:'Massivholz geölt', desc:'Leimholz Eiche oder Fichte, gedübelt – ein Möbel fürs Leben.', niveau:[2, 3],
      mats:{ eiche:[18], fichte:[18] }, bad:['eiche'], joint:'dowels', backs:['ply6', 'hdf3'], front:['korpus', 'dreischicht'],
      oberflaeche:'Hartwachsöl, Eiche nie lackieren' },
    { id:'S5', name:'Sperrholz verschraubt', desc:'Ohne Spezialwerkzeug, die Schraubenköpfe sind Teil der Gestaltung.', niveau:[1, 2],
      mats:{ birke:[18], fichtesp:[18], dreischicht:[19] }, joint:'screws', top:'between', backs:['hdf3', 'hf3', 'ply6'], front:['korpus', 'mdf'],
      oberflaeche:'Hartwachsöl' },
    { id:'S6', name:'Sperrholz zerlegbar', desc:'Sperrholz mit Exzentern – lässt sich für den Umzug zerlegen und wieder aufbauen.', niveau:[2, 3],
      mats:SPERRHOLZ, joint:'cam', backs:['hdf3', 'hf3', 'ply6'], front:['korpus', 'mdf'],
      oberflaeche:'Hartwachsöl – Farbe nur mit Isoliergrund' }
  ],
  reduit: [
    { id:'R2', name:'Pfostenrahmen', desc:'Latten rundum als Auflage, Kanthölzer vor den Tablaren – das klassische Kellerregal.', niveau:[1],
      build:'built', sys:'posts', mats:tablarMats(true), walls:['solid', 'drywall'],
      tragwerk:'Latten rundum, Pfosten höchstens 1200 mm auseinander, Eckpfosten an jeder Innenecke' },
    { id:'R1', name:'Leisten', desc:'Leisten an der Wand, vorne frei – für kurze Wände und Nischen.', niveau:[1],
      build:'built', sys:'battens', mats:tablarMats(false), walls:['solid', 'drywall'],
      tragwerk:'Wand- und Endleisten aus Dachlatte 24 × 48, Eckstütze an jeder Innenecke' },
    { id:'R3', name:'Wandschienen', desc:'Tablare auf Konsolen, Höhen jederzeit verstellbar.', niveau:[1],
      build:'built', sys:'rails', mats:tablarMats(false), walls:['solid'], tragwerk:'Schienen mit Konsolen, Tablar vor der Schiene' },
    { id:'R4', name:'Tablarwinkel', desc:'Blechkonsolen für flache Tablare bis 375 mm Tiefe.', niveau:[1],
      build:'built', sys:'brackets', mats:tablarMats(false), walls:['solid'], tragwerk:'Blechkonsolen, langer Schenkel an der Wand' },
    { id:'R5', name:'Wangen mit Lochreihe', desc:'Alles aus Holz, Tablare auf Bodenträgern verstellbar.', niveau:[2],
      build:'built', sys:'cheeks', mats:SPERRHOLZ_REDUIT, walls:['solid', 'drywall'], tragwerk:'Wangen mit 32er-Lochreihe, oben an die Wand' },
    { id:'R6', name:'Selbststehende Module', desc:'Korpusse mit Rückwand, tragen sich selbst – zügelbar, gut für Mietwohnung und Gipskarton.', niveau:[2],
      build:'free', mats:{ ...SPERRHOLZ_REDUIT, dekorspan:[19], mdf:[19] }, joint:c => ['dekorspan', 'mdf'].includes(c.mat) ? 'cam' : 'pocket',
      backs:['hdf3', 'hf3', 'ply6'], walls:['solid', 'drywall'], tragwerk:'Korpusmodule mit Rückwand, Kippsicherung' }
  ]
};
const BW = Object.fromEntries([...BAUWEISEN.sideboard, ...BAUWEISEN.reduit].map(b => [b.id, b]));
const bwKind = c => BAUWEISEN[c.kind === 'reduit' ? 'reduit' : 'sideboard'];
const bwVon = c => c.bw && BW[c.bw] && bwKind(c).includes(BW[c.bw]) ? BW[c.bw] : null;
const bwJoint = (b, c) => typeof b.joint === 'function' ? b.joint(c) : b.joint;
// Materialien der Bauweise, im Bad beim Sideboard nur die dafür vorgesehenen.
const bwMats = (b, c) => istSideboard(c) && c.room === 'bath' ? (b.bad || []) : Object.keys(b.mats);
// Welche Bauweise passt zu älteren Formularwerten am besten? Einsatzort, dann Material, dann Verbindung (Review, Abschnitt 6).
function bauweiseVon(d){
  const c = cfgFromData(d);
  if (c.kind === 'reduit') return c.build === 'free' ? 'R6' : ({ battens:'R1', posts:'R2', rails:'R3', brackets:'R4', cheeks:'R5' })[c.sys] || 'R2';
  if (c.mat === 'mdf') return 'S2';
  if (c.mat === 'dekorspan') return c.room === 'bath' ? 'S2' : 'S3';
  if (c.mat === 'eiche' || c.mat === 'fichte') return 'S4';
  if (c.room === 'bath') return 'S1';
  return c.joint === 'screws' ? 'S5' : c.joint === 'cam' ? 'S6' : 'S1';
}
// Leisten: Wie weit liegen die Tablare vorne frei, und was trägt das Material? (gerechnet wie mit Leisten gebaut)
const leistenCache = new Map();
function leistenFrei(c){
  const R1 = BW.R1, mat = R1.mats[c.mat] ? c.mat : 'fichtesp';
  const t = R1.mats[mat].includes(c.t) ? c.t : R1.mats[mat][0];
  const key = JSON.stringify([c.rw, c.rd, c.rh, c.shape, c.corner, c.dBack, c.dLeft, c.dRight, c.doorW, c.doorIn, c.hinge, c.doorPos, c.doorOff,
    c.nShelves, c.gapBottom, c.gapTop, c.nicheL, c.nicheLW, c.nicheLH, c.nicheR, c.nicheRW, c.nicheRH, mat, t]);
  if (!leistenCache.has(key)) {
    if (leistenCache.size > 200) leistenCache.clear();
    const R = computeReduit({ ...c, build:'built', sys:'battens', mat, t });
    leistenCache.set(key, { frei:R.frei, max:R.max, name:MATS[mat].name, t });
  }
  return leistenCache.get(key);
}
// Warum ist eine Bauweise hier nicht möglich? null = möglich.
function bwSperre(b, c){
  if (istSideboard(c)) return c.room === 'bath' && !b.bad ? 'Nicht fürs Bad vorgesehen.' : null;
  // Gipskarton: Schienen und Winkel halten nur in den Ständern. Ein Ständerraster als Eingabe lohnt sich nicht
  // (Entscheid 01.10.2026): Pfostenrahmen, Leisten, Wangen und Module tragen über Latten oder in den Boden.
  if (c.wall === 'drywall' && !b.walls.includes('drywall')) return `Nicht auf Gipskarton: ${b.sys === 'rails' ? 'Schienen ziehen' : 'Winkel ziehen'} an den Dübeln und hielten nur in den Ständern.`;
  if (b.id === 'R1') {
    const L = leistenFrei(c);
    if (L.frei >= L.max) return `Die Tablare liegen vorne bis ${L.frei} mm frei – ${L.name} ${L.t} mm trägt ca. ${L.max} mm. Pfostenrahmen nehmen.`;
  }
  // Tür nach innen: Hinten bleibt weniger Tiefe, als die Bauweise mindestens braucht (Wandschienen ab 280 mm).
  const hinten = grenzen({ ...c, build:b.build, sys:b.sys || c.sys }).dBack;
  if (hinten && hinten.min > hinten.max && hinten.min > RANGES.dBack[0])
    return `Vor der nach innen aufgehenden Tür bleiben hinten höchstens ${hinten.max} mm Tiefe – ${b.name} brauchen mindestens ${hinten.min} mm.`;
  return null;
}
// Regeln der gewählten Bauweise: Was nicht zu ihr gehört, ist gesperrt; das Regelwerk weicht dann auf ihre Werte aus.
const nichtIn = (alle, ok) => alle.filter(w => !ok.includes(w));
const BW_REGELN = [
  { id:'BW', wirkung:'sperren', feld:'bw', werte:c => c.bw == null ? [] : [...Object.keys(BW).filter(k => !bwKind(c).includes(BW[k])), ...bwKind(c).filter(b => bwSperre(b, c)).map(b => b.id)],
    grund:(c, w) => BW[w] && bwKind(c).includes(BW[w]) ? bwSperre(BW[w], c) : 'Gehört zum anderen Möbeltyp.', befunde:['Bauweisen'] },
  { id:'BW', wirkung:'sperren', feld:'mat', werte:c => { const b = bwVon(c); return b ? nichtIn(Object.keys(MATS), bwMats(b, c)) : []; },
    grund:c => istSideboard(c) && c.room === 'bath' ? `Im Bad gehört dieses Material nicht zur Bauweise «${bwVon(c).name}».` : `Gehört nicht zur Bauweise «${bwVon(c).name}».`, befunde:['Bauweisen'] },
  { id:'BW', wirkung:'sperren', feld:'t', werte:c => { const b = bwVon(c); return b && b.mats[c.mat] ? nichtIn(MATS[c.mat].t, b.mats[c.mat]) : []; },
    grund:c => `Die Bauweise «${bwVon(c).name}» nimmt ${MATS[c.mat].name} in ${bwVon(c).mats[c.mat].map(t => t + ' mm').join(' oder ')}.`, befunde:['Bauweisen'] },
  { id:'BW', wirkung:'sperren', feld:'joint', werte:c => { const b = bwVon(c); return b && b.joint && mitVerbindung(c) ? nichtIn(Object.keys(JOINTS), [bwJoint(b, c)]) : []; },
    grund:c => `Die Bauweise «${bwVon(c).name}» verbindet mit ${JOINTS[bwJoint(bwVon(c), c)].name}.`, befunde:['Bauweisen'] },
  { id:'BW', wirkung:'sperren', feld:'build', werte:c => { const b = bwVon(c); return b && b.build ? nichtIn(['built', 'free'], [b.build]) : []; },
    grund:c => `Folgt aus der Bauweise «${bwVon(c).name}».`, befunde:['Bauweisen'] },
  { id:'BW', wirkung:'sperren', feld:'sys', werte:c => { const b = bwVon(c); return b && b.sys ? nichtIn(Object.keys(SYS), [b.sys]) : []; },
    grund:c => `Folgt aus der Bauweise «${bwVon(c).name}».`, befunde:['Bauweisen'] },
  // Im Bad gilt für jede Bauweise die Pappel-Rückwand, beidseitig lackiert (Review, Zusatz «Bad»).
  { id:'BW', wirkung:'sperren', feld:'back', werte:c => { const b = bwVon(c); return b && b.backs && (istSideboard(c) || freiStehend(c)) ? nichtIn(['hdf3', 'hf3', 'ply6', 'none'], istSideboard(c) && c.room === 'bath' ? ['ply6'] : b.backs) : []; },
    grund:c => `Gehört nicht zur Bauweise «${bwVon(c).name}».`, befunde:['Bauweisen'] },
  { id:'BW', wirkung:'sperren', feld:'frontMat', werte:c => { const b = bwVon(c); return b && b.front ? nichtIn(['korpus', ...Object.keys(MATS)], b.front) : []; },
    grund:c => `Gehört nicht zur Bauweise «${bwVon(c).name}».`, befunde:['Bauweisen'] },
  { id:'BW', wirkung:'sperren', feld:'frontT', werte:c => { const b = bwVon(c), M = MATS[c.frontMat]; return b && b.front && M ? frontTs(M).filter(t => t < 16) : []; },
    grund:() => 'Fronten ab 16 mm – dünnere Türen verziehen sich und brauchen Spezialscharniere.', befunde:['SF-3', 'SF-10'] },
  { id:'BW', wirkung:'sperren', feld:'top', werte:c => { const b = bwVon(c); return b && b.top ? nichtIn(['over', 'between'], [b.top]) : []; },
    grund:c => `Bei «${bwVon(c).name}» sitzt der Deckel zwischen den Seiten – sonst sieht man die Schraubenköpfe oben.`, befunde:['SK-14'] }
];

const REGELN = [
  { id:'S01', wirkung:'sperren', feld:'t', werte:c => istSideboard(c) ? MATS[c.mat].t.filter(t => t < KORPUS_MIN) : [],
    grund:() => `Nur für Fronten – der Korpus braucht mindestens ${KORPUS_MIN} mm, darauf sind Verbindungen, Scharniere und Schrauben ausgelegt.`, befunde:['SK-6', 'MX-2', 'MX-1', 'DY-2'] },
  { id:'S01', wirkung:'sperren', feld:'mat', werte:c => istSideboard(c) ? Object.keys(MATS).filter(k => !MATS[k].boards && !MATS[k].t.some(t => t >= KORPUS_MIN)) : [],
    grund:() => `Gibt es nur dünner als ${KORPUS_MIN} mm – für den Korpus zu dünn, als Front wählbar.`, befunde:['SK-6', 'MX-2'] },
  { id:'S03', wirkung:'sperren', feld:'t', werte:c => hoheSeiten(c) ? MATS[c.mat].t.filter(t => t < KORPUS_MIN) : [],
    grund:() => `Hohe Seiten (Wangen, Module über 1,2 m) brauchen mindestens ${KORPUS_MIN} mm.`, befunde:['MX-2', 'TR-16', 'TR-8'] },
  { id:'S03', wirkung:'sperren', feld:'mat', werte:c => hoheSeiten(c) ? Object.keys(MATS).filter(k => !MATS[k].t.some(t => t >= KORPUS_MIN)) : [],
    grund:() => `Gibt es nur dünner als ${KORPUS_MIN} mm – zu dünn für hohe Seiten (Wangen, Module über 1,2 m).`, befunde:['MX-2', 'TR-16'] },
  { id:'S04', wirkung:'sperren', feld:'joint', werte:c => !mitVerbindung(c) ? [] : [...(c.t < 15 || c.t > 22 ? ['cam'] : []), ...(c.t < 15 ? ['dowels', 'screws'] : [])],
    grund:(c, w) => w === 'cam' ? 'Die Beschläge gibt es nur für 15–22 mm Platten.' : 'Dübel und Schrauben erst ab 15 mm – in dünneren Platten brechen sie durch.', befunde:['SK-2', 'MX-1', 'DY-2', 'SK-10'] },
  { id:'W03', wirkung:'warnen', wenn:c => mitVerbindung(c) && c.joint === 'cam' && c.t === 15,
    text:() => 'Exzenter in 15 mm: nur mit Minifix 15, der für 15 mm zugelassen ist. Das Gehäuse lässt rund 3 mm Holz stehen – mit Tiefenanschlag bohren.', befunde:['MX-1', 'SK-2'] },
  // Fächer: so viele, dass jedes Fach unter der Spannweite bleibt (ohne Einlegeböden spannen Deckel und Boden 200 mm mehr).
  // Fachbreite s = (W − t) / n − t ≤ Spannweite, also n ≥ (W − t) / (Spannweite + t); höchstens 4 Fächer.
  { id:'W01', wirkung:'sperren', feld:'sections', werte:c => {
      if (!istSideboard(c) || !MATS[c.mat]) return [];
      const n = Math.min(4, Math.ceil((c.W - c.t) / (fachSpan(c) + c.t)));
      return ['1', '2', '3', '4'].filter(v => Number(v) < n);
    }, grund:c => `Mit ${MATS[c.mat].name} ${c.t} mm höchstens ca. ${fachSpan(c)} mm pro Fach – sonst biegen sich ${c.shelves ? 'die Einlegeböden' : 'Deckel und Boden'} durch.`, befunde:['SK-3', 'MX-4'] },
  { id:'W06', wirkung:'warnen', wenn:c => istSideboard(c) && c.front !== 'open' && c.color !== 'korpus' && (MATS[c.frontMat] || MATS[c.mat]).coated,
    text:() => 'Lack auf beschichteter Spanplatte: die Fronten mit Körnung 240 anschleifen und einen Haftgrund für Melamin verwenden, sonst blättert der Lack ab.', befunde:['SF-9', 'MX-14'] },
  { id:'S05', wirkung:'sperren', feld:'joint', werte:c => mitVerbindung(c) && c.mat === 'osb' ? ['screws'] : [],
    grund:() => 'OSB-Kanten reissen zwischen den Spänen aus – Taschenloch oder Dübel.', befunde:['SK-10'] },
  { id:'S06', wirkung:'sperren', feld:'joint', werte:c => mitVerbindung(c) && LEIMHOLZ(c.mat) ? ['screws'] : [],
    grund:() => 'Bei Leimholz gingen die Schrauben ins Hirnholz – Taschenloch oder Dübel.', befunde:['SK-E2'] },
  { id:'S07', wirkung:'sperren', feld:'back', werte:c => istSideboard(c) && c.front !== 'open' ? ['none'] : [],
    grund:() => 'Mit Türen braucht der Korpus eine Rückwand, sonst verzieht er sich und die Türen schliessen nicht mehr.', befunde:['SK-9'] },
  { id:'S08', wirkung:'sperren', feld:'back', werte:c => freiStehend(c) && c.rh - c.gapTop > 1200 ? ['none'] : [],
    grund:() => 'Module über 1,2 m Höhe schieben sich ohne Rückwand schräg.', befunde:['MX-5', 'RM-9'] },
  { id:'S09', wirkung:'sperren', feld:'mat', werte:c => istSideboard(c) && c.room === 'bath' ? ['dekorspan'] : [],
    grund:() => 'Spanplatte quillt im Bad an Kanten und Bohrungen auf.', befunde:['SK-7', 'MX-10'] },
  { id:'S09', wirkung:'sperren', feld:'frontMat', werte:c => istSideboard(c) && c.room === 'bath' ? ['dekorspan'] : [],
    grund:() => 'Spanplatte quillt im Bad an Kanten und Bohrungen auf.', befunde:['SK-7', 'MX-10'] },
  { id:'S09', wirkung:'sperren', feld:'back', werte:c => istSideboard(c) && c.room === 'bath' ? ['hdf3', 'hf3'] : [],
    grund:() => 'MDF und Hartfaser quellen im Bad – Sperrholz Pappel nehmen und beidseitig lackieren.', befunde:['SK-7', 'SK-21'] },
  { id:'S10', wirkung:'sperren', feld:'front', werte:c => istSideboard(c) && c.t >= 22 ? ['hinged'] : [],
    grund:() => 'Topfscharniere erreichen ab 22 mm Korpus den Überschlag nicht – Korpus 16–21 mm, Schiebetüren oder offen.', befunde:['SF-1', 'SK-E1'] },
  { id:'S13', wirkung:'sperren', feld:'grain', werte:c => LEIMHOLZ(c.mat) && !MATS[c.mat].boards ? ['false'] : [],
    grund:() => 'Massivholz nur in Faserrichtung schneiden – quer zur Faser bricht es.', befunde:['SK-4'] },
  { id:'S14', wirkung:'grenze', felder:tiefenFelder, wenn:c => eingebaut(c) && c.sys === 'brackets', max:TIEFE_MAX_WINKEL,
    grund:() => `Tablarwinkel tragen bis ${TIEFE_MAX_WINKEL} mm Tiefe (grösster Winkel 250 mm, ⅔ der Tiefe).`, befunde:['TR-16'] },
  { id:'S14', wirkung:'sperren', feld:'mat', werte:c => eingebaut(c) && c.sys === 'brackets' ? Object.keys(MATS).filter(k => MATS[k].boards && !MATS[k].widths.some(w => w <= TIEFE_MAX_WINKEL)) : [],
    grund:() => `Die Bretter sind breiter als ${TIEFE_MAX_WINKEL} mm – zu tief für Tablarwinkel.`, befunde:['TR-16'] },
  { id:'S15', wirkung:'grenze', felder:tiefenFelder, wenn:c => eingebaut(c) && c.sys === 'rails', min:TIEFE_MIN_SCHIENE,
    grund:() => `Die kürzeste Konsole ist 250 mm, dazu Schiene und Luft vorne – Wandschienen ab ${TIEFE_MIN_SCHIENE} mm Tiefe. Für flachere Tablare Tablarwinkel.`, befunde:['EP-9', 'TR-16'] },
  { id:'K09', wirkung:'grenze', felder:['gapBottom'], wenn:c => eingebaut(c) && auflageUnten(c) > 0, min:c => Math.ceil((auflageUnten(c) + 10) / 10) * 10,
    grund:c => `Die unterste Auflage (${{ battens:'Leiste', posts:'Latte', rails:'Schiene', brackets:'Wandschenkel des Tablarwinkels' }[c.sys]}, ${auflageUnten(c)} mm) braucht Platz über dem Boden.`, befunde:['EG-9', 'EP-16', 'RM-10', 'EP-14'] },
  { id:'K09', wirkung:'grenze', felder:['nShelves'], wenn:c => eingebaut(c) && c.sys === 'brackets', max:tablareMaxWinkel,
    grund:c => `Der Wandschenkel der Tablarwinkel (${winkelWand(c)} mm) hängt unter dem Tablar – darunter braucht es mindestens ${winkelWand(c) + 10} mm Luft bis zum nächsten Tablar.`, befunde:['EG-9', 'TR-16'] },
  { id:'K08', wirkung:'grenze', felder:['gapTop'], wenn:schieneReicht, min:deckeFuerSchiene,
    grund:c => `Mit dem obersten Tablar mindestens ${deckeFuerSchiene(c)} mm unter der Decke reicht je eine Wandschiene ${RAIL_MAX} mm – sonst braucht jede Schiene ein zweites Stück.`, befunde:['TR-13', 'DY-8'] },
  { id:'K13', wirkung:'grenze', felder:c => tiefenFelder(c).filter(k => k !== 'dBack'), wenn:c => c.kind === 'reduit' && c.shape !== 'I', max:c => c.dBack + SEITE_MEHR,
    grund:() => `Die Seiten höchstens ${SEITE_MEHR} mm tiefer als hinten – sonst wird die Stossfuge in der Ecke lang und die Ecke hängt durch. Für tiefe Seiten hinten tiefer machen.`, befunde:['EP-8', 'EP-11'] },
  { id:'S16', wirkung:'sperren', feld:'sys', werte:c => eingebaut(c) && c.wall === 'drywall' ? ['rails', 'brackets'] : [],
    grund:() => 'Schienen und Winkel ziehen an den Dübeln – in Gipskarton hält das nur in den Ständern. Pfostenrahmen, Leisten, Wangen oder selbststehend wählen.', befunde:['TR-7', 'RM-13'] },
  { id:'K14', wirkung:'grenze', felder:['dBack'], wenn:c => c.kind === 'reduit' && c.doorIn, max:c => c.rd - c.doorW - 50,
    grund:() => 'Die Tür geht nach innen auf – vor dem hinteren Regal braucht sie ihre Breite und 50 mm Luft.', befunde:['EG-6', 'RM-2'] }
];
REGELN.push(...BW_REGELN);
const RANGES = { dBack:[150, 600], dLeft:[150, 600], dRight:[150, 600], nShelves:[1, 8], gapBottom:[0, 600], gapTop:[100, 800] };   // Grundgrenzen der Zahlenfelder (wie index.html)
const regelWert = (r, k, c) => typeof r[k] === 'function' ? r[k](c) : r[k];

// Reihenfolge, in der gesperrte Werte ausweichen: Ein früheres Feld kann spätere Sperren ändern.
const REIHENFOLGE = ['room', 'wall', 'bw', 'build', 'sys', 'shape', 'top', 'mat', 't', 'sections', 'frontMat', 'frontT', 'front', 'back', 'joint', 'grain'];
// Gesperrte Werte je Feld: { feld: { wert: { regel, grund } } } (Werte als Text, wie im Formular).
function gesperrt(c){
  const g = {};
  for (const r of REGELN) if (r.wirkung === 'sperren') for (const w of r.werte(c).map(String)) {
    const f = g[r.feld] || (g[r.feld] = {});
    if (!f[w]) f[w] = { regel:r.id, grund:r.grund(c, w) };
    if (r.id === 'BW') f[w].bw = true;   // gehört nicht zur Bauweise: im Formular ausblenden statt ausgrauen
  }
  return g;
}
// Grenzen der Zahlenfelder: { feld: { min, max, regel, grund } }.
function grenzen(c){
  const g = {};
  for (const r of REGELN) if (r.wirkung === 'grenze' && r.wenn(c)) for (const f of regelWert(r, 'felder', c)) {
    const [a, b] = RANGES[f], cur = g[f] || { min:a, max:b, regeln:[] };
    const mn = regelWert(r, 'min', c), mx = regelWert(r, 'max', c);
    if (mn != null && mn > cur.min) cur.min = mn;
    if (mx != null && mx < cur.max) cur.max = mx;
    cur.regeln.push({ regel:r.id, grund:r.grund(c), min:mn, max:mx });
    g[f] = cur;
  }
  return g;
}
// Anzeigename eines Werts für Meldungen.
function wertName(feld, w){
  if (feld === 'joint') return JOINTS[w] ? JOINTS[w].name : w;
  if (feld === 'front') return { open:'offen', hinged:'Drehtüren', sliding:'Schiebetüren' }[w] || w;
  if (feld === 'back') return w === 'none' ? 'keine Rückwand' : BACKS[w] ? BACKS[w].name : w;
  if (feld === 'sys') return SYS[w] ? SYS[w].name : w;
  if (feld === 'mat') return MATS[w] ? MATS[w].name : w;
  if (feld === 'frontMat') return w === 'korpus' ? 'wie Korpus' : MATS[w] ? MATS[w].name : w;
  if (feld === 't') return `${w} mm`;
  if (feld === 'grain') return w === 'true' ? 'Maserung einhalten' : 'Maserung frei';
  if (feld === 'bw') return BW[w] ? BW[w].name : w;
  if (feld === 'build') return w === 'free' ? 'selbststehend' : 'eingebaut';
  if (feld === 'top') return w === 'between' ? 'Deckel zwischen den Seiten' : 'Deckel aufgesetzt';
  if (feld === 'frontT') return `${w} mm`;
  return w;
}
const FELDNAME = { sections:'Fächer', bw:'Bauweise', build:'Regal', top:'Deckel', frontT:'Frontstärke', joint:'Verbindung', front:'Türen', back:'Rückwand', sys:'Einbau-Art', mat:'Material', frontMat:'Frontmaterial', t:'Stärke', grain:'Maserung',
  dBack:'Tiefe hinten', dLeft:'Tiefe links', dRight:'Tiefe rechts', nShelves:'Anzahl Tablare', gapBottom:'Unterstes Tablar', gapTop:'Oberstes Tablar bis Decke' };
// Zahl mit Einheit für Meldungen (die Tablarzahl hat keine).
const mitEinheit = (feld, v) => feld === 'nShelves' ? `${v}` : `${v} mm`;

// Prüft Formularwerte d gegen REGELN. fest = Felder, die nicht geändert werden dürfen (Schloss beim Zufall);
// dort wird aus Sperre oder Grenze eine Warnung. Läuft bis zum Fixpunkt (höchstens 12 Runden).
// Ergebnis: d (angepasste Werte), gesperrt, grenzen, korrekturen und warnungen (Texte).
function pruefeRegeln(d, fest = new Set()){
  let x = { ...d };
  const korrekturen = [], warnungen = [];
  const setzeKatalog = () => { if (x.katalog) x.katalog = { price:matPrice(MATS[x.mat], Number(x.t)), sheetL:MATS[x.mat].sheet[0], sheetB:MATS[x.mat].sheet[1] }; };
  for (let runde = 0; runde < 12; runde++) {
    const c = cfgFromData(x), g = gesperrt(c);
    let neu = false;
    // Je Runde nur das erste gesperrte Feld in der Reihenfolge ändern, die späteren danach neu prüfen.
    for (const feld of REIHENFOLGE.filter(f => g[f])) {
      if (neu) break;
      const werte = g[feld], cur = String(x[feld]), hit = werte[cur];
      if (!hit) continue;
      if (fest.has(feld)) { warnungen.push(`${FELDNAME[feld]} ${wertName(feld, cur)}: ${hit.grund}`); continue; }
      let alt;
      if (feld === 't') {
        const ts = MATS[c.mat].t.filter(t => !werte[String(t)]);
        alt = ts.find(t => t >= c.t) ?? ts[ts.length - 1];
      } else if (feld === 'frontT') {
        const ts = frontTs(MATS[c.frontMat]).filter(t => !werte[String(t)]);
        alt = ts.find(t => t >= c.frontT) ?? ts[ts.length - 1];
      } else if (feld === 'mat') {
        const ok = k => MATS[k] && !werte[k] && (!MATS[k].boards || c.kind === 'reduit');
        const b = bwVon(c);   // mit Bauweise: ihr erstes Material, sonst die übliche Reihenfolge
        alt = (b ? bwMats(b, c) : AUSWEICH.mat).find(ok) ?? Object.keys(MATS).find(ok);
      } else if (feld === 'bw') alt = AUSWEICH.bw[c.kind === 'reduit' ? 'reduit' : 'sideboard'].find(w => !werte[w]);
      else if (feld === 'back' && bwVon(c) && bwVon(c).backs) alt = [...bwVon(c).backs, ...AUSWEICH.back].find(w => !werte[w]);   // Reihenfolge der Bauweise
      else alt = (AUSWEICH[feld] || []).find(w => !werte[w]);
      if (alt == null) { warnungen.push(`${FELDNAME[feld]} ${wertName(feld, cur)}: ${hit.grund}`); continue; }
      korrekturen.push(`${FELDNAME[feld]}: ${wertName(feld, String(alt))} statt ${wertName(feld, cur)} – ${hit.grund}`);
      if (feld === 'mat') { x = withCatalog({ ...x, mat:alt }); setzeKatalog(); }
      else if (feld === 't') { x = { ...x, t:typeof x.t === 'number' ? alt : String(alt), price:matPrice(MATS[x.mat], alt) }; setzeKatalog(); }
      else if (feld === 'frontT') x = { ...x, frontT:typeof x.frontT === 'number' ? alt : String(alt) };
      else if (feld === 'grain') x = { ...x, grain:true };
      else x = { ...x, [feld]:alt };
      neu = true;
    }
    if (neu) continue;   // erst die Sperren, dann die Grenzen mit den neuen Werten
    for (const [feld, gr] of Object.entries(grenzen(c))) {
      const v = Number(x[feld]), tiefe = TIEFEN.includes(feld), eff = tiefe ? brettTiefe(c, v) : v;
      if (eff >= gr.min && eff <= gr.max) continue;
      const grund = gr.regeln.map(r => r.grund).join(' ');
      if (fest.has(feld) || gr.min > gr.max) { warnungen.push(`${FELDNAME[feld]} ${mitEinheit(feld, v)}: ${grund}`); continue; }
      let w = clamp(v, gr.min, gr.max);
      // Nur die Tiefen rasten bei ganzen Brettern auf eine Brettbreite ein, Boden- und Deckenabstand nicht.
      const B = tiefe ? breitenIn(c, gr.min, gr.max) : null;
      if (B && B.length) w = B.reduce((a, b) => Math.abs(b - w) < Math.abs(a - w) ? b : a);
      else if (B) { warnungen.push(`${FELDNAME[feld]} ${mitEinheit(feld, v)}: ${grund}`); continue; }
      korrekturen.push(`${FELDNAME[feld]}: ${w} statt ${mitEinheit(feld, v)} – ${grund}`);
      x = { ...x, [feld]:typeof x[feld] === 'number' ? w : String(w) };
      neu = true;
    }
    if (!neu) break;
  }
  const c = cfgFromData(x);
  for (const r of REGELN) if (r.wirkung === 'warnen' && r.wenn(c)) warnungen.push(r.text(c));
  return { d:x, gesperrt:gesperrt(c), grenzen:grenzen(c), korrekturen:[...new Set(korrekturen)], warnungen:[...new Set(warnungen)] };
}

// Berechnung aus Formularwerten, nach den Regeln angepasst. R.form = angepasste Werte, R.korrekturen = was angepasst wurde.
function computeData(d, fest){
  const P = pruefeRegeln(d, fest), c = cfgFromData(P.d);
  const R = c.kind === 'reduit' ? computeReduit(c) : computeSideboard(c);
  R.warn = [...P.warnungen, ...R.warn];
  R.form = P.d; R.gesperrt = P.gesperrt; R.grenzen = P.grenzen; R.korrekturen = P.korrekturen;
  return R;
}

/* ---------- Karten der Bauweisen ---------- */
// Preis je Bauweise für die aktuellen Masse: mit den Werten, die die Bauweise daraus macht (Material, das zu ihr
// gehört, sonst ihr erstes). null = hier nicht möglich.
function kartenPreise(d){
  const c = cfgFromData(d), out = {};
  for (const b of bwKind(c)) out[b.id] = bwSperre(b, c) ? null : Math.round(kostenGesamt(computeData({ ...d, bw:b.id })));
  return out;
}
// Zeilen für die gewählte Karte: [Bezeichnung, Text].
function bwDetails(b, c){
  const mats = bwMats(b, c), name = k => MATS[k].name;
  // Stärke: die häufigste für alle, abweichende mit Materialnamen (z. B. «18 mm, Dreischicht Fichte 19 mm»)
  const ts = mats.map(k => b.mats[k]), haupt = ts.map(String).sort((x, y) => ts.filter(v => String(v) === y).length - ts.filter(v => String(v) === x).length)[0];
  const staerke = istSideboard(c) || b.id === 'R5' || b.id === 'R6'
    ? [haupt.split(',').join('/') + ' mm', ...mats.filter(k => String(b.mats[k]) !== haupt).map(k => `${name(k)} ${b.mats[k].join('/')} mm`)].join(', ')
    : 'ab 15 mm';
  // Leisten, Pfosten, Schienen, Winkel nehmen fast alles – dort reicht eine Zeile statt 16 Namen.
  const breit = !istSideboard(c) && ['R1', 'R2', 'R3', 'R4'].includes(b.id);
  const rows = [['Material', breit ? `Platten und ganze Bretter ab 15 mm, ${b.mats.mdf ? 'auch MDF 19 mm' : 'ohne MDF'}` : mats.map(name).join(' · ')], ...(breit ? [] : [['Stärke', staerke]])];
  const backs = istSideboard(c) && c.room === 'bath' ? ['ply6'] : b.backs;
  if (istSideboard(c)) {
    rows.push(['Verbindung', JOINTS[bwJoint(b, c)].name + (b.top === 'between' ? ', Deckel zwischen den Seiten' : '')]);
    rows.push(['Rückwand', backs.map(k => BACKS[k].name).join(', ')]);
    rows.push(['Oberfläche', c.room === 'bath' ? 'PU-Lack, 3 Schichten, vor der Montage' : b.oberflaeche]);
    if (c.room === 'bath') rows.push(['Im Bad', 'Leim D4, Schrauben Edelstahl A2, Rückwand beidseitig lackiert']);
  } else {
    rows.push(['Tragwerk', b.tragwerk]);
    if (b.build === 'free') rows.push(['Verbindung', 'Taschenloch, bei Spanplatte und MDF Exzenter'], ['Rückwand', backs.map(k => BACKS[k].name).join(', ')]);
    rows.push(['Wand', b.walls.includes('drywall') ? 'Beton, Backstein oder Gipskarton' : 'nur Beton oder Backstein']);
  }
  return rows;
}

/* ---------- Zufall ---------- */
// Würfelt eine Konfiguration, die ohne Warnungen aufgeht. Sideboard: ein Möbeltyp mit passenden
// Proportionen. Reduit: der Raum (Masse, Tür, Wände) bleibt, gewürfelt wird das Regal darin.
// Hinweise, die zum Möbel gehören und kein Fehler sind, sind erlaubt: Kippschutz, Bad, Gipskarton (gehört
// zum Raum) und was die Berechnung schon selbst löst (zusätzliche Winkel/Pfosten eingeplant, Tiefe auf Brettbreite).
const HARMLOS = /kippt leicht|^Bad:|^Gipskarton|eingeplant|gesetzt \(Brettbreite/;
// Gruppen, die man beim Würfeln festhalten kann (Schloss im Formular, data-lock), und ihre Felder: genau die Felder, die in der Gruppe stehen.
const SPERREN = {
  masse:['w', 'h', 'd'],
  bauweise:['bw', 'build', 'sys', 'joint'],
  bauart:['build', 'sys'],
  form:['shape', 'corner', 'nShelves'],
  tablare:['dBack', 'dLeft', 'dRight', 'gapBottom', 'gapTop'],
  nische:['nicheL', 'nicheLW', 'nicheLH', 'nicheR', 'nicheRW', 'nicheRH'],
  aufteilung:['sections', 'front', 'base'],
  aufbau:['top', 'shelves', 'baseH', 'legShape', 'taper', 'legColor'],
  front:['doorsPer', 'slideN', 'handle', 'color', 'frontMat', 'frontT'],
  material:['mat', 't', 'back', 'price', 'sheetL', 'sheetB', 'kerf', 'grain', 'katalog'],
  verbindung:['joint']
};
const SB_TYPES = [
  // [Name, Breite, Höhe, Tiefe, Untergestell]
  ['Lowboard',   [1400, 2200], [420, 600],  [350, 450], ['legs', 'legs', 'plinth']],
  ['Sideboard',  [1000, 1800], [700, 880],  [380, 480], ['legs', 'plinth', 'plinth']],
  ['Kommode',    [700, 1100],  [800, 1000], [400, 480], ['legs', 'plinth']],
  ['Highboard',  [800, 1200],  [1100, 1400],[350, 450], ['plinth', 'none']],
  ['Regal',      [600, 1200],  [900, 1400], [280, 350], ['none', 'plinth']]
];
const SB_MATS = ['birke', 'birke', 'birkesi', 'eiche', 'fichtesp', 'dreischicht', 'fichte', 'mdf', 'dekorspan'];
const RD_MATS = ['fichtesp', 'dreischicht', 'birkesi', 'osb', 'osb', 'schaltafel', 'dekorspan', 'seekiefer'];

// Nächste Brettbreite zu v (bei Gleichstand die breitere, wie die Berechnung aufrundet).
function snapBreite(widths, v){
  return widths.reduce((a, w) => Math.abs(w - v) <= Math.abs(a - v) ? w : a);
}

// locks: Namen aus SPERREN; deren Felder bleiben wie in base.
function zufall(base, rnd = Math.random, tries = 60, locks = []){
  const fix = {};
  for (const g of locks) for (const k of SPERREN[g] || []) if (k in base) fix[k] = base[k];
  let best = null;
  for (let i = 0; i < tries; i++) {
    let d = base.kind === 'reduit' ? wuerfelReduit(base, rnd, fix) : wuerfelSideboard(base, rnd, fix);
    if (!('mat' in fix)) { d = withCatalog(d); delete d.katalog; }
    const BM = MATS[d.mat].boards ? MATS[d.mat] : null;
    if (d.kind === 'reduit' && BM) for (const k of TIEFEN) if (!(k in fix)) d[k] = snapBreite(BM.widths, Number(d[k]));
    const R = computeData(d, new Set(Object.keys(fix)));
    d = R.form;
    const warn = R.warn.filter(w => !HARMLOS.test(w));
    if (!warn.length) return d;
    if (!best || warn.length < best.n) best = { d, n:warn.length };
  }
  return best.d;
}

// Bauweise zuerst: nur die hier möglichen, gewichtet (Review, Abschnitt 5); bei festem Material nur die mit ihm.
const GEWICHT = { S1:30, S2:20, S3:15, S4:20, S5:8, S6:7, R2:30, R6:20, R5:15, R3:15, R4:10, R1:10 };
function wuerfleBauweise(base, rnd, fix){
  const c = cfgFromData({ ...base, ...fix });
  if (fix.bw && bwVon(c)) return bwVon(c);
  let moeglich = bwKind(c).filter(b => !bwSperre(b, c) && (!('mat' in fix) || bwMats(b, c).includes(fix.mat)));
  if (!moeglich.length) moeglich = bwKind(c);
  let r = rnd() * moeglich.reduce((a, b) => a + GEWICHT[b.id], 0);
  return moeglich.find(b => (r -= GEWICHT[b.id]) < 0) || moeglich[0];
}

function wuerfelSideboard(base, rnd, fix = {}){
  const pick = a => a[Math.floor(rnd() * a.length)];
  const range = ([a, b], step = 10) => a + Math.round(rnd() * (b - a) / step) * step;
  const chance = p => rnd() < p;
  const has = k => k in fix, val = (k, f) => has(k) ? fix[k] : f();
  // Feste Masse: einen Möbeltyp nehmen, in den sie passen.
  const fits = SB_TYPES.filter(([, rw, rh]) => !has('w') || (fix.w >= rw[0] && fix.w <= rw[1] && fix.h >= rh[0] && fix.h <= rh[1]));
  const [typ, rw, rh, rdp, bases] = pick(fits.length ? fits : SB_TYPES);
  const regal = typ === 'Regal';
  const bw = wuerfleBauweise(base, rnd, fix), cb = cfgFromData(base);
  const mat = val('mat', () => pick(bwMats(bw, cb))), M = MATS[mat];
  const t = Number(val('t', () => (bw.mats[mat] || [M.tDef])[0]));
  const W = Number(val('w', () => range(rw, 50))), H = Number(val('h', () => range(rh, 10))), D = Number(val('d', () => range(rdp, 10)));
  const b = val('base', () => pick(bases));
  const baseH = Number(val('baseH', () => b === 'legs' ? range([100, 220], 10) : b === 'plinth' ? range([60, 100], 10) : base.baseH));
  const Hi = H - (b === 'none' ? 0 : baseH) - 2 * t;
  // Fachbreite höchstens so gross, wie das Material spannt (SPAN in shared.js).
  const fach = Math.min(range([450, 650], 10), maxSpan(mat, t));
  const sections = Number(val('sections', () => Math.max(1, Math.min(4, Math.ceil((W - 2 * t) / fach - 0.15)))));
  const shelves = Math.max(0, Math.min(3, Math.floor(Hi / range([300, 400], 10)) - 1));
  const front = val('front', () => regal ? pick(['open', 'open', 'hinged']) : pick(sections >= 2 ? ['hinged', 'hinged', 'sliding', 'sliding', 'open'] : ['hinged', 'hinged', 'open']));
  const handle = front === 'sliding' ? pick(['shell', 'hole']) : pick(['hole', 'knob', 'push']);
  // Fronten meist wie der Korpus, sonst dünner aus demselben Material oder lackiertes MDF.
  const thinner = M.t.filter(v => v < t && v >= 15 && v <= FRONT_MAX);
  const andere = bw.front.filter(k => k !== 'korpus');
  const frontMat = val('frontMat', () => front === 'open' || chance(0.7) || !andere.length ? 'korpus' : pick(andere));
  const frontT = Number(val('frontT', () => frontMat === 'korpus' ? t : pick(frontTs(MATS[frontMat]).filter(v => v >= 16))));
  const painted = ['weiss', 'salbei', 'taube', 'anthrazit'];
  const color = val('color', () => mat === 'mdf' || frontMat === 'mdf' ? pick(painted) : mat === 'eiche' || M.coated ? 'korpus' : chance(0.55) ? 'korpus' : pick(painted));
  const joint = val('joint', () => bwJoint(bw, { ...cb, mat }));
  return {
    ...base, bw:bw.id, mat, t, w:W, h:H, d:D, base:b, baseH, sections, shelves, front, handle, color, joint, frontMat, frontT,
    top: bw.top || (joint === 'screws' ? 'between' : pick(['over', 'over', 'between'])),
    back: base.room === 'bath' ? 'ply6' : pick(bw.backs),
    doorsPer:'auto', slideN:'auto',
    legShape: pick(['cone', 'cone', 'straight']), taper: range([20, 45], 5),
    legColor: color === 'anthrazit' || mat === 'mdf' ? pick(['black', 'oak']) : pick(['oak', 'oak', 'black']),
    ...fix
  };
}

function wuerfelReduit(base, rnd, fix = {}){
  const pick = a => a[Math.floor(rnd() * a.length)];
  const range = ([a, b], step = 10) => a + Math.round(rnd() * (b - a) / step) * step;
  const chance = p => rnd() < p;
  const has = k => k in fix, val = (k, f) => has(k) ? fix[k] : f();
  const on = v => v === true || v === 'on';
  const rw = Number(base.rw), rh = Number(base.rh);
  // Feste Nische: nur Formen, die an dieser Seite ein Regal haben.
  const wantL = has('nicheL') && on(fix.nicheL), wantR = has('nicheR') && on(fix.nicheR);
  let shapes = rw >= 1500 ? ['U', 'U', 'L', 'I'] : rw >= 1100 ? ['L', 'L', 'I'] : ['I'];
  if (wantL || wantR) { shapes = shapes.filter(s => s === 'U' || (s === 'L' && !(wantL && wantR))); if (!shapes.length) shapes = [wantL && wantR ? 'U' : 'L']; }
  const shape = val('shape', () => pick(shapes));
  const corner = val('corner', () => wantL && !wantR ? 'L' : wantR && !wantL ? 'R' : pick(['L', 'R']));
  // Feste Tablartiefen: nur Materialien, die sie ohne Umrunden erlauben.
  const depthsOk = k => !MATS[k].boards || TIEFEN.every(t => MATS[k].widths.includes(Number(fix[t])));
  const bw = wuerfleBauweise(base, rnd, fix);
  // Material aus der Bauweise, bevorzugt die üblichen Reduit-Platten
  const passend = k => bw.mats[k] && (!has('dBack') || depthsOk(k));
  const mats = RD_MATS.filter(passend).length ? RD_MATS.filter(passend) : Object.keys(bw.mats).filter(passend);
  const mat = val('mat', () => pick(mats.length ? mats : Object.keys(bw.mats)));
  const tMat = bw.mats[mat] || MATS[mat].t;
  const side = range([200, 400], 50);
  const gapBottom = Number(val('gapBottom', () => range([100, 300], 50))), gapTop = Number(val('gapTop', () => range([250, 450], 50)));
  const nShelves = Math.max(3, Math.min(8, Math.round((rh - gapBottom - gapTop) / range([320, 420], 10)) + 1));
  const niche = shape !== 'I' && chance(0.3);
  return {
    ...base, bw:bw.id, shape, corner, build:bw.build, sys:bw.sys || base.sys,
    mat, t:tMat.includes(MATS[mat].tDef) ? MATS[mat].tDef : tMat[0], back:bw.backs ? pick(bw.backs) : 'hdf3', joint:bw.joint ? bwJoint(bw, { mat }) : 'pocket',
    dBack:range([300, 500], 50), dLeft:side, dRight:chance(0.7) ? side : range([200, 400], 50),
    nShelves, gapBottom, gapTop,
    nicheL:niche && chance(0.5), nicheLW:range([400, 500], 10), nicheLH:range([1200, 1400], 50),
    nicheR:false, nicheRW:range([400, 500], 10), nicheRH:range([1200, 1400], 50),
    ...fix
  };
}

/* ---------- Entwürfe ---------- */
// Startwerte eines Typs ohne Entwurf: die Formularwerte beim Laden plus die Abweichungen des Typs.
// Reduit: Pfostenrahmen mit Sperrholz Fichte 18 – ohne Warnung (Entscheid 28.09.2026).
const START = { sideboard:{ bw:'S1' }, reduit:{ bw:'R2', sys:'posts', mat:'fichtesp', t:'18' } };
function startwerte(defaults, kind){
  let d = { ...defaults, kind, ...(START[kind] || {}) };
  if (START[kind] && START[kind].mat) {
    d = withCatalog(d);
    d = { ...d, t:String(d.t), katalog:{ price:d.price, sheetL:d.sheetL, sheetB:d.sheetB } };
  }
  return d;
}
// Ein Entwurf pro Möbeltyp: { kind: aktueller Typ, sideboard: Formularwerte, reduit: Formularwerte }.
// alt = der frühere Einzelentwurf (localStorage sideboard-werkbank-v2); er wird unter seinem Typ abgelegt.
function entwuerfeLaden(neu, alt){
  if (neu && neu.kind && neu[neu.kind]) return neu;
  if (alt && typeof alt === 'object') { const kind = alt.kind || 'sideboard'; return { kind, [kind]: { ...alt, kind } }; }
  return null;
}
function entwurfSetzen(e, data){
  const kind = data.kind || 'sideboard';
  return { ...(e || {}), kind, [kind]: data };
}
// Preiszeile auf der Karte «Was baust du?»: eigener Entwurf mit Preis, sonst der Preis der Startwerte.
function wahlZeile(entwurf, start){
  const n = Math.round(kostenGesamt(computeData(entwurf || start)) / 5) * 5;
  return entwurf ? `Dein Entwurf · ca. CHF ${n}` : `ab ca. CHF ${n}`;
}

/* ---------- Sammlung ---------- */
// Was das Möbel kostet: Holz im Zuschnitt bzw. ganze Bretter, Latten und Kaufteile (Reduit).
function kostenGesamt(R){
  return sheetCosts(R.groups).cut + (R.solidCost || 0) + (R.buyCost || 0);
}
// Masse beschriftet für die Masstafel: Reduit als Raum (B · T · H), Sideboard als Möbel (B · H · T mit Front).
function masseText(R){
  return R.kind === 'reduit' ? `Raum B ${R.W} · T ${R.D} · H ${R.H} mm` : `B ${R.W} · H ${R.H} · T ${R.Dtot} mm`;
}
// Steckbrief: Bauweise · Teile · Platten · Bretter (Platten samt Rückwand); Einzahl bei 1, was 0 ist, fällt weg.
function steckbriefText(R, d){
  const anzahl = (n, eins, mehr) => n ? `${n} ${n === 1 ? eins : mehr}` : '';
  const blaetter = boards => R.groups.filter(g => !!g.boards === boards).reduce((a, g) => a + g.sheets.length, 0);
  return [BW[d.bw || bauweiseVon(d)].name, anzahl(R.rows.reduce((a, r) => a + r.qty, 0), 'Teil', 'Teile'),
    anzahl(blaetter(false), 'Platte', 'Platten'), anzahl(blaetter(true), 'Brett', 'Bretter')].filter(Boolean).join(' · ');
}
// Preis aufgeschlüsselt: Holz (Zuschnitt bzw. ganze Bretter, mit Latten), Kaufteile (Reduit), ganze Platten zum Vergleich; ungerundet.
function preisAufschluesselung(R){
  const { cut, whole } = sheetCosts(R.groups), latten = R.solidCost || 0, boards = !!R.groups[0].boards;
  return {
    total: kostenGesamt(R),
    holzName: boards ? 'Holz ganze Bretter' : 'Holz Zuschnitt',
    holz: cut + latten,
    kaufteile: R.kind === 'reduit' ? R.buyCost : null,
    ganzePlatten: boards ? null : whole + latten,
    ohneBeschlaege: R.kind !== 'reduit'
  };
}
// Ein Eintrag merkt sich die Formularwerte und eine Kurzbeschreibung mit den Kosten beim Speichern.
function sammlungEintrag(d, R, now = new Date()){
  const reduit = d.kind === 'reduit';
  const kosten = Math.round(kostenGesamt(R));
  const masse = reduit ? `${R.W} × ${R.D} × ${R.H}` : `${R.W} × ${R.H} × ${R.Dtot}`;
  const typ = reduit ? { I:'Reduit hinten', L:'Reduit L-Form', U:'Reduit U-Form' }[R.shape] : 'Sideboard';
  return {
    id: now.getTime().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
    name: `${typ} ${R.W} mm`,
    gespeichert: now.toISOString().slice(0, 10),
    data: d,
    info: { typ, masse, material:`${R.matShort} ${R.t} mm${R.gFront && R.gFront !== `${R.matShort} ${R.t} mm` ? ` · Fronten ${R.gFront}` : ''}`, kosten }
  };
}
// Weicht der Entwurf von der geladenen Variante ab? Katalogwerte zählen nicht, Zahlen und Texte gelten als gleich.
// price/sheetL/sheetB gelten trotz unterschiedlichem Wert als gleich, solange beide Seiten (unverändert)
// ihrem eigenen Katalog folgen – sonst würde ein Materialpreis-Update in preise.js «geändert» auslösen.
const KATALOGFELDER = ['price', 'sheetL', 'sheetB'];
function folgtKatalog(d, k){ return d.katalog && String(d[k]) === String(d.katalog[k]); }
// Felder, die ältere Einträge noch nicht kennen, gelten dort als Standardwert.
const STANDARD = { frontMat:'korpus' };
function geaendert(a, b){
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.delete('katalog');
  const wert = (d, k) => String(k in d ? d[k] : k === 'bw' ? bauweiseVon(d) : STANDARD[k]);   // ohne Bauweise: die passende
  for (const k of keys) {
    if (wert(a, k) === wert(b, k)) continue;
    if (KATALOGFELDER.includes(k) && folgtKatalog(a, k) && folgtKatalog(b, k)) continue;
    return true;
  }
  return false;
}
// Sammlung in Anzeige-Reihenfolge: neueste zuerst (die Liste ist nach Speicherzeit geordnet) oder günstigste zuerst.
function sortiere(coll, nach){
  const c = [...coll].reverse();
  return nach === 'preis' ? c.sort((x, y) => x.info.kosten - y.info.kosten) : c;
}

/* ---------- Link ---------- */
// Ein Entwurf als Link (?plan=…): Formularwerte als JSON, deflate-raw, base64url, vorne die Version des Formats.
// Ohne Server: Der Link trägt den ganzen Entwurf. Fehlende Felder füllt der Empfänger mit seinen Startwerten.
const PLAN_V = '1';
// Was in den Link gehört: die Felder des Möbeltyps (das Formular hält beide Typen zugleich).
// Katalogwerte (Preis, Format), die dem Katalog folgen, bleiben weg: Der Empfänger rechnet dann mit seinem
// aktuellen Katalog statt mit dem Preis beim Teilen. Neue Formularfelder hier eintragen, sonst fehlen sie im Link.
const LINK_FELDER = {
  gemeinsam:['kind', 'bw', 'mat', 't', 'back', 'joint', 'grain', 'kerf', 'price', 'sheetL', 'sheetB'],
  sideboard:['w', 'h', 'd', 'room', 'top', 'sections', 'shelves', 'base', 'baseH', 'legShape', 'taper', 'legColor',
    'front', 'doorsPer', 'slideN', 'handle', 'color', 'frontMat', 'frontT'],
  reduit:['rw', 'rd', 'rh', 'doorW', 'doorPos', 'doorOff', 'doorH', 'doorIn', 'hinge', 'wall', 'shape', 'corner', 'build', 'sys',
    'dBack', 'dLeft', 'dRight', 'nShelves', 'gapBottom', 'gapTop', 'nicheL', 'nicheLW', 'nicheLH', 'nicheR', 'nicheRW', 'nicheRH']
};
function linkDaten(d){
  const felder = [...LINK_FELDER.gemeinsam, ...LINK_FELDER[d.kind === 'reduit' ? 'reduit' : 'sideboard']];
  const rest = {};
  for (const k of felder) if (k in d && !(KATALOGFELDER.includes(k) && folgtKatalog(d, k))) rest[k] = d[k];
  return rest;
}
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const ausB64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0));
async function durch(bytes, strom){
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(strom)).arrayBuffer());
}
async function planCode(d){
  const json = new TextEncoder().encode(JSON.stringify(linkDaten(d)));
  return PLAN_V + b64url(await durch(json, new CompressionStream('deflate-raw')));
}
// Formularwerte aus dem Code; null, wenn der Code kaputt, unbekannt oder kein Entwurf ist.
async function planAusCode(code){
  if (typeof code !== 'string' || code[0] !== PLAN_V) return null;
  try {
    const d = JSON.parse(new TextDecoder().decode(await durch(ausB64url(code.slice(1)), new DecompressionStream('deflate-raw'))));
    return d && typeof d === 'object' && !Array.isArray(d) && ['sideboard', 'reduit'].includes(d.kind) ? d : null;
  } catch (e) { return null; }
}
// Meldung nach einem Link (?plan=…): Rückgängig nur, wenn es vorher einen eigenen Entwurf gab.
function linkMeldung({ erstBesuch = false, gueltig = false, angepasst = false } = {}){
  if (!gueltig) return { text: erstBesuch ? 'Der Link ist ungültig – du siehst den Standard-Entwurf.' : 'Der Link ist ungültig – dein Entwurf bleibt, wie er war.', undo:false };
  return { text: angepasst ? 'Entwurf von Link geladen und an die Bauweise angepasst.' : 'Entwurf von Link geladen.', undo: !erstBesuch };
}

/* ---------- Orte ---------- */
const ORTE = ['entwerfen', 'einkaufen', 'bauen', 'sammlung'];
function ortAusHash(hash){
  const o = String(hash || '').replace(/^#/, '');
  return ORTE.includes(o) ? o : 'entwerfen';
}

if (typeof module !== 'undefined') module.exports = { cfgFromData, withCatalog, startwerte, computeData, pruefeRegeln, gesperrt, grenzen, REGELN, LEIMHOLZ, BAUWEISEN, BW, bauweiseVon, bwSperre, kartenPreise, bwDetails, zufall, sammlungEintrag, kostenGesamt, snapBreite, HARMLOS, SPERREN, entwuerfeLaden, entwurfSetzen, geaendert, sortiere, ortAusHash, linkDaten, LINK_FELDER, planCode, planAusCode, masseText, steckbriefText, preisAufschluesselung, wahlZeile, linkMeldung };
