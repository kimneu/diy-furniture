// Ebene x–y (Ansicht von vorn): hinteres Tablar (Länge L, Dicke t) soll bei montierten Latten auf seine Höhe kommen.
// Hindernisse je Ebene: seitliche Querlatten (x ±[500,524]) und Wandlatten (x ±[776,800]), 48 hoch unter jeder Tablarhöhe.
const L = Number(process.argv[2] || 1594), t = 18, W = 1600, H = 2400;
const levels = JSON.parse(process.argv[3] || '[150,638,1125,1613,2100]');
const target = Number(process.argv[4] || 1125);
const xs = JSON.parse(process.argv[5] || '[[-524,-500],[500,524],[-800,-776],[776,800]]');
const obst = [];
for (const y of levels) for (const [a, b] of xs) obst.push([a, b, y - 48, y]);
obst.push([-9999, -W/2, -9999, 9999], [W/2, 9999, -9999, 9999], [-9999, 9999, -9999, 0], [-9999, 9999, H, 9999]);
function collide(cx, cy, a, hl, hd){
  const c = Math.cos(a), s = Math.sin(a);
  for (const [x0,x1,z0,z1] of obst) {
    const bx = (x0 + x1) / 2, bz = (z0 + z1) / 2, bhx = (x1 - x0) / 2, bhz = (z1 - z0) / 2, tx = bx - cx, tz = bz - cy;
    if (Math.abs(tx) >= hl * Math.abs(c) + hd * Math.abs(s) + bhx) continue;
    if (Math.abs(tz) >= hl * Math.abs(s) + hd * Math.abs(c) + bhz) continue;
    if (Math.abs(tx * c + tz * s) >= hl + bhx * Math.abs(c) + bhz * Math.abs(s)) continue;
    if (Math.abs(-tx * s + tz * c) >= hd + bhx * Math.abs(s) + bhz * Math.abs(c)) continue;
    return true;
  }
  return false;
}
const DX = 2, DA = 0.25, X0 = -60, X1 = 60, Y0 = 0, Y1 = H;
const NX = (X1 - X0) / DX + 1, NY = (Y1 - Y0) / DX + 1, NA = Math.round(180 / DA);
const vis = new Uint8Array(NX * NY * NA), q = new Int32Array(NX * NY * NA);
const idx = (i, j, k) => (k * NY + j) * NX + i;
let qn = 0, head = 0, found = false;
const hl = L / 2, hd = t / 2;
// Ziel: waagrecht, Unterkante auf target
{ const i = (0 - X0) / DX, j = Math.round((target + t/2 - Y0) / DX); if (!collide(0, Y0 + j*DX, 0, hl, hd)) { vis[idx(i,j,0)] = 1; q[qn++] = idx(i,j,0); } else console.log('Ziel kollidiert'); }
while (head < qn && !found) {
  const id = q[head++], i = id % NX, j = Math.floor(id / NX) % NY, k = Math.floor(id / (NX * NY));
  for (const [di, dj, dk] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[0,1,1],[0,-1,-1],[0,1,-1],[0,-1,1]]) {
    const ni = i + di, nj = j + dj, nk = (k + dk + NA) % NA;
    if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) continue;
    const nid = idx(ni, nj, nk); if (vis[nid]) continue;
    vis[nid] = 2;
    const cx = X0 + ni * DX, cy = Y0 + nj * DX, a = nk * DA * Math.PI / 180;
    if (collide(cx, cy, a, hl, hd)) continue;
    vis[nid] = 1; q[qn++] = nid;
    const half = hl * Math.abs(Math.cos(a)) + hd * Math.abs(Math.sin(a));
    if (cx + half < 500 && cx - half > -500) { found = true; console.log(`   frei im Gang bei ${(nk*DA).toFixed(2)}°, Mitte y ${cy}`); break; }
  }
}
console.log(`L ${L}, Ziel ${target}: ${found ? 'erreichbar' : 'NICHT erreichbar'} (besucht ${qn})`);
