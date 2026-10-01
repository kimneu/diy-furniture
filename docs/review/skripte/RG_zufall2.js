const { K, FORM } = require('./RG_lib.js');
function lcg(seed){ let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
const LEIM = k => { const M = MATS[k]; return M && M.grain && !M.ply && !M.coated; };
const LEG = { 150:200, 200:250, 250:300 };
// Warn-/Korrektur-Regeln zählen, die heute ohne harte Warnung durchgehen
for (const [kind, seed] of [['sideboard', 12345], ['reduit', 987654]]) {
  const rnd = lcg(seed), cnt = {};
  const inc = k => cnt[k] = (cnt[k] || 0) + 1;
  for (let i = 0; i < 400; i++) {
    const d = K.zufall({ ...FORM, kind }, rnd), c = K.cfgFromData(d);
    if (kind === 'sideboard') {
      const R = computeSideboard(c), span = maxSpan(c.mat, c.t);
      if (c.shelves && R.s > span) inc('W01 Einlegeboden > SPAN');
      if (!c.shelves && R.n > 1 && R.s > span + 200) inc('W02 Deckel/Boden > SPAN+200, n>1');
      const { MF, tf } = frontMaterial(c);
      const dh = R.doors.length ? R.doors[0].dh : R.slides.length ? R.slides[0].dh : 0;
      if (dh > 900 && LEIM(c.front === 'open' ? null : (MATS[c.frontMat] ? c.frontMat : c.mat))) inc('W05 Leimholztür > 900');
      if (c.front === 'hinged' && c.t === 21) inc('K Überschlag 21');
      if (c.joint === 'pocket' && c.mat === 'eiche') inc('K Feingewinde Eiche');
      if (c.joint === 'screws' && ['mdf', 'dekorspan'].includes(c.mat) && c.mat !== 'mdf') inc('K Konfirmat Spanplatte');
      if (c.front === 'sliding' && c.shelves) inc('K Lochreihe Schiebetür');
      if (c.front === 'hinged' && R.doors.some(x => x.dw > 600)) inc('K 2 Türen (Tür > 600)');
    } else {
      const { cfg } = normReduit(c);
      const R = computeReduit(c);
      const deps = [cfg.dBack, cfg.hasL && cfg.dLeft, cfg.hasR && cfg.dRight].filter(Boolean);
      if (cfg.build === 'built' && cfg.sys === 'brackets') {
        const legMax = Math.max(...deps.map(dp => LEG[[150, 200, 250].find(l => l >= dp * 2 / 3) || 250]));
        if (cfg.gapBottom < legMax + 10) inc('K06 Winkel unterstes Tablar');
      }
      if (cfg.doorIn && cfg.rd - cfg.dBack < cfg.doorW + 40) inc('K10 Tür trifft hinteres Regal');
      if (R.warn.some(w => /zwei Stücke/.test(w))) inc('K05 Schiene zweiteilig');
      if (cfg.build === 'built' && cfg.sys === 'battens') inc('Leisten (ok, da Feld < max)');
      if ((cfg.build === 'free' || cfg.sys === 'cheeks') && cfg.shape !== 'I') inc('Eckfach-Prüfung nötig (' + (cfg.build === 'free' ? 'free' : 'cheeks') + ')');
      if (cfg.wall === 'drywall') inc('Gipskarton');
    }
  }
  console.log(kind, cnt);
}
