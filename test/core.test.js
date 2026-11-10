import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS } from '../src/data/regions.js';
import { parseMap, pointOnPath } from '../src/core/map.js';
import { yieldFrom, allocate, canAfford } from '../src/core/materials.js';
import { parseShape, rotate, cellsOf, nextDir } from '../src/core/shape.js';
import { resolveLayout, canPlace } from '../src/core/layout.js';
import { createBattle, startBattle, step, pace, rechargeUnit } from '../src/core/battle.js';
import { emptyBag, bagTotal } from '../src/data/elements.js';
import { ENEMIES } from '../src/data/enemies.js';
import { simulate, SAMPLES } from '../tools/sim-region.mjs';
import { regionOpen, opensAfter } from '../src/core/progress.js';
import { newSave } from '../src/core/save.js';

const grass = REGIONS.grassland;
const map = parseMap(grass.map);
const sand = parseMap(REGIONS.desert.map);
const M = (uid, kind, x, y, dir = 'up') => ({ uid, kind, x, y, dir });
const F = (id, kind, x, y, dir = 'up') => ({ id, kind, x, y, dir });
const keys = (cells) => cells.map((c) => `${c.x},${c.y}`).sort();

test('草原のマップ：S から B まで道が1本でつながる', () => {
  assert.equal(map.w, 28);
  assert.equal(map.h, 16);
  assert.deepEqual(map.path[0], { x: 0, y: 3 });
  assert.deepEqual(map.path.at(-1), { x: 27, y: 11 });
  const pathCells = grass.map.join('').split('').filter((c) => '#SB'.includes(c)).length;
  assert.equal(map.path.length, pathCells, '道のマスは全部たどれる（行き止まりや分かれ道がない）');
  assert.ok(map.nodes.length >= 6);
});

test('どの地域も：S から B まで道がつながり、道のマスは全部どれかの道で通る。28×16、ウェーブ5つで最後にボス', () => {
  for (const [id, r] of Object.entries(REGIONS)) {
    const m = parseMap(r.map);
    assert.equal(m.w, 28, id);
    assert.equal(m.h, 16, id);
    const pathCells = r.map.join('').split('').filter((c) => '#SB'.includes(c)).length;
    const used = new Set(m.routes.flatMap((r) => r.map((c) => `${c.x},${c.y}`)));
    assert.equal(used.size, pathCells, `${id}：使われない道のマスがない`);
    for (const route of m.routes) assert.ok(m.bases.some((b) => b.x === route.at(-1).x && b.y === route.at(-1).y), `${id}：道は拠点で終わる`);
    assert.equal(r.waves.length, 5, id);
    assert.ok(r.waves.at(-1).some((g) => ENEMIES[g.enemy].boss), `${id} の最後のウェーブにボス`);
  }
});

test('地域で手に入るエレメント：敵の落とす量と資源地の数が、地域の属性の順になる（草原は無＞風で土なし、森は風が一番、砂漠は土が一番）', () => {
  for (const [id, r] of Object.entries(REGIONS)) {
    const drops = {};
    for (const w of r.waves) for (const g of w) drops[ENEMIES[g.enemy].element] = (drops[ENEMIES[g.enemy].element] ?? 0) + g.count * ENEMIES[g.enemy].drop;
    const nodes = {};
    for (const n of parseMap(r.map).nodes) nodes[n.element] = (nodes[n.element] ?? 0) + 1;
    assert.deepEqual(Object.keys(drops).sort(), [...r.elements].sort(), `${id} の敵の属性`);
    assert.deepEqual(Object.keys(nodes).sort(), [...r.elements].sort(), `${id} の資源地の属性`);
    const [top, ...rest] = r.elements;
    for (const e of rest) {
      assert.ok(drops[top] >= drops[e], `${id}：${top} が ${e} 以上落ちる`);
      assert.ok(nodes[top] >= nodes[e], `${id}：${top} の資源地が ${e} 以上`);
    }
  }
  assert.ok(!REGIONS.grassland.elements.includes('earth'), '草原には土がない');
  for (const id of Object.keys(REGIONS)) {
    const r = REGIONS[id];
    const drops = {};
    for (const w of r.waves) for (const g of w) drops[ENEMIES[g.enemy].element] = (drops[ENEMIES[g.enemy].element] ?? 0) + g.count * ENEMIES[g.enemy].drop;
    if (r.elements.length < 2) continue; // 魔王城は闇だけ
    if (id === 'boundary') {
      assert.equal(drops.light, drops.dark, '境界は光と闇が同じ');
      continue;
    }
    assert.ok(drops[r.elements[0]] > drops[r.elements.at(-1)], `${id}：一番の属性は最後の属性より多い`);
  }
});

