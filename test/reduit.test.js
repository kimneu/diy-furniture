const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
const R = require('../reduit.js');

const cfg = over => R.normReduit({ ...R.REDUIT_DEFAULTS, ...over });
const lay = over => R.layoutReduit(cfg(over).cfg);
const seg = (l, id) => l.segs.find(s => s.id === id);

test('Segmente je Form', () => {
  assert.deepStrictEqual(lay({ shape:'I' }).segs.map(s => s.id), ['back']);
  assert.deepStrictEqual(lay({ shape:'L', corner:'L' }).segs.map(s => s.id), ['back', 'left']);
  assert.deepStrictEqual(lay({ shape:'L', corner:'R' }).segs.map(s => s.id), ['back', 'right']);
  assert.deepStrictEqual(lay({ shape:'U' }).segs.map(s => s.id), ['back', 'left', 'right']);
});

test('hinteres Segment über volle Breite, Seiten stossen davor an', () => {
  const l = lay({ shape:'U', rw:1600, rd:1400, dBack:400 });
  assert.deepStrictEqual([seg(l, 'back').u0, seg(l, 'back').u1], [0, 1600]);
  assert.deepStrictEqual(seg(l, 'back').ends, ['wall', 'wall']);
  assert.deepStrictEqual([seg(l, 'left').u0, seg(l, 'left').u1], [400, 1400]);
  assert.deepStrictEqual(seg(l, 'left').ends, ['corner', 'wall']);
});

test('Tür nach innen verkürzt das Seitenregal auf der Bandseite', () => {
  const l = lay({ shape:'U', rd:1400, doorW:800, doorIn:true, hinge:'L' });
  assert.strictEqual(seg(l, 'left').u1, 600);
  assert.strictEqual(seg(l, 'left').ends[1], 'free');
  assert.strictEqual(seg(l, 'right').u1, 1400);
});

test('Seitentiefe grösser als Wandstück neben der Tür gibt Warnung', () => {
  const l = lay({ shape:'L', corner:'L', rw:1200, doorW:800, dLeft:300 });
  assert.ok(l.warn.some(w => w.includes('Türöffnung')));
  assert.ok(!lay({ shape:'L', corner:'L', rw:1600, doorW:800, dLeft:300 }).warn.some(w => w.includes('Türöffnung')));
});

test('Durchgang unter 600 mm gibt Warnung', () => {
  assert.ok(lay({ shape:'U', rw:1400, dLeft:450, dRight:450 }).warn.some(w => w.includes('Durchgang')));
  assert.ok(!lay({ shape:'U', rw:1600, dLeft:300, dRight:300 }).warn.some(w => w.includes('Durchgang')));
});

test('Nische am vorderen Ende des Seitenregals', () => {
  const s = seg(lay({ shape:'U', nicheL:true, nicheLW:450, nicheLH:1300 }), 'left');
  assert.deepStrictEqual(s.niche, { at:'end', w:450, h:1300 });
});

test('hintere Nische nur ohne Seitensegment auf dieser Seite', () => {
  assert.deepStrictEqual(seg(lay({ shape:'L', corner:'L', nicheB:'R' }), 'back').niche.at, 'end');
  const n = cfg({ shape:'L', corner:'L', nicheB:'L' });
  assert.strictEqual(n.cfg.nicheB, 'none');
  assert.ok(n.warn.some(w => w.includes('Nische')));
});

test('Tablarhöhen gleichmässig zwischen Boden- und Deckenabstand', () => {
  assert.deepStrictEqual(R.shelfLevels(3, 100, 400, 2400), [100, 1050, 2000]);
});

test('toWorld: Wandkoordinaten in Raumkoordinaten', () => {
  const W = 1600, D = 1400;
  assert.deepStrictEqual(R.toWorld({ id:'back' }, W, D, 0, 5, 0), [-800, 5, -700]);
  assert.deepStrictEqual(R.toWorld({ id:'left' }, W, D, 400, 5, 100), [-700, 5, -300]);
  assert.deepStrictEqual(R.toWorld({ id:'right' }, W, D, 400, 5, 100), [700, 5, -300]);
});

test('boxOf dreht Masse und Explosion für Seitensegmente', () => {
  const b = R.boxOf({ id:'left' }, 1600, 1400, { u0:400, u1:1400, y0:0, y1:18, v0:0, v1:300 }, 'y', 'u', {}, [0, 0, 200]);
  assert.deepStrictEqual(b.size, [300, 18, 1000]);
  assert.deepStrictEqual(b.pos, [-650, 9, 200]);
  assert.strictEqual(b.grain, 'z');
  assert.deepStrictEqual(b.ex, [200, 0, 0]);
});

test('Randfall: U mit zu tiefen Seiten wird begrenzt', () => {
  const n = cfg({ shape:'U', rw:800, dLeft:600, dRight:600 });
  assert.ok(n.cfg.dLeft + n.cfg.dRight <= 800 - 300);
  assert.ok(n.warn.some(w => w.includes('begrenzt')));
});

test('Randfall: Nische breiter als Segment wird begrenzt', () => {
  const s = seg(lay({ shape:'U', rd:1000, dBack:400, nicheL:true, nicheLW:1000 }), 'left');
  assert.ok(s.niche.w <= (s.u1 - s.u0) - 200);
});

test('Randfall: ein einziges Tablar', () => {
  assert.deepStrictEqual(R.shelfLevels(1, 150, 300, 2400), [150]);
});

test('Randfall: Tür breiter als Seitenregal lang – Segment entfällt', () => {
  const l = lay({ shape:'U', rd:1000, dBack:400, doorW:800, doorIn:true, hinge:'R' });
  assert.deepStrictEqual(l.segs.map(s => s.id), ['back', 'left']);
  assert.ok(l.warn.some(w => w.includes('entfällt')));
});
