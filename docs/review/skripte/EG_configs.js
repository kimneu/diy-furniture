const SYSS = ['battens','rails','brackets','cheeks','posts','free'];
const SHAPES = [['L','L'],['L','R'],['U','L']];
const MATSEL = ['birke','gon_fichte','moebel_weiss','regalbau'];
const DOORS = [{doorIn:false},{doorIn:true,hinge:'L'},{doorIn:true,hinge:'R'}];
const NICHES = [{},{nicheL:true},{nicheR:true}];
function* configs(){
  for (const sys of SYSS) for (const [shape, corner] of SHAPES) for (const mat of MATSEL) for (const d of DOORS) for (const n of NICHES) {
    const c = { shape, corner, mat, ...d, ...n };
    if (sys === 'free') c.build = 'free'; else { c.build = 'built'; c.sys = sys; }
    yield c;
  }
}
module.exports = { configs, SYSS };
