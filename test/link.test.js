const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
Object.assign(globalThis, require('../sideboard.js'), require('../reduit.js'));
const K = require('../konfig.js');

const SIDEBOARD = {
  kind:'sideboard', bw:'S1', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', frontMat:'korpus', frontT:'18',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorPos:'mitte', doorOff:'0', doorH:'2000', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'posts', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300',
  katalog:{ price:'100', sheetL:'1500', sheetB:'3000' }
};
const REDUIT = { ...SIDEBOARD, kind:'reduit', bw:'R2', mat:'fichtesp', price:'60', katalog:{ price:'60', sheetL:'1500', sheetB:'3000' } };

for (const [name, d] of [['Sideboard', SIDEBOARD], ['Reduit', REDUIT]]) test(`Link ${name}: hin und zurück ergibt dieselben Werte`, async () => {
  const code = await K.planCode(d);
  assert.match(code, /^1[A-Za-z0-9_-]+$/);
  assert.ok(code.length < 600, `Link ${code.length} Zeichen`);
  const back = await K.planAusCode(code);
  for (const [k, v] of Object.entries(K.linkDaten(d))) assert.deepStrictEqual(back[k], v, k);
  assert.strictEqual(back.kind, d.kind);
});

test('Link: Katalogwerte bleiben weg, solange sie dem Katalog folgen', async () => {
  const back = await K.planAusCode(await K.planCode(SIDEBOARD));
  assert.ok(!('katalog' in back) && !('price' in back));
  const vonHand = await K.planAusCode(await K.planCode({ ...SIDEBOARD, price:'130' }));
  assert.strictEqual(vonHand.price, '130');
});

test('Link: kaputte oder fremde Codes ergeben null', async () => {
  for (const c of [null, '', 'x', '1', '1!!!', '2abc', '1' + 'A'.repeat(40)]) assert.strictEqual(await K.planAusCode(c), null, String(c));
  const kein = '1' + Buffer.from(require('zlib').deflateRawSync('{"kind":"sofa"}')).toString('base64url');
  assert.strictEqual(await K.planAusCode(kein), null);
});