test('地域は順に開く：草原 → 森 → 砂漠', () => {
  const s = newSave();
  assert.equal(regionOpen(s, 'grassland'), true);
  assert.equal(regionOpen(s, 'forest'), false);
  s.regions.grassland = { cleared: true };
  assert.equal(regionOpen(s, 'forest'), true);
  assert.equal(regionOpen(s, 'desert'), false);
  assert.deepEqual(opensAfter('grassland'), ['forest']);
  assert.deepEqual(opensAfter('forest'), ['desert']);
});

test('道の上の位置は、マスの中心を順につなぐ', () => {
  const path = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
  assert.deepEqual(pointOnPath(path, 0.5), { x: 1, y: 0.5 });
  assert.deepEqual(pointOnPath(path, 1.5), { x: 1.5, y: 1 });
  assert.deepEqual(pointOnPath(path, 9), { x: 1.5, y: 1.5 });
});

test('形：上向きの絵を読み、右回りに回る', () => {
  const s = parseShape(['xxx', '.o.']);
  assert.deepEqual(s.footprint, [[0, 0]]);
  assert.equal(s.targets.length, 3);
  assert.deepEqual(rotate([0, -1], 'right'), [1, 0]);
  assert.deepEqual(rotate([0, -1], 'down'), [0, 1]);
  assert.deepEqual(rotate([0, -1], 'left'), [-1, 0]);
  assert.deepEqual(keys(cellsOf(['x', 'o'], 5, 5, 'left', 'targets')), ['4,5']);
  assert.equal(nextDir('left'), 'up');
  // 横長の施設：基準のマスから右へ伸び、回すと下へ伸びる
  assert.deepEqual(keys(cellsOf(['ww', 'oo'], 3, 3, 'up', 'footprint')), ['3,3', '4,3']);
  assert.deepEqual(keys(cellsOf(['ww', 'oo'], 3, 3, 'right', 'footprint')), ['3,3', '3,4']);
  assert.deepEqual(keys(cellsOf(['ww', 'oo'], 3, 3, 'right', 'work')), ['4,3', '4,4']);
});

test('置けるマス：施設は全部のマスが空いている草地のときだけ', () => {
  const layout = { monsters: [M('m1', 'slime', 2, 2)], facilities: [] };
  assert.equal(canPlace(map, layout, M('m2', 'bat', 1, 3)), false, '道');
  assert.equal(canPlace(map, layout, M('m2', 'bat', 4, 6)), false, '資源地');
  assert.equal(canPlace(map, layout, M('m2', 'bat', 1, 9)), false, '木');
  assert.equal(canPlace(map, layout, M('m2', 'bat', 2, 2)), false, '置いてある');
  assert.equal(canPlace(map, layout, M('m2', 'bat', 3, 2)), true);
  assert.equal(canPlace(map, layout, F('f1', 'smithy', 1, 2)), false, '横のマスにモンスター');
  assert.equal(canPlace(map, layout, F('f1', 'smithy', 2, 1)), true);
  assert.equal(canPlace(map, layout, layout.monsters[0], layout.monsters[0]), true, '自分自身は邪魔にならない');
});

test('生産：まわり8マスは2、攻撃範囲のマスに入るだけなら1、同じ属性なら1上乗せ', () => {
  const node = { x: 5, y: 5, element: 'none' };
  const t = (...cells) => new Set(cells);
  assert.equal(yieldFrom({ x: 6, y: 6, element: 'wind', targets: t() }, node), 2);
  assert.equal(yieldFrom({ x: 6, y: 6, element: 'none', targets: t() }, node), 3);
  assert.equal(yieldFrom({ x: 8, y: 5, element: 'wind', targets: t('5,5') }, node), 1);
  assert.equal(yieldFrom({ x: 8, y: 5, element: 'wind', targets: t('6,5') }, node), 0);
});

