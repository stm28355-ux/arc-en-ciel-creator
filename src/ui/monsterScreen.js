// モンスター画面：手持ち（レベルアップ・進化）・錬成（調合錬成）・融合（技の継承）・図鑑（図鑑錬成）。
import { ELEMENT, ELEMENTS } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { RECIPES, HINTS, MIX_MIN_TOTAL, MIX_MAX_TOTAL } from '../data/recipes.js';
import { REGIONS } from '../data/regions.js';
import { EVOLUTIONS, EVOLVED_FROM } from '../data/evolutions.js';
import { mixResult, canPay, pay, codexCost, levelUpCost, levelUpPayment, atkAt, LEVEL_CAP, LEVEL_ELEMENTS } from '../core/alchemy.js';
import { addMonster } from '../core/save.js';
import { skillsOf, fusionCandidates, inheritableSkills, fuse, evolutionOf, evolutionProgress, evolve, MAX_SKILLS } from '../core/breeding.js';

const MIX_ELEMENTS = LEVEL_ELEMENTS; // 今の表で使えるのは第1地方の3属性

/**
 * api = { save, persist(), confirm(text), chip(id, text), costText(cost), shapePreview(rows, size) }
 * state = { tab: 'roster'|'mix'|'fuse'|'codex', selected: uid|null, mix: {id: n}, born: kind|null,
 *           fuse: { a: uid|null, b: uid|null, kind: kind|null, extra: [skill] } }
 */
