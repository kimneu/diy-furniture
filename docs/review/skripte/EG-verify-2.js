const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
function dump(over, filt){
  const {R,bx}=run(over);
  const lv = R.steps; 
  const y0 = 150;
  console.log('==', JSON.stringify(over));
  for (const b of bx) if (b.y0 < y0+20 && b.y1 > y0-50 || b.name.startsWith('Kantholz')) if (!filt || filt(b)) console.log('  ', s(b), '|', b.note);
  console.log('  warn', R.warn);
}
dump({sys:'posts'});