test('向きで攻撃範囲が変わり、資源地に当たるかも変わる', () => {
  // のはらの精を無の資源地 (11,8) のとなりに置く。右向きなら道（14列）に5マス届く
  const right = resolveLayout(map, { monsters: [M('m2', 'sprite', 12, 9, 'right')], facilities: [] });
  const pathHits = [...right.units[0].targets].filter((k) => {
    const [x, y] = k.split(',').map(Number);
    return map.cells[y][x] === 'path';
  });
  assert.equal(pathHits.length, 5);
  assert.equal(right.prod.bag.none, 3);
  const left = resolveLayout(map, { monsters: [M('m2', 'sprite', 12, 9, 'left')], facilities: [] });
  assert.ok(![...left.units[0].targets].some((k) => k.startsWith('14,')));
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
  r = allocate({ ...bag, none: 3 }, facs);
  assert.deepEqual([...r.stopped], ['c']);
  assert.ok(r.active.has('b'), '風だけを使う施設は止まらない');
  // 無が 2 まで減ると、c を止めても足りないので a も止まる。そのあと c は無1で動ける
  r = allocate({ ...bag, none: 2 }, facs);
  assert.deepEqual([...r.stopped], ['a']);
  assert.ok(r.active.has('c'));
  assert.equal(canAfford({ none: 3 }, { none: 3 }), true);
  assert.equal(canAfford({ none: 2 }, { none: 3 }), false);
});

test('鍛冶場：作業場所にいて攻撃範囲が鍛冶場に重なるモンスターがいる間だけ動き、剣の台座が効く（砂漠の見本）', () => {
  const sample = SAMPLES.desert['森の仲間 Lv8＋鍛冶場・剣'];
  const r = resolveLayout(sand, sample);
  assert.ok(r.working.has('m7'));
  assert.ok(r.units.some((u) => u.owner === 'm7'), '作業中も攻撃する');
  assert.equal(r.status.get('f1'), 'active');
  assert.equal(r.status.get('f2'), 'active');
  const buffed = r.units.filter((u) => u.buffed.sword).map((u) => u.owner).sort();
  assert.deepEqual(buffed, ['m4']);
  assert.ok(Math.abs(r.units.find((u) => u.owner === 'm4').atk - 16 * 1.56 * 1.5) < 1e-9, 'Lv8 のすなあらしトカゲ ×1.5');

  // 作業しているモンスターを作業場所から外すと、鍛冶場は止まり、剣も止まって資材を使わない
  const off = { ...sample, monsters: sample.monsters.map((m) => (m.uid === 'm7' ? { ...m, x: 25, y: 15 } : m)) };
  const r2 = resolveLayout(sand, off);
  assert.equal(r2.status.get('f1'), 'no-worker');
  assert.equal(r2.status.get('f2'), 'needs-smithy');
  assert.equal(r2.alloc.used.none, 0);
  assert.ok(!r2.units.some((u) => u.buffed.sword));
});

test('鍛冶場：作業場所にいても、攻撃範囲が鍛冶場を向いていなければ動かない。作業中も生産する（砂漠）', () => {
  const smithy = F('f1', 'smithy', 4, 5, 'up'); // 作業場所は (4,4) と (5,4)
  // いわガメは土の資源地 (13,4) のとなりで、鍛冶場の土を出す
  const facing = (dir) => resolveLayout(sand, { monsters: [M('m1', 'slime', 5, 4, dir), M('m5', 'turtle', 14, 4, 'left')], facilities: [smithy] });
  assert.equal(facing('up').status.get('f1'), 'no-worker', '上向きのスライムは鍛冶場（下）に届かない');
  const down = facing('down');
  assert.equal(down.status.get('f1'), 'active');
  assert.ok(down.working.has('m1'));
  assert.equal(down.prod.perMonster[0].earth, 1, '作業中でも、攻撃範囲に入れた土の資源地 (5,6) から資材が入る');
});

