import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mixResult, rankMix, canPay, pay, levelUpCost, levelUpPayment, atkAt, LEVEL_CAP } from '../src/core/alchemy.js';
import { MONSTERS } from '../src/data/monsters.js';
import { RECIPES, CODEX_COST } from '../src/data/recipes.js';
import { newSave, addMonster, START_ELEMENTS } from '../src/core/save.js';
import { parseShape } from '../src/core/shape.js';

test('表のモンスターは全部データがあり、図鑑錬成の値段もある', () => {
  for (const r of RECIPES) {
    assert.ok(MONSTERS[r.kind], r.kind);
    assert.ok(CODEX_COST[r.kind], r.kind);
    parseShape(MONSTERS[r.kind].shape);
  }
  assert.equal(new Set(RECIPES.map((r) => r.kind)).size, Object.keys(MONSTERS).length, 'どのモンスターも作り方がある');
});

test('調合錬成：1種類なら、その属性で決まる', () => {
  assert.equal(mixResult({ none: 10 }).kind, 'slime');
  assert.equal(mixResult({ wind: 25 }).kind, 'bat');
  assert.equal(mixResult({ earth: 10 }).kind, 'turtle');
});

test('調合錬成：2種類なら、一番多い属性と二番目で決まる。比率は細かく合わせなくてよい', () => {
  assert.equal(mixResult({ none: 6, wind: 4 }).kind, 'sprite');
  assert.equal(mixResult({ none: 9, wind: 1 }).kind, 'sprite');
  assert.equal(mixResult({ wind: 6, none: 4 }).kind, 'hawk');
  assert.equal(mixResult({ earth: 7, none: 3 }).kind, 'golem');
  // 同じ量なら、属性の並び（無・風・土）で前のものが「多い」
  assert.equal(mixResult({ wind: 5, earth: 5 }).kind, 'weasel');
});

test('調合錬成：3種類なら一番多い属性で決まり、ぴったり同じ量だけは特殊なモンスター', () => {
  assert.equal(mixResult({ none: 5, wind: 3, earth: 2 }).kind, 'scarecrow');
  assert.equal(mixResult({ earth: 6, none: 2, wind: 2 }).kind, 'crab');
  assert.equal(mixResult({ none: 4, wind: 4, earth: 4 }).kind, 'prism');
  assert.equal(mixResult({ none: 5, wind: 4, earth: 4 }).kind, 'scarecrow');
});

test('調合錬成：合計が少ない・多すぎる・表にない組み合わせでは生まれない', () => {
  assert.equal(mixResult({ none: 9 }).kind, null);
  assert.equal(mixResult({ none: 61 }).kind, null);
  assert.equal(mixResult({ water: 10 }).kind, null, '第2地方以降のエレメントはまだ表にない');
});

test('多い順の並び', () => {
  assert.deepEqual(rankMix({ none: 2, wind: 5, earth: 5 }).map((r) => r.id), ['wind', 'earth', 'none']);
});

test('支払い', () => {
  assert.equal(canPay({ none: 5 }, { none: 5 }), true);
  assert.equal(canPay({ none: 4 }, { none: 5 }), false);
  assert.deepEqual(pay({ none: 5, wind: 1 }, { none: 5 }), { none: 0, wind: 1 });
});

test('レベルアップ：値段は少しずつ上がり、上限は15', () => {
  assert.equal(levelUpCost(1), 3);
  assert.ok(levelUpCost(14) > levelUpCost(13));
  assert.equal(LEVEL_CAP, 15);
  assert.ok(Math.abs(atkAt('slime', 15) - 10 * 2.12) < 1e-9);
  let total = 0;
  for (let l = 1; l < LEVEL_CAP; l++) total += levelUpCost(l);
  assert.ok(total > 100 && total < 250, `1体を15まで上げるのに ${total}`);
});

test('レベルアップの支払い：自分の属性から先に使い、足りない分は多く持っているものから', () => {
  const cost = levelUpCost(5); // 7
  assert.deepEqual(levelUpPayment({ none: 3, wind: 10, earth: 1 }, 'none', 5), { none: 3, wind: 4 });
  assert.deepEqual(levelUpPayment({ none: 0, wind: 2, earth: 10 }, 'none', 5), { earth: 7 });
  assert.equal(levelUpPayment({ none: 2, wind: 2, earth: 2 }, 'none', 5), null, `${cost}に足りない`);
  assert.equal(levelUpPayment({ water: 99 }, 'none', 1), null, '第1地方のエレメントしか使えない');
});

test('新しいセーブ：手持ちはなく、無のエレメントをもらっている。作ると図鑑に載る', () => {
  const s = newSave();
  assert.equal(s.roster.length, 0);
  assert.equal(s.elements.none, START_ELEMENTS.none);
  const m = addMonster(s, 'slime');
  assert.equal(m.level, 1);
  assert.equal(s.codex.slime, true);
  assert.notEqual(addMonster(s, 'slime').uid, m.uid);
});
