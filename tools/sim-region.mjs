// 地域を画面なしで最後まで流して、結果を表示する（調整の確認用）。
//   node tools/sim-region.mjs            全部の地域の見本
//   node tools/sim-region.mjs forest     森の見本だけ
import { pathToFileURL } from 'node:url';
import { REGIONS } from '../src/data/regions.js';
import { parseMap } from '../src/core/map.js';
import { resolveLayout, canPlace, targetsOf } from '../src/core/layout.js';
import { yieldFrom } from '../src/core/materials.js';
import { DIRS, keyOf } from '../src/core/shape.js';
import { MONSTERS } from '../src/data/monsters.js';
import { FACILITIES } from '../src/data/facilities.js';
import { createBattle, startBattle, step, pace } from '../src/core/battle.js';
import { bagTotal } from '../src/data/elements.js';

const M = (uid, kind, x, y, dir, level = 1) => ({ uid, kind, x, y, dir, level });
const F = (id, kind, x, y, dir) => ({ id, kind, x, y, dir });
const at = (list, level) => list.map((m) => ({ ...m, level }));

// ---------- 草原：無と風のモンスターだけ（土は森から） ----------
const GRASS_TEAM = [
  M('m1', 'slime', 5, 6, 'right'), // 無の資源地のとなり、道を3マス
  M('m2', 'sprite', 12, 9, 'right'), // 無の資源地のとなり、道を5マス
  M('m3', 'bat', 22, 9, 'up'), // 風の資源地のとなり、道を3マス
  M('m4', 'hawk', 21, 12, 'up'), // 道にそって6マス
  M('m5', 'slime', 15, 9, 'left'), // 無の資源地のとなり、道を3マス
];

// ---------- 森：草原のあとの仲間（無と風、融合で生まれたもの） ----------
const FOREST_TEAM = [
  M('m1', 'slime', 5, 9, 'right'), // 無の資源地のとなり
  M('m2', 'sprite', 11, 10, 'right'), // 風の資源地のとなり、道を5マス
  M('m3', 'bat', 18, 6, 'up'), // 道の角
  M('m4', 'hawk', 19, 14, 'up'), // 道にそって6マス
  M('m5', 'falcon', 13, 4, 'down'), // 道の角
  M('m6', 'hedgehog', 7, 11, 'up'),
];

// ---------- 砂漠：森のあとの仲間（土のモンスターも作れる） ----------
const DESERT_TEAM = [
  M('m1', 'golem', 8, 7, 'right'), // 道の角
  M('m2', 'turtle', 10, 3, 'left'), // 道の角
  M('m3', 'crab', 17, 6, 'right'),
  M('m4', 'lizard', 19, 10, 'left'), // 道にそって5マス、剣の台座の効果
  M('m5', 'eagle', 18, 14, 'up'), // 道にそって10マス
  M('m6', 'bat', 8, 9, 'up'),
  M('m7', 'hedgehog', 20, 11, 'up'), // 鍛冶場の作業場所
  M('m8', 'turtle', 22, 8, 'down'), // 土の資源地のとなり（資材）
  M('m9', 'slime', 24, 11, 'down'), // 無の資源地のとなり（資材）
];

/**
 * 見本の配置を自動で作る（地域が増えて、手で置くのが大変なため）。
 * team = [{ kind, level }]：1体ずつ、道に届くマスの数＋資源地から入る資材×0.5 が一番多い場所・向きに置く
 *   道が複数ある地域では、すでに届いているマスほど点を下げて、どの道にも置くようにする（1マスの点 = 1 / (1 + 届いている数)）
 * facilities = [kind]：攻撃・足止めの施設は道に届くマスが一番多い場所、剣・旗は効果の範囲にいるモンスターが一番多い場所に置く
 * extra：配置に足すもの（atkMul・facilityMul など研究の効き目）
 */
