const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
const R = require(p+'reduit.js');
const today = (t,max) => R.cheekPositions({ u0:0, u1:1600, ends:['wall','wall'], niche:null }, t, max);
const paar = (t,max,dS) => R.cheekPositions({ u0:dS - t, u1:1600 - dS + t, ends:['corner','corner'], niche:null }, t, max);
for (const [n,t,max] of [['Birke 18',18,800],['MDF 19',19,550],['go/on 18',18,600]]) {
  const a = today(t,max), b = paar(t,max,300);
  const bays = ps => ps.slice(0,-1).map((u,i)=>ps[i+1]-u-t);
  console.log(n, 'heute', JSON.stringify(a), 'Fächer', JSON.stringify(bays(a)), '| Paar dS300', JSON.stringify(b), 'Fächer', JSON.stringify(bays(b)));
}
// Pfosten vorne: Anzahl bei POST_MAX 1200
const W=1600, D=1400, dB=400, dS=300;
console.log('U: Feld hinten zwischen Eckpfosten', W-2*dS-2*45, 'Feld seitlich Eckpfosten→Vorderwand', D-3-(dB+2)-45);
console.log('L: Feld hinten Eckpfosten→Wand', W-3-dS-45);
