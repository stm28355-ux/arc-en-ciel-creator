// 地域を画面なしで最後まで流して、結果を表示する（調整の確認用）。
//   node tools/sim-region.mjs            全部の地域の見本
//   node tools/sim-region.mjs forest     森の見本だけ
import { pathToFileURL } from 'node:url';
import { REGIONS } from '../src/data/regions.js';
import { parseMap } from '../src/core/map.js';
import { resolveLayout } from '../src/core/layout.js';
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
