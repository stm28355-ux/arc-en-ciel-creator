// 研究：研究する・ON/OFF・今効いている効き目。画面なしで動く。
import { RESEARCH, MIX_UNLOCK, BASE_HP_PER_LEVEL, ATTACK_PER_LEVEL, PACE_PER_LEVEL, FACILITY_PER_LEVEL } from '../data/research.js';
import { canPay, pay, LEVEL_CAP } from './alchemy.js';
import { MIX_ELEMENTS } from '../data/recipes.js';

/** 研究したレベル（OFF でも数える）。 */
export function researchedLevel(save, id) {
  return save.research?.[id] ?? 0;
}

export function isOn(save, id) {
  return researchedLevel(save, id) > 0 && !save.researchOff?.[id];
}

/** 効いているレベル（OFF なら 0）。 */
export function activeLevel(save, id) {
  return isOn(save, id) ? researchedLevel(save, id) : 0;
}

/** 次のレベルの値段。研究しきっていれば null。 */
export function nextCost(save, id) {
  const lv = researchedLevel(save, id);
  return lv < RESEARCH[id].max ? RESEARCH[id].costs[lv] : null;
}

/** 研究できない理由（できるなら null）。 */
export function whyNot(save, id) {
  const def = RESEARCH[id];
  const cost = nextCost(save, id);
  if (!cost) return '研究しきっています';
  if (def.needs && !researchedLevel(save, def.needs)) return `先に「${RESEARCH[def.needs].name}」を研究します`;
  if (!canPay(save.elements, cost)) return 'エレメントが足りません';
  return null;
}

/** 研究する。エレメントを払ってレベルを1上げる。 */
export function doResearch(save, id) {
  const why = whyNot(save, id);
  if (why) throw new Error(why);
  save.elements = pay(save.elements, nextCost(save, id));
  save.research ??= {};
  save.research[id] = researchedLevel(save, id) + 1;
  return save.research[id];
}

/** ON/OFF を切り替える。使ったエレメントは戻らない。 */
export function toggleResearch(save, id, on) {
  if (!researchedLevel(save, id)) return;
  save.researchOff ??= {};
  if (on) delete save.researchOff[id];
  else save.researchOff[id] = true;
}

/** レベルの上限。限界突破 II は限界突破 I が ON のときだけ効く。 */
export function levelCap(save) {
  const one = activeLevel(save, 'limit1') > 0;
  const two = one && activeLevel(save, 'limit2') > 0;
  return LEVEL_CAP + (one ? 15 : 0) + (two ? 10 : 0);
}

/** 調合錬成で使えるエレメント（無は最初から。ほかは研究で開放）。 */
export function mixElements(save) {
  return MIX_ELEMENTS.filter((id) => !MIX_UNLOCK[id] || activeLevel(save, MIX_UNLOCK[id]) > 0);
}

/** 今効いている研究の効き目をまとめて返す。 */
export function researchEffects(save) {
  return {
    baseHpAdd: BASE_HP_PER_LEVEL * activeLevel(save, 'baseHp'),
    atkMul: 1 + ATTACK_PER_LEVEL * activeLevel(save, 'attack'),
    facilityMul: 1 + FACILITY_PER_LEVEL * activeLevel(save, 'facility'),
    paceMul: 1 + PACE_PER_LEVEL * activeLevel(save, 'pace'),
    carrySlots: activeLevel(save, 'carry'),
    levelCap: levelCap(save),
    mixElements: mixElements(save),
  };
}
