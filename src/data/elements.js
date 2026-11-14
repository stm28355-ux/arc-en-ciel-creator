// 9つの属性。資材とエレメントは同じ9属性を使う（企画まとめ「属性」）。
// 色はゲーム名（arc-en-ciel＝虹）にあわせて、虹の並びを意識している。
export const ELEMENTS = [
  { id: 'none', name: '無', color: '#cfcfcf' },
  { id: 'wind', name: '風', color: '#7fd58e' },
  { id: 'earth', name: '土', color: '#c4925e' },
  { id: 'water', name: '水', color: '#4ea8e6' },
  { id: 'thunder', name: '雷', color: '#eed64c' },
  { id: 'fire', name: '炎', color: '#ec6a4c' },
  { id: 'ice', name: '氷', color: '#a4e6f2' },
  { id: 'light', name: '光', color: '#fff3b0' },
  { id: 'dark', name: '闇', color: '#9a76c8' },
];

export const ELEMENT_IDS = ELEMENTS.map((e) => e.id);
export const ELEMENT = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));

/** 9属性すべてが 0 の袋を作る。 */
export function emptyBag() {
  return Object.fromEntries(ELEMENT_IDS.map((id) => [id, 0]));
}

export function addBag(a, b, scale = 1) {
  const out = { ...a };
  for (const id of ELEMENT_IDS) out[id] = (out[id] ?? 0) + (b[id] ?? 0) * scale;
  return out;
}

export function bagTotal(bag) {
  return ELEMENT_IDS.reduce((s, id) => s + (bag[id] ?? 0), 0);
}

// 属性の相性（2026-11-10 のメモ、2026-11-14 に入れた。Issue #24）。入れたときに強さの調整はしない（企画者の決定）。
//   技の属性：その技を持っていたモンスターの属性（引き継いだ技は、元のモンスターの属性のまま）。攻撃する施設は施設の属性
//   モンスターの属性と技の属性が同じなら、ダメージ ×1.2
//   技の属性が相手の属性に強いなら、ダメージ ×1.2（弱いときに下がることはない）
export const STRONG_AGAINST = {
  none: ['light', 'dark'],
  wind: ['none', 'earth'],
  earth: ['none', 'thunder'],
  water: ['earth', 'fire'],
  thunder: ['wind', 'water'],
  fire: ['thunder', 'ice'],
  ice: ['wind', 'water'],
  light: ['ice', 'dark'],
  dark: ['fire', 'light'],
};
export const SAME_ELEMENT_MUL = 1.2;
export const AFFINITY_MUL = 1.2;

/** 攻撃の属性 attack が、相手の属性 target に強ければ 1.2、そうでなければ 1 */
export function affinity(attack, target) {
  return STRONG_AGAINST[attack]?.includes(target) ? AFFINITY_MUL : 1;
}

/** 相手の属性 target に強い属性の一覧 */
export function strongAgainst(target) {
  return ELEMENT_IDS.filter((id) => STRONG_AGAINST[id].includes(target));
}
