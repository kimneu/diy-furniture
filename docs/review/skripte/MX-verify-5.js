const { K, FORM, sb, rd, hard } = require('./MX-verify-lib.js');
// MX-5
{ const { R } = rd({ mat:'dreischicht', t:'19', build:'free', shape:'U', joint:'pocket', back:'none' });
  console.log('MX5 warn', JSON.stringify(R.warn), 'hard', hard(R).length, 'modules', R.modules, 'Seiten', R.rows.filter(r=>r.name==='Seite').map(r=>r.qty+'x'+r.L+'x'+r.B+'x'+r.t).join(','));
  console.log('   angle40', JSON.stringify(R.hw.filter(h=>/Winkelverbinder/.test(h[1]))));
  const { R: S } = sb({ back:'none' }); console.log('   SB none hard', JSON.stringify(hard(S)));
  // zufall with locked material incl back none
  function seeded(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2**32; }; }
  const rnd = seeded(5); let nFreeNone = 0, n = 0;
  for (let i = 0; i < 200; i++) { const d = K.zufall({ ...FORM, kind:'reduit', mat:'dreischicht', t:'19', back:'none', price:'74.95', sheetL:'2500', sheetB:'1250', grain:true }, rnd, 60, ['material']); if (d.build === 'free') { n++; const R2 = K.computeData(d); if (!hard(R2).length) nFreeNone++; } }
  console.log('   zufall locked material back none: free=', n, 'free & no hard warn=', nFreeNone);
}
// MX-6
for (const [mat,t] of [['dekorspan','16'],['dekorspan','19'],['osb','18'],['mdf','19']]) {
  const { R } = sb({ mat, t, joint:'screws', top:'between' });
  const st = R.steps.find(s=>s[0]==='Schraublöcher vorbohren');
  console.log('MX6', mat, t, R.hw[0][1], '| hard', hard(R).length, '|', st[1].slice(-120));
}
{ const { R } = rd({ mat:'dekorspan', t:'19', build:'free', joint:'screws' }); console.log('MX6 RD free dekorspan', R.hw[0][1], R.warn); }
// MX-7
for (const t of ['18','27']) { const { R } = sb({ mat:'eiche', t, joint:'pocket' }); console.log('MX7 eiche', t, R.hw[0][1], '|', R.hw[0][2], 'hard', hard(R).length); }
