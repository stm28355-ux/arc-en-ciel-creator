// 地域マップの文字列を読み取り、マス・資源地・敵の道を取り出す。
// 資源地の記号 → 属性
const NODE_CHARS = { N: 'none', W: 'wind', E: 'earth', A: 'water', Z: 'thunder', F: 'fire', I: 'ice', L: 'light', D: 'dark' };

export function parseMap(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const cells = [];
  const nodes = [];
  let start = null;
  let base = null;
  for (let y = 0; y < h; y++) {
    if (rows[y].length !== w) throw new Error(`map row ${y} has width ${rows[y].length}, expected ${w}`);
    const row = [];
    for (let x = 0; x < w; x++) {
      const c = rows[y][x];
      let type;
      if (c === '.') type = 'grass';
      else if (c === '#' || c === 'S' || c === 'B') type = 'path';
      else if (c === 'T') type = 'tree';
      else if (c === '~') type = 'water';
      else if (c === 'R') type = 'rock';
      else if (NODE_CHARS[c]) {
        type = 'node';
        nodes.push({ x, y, element: NODE_CHARS[c] });
      } else throw new Error(`unknown map char "${c}" at ${x},${y}`);
      if (c === 'S') start = { x, y };
      if (c === 'B') base = { x, y };
      row.push(type);
    }
    cells.push(row);
  }
  if (!start || !base) throw new Error('map needs S and B');
  const path = tracePath(cells, start, base);
  return { w, h, cells, nodes, path, start, base };
}

// S から B まで、道のマスを1本の列としてたどる（分かれ道はない前提）。
function tracePath(cells, start, base) {
  const path = [start];
  const seen = new Set([`${start.x},${start.y}`]);
  let cur = start;
  while (cur.x !== base.x || cur.y !== base.y) {
    const next = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
      .map(([dx, dy]) => ({ x: cur.x + dx, y: cur.y + dy }))
      .find((p) => cells[p.y]?.[p.x] === 'path' && !seen.has(`${p.x},${p.y}`));
    if (!next) throw new Error(`path breaks at ${cur.x},${cur.y}`);
    seen.add(`${next.x},${next.y}`);
    path.push(next);
    cur = next;
  }
  return path;
}

/** 道に沿って dist マス進んだ位置（マスの中心が整数＋0.5）。 */
export function pointOnPath(path, dist) {
  if (dist <= 0) return { x: path[0].x + 0.5, y: path[0].y + 0.5 };
  const i = Math.floor(dist);
  if (i >= path.length - 1) {
    const last = path[path.length - 1];
    return { x: last.x + 0.5, y: last.y + 0.5 };
  }
  const t = dist - i;
  const a = path[i];
  const b = path[i + 1];
  return { x: a.x + (b.x - a.x) * t + 0.5, y: a.y + (b.y - a.y) * t + 0.5 };
}

export function pathLength(path) {
  return path.length - 1;
}

/** マス同士の中心の距離。 */
export function cellDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** モンスターや施設を置けるマスか（草地で、まだ何も置いていない）。 */
export function isBuildable(map, x, y, occupied) {
  if (map.cells[y]?.[x] !== 'grass') return false;
  return !occupied.has(`${x},${y}`);
}
