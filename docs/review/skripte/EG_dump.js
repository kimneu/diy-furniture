const { mk, f } = require('./EG_lib.js');
const [,, json] = process.argv;
const { R, items } = mk(JSON.parse(json || '{}'));
const y = Number(process.env.Y || -1);
for (const it of items) {
  if (y >= 0 && !(it.y0 <= y+1 && it.y1 >= y-60)) continue;
  console.log(String(it.i).padEnd(4), it.name.padEnd(22), 'x', f(it.x0), f(it.x1), ' y', f(it.y0), f(it.y1), ' z', f(it.z0), f(it.z1), '|', it.note);
}
console.log('WARN', R.warn);
console.log('levels', R.steps.find(s=>s[0].includes('Tablarhöhen'))?.[1]);
