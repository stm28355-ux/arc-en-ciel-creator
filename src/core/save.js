// セーブ（ブラウザの localStorage）。読めない・書けない環境でも遊べるようにする。
import { emptyBag } from '../data/elements.js';

const KEY = 'arc-en-ciel-creator/save/v2'; // v1（仮の手持ち5体の版）は引き継がない

// 最初にもらうエレメント。調合錬成のチュートリアルで最初の仲間を作る（無だけで10個 → プチスライム）。
// 30 はプチスライム3体分。1〜2体では草原のウェーブ1を越えられないため
export const START_ELEMENTS = { none: 30 };

export function newSave() {
  return {
    v: 2,
    elements: { ...emptyBag(), ...START_ELEMENTS }, // 持っているエレメント（地域の外へ持ち出せる）
    roster: [], // 手持ちのモンスター { uid, kind, level, skills, stats }
    nextUid: 1,
    codex: {}, // 図鑑：一度手に入れたモンスター kind → true
    regions: {}, // regionId → { cleared, clears, bestPace, paceBag, layout }
    settings: { autoRetry: false },
    research: {}, // 研究したレベル id → n（src/data/research.js）
    researchOff: {}, // OFF にしている研究 id → true（縛りプレイ用）
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
    if (s?.v !== 2) return newSave();
    const base = newSave();
    return { ...base, ...s, elements: { ...emptyBag(), ...s.elements }, settings: { ...base.settings, ...s.settings } };
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

/** モンスターを手持ちに加え、図鑑に載せる。skills = 持っている技（最初は自分の技だけ）、stats = 進化の条件に使う戦闘の記録 */
export function addMonster(save, kind, level = 1) {
  const m = { uid: `m${save.nextUid++}`, kind, level, skills: [kind], stats: {} };
  save.roster.push(m);
  save.codex[kind] = true;
  return m;
}
