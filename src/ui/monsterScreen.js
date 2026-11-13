// モンスター画面：手持ち（レベルアップ・進化）・錬成（調合錬成）・融合（技の継承）・図鑑（図鑑錬成）。
// 手持ち・融合・図鑑は「パレット」（左のマス目にアイコンを並べる）と、右のくわしい情報の2つに分ける
// （2026-11-14 企画者の注文。参考はアトリエ系のコンテナ画面。モンスターが何体いても同じ形で選べる）。
import { ELEMENT, ELEMENTS } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { FLAVOR } from '../data/flavor.js';
import { spriteImg } from './spriteImage.js';
import { RECIPES, HINTS, MIX_MIN_TOTAL, MIX_MAX_TOTAL, MIX_ELEMENTS } from '../data/recipes.js';
import { FAMILY_ORDER, RARE_FUSIONS, familyName } from '../data/families.js';
import { REGIONS } from '../data/regions.js';
import { EVOLUTIONS, EVOLVED_FROM } from '../data/evolutions.js';
import { mixResult, canPay, pay, codexCost, levelUpCost, levelUpPlan, levelElements, atkAt, LEVEL_CAP, LEVEL_TIER2_FROM, LEVEL_TIER3_FROM, LEVEL_TIER4_FROM, LEVEL_TIER5_FROM } from '../core/alchemy.js';
import { levelCap, researchedLevel, mixElements, LIMITS } from '../core/research.js';
import { RESEARCH, MIX_UNLOCK } from '../data/research.js';
import { addMonster } from '../core/save.js';
import { skillsOf, fusionCandidates, fusionRule, fusionMembers, inheritableSkills, fuse, evolutionOf, evolutionProgress, evolve, MAX_SKILLS } from '../core/breeding.js';

/**
 * api = { save, persist(), rerender(), confirm(text, onYes, yesLabel), chip(id, text), costText(cost), shapePreview(rows, size) }
 *   confirm はページの中に確認を出し、「はい」のときだけ onYes を呼ぶ（すぐには返らない）
 * state = { tab: 'roster'|'mix'|'fuse'|'codex', selected: uid|null, mix: {id: n}, born: kind|null,
 *           fuse: { a: uid|null, b: uid|null, kind: kind|null, extra: [skill] },
 *           filter: 属性|'all'（手持ち・融合のパレット）, family: 系統|'all', codexSel: kind|null（図鑑） }
 */
export function renderMonsterScreen(root, api, state) {
  const { save } = api;
  state.fuse ??= { a: null, b: null, kind: null, extra: [] };
  state.filter ??= 'all';
  state.family ??= 'all';
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
  root.innerHTML = `<div class="pop"><div class="pop-tabs">${tabs}</div>${body}</div>`;
}

