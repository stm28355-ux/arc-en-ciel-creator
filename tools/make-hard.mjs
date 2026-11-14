// 高難易度「ツーイス未踏区域」の10地域を作り、src/data/hard.js に書き出す（フェーズ9、2026-11-14）。
//   node tools/make-hard.mjs
// 企画者の注文：
//   ・レベル80で5地域、99で5地域。研究は全部最大が前提
//   ・モンスター数の上限は 5・7・10 のどれか
//   ・ウェーブは3つ（ウェーブ3にボス）
//   ・道：まだ使っていない形（入口が3つ・行ったり来たり）、ふつうの曲がった1本、置けないマスが多い、渦巻き
//   ・資源地：まったくない / ほどほど / わざと固めて施設を使わせる
//   ・属性はある程度固める
// 地図は道の折れ目（点の並び）から描き、置けないマス・資源地は決まった乱数で置く（何度作っても同じ）。
// 敵の体力はあとで tools/tune-regions.mjs で合わせる（ここでは比だけ決める）。
// 注意：作り直すと src/data/hard.js の敵の体力が比に戻る。作り直したら tools/tune-regions.mjs hard1 … hard10 でもう一度合わせる。
import fs from 'node:fs';
import { MONSTERS } from '../src/data/monsters.js';
import { parseMap } from '../src/core/map.js';

const W = 28;
const H = 16;
const NODE_CHAR = { none: 'N', wind: 'W', earth: 'E', water: 'A', thunder: 'Z', fire: 'F', ice: 'I', light: 'L', dark: 'D' };
const GROUND = { fire: 'volcano', water: 'sea', thunder: 'storm', light: 'holy', dark: 'castle', ice: 'snow', earth: 'sand', wind: 'forest', none: 'grass' };

// ---------- 道の形 ----------
const SHAPES = {
  winding: { name: '曲がった1本', paths: [[[0, 2], [6, 2], [6, 12], [12, 12], [12, 4], [18, 4], [18, 12], [24, 12], [24, 6], [27, 6]]] },
  winding2: { name: '曲がった1本', paths: [[[27, 2], [20, 2], [20, 9], [14, 9], [14, 2], [8, 2], [8, 13], [2, 13], [2, 6], [0, 6]]] },
  spiral: { name: '渦巻き', paths: [[[0, 1], [26, 1], [26, 14], [1, 14], [1, 3], [24, 3], [24, 12], [3, 12], [3, 5], [22, 5], [22, 10], [5, 10], [5, 7], [19, 7]]] },
  spiralOut: { name: '渦巻き（まん中から外へ）', paths: [[[19, 7], [5, 7], [5, 10], [22, 10], [22, 5], [3, 5], [3, 12], [24, 12], [24, 3], [1, 3], [1, 14], [26, 14], [26, 1], [0, 1]]] },
  blocked: { name: '置けないマスが多い', blocked: true, paths: [[[0, 8], [5, 8], [5, 3], [11, 3], [11, 12], [17, 12], [17, 4], [23, 4], [23, 10], [27, 10]]] },
  blocked2: { name: '置けないマスが多い', blocked: true, paths: [[[0, 4], [9, 4], [9, 11], [18, 11], [18, 4], [27, 4]]] },
  three: {
    name: '入口が3つ',
    paths: [
      [[0, 2], [8, 2], [8, 7], [16, 7], [16, 3], [22, 3], [22, 11], [27, 11]],
      [[0, 7], [8, 7]],
      [[0, 13], [8, 13], [8, 7]],
    ],
  },
  three2: {
    name: '入口が3つ（上から）',
    paths: [
      [[3, 0], [3, 6], [13, 6], [13, 11], [25, 11], [25, 15]],
      [[13, 0], [13, 6]],
      [[23, 0], [23, 6], [13, 6]],
    ],
  },
  snake: { name: '行ったり来たり（たて）', paths: [[[0, 1], [2, 1], [2, 14], [5, 14], [5, 1], [8, 1], [8, 14], [11, 14], [11, 1], [14, 1], [14, 14], [17, 14], [17, 1], [20, 1], [20, 14], [23, 14], [23, 1], [26, 1], [26, 14]]] },
  snake2: { name: '行ったり来たり（よこ）', paths: [[[0, 1], [26, 1], [26, 4], [1, 4], [1, 7], [26, 7], [26, 10], [1, 10], [1, 13], [27, 13]]] },
};

