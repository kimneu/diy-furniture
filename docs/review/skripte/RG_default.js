const { run } = require('./RG_lib.js');
run('Reduit Standard, Schienen, Maserung aus', { kind:'reduit', sys:'rails', grain:false });
run('Reduit Standard, Schienen, gapTop 350', { kind:'reduit', sys:'rails', grain:false, gapTop:'350' });
run('Reduit Standard, Schienen, Sperrholz Fichte 18', { kind:'reduit', sys:'rails', mat:'fichtesp', t:'18' });
run('Reduit Standard, Winkel dBack 300 gapBottom 150', { kind:'reduit', sys:'brackets', grain:false, dBack:'300' });
