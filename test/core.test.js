import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS } from '../src/data/regions.js';
import { parseMap, pointOnPath, isBuildable } from '../src/core/map.js';
import { yieldFrom, production, allocate, canAfford } from '../src/core/materials.js';
import { buildUnits } from '../src/core/units.js';
import { createBattle, startBattle, step, pace } from '../src/core/battle.js';
import { emptyBag, bagTotal } from '../src/data/elements.js';
import { simulate, LAYOUTS } from '../tools/sim-region.mjs';

const grass = REGIONS.grassland;

test('草原のマップ：S から B まで道が1本でつながる', () => {
  const map = parseMap(grass.map);
  assert.equal(map.w, 28);
  assert.equal(map.h, 16);
  assert.deepEqual(map.path[0], { x: 0, y: 3 });
  assert.deepEqual(map.path.at(-1), { x: 27, y: 11 });
  const pathCells = grass.map.join('').split('').filter((c) => '#SB'.includes(c)).length;
  assert.equal(map.path.length, pathCells, '道のマスは全部たどれる（行き止まりや分かれ道がない）');
  assert.ok(map.nodes.length >= 6);
});

test('道・資源地・木には置けず、草地の空きマスには置ける', () => {
  const map = parseMap(grass.map);
  const occ = new Set(['2,2']);
  assert.equal(isBuildable(map, 1, 3, occ), false); // 道
  assert.equal(isBuildable(map, 4, 6, occ), false); // 資源地
  assert.equal(isBuildable(map, 1, 9, occ), false); // 木
  assert.equal(isBuildable(map, 2, 2, occ), false); // 置いてある
  assert.equal(isBuildable(map, 3, 2, occ), true);
});

test('道の上の位置は、マスの中心を順につなぐ', () => {
  const path = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
  assert.deepEqual(pointOnPath(path, 0.5), { x: 1, y: 0.5 });
  assert.deepEqual(pointOnPath(path, 1.5), { x: 1.5, y: 1 });
  assert.deepEqual(pointOnPath(path, 9), { x: 1.5, y: 1.5 });
});

test('生産：となりは2、攻撃範囲だけなら1、同じ属性なら1上乗せ', () => {
  const node = { x: 5, y: 5, element: 'none' };
  assert.equal(yieldFrom({ x: 6, y: 6, element: 'wind', range: 1 }, node), 2);
  assert.equal(yieldFrom({ x: 6, y: 6, element: 'none', range: 1 }, node), 3);
  assert.equal(yieldFrom({ x: 8, y: 5, element: 'wind', range: 3 }, node), 1);
  assert.equal(yieldFrom({ x: 8, y: 5, element: 'wind', range: 2.5 }, node), 0);
  const { bag } = production([node, { x: 9, y: 9, element: 'earth' }], [{ x: 6, y: 5, element: 'earth', range: 5 }]);
  assert.equal(bag.none, 2);
  assert.equal(bag.earth, 2); // 距離5、範囲内 1 + 同じ属性 1
});

test('建設：資材が足りないと、足りない属性を使う施設のうち最後に建てたものが止まる', () => {
  const bag = { ...emptyBag(), none: 4, wind: 2 };
  const facs = [
    { id: 'a', cost: { none: 3 } },
    { id: 'b', cost: { wind: 2 } },
    { id: 'c', cost: { none: 1 } },
  ];
  let r = allocate(bag, facs);
  assert.equal(r.stopped.size, 0);
  assert.equal(r.remaining.none, 0);
  // モンスターを動かして無の資材が 4 → 3 に減った
  r = allocate({ ...bag, none: 3 }, facs);
  assert.deepEqual([...r.stopped], ['c']);
  assert.ok(r.active.has('b'), '風だけを使う施設は止まらない');
  // 無が 2 まで減ると、c を止めても足りないので a も止まる。そのあと c は無1で動ける
  r = allocate({ ...bag, none: 2 }, facs);
  assert.deepEqual([...r.stopped].sort(), ['a']);
  assert.ok(r.active.has('c'), 'いったん止めた施設も、足りるようになれば建てた順に動き直す');
});

test('canAfford は残りの資材で判定する', () => {
  assert.equal(canAfford({ none: 3 }, { none: 3 }), true);
  assert.equal(canAfford({ none: 2 }, { none: 3 }), false);
});

test('剣の台座と追い風の旗は、近くのモンスターだけを強くする', () => {
  const ms = [
    { uid: 'm1', kind: 'slime', x: 5, y: 5 },
    { uid: 'm2', kind: 'slime', x: 9, y: 5 },
  ];
  const fs = [
    { id: 'f1', kind: 'sword', x: 6, y: 6 },
    { id: 'f2', kind: 'flag', x: 7, y: 5 },
    { id: 'f3', kind: 'beam', x: 0, y: 0 },
  ];
  const { units, overlap } = buildUnits(ms, fs);
  const [a, b, beam] = units;
  assert.equal(a.atk, 13);
  assert.equal(b.atk, 10);
  assert.ok(Math.abs(a.interval - 1 / 1.3) < 1e-9);
  assert.ok(Math.abs(b.interval - 1 / 1.3) < 1e-9);
  assert.equal(beam.source, 'facility');
  assert.equal(overlap, false);
  assert.equal(buildUnits(ms, [{ id: 'h', kind: 'horn', x: 0, y: 0 }]).overlap, true);
});

test('誰も置かないと、拠点の耐久3は最初のウェーブで尽きる', () => {
  const map = parseMap(grass.map);
  const b = createBattle(grass, map);
  startBattle(b);
  while (b.phase === 'running') step(b, 1 / 30, { units: [], overlap: false });
  assert.equal(b.phase, 'lost');
  assert.equal(b.wavesStarted, 1);
  assert.equal(bagTotal(b.gained), 0);
});

test('タイマーは step を呼んだ分だけ進む（一時停止中は止まる）', () => {
  const map = parseMap(grass.map);
  const b = createBattle(grass, map);
  startBattle(b);
  for (let i = 0; i < 30; i++) step(b, 0.1, { units: [], overlap: false });
  assert.ok(Math.abs(b.time - 3) < 1e-9);
});

test('見本の配置：モンスターだけでは負け、施設を建てると攻略できる', () => {
  assert.equal(simulate('grassland', LAYOUTS['モンスターだけ']).b.phase, 'lost');
  const { b } = simulate('grassland', LAYOUTS['光線塔＋剣＋旗']);
  assert.equal(b.phase, 'won');
  assert.ok(pace(b) > 0);
});