// ---------- 10地域 ----------
//   level：想定のレベル / limit：置けるモンスターの数 / nodes：none・some・cluster / els：敵の属性（多い順）
const PLAN = [
  { level: 80, limit: 10, shape: 'winding', nodes: 'some', els: ['fire', 'earth'] },
  { level: 80, limit: 7, shape: 'spiral', nodes: 'cluster', els: ['water', 'ice'] },
  { level: 80, limit: 5, shape: 'blocked', nodes: 'none', els: ['thunder', 'wind'] },
  { level: 80, limit: 7, shape: 'three', nodes: 'some', els: ['light', 'none'] },
  { level: 80, limit: 10, shape: 'snake', nodes: 'cluster', els: ['dark', 'fire'] },
  { level: 99, limit: 7, shape: 'winding2', nodes: 'none', els: ['ice', 'wind'] },
  { level: 99, limit: 5, shape: 'spiralOut', nodes: 'some', els: ['earth', 'thunder'] },
  { level: 99, limit: 10, shape: 'blocked2', nodes: 'cluster', els: ['water', 'dark'] },
  { level: 99, limit: 5, shape: 'three2', nodes: 'cluster', els: ['light', 'ice'] },
  { level: 99, limit: 7, shape: 'snake2', nodes: 'none', els: ['dark', 'light'] },
];
const NODE_NAME = { none: 'なし', some: 'ほどほど', cluster: '固めてある' };

function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function drawMap(shape, nodeMode, els, seed) {
  const rnd = rng(seed);
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const starts = [];
  let base = null;
  SHAPES[shape].paths.forEach((pts, pi) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const dx = Math.sign(x1 - x0);
      const dy = Math.sign(y1 - y0);
      for (let x = x0, y = y0; ; x += dx, y += dy) {
        g[y][x] = '#';
        if (x === x1 && y === y1) break;
      }
    }
    starts.push(pts[0]);
    if (pi === 0) base = pts.at(-1);
  });
  for (const [x, y] of starts) g[y][x] = 'S';
  g[base[1]][base[0]] = 'B';
  const isPath = (x, y) => '#SB'.includes(g[y]?.[x] ?? '');
  const near = (x, y, r) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (isPath(x + dx, y + dy)) return true;
    return false;
  };
  const grass = () => {
    const out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === '.') out.push([x, y]);
    return out;
  };
  // 資源地
  const nodeEls = [els[0], els[0], els[1], els[0], els[1], 'none', els[0], els[1]];
  if (nodeMode === 'some') {
    const cand = grass().filter(([x, y]) => near(x, y, 2) && !near(x, y, 0));
    for (let i = 0; i < 6 && cand.length; i++) {
      const [x, y] = cand.splice(Math.floor(rnd() * cand.length), 1)[0];
      g[y][x] = NODE_CHAR[nodeEls[i]];
      // となり合わないように、まわりの候補を消す
      for (let j = cand.length - 1; j >= 0; j--) if (Math.abs(cand[j][0] - x) <= 2 && Math.abs(cand[j][1] - y) <= 2) cand.splice(j, 1);
    }
  } else if (nodeMode === 'cluster') {
    // 道から少し離れた広い草地に、資源地を2か所に4つずつ固める（まわりに施設を建てる場所が空くように）
    // 2×2 が草地の場所。まわりの空き（施設を建てる場所）が多いところから選ぶ
    const room = (x, y) => {
      let n = 0;
      for (let dy = -2; dy <= 3; dy++) for (let dx = -2; dx <= 3; dx++) if (g[y + dy]?.[x + dx] === '.') n++;
      return n;
    };
    const cand = grass()
      .filter(([x, y]) => [[1, 0], [0, 1], [1, 1]].every(([dx, dy]) => g[y + dy]?.[x + dx] === '.'))
      .filter(([x, y]) => room(x, y) >= 18);
    const used = [];
    for (let c = 0; c < 2 && cand.length; c++) {
      const pick = cand.filter(([x, y]) => used.every(([ux, uy]) => Math.abs(ux - x) > 6 || Math.abs(uy - y) > 4));
      if (!pick.length) break;
      const [x, y] = pick[Math.floor(rnd() * pick.length)];
      used.push([x, y]);
      const set = c === 0 ? [els[0], els[0], els[1], 'none'] : [els[1], els[0], 'light', 'dark'];
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([dx, dy], i) => (g[y + dy][x + dx] = NODE_CHAR[set[i]]));
    }
  }
  // 固めた資源地のまわり2マスには、置けないマスを作らない（施設を建てる場所）
  const keep = new Set();
  if (nodeMode === 'cluster')
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        if (Object.values(NODE_CHAR).includes(g[y][x])) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) keep.add(`${x + dx},${y + dy}`);
  // 置けないマス（木・岩・水）。「置けないマスが多い」地域はたくさん、ほかは少し
  const blocked = SHAPES[shape].blocked;
  for (const [x, y] of grass()) {
    if (keep.has(`${x},${y}`)) continue;
    const p = blocked ? (near(x, y, 1) ? 0.45 : 0.85) : near(x, y, 1) ? 0.02 : 0.08;
    if (rnd() < p) g[y][x] = rnd() < 0.5 ? 'R' : rnd() < 0.6 ? 'T' : '~';
  }
  return g.map((r) => r.join(''));
}

