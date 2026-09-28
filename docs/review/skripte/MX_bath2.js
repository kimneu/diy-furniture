const { K, FORM, run, hard } = require('./MX_lib.js');
const R = run({ ...FORM, mat:'dekorspan', t:'19', room:'bath', back:'ply6' });
console.log(R.steps.find(s => /versiegeln/.test(s[0])));
console.log(R.steps.map(s => s[0]).join(' > '));
console.log(R.finish);
