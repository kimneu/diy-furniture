const { K, FORM, run, hard } = require('./MX_lib.js');
const plates = Object.keys(MATS).filter(k => !MATS[k].boards);
console.log('Sideboard-Platten:', plates.map(k => `${k}[${MATS[k].t}]`).join(' '));
console.log('Bretter (nur Reduit):', Object.keys(MATS).filter(k => MATS[k].boards).map(k => `${k}[${MATS[k].t}]`).join(' '));
// Korpus-Matrix: mat × t × joint × back × front(korpus) × room
const out = [];
for (const mat of plates) for (const t of MATS[mat].t) for (const joint of ['pocket','screws','dowels','cam']) for (const back of ['hdf3','hf3','ply6','none'])
 for (const front of ['open','hinged','sliding']) for (const room of ['living','bath']) {
  const d = { ...FORM, mat, t:String(t), joint, back, front, room, frontMat:'korpus', handle: front==='sliding'?'shell':'hole' };
  const R = run(d);
  out.push({ mat, t, joint, back, front, room, hard: hard(R), all: R.warn, hw: R.hw, tf: R.tf });
}
// Aggregation: welche Warnungen je (mat,t,joint) im Wohnraum mit hdf3, hinged
const key = w => w.replace(/\d+/g,'#').slice(0,70);
const agg = new Map();
for (const o of out) for (const w of o.hard) { const k = key(w); agg.set(k, (agg.get(k)||0)+1); }
console.log('\nHarte Warnungen (Anzahl Kombinationen von', out.length, '):'); for (const [k,v] of [...agg].sort((a,b)=>b[1]-a[1])) console.log(v, k);
const clean = out.filter(o => !o.hard.length);
console.log('\nOhne harte Warnung:', clean.length, 'von', out.length);
// je mat/t/joint: ohne Warnung (living, hdf3, hinged)?
console.log('\nmat t joint -> Warnungen bei living/hdf3/hinged');
for (const o of out.filter(o => o.room==='living' && o.back==='hdf3' && o.front==='hinged')) {
  const hw0 = o.hw[0] ? o.hw[0][1] : '';
  console.log(o.mat, o.t, o.joint, '| tf', o.tf, '|', o.hard.length ? o.hard.map(key).join(' // ') : 'OK', '|', hw0);
}