// ---------- 敵 ----------
// その属性のモンスターを、位階の高い順に並べる（ボスと【強】は強そうなもの、ふつうの敵は位階の低め〜まんなか）
const byEl = (el) => Object.keys(MONSTERS).filter((k) => MONSTERS[k].element === el).sort((a, b) => MONSTERS[b].rank - MONSTERS[a].rank || a.localeCompare(b));
const usedBoss = new Set();
function enemiesFor(i, els) {
  const p = byEl(els[0]);
  const s = byEl(els[1]);
  const boss = p.find((k) => !usedBoss.has(k));
  usedBoss.add(boss);
  const elite = p.find((k) => k !== boss && !usedBoss.has(k)) ?? p[1];
  const mid = (list, n) => list[Math.min(list.length - 1, Math.floor(list.length / 2) + n)];
  const id = `h${i + 1}`;
  return {
    [`${id}fast`]: { monster: mid(p, 1), element: els[0], hp: 6, speed: 1.6, drop: 6, damage: 1, size: 0.26 },
    [`${id}tank`]: { monster: mid(p, -1), element: els[0], hp: 14, speed: 0.7, drop: 8, damage: 1, size: 0.34 },
    [`${id}sub`]: { monster: mid(s, 0), element: els[1], hp: 10, speed: 1.0, drop: 6, damage: 1, size: 0.3 },
    [`${id}elite`]: { monster: elite, element: els[0], hp: 60, speed: 0.6, drop: 40, damage: 2, size: 0.44, elite: true },
    [`${id}boss`]: { monster: boss, element: els[0], hp: 260, speed: 0.4, drop: 300, damage: 0, size: 0.5, boss: true },
  };
}
const waves = (id) => [
  [
    { enemy: `${id}fast`, count: 12, interval: 0.8, delay: 0 },
    { enemy: `${id}sub`, count: 8, interval: 1.2, delay: 4 },
  ],
  [
    { enemy: `${id}tank`, count: 10, interval: 1.2, delay: 0 },
    { enemy: `${id}sub`, count: 10, interval: 0.8, delay: 3 },
    { enemy: `${id}elite`, count: 2, interval: 4, delay: 10 },
  ],
  [
    { enemy: `${id}fast`, count: 12, interval: 0.6, delay: 0 },
    { enemy: `${id}boss`, count: 1, interval: 1, delay: 6 },
    { enemy: `${id}tank`, count: 8, interval: 1.0, delay: 10 },
    { enemy: `${id}elite`, count: 3, interval: 5, delay: 14 },
  ],
];

// ---------- 書き出し ----------
const regions = {};
let enemies = {};
PLAN.forEach((p, i) => {
  const id = `hard${i + 1}`;
  const map = drawMap(p.shape, p.nodes, p.els, 9001 + i * 101);
  const parsed = parseMap(map);
  const onRoute = new Set(parsed.routes.flatMap((r) => r.map((c) => `${c.x},${c.y}`)));
  map.forEach((row, y) => [...row].forEach((c, x) => {
    if ('#SB'.includes(c) && !onRoute.has(`${x},${y}`)) throw new Error(`${id}: 道のマス ${x},${y} がどの道にも入っていない`);
  }));
  enemies = { ...enemies, ...enemiesFor(i, p.els) };
  regions[id] = {
    name: `ツーイス第${i + 1}区域`,
    province: 'p5',
    hard: { level: p.level, limit: p.limit, shape: SHAPES[p.shape].name, nodes: NODE_NAME[p.nodes] },
    elements: p.els,
    requires: i === 0 ? 'castle' : `hard${i}`,
    ground: GROUND[p.els[0]],
    baseHp: 3,
    waveGap: 4,
    map,
    waves: waves(`h${i + 1}`),
  };
});

const js = (v, ind = '') => JSON.stringify(v, null, 2).replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:').replace(/"/g, "'").split('\n').join(`\n${ind}`);
const out = `// 高難易度「ツーイス未踏区域」の10地域（フェーズ9、2026-11-14）。tools/make-hard.mjs で作った。
// 研究は全部最大が前提。hard.level が想定のレベル（80 か 99）、hard.limit が置けるモンスターの数。
// 敵の体力は tools/tune-regions.mjs で、調整の基準（tools/sim-region.mjs の STAGES）に合わせて決める。
// 敵はどれも名簿のモンスター（monster）。名前はモンスターの名前（src/data/enemies.js で付ける）。
export const HARD_ENEMIES = ${js(enemies)};

export const HARD_REGIONS = ${js(regions)};

export const HARD_ORDER = ${js(Object.keys(regions))};
`;
fs.writeFileSync('src/data/hard.js', out);
for (const [id, r] of Object.entries(regions)) {
  const parsed = parseMap(r.map);
  console.log(`${id} Lv${r.hard.level} 上限${r.hard.limit} ${r.hard.shape}・資源地${r.hard.nodes} 道${parsed.routes.length}本 長さ${parsed.routes.map((x) => x.length).join('/')} 資源地${parsed.nodes.length} 草地${r.map.join('').split('').filter((c) => c === '.').length} ボス${enemies[`h${id.slice(4)}boss`].monster}`);
}
