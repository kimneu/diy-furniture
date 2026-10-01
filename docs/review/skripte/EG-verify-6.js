const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
// EG-6 Türwinkel: Band an der Innenkante der Laibung, Blatt doorW lang
function doorAngle(R, c, leafT=0){
  const W=c.rw, D=c.rd, wf=(W-c.doorW)/2, hx = c.hinge==='L' ? -W/2+wf : W/2-wf, sgn = c.hinge==='L'?1:-1;
  const boxes = R.boxes.map(b=>({x0:b.pos[0]-b.size[0]/2,x1:b.pos[0]+b.size[0]/2,z0:b.pos[2]-b.size[2]/2,z1:b.pos[2]+b.size[2]/2}));
  let best=0;
  for (let deg=0; deg<=110; deg+=0.5){
    const a=deg*Math.PI/180; let col=false;
    for (let l=0; l<=c.doorW; l+=5) for (const w of [0, leafT]) {
      const x = hx + sgn*(l*Math.cos(a) + w*Math.sin(a)), z = D/2 - l*Math.sin(a) + w*Math.cos(a);
      if (boxes.some(b=>x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)) col=true;
      if (x < -W/2 || x > W/2) col = true;
    }
    if (col) break; best=deg;
  }
  return best;
}
for (const over of [{shape:'U',rd:1000,doorIn:true,sys:'battens'},{shape:'I',rd:1000,doorIn:true,sys:'battens'},{shape:'U',rd:1100,doorIn:true,sys:'battens'},{shape:'L',rd:1200,doorIn:true,sys:'battens'},{shape:'U',rd:1400,doorIn:true,sys:'battens'},{shape:'U',rd:1400,doorIn:false,sys:'battens'}]){
  const {R,c}=run(over);
  console.log(JSON.stringify(over),'Tür frei bis',doorAngle(R,{...c,rd:c.rd},0),'° (Blatt 0) /',doorAngle(R,c,40),'° (Blatt 40)', '| warn:', R.warn.filter(w=>/Tür|entfällt/.test(w)));
}
// EG-10 Stummel
const {R,bx}=run({shape:'U',doorIn:true,sys:'battens'});
console.log(R.rows.filter(r=>/Tablar|Kantholz/.test(r.name)).map(r=>[r.qty,r.name,r.L,r.B,r.t,r.note]));
console.log(R.hw.filter(h=>/Winkelverb/.test(h[1])));
console.log(R.warn);