test('草原には土がないので、鍛冶場は土の資源地を持ち込まないと建たない', () => {
  const monsters = [M('m1', 'slime', 5, 6, 'right')];
  const smithy = F('f1', 'smithy', 2, 2, 'up');
  assert.equal(resolveLayout(map, { monsters, facilities: [smithy] }).status.get('f1'), 'materials');
  const carry = { ...F('c1', 'carry', 6, 5), element: 'earth' };
  const r = resolveLayout(map, { monsters, facilities: [carry, smithy] });
  assert.equal(r.prod.bag.earth, 2, '持ち込んだ土の資源地のとなり');
  assert.equal(r.status.get('f1'), 'no-worker');
});

test('追い風の旗は向いている方の6マスにいるモンスターだけを速くする', () => {
  const r = resolveLayout(map, {
    monsters: [M('m1', 'slime', 5, 6, 'right'), M('m2', 'slime', 5, 9, 'right')],
    facilities: [F('f1', 'flag', 5, 7, 'down')],
  });
  // 旗を作るための風の資材がないので止まる
  assert.equal(r.status.get('f1'), 'materials');
  const r2 = resolveLayout(map, {
    monsters: [M('m1', 'slime', 5, 6, 'right'), M('m2', 'slime', 5, 9, 'right'), M('m3', 'bat', 22, 9)],
    facilities: [F('f1', 'flag', 5, 7, 'down')],
  });
  assert.equal(r2.status.get('f1'), 'active');
  const [a, b] = r2.units;
  assert.ok(Math.abs(a.interval - 1) < 1e-9, '旗の後ろは速くならない');
  assert.ok(Math.abs(b.interval - 1 / 1.3) < 1e-9);
});

test('角笛の数でウェーブをまとめて出す数が決まる（1個で2つ、2個で3つ）', () => {
  const base = SAMPLES.grassland['光線塔＋旗'].monsters;
  // 草原には土がないので、角笛（風2・土2）は土の資源地を持ち込んで建てる
  const r1 = resolveLayout(map, { monsters: base, facilities: [{ ...F('c1', 'carry', 6, 5), element: 'earth' }, F('h1', 'horn', 0, 0)] });
  assert.equal(r1.groupSize, 2);
  const b = createBattle(grass, map);
  startBattle(b, { groupSize: 3 });
  assert.equal(b.wavesStarted, 3);
});

test('誰も置かないと、拠点の耐久3は最初のウェーブで尽きる', () => {
  const b = createBattle(grass, map);
  startBattle(b);
  while (b.phase === 'running') step(b, 1 / 30, { units: [], groupSize: 1 });
  assert.equal(b.phase, 'lost');
  assert.equal(b.wavesStarted, 1);
  assert.equal(bagTotal(b.gained), 0);
});

test('ボスを通すと、残りの耐久に関係なく負け', () => {
  const b = createBattle(grass, map);
  b.baseMax = b.baseHp = 99;
  b.phase = 'running';
  b.wavesStarted = b.waves.length;
  b.enemies.push({ id: 1, kind: 'king', hp: 1, maxHp: 1, dist: b.pathLen - 0.01, wave: 4 });
  step(b, 0.1, { units: [], groupSize: 1 });
  assert.equal(b.phase, 'lost');
  assert.equal(b.baseHp, 0);
});

test('タイマーは step を呼んだ分だけ進む（一時停止中は止まる）', () => {
  const b = createBattle(grass, map);
  startBattle(b);
  for (let i = 0; i < 30; i++) step(b, 0.1, { units: [], groupSize: 1 });
  assert.ok(Math.abs(b.time - 3) < 1e-9);
});

test('動かしたユニットは、攻撃の間隔が溜まるまで攻撃しない', () => {
  const b = createBattle(grass, map);
  startBattle(b);
  const unit = { id: 'm1', interval: 2 };
  rechargeUnit(b, unit);
  assert.equal(b.cooldowns.m1, 2);
});

test('見本の配置：草原はモンスターだけでは負け、施設を建てると攻略できる', () => {
  assert.equal(simulate('grassland', SAMPLES.grassland['モンスターだけ']).b.phase, 'lost');
  const { b } = simulate('grassland', SAMPLES.grassland['光線塔＋旗']);
  assert.equal(b.phase, 'won');
  assert.ok(pace(b) > 0);
});

