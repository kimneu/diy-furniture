const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
// (a) heutiger Kombinationsraum
const plate = Object.entries(MATS).filter(([,M])=>!M.boards);
const all = Object.entries(MATS);
let sbKorpus = 0; for (const [k,M] of plate) sbKorpus += M.t.length;
const joints = Object.keys(JOINTS).length, backs = Object.keys(BACKS).length;
let frontOpts = 1; // wie Korpus
for (const [k,M] of plate) frontOpts += frontTs(M).length;
console.log('Plattenmaterialien', plate.length, 'Material×Stärke Sideboard', sbKorpus, 'Verbindungen', joints, 'Rückwände', backs, 'Front-Material×Stärke', frontOpts);
const colors = 5; // korpus + 4
console.log('Sideboard Korpus×Verbindung×Rückwand×Raum', sbKorpus*joints*backs*2, ' ×Front(3 Arten)', sbKorpus*joints*backs*2*3, ' ×Frontmat', sbKorpus*joints*backs*2*frontOpts, ' ×Farbe', sbKorpus*joints*backs*2*frontOpts*colors);
let rdMT = 0; for (const [k,M] of all) rdMT += M.t.length;
const rdBuilt = rdMT*5*2; // sys × wall
const rdFree = rdMT*joints*backs*2;
console.log('Reduit Material×Stärke', rdMT, 'eingebaut (×5 Bauarten ×2 Wandarten)', rdBuilt, 'selbststehend (×4 Verb ×4 Rückw ×2 Wand)', rdFree, 'Summe', rdBuilt+rdFree, ' ×3 Formen', (rdBuilt+rdFree)*3);
