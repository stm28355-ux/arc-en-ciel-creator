// 地域を画面なしで最後まで流して、結果を表示する（調整の確認用）。
//   node tools/sim-region.mjs
import { REGIONS } from '../src/data/regions.js';
import { MONSTERS } from '../src/data/monsters.js';
import { FACILITIES } from '../src/data/facilities.js';
import { parseMap } from '../src/core/map.js';
import { production, allocate } from '../src/core/materials.js';
import { buildUnits } from '../src/core/units.js';
import { createBattle, startBattle, step, pace } from '../src/core/battle.js';
import { bagTotal } from '../src/data/elements.js';

export const LAYOUTS = {
  'モンスターだけ': {
    monsters: [
      { uid: 'm1', kind: 'slime', x: 6, y: 6 },
      { uid: 'm2', kind: 'sprite', x: 12, y: 9 },
      { uid: 'm3', kind: 'bat', x: 13, y: 5 },
      { uid: 'm4', kind: 'hawk', x: 23, y: 7 },
      { uid: 'm5', kind: 'turtle', x: 15, y: 9 },
    ],
    facilities: [],
  },
  '光線塔＋剣＋旗': {
    monsters: [
      { uid: 'm1', kind: 'slime', x: 6, y: 6 },
      { uid: 'm2', kind: 'sprite', x: 12, y: 9 },
      { uid: 'm3', kind: 'bat', x: 13, y: 5 },
      { uid: 'm4', kind: 'hawk', x: 23, y: 7 },
      { uid: 'm5', kind: 'turtle', x: 15, y: 9 },
    ],
    facilities: [
      { id: 'f1', kind: 'beam', x: 8, y: 11 },
      { id: 'f2', kind: 'sword', x: 15, y: 10 },
      { id: 'f3', kind: 'flag', x: 13, y: 7 },
    ],
  },
  '角笛でペース重視': {
    monsters: [
      { uid: 'm1', kind: 'slime', x: 6, y: 6 },
      { uid: 'm2', kind: 'sprite', x: 12, y: 9 },
      { uid: 'm3', kind: 'bat', x: 13, y: 5 },
      { uid: 'm4', kind: 'hawk', x: 23, y: 7 },
      { uid: 'm5', kind: 'turtle', x: 15, y: 9 },
    ],
    facilities: [
      { id: 'f1', kind: 'beam', x: 8, y: 11 },
      { id: 'f2', kind: 'horn', x: 0, y: 0 },
      { id: 'f3', kind: 'flag', x: 13, y: 7 },
    ],
  },
};

export function simulate(regionId, layout, maxTime = 600) {
  const region = REGIONS[regionId];
  const map = parseMap(region.map);
  const ms = layout.monsters.map((m) => ({ ...m, element: MONSTERS[m.kind].element, range: MONSTERS[m.kind].range }));
  const { bag } = production(map.nodes, ms);
  const facs = layout.facilities.map((f) => ({ ...f, cost: FACILITIES[f.kind].cost }));
  const alloc = allocate(bag, facs);
  const ctx = buildUnits(layout.monsters, layout.facilities.filter((f) => alloc.active.has(f.id)));
  const b = createBattle(region, map);
  startBattle(b);
  const dt = 1 / 30;
  while (b.phase === 'running' && b.time < maxTime) step(b, dt, ctx);
  return { b, bag, alloc };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('sim-region.mjs')) {
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    const { b, bag, alloc } = simulate('grassland', layout);
    const mat = Object.entries(bag).filter(([, n]) => n).map(([k, n]) => `${k}${n}`).join(' ');
    console.log(
      `${name}: ${b.phase} 拠点${b.baseHp}/${b.baseMax} ウェーブ${b.wavesStarted}/${b.waves.length} ` +
        `時間${b.time.toFixed(1)}s エレメント${bagTotal(b.gained)} ペース${pace(b).toFixed(3)}/s 資材[${mat}] 止まった施設${alloc.stopped.size}`,
    );
  }
}
