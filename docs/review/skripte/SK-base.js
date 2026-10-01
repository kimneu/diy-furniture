const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95, frontMat:'korpus' };
function run(o){ const c = { ...BASE, ...o }; const M = MATS[c.mat]; if (!o.price) c.price = matPrice(M, c.t); if (!o.sheetL) { c.sheetL = M.sheet[0]; c.sheetB = M.sheet[1]; } return computeSideboard(c); }
module.exports = { run, BASE, K };
