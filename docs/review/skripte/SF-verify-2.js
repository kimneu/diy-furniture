const { K, FORM, seeded, sb } = require('./SF-verify-lib.js');
for (const [w, sec] of [[1200, 2], [1200, 3], [1800, 2], [1800, 3]]) {
  const { R } = sb({ front:'sliding', w:String(w), sections:String(sec), shelves:'1', handle:'shell' });
  const front = R.D/2;
  const shelf = R.boxes.find(b => /Einlegeboden/.test(b.key));
  const div = R.boxes.find(b => /Mittelwand/.test(b.key));
  console.log(`W${w} n${sec} tf${R.tf} ns${R.slides.length}`);
  for (const s of R.slides) console.log('  door', s.idx, 'x', r0(s.cx - s.ws/2), '..', r0(s.cx + s.ws/2), 'z ab Vorderkante', (front - (s.z + R.tf/2)).toFixed(0), '..', (front - (s.z - R.tf/2)).toFixed(0), 'Wi/2', R.Wi/2);
  console.log('  Einlegeboden vorne ab VK', (front - (shelf.pos[2] + shelf.size[2]/2)).toFixed(0), 'Mittelwand vorne ab VK', div && (front - (div.pos[2] + div.size[2]/2)).toFixed(0));
  const tr = R.extras.filter(e => e.type === 'track')[0];
  console.log('  track 3D ab VK', (front - (tr.z + tr.depth/2)).toFixed(0), '..', (front - (tr.z - tr.depth/2)).toFixed(0));
  const st = R.steps.find(s => /Bodenträger/.test(s[0])); console.log('  step:', st && st[1].slice(0, 200));
  console.log('  step schiene:', R.steps.find(s => /Schiebetüren einsetzen/.test(s[0]))[1].slice(0, 160));
  console.log('  hw:', R.hw.filter(h => /Schiebe/.test(h[1])).map(h => h.join(' | ')));
}
// Zufall
const rnd = seeded(7); let sl = 0, slSh = 0, mism = {};
for (let i = 0; i < 2000; i++) { const d = K.zufall({ ...FORM }, rnd); if (d.front !== 'sliding') continue; sl++; if (Number(d.shelves) > 0) slSh++;
  const R = K.computeData(d); const k = `n${R.n}/${R.slides.length}`; mism[k] = (mism[k]||0)+1; }
console.log('sliding', sl, 'mit Einlegeböden', slSh, mism);
