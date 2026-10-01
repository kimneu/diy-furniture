const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
function pairs(over){ const {bx,mt}=run(over); const all=[...bx,...mt]; let n=0; const kinds=new Map();
  for (let i=0;i<all.length;i++) for (let j=i+1;j<all.length;j++) if (hit(all[i],all[j])) { n++; const k=[all[i].name,all[j].name].sort().join('↔'); kinds.set(k,(kinds.get(k)||0)+1); }
  return [n, Object.fromEntries(kinds)]; }
for (const sys of ['battens','rails','brackets','cheeks','posts']) for (const corner of ['L','R']) console.log(sys, corner, JSON.stringify(pairs({sys,shape:'L',corner})));
for (const corner of ['L','R']) console.log('free', corner, JSON.stringify(pairs({build:'free',shape:'L',corner})));
