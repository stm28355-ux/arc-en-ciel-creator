// マス目の形（攻撃・効果の範囲、施設の大きさ）と向き。
// 形は「上を向いたとき」の絵で書く。
//   o  自分のマス（施設は複数マスでもよい。最初の o が基準のマス）
//   x  攻撃・効果が届くマス
//   w  製造施設を動かすモンスターを置くマス（作業場所）
//   .  何もない
export const DIRS = ['up', 'right', 'down', 'left'];
export const DIR_NAME = { up: '上', right: '右', down: '下', left: '左' };

const cache = new Map();

export function parseShape(rows) {
  const key = rows.join('/');
  if (cache.has(key)) return cache.get(key);
  let anchor = null;
  const raw = { o: [], x: [], w: [] };
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === 'o' && !anchor) anchor = { x, y };
      if (raw[c]) raw[c].push([x, y]);
      else if (c !== '.') throw new Error(`unknown shape char "${c}"`);
    }),
  );
  if (!anchor) throw new Error('shape needs o');
  const rel = (list) => list.map(([x, y]) => [x - anchor.x, y - anchor.y]);
  const shape = { footprint: rel(raw.o), targets: rel(raw.x), work: rel(raw.w) };
  cache.set(key, shape);
  return shape;
}

/** 上向きの相対位置を、dir の向きに回す（右回り）。 */
export function rotate([dx, dy], dir) {
  const [rx, ry] = rotateRaw(dx, dy, dir);
  return [rx + 0, ry + 0]; // -0 を 0 にする
}

function rotateRaw(dx, dy, dir) {
  switch (dir) {
    case 'right':
      return [-dy, dx];
    case 'down':
      return [-dx, -dy];
    case 'left':
      return [dy, -dx];
    default:
      return [dx, dy];
  }
}

export function nextDir(dir) {
  return DIRS[(DIRS.indexOf(dir ?? 'up') + 1) % 4];
}

/** 置いた位置と向きから、マップ上のマスの一覧を出す。part = 'footprint' | 'targets' | 'work' */
export function cellsOf(rows, x, y, dir, part) {
  return parseShape(rows)[part].map((d) => {
    const [dx, dy] = rotate(d, dir);
    return { x: x + dx, y: y + dy };
  });
}

export const keyOf = (c) => `${c.x},${c.y}`;
