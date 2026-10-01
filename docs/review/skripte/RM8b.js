const { K, BASE, run } = require('./RM_lib.js');
const src = require('fs').readFileSync(require('path').join(__dirname, '../../..') + '/test/konfig.test.js','utf8');
const FORM = eval('(' + src.match(/const FORM = (\{[\s\S]*?\n\});/)[1] + ')');
function seeded(s){ return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const rooms = [
  { rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid' },
  { rw:'1200', rd:'1000', rh:'2400', doorW:'700', doorIn:true, hinge:'L', wall:'solid' },
  { rw:'1800', rd:'1100', rh:'2500', doorW:'800', doorIn:true, hinge:'R', wall:'drywall' },
  { rw:'1000', rd:'1600', rh:'2300', doorW:'700', doorIn:false, hinge:'L', wall:'solid' },
];
const rnd = seeded(42);
for (const room of rooms) {
  const st = { n:0, free:0, freeTooTall:0, doorBack:0, brBelow:0, anyBelow:0, cheeks:0, cheekTilt:0, posts:0, shelfPost:0, minFach:1e9, sys:{}, backClear:[] };
  for (let i = 0; i < 150; i++) {
    const d = K.zufall({ ...FORM, kind:'reduit', ...room }, rnd);
    const R = K.computeData(d); const c = K.cfgFromData(d); const n = normReduit(c).cfg;
    st.n++; st.sys[d.build==='free'?'free':d.sys] = (st.sys[d.build==='free'?'free':d.sys]||0)+1;
    if (d.build === 'free') { st.free++; const top = Math.max(...R.rows.filter(r=>r.name==='Seite').map(r=>r.L)); if (top > R.room.doorH) st.freeTooTall++; }
    const clear = n.rd - n.dBack; st.backClear.push(clear);
    if (n.doorIn && clear < n.doorW + 40) st.doorBack++;
    const all = [...R.boxes, ...R.extras.filter(e=>e.type==='metal')];
    if (all.some(b => b.pos[1]-b.size[1]/2 < -0.5)) { st.anyBelow++; if (d.sys==='brackets' && d.build!=='free') st.brBelow++; }
    if (d.build!=='free' && d.sys==='cheeks') { st.cheeks++; const w = R.rows.find(r=>r.name==='Wange'); if (Math.hypot(w.L, w.B) > n.rh) st.cheekTilt++; }
    if (d.build!=="free" && d.sys==="posts") { st.posts++; const rg=b=>[[b.pos[0]-b.size[0]/2,b.pos[0]+b.size[0]/2],[b.pos[1]-b.size[1]/2,b.pos[1]+b.size[1]/2],[b.pos[2]-b.size[2]/2,b.pos[2]+b.size[2]/2]]; const nm=R.boxes.map(b=>({b,r:R.rows.find(r=>r.key===b.key)})); const S=nm.filter(n=>n.r.name==="Tablar"), P=nm.filter(n=>n.r.name.startsWith("Kantholz")); if (S.some(s=>P.some(p=>{const a=rg(s.b),c=rg(p.b); return [0,1,2].every(i=>Math.min(a[i][1],c[i][1])-Math.max(a[i][0],c[i][0])>1);}))) st.shelfPost++; }
    const lv = shelfLevels(n.nShelves, n.gapBottom, n.gapTop, n.rh); for (let k=1;k<lv.length;k++) st.minFach = Math.min(st.minFach, lv[k]-lv[k-1]-R.t);
  }
  st.backClear = [Math.min(...st.backClear), Math.max(...st.backClear)];
  console.log(JSON.stringify(room)); console.log('  ', JSON.stringify(st));
}