export function renderMonsterScreen(root, api, state) {
  const { save } = api;
  state.fuse ??= { a: null, b: null, kind: null, extra: [] };
  const tabs = [
    ['roster', `手持ち（${save.roster.length}）`],
    ['mix', '錬成'],
    ['fuse', '融合'],
    ['codex', `図鑑（${Object.keys(save.codex).length}/${Object.keys(MONSTERS).length}）`],
  ]
    .map(([v, t]) => `<button data-mact="tab" data-v="${v}" class="${state.tab === v ? 'on' : ''}">${t}</button>`)
    .join('');
  let body = '';
  if (state.tab === 'roster') body = rosterView(api, state);
  else if (state.tab === 'mix') body = mixView(api, state);
  else if (state.tab === 'fuse') body = fuseView(api, state);
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
    case 'evolve': {
      const m = save.roster.find((r) => r.uid === data.uid);
      if (!m || !evolutionProgress(m)?.ok) return false;
      const to = MONSTERS[EVOLUTIONS[m.kind].to].name;
      if (!api.confirm(`${MONSTERS[m.kind].name}を${to}に進化させますか？ レベルは1に戻ります。`)) return false;
      evolve(save, m.uid);
      api.persist();
      return true;
    }
    case 'mix-add': {
      const id = data.id;
      const n = Number(data.n);
      const cur = state.mix[id] ?? 0;
      const total = Object.values(state.mix).reduce((a, b) => a + b, 0);
      const have = Math.floor(save.elements[id] ?? 0);
      state.mix[id] = Math.max(0, Math.min(cur + n, have, cur + (MIX_MAX_TOTAL - total)));
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
      addMonster(save, r.kind, r.level);
      state.born = r.kind;
      // 同じ配合をもう一度作りやすいように、持っている分までに減らして残す
      for (const id of Object.keys(state.mix)) state.mix[id] = Math.min(state.mix[id], Math.floor(save.elements[id] ?? 0));
      api.persist();
      return true;
    }
    case 'fuse-pick': {
      const f = state.fuse;
      const uid = data.uid;
      if (f.a === uid) f.a = null;
      else if (f.b === uid) f.b = null;
      else if (!f.a) f.a = uid;
      else f.b = uid;
      f.kind = null;
      f.extra = [];
      state.born = null;
      return true;
    }
    case 'fuse-kind':
      state.fuse.kind = data.kind;
      state.fuse.extra = [];
      return true;
    case 'fuse-skill': {
      const f = state.fuse;
      if (f.extra.includes(data.skill)) f.extra = f.extra.filter((k) => k !== data.skill);
      else if (f.extra.length < MAX_SKILLS - 1) f.extra.push(data.skill);
      return true;
    }
    case 'fuse-go': {
      const f = state.fuse;
      if (!f.a || !f.b || !f.kind) return false;
      const a = save.roster.find((m) => m.uid === f.a);
      const b = save.roster.find((m) => m.uid === f.b);
      const text = `${MONSTERS[a.kind].name} Lv${a.level} と ${MONSTERS[b.kind].name} Lv${b.level} を融合して、${MONSTERS[f.kind].name}（Lv1）にしますか？ 2体は消えます。`;
      if (!api.confirm(text)) return false;
      const child = fuse(save, f.a, f.b, f.kind, f.extra);
      state.born = child.kind;
      state.fuse = { a: null, b: null, kind: null, extra: [] };
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

const skillNames = (m) => skillsOf(m).map((k) => MONSTERS[k].skill).join('・');

// ---------- 手持ち ----------

function rosterView(api, state) {
  const { save } = api;
  if (!save.roster.length) return `<div class="card"><p>まだ仲間がいません。「錬成」で最初の仲間を作りましょう。</p></div>`;
  const list = save.roster
    .map((m) => {
      const def = MONSTERS[m.kind];
      const where = whereIs(save, m.uid);
      const n = skillsOf(m).length;
      const evo = evolutionProgress(m)?.ok ? ' <span class="badge">進化できる</span>' : '';
      return `<button class="item ${state.selected === m.uid ? 'sel' : ''}" data-mact="select" data-uid="${m.uid}">
        ${icon(m.kind)}
        <span>${def.name} <b>Lv${m.level}</b>${n > 1 ? ` <small>技${n}</small>` : ''}${evo}</span>
        <span class="state ${where ? 'placed' : ''}">${where ? `${where}に配置中` : '待機'}</span>
        <span class="sub">${api.shapePreview(def.shape)}<span>${ELEMENT[def.element].name} · 技「${skillNames(m)}」</span></span>
      </button>`;
    })
    .join('');
  const sel = save.roster.find((m) => m.uid === state.selected);
  let detail = '<div class="card"><p class="hint">モンスターを選ぶと、くわしい情報・レベルアップ・進化が出ます。</p></div>';
  if (sel) {
    const def = MONSTERS[sel.kind];
    const atMax = sel.level >= LEVEL_CAP;
    const payment = atMax ? null : levelUpPayment(save.elements, def.element, sel.level);
    const cost = atMax ? 0 : levelUpCost(sel.level);
    detail = `<div class="card info">
      <h3>${def.name} <small>Lv${sel.level} / ${LEVEL_CAP}</small></h3>
      <p>属性：${ELEMENT[def.element].name}</p>
      ${skillsBlock(api, sel)}
      ${
        atMax
          ? '<p class="hint">レベルの上限です（限界突破は研究で解放されます）</p>'
          : `<p>レベルアップ：第1地方のエレメント ${cost}（${ELEMENT[def.element].name}から先に使う）。攻撃 +8%</p>
             <p class="hint">${payment ? `使う内訳：${api.costText(payment)}` : 'エレメントが足りません'}</p>
             <button class="primary" data-mact="levelup" data-uid="${sel.uid}" ${payment ? '' : 'disabled'}>レベルアップ</button>`
      }
    </div>${evolutionBlock(sel)}`;
  }
  return `<div class="two-col"><div class="card"><div class="list">${list}</div></div><div>${detail}</div></div>`;
}

function skillsBlock(api, m) {
  const rows = skillsOf(m)
    .map((k, i) => {
      const d = MONSTERS[k];
      return `<div class="detail-shape">${api.shapePreview(d.shape, 9)}<span>${i === 0 ? '自分の技' : '引き継いだ技'}「${d.skill}」<br>攻撃 ${atkAt(k, m.level).toFixed(1)} · 間隔 ${d.interval}秒</span></div>`;
    })
    .join('');
  return `<p>技（${skillsOf(m).length}/${MAX_SKILLS}）<span class="hint">：技ごとに別々に攻撃します。範囲は上を向いたとき</span></p>${rows}`;
}

function evolutionBlock(m) {
  const e = evolutionOf(m);
  if (!e) return '';
  const p = evolutionProgress(m);
  return `<div class="card info">
    <h3>進化 <small>→ ${MONSTERS[e.to].name}</small></h3>
    <p>条件：${e.text}（${p.have}/${p.need}）</p>
    <div class="bar"><i style="width:${(100 * p.have) / p.need}%"></i></div>
    <p class="hint">進化するとレベルは1に戻ります。自分の技は進化後の技に変わり、引き継いだ技は残ります。</p>
    <button class="primary" data-mact="evolve" data-uid="${m.uid}" ${p.ok ? '' : 'disabled'}>進化する</button>
  </div>`;
}

// ---------- 調合錬成 ----------

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
  else {
    const who = save.codex[r.kind] ? `${icon(r.kind)} <b>${MONSTERS[r.kind].name}</b>` : '<b>？？？</b>（まだ図鑑にない）';
    const next = r.level < LEVEL_CAP ? `（あと${levelUpCost(r.level) - r.waste}入れるとLv${r.level + 1}）` : '';
    preview = `<p>生まれるモンスター：${who} · <b>Lv${r.level}</b> ${next}</p>`;
  }
  const born = state.born ? `<div class="card born">${icon(state.born)} <b>${MONSTERS[state.born].name}</b> が生まれました！ 手持ちに加わり、図鑑に載りました。</div>` : '';
  const others = ELEMENTS.filter((e) => !MIX_ELEMENTS.includes(e.id) && save.elements[e.id] > 0);
  return `${born}<div class="card">
    <h3>調合錬成 <small>合計${MIX_MIN_TOTAL}〜${MIX_MAX_TOTAL}</small></h3>
    <p class="hint">エレメントの配合で、生まれるモンスターが決まります。決め手は「一番多いエレメント」「二番目に多いエレメント」「使ったエレメントの種類の数」。合計${MIX_MIN_TOTAL}を超えた分は、レベルアップの値段どおりに生まれるレベルになります。</p>
    ${rows}
    <p>合計 <b>${total}</b></p>
    ${preview}
    <div class="row"><button class="primary" data-mact="mix-go" ${r.kind ? '' : 'disabled'}>錬成する</button><button data-mact="mix-clear">空にする</button></div>
    ${others.length ? '<p class="hint">第2地方以降のエレメントの配合は、まだ表にありません。</p>' : ''}
  </div>`;
}

// ---------- 融合 ----------

function fuseView(api, state) {
  const { save } = api;
  const f = state.fuse;
  const born = state.born ? `<div class="card born">${icon(state.born)} <b>${MONSTERS[state.born].name}</b> が生まれました！</div>` : '';
  if (save.roster.length < 2) return `${born}<div class="card"><p>融合には手持ちが2体以上いります。</p></div>`;
  const list = save.roster
    .map((m) => {
      const tag = f.a === m.uid ? '親1' : f.b === m.uid ? '親2' : '';
      return `<button class="item ${tag ? 'sel' : ''}" data-mact="fuse-pick" data-uid="${m.uid}">
        ${icon(m.kind)}<span>${MONSTERS[m.kind].name} Lv${m.level}</span><span class="state placed">${tag}</span>
        <span class="sub">技「${skillNames(m)}」</span>
      </button>`;
    })
    .join('');
  let right = '<div class="card"><p class="hint">左から2体を選んでください（親1・親2）。2体は消えて、Lv1の1体が生まれます。</p></div>';
  if (f.a && f.b) {
    const a = save.roster.find((m) => m.uid === f.a);
    const b = save.roster.find((m) => m.uid === f.b);
    const kinds = fusionCandidates(a, b)
      .map((k) => {
        const from = k === a.kind || k === b.kind ? '親と同じ' : '配合から';
        return `<button class="item ${f.kind === k ? 'sel' : ''}" data-mact="fuse-kind" data-kind="${k}">${icon(k)}<span>${MONSTERS[k].name}</span><span class="state">${from}</span></button>`;
      })
      .join('');
    let skills = '';
    if (f.kind) {
      const pool = inheritableSkills(a, b, f.kind);
      const items = pool.length
        ? pool
            .map((k) => {
              const d = MONSTERS[k];
              const on = f.extra.includes(k);
              return `<button class="item ${on ? 'sel' : ''}" data-mact="fuse-skill" data-skill="${k}">${api.shapePreview(d.shape)}<span>「${d.skill}」</span><span class="state">${on ? '引き継ぐ' : ''}</span><span class="sub">攻撃${d.atk} · 間隔${d.interval}秒（${d.name}の技）</span></button>`;
            })
            .join('')
        : '<p class="hint">引き継げる技はありません</p>';
      skills = `<div class="card"><h3>引き継ぐ技 <small>あと${MAX_SKILLS - 1 - f.extra.length}つ選べる</small></h3>
        <p>自分の技「${MONSTERS[f.kind].skill}」は必ず持ちます。</p>
        <div class="list">${items}</div>
        <div class="row" style="margin-top:8px"><button class="primary" data-mact="fuse-go">融合する</button><span class="hint">2体は消え、Lv1で生まれます</span></div>
      </div>`;
    }
    right = `<div class="card"><h3>生まれるモンスター <small>1つ選ぶ</small></h3><div class="list">${kinds}</div>
      <p class="hint">親と同じモンスターのままにもできます。「配合から」は、2体のもとになるエレメントを合わせた調合の結果です。</p></div>${skills}`;
  }
  return `${born}<div class="two-col"><div class="card"><h3>手持ち <small>2体選ぶ</small></h3><div class="list">${list}</div></div><div>${right}</div></div>`;
}

// ---------- 図鑑 ----------

function recipeText(r) {
  const n = (id) => ELEMENT[id].name;
  if (r.evolved) return `${MONSTERS[r.from].name}が進化（${EVOLUTIONS[r.from].text}）`;
  if (r.special) return `${Object.keys(r.special).map(n).join('・')}を同じ量ずつ`;
  if (r.types === 1) return `${n(r.first)}だけ`;
  if (r.types === 2) return `${n(r.first)}が一番多く、${n(r.second)}が二番目`;
  return `無・風・土の3種類で、${n(r.first)}が一番多い`;
}

function codexView(api, state) {
  const { save } = api;
  const born = state.born ? `<div class="card born">${icon(state.born)} <b>${MONSTERS[state.born].name}</b> を図鑑錬成しました。</div>` : '';
  // 図鑑の並び：ふつうの表の順、特殊、進化で手に入るもの
  const evolved = Object.values(EVOLUTIONS).map((e) => ({ kind: e.to, evolved: true, from: EVOLVED_FROM[e.to] }));
  const order = [...RECIPES.filter((r) => !r.special), ...RECIPES.filter((r) => r.special), ...evolved];
  const cards = order
    .map((r, i) => {
      const def = MONSTERS[r.kind];
      if (!save.codex[r.kind]) {
        const hint = r.evolved ? HINTS.evolved : r.special ? HINTS.special : HINTS[`types${r.types}`];
        return `<div class="card codex unknown"><h3>No.${i + 1} ？？？</h3><p class="hint">${hint}</p></div>`;
      }
      const cost = codexCost(r.kind);
      const badge = def.special ? '<span class="badge">特殊</span>' : def.evolved ? '<span class="badge">進化</span>' : '';
      return `<div class="card codex">
      <h3>No.${i + 1} ${def.name} ${badge}</h3>
      <div class="detail-shape">${api.shapePreview(def.shape)}<span>${ELEMENT[def.element].name} · 攻撃${def.atk} · 間隔${def.interval}秒 · 技「${def.skill}」</span></div>
      <p class="hint">作り方：${recipeText(r)}</p>
      <div class="row"><button data-mact="codex-go" data-kind="${r.kind}" ${canPay(save.elements, cost) ? '' : 'disabled'}>図鑑錬成</button>${api.costText(cost)}</div>
    </div>`;
    })
    .join('');
  return `${born}<p class="hint">一度手に入れたモンスターは図鑑に載り、図鑑錬成で決まった量のエレメントから作れます。</p><div class="codex-grid">${cards}</div>`;
}
