const { run, overlaps } = require('./TR-verify-lib.js');
const K = require(require('path').join(__dirname, '../../..') + '/konfig.js');
for (const [lab,o] of [['Birke 18',{}],['OSB 12',{mat:'osb',t:12,sheetL:2770,sheetB:2070}],['Spanplatte 16',{mat:'dekorspan',t:16,sheetL:2800,sheetB:2070}],['Regalbau 16 (Bretter)',{mat:'regalbau',t:16}],['MDF 16',{mat:'mdf',t:16,sheetL:2800,sheetB:2070}]]) {
  const R = run({shape:'U', sys:'posts', ...o});
  const posts = R.rows.filter(r=>r.name.startsWith('Kantholz')).reduce((a,r)=>a+r.qty,0);
  const notches = overlaps(R,'Tablar','Kantholz').length;
  console.log(`posts U ${lab}: max ${R.max}, Pfosten ${posts}, Ausklinkungen ${notches}, Kanthölzer CHF ${(R.rows.filter(r=>r.name.startsWith('Kantholz')).reduce((a,r)=>a+r.qty*r.L/1000*r.pm,0)).toFixed(2)}, Schrauben 5×70 ${(R.hw.find(h=>/5 × 70/.test(h[1]))||[0])[0]}, Warn: ${R.warn.join(' / ')}`);
}
// Querlatten-Spannweite zwischen Pfosten (hinten) bei OSB 12
const R = run({shape:'U', sys:'posts', mat:'osb', t:12, sheetL:2770, sheetB:2070});
console.log('  OSB 12 Pfosten x:', R.boxes.filter(b=>b.key.startsWith('Kantholz')).map(b=>Math.round(b.pos[0])+'/'+Math.round(b.pos[2])).join(' '));
// Wangen 12 mm: Lochtiefe
const C = run({shape:'U', sys:'cheeks', t:12});
console.log('cheeks Birke 12:', C.rows.filter(r=>r.name==='Wange').map(r=>r.qty+'× '+r.L+'×'+r.B+'×'+r.t).join(', '), '| Schritt:', C.steps.find(s=>/Wangen/.test(s[0]))[1].slice(0,110));
// Zufall bei Gipskarton
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FORM = { kind:'reduit', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100', rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'drywall', shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300', nShelves:'5', gapBottom:'150', gapTop:'300', mat:'birke', t:'18', back:'hdf3', joint:'pocket', nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300' };
const rnd = seeded(3), cnt = {};
for (let i=0;i<200;i++){ const d = K.zufall({...FORM}, rnd); const k = d.build==='free' ? 'free' : d.sys; cnt[k]=(cnt[k]||0)+1; }
console.log('Zufall Gipskarton 200 Würfe:', JSON.stringify(cnt), '| HARMLOS trifft GK-Warnung:', K.HARMLOS.test('Gipskarton trägt wenig: ...'));
// Standard-Formular = Leisten U Birke 18 -> Warnung?
const D = K.computeData({ ...FORM, wall:'solid' });
console.log('Standardformular sys', FORM.sys, '-> Warnungen:', D.warn.join(' / '));
