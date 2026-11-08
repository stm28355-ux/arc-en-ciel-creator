// 融合・技の継承・進化。画面なしで動く。
import { addBag } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { CODEX_COST } from '../data/recipes.js';
import { EVOLUTIONS, EVOLVED_FROM } from '../data/evolutions.js';
import { mixResult } from './alchemy.js';

export const MAX_SKILLS = 3;

/** モンスター（手持ちの1体）の技の一覧。技は種類のIDで表す。 */
export function skillsOf(m) {
  return m.skills?.length ? m.skills : [m.kind];
}

/** 融合の配合を決める「そのモンスターのもとになるエレメント」。進化後は進化前のもの。 */
export function makeupOf(kind) {
  return CODEX_COST[EVOLVED_FROM[kind] ?? kind];
}

/**
 * 融合で生まれるモンスターの候補。
 * 親のどちらか（同じモンスターのままにできる）と、2体のもとのエレメントを合わせた配合から決まるモンスター。
 */
export function fusionCandidates(a, b) {
  const mixed = mixResult(addBag(makeupOf(a.kind), makeupOf(b.kind)), { anyTotal: true }).kind;
  return [...new Set([a.kind, b.kind, mixed].filter(Boolean))];
}

/** 引き継げる技（生まれるモンスター自身の技は必ず持つので除く）。 */
export function inheritableSkills(a, b, resultKind) {
  return [...new Set([...skillsOf(a), ...skillsOf(b)])].filter((k) => k !== resultKind);
}

/**
 * 融合する。2体は手持ちと配置から消え、レベル1の新しいモンスターが生まれる。
 * extra：引き継ぐ技（最大 MAX_SKILLS - 1）
 * 戻り値：生まれたモンスター
 */
export function fuse(save, uidA, uidB, resultKind, extra = []) {
  if (uidA === uidB) throw new Error('同じモンスターどうしは融合できない');
  const a = save.roster.find((m) => m.uid === uidA);
  const b = save.roster.find((m) => m.uid === uidB);
  if (!a || !b) throw new Error('手持ちにいない');
  if (!fusionCandidates(a, b).includes(resultKind)) throw new Error('候補にないモンスター');
  const pool = inheritableSkills(a, b, resultKind);
  const keep = [...new Set(extra)].filter((k) => pool.includes(k));
  if (keep.length > MAX_SKILLS - 1) throw new Error(`引き継げる技は${MAX_SKILLS - 1}つまで`);
  removeMonsters(save, [uidA, uidB]);
  const child = { uid: `m${save.nextUid++}`, kind: resultKind, level: 1, skills: [resultKind, ...keep], stats: {} };
  save.roster.push(child);
  save.codex[resultKind] = true;
  return child;
}

export function removeMonsters(save, uids) {
  save.roster = save.roster.filter((m) => !uids.includes(m.uid));
  for (const r of Object.values(save.regions)) r.layout.monsters = r.layout.monsters.filter((m) => !uids.includes(m.uid));
}

// ---------- 進化 ----------

export function evolutionOf(m) {
  return EVOLUTIONS[m.kind] ?? null;
}

/** 進化の条件の進み具合 { have, need, ok } */
export function evolutionProgress(m) {
  const e = evolutionOf(m);
  if (!e) return null;
  const have = m.stats?.[e.stat] ?? 0;
  return { have: Math.min(have, e.n), need: e.n, ok: have >= e.n };
}

/**
 * 進化する。レベルは1に戻る。自分の技は進化後の技に変わり、引き継いだ技は残る。配置もそのまま。
 */
export function evolve(save, uid) {
  const m = save.roster.find((r) => r.uid === uid);
  const e = m && evolutionOf(m);
  if (!e || !evolutionProgress(m).ok) throw new Error('進化の条件を満たしていない');
  const from = m.kind;
  m.kind = e.to;
  m.level = 1;
  m.skills = [...new Set(skillsOf({ ...m, kind: from }).map((k) => (k === from ? e.to : k)))];
  for (const r of Object.values(save.regions)) for (const lm of r.layout.monsters) if (lm.uid === uid) lm.kind = e.to;
  save.codex[e.to] = true;
  return m;
}

// ---------- 戦闘の記録 ----------

/**
 * 戦闘で倒した記録（battle.kills）と、攻略したかどうかから、モンスターごとの stats を足す。
 * kills: [{ owner, enemy, sword, flag, elite, boss }]
 */
export function recordBattle(save, kills, { won = false, workers = [] } = {}) {
  const add = (uid, key, n = 1) => {
    const m = save.roster.find((r) => r.uid === uid);
    if (!m) return;
    m.stats ??= {};
    m.stats[key] = (m.stats[key] ?? 0) + n;
  };
  for (const k of kills) {
    if (!k.owner) continue;
    add(k.owner, 'kills');
    if (k.sword) add(k.owner, 'swordKills');
    if (k.flag) add(k.owner, 'flagKills');
    if (k.elite) add(k.owner, 'eliteKills');
    if (k.boss) add(k.owner, 'bossKills');
  }
  if (won) for (const uid of workers) add(uid, 'workerClears');
}

export function skillName(kind) {
  return MONSTERS[kind].skill;
}