export function autoLayout(regionId, team, facilities = [], extra = {}) {
  const map = parseMap(REGIONS[regionId].map);
  const onPath = new Set(map.routes.flatMap((r) => r.map(keyOf)));
  const layout = { monsters: [], facilities: [] };
  const spread = map.routes.length > 1;
  const covered = new Map(); // マス → 届いているユニットの数
  const pathScore = (cells) => cells.filter((c) => onPath.has(keyOf(c))).reduce((sum, c) => sum + (spread ? 1 / (1 + (covered.get(keyOf(c)) ?? 0)) : 1), 0);
  const cover = (cells) => {
    for (const c of cells) if (onPath.has(keyOf(c))) covered.set(keyOf(c), (covered.get(keyOf(c)) ?? 0) + 1);
  };
  const best = (make, score) => {
    let top = null;
    for (let y = 0; y < map.h; y++)
      for (let x = 0; x < map.w; x++)
        for (const dir of DIRS) {
          const item = make(x, y, dir);
          if (!canPlace(map, layout, item)) continue;
          const sc = score(item);
          if (!top || sc > top.sc) top = { item, sc };
        }
    return top?.item;
  };
  team.forEach(({ kind, level }, i) => {
    const item = best(
      (x, y, dir) => ({ uid: `m${i + 1}`, kind, x, y, dir, level, atkMul: extra.atkMul }),
      (m) => {
        const t = targetsOf(m);
        const set = new Set(t.map(keyOf));
        const hits = pathScore(t);
        const got = map.nodes.reduce((sum, n) => sum + yieldFrom({ x: m.x, y: m.y, element: MONSTERS[kind].element, targets: set }, n), 0);
        return hits + 0.5 * got;
      },
    );
    if (!item) return;
    layout.monsters.push(item);
    cover(targetsOf(item));
  });
  facilities.forEach((kind, i) => {
    const def = FACILITIES[kind];
    const item = best(
      (x, y, dir) => ({ id: `f${i + 1}`, kind, x, y, dir }),
      (f) => {
        const t = targetsOf(f);
        if (def.buff) {
          const set = new Set(t.map(keyOf));
          return layout.monsters.filter((m) => set.has(keyOf(m))).length;
        }
        return pathScore(t);
      },
    );
    if (!item) return;
    layout.facilities.push(item);
    if (!def.buff) cover(targetsOf(item));
  });
  return { ...layout, ...extra };
}

const team = (kinds, level) => kinds.map((kind) => ({ kind, level }));
// 第2地方に来たころの仲間（第1地方で育てたものと、水・雷の新しいモンスター）。研究は攻撃力 +15%、戦闘施設 +20% くらい
const P2_TEAM = ['eagle', 'irongolem', 'rockturtle', 'stormbat', 'griffon', 'cloudbird', 'earthgiant', 'bigslime', 'frog', 'jelly'];
const P2_FAC = ['beam', 'beam', 'flag', 'fog', 'tower'];
const P2_RESEARCH = { atkMul: 1.15, facilityMul: 1.2 };
const p2 = (regionId, level) => autoLayout(regionId, team(P2_TEAM, level), P2_FAC, P2_RESEARCH);

export const SAMPLES = {
  grassland: {
    'モンスターだけ': { monsters: GRASS_TEAM, facilities: [] },
    '光線塔＋旗': { monsters: GRASS_TEAM, facilities: [F('f1', 'beam', 22, 4, 'left'), F('f2', 'flag', 15, 7, 'down')] },
    // 草原には土がないので、角笛は研究で土の資源地を持ち込んだときだけ建てられる
    '角笛1個（土の資源地を持ち込み）': {
      monsters: GRASS_TEAM,
      facilities: [F('f1', 'beam', 22, 4, 'left'), { ...F('c1', 'carry', 6, 5, 'up'), element: 'earth' }, F('f2', 'horn', 0, 1, 'up')],
    },
  },
  forest: {
    '草原の仲間 Lv5': { monsters: at(FOREST_TEAM, 5), facilities: [] },
    '草原の仲間 Lv5＋光線塔・旗': { monsters: at(FOREST_TEAM, 5), facilities: [F('f1', 'beam', 19, 4, 'down'), F('f2', 'flag', 10, 11, 'up')] },
    '草原の仲間 Lv10＋光線塔・旗': { monsters: at(FOREST_TEAM, 10), facilities: [F('f1', 'beam', 19, 4, 'down'), F('f2', 'flag', 10, 11, 'up')] },
  },
  desert: {
    '森の仲間 Lv8': { monsters: at(DESERT_TEAM, 8), facilities: [] },
    '森の仲間 Lv8＋鍛冶場・剣': { monsters: at(DESERT_TEAM, 8), facilities: [F('f1', 'smithy', 20, 12, 'up'), F('f2', 'sword', 20, 9, 'up')] },
    '森の仲間 Lv13＋鍛冶場・剣': { monsters: at(DESERT_TEAM, 13), facilities: [F('f1', 'smithy', 20, 12, 'up'), F('f2', 'sword', 20, 9, 'up')] },
  },
};

