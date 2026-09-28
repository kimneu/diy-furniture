const { K, BASE, bb, collisions } = require(__dirname + '/RM-verify-lib.js');
function rnd(seed){ let s=seed; return ()=>{ s=(s*1103515245+12345)%2147483648; return s/2147483648; }; }
const FORM = { kind:'reduit', ...Object.fromEntries(Object.entries(REDUIT_DEFAULTS).map(([k,v])=>[k, typeof v==='boolean'? (v?'on':''): v])), mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:'on', price:88.95 };
const rooms = [{}, {rw:1200, rd:1000, doorW:700, doorIn:'on'}, {rw:1800, rd:1100, doorW:800, doorIn:'on', wall:'drywall'}, {rw:1000, rd:1600}];
for (const room of rooms) {
  const st = { n:0, free:0, freeTall:0, cheeks:0, cheeksKipp:0, posts:0, postsPen:0, brackets:0, bracketsUnder:0, rails:0, dry:0, dryRails:0, dryBr:0, doorHit:0, withWarn:0, battens:0, nicheR:0, nicheL:0 };
  for (let s=1; s<=150; s++) {
    const d = K.zufall({ ...FORM, ...room }, rnd(s*7919+13));
    const R = K.computeData(d); const c = normReduit(K.cfgFromData(d)).cfg;
    st.n++;
    if (R.warn.filter(w=>!K.HARMLOS.test(w)).length) st.withWarn++;
    if (c.nicheL) st.nicheL++; if (c.nicheR) st.nicheR++;
    if (c.doorIn && c.rd - c.dBack < c.doorW + 30) st.doorHit++;
    if (c.wall==='drywall') st.dry++;
    if (c.build==='free') { st.free++; const top=Math.max(...R.rows.filter(r=>r.name==='Seite').map(r=>r.L)); if (top > R.room.doorH) st.freeTall++; continue; }
    st[c.sys]++;
    if (c.wall==='drywall' && c.sys==='rails') st.dryRails++;
    if (c.wall==='drywall' && c.sys==='brackets') st.dryBr++;
    if (c.sys==='cheeks') { const w=R.rows.filter(r=>r.name==='Wange'); if (w.some(r=>Math.hypot(r.L,r.B) > c.rh)) st.cheeksKipp++; }
    if (c.sys==='posts') { if (collisions(R,(a,b)=>a.startsWith('Tablar')&&b.startsWith('Kantholz')).length) st.postsPen++; }
    if (c.sys==='brackets') { const miny=Math.min(...R.extras.filter(e=>e.type==='metal').map(e=>bb(e).y0)); if (miny<0) st.bracketsUnder++; }
  }
  console.log(JSON.stringify(room)||'Standard', JSON.stringify(st));
}
