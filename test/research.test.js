import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSave } from '../src/core/save.js';
import { RESEARCH, RESEARCH_ORDER } from '../src/data/research.js';
import { doResearch, whyNot, toggleResearch, researchEffects, levelCap, researchedLevel } from '../src/core/research.js';
import { levelUpCost, levelUpPayment, LEVEL_CAP } from '../src/core/alchemy.js';
import { resolveLayout } from '../src/core/layout.js';
import { parseMap } from '../src/core/map.js';
import { REGIONS } from '../src/data/regions.js';
import { createBattle } from '../src/core/battle.js';

const map = parseMap(REGIONS.grassland.map);

function rich() {
  const s = newSave();
  s.elements = { ...s.elements, none: 9999, wind: 9999, earth: 9999, water: 9999, thunder: 9999 };
  return s;
}

test('研究のデータ：どの研究にもレベルの数だけ値段がある', () => {
  for (const id of RESEARCH_ORDER) {
    const d = RESEARCH[id];
    assert.equal(d.costs.length, d.max, id);
    if (d.needs) assert.ok(RESEARCH[d.needs], id);
  }
});

test('研究する：エレメントを払ってレベルが上がる。上限より上には上がらない', () => {
  const s = rich();
  const before = s.elements.earth;
  doResearch(s, 'baseHp');
  assert.equal(researchedLevel(s, 'baseHp'), 1);
  assert.equal(s.elements.earth, before - RESEARCH.baseHp.costs[0].earth);
  doResearch(s, 'baseHp');
  doResearch(s, 'baseHp');
  assert.equal(whyNot(s, 'baseHp'), '研究しきっています');
  assert.throws(() => doResearch(s, 'baseHp'));
  const poor = newSave();
  assert.equal(whyNot(poor, 'attack'), 'エレメントが足りません');
});

test('限界突破 II は限界突破 I のあと。上限は 15 → 30 → 40', () => {
  const s = rich();
  assert.equal(levelCap(s), LEVEL_CAP);
  assert.match(whyNot(s, 'limit2'), /限界突破 I/);
  doResearch(s, 'limit1');
  assert.equal(levelCap(s), 30);
  doResearch(s, 'limit2');
  assert.equal(levelCap(s), 40);
});

test('ON/OFF：OFF にすると効かない（使ったエレメントは戻らない）。I を OFF にすると II も効かない', () => {
  const s = rich();
  for (const id of ['baseHp', 'attack', 'attack', 'pace', 'carry', 'limit1', 'limit2']) doResearch(s, id);
  const on = researchEffects(s);
  assert.deepEqual(on, { baseHpAdd: 1, atkMul: 1.1, paceMul: 1.1, carrySlots: 1, levelCap: 40 });
  const left = s.elements.wind;
  toggleResearch(s, 'attack', false);
  toggleResearch(s, 'limit1', false);
  const off = researchEffects(s);
  assert.equal(off.atkMul, 1);
  assert.equal(off.levelCap, LEVEL_CAP);
  assert.equal(s.elements.wind, left);
  toggleResearch(s, 'attack', true);
  assert.equal(researchEffects(s).atkMul, 1.1);
});

test('限界突破のレベルアップ：15から先は値段が少しずつ上がり、31からは第2地方のエレメントを使う', () => {
  assert.equal(levelUpCost(15), Math.ceil(3 * 1.2 ** 14), '15→16 は今までの式のまま');
  assert.equal(levelUpCost(16) - levelUpCost(15), 6);
  let total = 0;
  for (let l = 15; l < 30; l++) total += levelUpCost(l);
  assert.ok(total > 1000 && total < 1500, `15から30まで ${total}`);
  assert.equal(levelUpPayment({ none: 9999 }, 'none', 29) !== null, true, '29→30 は第1地方');
  assert.equal(levelUpPayment({ none: 9999 }, 'none', 30), null, '30→31 は第1地方では上げられない');
  assert.ok(levelUpPayment({ water: 9999 }, 'none', 30));
});

test('拠点の耐久と攻撃力の研究が、戦闘に効く', () => {
  const b = createBattle(REGIONS.grassland, map, { baseHpAdd: 2 });
  assert.equal(b.baseHp, REGIONS.grassland.baseHp + 2);
  assert.equal(b.baseMax, REGIONS.grassland.baseHp + 2);
  const layout = { monsters: [{ uid: 'm1', kind: 'slime', x: 12, y: 9, dir: 'up', atkMul: 1.25 }], facilities: [] };
  assert.equal(resolveLayout(map, layout).units[0].atk, 12.5);
});

test('持ち込みの資源地：まわりのモンスターから資材が入る。持ち込める数より多い分は効かない', () => {
  // 何もない草地 (2,2) に土の資源地を持ち込み、となりにプチスライム（無）を置く
  const monsters = [{ uid: 'm1', kind: 'slime', x: 3, y: 2, dir: 'up' }];
  const facilities = [
    { id: 'f1', kind: 'carry', element: 'earth', x: 2, y: 2, dir: 'up' },
    { id: 'f2', kind: 'carry', element: 'wind', x: 4, y: 2, dir: 'up' },
  ];
  const none = resolveLayout(map, { monsters, facilities: [] }).prod.bag;
  const one = resolveLayout(map, { monsters, facilities, carrySlots: 1 });
  assert.equal(one.prod.bag.earth - none.earth, 2, 'となりなら +2');
  assert.equal(one.prod.bag.wind, none.wind, '2つ目は効かない');
  assert.equal(one.status.get('f1'), 'active');
  assert.equal(one.status.get('f2'), 'research-off');
  const two = resolveLayout(map, { monsters, facilities, carrySlots: 2 });
  assert.equal(two.prod.bag.wind - none.wind, 2);
  assert.equal(two.carried.length, 2);
});
