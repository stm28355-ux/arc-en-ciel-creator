// 錬成（調合錬成・図鑑錬成）とレベルアップ。画面なしで動く。
import { ELEMENT_IDS } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { RECIPES, CODEX_COST, MIX_MIN_TOTAL, MIX_MAX_TOTAL } from '../data/recipes.js';

// ---------- 調合錬成 ----------

/** 使うエレメントを、多い順（同じなら属性の並び順）に並べる。 */
export function rankMix(mix) {
  return ELEMENT_IDS.filter((id) => (mix[id] ?? 0) > 0)
    .map((id, order) => ({ id, n: mix[id], order }))
    .sort((a, b) => b.n - a.n || a.order - b.order);
}

function matchesSpecial(mix, ratio) {
  const used = ELEMENT_IDS.filter((id) => (mix[id] ?? 0) > 0);
  const want = Object.keys(ratio);
  if (used.length !== want.length || !want.every((id) => used.includes(id))) return false;
  const k = mix[want[0]] / ratio[want[0]];
  return want.every((id) => mix[id] === k * ratio[id]);
}

/**
 * 配合から生まれるモンスター。
 * 戻り値：{ kind, level, waste } か { kind: null, reason }
 *   合計が MIX_MIN_TOTAL を超えた分は、レベルアップの値段どおりにレベルへ変える（余りは waste）
 */
export function mixResult(mix) {
  const total = ELEMENT_IDS.reduce((s, id) => s + (mix[id] ?? 0), 0);
  if (total < MIX_MIN_TOTAL) return { kind: null, reason: `エレメントを合計${MIX_MIN_TOTAL}以上入れてください` };
  if (total > MIX_MAX_TOTAL) return { kind: null, reason: `入れられるのは合計${MIX_MAX_TOTAL}まで` };
  const r = mixKind(mix);
  if (!r.kind) return r;
  return { ...r, ...mixLevel(total) };
}

/** 合計のうち最小を超えた分で、何レベルで生まれるか。 */
export function mixLevel(total) {
  let extra = Math.max(0, total - MIX_MIN_TOTAL);
  let level = 1;
  while (level < LEVEL_CAP && extra >= levelUpCost(level)) {
    extra -= levelUpCost(level);
    level += 1;
  }
  return { level, waste: extra };
}

function mixKind(mix) {
  for (const r of RECIPES) if (r.special && matchesSpecial(mix, r.special)) return { kind: r.kind };
  const ranked = rankMix(mix);
  const types = Math.min(ranked.length, 3); // 3種類以上は「3」として見る
  const first = ranked[0]?.id;
  const second = ranked[1]?.id;
  const hit = RECIPES.find((r) => !r.special && r.types === types && r.first === first && (types !== 2 || r.second === second));
  if (hit) return { kind: hit.kind };
  return { kind: null, reason: 'この組み合わせからは、まだ何も生まれない' };
}

/** 持っているエレメントで払えるか。 */
export function canPay(elements, cost) {
  return Object.entries(cost).every(([id, n]) => (elements[id] ?? 0) >= n);
}

export function pay(elements, cost) {
  const out = { ...elements };
  for (const [id, n] of Object.entries(cost)) out[id] -= n;
  return out;
}

export function codexCost(kind) {
  return CODEX_COST[kind];
}

// ---------- レベルアップ ----------

export const LEVEL_CAP = 15; // 研究しないときの上限。限界突破（研究）で 30・40 に上がる（core/research.js の levelCap）
export const LEVEL_ELEMENTS = ['none', 'wind', 'earth']; // レベル1〜30は第1地方のエレメントで上げる
export const LEVEL_ELEMENTS_2 = ['water', 'thunder']; // レベル31〜40は第2地方のエレメントで上げる
export const LEVEL_TIER2_FROM = 30; // このレベルから上げるときは第2地方のエレメント
export const LEVEL_ELEMENTS_3 = ['fire', 'ice']; // レベル41〜50は第3地方のエレメントで上げる（仮）
export const LEVEL_TIER3_FROM = 40;

/** level から level+1 に上げるときに使えるエレメント。 */
export function levelElements(level) {
  if (level >= LEVEL_TIER3_FROM) return LEVEL_ELEMENTS_3;
  return level >= LEVEL_TIER2_FROM ? LEVEL_ELEMENTS_2 : LEVEL_ELEMENTS;
}

/**
 * level から level+1 に上げるのに要るエレメントの数。
 * 15までは1.2倍ずつ上がる。15から先（限界突破）は、15→16 の値段に1レベルごと6ずつ足す（倍々にすると40まで届かないため）
 */
export function levelUpCost(level) {
  if (level < LEVEL_CAP) return Math.ceil(3 * 1.2 ** (level - 1));
  return Math.ceil(3 * 1.2 ** (LEVEL_CAP - 1)) + 6 * (level - LEVEL_CAP);
}

/** レベルによる攻撃力の倍率。レベル15で約2.1倍。 */
export function atkScale(level = 1) {
  return 1 + 0.08 * (level - 1);
}

export function atkAt(kind, level = 1) {
  return MONSTERS[kind].atk * atkScale(level);
}

/**
 * レベルアップの支払い。第1地方のエレメントならどれでもよく、
 * モンスター自身の属性から先に使い、足りない分は多く持っているものから使う。
 * 戻り値：払う内訳 { id: n } か、足りなければ null
 */
export function levelUpPayment(elements, monsterElement, level) {
  let need = levelUpCost(level);
  const order = [...levelElements(level)].sort((a, b) => (b === monsterElement) - (a === monsterElement) || (elements[b] ?? 0) - (elements[a] ?? 0));
  const payment = {};
  for (const id of order) {
    const take = Math.min(need, Math.floor(elements[id] ?? 0));
    if (take > 0) payment[id] = take;
    need -= take;
    if (need === 0) return payment;
  }
  return null;
}
