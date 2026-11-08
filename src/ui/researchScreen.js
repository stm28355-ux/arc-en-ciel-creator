// 研究画面：エレメントを使って、ゲーム全体に効く強化を進める。研究したものは ON/OFF できる（縛りプレイ用）。
import { RESEARCH, RESEARCH_ORDER, BASE_HP_PER_LEVEL, ATTACK_PER_LEVEL, PACE_PER_LEVEL } from '../data/research.js';
import { researchedLevel, isOn, nextCost, whyNot, doResearch, toggleResearch, researchEffects } from '../core/research.js';

/** 研究したレベルでの効き目の文。 */
function effectText(id, lv) {
  if (lv === 0) return 'まだ研究していない';
  switch (id) {
    case 'baseHp':
      return `拠点の耐久 +${BASE_HP_PER_LEVEL * lv}`;
    case 'attack':
      return `モンスターの攻撃力 +${Math.round(ATTACK_PER_LEVEL * lv * 100)}%`;
    case 'pace':
      return `自動で入るエレメント +${Math.round(PACE_PER_LEVEL * lv * 100)}%`;
    case 'carry':
      return `資源地を${lv}つまで持ち込める`;
    case 'limit1':
      return 'レベルの上限 30';
    case 'limit2':
      return 'レベルの上限 40';
    default:
      return '';
  }
}

/**
 * api = { save, persist(), costText(cost) }
 */
export function renderResearchScreen(root, api) {
  const { save } = api;
  const fx = researchEffects(save);
  const cards = RESEARCH_ORDER.map((id) => {
    const def = RESEARCH[id];
    const lv = researchedLevel(save, id);
    const cost = nextCost(save, id);
    const why = whyNot(save, id);
    const on = isOn(save, id);
    const toggle = lv
      ? `<label class="toggle"><input type="checkbox" data-ract="toggle" data-id="${id}" ${on ? 'checked' : ''}> ${on ? 'ON' : 'OFF（効いていない）'}</label>`
      : '';
    const next = cost
      ? `<p class="hint">次（Lv${lv + 1}）：${effectText(id, lv + 1)}</p>
         <div class="row"><button class="primary" data-ract="do" data-id="${id}" ${why ? 'disabled' : ''}>研究する</button>${api.costText(cost)}</div>
         ${why && why !== 'エレメントが足りません' ? `<p class="hint">${why}</p>` : ''}`
      : '<p class="hint">研究しきりました</p>';
    return `<div class="card research ${lv && !on ? 'off' : ''}">
      <h3>${def.name} <small>Lv${lv} / ${def.max}</small></h3>
      <p>${def.desc}</p>
      <p>今：<b>${effectText(id, lv)}</b> ${toggle}</p>
      ${next}
    </div>`;
  }).join('');
  const now = [
    `拠点の耐久 +${fx.baseHpAdd}`,
    `攻撃力 ×${fx.atkMul.toFixed(2)}`,
    `自動獲得 ×${fx.paceMul.toFixed(1)}`,
    `持ち込める資源地 ${fx.carrySlots}`,
    `レベルの上限 ${fx.levelCap}`,
  ].join(' · ');
  root.innerHTML = `<div class="card"><h3>研究 <small>ゲーム全体に効く</small></h3>
      <p class="hint">エレメントを使って、ずっと続く強化を進めます。研究したものは ON/OFF できます（縛りプレイ用）。OFF にしても、使ったエレメントは戻りません。</p>
      <p>今効いているもの：${now}</p></div>
    <div class="codex-grid">${cards}</div>`;
}

/** 研究画面の操作。戻り値 true で描き直す。 */
export function onResearchAction(api, act, data, el) {
  const { save } = api;
  if (act === 'do') {
    if (whyNot(save, data.id)) return false;
    doResearch(save, data.id);
    api.persist();
    return true;
  }
  if (act === 'toggle') {
    toggleResearch(save, data.id, el.checked);
    api.persist();
    return true;
  }
  return false;
}
