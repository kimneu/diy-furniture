const { K, FORM, sb, rd, hard } = require('./MX-verify-lib.js');
for (const [mat,t] of [['dreischicht','27'],['fichte','27'],['schaltafel','27']]) {
  const { R } = rd({ mat, t, build:'free', joint:'cam' });
  console.log('RD free cam', mat, t, R.hw[0][1], '|', R.hw[0][2], '| warn', JSON.stringify(R.warn.filter(w=>/Exzenter/.test(w))));
  const S = MATS[mat].boards ? null : sb({ mat, t, joint:'cam' }).R; if (S) console.log('   SB', JSON.stringify(S.warn.filter(w=>/Exzenter/.test(w))));
}
