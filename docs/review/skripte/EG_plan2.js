// Feinere Planung mit echter Tablarlänge; Ziel = Endlage, «draussen» = Tablar ganz rechts von der Eckwange (x > xFree)
const L = Number(process.argv[2]), ds = process.argv[3].split(',').map(Number);
const obst = JSON.parse(process.argv[4]), goal = JSON.parse(process.argv[5]), xFree = Number(process.argv[6]);
const DX = 2, DA = 0.5, X0 = goal[0] + L/2 - 100, X1 = X0 + 700, Z0 = goal[2], Z1 = goal[3] + 450;
const NX = Math.round((X1 - X0) / DX) + 1, NZ = Math.round((Z1 - Z0) / DX) + 1, NA = Math.round(90 / DA) + 1;
function collide(cx, cz, a, hl, hd){
  const c = Math.cos(a), s = Math.sin(a);
  for (const [x0,x1,z0,z1] of obst) {
    const bx = (x0 + x1) / 2, bz = (z0 + z1) / 2, bhx = (x1 - x0) / 2, bhz = (z1 - z0) / 2, tx = bx - cx, tz = bz - cz;
    if (Math.abs(tx) >= hl * Math.abs(c) + hd * Math.abs(s) + bhx) continue;
    if (Math.abs(tz) >= hl * Math.abs(s) + hd * Math.abs(c) + bhz) continue;
    if (Math.abs(tx * c + tz * s) >= hl + bhx * Math.abs(c) + bhz * Math.abs(s)) continue;
    if (Math.abs(-tx * s + tz * c) >= hd + bhx * Math.abs(s) + bhz * Math.abs(c)) continue;
    return true;
  }
  return false;
}
for (const d of ds) {
  const hl = L / 2, hd = d / 2, vis = new Uint8Array(NX * NZ * NA), q = new Int32Array(NX * NZ * NA);
  let qn = 0, head = 0, found = false;
  const idx = (i, j, k) => (k * NZ + j) * NX + i;
  const cxg = (goal[0] + goal[1]) / 2;
  for (let j = 0; j < NZ; j++) { const i = Math.round((cxg - X0) / DX), cx = X0 + i * DX, cz = Z0 + j * DX;
    if (Math.abs(cx - cxg) < 0.01 && cz - hd >= goal[2] && cz + hd <= goal[3] && !collide(cx, cz, 0, hl, hd)) { vis[idx(i,j,0)] = 1; q[qn++] = idx(i,j,0); } }
  const seeds = qn;
  while (head < qn && !found) {
    const id = q[head++], i = id % NX, j = Math.floor(id / NX) % NZ, k = Math.floor(id / (NX * NZ));
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) for (let dk = -1; dk <= 1; dk++) {
      if (!di && !dj && !dk) continue;
      const ni = i + di, nj = j + dj, nk = k + dk;
      if (ni < 0 || nj < 0 || nk < 0 || ni >= NX || nj >= NZ || nk >= NA) continue;
      const nid = idx(ni, nj, nk); if (vis[nid]) continue;
      const cx = X0 + ni * DX, cz = Z0 + nj * DX, a = nk * DA * Math.PI / 180;
      vis[nid] = 2;
      if (collide(cx, cz, a, hl, hd)) continue;
      vis[nid] = 1; q[qn++] = nid;
      const xmin = cx - (hl * Math.cos(a) + hd * Math.sin(a));
      if (xmin > xFree) { found = true; console.log(`   Weg gefunden, Ausgang bei Winkel ${(nk*DA).toFixed(1)}°`); break; }
    }
    if (found) break;
  }
  console.log(`L ${L} d ${d}: ${found ? 'erreichbar' : 'NICHT erreichbar'} (Startlagen ${seeds}, besucht ${qn})`);
}