test('見本の配置：森と砂漠は、前の地域のころの強さでは負け、育てると攻略できる。獲得ペースは 草原 < 森 < 砂漠', () => {
  const expect = {
    forest: { lost: '草原の仲間 Lv5＋光線塔・旗', won: '草原の仲間 Lv10＋光線塔・旗' },
    desert: { lost: '森の仲間 Lv8＋鍛冶場・剣', won: '森の仲間 Lv13＋鍛冶場・剣' },
  };
  const paces = [pace(simulate('grassland', SAMPLES.grassland['光線塔＋旗']).b)];
  for (const [id, e] of Object.entries(expect)) {
    assert.equal(simulate(id, SAMPLES[id][e.lost]).b.phase, 'lost', `${id} ${e.lost}`);
    const { b } = simulate(id, SAMPLES[id][e.won]);
    assert.equal(b.phase, 'won', `${id} ${e.won}`);
    paces.push(pace(b));
  }
  assert.ok(paces[0] < paces[1] && paces[1] < paces[2], paces.map((p) => p.toFixed(2)).join(' < '));
});

test('足止め：霧の噴水の範囲のマスにいる敵は遅くなる（重ねても強くならない）', () => {
  const b = createBattle(grass, map);
  startBattle(b);
  step(b, 0.01, { units: [], groupSize: 1 });
  const e = b.enemies[0];
  const before = e.dist;
  const first = `${map.path[0].x},${map.path[0].y}`;
  step(b, 0.5, { units: [], groupSize: 1, slow: new Map([[first, 0.4]]) });
  assert.ok(Math.abs(e.dist - before - 0.5 * 0.6) < 1e-9, '40% 遅い');
  // 霧の噴水を2つ重ねても 40% のまま
  const fog = (id, x) => ({ id, kind: 'fog', x, y: 4, dir: 'down' });
  const r = resolveLayout(map, { monsters: [M('m1', 'slime', 5, 6, 'right')], facilities: [fog('f1', 3), fog('f2', 4)] });
  assert.equal(r.status.get('f1'), 'materials', '草原には水の資材がない');
  const r2 = resolveLayout(map, {
    monsters: [M('m1', 'slime', 5, 6, 'right')],
    facilities: [{ ...F('c1', 'carry', 6, 5), element: 'water' }, fog('f1', 3), fog('f2', 4)],
  });
  assert.equal(r2.status.get('f1'), 'active');
  assert.ok([...r2.slow.values()].every((v) => v === 0.4));
});

test('まわりにも当たる：雷の塔は範囲のマスにいる敵すべてに当たる', () => {
  const b = createBattle(grass, map);
  b.phase = 'running';
  b.wavesStarted = 1;
  b.enemies.push({ id: 1, kind: 'sheep', hp: 75, maxHp: 75, dist: 0.2, wave: 0 }, { id: 2, kind: 'sheep', hp: 75, maxHp: 75, dist: 1.2, wave: 0 });
  const targets = new Set(['0,3', '1,3']);
  step(b, 0.01, { units: [{ id: 't', x: 0, y: 2, atk: 10, interval: 1, targets, splash: true, buffed: {} }], groupSize: 1 });
  assert.deepEqual(b.enemies.map((e) => e.hp), [65, 65]);
  step(b, 1.0, { units: [{ id: 'n', x: 0, y: 2, atk: 10, interval: 1, targets, buffed: {} }], groupSize: 1 });
  assert.deepEqual(b.enemies.map((e) => e.hp).sort(), [55, 65], 'ふつうのユニットは1体だけ');
});

test('第2地方：砂漠を攻略すると川が開き、川 → 雷雨 → 海 の順に開く', () => {
  const s = newSave();
  assert.equal(regionOpen(s, 'river'), false);
  s.regions.desert = { cleared: true };
  assert.equal(regionOpen(s, 'river'), true);
  assert.deepEqual(opensAfter('desert'), ['river']);
  assert.deepEqual(opensAfter('river'), ['storm']);
  assert.deepEqual(opensAfter('storm'), ['sea']);
});

