const { run } = require('./RG_lib.js');
const RD = { kind:'reduit', sys:'rails', grain:false };
run('I, Tür innen, dBack 600, rd 1400', { ...RD, shape:'I', doorIn:true, dBack:'600' });
run('L rechts, Band links, dBack 600', { ...RD, shape:'L', corner:'R', doorIn:true, hinge:'L', dBack:'600' });
run('U Wangen Tür innen (Rest 200 links)', { ...RD, sys:'cheeks', doorIn:true });
run('U frei Tür innen (Rest 200 links)', { ...RD, build:'free', doorIn:true });
run('Standard Reduit ohne Maserung', { kind:'reduit', grain:false });
