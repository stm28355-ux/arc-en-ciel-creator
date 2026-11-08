// モンスター画面：手持ち（レベルアップ・進化）・錬成（調合錬成）・融合（技の継承）・図鑑（図鑑錬成）。
import { ELEMENT, ELEMENTS } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { RECIPES, HINTS, MIX_MIN_TOTAL, MIX_MAX_TOTAL } from '../data/recipes.js';
import { FAMILY_ORDER, RARE_FUSIONS, familyName } from '../data/families.js';
import { REGIONS } from '../data/regions.js';
import { EVOLUTIONS, EVOLVED_FROM } from '../data/evolutions.js';
import { mixResult, canPay, pay, codexCost, levelUpCost, levelUpPayment, levelElements, atkAt, LEVEL_CAP, LEVEL_ELEMENTS, LEVEL_TIER2_FROM } from '../core/alchemy.js';
import { levelCap, researchedLevel } from '../core/research.js';
import { addMonster } from '../core/save.js';
import { skillsOf, fusionCandidates, fusionRule, fusionMembers, inheritableSkills, fuse, evolutionOf, evolutionProgress, evolve, MAX_SKILLS } from '../core/breeding.js';

const MIX_ELEMENTS = LEVEL_ELEMENTS; // 今の表で使えるのは第1地方の3属性

/**
 * api = { save, persist(), rerender(), confirm(text, onYes, yesLabel), chip(id, text), costText(cost), shapePreview(rows, size) }
 *   confirm はページの中に確認を出し、「はい」のときだけ onYes を呼ぶ（すぐには返らない）
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
      if (!m || m.level >= levelCap(save)) return false;
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
      api.confirm(
        `${MONSTERS[m.kind].name}を${to}に進化させますか？ レベルは1に戻ります。`,
        () => {
          evolve(save, m.uid);
          api.persist();
          api.rerender();
        },
        '進化する',
      );
      return false;
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
      const childName = save.codex[f.kind] ? MONSTERS[f.kind].name : '？？？';
      const text = `${MONSTERS[a.kind].name} Lv${a.level} と ${MONSTERS[b.kind].name} Lv${b.level} を融合して、${childName}（Lv1）にしますか？ 2体は消えます。`;
      api.confirm(
        text,
        () => {
          const child = fuse(save, f.a, f.b, f.kind, f.extra);
          state.born = child.kind;
          state.fuse = { a: null, b: null, kind: null, extra: [] };
          api.persist();
          api.rerender();
        },
        '融合する',
      );
      return false;
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

function unknownIcon() {
  return '<span class="icon" style="background:#4a4a55;color:#ddd">？</span>';
}

/** 「ゲル系・位階3」 */
const famRank = (kind) => `${familyName(MONSTERS[kind].family)}・位階${MONSTERS[kind].rank}`;

