/* Konfigurationen als Formularwerte: umrechnen, würfeln, sammeln. Ohne DOM; braucht die Globals aus shared.js, sideboard.js, reduit.js. */
'use strict';

// Formularwerte (wie gespeichert: name → Wert) in die Eingabe der Berechnung.
function cfgFromData(d){
  const n = k => Number(d[k]), on = k => d[k] === true || d[k] === 'on';
  return {
    W:n('w'), H:n('h'), D:n('d'), room:d.room, mat:d.mat, t:n('t'), back:d.back, top:d.top,
    sections:n('sections'), shelves:n('shelves'), base:d.base, baseH:n('baseH'), legShape:d.legShape, taper:n('taper'), legColor:d.legColor, joint:d.joint,
    front:d.front, doorsPer:d.doorsPer, slideN:d.slideN, handle:d.handle, color:d.color,
    sheetL:n('sheetL'), sheetB:n('sheetB'), kerf:n('kerf'), grain:on('grain'), price:n('price'),
    kind:d.kind,
    rw:n('rw'), rd:n('rd'), rh:n('rh'), doorW:n('doorW'), doorIn:on('doorIn'), hinge:d.hinge, wall:d.wall,
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

function computeData(d){
  const c = cfgFromData(d);
  return c.kind === 'reduit' ? computeReduit(c) : computeSideboard(c);
}

/* ---------- Zufall ---------- */
// Würfelt eine Konfiguration, die ohne Warnungen aufgeht. Sideboard: ein Möbeltyp mit passenden
// Proportionen. Reduit: der Raum (Masse, Tür, Wände) bleibt, gewürfelt wird das Regal darin.
// Hinweise, die zum Möbel gehören und kein Fehler sind, sind erlaubt: Kippschutz, Bad, Gipskarton (gehört
// zum Raum) und was die Berechnung schon selbst löst (zusätzliche Winkel/Pfosten eingeplant, Tiefe auf Brettbreite).
const HARMLOS = /kippt leicht|^Bad:|^Gipskarton|eingeplant|gesetzt \(Brettbreite/;
const SB_TYPES = [
  // [Name, Breite, Höhe, Tiefe, Untergestell]
  ['Lowboard',   [1400, 2200], [420, 600],  [350, 450], ['legs', 'legs', 'plinth']],
  ['Sideboard',  [1000, 1800], [700, 880],  [380, 480], ['legs', 'plinth', 'plinth']],
  ['Kommode',    [700, 1100],  [800, 1000], [400, 480], ['legs', 'plinth']],
  ['Highboard',  [800, 1200],  [1100, 1400],[350, 450], ['plinth', 'none']],
  ['Regal',      [600, 1200],  [900, 1400], [280, 350], ['none', 'plinth']]
];
const SB_MATS = ['birke', 'birke', 'birkesi', 'eiche', 'seekiefer', 'fichtesp', 'dreischicht', 'fichte', 'mdf', 'dekorspan'];
const RD_MATS = ['fichtesp', 'dreischicht', 'birkesi', 'osb', 'osb', 'schaltafel', 'dekorspan', 'seekiefer'];

function zufall(base, rnd = Math.random, tries = 60){
  let best = null;
  for (let i = 0; i < tries; i++) {
    const d = withCatalog(base.kind === 'reduit' ? wuerfelReduit(base, rnd) : wuerfelSideboard(base, rnd));
    delete d.katalog;
    const warn = computeData(d).warn.filter(w => !HARMLOS.test(w));
    if (!warn.length) return d;
    if (!best || warn.length < best.n) best = { d, n:warn.length };
  }
  return best.d;
}

function wuerfelSideboard(base, rnd){
  const pick = a => a[Math.floor(rnd() * a.length)];
  const range = ([a, b], step = 10) => a + Math.round(rnd() * (b - a) / step) * step;
  const chance = p => rnd() < p;
  const [typ, rw, rh, rdp, bases] = pick(SB_TYPES);
  const regal = typ === 'Regal';
  const mat = pick(SB_MATS.filter(k => MATS[k])), M = MATS[mat];
  const t = chance(0.75) ? M.tDef : pick(M.t.filter(v => v >= 15 && v <= 22).concat(M.tDef));
  const W = range(rw, 50), H = range(rh, 10), D = range(rdp, 10);
  const b = pick(bases), baseH = b === 'legs' ? range([100, 220], 10) : b === 'plinth' ? range([60, 100], 10) : base.baseH;
  const Hi = H - (b === 'none' ? 0 : baseH) - 2 * t;
  const sections = Math.max(1, Math.min(4, Math.round((W - 2 * t) / range([450, 650], 10))));
  const shelves = Math.max(0, Math.min(3, Math.floor(Hi / range([300, 400], 10)) - 1));
  const front = regal ? pick(['open', 'open', 'hinged']) : pick(sections >= 2 && t <= 19 ? ['hinged', 'hinged', 'sliding', 'sliding', 'open'] : ['hinged', 'hinged', 'open']);
  const handle = front === 'sliding' ? pick(['shell', 'hole']) : pick(['hole', 'knob', 'push']);
  const painted = ['weiss', 'salbei', 'taube', 'anthrazit'];
  const color = mat === 'mdf' ? pick(painted) : mat === 'eiche' || M.coated ? 'korpus' : chance(0.55) ? 'korpus' : pick(painted);
  const joint = mat === 'mdf' ? pick(['dowels', 'cam', 'pocket']) : pick(['pocket', 'pocket', 'dowels', 'cam', 'screws']);
  return {
    ...base, mat, t, w:W, h:H, d:D, base:b, baseH, sections, shelves, front, handle, color, joint,
    top: joint === 'screws' ? 'between' : pick(['over', 'over', 'between']),
    back: base.room === 'bath' ? 'ply6' : M.ply && chance(0.3) ? 'ply6' : 'hdf3',
    doorsPer:'auto', slideN:'auto',
    legShape: pick(['cone', 'cone', 'straight']), taper: range([20, 45], 5),
    legColor: color === 'anthrazit' || mat === 'mdf' ? pick(['black', 'oak']) : pick(['oak', 'oak', 'black'])
  };
}

function wuerfelReduit(base, rnd){
  const pick = a => a[Math.floor(rnd() * a.length)];
  const range = ([a, b], step = 10) => a + Math.round(rnd() * (b - a) / step) * step;
  const chance = p => rnd() < p;
  const rw = Number(base.rw), rh = Number(base.rh);
  const shape = rw >= 1500 ? pick(['U', 'U', 'L', 'I']) : rw >= 1100 ? pick(['L', 'L', 'I']) : 'I';
  const build = chance(0.8) ? 'built' : 'free';
  const mat = pick(RD_MATS.filter(k => MATS[k]));
  const side = range([200, 400], 50);
  const gapBottom = range([100, 300], 50), gapTop = range([250, 450], 50);
  const nShelves = Math.max(3, Math.min(8, Math.round((rh - gapBottom - gapTop) / range([320, 420], 10)) + 1));
  const niche = shape !== 'I' && chance(0.3);
  return {
    ...base, shape, corner:pick(['L', 'R']), build, sys:pick(['battens', 'battens', 'rails', 'brackets', 'cheeks', 'posts']),
    mat, t:MATS[mat].tDef, back:'hdf3', joint:pick(['pocket', 'screws', 'dowels']),
    dBack:range([300, 500], 50), dLeft:side, dRight:chance(0.7) ? side : range([200, 400], 50),
    nShelves, gapBottom, gapTop,
    nicheL:niche && chance(0.5), nicheLW:range([400, 500], 10), nicheLH:range([1200, 1400], 50),
    nicheR:false, nicheRW:range([400, 500], 10), nicheRH:range([1200, 1400], 50)
  };
}

/* ---------- Entwürfe ---------- */
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

/* ---------- Sammlung ---------- */
// Ein Eintrag merkt sich die Formularwerte und eine Kurzbeschreibung mit den Kosten beim Speichern.
function sammlungEintrag(d, R, now = new Date()){
  const reduit = d.kind === 'reduit';
  const { cut } = sheetCosts(R.groups);
  const kosten = Math.round(cut + (R.solidCost || 0) + (R.buyCost || 0));
  const masse = reduit ? `${R.W} × ${R.D} × ${R.H}` : `${R.W} × ${R.H} × ${R.Dtot}`;
  const typ = reduit ? { I:'Reduit hinten', L:'Reduit L-Form', U:'Reduit U-Form' }[R.shape] : 'Sideboard';
  return {
    id: now.getTime().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
    name: `${typ} ${R.W} mm`,
    gespeichert: now.toISOString().slice(0, 10),
    data: d,
    info: { typ, masse, material:`${R.matShort} ${R.t} mm`, kosten }
  };
}

if (typeof module !== 'undefined') module.exports = { cfgFromData, withCatalog, computeData, zufall, sammlungEintrag, HARMLOS, entwuerfeLaden, entwurfSetzen };