test('見本の配置：第2地方は、川 Lv20・雷雨 Lv25・海 Lv30 では負け、5レベル上げると攻略できる。獲得ペースは 川 < 雷雨 < 海', () => {
  const paces = [];
  for (const [id, lost, won] of [['river', 20, 25], ['storm', 25, 30], ['sea', 30, 35]]) {
    assert.equal(simulate(id, SAMPLES[id][`第2地方の仲間 Lv${lost}`]).b.phase, 'lost', `${id} Lv${lost}`);
    const { b } = simulate(id, SAMPLES[id][`第2地方の仲間 Lv${won}`]);
    assert.equal(b.phase, 'won', `${id} Lv${won}`);
    paces.push(pace(b));
  }
  assert.ok(paces[0] < paces[1] && paces[1] < paces[2], paces.map((p) => p.toFixed(2)).join(' < '));
});

test('道の形：火山は二股から合流、雪山は2か所から出て合流、混成は拠点が2か所。敵は道を交互に使う', () => {
  const volcano = parseMap(REGIONS.volcano.map);
  assert.equal(volcano.starts.length, 1);
  assert.equal(volcano.routes.length, 2);
  assert.equal(volcano.bases.length, 1);
  const snow = parseMap(REGIONS.snow.map);
  assert.equal(snow.starts.length, 2);
  assert.equal(snow.routes.length, 2);
  const mixed = parseMap(REGIONS.mixed.map);
  assert.equal(mixed.bases.length, 2);
  assert.equal(mixed.routes.length, 2);
  // 敵は道を交互に使う。拠点が2か所でも、拠点の耐久は1つ
  const b = createBattle(REGIONS.mixed, mixed);
  startBattle(b);
  for (let i = 0; i < 40; i++) step(b, 0.1, { units: [], groupSize: 1 });
  assert.deepEqual([...new Set(b.enemies.map((e) => e.route))].sort(), [0, 1]);
  while (b.phase === 'running') step(b, 0.1, { units: [], groupSize: 1 });
  assert.equal(b.phase, 'lost');
  assert.equal(b.baseHp, 0);
});

test('やけどと凍える：かがり火は範囲の敵すべてをやけどにし、つららの塔は当たった敵を遅くする', () => {
  const b = createBattle(grass, map);
  b.phase = 'running';
  b.wavesStarted = 1;
  b.enemies.push({ id: 1, kind: 'sheep', hp: 75, maxHp: 75, dist: 0.2, wave: 0, route: 0 }, { id: 2, kind: 'sheep', hp: 75, maxHp: 75, dist: 1.2, wave: 0, route: 0 });
  const targets = new Set(['0,3', '1,3']);
  const brazier = { id: 'f', x: 0, y: 2, atk: 4, interval: 1, targets, splash: true, burn: { dps: 10, dur: 3 }, buffed: {} };
  step(b, 0.01, { units: [brazier], groupSize: 1 });
  assert.deepEqual(b.enemies.map((e) => e.hp), [71, 71], '当たったときの4');
  for (let i = 0; i < 10; i++) step(b, 0.1, { units: [], groupSize: 1 });
  assert.ok(b.enemies.every((e) => Math.abs(e.hp - 61) < 1e-6), '1秒やけど（10）');
  const c = createBattle(grass, map);
  c.phase = 'running';
  c.wavesStarted = 1;
  c.enemies.push({ id: 1, kind: 'sheep', hp: 999, maxHp: 999, dist: 0.2, wave: 0, route: 0 });
  step(c, 0.01, { units: [{ id: 'i', x: 0, y: 2, atk: 1, interval: 9, targets, chill: { slow: 0.5, dur: 2 }, buffed: {} }], groupSize: 1 });
  const before = c.enemies[0].dist;
  step(c, 1, { units: [], groupSize: 1 });
  assert.ok(Math.abs(c.enemies[0].dist - before - 0.75 * 0.5) < 1e-9, '凍えている間は半分の速さ');
});

test('第3地方：海を攻略すると火山が開き、火山 → 雪山 → 混成 の順に開く', () => {
  const s = newSave();
  assert.equal(regionOpen(s, 'volcano'), false);
  s.regions.sea = { cleared: true };
  assert.equal(regionOpen(s, 'volcano'), true);
  assert.deepEqual(opensAfter('volcano'), ['snow']);
  assert.deepEqual(opensAfter('snow'), ['mixed']);
});