// 第2地方：自動の配置で、負けるレベルと攻略できるレベル
SAMPLES.river = { '第2地方の仲間 Lv20': p2('river', 20), '第2地方の仲間 Lv25': p2('river', 25) };
SAMPLES.storm = { '第2地方の仲間 Lv25': p2('storm', 25), '第2地方の仲間 Lv30': p2('storm', 30) };
SAMPLES.sea = { '第2地方の仲間 Lv30': p2('sea', 30), '第2地方の仲間 Lv35': p2('sea', 35) };

// 第3地方に来たころの仲間（第2地方までの強いものと、炎・氷の新しいモンスター）。研究は攻撃力 +20%、戦闘施設 +40% くらい
const P3_TEAM = ['cannon', 'kraken', 'earthgiant', 'irongolem', 'eagle', 'griffon', 'cloudbird', 'magmagolem', 'mammoth', 'firebird', 'yukionna', 'icewitch'];
const P3_FAC = ['beam', 'beam', 'flag', 'fog', 'tower', 'brazier', 'icicle'];
const p3 = (regionId, level) => autoLayout(regionId, team(P3_TEAM, level), P3_FAC, { atkMul: 1.2, facilityMul: 1.4 });
SAMPLES.volcano = { '第3地方の仲間 Lv35': p3('volcano', 35), '第3地方の仲間 Lv40': p3('volcano', 40) };
SAMPLES.snow = { '第3地方の仲間 Lv40': p3('snow', 40), '第3地方の仲間 Lv45': p3('snow', 45) };
SAMPLES.mixed = { '第3地方の仲間 Lv45': p3('mixed', 45), '第3地方の仲間 Lv50': p3('mixed', 50) };

export function simulate(regionId, layout, { maxTime = 1200 } = {}) {
  const region = REGIONS[regionId];
  const map = parseMap(region.map);
  const r = resolveLayout(map, layout);
  const b = createBattle(region, map);
  startBattle(b, r);
  const dt = 1 / 30;
  const losses = []; // 拠点が減ったとき（ウェーブと秒）
  let hp = b.baseHp;
  while (b.phase === 'running' && b.time < maxTime) {
    step(b, dt, r);
    if (b.baseHp !== hp) {
      losses.push(`W${b.wavesStarted}@${b.time.toFixed(0)}s-${hp - b.baseHp}`);
      hp = b.baseHp;
    }
  }
  return { b, r, losses };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const only = process.argv[2];
  for (const [regionId, samples] of Object.entries(SAMPLES)) {
    if (only && only !== regionId) continue;
    console.log(`--- ${REGIONS[regionId].name} ---`);
    for (const [name, layout] of Object.entries(samples)) {
      const { b, r, losses } = simulate(regionId, layout);
      const mat = Object.entries(r.prod.bag).filter(([, n]) => n).map(([k, n]) => `${k}${n}`).join(' ');
      const st = [...r.status.entries()].map(([id, s]) => `${id}:${s}`).join(' ');
      const got = Object.entries(b.gained).filter(([, n]) => n).map(([k, n]) => `${k}${n}`).join(' ');
      console.log(
        `${name}: ${b.phase} 拠点${b.baseHp}/${b.baseMax} ウェーブ${b.wavesStarted}/${b.waves.length} ` +
          `時間${b.time.toFixed(1)}s エレメント${bagTotal(b.gained)}[${got}] ペース${pace(b).toFixed(3)}/s 資材[${mat}] 施設[${st}] 拠点が減った[${losses.join(' ')}]`,
      );
    }
  }
}
