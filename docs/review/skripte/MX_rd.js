const { K, FORM, run, hard } = require('./MX_lib.js');
const key = w => w.replace(/\d+/g,'#').slice(0,75);
const RF = { ...FORM, kind:'reduit' };
const res = [];
for (const mat of Object.keys(MATS)) for (const t of MATS[mat].t) for (const shape of ['I','L','U']) {
  for (const sys of ['battens','rails','brackets','cheeks','posts']) {
    const R = run({ ...RF, mat, t:String(t), shape, build:'built', sys });
    res.push({ mat, t, shape, b:'built', sys, hard:hard(R), R });
  }
  for (const joint of ['pocket','screws','dowels','cam']) for (const back of ['hdf3','hf3','ply6','none']) {
    const R = run({ ...RF, mat, t:String(t), shape, build:'free', joint, back });
    res.push({ mat, t, shape, b:'free', sys:joint+'/'+back, hard:hard(R), R });
  }
}
console.log('Kombinationen', res.length, 'ohne harte Warnung', res.filter(r=>!r.hard.length).length);
// Tabelle: U-Form, je mat/t: built je sys -> OK/Warnung; free pocket/hdf3
console.log('\nU-Form, Raum 1600x1400x2400, Tiefen 400/300/300, 5 Tablare: [max] battens rails brackets cheeks posts | free pocket/hdf3');
for (const mat of Object.keys(MATS)) for (const t of MATS[mat].t) {
  const cells = ['battens','rails','brackets','cheeks','posts','pocket/hdf3'].map(s => { const r = res.find(r => r.mat===mat && r.t===t && r.shape==='U' && r.sys===s); return r.hard.length ? 'W:' + r.hard.map(w => w.slice(0,28)).join('+') : 'ok'; });
  console.log(mat.padEnd(12), String(t).padEnd(3), 'max', maxSpan(mat,t), '|', cells.join(' | '));
}
const agg = new Map();
for (const o of res) for (const w of o.hard) { const k = key(w); agg.set(k, (agg.get(k)||0)+1); }
console.log('\nHarte Warnungen:'); for (const [k,v] of [...agg].sort((a,b)=>b[1]-a[1])) console.log(v, k);
// free: Warnungen nach Rückwand
console.log('\nfree, back none -> alle Warnungen (Beispiel birke 18 U pocket):');
const f = res.find(r => r.mat==='birke'&&r.t===18&&r.shape==='U'&&r.sys==='pocket/none'); console.log(f.R.warn);
