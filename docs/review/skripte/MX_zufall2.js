const { K, FORM, run, hard, lcg } = require('./MX_lib.js');
const cnt = (m, k) => m.set(k, (m.get(k) || 0) + 1);
for (const room of [{ rw:'800', rd:'1200', doorW:'650' }, { rw:'1000', rd:'1200', doorW:'700' }, { rw:'1300', rd:'1800', doorW:'800' }, { rw:'2200', rd:'1600', doorW:'800' }]) {
  const rnd = lcg(4242); const bw = new Map(), mt = new Map(); let fallback = 0; const strips = [];
  for (let i = 0; i < 300; i++) {
    const d = K.zufall({ ...FORM, kind:'reduit', ...room }, rnd);
    const R = K.computeData(d); if (hard(R).length) fallback++;
    const b = d.build === 'free' ? 'free' : d.sys; cnt(bw, b); cnt(mt, d.mat);
    if (b === 'battens' && !MATS[d.mat].boards) strips.push(`${d.mat} ${d.t} ${d.shape} Auflage ${d.t-3} mm`);
  }
  console.log(`Raum ${room.rw}x${room.rd}: Bauweise`, [...bw].map(([k,v])=>`${k}:${v}`).join(' '), '| Material', [...mt].map(([k,v])=>`${k}:${v}`).join(' '), '| Fallback mit Warnung', fallback, '| Leisten aus Platte', strips.length, strips.slice(0,3).join('; '));
}
// Sideboard: Stärken-Pool und Anteil 15 mm
