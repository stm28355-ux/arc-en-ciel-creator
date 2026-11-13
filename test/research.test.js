import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSave } from '../src/core/save.js';
import { RESEARCH, RESEARCH_ORDER } from '../src/data/research.js';
import { doResearch, whyNot, toggleResearch, researchEffects, levelCap, researchedLevel, mixElements } from '../src/core/research.js';
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
  for (const id of ['baseHp', 'attack', 'attack', 'facility', 'pace', 'carry', 'limit1', 'limit2', 'mixWind']) doResearch(s, id);
  const on = researchEffects(s);
  assert.deepEqual(on, { baseHpAdd: 1, atkMul: 1.1, facilityMul: 1.1, facilityAtkMul: 1, paceMul: 1.1, carrySlots: 1, levelCap: 40, mixElements: ['none', 'wind'] });
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

test('調合で使えるエレメント：無は最初から、風・土は研究で開放する', () => {
  const s = rich();
  assert.deepEqual(mixElements(s), ['none']);
  doResearch(s, 'mixEarth');
  assert.deepEqual(mixElements(s), ['none', 'earth']);
  doResearch(s, 'mixWind');
  assert.deepEqual(mixElements(s), ['none', 'wind', 'earth']);
  toggleResearch(s, 'mixWind', false);
  assert.deepEqual(mixElements(s), ['none', 'earth']);
  const poor = newSave();
  assert.equal(whyNot(poor, 'mixWind'), 'エレメントが足りません', '風を手に入れてからでないと研究できない');
});

test('施設の攻撃力と施設の効き目：光線塔の攻撃力は「施設の攻撃力」、剣・旗の効き目は「施設の効き目」で増える', () => {
  const layout = {
    monsters: [{ uid: 'm1', kind: 'slime', x: 5, y: 6, dir: 'right' }, { uid: 'm3', kind: 'bat', x: 22, y: 9, dir: 'up' }],
    facilities: [{ id: 'f1', kind: 'beam', x: 22, y: 4, dir: 'left' }, { id: 'f2', kind: 'flag', x: 5, y: 7, dir: 'up' }],
  };
  const plain = resolveLayout(map, layout);
  const boosted = resolveLayout(map, { ...layout, facilityMul: 1.5, facilityAtkMul: 3 });
  assert.equal(boosted.units.find((u) => u.id === 'f1').atk, plain.units.find((u) => u.id === 'f1').atk * 3);
  assert.equal(resolveLayout(map, { ...layout, facilityMul: 1.5 }).units.find((u) => u.id === 'f1').atk, plain.units.find((u) => u.id === 'f1').atk, '効き目の研究では攻撃力は変わらない');
  const slime = (r) => r.units.find((u) => u.owner === 'm1');
  assert.ok(Math.abs(slime(plain).interval - 1 / 1.3) < 1e-9);
  assert.ok(Math.abs(slime(boosted).interval - 1 / 1.45) < 1e-9, '旗の +30% が +45% に');
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

test('限界突破 III（仮）：II のあと。上限 50、41からは炎・氷で上げる。炎・氷の調合も研究で開く', () => {
  const s = rich();
  s.elements = { ...s.elements, fire: 9999, ice: 9999 };
  assert.match(whyNot(s, 'limit3'), /限界突破 II/);
  for (const id of ['limit1', 'limit2', 'limit3']) doResearch(s, id);
  assert.equal(levelCap(s), 50);
  toggleResearch(s, 'limit2', false);
  assert.equal(levelCap(s), 30, 'II を OFF にすると III も効かない');
  assert.equal(levelUpPayment({ water: 9999 }, 'none', 40), null);
  assert.ok(levelUpPayment({ fire: 9999 }, 'none', 40));
  assert.ok(!mixElements(s).includes('fire'));
  doResearch(s, 'mixFire');
  doResearch(s, 'mixIce');
  assert.ok(mixElements(s).includes('fire') && mixElements(s).includes('ice'));
});

test('限界突破は 30・40・50・60・99。61からはどのエレメントでも上げられる。資源地の持ち込みは5つまで', () => {
  const s = rich();
  s.elements = Object.fromEntries(Object.keys(s.elements).map((k) => [k, 99999]));
  for (const [id, cap] of [['limit1', 30], ['limit2', 40], ['limit3', 50], ['limit4', 60], ['limit5', 99]]) {
    doResearch(s, id);
    assert.equal(levelCap(s), cap, id);
  }
  assert.ok(levelUpPayment({ light: 9999 }, 'none', 55), '51〜60は光・闇');
  assert.equal(levelUpPayment({ fire: 9999 }, 'none', 55), null);
  assert.ok(levelUpPayment({ wind: 9999 }, 'none', 70), '61からはどれでも');
  assert.ok(levelUpPayment({ dark: 9999 }, 'none', 98));
  for (let i = 0; i < 5; i++) doResearch(s, 'carry');
  assert.equal(researchEffects(s).carrySlots, 5);
  assert.equal(whyNot(s, 'carry'), '研究しきっています');
});

test('研究の上限（v0.8.5）：攻撃力20・施設の攻撃力30・獲得ペース10。段ごとに、その地方のエレメントで研究する', () => {
  assert.equal(RESEARCH.attack.max, 20);
  assert.equal(RESEARCH.facilityAtk.max, 30);
  assert.equal(RESEARCH.pace.max, 10);
  for (const id of ['attack', 'facilityAtk', 'pace']) assert.equal(RESEARCH[id].costs.length, RESEARCH[id].max, id);
  assert.deepEqual(Object.keys(RESEARCH.attack.costs[5]).sort(), ['thunder', 'water']);
  assert.deepEqual(Object.keys(RESEARCH.attack.costs[19]).sort(), ['dark', 'light']);
  assert.equal(Object.keys(RESEARCH.facilityAtk.costs[29]).length, 9, '21から先はどのエレメントも');
  const s = rich();
  s.elements = Object.fromEntries(Object.keys(s.elements).map((k) => [k, 999999]));
  for (let i = 0; i < 30; i++) doResearch(s, 'facilityAtk');
  assert.equal(researchEffects(s).facilityAtkMul, 17, '施設の攻撃力は最大で17倍（レベル99のモンスターの1つの技とだいたい同じ）');
  assert.equal(whyNot(s, 'facilityAtk'), '研究しきっています');
});