/** モンスター画面のボタン操作。戻り値 true で描き直す。 */
export function onMonsterAction(api, state, act, data) {
  const { save } = api;
  switch (act) {
    case 'tab':
      state.tab = data.v;
      state.born = null;
      return true;
    case 'filter':
      state.filter = data.v;
      return true;
    case 'family':
      state.family = data.v;
      return true;
    case 'select':
      state.selected = data.uid;
      state.born = null;
      return true;
    case 'codex-select':
      state.codexSel = data.kind;
      state.born = null;
      return true;
    case 'levelup': {
      // data.n：'1' / '10' / 'max'（上限まで）。払える分だけ上げる
      const m = save.roster.find((r) => r.uid === data.uid);
      if (!m) return false;
      const steps = data.n === 'max' ? Infinity : Number(data.n);
      const plan = levelUpPlan(save.elements, MONSTERS[m.kind].element, m.level, steps, levelCap(save));
      if (plan.to <= m.level) return false;
      save.elements = pay(save.elements, plan.payment);
      m.level = plan.to;
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
      if (!mixElements(save).includes(id)) return false;
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
      const allowed = mixElements(save);
      if (!r.kind || !canPay(save.elements, state.mix) || Object.entries(state.mix).some(([id, n]) => n > 0 && !allowed.includes(id))) return false;
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
    case 'fuse-clear':
      state.fuse = { a: null, b: null, kind: null, extra: [] };
      return true;
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
          state.selected = child.uid;
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

// ---------- 共通の部品 ----------

/** モンスターの絵（size の大きさ）。まだ絵がないときは属性の色の丸 */
function pic(kind, size = 32, look = 'ally', cls = 'sprite') {
  const def = MONSTERS[kind];
  return (
    spriteImg(kind, { size, look, cls }) ??
    `<span class="icon" style="width:${size}px;height:${size}px;background:${look === 'silhouette' ? '#4a4a55' : ELEMENT[def.element].color}">${look === 'silhouette' ? '？' : def.name[0]}</span>`
  );
}

/** 「ゲル系・位階3」 */
const famRank = (kind) => `${familyName(MONSTERS[kind].family)}・位階${MONSTERS[kind].rank}`;

const HOW_LABEL = { rare: '特別な組み合わせ！', rule: '融合のルール', parent: '親と同じ' };

function whereIs(save, uid) {
  for (const [id, r] of Object.entries(save.regions)) if (r.layout.monsters.some((m) => m.uid === uid)) return REGIONS[id].name;
  return null;
}

const skillNames = (m) => skillsOf(m).map((k) => MONSTERS[k].skill).join('・');

/**
 * パレット（左のマス目）。cells = [{ kind, look?, act, data: {name: value}, sel?, mark?, lv?, title }]
 * tabs = [{ v, label, on, act }]（上の絞りこみ）、foot = 下の一言
 */
function palette({ title, tabs = '', cells, foot = '' }) {
  const body = cells
    .map((c) => {
      const attrs = Object.entries(c.data ?? {})
        .map(([k, v]) => `data-${k}="${v}"`)
        .join(' ');
      return `<button class="pcell ${c.sel ? 'sel' : ''} ${c.dim ? 'dim' : ''}" data-mact="${c.act}" ${attrs} title="${c.title ?? ''}">
        ${pic(c.kind, 64, c.look ?? 'ally')}
        ${c.lv ? `<span class="plv">Lv${c.lv}</span>` : ''}
        ${c.mark ? `<span class="pmark">${c.mark}</span>` : ''}
        ${c.dot ? `<i class="pdot" style="background:${c.dot}"></i>` : ''}
      </button>`;
    })
    .join('');
  const empty = cells.length ? '' : '<p class="hint pempty">ここに出せるモンスターがいません</p>';
  return `<section class="palette">
    <h3 class="ptitle">${title}</h3>
    ${tabs ? `<div class="ptabs">${tabs}</div>` : ''}
    <div class="pgrid">${body}</div>${empty}
    ${foot ? `<p class="pfoot">${foot}</p>` : ''}
  </section>`;
}

/** 属性で絞りこむタブ（手持ち・融合） */
function elementTabs(state) {
  const all = `<button data-mact="filter" data-v="all" class="${state.filter === 'all' ? 'on' : ''}">すべて</button>`;
  return (
    all +
    ELEMENTS.map(
      (e) =>
        `<button data-mact="filter" data-v="${e.id}" class="dot-tab ${state.filter === e.id ? 'on' : ''}" title="${e.name}"><i style="background:${e.color}"></i>${e.name}</button>`,
    ).join('')
  );
}

function rosterCells(save, state, act, selOf) {
  return save.roster
    .filter((m) => state.filter === 'all' || MONSTERS[m.kind].element === state.filter)
    .map((m) => {
      const where = whereIs(save, m.uid);
      const evo = evolutionProgress(m)?.ok;
      const sel = selOf(m);
      return {
        kind: m.kind,
        act,
        data: { uid: m.uid },
        sel: !!sel,
        lv: m.level,
        mark: typeof sel === 'string' ? sel : evo ? '進化' : where ? '配置' : '',
        dot: ELEMENT[MONSTERS[m.kind].element].color,
        title: `${MONSTERS[m.kind].name} Lv${m.level}${where ? `（${where}に配置中）` : ''}`,
      };
    });
}

const bornBanner = (state, text) =>
  state.born ? `<div class="born-line">${pic(state.born, 32)} <b>${MONSTERS[state.born].name}</b> ${text}</div>` : '';

// ---------- 手持ち ----------

function rosterView(api, state) {
  const { save } = api;
  if (!save.roster.length) return `<div class="detail"><p>まだ仲間がいません。「錬成」で最初の仲間を作りましょう。</p></div>`;
  if (!save.roster.some((m) => m.uid === state.selected)) state.selected = save.roster[0].uid;
  const cells = rosterCells(save, state, 'select', (m) => m.uid === state.selected);
  const left = palette({ title: '手持ち', tabs: elementTabs(state), cells, foot: `${cells.length} / ${save.roster.length} 体` });
  const sel = save.roster.find((m) => m.uid === state.selected);
  return `<div class="palette-layout">${left}<section class="detail">${bornBanner(state, 'が生まれました！')}${rosterDetail(api, sel)}</section></div>`;
}

function rosterDetail(api, sel) {
  const { save } = api;
  const def = MONSTERS[sel.kind];
  const cap = levelCap(save);
  const where = whereIs(save, sel.uid);
  return `<div class="dhead">
      <div class="dpic">${pic(sel.kind, 128, 'ally', 'big-sprite')}</div>
      <div class="dname">
        <h2>${def.name}</h2>
        <div class="dlv"><span>Lv</span><b>${sel.level}</b><small>/ ${cap}</small></div>
        <p>${api.chip(def.element, ELEMENT[def.element].name)} <span class="tag">${famRank(sel.kind)}</span></p>
        <p class="hint">${where ? `${where}に配置中` : '待機中'} · 技${skillsOf(sel).length}つ</p>
      </div>
    </div>
    ${sel.level > cap ? `<p class="hint">研究「限界突破」が OFF なので、戦闘では Lv${cap} として戦います</p>` : ''}
    <p class="flavor">${FLAVOR[sel.kind]}</p>
    <h4 class="dsec">技</h4>${skillsBlock(api, sel)}
    <h4 class="dsec">レベルアップ</h4>${levelUpBlock(api, sel, cap)}
    ${evolutionBlock(sel)}`;
}

function levelUpBlock(api, sel, cap) {
  const { save } = api;
  const def = MONSTERS[sel.kind];
  if (sel.level >= cap) {
    const nextIndex = LIMITS.findIndex(([, to]) => to > cap);
    const next = nextIndex < 0 ? null : [LIMITS[nextIndex][0], RESEARCH[LIMITS[nextIndex][0]].name, LIMITS[nextIndex][1]];
    const text = !next
      ? 'レベルの上限です'
      : researchedLevel(save, next[0])
        ? `レベルの上限です（研究「${next[1]}」を OFF にしています）`
        : `レベルの上限です（研究「${next[1]}」で${next[2]}まで上がります）`;
    return `<p class="hint">${text}</p>`;
  }
  const tier =
    sel.level >= LEVEL_TIER5_FROM
      ? 'どの地方のエレメントでも'
      : sel.level >= LEVEL_TIER4_FROM
        ? '第4地方（光・闇）のエレメント'
        : sel.level >= LEVEL_TIER3_FROM
          ? '第3地方（炎・氷）のエレメント'
          : sel.level >= LEVEL_TIER2_FROM
            ? '第2地方（水・雷）のエレメント'
            : '第1地方のエレメント';
  const order = levelElements(sel.level).includes(def.element) ? `${ELEMENT[def.element].name}から先に使う` : '多く持っているものから使う';
  const rows = [
    ['1', '+1'],
    ['10', '+10'],
    ['max', '上限まで'],
  ]
    .map(([n, label]) => {
      const plan = levelUpPlan(save.elements, def.element, sel.level, n === 'max' ? Infinity : Number(n), cap);
      const ok = plan.to > sel.level;
      return `<div class="lvrow">
        <button class="${n === '1' ? 'primary' : ''}" data-mact="levelup" data-uid="${sel.uid}" data-n="${n}" ${ok ? '' : 'disabled'}>${label}</button>
        <span>${ok ? `→ <b>Lv${plan.to}</b> ${api.costText(plan.payment)}` : '<span class="hint">エレメントが足りません</span>'}</span>
      </div>`;
    })
    .join('');
  return `<p class="hint">次のレベルまで ${levelUpCost(sel.level)}（${tier}。${order}）。1レベルで攻撃 +8%。まとめて上げるときは、払える分だけ上げます</p>${rows}`;
}

function skillsBlock(api, m) {
  return skillsOf(m)
    .map((k, i) => {
      const d = MONSTERS[k];
      return `<div class="detail-shape">${api.shapePreview(d.shape, 9)}<span>${i === 0 ? '自分の技' : '引き継いだ技'}「${d.skill}」<br><small>攻撃 ${atkAt(k, m.level).toFixed(1)} · 間隔 ${d.interval}秒</small></span></div>`;
    })
    .join('');
}

function evolutionBlock(m) {
  const e = evolutionOf(m);
  if (!e) return '';
  const p = evolutionProgress(m);
  return `<h4 class="dsec">進化 <small>→ ${MONSTERS[e.to].name}</small></h4>
    <p>条件：${e.text}（${p.have}/${p.need}）</p>
    <div class="bar"><i style="width:${(100 * p.have) / p.need}%"></i></div>
    <p class="hint">進化するとレベルは1に戻ります。自分の技は進化後の技に変わり、引き継いだ技は残ります。</p>
    <button class="primary" data-mact="evolve" data-uid="${m.uid}" ${p.ok ? '' : 'disabled'}>進化する</button>`;
}

// ---------- 調合錬成 ----------

function mixView(api, state) {
  const { save } = api;
  const total = Object.values(state.mix).reduce((a, b) => a + b, 0);
  const allowed = mixElements(save);
  const rows = MIX_ELEMENTS.map((id) => {
    const n = state.mix[id] ?? 0;
    const have = Math.floor(save.elements[id] ?? 0);
    if (!allowed.includes(id))
      return `<div class="mix-row locked">${api.chip(id, ELEMENT[id].name)}<span class="have">持っている ${have}</span><span class="hint">研究「${RESEARCH[MIX_UNLOCK[id]].name}」で使えるようになります</span></div>`;
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
    const who = save.codex[r.kind] ? `${pic(r.kind, 32)} <b>${MONSTERS[r.kind].name}</b>` : `${pic(r.kind, 32, 'silhouette')} <b>？？？</b>（まだ図鑑にない）`;
    const next = r.level < LEVEL_CAP ? `（あと${levelUpCost(r.level) - r.waste}入れるとLv${r.level + 1}）` : '';
    preview = `<p>生まれるモンスター：${who} · <b>Lv${r.level}</b> ${next}</p>`;
  }
  return `<section class="detail mix">${bornBanner(state, 'が生まれました！ 手持ちに加わり、図鑑に載りました。')}
    <h3>調合錬成 <small>合計${MIX_MIN_TOTAL}〜${MIX_MAX_TOTAL}</small></h3>
    <p class="hint">エレメントの配合で、生まれるモンスターが決まります。決め手は「一番多いエレメント」「二番目に多いエレメント」「使ったエレメントの種類の数」。合計${MIX_MIN_TOTAL}を超えた分は、レベルアップの値段どおりに生まれるレベルになります。</p>
    ${rows}
    <p>合計 <b>${total}</b></p>
    ${preview}
    <div class="row"><button class="primary" data-mact="mix-go" ${r.kind ? '' : 'disabled'}>錬成する</button><button data-mact="mix-clear">空にする</button></div>
  </section>`;
}

// ---------- 融合 ----------

function fuseView(api, state) {
  const { save } = api;
  const f = state.fuse;
  if (save.roster.length < 2) return `<section class="detail">${bornBanner(state, 'が生まれました！')}<p>融合には手持ちが2体以上いります。</p></section>`;
  const cells = rosterCells(save, state, 'fuse-pick', (m) => (f.a === m.uid ? '親1' : f.b === m.uid ? '親2' : false));
  const left = palette({ title: '手持ち <small>親を2体選ぶ</small>', tabs: elementTabs(state), cells, foot: '選んだモンスターをもう一度押すと外します' });
  const a = save.roster.find((m) => m.uid === f.a);
  const b = save.roster.find((m) => m.uid === f.b);
  const slot = (m, label) =>
    m
      ? `<div class="parent">${pic(m.kind, 64)}<div><small>${label}</small><b>${MONSTERS[m.kind].name}</b><span>Lv${m.level} · ${famRank(m.kind)}</span><span class="hint">技「${skillNames(m)}」</span></div></div>`
      : `<div class="parent empty"><div><small>${label}</small><span class="hint">左のパレットから選ぶ</span></div></div>`;
  let right = `<div class="parents">${slot(a, '親1')}<span class="times">×</span>${slot(b, '親2')}</div>`;
  if (a && b) {
    const A = MONSTERS[a.kind];
    const B = MONSTERS[b.kind];
    const rule = fusionRule(a.kind, b.kind);
    const kinds = fusionCandidates(a, b)
      .map(({ kind: k, how }) => {
        const known = save.codex[k];
        return `<button class="child ${f.kind === k ? 'sel' : ''}" data-mact="fuse-kind" data-kind="${k}">
          ${pic(k, 64, known ? 'ally' : 'silhouette')}
          <b>${known ? MONSTERS[k].name : '？？？'}</b>
          <small>${famRank(k)}</small>
          <span class="how ${how === 'rare' ? 'rare' : ''}">${HOW_LABEL[how]}</span>
        </button>`;
      })
      .join('');
    right += `<p class="rule-line">${familyName(A.family)}（位階${A.rank}）× ${familyName(B.family)}（位階${B.rank}）→ <b>${familyName(rule.family)}・位階${rule.rank}</b></p>
      <h4 class="dsec">生まれるモンスター <small>1つ選ぶ</small></h4><div class="children">${kinds}</div>`;
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
      right += `<h4 class="dsec">引き継ぐ技 <small>あと${MAX_SKILLS - 1 - f.extra.length}つ選べる</small></h4>
        <p>${own}は必ず持ちます。</p>
        <div class="list">${items}</div>
        <div class="row" style="margin-top:10px"><button class="primary" data-mact="fuse-go">融合する</button><span class="hint">2体は消え、Lv1で生まれます</span></div>`;
    }
  } else {
    right += '<p class="hint">2体は消えて、Lv1の1体が生まれます。融合のルール：子の系統は2体の系統の組み合わせで、位階は2体の位階の平均（切り捨て）＋1で決まります。その系統で、位階がそれ以上の一番近い「融合でしか生まれないモンスター」が生まれます。親と同じモンスターのままにもできます。</p>';
  }
  if (a || b) right += `<div class="row" style="margin-top:8px"><button data-mact="fuse-clear">選び直す</button></div>`;
  return `<div class="palette-layout">${left}<section class="detail">${bornBanner(state, 'が生まれました！')}${right}</section></div>`;
}

// ---------- 図鑑 ----------

const ACQ_ORDER = (d) => (d.rare ? 4 : d.fusion ? 3 : d.evolved ? 2 : d.special ? 1 : 0);
const BADGE = (d) => (d.rare ? 'レア' : d.fusion ? '融合' : d.evolved ? '進化' : d.special ? '特殊' : '');

/** 図鑑の並び：系統ごとに、位階の低い順（同じ位階なら 調合・特殊・進化・融合・レア の順）。No. はこの並びの番号 */
let codexOrderCache = null;
function codexOrder() {
  codexOrderCache ??= FAMILY_ORDER.flatMap((fam) =>
    Object.keys(MONSTERS)
      .filter((k) => MONSTERS[k].family === fam)
      .sort((x, y) => MONSTERS[x].rank - MONSTERS[y].rank || ACQ_ORDER(MONSTERS[x]) - ACQ_ORDER(MONSTERS[y])),
  );
  return codexOrderCache;
}

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
  if (r.special) return `調合錬成で、${Object.keys(r.special).map(n).join('・')}を同じ量ずつ`;
  if (r.types === 1) return `調合錬成で、${n(r.first)}だけ`;
  if (r.types === 2) return `調合錬成で、${n(r.first)}が一番多く、${n(r.second)}が二番目`;
  return `調合錬成で、3種類以上・${n(r.first)}が一番多い`;
}

/** まだ手に入れていないモンスターのヒント */
function hintText(kind) {
  const d = MONSTERS[kind];
  if (d.evolved) return HINTS.evolved;
  if (d.fusion) return `${HINTS.fusion}（${fusionRangeText(kind)}）`;
  if (d.rare) return HINTS.rare;
  const r = RECIPES.find((x) => x.kind === kind);
  return r.special ? (r.hint ?? HINTS.special) : HINTS[`types${r.types}`];
}

function codexView(api, state) {
  const { save } = api;
  const order = codexOrder();
  const no = new Map(order.map((k, i) => [k, i + 1]));
  if (!state.codexSel || !MONSTERS[state.codexSel]) state.codexSel = order.find((k) => save.codex[k]) ?? order[0];
  const famTabs =
    `<button data-mact="family" data-v="all" class="${state.family === 'all' ? 'on' : ''}">すべて</button>` +
    FAMILY_ORDER.map((fam) => {
      const members = order.filter((k) => MONSTERS[k].family === fam);
      const got = members.filter((k) => save.codex[k]).length;
      return `<button data-mact="family" data-v="${fam}" class="${state.family === fam ? 'on' : ''}">${familyName(fam)} <small>${got}/${members.length}</small></button>`;
    }).join('');
  const shown = order.filter((k) => state.family === 'all' || MONSTERS[k].family === state.family);
  const cells = shown.map((k) => ({
    kind: k,
    look: save.codex[k] ? 'ally' : 'silhouette',
    act: 'codex-select',
    data: { kind: k },
    sel: state.codexSel === k,
    dim: !save.codex[k],
    title: `No.${no.get(k)} ${save.codex[k] ? MONSTERS[k].name : '？？？'}`,
  }));
  const got = Object.keys(save.codex).length;
  const left = palette({ title: '図鑑', tabs: famTabs, cells, foot: `見つけたモンスター ${got} / ${order.length}` });
  return `<div class="palette-layout">${left}<section class="detail">${bornBanner(state, 'を図鑑錬成しました。手持ちに加わりました。')}${codexDetail(api, state.codexSel, no.get(state.codexSel))}</section></div>`;
}

function codexDetail(api, kind, n) {
  const { save } = api;
  const def = MONSTERS[kind];
  const known = !!save.codex[kind];
  const owned = save.roster.filter((m) => m.kind === kind).length;
  const head = `<div class="dhead">
      <div class="dpic">${pic(kind, 128, known ? 'ally' : 'silhouette', 'big-sprite')}</div>
      <div class="dname">
        <p class="hint">No.${n}</p>
        <h2>${known ? def.name : '？？？'} ${known && BADGE(def) ? `<span class="badge">${BADGE(def)}</span>` : ''}</h2>
        <p>${known ? api.chip(def.element, ELEMENT[def.element].name) : ''} <span class="tag">${famRank(kind)}</span></p>
        ${known ? `<p class="hint">手持ち ${owned}体</p>` : ''}
      </div>
    </div>`;
  if (!known) return `${head}<h4 class="dsec">ヒント</h4><p>${hintText(kind)}</p>`;
  const cost = codexCost(kind);
  const evo = EVOLUTIONS[kind];
  const evoText = evo ? `<h4 class="dsec">進化</h4><p>${save.codex[evo.to] ? MONSTERS[evo.to].name : '？？？'}に進化する：${evo.text}</p>` : '';
  return `${head}
    <p class="flavor">${FLAVOR[kind]}</p>
    <h4 class="dsec">技</h4>
    <div class="detail-shape">${api.shapePreview(def.shape, 9)}<span>「${def.skill}」<br><small>攻撃${def.atk} · 間隔${def.interval}秒（Lv1のとき）</small></span></div>
    <h4 class="dsec">作り方</h4><p>${recipeText(kind)}</p>
    ${evoText}
    <h4 class="dsec">図鑑錬成</h4>
    <div class="row"><button class="primary" data-mact="codex-go" data-kind="${kind}" ${canPay(save.elements, cost) ? '' : 'disabled'}>図鑑錬成</button>${api.costText(cost)}</div>`;
}