test('見本の配置：第3地方は、火山 Lv35・雪山 Lv40・混成 Lv45 では負け、5レベル上げると攻略できる。獲得ペースは 火山 < 雪山 < 混成', () => {
  const paces = [];
  for (const [id, lost, won] of [['volcano', 35, 40], ['snow', 40, 45], ['mixed', 45, 50]]) {
    assert.equal(simulate(id, SAMPLES[id][`第3地方の仲間 Lv${lost}`]).b.phase, 'lost', `${id} Lv${lost}`);
    const { b } = simulate(id, SAMPLES[id][`第3地方の仲間 Lv${won}`]);
    assert.equal(b.phase, 'won', `${id} Lv${won}`);
    paces.push(pace(b));
  }
  assert.ok(paces[0] < paces[1] && paces[1] < paces[2], paces.map((p) => p.toFixed(2)).join(' < '));
});

test('第4地方：混成を攻略すると聖域が開き、聖域 → 境界 → 魔王城。魔王城で表のクリア。資源地は少ない', () => {
  const s = newSave();
  s.regions.mixed = { cleared: true };
  assert.equal(regionOpen(s, 'sanctuary'), true);
  assert.deepEqual(opensAfter('sanctuary'), ['boundary']);
  assert.deepEqual(opensAfter('boundary'), ['castle']);
  assert.equal(REGIONS.castle.finale, true);
  const count = (id) => parseMap(REGIONS[id].map).nodes.reduce((m, n) => ({ ...m, [n.element]: (m[n.element] ?? 0) + 1 }), {});
  assert.deepEqual(count('sanctuary'), { light: 2, fire: 1 });
  assert.deepEqual(count('boundary'), { light: 1, dark: 1 });
  assert.deepEqual(count('castle'), { dark: 1 });
  // 境界は2列（別々の道と拠点）、魔王城は2か所から出て合流し、また分かれる（4通り）
  const boundary = parseMap(REGIONS.boundary.map);
  assert.equal(boundary.routes.length, 2);
  const [a, b] = boundary.routes.map((r) => new Set(r.map((c) => `${c.x},${c.y}`)));
  assert.ok(![...a].some((k) => b.has(k)), '2列の道は重ならない');
  assert.equal(parseMap(REGIONS.castle.map).routes.length, 4);
});

test('防御くずしと【強】・ボスに強い：光の祭壇の範囲では受けるダメージが増え、闇の塔は【強】・ボスに3倍', () => {
  const b = createBattle(grass, map);
  b.phase = 'running';
  b.wavesStarted = 1;
  b.enemies.push({ id: 1, kind: 'sheep', hp: 999, maxHp: 999, dist: 0.2, wave: 0, route: 0 }, { id: 2, kind: 'ram', hp: 999, maxHp: 999, dist: 0.2, wave: 0, route: 0 });
  const targets = new Set(['0,3']);
  step(b, 0.01, { units: [{ id: 'd', x: 0, y: 2, atk: 10, interval: 9, targets, splash: true, bossMul: 3, buffed: {} }], groupSize: 1, expose: new Map([['0,3', 0.25]]) });
  assert.deepEqual(b.enemies.map((e) => e.hp), [999 - 12.5, 999 - 37.5]);
});

test('見本の配置：第4地方は資源地を5つ持ち込み、聖域 Lv50・境界 Lv55・魔王城 Lv65 では負け、聖域 Lv55・境界 Lv60・魔王城 Lv70 で攻略。獲得ペースは 聖域 < 境界 < 魔王城', () => {
  const paces = [];
  for (const [id, lost, won] of [['sanctuary', 50, 55], ['boundary', 55, 60], ['castle', 65, 70]]) {
    assert.equal(simulate(id, SAMPLES[id][`第4地方の仲間 Lv${lost}`]).b.phase, 'lost', `${id} Lv${lost}`);
    const { b, r } = simulate(id, SAMPLES[id][`第4地方の仲間 Lv${won}`]);
    assert.equal(b.phase, 'won', `${id} Lv${won}`);
    assert.ok([...r.status.values()].every((st) => st === 'active'), `${id}：持ち込みの資源地で施設が全部動く`);
    paces.push(pace(b));
  }
  assert.ok(paces[0] < paces[1] && paces[1] < paces[2], paces.map((p) => p.toFixed(2)).join(' < '));
});
