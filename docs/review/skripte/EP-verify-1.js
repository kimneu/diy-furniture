// EP-1: Pfosten im Tablar?
const L = require('./EP-verify-lib.js');
const r = L.R({ sys:'posts' });
const W = r.W, D = r.D;
console.log('W',W,'D',D, 'levels?');
const posts = r.boxes.filter(b => b.key.startsWith('Kantholz'));
posts.forEach(b => console.log('POST', L.fmt(b)));
const shelves = r.boxes.filter(b => b.key.startsWith('Tablar'));
shelves.slice(0,3).forEach(b=>console.log('SHELF', L.fmt(b)));
const ovs = L.overlaps(r.boxes);
const cnt = {};
for (const o of ovs) { const k = o.a.split(' (')[0].split(' ')[0] + ' <> ' + o.b.split(' (')[0].split(' ')[0]; cnt[k] = (cnt[k]||0)+1; }
console.log(cnt);
console.log(ovs.filter(o => /Kantholz/.test(o.a+o.b) && /Tablar/.test(o.a+o.b)).slice(0,3));
// Querlatte position relative to post
const q = r.boxes.filter(b => b.key.includes('Querlatte'));
q.slice(0,2).forEach(b=>console.log('Q', L.fmt(b)));
console.log(r.rows.filter(x=>x.name==='Tablar').map(x=>[x.qty,x.L,x.B,x.note]));
// other supports
for (const [lab, o] of [['battens doorIn', { sys:'battens', doorIn:true }], ['rails nicheL', { sys:'rails', nicheL:true }], ['brackets nicheL', {sys:'brackets', nicheL:true}], ['battens regalbau', { sys:'battens', mat:'regalbau', t:16, rw:2400 }], ['rails regalbau', { sys:'rails', mat:'regalbau', t:16, rw:2400 }]]) {
  const rr = L.R(o);
  const ov = L.overlaps(rr.boxes).filter(x => /Kantholz/.test(x.a+x.b) && /Tablar/.test(x.a+x.b));
  console.log(lab, ov.length, ov[0] && ov[0].d, ov[0] && ov[0].A, ov[0] && ov[0].B);
}
