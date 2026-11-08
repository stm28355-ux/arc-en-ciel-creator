// 地域を画面なしで最後まで流して、結果を表示する（調整の確認用）。
//   node tools/sim-region.mjs
import { pathToFileURL } from 'node:url';
import { REGIONS } from '../src/data/regions.js';
import { parseMap } from '../src/core/map.js';
import { resolveLayout } from '../src/core/layout.js';
import { createBattle, startBattle, step, pace } from '../src/core/battle.js';
import { bagTotal } from '../src/data/elements.js';

const M = (uid, kind, x, y, dir) => ({ uid, kind, x, y, dir });
const F = (id, kind, x, y, dir) => ({ id, kind, x, y, dir });

const BASE_MONSTERS = [
  M('m1', 'slime', 5, 6, 'right'), // 無の資源地のとなり、道を3マス
  M('m2', 'sprite', 12, 9, 'right'), // 無の資源地のとなり、道を5マス
  M('m3', 'bat', 22, 9, 'up'), // 風の資源地のとなり、道を3マス
  M('m4', 'hawk', 21, 12, 'up'), // 道にそって6マス
  M('m5', 'turtle', 15, 9, 'left'), // 土の資源地のとなり、道を3マス
];

export const LAYOUTS = {
  'モンスターだけ': { monsters: BASE_MONSTERS, facilities: [] },
  '光線塔＋旗': {
    monsters: BASE_MONSTERS,
    facilities: [F('f1', 'beam', 22, 4, 'left'), F('f2', 'flag', 15, 7, 'down')],
  },
  '鍛冶場＋剣（コウモリが作業）': {
    monsters: [
      M('m1', 'slime', 20, 11, 'right'),
      M('m2', 'sprite', 12, 9, 'right'),
      M('m3', 'bat', 16, 13, 'up'), // 鍛冶場の作業場所
      M('m4', 'hawk', 21, 12, 'up'),
      M('m5', 'turtle', 15, 9, 'left'),
    ],
    facilities: [
      F('f1', 'smithy', 16, 14, 'up'), // 作業場所は (16,13) と (17,13)
      F('f2', 'sword', 20, 12, 'up'), // スライムとタカのとなり
    ],
  },
  '角笛1個': {
    monsters: BASE_MONSTERS,
    facilities: [F('f1', 'beam', 22, 4, 'left'), F('f2', 'horn', 0, 0, 'up')],
  },
};

export function simulate(regionId, layout, { maxTime = 900, stopAfterWave } = {}) {
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
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    const { b, r, losses } = simulate('grassland', layout);
    const mat = Object.entries(r.prod.bag).filter(([, n]) => n).map(([k, n]) => `${k}${n}`).join(' ');
    const st = [...r.status.entries()].map(([id, s]) => `${id}:${s}`).join(' ');
    console.log(
      `${name}: ${b.phase} 拠点${b.baseHp}/${b.baseMax} ウェーブ${b.wavesStarted}/${b.waves.length} ` +
        `時間${b.time.toFixed(1)}s エレメント${bagTotal(b.gained)} ペース${pace(b).toFixed(3)}/s 資材[${mat}] 施設[${st}] 拠点が減った[${losses.join(' ')}]`,
    );
  }
}
