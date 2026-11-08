import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSave, addMonster } from '../src/core/save.js';
import { fusionCandidates, inheritableSkills, fuse, evolve, evolutionProgress, recordBattle, skillsOf } from '../src/core/breeding.js';
import { resolveLayout } from '../src/core/layout.js';
import { parseMap } from '../src/core/map.js';
import { REGIONS } from '../src/data/regions.js';
import { createBattle, startBattle, step } from '../src/core/battle.js';

const map = parseMap(REGIONS.grassland.map);

function saveWith(...kinds) {
  const s = newSave();
  const ms = kinds.map((k) => addMonster(s, k));
  return { s, ms };
}

test('融合の候補：親のどちらかと、2体のもとのエレメントを合わせた配合のモンスター', () => {
  const { ms } = saveWith('slime', 'bat');
  // 無12 + 風12 → 同じ量なので無が一番、風が二番 → のはらの精
  assert.deepEqual(fusionCandidates(ms[0], ms[1]), ['slime', 'bat', 'sprite']);
  const { ms: same } = saveWith('slime', 'slime');
  assert.deepEqual(fusionCandidates(same[0], same[1]), ['slime'], '同じモンスターどうしは、そのまま');
});

test('融合：2体は手持ちと配置から消え、レベル1の子が生まれる。技は最大3つ', () => {
  const { s, ms } = saveWith('slime', 'bat', 'hawk');
  s.regions.grassland = { layout: { monsters: [{ uid: ms[0].uid, kind: 'slime', x: 1, y: 1, dir: 'up' }], facilities: [] } };
  ms[0].level = 10;
  const child = fuse(s, ms[0].uid, ms[1].uid, 'sprite', ['slime', 'bat']);
  assert.equal(child.level, 1);
  assert.deepEqual(child.skills, ['sprite', 'slime', 'bat']);
  assert.equal(s.roster.length, 2);
  assert.equal(s.regions.grassland.layout.monsters.length, 0, '配置していた親も消える');
  assert.equal(s.codex.sprite, true);
  // 子をさらに融合：技の候補は子と相手の技を合わせたもの
  const pool = inheritableSkills(child, ms[2], 'hawk');
  assert.deepEqual(pool.sort(), ['bat', 'slime', 'sprite']);
  assert.throws(() => fuse(s, child.uid, ms[2].uid, 'hawk', ['slime', 'bat', 'sprite']), /2つまで/);
  assert.throws(() => fuse(s, child.uid, child.uid, 'sprite'), /同じモンスター/);
});

test('技を3つ持つモンスターは、技ごとに別々に攻撃する。資源地は全部の範囲で見る', () => {
  const layout = { monsters: [{ uid: 'm1', kind: 'sprite', x: 12, y: 9, dir: 'right', skills: ['sprite', 'slime', 'hawk'] }], facilities: [] };
  const r = resolveLayout(map, layout);
  assert.equal(r.units.length, 3);
  assert.deepEqual(r.units.map((u) => u.skill), ['sprite', 'slime', 'hawk']);
  assert.ok(r.units.every((u) => u.owner === 'm1'));
  assert.equal(r.units.find((u) => u.skill === 'hawk').atk, 14, 'それぞれの技の威力');
});

test('戦闘で倒した記録が、モンスターごとに数えられる', () => {
  const { s, ms } = saveWith('turtle');
  const layout = { monsters: [{ uid: ms[0].uid, kind: 'turtle', x: 15, y: 9, dir: 'left' }], facilities: [] };
  const r = resolveLayout(map, layout);
  const b = createBattle(REGIONS.grassland, map);
  startBattle(b, r);
  while (b.phase === 'running') step(b, 1 / 30, r);
  assert.ok(b.kills.length > 0);
  assert.ok(b.kills.every((k) => k.owner === ms[0].uid));
  recordBattle(s, b.kills);
  assert.equal(s.roster[0].stats.kills, b.kills.length);
  assert.equal(s.roster[0].stats.swordKills ?? 0, 0);
});

test('進化：条件を満たすと進化でき、レベル1に戻る。引き継いだ技は残る', () => {
  const { s, ms } = saveWith('turtle');
  const m = ms[0];
  m.level = 12;
  m.skills = ['turtle', 'hawk'];
  assert.equal(evolutionProgress(m).ok, false);
  assert.throws(() => evolve(s, m.uid));
  recordBattle(s, Array.from({ length: 30 }, () => ({ owner: m.uid, sword: true })));
  assert.deepEqual(evolutionProgress(m), { have: 30, need: 30, ok: true });
  evolve(s, m.uid);
  assert.equal(m.kind, 'rockturtle');
  assert.equal(m.level, 1);
  assert.deepEqual(skillsOf(m), ['rockturtle', 'hawk']);
  assert.equal(s.codex.rockturtle, true);
  assert.equal(evolutionProgress(m), null, '進化したあとはもう進化しない');
});

test('鍛冶場で作業したまま攻略すると workerClears が増える', () => {
  const { s, ms } = saveWith('golem');
  recordBattle(s, [], { won: true, workers: [ms[0].uid] });
  assert.equal(evolutionProgress(ms[0]).ok, true);
  recordBattle(s, [], { won: false, workers: [ms[0].uid] });
  assert.equal(ms[0].stats.workerClears, 1, '負けたときは数えない');
});
