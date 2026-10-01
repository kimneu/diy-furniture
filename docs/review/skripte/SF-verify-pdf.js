const fs=require('fs'), zlib=require('zlib');
const buf=fs.readFileSync('SF-verify-blum.pdf');
const s=buf.toString('latin1');
let re=/stream\r?\n/g, m, out=[];
while((m=re.exec(s))){
  const start=m.index+m[0].length; const end=s.indexOf('endstream',start);
  const chunk=buf.slice(start,end);
  try{ const d=zlib.inflateSync(chunk).toString('latin1'); out.push(d);}catch(e){ try{const d=zlib.inflateRawSync(chunk.slice(2)).toString('latin1'); out.push(d);}catch(e2){} }
}
let txt=[];
for(const d of out){ if(!/T[jJ]/.test(d)) continue;
  const lines=[]; const r=/\[(.*?)\]\s*TJ|\((.*?)\)\s*Tj|(T\*|Td|TD|Tm)/gs; let k;
  let cur='';
  while((k=r.exec(d))){ if(k[3]){ if(cur) lines.push(cur); cur=''; continue;}
    if(k[1]!==undefined){ const parts=[...k[1].matchAll(/\((.*?)(?<!\\)\)|<([0-9a-fA-F]+)>/g)].map(p=>p[1]!==undefined?p[1]:'<'+p[2]+'>'); cur+=parts.join(''); }
    else cur+=k[2]; }
  if(cur) lines.push(cur);
  txt.push(lines.join('\n'));
}
fs.writeFileSync('SF-verify-blum.txt', txt.join('\n=====\n'));
console.log(out.length, txt.length, txt.join('').length);
