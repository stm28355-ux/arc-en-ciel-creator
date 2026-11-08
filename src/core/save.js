// セーブ（ブラウザの localStorage）。読めない・書けない環境でも遊べるようにする。
import { emptyBag } from '../data/elements.js';
import { STARTER_ROSTER } from '../data/monsters.js';

const KEY = 'arc-en-ciel-creator/save/v1';

export function newSave() {
  return {
    v: 1,
    elements: emptyBag(), // 持っているエレメント（地域の外へ持ち出せる）
    roster: STARTER_ROSTER.map((m) => ({ ...m })),
    regions: {}, // regionId → { cleared, clears, bestPace, paceBag, layout }
  };
}

export function regionSave(save, regionId) {
  save.regions[regionId] ??= { cleared: false, clears: 0, bestPace: 0, paceBag: emptyBag(), layout: { monsters: [], facilities: [], nextFacilityId: 1 } };
  return save.regions[regionId];
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return newSave();
    const s = JSON.parse(raw);
    if (s?.v !== 1) return newSave();
    return { ...newSave(), ...s, elements: { ...emptyBag(), ...s.elements } };
  } catch {
    return newSave();
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* 保存できない環境では何もしない */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
