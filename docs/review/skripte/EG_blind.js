const { mk, f } = require('./EG_lib.js');
const SH = new Set(['Tablar','Einlegeboden','Boden','Deckel']);
for (const shape of [['U','L'],['L','L']]) for (const sys of ['battens','cheeks','free']) for (const mat of ['birke','gon_fichte']) {
  const b = sys === 'free' ? { build:'free' } : { sys };
  const { R, items, c } = mk({ ...b, shape:shape[0], corner:shape[1], mat });
  const n = normReduit(c).cfg, W = R.W, D = R.D, zj = -D/2 + n.dBack;
  const lv = items.filter(i => SH.has(i.name) && Math.abs(i.y0 - 638) < 1);
  const backs = lv.filter(i => i.z1 <= zj + 0.5), sides = lv.filter(i => i.z0 >= zj - 0.5);
  const tot = lv.reduce((a, i) => a + (i.x1 - i.x0) * (i.z1 - i.z0), 0);
  let blind = 0;
  for (const s of backs) {
    if (n.hasL) blind += Math.max(0, Math.min(s.x1, -W/2 + n.dLeft) - s.x0) * (s.z1 - s.z0);
    if (n.hasR) blind += Math.max(0, s.x1 - Math.max(s.x0, W/2 - n.dRight)) * (s.z1 - s.z0);
  }
  const reach = Math.hypot(n.dLeft - 3, n.dBack - 3);
  // Öffnung des Eckfachs (Wangen/Module): Fach, das über die Innenecke reicht
  let open = '';
  const bay = backs.find(s => s.x0 < -W/2 + n.dLeft && s.x1 > -W/2 + n.dLeft);
  if (bay && sys !== 'battens') open = ` | Eckfach ${f(bay.x1 - bay.x0)} lang, davon ${f(-W/2 + n.dLeft - bay.x0)} hinter der Eckwange/Seite, offen ${f(bay.x1 - (-W/2 + n.dLeft))}`;
  console.log(`${shape.join('')} ${sys.padEnd(8)} ${mat.padEnd(10)} je Ebene: Ablage ${(tot/1e6).toFixed(3)} m², hinter Seitenregal ${(blind/1e6).toFixed(3)} m² (${(100*blind/tot).toFixed(0)} %), Griff bis hinterste Ecke ${f(reach)} mm statt ${n.dBack - 3}${open}`);
}
