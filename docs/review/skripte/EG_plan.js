// Grobe Bewegungsplanung im Grundriss: Kann ein (ggf. um die Längsachse gekipptes) Tablar mit Grundriss L x d
// in das Eckfeld hinter der Eckwange gelangen? Hindernisse: Wangen (volle Höhe) und Wände. BFS über (x, z, Winkel).
const L = Number(process.argv[2] || 760);          // nachsichtig: etwas kürzer als real (768)
const ds = (process.argv[3] || '397,300,250,200,177,150,120,100,60,18').split(',').map(Number);
const obst = JSON.parse(process.argv[4] || '[[-9999,-800,-9999,9999],[-9999,9999,-9999,-700],[-797,-779,-700,-300],[-9,9,-700,-300],[-800,-500,-300,-282],[-800,-500,190,208]]'); // [x0,x1,z0,z1]
const goal = JSON.parse(process.argv[5] || '[-778,-10,-697,-300]');
const DX = 5, DA = 1;
const X0 = -800, X1 = 400, Z0 = -700, Z1 = 500;
const NX = (X1 - X0) / DX + 1, NZ = (Z1 - Z0) / DX + 1, NA = 180 / DA;
function collide(cx, cz, a, hl, hd){
  const c = Math.cos(a), s = Math.sin(a);
  // Rechteck-Achsen u=(c,s), w=(-s,c)
  for (const [x0,x1,z0,z1] of obst) {
    const bx = (x0 + x1) / 2, bz = (z0 + z1) / 2, bhx = (x1 - x0) / 2, bhz = (z1 - z0) / 2;
    const tx = bx - cx, tz = bz - cz;
    // Achse x
    const rx = hl * Math.abs(c) + hd * Math.abs(s); if (Math.abs(tx) >= rx + bhx) continue;
    const rz = hl * Math.abs(s) + hd * Math.abs(c); if (Math.abs(tz) >= rz + bhz) continue;
    // Achse u
    const pu = Math.abs(tx * c + tz * s), ru = bhx * Math.abs(c) + bhz * Math.abs(s); if (pu >= hl + ru) continue;
    const pw = Math.abs(-tx * s + tz * c), rw = bhx * Math.abs(s) + bhz * Math.abs(c); if (pw >= hd + rw) continue;
    return true;
  }
  return false;
}
for (const d of ds) {
  const hl = L / 2, hd = d / 2;
  const vis = new Uint8Array(NX * NZ * NA);
  const idx = (i, j, k) => (k * NZ + j) * NX + i;
  const q = [];
  // Ziel: parallel zu x (k=0), ganz im Eckfeld
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const cx = X0 + i * DX, cz = Z0 + j * DX;
    if (cx - hl >= goal[0] && cx + hl <= goal[1] && cz - hd >= goal[2] && cz + hd <= goal[3] && !collide(cx, cz, 0, hl, hd)) { vis[idx(i,j,0)] = 1; q.push(idx(i,j,0)); }
  }
  let found = false, head = 0;
  while (head < q.length && !found) {
    const id = q[head++];
    const i = id % NX, j = Math.floor(id / NX) % NZ, k = Math.floor(id / (NX * NZ));
    for (const [di, dj, dk] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) {
      const ni = i + di, nj = j + dj, nk = (k + dk + NA) % NA;
      if (ni < 0 || nj < 0 || ni >= NX || nj >= NZ) continue;
      const nid = idx(ni, nj, nk); if (vis[nid]) continue;
      const cx = X0 + ni * DX, cz = Z0 + nj * DX, a = nk * DA * Math.PI / 180;
      if (collide(cx, cz, a, hl, hd)) { vis[nid] = 2; continue; }
      vis[nid] = 1; q.push(nid);
      // draussen: Tablar komplett vor z = -150 im Gang
      const ex = hl * Math.abs(Math.sin(a)) + hd * Math.abs(Math.cos(a));
      if (cz - ex > -150) { found = true; break; }
    }
  }
  console.log(`L ${L} d ${d}: ${found ? 'erreichbar' : 'NICHT erreichbar'} (besucht ${q.length})`);
}
