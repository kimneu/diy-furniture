const { passtSB } = require('./BW_lib.js');
const c = require(require('path').join(__dirname, '../../..') + '/test/fixtures/sideboard-configs.json');
c.forEach((x, i) => { const r = passtSB(x); console.log(i + 1, `${x.mat} ${x.t} ${x.joint} ${x.back} ${x.room} ${x.top}`, '→', r[0][0], r[0][1].join(', ') || 'passt'); });
