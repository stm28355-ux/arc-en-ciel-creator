// 施設の一覧（どの施設を、何で建てて、何が起きるか）。見た目はあとで整える（2026-11-13、企画者の注文）
import { FACILITIES, FACILITY_ORDER, FACILITY_TYPE_NAME } from '../data/facilities.js';
import { ELEMENT } from '../data/elements.js';
import { parseShape } from '../core/shape.js';

// 地方ごとの見出し（建設の一覧の並びに合わせる）
const GROUPS = [
  ['第1地方（無・風・土）', ['beam', 'flag', 'stonethrower', 'smithy', 'sword', 'horn']],
  ['第2地方（水・雷）', ['fog', 'tower', 'lightningrod', 'atelier', 'acidpotion', 'buffpotion']],
  ['第3地方（炎・氷）', ['brazier', 'firearrow', 'icicle', 'frostcannon', 'magiclab', 'flamecircle', 'blizzardcircle']],
  ['第4地方（光・闇）', ['altar', 'mirror', 'darktower', 'extremelab', 'lightbook', 'darkbook']],
];

/** 施設の大きさ（「2×2マス」など） */
function sizeText(def) {
  const fp = parseShape(def.shape).footprint;
  const w = Math.max(...fp.map(([x]) => x)) - Math.min(...fp.map(([x]) => x)) + 1;
  const h = Math.max(...fp.map(([, y]) => y)) - Math.min(...fp.map(([, y]) => y)) + 1;
  return `${w}×${h}マス`;
}

/** 施設の費用（どの属性でもよい分も） */
export function facilityCostText(api, def) {
  const parts = [api.costText(def.cost)];
  if (def.costAny) parts.push(`<span class="chip">どの属性でも合わせて${def.costAny}</span>`);
  return parts.filter(Boolean).join(' ');
}

/**
 * api = { costText(cost), shapePreview(rows, size) }
 */
export function renderFacilityScreen(app, api) {
  const all = new Set(GROUPS.flatMap(([, list]) => list));
  const missing = FACILITY_ORDER.filter((k) => !all.has(k));
  const groups = missing.length ? [...GROUPS, ['そのほか', missing]] : GROUPS;
  const card = (kind) => {
    const def = FACILITIES[kind];
    const needs = def.requires ? `<p class="hint">${FACILITIES[def.requires].name}が動いている間だけ動く</p>` : '';
    const makes = Object.entries(FACILITIES).filter(([, d]) => d.requires === kind).map(([, d]) => d.name);
    const element = def.element ? `<span class="chip"><span class="dot" style="background:${ELEMENT[def.element].color}"></span>攻撃の属性：${ELEMENT[def.element].name}</span>` : '';
    return `<div class="card facility-card">
      <h3>${def.name} <small>${FACILITY_TYPE_NAME[def.type]} · ${sizeText(def)}</small></h3>
      <div class="detail-shape">${api.shapePreview(def.shape, 9)}<span>${def.desc}</span></div>
      <div class="row">${facilityCostText(api, def)} ${element}</div>
      ${needs}
      ${makes.length ? `<p class="hint">動いている間だけ動く施設：${makes.join('・')}</p>` : ''}
    </div>`;
  };
  app.innerHTML = `
    <div class="card"><h2>施設の一覧</h2>
      <p class="hint">地域マップの「建設」で建てる施設です。資材は地域マップの中で、モンスターの配置から入ります。図の見方：白いマス＝施設、青いマス＝攻撃や効果が届くところ、点線のマス＝作業場所（製造施設を動かすモンスターを置くマス）。どれも上を向いたときの形です。</p>
    </div>
    ${groups.map(([title, list]) => `<h3 class="family-head">${title}</h3><div class="codex-grid">${list.map(card).join('')}</div>`).join('')}`;
}
