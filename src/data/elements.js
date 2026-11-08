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
