// モンスター画面：手持ち（レベルアップ）・錬成（調合錬成）・図鑑（図鑑錬成）。
import { ELEMENT, ELEMENTS } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { RECIPES, HINTS, MIX_MIN_TOTAL, MIX_MAX_TOTAL } from '../data/recipes.js';
import { REGIONS } from '../data/regions.js';
import { mixResult, canPay, pay, codexCost, levelUpCost, levelUpPayment, atkAt, LEVEL_CAP, LEVEL_ELEMENTS } from '../core/alchemy.js';
import { addMonster } from '../core/save.js';

const MIX_ELEMENTS = LEVEL_ELEMENTS; // 今の表で使えるのは第1地方の3属性

/**
 * api = { save, persist(), chip(id, text), costText(cost), shapePreview(rows) }
 * state = { tab: 'roster'|'mix'|'codex', selected: uid|null, mix: {id: n}, born: kind|null }
 */
export function renderMonsterScreen(root, api, state) {
  const { save } = api;
  const tabs = [
    ['roster', `手持ち（${save.roster.length}）`],
    ['mix', '錬成'],
    ['codex', `図鑑（${Object.keys(save.codex).length}/${RECIPES.length}）`],
  ]
    .map(([v, t]) => `<button data-mact="tab" data-v="${v}" class="${state.tab === v ? 'on' : ''}">${t}</button>`)
    .join('');
  let body = '';
  if (state.tab === 'roster') body = rosterView(api, state);
  else if (state.tab === 'mix') body = mixView(api, state);
  else body = codexView(api, state);
  root.innerHTML = `<div class="row" style="margin-bottom:10px">${tabs}</div>${body}`;
}

/** モンスター画面のボタン操作。戻り値 true で描き直す。 */
export function onMonsterAction(api, state, act, data) {
  const { save } = api;
  switch (act) {
    case 'tab':
      state.tab = data.v;
      state.born = null;
      return true;
    case 'select':
      state.selected = state.selected === data.uid ? null : data.uid;
      return true;
    case 'levelup': {
      const m = save.roster.find((r) => r.uid === data.uid);
      if (!m || m.level >= LEVEL_CAP) return false;
      const payment = levelUpPayment(save.elements, MONSTERS[m.kind].element, m.level);
      if (!payment) return false;
      save.elements = pay(save.elements, payment);
      m.level += 1;
      api.persist();
      return true;
    }
    case 'mix-add': {
      const id = data.id;
      const n = Number(data.n);
      const cur = state.mix[id] ?? 0;
      const total = Object.values(state.mix).reduce((a, b) => a + b, 0);
      const have = Math.floor(save.elements[id] ?? 0);
      const next = Math.max(0, Math.min(cur + n, have, cur + (MIX_MAX_TOTAL - total)));
      state.mix[id] = next;
      state.born = null;
      return true;
    }
    case 'mix-clear':
      state.mix = {};
      state.born = null;
      return true;
    case 'mix-go': {
      const r = mixResult(state.mix);
      if (!r.kind || !canPay(save.elements, state.mix)) return false;
      save.elements = pay(save.elements, state.mix);
      addMonster(save, r.kind);
      state.born = r.kind;
      // 同じ配合をもう一度作りやすいように、持っている分までに減らして残す
      for (const id of Object.keys(state.mix)) state.mix[id] = Math.min(state.mix[id], Math.floor(save.elements[id] ?? 0));
      api.persist();
      return true;
    }
    case 'codex-go': {
      const cost = codexCost(data.kind);
      if (!save.codex[data.kind] || !canPay(save.elements, cost)) return false;
      save.elements = pay(save.elements, cost);
      addMonster(save, data.kind);
      state.born = data.kind;
      api.persist();
      return true;
    }
    default:
      return false;
  }
}

function icon(kind) {
  const def = MONSTERS[kind];
  return `<span class="icon" style="background:${ELEMENT[def.element].color}">${def.name[0]}</span>`;
}

function whereIs(save, uid) {
  for (const [id, r] of Object.entries(save.regions)) if (r.layout.monsters.some((m) => m.uid === uid)) return REGIONS[id].name;
  return null;
}

function rosterView(api, state) {
  const { save } = api;
  if (!save.roster.length) return `<div class="card"><p>まだ仲間がいません。「錬成」で最初の仲間を作りましょう。</p></div>`;
  const list = save.roster
    .map((m) => {
      const def = MONSTERS[m.kind];
      const where = whereIs(save, m.uid);
      return `<button class="item ${state.selected === m.uid ? 'sel' : ''}" data-mact="select" data-uid="${m.uid}">
        ${icon(m.kind)}
        <span>${def.name} <b>Lv${m.level}</b></span>
        <span class="state ${where ? 'placed' : ''}">${where ? `${where}に配置中` : '待機'}</span>
        <span class="sub">${api.shapePreview(def.shape)}<span>${ELEMENT[def.element].name} · 攻撃${atkAt(m.kind, m.level).toFixed(1)} · 間隔${def.interval}秒 · 技「${def.skill}」</span></span>
      </button>`;
    })
    .join('');
  const sel = save.roster.find((m) => m.uid === state.selected);
  let detail = '<div class="card"><p class="hint">モンスターを選ぶと、くわしい情報とレベルアップが出ます。</p></div>';
  if (sel) {
    const def = MONSTERS[sel.kind];
    const atMax = sel.level >= LEVEL_CAP;
    const payment = atMax ? null : levelUpPayment(save.elements, def.element, sel.level);
    const cost = atMax ? 0 : levelUpCost(sel.level);
    detail = `<div class="card info">
      <h3>${def.name} <small>Lv${sel.level} / ${LEVEL_CAP}</small></h3>
      <div class="detail-shape">${api.shapePreview(def.shape, 12)}<span class="hint">攻撃範囲（上を向いたとき）</span></div>
      <p>属性：${ELEMENT[def.element].name} · 技「${def.skill}」</p>
      <p>攻撃 ${atkAt(sel.kind, sel.level).toFixed(1)}${atMax ? '' : ` → ${atkAt(sel.kind, sel.level + 1).toFixed(1)}`} · 間隔 ${def.interval}秒</p>
      ${
        atMax
          ? '<p class="hint">レベルの上限です（限界突破は研究で解放されます）</p>'
          : `<p>レベルアップ：第1地方のエレメント ${cost}（${ELEMENT[def.element].name}から先に使う）</p>
             <p class="hint">${payment ? `使う内訳：${api.costText(payment)}` : 'エレメントが足りません'}</p>
             <button class="primary" data-mact="levelup" data-uid="${sel.uid}" ${payment ? '' : 'disabled'}>レベルアップ</button>`
      }
    </div>`;
  }
  return `<div class="two-col"><div class="card"><div class="list">${list}</div></div><div>${detail}</div></div>`;
}

