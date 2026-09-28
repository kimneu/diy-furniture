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

module.exports={SB,RD,passtSB,passtRD,K};
