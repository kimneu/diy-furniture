const { run } = require('./SK-base.js');
const R = run({ front:'sliding', sections:1, shelves:1, W:1000 });
console.log('sections 1 sliding warn:', JSON.stringify(R.warn));
console.log('Bodenträger-Step:', R.steps.find(s => /Bodenträger/.test(s[0]))[1]);
console.log('rows:', R.rows.map(r => `${r.pos} ${r.name} ${r.L}x${r.B}x${r.t} ${r.qty}× ${r.note}`).join('\n'));
