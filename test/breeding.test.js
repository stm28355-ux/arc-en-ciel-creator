import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSave, addMonster } from '../src/core/save.js';
import { fusionCandidates, fusionRule, fusionMembers, childFamily, inheritableSkills, fuse, evolve, evolutionProgress, recordBattle, skillsOf } from '../src/core/breeding.js';
import { MONSTERS } from '../src/data/monsters.js';
import { FAMILIES, FAMILY_ORDER, RARE_FUSIONS } from '../src/data/families.js';
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

const kinds = (list) => list.map((c) => `${c.how}:${c.kind}`);

test('系統と位階のデータ：どのモンスターにも系統と位階がある。表は45通りそろっている', () => {
  for (const [k, d] of Object.entries(MONSTERS)) {
    assert.ok(FAMILIES[d.family], `${k} の系統`);
    assert.ok(Number.isInteger(d.rank) && d.rank >= 1, `${k} の位階`);
  }
  for (let i = 0; i < FAMILY_ORDER.length; i++)
    for (let j = i + 1; j < FAMILY_ORDER.length; j++) assert.ok(FAMILIES[childFamily(FAMILY_ORDER[i], FAMILY_ORDER[j])], `${FAMILY_ORDER[i]}×${FAMILY_ORDER[j]}`);
  // 融合のルールで生まれるモンスターは、系統の中で位階が重ならない（どれが生まれるかが1つに決まる）
  for (const f of FAMILY_ORDER) {
    const ranks = fusionMembers(f).map((k) => MONSTERS[k].rank);
    assert.equal(new Set(ranks).size, ranks.length, f);
  }
  for (const r of RARE_FUSIONS) {
    assert.ok(MONSTERS[r.kind].rare, r.kind);
    for (const p of r.parents) assert.ok(MONSTERS[p], p);
  }
});

test('融合のルール：今いるモンスターどうしなら、何かが必ず生まれる。融合モンスターは全部どこかの組み合わせで生まれる', () => {
  const all = Object.keys(MONSTERS);
  const born = new Set();
  for (const a of all)
    for (const b of all) {
      const r = fusionRule(a, b);
      assert.ok(r.kind, `${a}×${b} → ${r.family}`);
      assert.equal(fusionRule(b, a).kind, r.kind, '親の順番は関係ない');
      born.add(r.kind);
    }
  for (const k of all.filter((x) => MONSTERS[x].fusion)) assert.ok(born.has(k), k);
});

test('融合のルール：子の系統は表で、位階は親の平均＋1で決まる', () => {
  // ゲル(位階1)×けもの(位階1) → けもの系、位階2 → けもの系の融合モンスターで位階2以上の一番近いもの
  assert.deepEqual(fusionRule('slime', 'bat'), { family: 'beast', rank: 2, kind: 'fluffysheep' });
  // 同じ系統どうしは、その系統
  assert.deepEqual(fusionRule('slime', 'slime'), { family: 'gel', rank: 2, kind: 'stoneslime' });
  // 位階3×位階4 → 平均3.5を切り捨てて3、＋1で4 → 位階5のオーロラゲル
  assert.deepEqual(fusionRule('stoneslime', 'prism'), { family: 'gel', rank: 4, kind: 'auroragel' });
  // 一番上より高くなるときは、一番上のもの
  assert.equal(fusionRule('cloudbird', 'cloudbird').kind, 'cloudbird');
  // いわ×植物 → いわ系
  assert.equal(fusionRule('golem', 'sprite').kind, 'mossgolem');
});

test('融合の候補：特別な組み合わせ・融合のルール・親と同じ', () => {
  const { ms } = saveWith('slime', 'bat', 'turtle', 'swallow');
  assert.deepEqual(kinds(fusionCandidates(ms[0], ms[1])), ['rule:fluffysheep', 'parent:slime', 'parent:bat']);
  // いわガメ×かぜきりツバメは、特別な組み合わせ（順番は関係ない）
  assert.deepEqual(kinds(fusionCandidates(ms[2], ms[3])), ['rare:skyshell', 'rule:falcon', 'parent:turtle', 'parent:swallow']);
  assert.deepEqual(kinds(fusionCandidates(ms[3], ms[2])), ['rare:skyshell', 'rule:falcon', 'parent:swallow', 'parent:turtle']);
  const { ms: same } = saveWith('slime', 'slime');
  assert.deepEqual(kinds(fusionCandidates(same[0], same[1])), ['rule:stoneslime', 'parent:slime']);
});

test('融合：2体は手持ちと配置から消え、レベル1の子が生まれる。技は最大3つ', () => {
  const { s, ms } = saveWith('slime', 'bat', 'hawk');
  s.regions.grassland = { layout: { monsters: [{ uid: ms[0].uid, kind: 'slime', x: 1, y: 1, dir: 'up' }], facilities: [] } };
  ms[0].level = 10;
  assert.throws(() => fuse(s, ms[0].uid, ms[1].uid, 'sprite'), /候補にない/);
  const child = fuse(s, ms[0].uid, ms[1].uid, 'fluffysheep', ['slime', 'bat']);
  assert.equal(child.level, 1);
  assert.deepEqual(child.skills, ['fluffysheep', 'slime', 'bat']);
  assert.equal(s.roster.length, 2);
  assert.equal(s.regions.grassland.layout.monsters.length, 0, '配置していた親も消える');
  assert.equal(s.codex.fluffysheep, true);
  // 子をさらに融合：技の候補は子と相手の技を合わせたもの
  const pool = inheritableSkills(child, ms[2], 'hawk');
  assert.deepEqual(pool.sort(), ['bat', 'fluffysheep', 'slime']);
  assert.throws(() => fuse(s, child.uid, ms[2].uid, 'hawk', ['slime', 'bat', 'fluffysheep']), /2つまで/);
  assert.throws(() => fuse(s, child.uid, child.uid, 'fluffysheep'), /同じモンスター/);
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

test('ボスごとの記録：まおうにとどめを刺すと、まじんが まおう に進化できる', () => {
  const s = newSave();
  const m = addMonster(s, 'demon');
  recordBattle(s, [{ owner: m.uid, enemy: 'sandking', boss: true }]);
  assert.equal(evolutionProgress(m).ok, false, 'ほかのボスでは進化しない');
  recordBattle(s, [{ owner: m.uid, enemy: 'maou', boss: true }]);
  assert.equal(m.stats.bossKills, 2);
  assert.equal(evolutionProgress(m).ok, true);
  assert.equal(evolve(s, m.uid).kind, 'maou');
});