const HOW_LABEL = { rare: '特別な組み合わせ！', rule: '融合のルール', parent: '親と同じ' };

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
    const cap = levelCap(save);
    const atMax = sel.level >= cap;
    const tier = sel.level >= LEVEL_TIER2_FROM ? '第2地方（水・雷）' : '第1地方';
    const order = levelElements(sel.level).includes(def.element) ? `${ELEMENT[def.element].name}から先に使う` : '多く持っているものから使う';
    const nextLimit = cap >= 40 ? null : cap >= 30 ? ['limit2', '限界突破 II', 40] : ['limit1', '限界突破 I', 30];
    const maxText = !nextLimit
      ? 'レベルの上限です'
      : researchedLevel(save, nextLimit[0])
        ? `レベルの上限です（研究「${nextLimit[1]}」を OFF にしています）`
        : `レベルの上限です（研究「${nextLimit[1]}」で${nextLimit[2]}まで上がります）`;
    const payment = atMax ? null : levelUpPayment(save.elements, def.element, sel.level);
    const cost = atMax ? 0 : levelUpCost(sel.level);
    detail = `<div class="card info">
      <h3>${def.name} <small>Lv${sel.level} / ${cap}</small></h3>
      ${sel.level > cap ? `<p class="hint">研究「限界突破」が OFF なので、戦闘では Lv${cap} として戦います</p>` : ''}
      <p>属性：${ELEMENT[def.element].name} · ${famRank(sel.kind)}</p>
      ${skillsBlock(api, sel)}
      ${
        atMax
          ? `<p class="hint">${maxText}</p>`
          : `<p>レベルアップ：${tier}のエレメント ${cost}（${order}）。攻撃 +8%</p>
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
        <span class="sub">${famRank(m.kind)} · 技「${skillNames(m)}」</span>
      </button>`;
    })
    .join('');
  let right = '<div class="card"><p class="hint">左から2体を選んでください（親1・親2）。2体は消えて、Lv1の1体が生まれます。</p></div>';
  if (f.a && f.b) {
    const a = save.roster.find((m) => m.uid === f.a);
    const b = save.roster.find((m) => m.uid === f.b);
    const A = MONSTERS[a.kind];
    const B = MONSTERS[b.kind];
    const rule = fusionRule(a.kind, b.kind);
    const kinds = fusionCandidates(a, b)
      .map(({ kind: k, how }) => {
        const who = save.codex[k] ? `${icon(k)}<span>${MONSTERS[k].name}</span>` : `${unknownIcon()}<span>？？？</span>`;
        return `<button class="item ${f.kind === k ? 'sel' : ''}" data-mact="fuse-kind" data-kind="${k}">${who}<span class="state ${how === 'rare' ? 'placed' : ''}">${HOW_LABEL[how]}</span><span class="sub">${famRank(k)}</span></button>`;
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
      const own = save.codex[f.kind] ? `自分の技「${MONSTERS[f.kind].skill}」` : '自分の技（生まれるまでわかりません）';
      skills = `<div class="card"><h3>引き継ぐ技 <small>あと${MAX_SKILLS - 1 - f.extra.length}つ選べる</small></h3>
        <p>${own}は必ず持ちます。</p>
        <div class="list">${items}</div>
        <div class="row" style="margin-top:8px"><button class="primary" data-mact="fuse-go">融合する</button><span class="hint">2体は消え、Lv1で生まれます</span></div>
      </div>`;
    }
    right = `<div class="card"><h3>生まれるモンスター <small>1つ選ぶ</small></h3><div class="list">${kinds}</div>
      <p class="rule-line">${familyName(A.family)}（位階${A.rank}）× ${familyName(B.family)}（位階${B.rank}）→ <b>${familyName(rule.family)}・位階${rule.rank}</b></p>
      <p class="hint">融合のルール：子の系統は2体の系統の組み合わせで、位階は2体の位階の平均（切り捨て）＋1で決まります。その系統で、位階がそれ以上の一番近い「融合でしか生まれないモンスター」が生まれます。親と同じモンスターのままにもできます。</p></div>${skills}`;
  }
  return `${born}<div class="two-col"><div class="card"><h3>手持ち <small>2体選ぶ</small></h3><div class="list">${list}</div></div><div>${right}</div></div>`;
}

// ---------- 図鑑 ----------

const ACQ_ORDER = (d) => (d.rare ? 4 : d.fusion ? 3 : d.evolved ? 2 : d.special ? 1 : 0);
const BADGE = (d) => (d.rare ? 'レア' : d.fusion ? '融合' : d.evolved ? '進化' : d.special ? '特殊' : '');

/** 融合のルールで、そのモンスターが生まれる子の位階の範囲 */
function fusionRangeText(kind) {
  const d = MONSTERS[kind];
  const members = fusionMembers(d.family);
  const i = members.indexOf(kind);
  const lo = i > 0 ? MONSTERS[members[i - 1]].rank + 1 : null;
  const hi = i < members.length - 1 ? d.rank : null;
  if (!lo && !hi) return `${familyName(d.family)}になる融合なら、子の位階に関係なく`;
  const range = lo && hi ? (lo === hi ? `${hi}` : `${lo}〜${hi}`) : hi ? `${hi}以下` : `${lo}以上`;
  return `${familyName(d.family)}になる融合で、子の位階が${range}`;
}

function recipeText(kind) {
  const d = MONSTERS[kind];
  const n = (id) => ELEMENT[id].name;
  if (d.evolved) {
    const from = EVOLVED_FROM[kind];
    return `${MONSTERS[from].name}が進化（${EVOLUTIONS[from].text}）`;
  }
  if (d.fusion) return fusionRangeText(kind);
  if (d.rare) {
    const [p, q] = RARE_FUSIONS.find((r) => r.kind === kind).parents;
    return `${MONSTERS[p].name}と${MONSTERS[q].name}を融合`;
  }
  const r = RECIPES.find((x) => x.kind === kind);
  if (r.special) return `${Object.keys(r.special).map(n).join('・')}を同じ量ずつ`;
  if (r.types === 1) return `${n(r.first)}だけ`;
  if (r.types === 2) return `${n(r.first)}が一番多く、${n(r.second)}が二番目`;
  return `無・風・土の3種類で、${n(r.first)}が一番多い`;
}

/** まだ手に入れていないモンスターのヒント */
function hintText(kind) {
  const d = MONSTERS[kind];
  if (d.evolved) return HINTS.evolved;
  if (d.fusion) return `${HINTS.fusion}（${fusionRangeText(kind)}）`;
  if (d.rare) return HINTS.rare;
  const r = RECIPES.find((x) => x.kind === kind);
  return r.special ? HINTS.special : HINTS[`types${r.types}`];
}

function codexCard(api, save, kind, no) {
  const def = MONSTERS[kind];
  if (!save.codex[kind]) return `<div class="card codex unknown"><h3>No.${no} ？？？ <small>位階${def.rank}</small></h3><p class="hint">${hintText(kind)}</p></div>`;
  const cost = codexCost(kind);
  const badge = BADGE(def) ? `<span class="badge">${BADGE(def)}</span>` : '';
  return `<div class="card codex">
      <h3>No.${no} ${def.name} <small>位階${def.rank}</small> ${badge}</h3>
      <div class="detail-shape">${api.shapePreview(def.shape)}<span>${ELEMENT[def.element].name} · 攻撃${def.atk} · 間隔${def.interval}秒 · 技「${def.skill}」</span></div>
      <p class="hint">作り方：${recipeText(kind)}</p>
      <div class="row"><button data-mact="codex-go" data-kind="${kind}" ${canPay(save.elements, cost) ? '' : 'disabled'}>図鑑錬成</button>${api.costText(cost)}</div>
    </div>`;
}

function codexView(api, state) {
  const { save } = api;
  const born = state.born ? `<div class="card born">${icon(state.born)} <b>${MONSTERS[state.born].name}</b> を図鑑錬成しました。</div>` : '';
  // 図鑑の並び：系統ごとに、位階の低い順（同じ位階なら 調合・特殊・進化・融合・レア の順）
  let no = 0;
  const missing = [];
  const sections = FAMILY_ORDER.map((fam) => {
    const members = Object.keys(MONSTERS)
      .filter((k) => MONSTERS[k].family === fam)
      .sort((x, y) => MONSTERS[x].rank - MONSTERS[y].rank || ACQ_ORDER(MONSTERS[x]) - ACQ_ORDER(MONSTERS[y]));
    if (!members.length) {
      missing.push(familyName(fam));
      return '';
    }
    const got = members.filter((k) => save.codex[k]).length;
    const cards = members.map((k) => codexCard(api, save, k, ++no)).join('');
    return `<h3 class="family-head">${familyName(fam)} <small>${got}/${members.length}</small></h3><div class="codex-grid">${cards}</div>`;
  }).join('');
  const rest = missing.length ? `<p class="hint">まだ見つかっていない系統：${missing.join('・')}（第2地方より先）</p>` : '';
  return `${born}<p class="hint">一度手に入れたモンスターは図鑑に載り、図鑑錬成で決まった量のエレメントから作れます。図鑑は系統ごとに、位階の順に並んでいます。</p>${sections}${rest}`;
}
