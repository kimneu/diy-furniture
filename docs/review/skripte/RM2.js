const { K, BASE, run } = require('./RM_lib.js');
// 1) Teile unter dem Boden je System und gapBottom
for (const sys of ['battens','rails','brackets','cheeks','posts']) for (const gb of [0, 30, 50, 100, 150, 200]) {
  const R = run({ shape:'I', sys, gapBottom:gb });
  const all = [...R.boxes.map(b=>({k:'box',b})), ...R.extras.filter(e=>e.type==='metal').map(b=>({k:'metal',b}))];
  const minY = Math.min(...all.map(({b}) => b.pos[1] - b.size[1]/2));
  const under = all.filter(({b}) => b.pos[1] - b.size[1]/2 < -0.5);
  const w = R.warn.filter(x=>/Boden|unter/.test(x));
  console.log(sys, 'gapBottom', gb, 'minY', Math.round(minY), 'Teile unter Boden:', under.length, w.length? w : '');
}
// 2) Schrauben Tablar auf Konsole/Winkel
for (const sys of ['rails','brackets','battens','posts']) for (const mat of [['birke',12],['birke',18],['seekiefer',15]]) {
  const R = run({ shape:'I', sys, mat:mat[0], t:mat[1] });
  console.log(sys, mat.join(' '), R.hw.filter(h=>/Holzschrauben|Spreiz|Winkelverb/.test(h[1])).map(h=>h[0]+'× '+h[1]+' ('+h[2]+')').join(' | '));
}
