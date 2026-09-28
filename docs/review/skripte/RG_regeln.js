// Prototyp der Sperr-Regeln S01–S17 (IDs wie im Bericht), nur zum Zählen.
const { K } = require('./RG_lib.js');
const LEIM = k => { const M = MATS[k]; return !!M && M.grain && !M.ply && !M.coated; };
function sperren(d){
  const c = K.cfgFromData(d), out = [];
  const hit = id => { if (!out.includes(id)) out.push(id); };
  const verb = (t, joint, mat) => {
    if (joint === 'cam' && (t < 15 || t > 22)) hit('S04');
    if (['dowels', 'screws'].includes(joint) && t < 15) hit('S04');
    if (joint === 'screws' && mat === 'osb') hit('S05');
    if (joint === 'screws' && LEIM(mat)) hit('S06');
  };
  if (c.kind !== 'reduit') {
    const { fmat, tf } = frontMaterial(c);
    if (c.t < 15) hit('S01');
    verb(c.t, c.joint, c.mat);
    if (c.back === 'none' && c.front !== 'open') hit('S07');
    if (c.room === 'bath' && (c.mat === 'dekorspan' || (c.front !== 'open' && fmat === 'dekorspan') || ['hdf3', 'hf3'].includes(c.back))) hit('S09');
    if (c.front === 'hinged' && c.t >= 22) hit('S10');
    if (c.front === 'sliding' && tf < 16) hit('S11');
    if (c.front !== 'open' && c.color !== 'korpus' && ['eiche', 'osb'].includes(fmat)) hit('S12');
    if (!c.grain && LEIM(c.mat)) hit('S13');
  } else {
    const { cfg } = normReduit(c);
    const deps = [cfg.dBack, cfg.hasL && cfg.dLeft, cfg.hasR && cfg.dRight].filter(Boolean);
    const free = cfg.build === 'free', tall = cfg.rh - cfg.gapTop > 1200;
    if (cfg.t < 15) hit('S02');
    if ((free ? tall : cfg.sys === 'cheeks') && cfg.t < 16) hit('S03');
    if (free) verb(cfg.t, c.joint, cfg.mat);
    if (free && c.back === 'none' && tall) hit('S08');
    if (!free && cfg.sys === 'brackets' && Math.max(...deps) > 375) hit('S14');
    if (!free && cfg.sys === 'rails' && Math.min(...deps) < 260) hit('S15');
    if (!free && cfg.wall === 'drywall' && ['rails', 'brackets'].includes(cfg.sys)) hit('S16');
    if (!free && cfg.sys === 'posts') hit('S17');
  }
  return out;
}
module.exports = { sperren };
