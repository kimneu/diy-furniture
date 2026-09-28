const { K, FORM } = require('./DY_cfg.js');
const R = K.computeData(K.withCatalog({ ...FORM, mat:'dekorspan', t:'19' }));
let all = 0, back = 0;
for (const r of R.rows) { const p = r.qty*2*(r.L+r.B)/1000; all += p; if (r.kind==='back') back += p; console.log(r.pos, r.qty, r.name, r.L, r.B, r.kind, p.toFixed(2)+' m'); }
console.log('Summe Umfang', all.toFixed(1), 'davon Rückwand', back.toFixed(1), 'finish', R.finish[0]);
// sichtbare Kanten grob: Seiten vorne+oben? (topOver: Seiten oben verdeckt) -> Seiten Vorderkante, Deckel vorne+2 seitl., Boden vorne, Mittelwand vorne, Einlegeböden vorne, Türen rundum
const get = n => R.rows.find(r=>r.name===n);
const S=get('Seite'), De=get('Deckel'), B=get('Boden'), M=get('Mittelwand'), E=get('Einlegeboden'), T=get('Tür');
const vis = 2*S.L + (De.L + 2*De.B) + B.L + M.L + E.qty*E.L + T.qty*2*(T.L+T.B);
console.log('sichtbar ca.', (vis/1000).toFixed(1), 'm');
