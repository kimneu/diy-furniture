const { SB } = require('./BW_lib.js');
const c = require(require('path').join(__dirname, '../../..') + '/test/fixtures/sideboard-configs.json');
const NACHBAR = { seekiefer:'fichtesp', osb:'fichtesp' };   // Material ohne Bauweise → nächstes Material gleicher Klasse
function bauweiseVon(d){
  const mat = SB.S1.mats[d.mat] || Object.values(SB).some(R => R.mats[d.mat]) ? d.mat : NACHBAR[d.mat];
  const cands = Object.entries(SB).filter(([, R]) => R.mats[mat]);
  const [id, R] = cands.find(([, R]) => R.joint === d.joint) || cands[0];
  const v = [];
  if (mat !== d.mat) v.push(`Material ${d.mat} → ${mat}`);
  if (!R.mats[mat].includes(Number(d.t))) v.push(`Stärke ${d.t} → ${R.mats[mat][0]}`);
  if (d.joint !== R.joint) v.push(`Verbindung ${d.joint} → ${R.joint}`);
  if (!R.backs.includes(d.back)) v.push(`Rückwand ${d.back} → ${R.backs[0]}`);
  if (d.room === 'bath' && !R.bath.includes(mat)) v.push('Bad: Material nicht badtauglich');
  if (R.top && d.top !== R.top) v.push(`Deckel ${d.top} → ${R.top}`);
  return { id, v };
}
c.forEach((x, i) => { const r = bauweiseVon(x); console.log(i + 1, `${x.mat} ${x.t} ${x.joint} ${x.back} ${x.room}`, '→', r.id, r.v.join('; ') || 'passt'); });
