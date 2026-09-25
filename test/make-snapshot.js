// Einmalig: hält die Ausgabe von compute() aus index.html fest (Characterization-Test).
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = html.indexOf('const clamp'), b = html.indexOf('/* ---------- Ausgabe');
const compute = new Function(html.slice(a, b) + '\nreturn compute;')();
const cfgs = require('./fixtures/sideboard-configs.json');
const out = cfgs.map(c => JSON.parse(JSON.stringify(compute(c))));
fs.writeFileSync(path.join(__dirname, 'fixtures', 'sideboard-snapshot.json'), JSON.stringify(out));
console.log(out.length, 'Snapshots,', out.map(r => r.warn.length).join('/'), 'Warnungen');
