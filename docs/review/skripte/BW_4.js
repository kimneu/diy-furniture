// Prototyp: Bauweisen als Daten + Prüfung passt(d). Nur zur Abschätzung, nicht im Repo.
const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const SB = {
  S1:{ mats:{birke:[18],birkesi:[18],fichtesp:[18],dreischicht:[19]}, joint:'pocket', backs:['hdf3','hf3','ply6'], bath:['birke','birkesi'] },
  S2:{ mats:{mdf:[19]}, joint:'dowels', backs:['hdf3'], bath:['mdf'] },
  S3:{ mats:{dekorspan:[19]}, joint:'cam', backs:['hdf3','hf3'], bath:[] },
  S4:{ mats:{eiche:[18],fichte:[18]}, joint:'dowels', backs:['ply6','hdf3'], bath:['eiche'] },
  S5:{ mats:{birke:[18],fichtesp:[18],dreischicht:[19]}, joint:'screws', backs:['hdf3','hf3','ply6'], bath:[], top:'between' },
};
const RD_PLATE_15 = ['birke','birkesi','fichtesp','seekiefer','osb','dreischicht','dekorspan','fichte','eiche'];
const BOARDS = ['gon_fichte','gon_3s','mood_fichte','regalbau','moebel_weiss','schaltafel'];
const RD = {
  R1:{ build:'built', sys:'battens', mats:[...RD_PLATE_15, ...BOARDS], minT:15, walls:['solid','drywall'] },
  R2:{ build:'built', sys:'posts',   mats:[...RD_PLATE_15, 'mdf', ...BOARDS], minT:15, walls:['solid','drywall'] },
  R3:{ build:'built', sys:'rails',   mats:[...RD_PLATE_15, ...BOARDS], minT:15, walls:['solid'], depth:[264,484] },
  R4:{ build:'built', sys:'brackets',mats:[...RD_PLATE_15, ...BOARDS], minT:15, walls:['solid'], depth:[150,375] },
  R5:{ build:'built', sys:'cheeks',  mats:['birke','birkesi','fichtesp','dreischicht','dekorspan'], minT:18, walls:['solid','drywall'] },
  R6:{ build:'free',                 mats:['birke','birkesi','fichtesp','dreischicht','dekorspan','mdf'], minT:18, walls:['solid','drywall'], backs:['hdf3','hf3','ply6'] },
};
function passtSB(d){
  const out = [];
  for (const [id, R] of Object.entries(SB)) {
    const v = [];
    if (!R.mats[d.mat] || !R.mats[d.mat].includes(Number(d.t))) v.push('Material/Stärke');
    if (d.joint !== R.joint) v.push('Verbindung');
    if (!R.backs.includes(d.back)) v.push('Rückwand');
    if (d.room === 'bath' && !R.bath.includes(d.mat)) v.push('Bad');
    if (R.top && d.top !== R.top) v.push('Deckel');
    out.push([id, v]);
  }
  return out.sort((a, b) => a[1].length - b[1].length);
}
function passtRD(d){
  const out = [];
  for (const [id, R] of Object.entries(RD)) {
    const v = [];
    if (d.build !== R.build || (R.sys && d.sys !== R.sys)) v.push('Bauart');
    if (!R.mats.includes(d.mat) || Number(d.t) < R.minT) v.push('Material/Stärke');
    if (!R.walls.includes(d.wall)) v.push('Wand');
    if (R.depth) for (const k of ['dBack','dLeft','dRight']) if (Number(d[k]) < R.depth[0] || Number(d[k]) > R.depth[1]) { v.push('Tiefe'); break; }
    if (R.backs && !R.backs.includes(d.back)) v.push('Rückwand');
    out.push([id, v]);
  }
  return out.sort((a, b) => a[1].length - b[1].length);
}
// Zählen: heutige Kombinationen Material×Stärke×Verbindung×Rückwand (Sideboard, Wohnraum)
let tot = 0, ok = 0;
for (const [k, M] of Object.entries(MATS)) if (!M.boards) for (const t of M.t) for (const j of Object.keys(JOINTS)) for (const b of Object.keys(BACKS)) {
  tot++; const d = { mat:k, t, joint:j, back:b, room:'living', top: j === 'screws' ? 'between' : 'over' };
  if (passtSB(d)[0][1].length === 0) ok++;
}
console.log('Sideboard Material×Stärke×Verbindung×Rückwand:', tot, '→ in Bauweisen', ok);
// Reduit eingebaut: Material×Stärke×Bauart×Wand; selbststehend ×Verbindung×Rückwand
let rt = 0, rok = 0;
for (const [k, M] of Object.entries(MATS)) for (const t of M.t) for (const w of ['solid','drywall']) {
  for (const s of Object.keys(SYS)) { rt++; if (passtRD({ build:'built', sys:s, mat:k, t, wall:w, dBack:300, dLeft:300, dRight:300 })[0][1].length === 0) rok++; }
  for (const j of Object.keys(JOINTS)) for (const b of Object.keys(BACKS)) { rt++; const d = { build:'free', mat:k, t, wall:w, joint:j, back:b };
    const R6 = RD.R6; const jOk = (['dekorspan','mdf'].includes(k) ? 'cam' : 'pocket') === j;
    if (passtRD(d)[0][1].length === 0 && jOk) rok++; }
}
console.log('Reduit Material×Stärke×Bauart(×Verbindung×Rückwand)×Wand:', rt, '→ in Bauweisen', rok);
// Zufall heute: wie viele Würfe lägen ausserhalb jeder Bauweise, und warum?
function lcg(seed){ let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2**32; }
const FORM = { kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid', shape:'U', corner:'L', build:'built', sys:'battens',
  dBack:'400', dLeft:'300', dRight:'300', nShelves:'5', gapBottom:'150', gapTop:'300', nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300' };
for (const kind of ['sideboard', 'reduit']) {
  const rnd = lcg(kind === 'sideboard' ? 12345 : 987654); const why = {}; let out = 0; const N = 400;
  for (let i = 0; i < N; i++) {
    const d = K.zufall({ ...FORM, kind }, rnd);
    const best = kind === 'sideboard' ? passtSB(d)[0] : passtRD(d)[0];
    let v = best[1];
    if (kind === 'reduit' && d.build === 'free') { const jOk = (['dekorspan','mdf'].includes(d.mat) ? 'cam' : 'pocket') === d.joint; if (!jOk) v = [...v, 'Verbindung']; }
    // Sideboard: Fachbreite über SPAN mit Einlegeböden
    if (kind === 'sideboard') { const R = K.computeData(d); if (Number(d.shelves) && R.s > maxSpan(d.mat, Number(d.t))) v = [...v, 'Fach > SPAN']; }
    if (v.length) { out++; for (const x of v) why[x] = (why[x] || 0) + 1; }
  }
  console.log(kind, 'Zufall heute ausserhalb der Bauweisen:', out, '/', N, JSON.stringify(why));
}
