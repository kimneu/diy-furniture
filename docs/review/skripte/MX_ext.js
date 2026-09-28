const { K, FORM, run, hard } = require('./MX_lib.js');
const key = w => w.replace(/\d+/g,'#').slice(0,90);
// H18: 12-mm-Korpus bis 2400 breit
for (const mat of ['birke','seekiefer','fichtesp','osb']) for (const [w,h,d,sec,sh,base] of [[2400,720,450,4,1,'legs'],[2400,1400,650,4,3,'plinth'],[2400,720,450,3,0,'legs'],[1800,1400,400,2,3,'none'],[2400,600,650,2,0,'legs']]) {
  const R = run({ ...FORM, mat, t:'12', w:String(w), h:String(h), d:String(d), sections:String(sec), shelves:String(sh), base, baseH: base==='plinth'?'80':'160', front:'open' });
  console.log(mat, 12, `${w}x${h}x${d} sec${sec} sh${sh} ${base}`, '| s', Math.round(R.s), '| Wi', R.Wi, '|', hard(R).map(key).join(' // ') || 'OK', '| alle:', R.warn.length);
}
// H10: Einlegeboden-Spannweite Sideboard vs SPAN Reduit
console.log('\nH10');
for (const [mat,t] of [['dekorspan',19],['dekorspan',16],['mdf',19],['mdf',16],['osb',18],['fichte',18],['seekiefer',15],['fichtesp',18],['birke',18],['fichtesp',15],['osb',15],['osb',12],['birke',12]]) {
  // Breite so wählen, dass Fach knapp unter Sideboard-Grenze liegt, 1 Fach bzw 2 Fächer
  const lim = t <= 16 ? 700 : t <= 19 ? 800 : 900;
  // sections 2: s = (W - 2t - t)/2 -> W = 2*s + 3t
  const W = Math.floor((2*(lim-5) + 3*t)/10)*10;
  const R = run({ ...FORM, mat, t:String(t), w:String(W), sections:'2', shelves:'2', front:'open' });
  console.log(mat, t, 'W', W, 's', Math.round(R.s), 'SB-Grenze', lim, 'SPAN', maxSpan(mat,t), '|', hard(R).map(key).join(' // ') || 'OK');
}
// Boden ohne Einlegeböden, 1 Fach
console.log('\nBoden frei 1 Fach');
for (const [mat,t] of [['dekorspan',16],['mdf',16],['osb',12],['birke',12]]) for (const W of [900, 1000, 1100]) {
  const R = run({ ...FORM, mat, t:String(t), w:String(W), sections:'1', shelves:'0', front:'open' });
  console.log(mat, t, 'W', W, 'Wi', R.Wi, '|', hard(R).map(key).join(' // ') || 'OK');
}
