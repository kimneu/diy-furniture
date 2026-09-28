const { run } = require('./SK-verify-lib.js');
let R = run({back:'none', W:1600, H:800, sections:2});
console.log(R.warn, R.hw.filter(h=>/Winkel/.test(h[1])), R.steps.find(s=>/ausrichten/.test(s[0])));
R = run({back:'none', W:1600, H:800, sections:2, front:'sliding'});
console.log('sliding', R.warn);
// SK-14
R = run({joint:'screws', top:'between', sections:3, W:1500});
console.log('SK14 warn', R.warn, R.hw[0], R.steps.find(s=>/Schraub/.test(s[0]))[1]);
// SK-13
for (const [W,n] of [[1800,3],[2400,4]]) { R = run({W, sections:n, D:450, joint:'dowels'}); console.log(W, R.hw.filter(h=>/übel/.test(h[1])), R.tools.filter(t=>/Zwing/.test(t)), R.steps.find(s=>/zusammenbauen/.test(s[0]))[1]); }
// SK-12
for (const t of [16,18]) { const mat = t===16?'mdf':'birke'; R = run({mat, t, joint:'dowels'}); console.log(t, R.steps.find(s=>/Dübel/.test(s[0]))[1], R.hw.filter(h=>/übel/.test(h[1]))[0]); }