function mixView(api, state) {
  const { save } = api;
  const total = Object.values(state.mix).reduce((a, b) => a + b, 0);
  const rows = MIX_ELEMENTS.map((id) => {
    const n = state.mix[id] ?? 0;
    const have = Math.floor(save.elements[id] ?? 0);
    return `<div class="mix-row">
      ${api.chip(id, ELEMENT[id].name)}
      <span class="have">持っている ${have}</span>
      <button data-mact="mix-add" data-id="${id}" data-n="-5" ${n ? '' : 'disabled'}>−5</button>
      <button data-mact="mix-add" data-id="${id}" data-n="-1" ${n ? '' : 'disabled'}>−1</button>
      <b class="amount">${n}</b>
      <button data-mact="mix-add" data-id="${id}" data-n="1" ${n < have ? '' : 'disabled'}>+1</button>
      <button data-mact="mix-add" data-id="${id}" data-n="5" ${n < have ? '' : 'disabled'}>+5</button>
    </div>`;
  }).join('');
  const r = mixResult(state.mix);
  let preview;
  if (!r.kind) preview = `<p class="hint">${r.reason}</p>`;
  else if (save.codex[r.kind]) preview = `<p>生まれるモンスター：${icon(r.kind)} <b>${MONSTERS[r.kind].name}</b></p>`;
  else preview = `<p>生まれるモンスター：<b>？？？</b>（まだ図鑑にない）</p>`;
  const born = state.born ? `<div class="card born">${icon(state.born)} <b>${MONSTERS[state.born].name}</b> が生まれました！ 手持ちに加わり、図鑑に載りました。</div>` : '';
  const others = ELEMENTS.filter((e) => !MIX_ELEMENTS.includes(e.id) && save.elements[e.id] > 0);
  return `${born}<div class="card">
    <h3>調合錬成 <small>合計${MIX_MIN_TOTAL}〜${MIX_MAX_TOTAL}</small></h3>
    <p class="hint">エレメントの配合で、生まれるモンスターが決まります。決め手は「一番多いエレメント」「二番目に多いエレメント」「使ったエレメントの種類の数」。</p>
    ${rows}
    <p>合計 <b>${total}</b></p>
    ${preview}
    <div class="row"><button class="primary" data-mact="mix-go" ${r.kind ? '' : 'disabled'}>錬成する</button><button data-mact="mix-clear">空にする</button></div>
    ${others.length ? '<p class="hint">第2地方以降のエレメントの配合は、まだ表にありません。</p>' : ''}
  </div>`;
}

function recipeText(r) {
  const n = (id) => ELEMENT[id].name;
  if (r.special) return `${Object.keys(r.special).map(n).join('・')}を同じ量ずつ`;
  if (r.types === 1) return `${n(r.first)}だけ`;
  if (r.types === 2) return `${n(r.first)}が一番多く、${n(r.second)}が二番目`;
  return `無・風・土の3種類で、${n(r.first)}が一番多い`;
}

function codexView(api, state) {
  const { save } = api;
  const born = state.born ? `<div class="card born">${icon(state.born)} <b>${MONSTERS[state.born].name}</b> を図鑑錬成しました。</div>` : '';
  // 図鑑の並び：ふつうの表の順、特殊なモンスターは最後
  const order = [...RECIPES.filter((r) => !r.special), ...RECIPES.filter((r) => r.special)];
  const cards = order.map((r, i) => {
    const def = MONSTERS[r.kind];
    if (!save.codex[r.kind]) {
      const hint = r.special ? HINTS.special : HINTS[`types${r.types}`];
      return `<div class="card codex unknown"><h3>No.${i + 1} ？？？</h3><p class="hint">${hint}</p></div>`;
    }
    const cost = codexCost(r.kind);
    return `<div class="card codex">
      <h3>No.${i + 1} ${def.name} ${def.special ? '<span class="badge">特殊</span>' : ''}</h3>
      <div class="detail-shape">${api.shapePreview(def.shape)}<span>${ELEMENT[def.element].name} · 攻撃${def.atk} · 間隔${def.interval}秒 · 技「${def.skill}」</span></div>
      <p class="hint">作り方：${recipeText(r)}</p>
      <div class="row"><button data-mact="codex-go" data-kind="${r.kind}" ${canPay(save.elements, cost) ? '' : 'disabled'}>図鑑錬成</button>${api.costText(cost)}</div>
    </div>`;
  }).join('');
  return `${born}<p class="hint">一度手に入れたモンスターは図鑑に載り、図鑑錬成で決まった量のエレメントから作れます。</p><div class="codex-grid">${cards}</div>`;
}
