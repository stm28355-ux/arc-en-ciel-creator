// 施設の一覧（施設の図鑑）。左のパレットで選び、右にくわしい情報を出す（2026-11-14 企画者の注文。モンスター図鑑と同じ形）。
import { FACILITIES, FACILITY_ORDER, FACILITY_TYPE_NAME } from '../data/facilities.js';
import { ELEMENT } from '../data/elements.js';
import { parseShape } from '../core/shape.js';
import { facilityImg } from './spriteImage.js';
import { palette, keepScroll } from './palette.js';

// 地方ごとの絞りこみ（建設の一覧の並びに合わせる）
const GROUPS = [
  ['p1', 'ミルト王国', ['beam', 'flag', 'stonethrower', 'ballista', 'windmill', 'smithy', 'sword', 'horn']],
  ['p2', 'べジブ共和国', ['fog', 'tower', 'lightningrod', 'whirlpool', 'atelier', 'acidpotion', 'buffpotion']],
  ['p3', 'フツルー山脈', ['brazier', 'firearrow', 'icicle', 'frostcannon', 'cauldron', 'magiclab', 'flamecircle', 'blizzardcircle']],
  ['p4', 'フィラッシュ混沌地', ['altar', 'mirror', 'darktower', 'darkclock', 'extremelab', 'lightbook', 'darkbook']],
];

/** 施設の大きさ（「2×2マス」など。企画の書き方に合わせて、小さい方を先に） */
export function sizeText(def) {
  const fp = parseShape(def.shape).footprint;
  const w = Math.max(...fp.map(([x]) => x)) - Math.min(...fp.map(([x]) => x)) + 1;
  const h = Math.max(...fp.map(([, y]) => y)) - Math.min(...fp.map(([, y]) => y)) + 1;
  return `${Math.min(w, h)}×${Math.max(w, h)}マス`;
}

/** 施設の費用（どの属性でもよい分も） */
export function facilityCostText(api, def) {
  const parts = [api.costText(def.cost)];
  if (def.costAny) parts.push(`<span class="chip">どの属性でも合わせて${def.costAny}</span>`);
  return parts.filter(Boolean).join(' ');
}

/** パレットのマスに入る大きさの施設の絵（大きい施設は縮めて64の枠に収める） */
export function facilityPic(kind) {
  const fp = parseShape(FACILITIES[kind].shape).footprint;
  const cells = Math.max(...fp.map(([x]) => x)) - Math.min(...fp.map(([x]) => x)) + 1;
  const rows = Math.max(...fp.map(([, y]) => y)) - Math.min(...fp.map(([, y]) => y)) + 1;
  const scale = Math.max(1, Math.floor(2 / Math.max(cells, rows)));
  return facilityImg(kind, { scale, cls: 'pfac' }) ?? `<span class="icon sq">${FACILITIES[kind].name[0]}</span>`;
}

const state = { group: 'all', sel: 'beam' };

/** 施設のページの操作。戻り値 true で描き直す */
export function onFacilityAction(act, data) {
  if (act === 'group') state.group = data.v;
  else if (act === 'select') state.sel = data.kind;
  else return false;
  return true;
}

/**
 * api = { costText(cost), shapePreview(rows, size) }
 */
export function renderFacilityScreen(app, api) {
  const tabs =
    `<button data-fact="group" data-v="all" class="${state.group === 'all' ? 'on' : ''}">すべて</button>` +
    GROUPS.map(([id, name]) => `<button data-fact="group" data-v="${id}" class="${state.group === id ? 'on' : ''}">${name}</button>`).join('');
  const shown = state.group === 'all' ? FACILITY_ORDER : GROUPS.find(([id]) => id === state.group)[2];
  const cells = shown.map((kind) => ({
    pic: facilityPic(kind),
    act: 'select',
    data: { kind },
    sel: state.sel === kind,
    dot: FACILITIES[kind].element ? ELEMENT[FACILITIES[kind].element].color : null,
    title: FACILITIES[kind].name,
  }));
  const left = palette({ title: '施設', tabs, cells, foot: `${shown.length} 種類（地域マップの「建設」で建てる）`, key: `fac-${state.group}`, attr: 'fact' });
  keepScroll(app, () => {
    app.innerHTML = `<div class="palette-layout">${left}<section class="detail">${detail(api, state.sel)}</section></div>`;
  });
}

function detail(api, kind) {
  const def = FACILITIES[kind];
  const makes = Object.entries(FACILITIES).filter(([, d]) => d.requires === kind).map(([, d]) => d.name);
  const group = GROUPS.find(([, , list]) => list.includes(kind));
  const stats = [];
  if (def.atk) stats.push(`攻撃 ${def.atk} · 間隔 ${def.interval}秒${def.splash ? ' · 範囲の敵すべてに当たる' : ''}`);
  if (def.burn) stats.push(`やけど：毎秒 ${def.burn.dps}、${def.burn.dur}秒`);
  if (def.chill) stats.push(`当たった敵を ${def.chill.dur}秒 ${Math.round(def.chill.slow * 100)}% 遅くする`);
  if (def.slow) stats.push(`範囲の敵を ${Math.round(def.slow * 100)}% 遅くする`);
  if (def.expose) stats.push(`範囲の敵が受けるダメージ +${Math.round(def.expose * 100)}%`);
  if (def.bossMul) stats.push(`【強】とボスには ${def.bossMul}倍`);
  if (def.buff?.atkAdd) stats.push(`範囲のモンスターの攻撃力 +${Math.round(def.buff.atkAdd * 100)}%`);
  if (def.buff?.speedAdd) stats.push(`範囲のモンスターの攻撃の速さ +${Math.round(def.buff.speedAdd * 100)}%`);
  return `<div class="dhead">
      <div class="dpic fac">${facilityImg(kind, { scale: 2, cls: 'big-sprite' }) ?? ''}</div>
      <div class="dname">
        <p class="hint">${group ? group[1] : ''}</p>
        <h2>${def.name}</h2>
        <p><span class="tag">${FACILITY_TYPE_NAME[def.type]}</span> <span class="tag">${sizeText(def)}</span>
          ${def.element ? api.chip(def.element, `攻撃の属性：${ELEMENT[def.element].name}`) : ''}</p>
      </div>
    </div>
    <p class="flavor">${def.desc}</p>
    ${stats.length ? `<h4 class="dsec">効き目 <small>研究で増える前の値</small></h4><p>${stats.join('<br>')}</p>` : ''}
    <h4 class="dsec">範囲 <small>上を向いたとき</small></h4>
    <div class="detail-shape">${api.shapePreview(def.shape, 12)}<span class="hint">濃い色のマス＝施設、青いマス＝攻撃や効果が届くところ、点線のマス＝作業場所（製造施設を動かすモンスターを置くマス）</span></div>
    <h4 class="dsec">費用 <small>地域マップの中の資材</small></h4>
    <div class="row">${facilityCostText(api, def) || '<span class="hint">なし</span>'}</div>
    ${def.requires ? `<p class="hint">${FACILITIES[def.requires].name}が動いている間だけ動きます</p>` : ''}
    ${makes.length ? `<p class="hint">動いている間だけ動く施設：${makes.join('・')}</p>` : ''}`;
}
