// Arc-en-ciel Creator：画面の組み立てと操作。
import { ELEMENTS, ELEMENT, bagTotal, addBag } from './data/elements.js';
import { MONSTERS } from './data/monsters.js';
import { FACILITIES, FACILITY_ORDER, FACILITY_TYPE_NAME } from './data/facilities.js';
import { ENEMIES } from './data/enemies.js';
import { REGIONS, PROVINCES } from './data/regions.js';
import { parseMap } from './core/map.js';
import { canAfford } from './core/materials.js';
import { resolveLayout, canPlace, occupancy } from './core/layout.js';
import { nextDir, DIR_NAME } from './core/shape.js';
import { createBattle, startBattle, step, pace, paceBag, waveSummary, rechargeUnit } from './core/battle.js';
import { loadSave, writeSave, clearSave, regionSave, newSave } from './core/save.js';
import { draw, CELL, facilityIcon, FACILITY_COLOR } from './ui/render.js';
import { renderMonsterScreen, onMonsterAction } from './ui/monsterScreen.js';
import { recordBattle, skillsOf } from './core/breeding.js';

const VERSION = 'v0.4.2';
const STEP = 1 / 60;
const AUTO_RETRY_DELAY = 1500; // ミリ秒
// 自動で再挑戦している間の速さの上限。周回が攻略後の自動獲得より速くなりすぎないようにする
const AUTO_SPEED_CAP = 2;
const speedOf = (s) => (save.settings.autoRetry ? Math.min(s.speed, AUTO_SPEED_CAP) : s.speed);

const app = document.getElementById('app');
const bankEl = document.getElementById('bank');
document.getElementById('version').textContent = VERSION;

let save = loadSave();
let screen = { name: 'home' };
// モンスター画面の状態（画面を行き来しても残す）
const monsterState = { tab: 'roster', selected: null, mix: {}, born: null, fuse: null };
const navEl = document.getElementById('nav');
const guideEl = document.getElementById('guide');

// ---------- 持っているエレメントと、攻略済み地域からの自動の獲得（ページを開いている間だけ） ----------
function incomeBag() {
  let bag = {};
  for (const r of Object.values(save.regions)) if (r.cleared) bag = addBag(bag, r.paceBag);
  return bag;
}
function renderBank() {
  renderGuide();
  const inc = incomeBag();
  bankEl.innerHTML = ELEMENTS.map((e) => {
    const n = Math.floor(save.elements[e.id] ?? 0);
    const rate = inc[e.id] ?? 0;
    return `<span class="chip" title="${e.name}のエレメント"><span class="dot" style="background:${e.color}"></span>${e.name} ${n}${rate > 0 ? ` <small>+${rate.toFixed(2)}/秒</small>` : ''}</span>`;
  }).join('');
}
setInterval(() => {
  const inc = incomeBag();
  if (bagTotal(inc) > 0) {
    save.elements = addBag(save.elements, inc);
    writeSave(save);
  }
  renderBank();
}, 1000);

// ---------- ページの中に出す確認 ----------
// ブラウザの confirm() は、アプリ内のブラウザなどでは出ずに「キャンセル」扱いになることがあるので使わない
function askConfirm(text, onYes, yesLabel = 'はい') {
  const el = document.createElement('div');
  el.className = 'modal';
  el.innerHTML = `<div class="box" role="dialog" aria-modal="true"><p></p><div class="row"><button class="primary" data-yes>${yesLabel}</button><button data-no>やめる</button></div></div>`;
  el.querySelector('p').textContent = text;
  const close = () => {
    el.remove();
    window.removeEventListener('keydown', onKey, true);
  };
  const onKey = (ev) => {
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      close();
    }
  };
  el.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-yes]')) {
      close();
      onYes();
    } else if (ev.target.closest('[data-no]') || ev.target === el) close();
  });
  window.addEventListener('keydown', onKey, true);
  document.body.appendChild(el);
  el.querySelector('[data-yes]').focus();
}

document.getElementById('reset-save').addEventListener('click', () => askConfirm('セーブを消して、最初からにしますか？', resetSave, '消す'));
function resetSave() {
  clearSave();
  save = newSave();
  screen = { name: 'home' };
  Object.assign(monsterState, { tab: 'roster', selected: null, mix: {}, born: null, fuse: null });
  goHome();
}

// ---------- 共通の小さな部品 ----------
const chip = (id, text) => `<span class="chip"><span class="dot" style="background:${ELEMENT[id].color}"></span>${text}</span>`;
const costText = (cost) => Object.entries(cost).map(([id, n]) => chip(id, `${ELEMENT[id].name}${n}`)).join(' ');

/** 形の小さな図（上向き）。 */
function shapePreview(rows, size = 7) {
  const w = Math.max(...rows.map((r) => r.length));
  const cells = rows.flatMap((r) => [...r.padEnd(w, '.')]).map((c) => `<i class="s-${c === '.' ? 'n' : c}" style="width:${size}px;height:${size}px"></i>`);
  return `<span class="shape" style="grid-template-columns:repeat(${w},${size}px)" title="上を向いたときの範囲">${cells.join('')}</span>`;
}

// ---------- チュートリアルの案内 ----------
function guideStep() {
  if (save.roster.length === 0) return '最初の仲間を作りましょう。「モンスター」→「錬成」で、無のエレメントを10入れて「錬成する」を押します。';
  if (!save.ranOnce && save.roster.length < 3) return `仲間が1〜2体では草原のウェーブ1を越えられません。残りの無のエレメントで、あと${3 - save.roster.length}体作りましょう。`;
  if (!save.ranOnce) return '「地域」→「草原」で仲間をマスに置き、「戦闘開始」を押しましょう。負けても、手に入れたエレメントは持ち帰れます。';
  return null;
}
function renderGuide() {
  const step = guideStep();
  guideEl.innerHTML = step ? `<div class="guide"><b>はじめに</b> ${step}</div>` : '';
  for (const b of navEl.querySelectorAll('[data-nav]')) b.classList.toggle('on', (b.dataset.nav === 'monsters') === (screen.name === 'monsters'));
}

navEl.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-nav]');
  if (!b) return;
  if (b.dataset.nav === 'monsters') goMonsters();
  else goHome();
});

const monsterApi = {
  get save() {
    return save;
  },
  persist() {
    writeSave(save);
    renderBank();
  },
  confirm: (text, onYes, yesLabel) => askConfirm(text, onYes, yesLabel),
  rerender() {
    if (screen.name === 'monsters') renderMonsterScreen(app, monsterApi, monsterState);
  },
  chip,
  costText,
  shapePreview,
};

function goMonsters() {
  if (screen.name === 'map') leaveMap(screen);
  screen = { name: 'monsters' };
  renderBank();
  renderMonsterScreen(app, monsterApi, monsterState);
}

// ---------- ホーム：地方と地域の選択 ----------
function goHome() {
  if (screen.name === 'map') leaveMap(screen);
  screen = { name: 'home' };
  renderBank();
  window.scrollTo(0, 0);
  app.innerHTML = PROVINCES.map((p) => {
    const regions = p.regions
      .map((id) => {
        const r = REGIONS[id];
        const rs = save.regions[id];
        const els = r.elements.map((e) => chip(e, ELEMENT[e].name)).join(' ');
        const status = r.locked
          ? '<span class="badge locked">まだ作っていない</span>'
          : rs?.cleared
            ? `<span class="badge">攻略済み · 獲得ペース ${rs.bestPace.toFixed(2)}/秒</span>`
            : '<span class="badge locked">未攻略</span>';
        return `<button class="region-card" data-region="${id}" ${r.locked ? 'disabled' : ''}>
          <span class="name">${r.name}</span>
          <span>${els}</span>
          ${status}
          ${r.waves ? `<span class="meta">ウェーブ ${r.waves.length} · 拠点の耐久 ${r.baseHp}</span>` : ''}
        </button>`;
      })
      .join('');
    return `<section class="province"><h2>${p.name}</h2>${regions ? `<div class="regions">${regions}</div>` : `<p class="note">${p.note}（まだ作っていない）</p>`}</section>`;
  }).join('');
}

// ---------- 地域マップ ----------
function openRegion(regionId) {
  const region = REGIONS[regionId];
  const map = parseMap(region.map);
  const rs = regionSave(save, regionId);
  // 古いセーブには向きがないので上向きにする
  for (const it of [...rs.layout.monsters, ...rs.layout.facilities]) it.dir ??= 'up';
  rs.layout.monsters = rs.layout.monsters.filter((m) => save.roster.some((r) => r.uid === m.uid));
  save.settings ??= { autoRetry: false };
  const s = {
    name: 'map',
    region,
    map,
    rs,
    layout: rs.layout,
    battle: createBattle(region, map),
    banked: false,
    paused: false,
    speed: 1,
    runs: 0,
    sel: null, // {type:'monster', uid} | {type:'build', kind} | {type:'facility', id}
    placeDir: 'up',
    hover: null,
    tab: 'monster',
    resolved: null,
    result: null,
  };
  screen = s;
  refresh(s);
  app.innerHTML = `
    <div class="map-screen">
      <div>
        <div class="hud" id="hud"></div>
        <div class="canvas-wrap">
          <canvas id="cv" width="${map.w * CELL}" height="${map.h * CELL}"></canvas>
          <div id="overlay"></div>
        </div>
        <p class="hint" id="hint"></p>
      </div>
      <aside class="side" id="side"></aside>
    </div>`;
  const cv = document.getElementById('cv');
  s.ctx = cv.getContext('2d');
  cv.addEventListener('mousemove', (ev) => (s.hover = cellAt(cv, ev, map)));
  cv.addEventListener('mouseleave', () => (s.hover = null));
  cv.addEventListener('click', (ev) => onCellClick(s, cellAt(cv, ev, map)));
  cv.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    cancel(s);
  });
  renderHud(s);
  renderSide(s);
  requestAnimationFrame((t) => loop(s, t));
}

function leaveMap(s) {
  clearTimeout(s.autoTimer);
  bankRun(s);
}

app.addEventListener('click', (ev) => {
  const region = ev.target.closest('[data-region]');
  if (region && screen.name === 'home') return openRegion(region.dataset.region);
  const m = ev.target.closest('[data-mact]');
  if (m && screen.name === 'monsters') {
    if (onMonsterAction(monsterApi, monsterState, m.dataset.mact, m.dataset)) renderMonsterScreen(app, monsterApi, monsterState);
    return;
  }
  const el = ev.target.closest('[data-act]');
  if (el && screen.name === 'map') onAction(screen, el.dataset.act, el.dataset, el);
});
app.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (el && screen.name === 'map') onAction(screen, el.dataset.act, el.dataset, el);
});

window.addEventListener('keydown', (ev) => {
  if (screen.name !== 'map' || ev.target.closest?.('input,textarea')) return;
  const s = screen;
  if (ev.key === 'Escape') cancel(s);
  else if (ev.key === 'r' || ev.key === 'R') rotateSelection(s);
  else if (ev.key === ' ') {
    ev.preventDefault();
    onAction(s, s.battle.phase === 'ready' ? 'start' : 'pause', {});
  }
});

function cellAt(cv, ev, map) {
  const r = cv.getBoundingClientRect();
  const x = Math.floor(((ev.clientX - r.left) / r.width) * map.w);
  const y = Math.floor(((ev.clientY - r.top) / r.height) * map.h);
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  return { x, y };
}

/** 手持ちのレベルと技を配置に入れて計算する。 */
function withLevels(layout) {
  return { ...layout, monsters: layout.monsters.map(withRoster) };
}
function withRoster(m) {
  const r = save.roster.find((x) => x.uid === m.uid);
  return { ...m, level: r?.level ?? 1, skills: r ? skillsOf(r) : [m.kind] };
}

function refresh(s) {
  s.resolved = resolveLayout(s.map, withLevels(s.layout));
}

/** 配置が変わったあと。動かしたもの（ids）は攻撃の間隔を溜め直す。 */
function changed(s, ids = []) {
  refresh(s);
  for (const id of ids) for (const u of s.resolved.units.filter((u) => u.id === id || u.owner === id)) rechargeUnit(s.battle, u);
  writeSave(save);
  renderSide(s);
}

function hint(s, text) {
  const el = document.getElementById('hint');
  if (!el) return;
  el.textContent = text;
  clearTimeout(s.hintTimer);
  s.hintTimer = setTimeout(() => (el.textContent = ''), 2500);
}

function cancel(s) {
  s.sel = null;
  renderSide(s);
}

const placedMonster = (s, uid) => s.layout.monsters.find((m) => m.uid === uid);
const placedFacility = (s, id) => s.layout.facilities.find((f) => f.id === id);

/** 今選んでいて、マップ上にあるもの。 */
function selectedPlaced(s) {
  if (s.sel?.type === 'monster') return placedMonster(s, s.sel.uid) ?? null;
  if (s.sel?.type === 'facility') return placedFacility(s, s.sel.id) ?? null;
  return null;
}

/** 鍛冶場が要る施設を、今建てられるか。 */
function requirementMet(s, kind) {
  const req = FACILITIES[kind].requires;
  if (!req) return true;
  return s.layout.facilities.some((f) => f.kind === req && s.resolved.status.get(f.id) === 'active');
}

/** マウスの位置に置こうとしているもの（ゴースト）。 */
function ghostAt(s, c) {
  if (!c || !s.sel) return null;
  const sel = s.sel;
  if (sel.type === 'monster') {
    const placed = placedMonster(s, sel.uid);
    const kind = placed?.kind ?? save.roster.find((m) => m.uid === sel.uid).kind;
    const item = withRoster({ uid: sel.uid, kind, x: c.x, y: c.y, dir: placed?.dir ?? s.placeDir });
    return { item, ignore: placed, ok: canPlace(s.map, s.layout, item, placed) };
  }
  if (sel.type === 'build') {
    const def = FACILITIES[sel.kind];
    const item = { id: 'ghost', kind: sel.kind, x: c.x, y: c.y, dir: s.placeDir };
    const ok = canPlace(s.map, s.layout, item) && canAfford(s.resolved.alloc.remaining, def.cost) && requirementMet(s, sel.kind);
    return { item, ok };
  }
  if (sel.type === 'facility') {
    const placed = placedFacility(s, sel.id);
    const item = { ...placed, x: c.x, y: c.y };
    return { item, ignore: placed, ok: canPlace(s.map, s.layout, item, placed) };
  }
  return null;
}

function onCellClick(s, c) {
  if (!c || s.result) return;
  const L = s.layout;
  const g = ghostAt(s, c);
  const clickedOwn = g?.ignore && g.ignore.x === c.x && g.ignore.y === c.y;
  if (g && !clickedOwn) {
    if (!g.ok) {
      if (s.sel.type === 'build') {
        const def = FACILITIES[s.sel.kind];
        if (!canAfford(s.resolved.alloc.remaining, def.cost)) return hint(s, '資材が足りません');
        if (!requirementMet(s, s.sel.kind)) return hint(s, '鍛冶場が動いていないので建てられません');
      }
      return hint(s, 'そこには置けません（道・資源地・木・池・ほかのものがあるマス）');
    }
    if (s.sel.type === 'monster') {
      const placed = placedMonster(s, s.sel.uid);
      if (placed) Object.assign(placed, { x: c.x, y: c.y });
      else L.monsters.push({ ...g.item });
      const id = s.sel.uid;
      s.sel = null;
      return changed(s, [id]);
    }
    if (s.sel.type === 'build') {
      const id = `f${L.nextFacilityId++}`;
      L.facilities.push({ ...g.item, id });
      s.sel = null;
      return changed(s, [id]);
    }
    if (s.sel.type === 'facility') {
      Object.assign(g.ignore, { x: c.x, y: c.y });
      const id = s.sel.id;
      s.sel = null;
      return changed(s, [id]);
    }
  }
  // 置いてあるものを選ぶ
  const it = occupancy(L).get(`${c.x},${c.y}`);
  if (it?.uid) {
    s.sel = { type: 'monster', uid: it.uid };
    s.tab = 'monster';
  } else if (it) {
    s.sel = { type: 'facility', id: it.id };
    s.tab = 'build';
  } else s.sel = null;
  renderSide(s);
}

/** R キー／回転ボタン。置いてあるものはその場で回し、これから置くものは置く向きを回す。 */
function rotateSelection(s) {
  const placed = selectedPlaced(s);
  if (placed) {
    const turned = { ...placed, dir: nextDir(placed.dir) };
    if (!canPlace(s.map, s.layout, turned, placed)) return hint(s, '回すとほかのものに重なるので回せません');
    placed.dir = turned.dir;
    return changed(s, [placed.uid ?? placed.id]);
  }
  s.placeDir = nextDir(s.placeDir);
  renderSide(s);
}

/** この挑戦で倒した記録を、モンスターごとの stats に足す（進化の条件）。 */
function recordRun(s) {
  if (s.recorded) return;
  s.recorded = true;
  recordBattle(save, s.battle.kills, { won: s.battle.phase === 'won', workers: [...s.resolved.working] });
  writeSave(save);
}

/** この挑戦で手に入れたエレメントを持ち物に入れる（負けても持ち帰る）。 */
function bankRun(s) {
  recordRun(s);
  if (s.banked || bagTotal(s.battle.gained) === 0) return;
  s.banked = true;
  save.elements = addBag(save.elements, s.battle.gained);
  writeSave(save);
  renderBank();
}

function resetBattle(s) {
  clearTimeout(s.autoTimer);
  bankRun(s);
  s.battle = createBattle(s.region, s.map);
  s.banked = false;
  s.recorded = false;
  s.result = null;
  s.paused = false;
  document.getElementById('overlay').innerHTML = '';
  renderSide(s);
}

function begin(s) {
  if (s.battle.phase !== 'ready') return;
  startBattle(s.battle, s.resolved);
  s.runs += 1;
  if (!save.ranOnce) {
    save.ranOnce = true;
    writeSave(save);
    renderGuide();
  }
  s.paused = false;
}

function onAction(s, act, data, el) {
  const L = s.layout;
  switch (act) {
    case 'start':
      begin(s);
      break;
    case 'pause':
      if (s.battle.phase === 'running') s.paused = !s.paused;
      break;
    case 'speed':
      s.speed = Number(data.v);
      break;
    case 'retry':
      resetBattle(s);
      break;
    case 'auto':
      save.settings.autoRetry = el.checked;
      writeSave(save);
      if (!el.checked) clearTimeout(s.autoTimer);
      else if (s.result) scheduleAutoRetry(s);
      break;
    case 'home':
      goHome();
      return;
    case 'tab':
      s.tab = data.v;
      s.sel = null;
      break;
    case 'pick-monster':
      s.sel = s.sel?.uid === data.uid ? null : { type: 'monster', uid: data.uid };
      break;
    case 'pick-build':
      s.sel = s.sel?.kind === data.kind ? null : { type: 'build', kind: data.kind };
      break;
    case 'pick-facility':
      s.sel = s.sel?.id === data.id ? null : { type: 'facility', id: data.id };
      break;
    case 'rotate':
      return rotateSelection(s);
    case 'remove-monster':
      L.monsters = L.monsters.filter((m) => m.uid !== data.uid);
      s.layout = L;
      s.sel = null;
      return changed(s);
    case 'remove-facility':
      L.facilities = L.facilities.filter((f) => f.id !== data.id);
      s.sel = null;
      return changed(s);
    case 'clear-all':
      askConfirm(
        '置いたモンスターと施設を全部外しますか？',
        () => {
          L.monsters = [];
          L.facilities = [];
          s.sel = null;
          changed(s);
        },
        '外す',
      );
      return;
    default:
      return;
  }
  renderHud(s);
  renderSide(s);
}

// ---------- 毎フレーム ----------
function loop(s, t) {
  if (screen !== s) return;
  const dt = Math.min(0.1, s.last ? (t - s.last) / 1000 : 0);
  s.last = t;
  const b = s.battle;
  if (b.phase === 'running' && !s.paused) {
    s.acc = (s.acc ?? 0) + dt * speedOf(s);
    const wave = b.wavesStarted;
    while (s.acc >= STEP && b.phase === 'running') {
      step(b, STEP, s.resolved);
      s.acc -= STEP;
    }
    if (b.wavesStarted !== wave) renderSide(s);
    if (b.phase !== 'running') onFinish(s);
  }
  draw(s.ctx, viewOf(s));
  renderHud(s);
  requestAnimationFrame((t2) => loop(s, t2));
}

function viewOf(s) {
  const g = ghostAt(s, s.hover);
  const showGhost = g && !(g.ignore && g.ignore.x === s.hover.x && g.ignore.y === s.hover.y);
  let focus = selectedPlaced(s);
  if (!focus && !g && s.hover) focus = occupancy(s.layout).get(`${s.hover.x},${s.hover.y}`) ?? null;
  if (focus?.uid) focus = withRoster(focus);
  // モンスターを置く前に、置いたら資源地からいくつ入るかを見せる
  let nodeYield = null;
  if (showGhost && g.ok && g.item.uid) {
    const key = `${g.item.uid},${g.item.x},${g.item.y},${g.item.dir}`;
    if (s.previewKey !== key) {
      const monsters = [...s.layout.monsters.filter((m) => m.uid !== g.item.uid), { ...g.item }];
      s.previewKey = key;
      s.preview = resolveLayout(s.map, withLevels({ ...s.layout, monsters })).prod.perNode;
    }
    nodeYield = s.preview;
  }
  return {
    map: s.map,
    battle: s.battle,
    layout: s.layout,
    resolved: s.resolved,
    hover: s.hover,
    ghost: showGhost ? g : null,
    focus,
    nodeYield,
  };
}

function onFinish(s) {
  const b = s.battle;
  bankRun(s);
  const ov = document.getElementById('overlay');
  const auto = save.settings.autoRetry;
  const buttons = `<div class="row" style="justify-content:center;margin-top:10px">
      <button class="primary" data-act="retry">${auto ? '今すぐ次へ' : 'もう一度'}</button>
      <button data-act="home">地域選択へ</button></div>
      ${auto ? `<p class="hint">${AUTO_RETRY_DELAY / 1000}秒後に自動で次の挑戦を始めます（${s.runs}周目が終わりました）</p>` : ''}`;
  if (b.phase === 'won') {
    const p = pace(b);
    const best = p > s.rs.bestPace;
    s.rs.clears += 1;
    s.rs.cleared = true;
    if (best) {
      s.rs.bestPace = p;
      s.rs.paceBag = paceBag(b);
    }
    writeSave(save);
    s.result = 'won';
    ov.innerHTML = `<div class="overlay"><div class="box">
      <h3>${s.region.name}を攻略！</h3>
      <p>獲得ペース</p>
      <p class="big">${p.toFixed(2)} /秒 ${best ? '<span class="badge">新記録</span>' : ''}</p>
      <p class="hint">手に入れたエレメント ${bagTotal(b.gained)} ÷ ${b.time.toFixed(1)}秒 · 記録 ${s.rs.bestPace.toFixed(2)}/秒<br>
      この地域から、記録したペースでエレメントが自動で入り続けます（ページを開いている間）。</p>
      ${buttons}</div></div>`;
  } else {
    s.result = 'lost';
    ov.innerHTML = `<div class="overlay"><div class="box">
      <h3>拠点を守りきれなかった</h3>
      <p>ウェーブ ${b.wavesStarted} / ${b.waves.length} で敗北。${b.bossLeaked ? 'ボスを通したので拠点は全損しました。' : ''}ウェーブ1からやり直しです。</p>
      <p class="hint">手に入れたエレメント ${bagTotal(b.gained)} は持ち帰りました。モンスターと施設は失いません。</p>
      ${buttons}</div></div>`;
  }
  if (auto) scheduleAutoRetry(s);
  renderSide(s);
}

function scheduleAutoRetry(s) {
  clearTimeout(s.autoTimer);
  s.autoTimer = setTimeout(() => {
    if (screen !== s || !save.settings.autoRetry || !s.result) return;
    resetBattle(s);
    begin(s);
  }, AUTO_RETRY_DELAY);
}

// ---------- HUD と横のパネル ----------
function renderHud(s) {
  const b = s.battle;
  const hud = document.getElementById('hud');
  if (!hud) return;
  const startBtn =
    b.phase === 'ready'
      ? '<button class="primary" data-act="start">戦闘開始</button>'
      : b.phase === 'running'
        ? `<button data-act="pause" class="${s.paused ? 'on' : ''}">${s.paused ? '再開' : '一時停止'}</button>`
        : '';
  const cap = save.settings.autoRetry ? AUTO_SPEED_CAP : Infinity;
  const speeds = [1, 2, 4, 8]
    .map((v) => `<button data-act="speed" data-v="${v}" class="${speedOf(s) === v ? 'on' : ''}" ${v > cap ? `disabled title="自動で再挑戦の間は${AUTO_SPEED_CAP}倍まで"` : ''}>${v}倍</button>`)
    .join('');
  const stats = `
    <span class="stat">${s.region.name}</span>
    <span class="stat ${b.baseHp <= 1 ? 'hp-bad' : ''}">拠点 <b>${b.baseHp}</b>/${b.baseMax}</span>
    <span class="stat">ウェーブ <b>${b.wavesStarted}</b>/${b.waves.length}</span>
    <span class="stat">タイマー <b>${b.time.toFixed(1)}</b>秒${s.paused ? '（停止中）' : ''}</span>
    <span class="stat">エレメント <b>${bagTotal(b.gained)}</b></span>
    <span class="stat">ペース <b>${pace(b).toFixed(2)}</b>/秒</span>
    ${s.runs > 1 ? `<span class="stat">${s.runs}周目</span>` : ''}`;
  const ctrl = `${startBtn}
    ${b.phase !== 'ready' ? '<button data-act="retry">やり直す</button>' : ''}
    ${speeds}
    <label class="toggle" title="自動で再挑戦の間は${AUTO_SPEED_CAP}倍速まで"><input type="checkbox" data-act="auto" ${save.settings.autoRetry ? 'checked' : ''}> 自動で再挑戦（${AUTO_SPEED_CAP}倍まで）</label>`;
  if (!hud.firstChild) hud.innerHTML = '<button data-act="home">← 地域選択</button><span class="hud-stats"></span><span class="spacer"></span><span class="hud-ctrl row"></span>';
  const st = hud.querySelector('.hud-stats');
  const ct = hud.querySelector('.hud-ctrl');
  if (st.dataset.html !== stats) {
    st.innerHTML = stats;
    st.dataset.html = stats;
  }
  if (ct.dataset.html !== ctrl) {
    ct.innerHTML = ctrl;
    ct.dataset.html = ctrl;
  }
}

const STATUS_LABEL = {
  active: ['動いている', 'placed'],
  materials: ['停止（資材不足）', 'stopped'],
  'no-worker': ['停止（作業場所に、施設の方を向いたモンスターがいない）', 'stopped'],
  'needs-smithy': ['停止（鍛冶場が動いていない）', 'stopped'],
};

function rotateRow(s, text) {
  return `<div class="row rotate-row"><button data-act="rotate">↻ 回転（R）</button><span class="hint">${text}</span></div>`;
}

function renderSide(s) {
  const side = document.getElementById('side');
  if (!side) return;
  const L = s.layout;
  const { prod, alloc, status, working } = s.resolved;
  const tabs = `<div class="row">
    <button data-act="tab" data-v="monster" class="${s.tab === 'monster' ? 'on' : ''}">モンスター</button>
    <button data-act="tab" data-v="build" class="${s.tab === 'build' ? 'on' : ''}">建設</button>
  </div>`;

  let body = '';
  const placed = selectedPlaced(s);
  if (s.sel && !placed) body += `<div class="card">${rotateRow(s, `置く向き：${DIR_NAME[s.placeDir]}。マスを押すと置きます。右クリック／Esc で取り消し`)}</div>`;

  if (s.tab === 'monster') {
    if (!save.roster.length) body += '<div class="card"><p>手持ちのモンスターがいません。「モンスター」→「錬成」で作りましょう。</p></div>';
    else body += `<div class="card"><h3>手持ちのモンスター <small>押してからマスを選ぶ</small></h3><div class="list">${save.roster
      .map((r) => {
        const def = MONSTERS[r.kind];
        const p = placedMonster(s, r.uid);
        const sel = s.sel?.type === 'monster' && s.sel.uid === r.uid;
        const state = !p ? ['待機', ''] : working.has(r.uid) ? ['作業中', 'placed'] : ['配置中', 'placed'];
        return `<button class="item ${sel ? 'sel' : ''}" data-act="pick-monster" data-uid="${r.uid}">
          <span class="icon" style="background:${ELEMENT[def.element].color}">${def.name[0]}</span>
          <span>${def.name} Lv${r.level}${skillsOf(r).length > 1 ? ` <small>技${skillsOf(r).length}</small>` : ''}</span>
          <span class="state ${state[1]}">${state[0]}</span>
          <span class="sub">${shapePreview(def.shape)}<span>${ELEMENT[def.element].name} · 技「${skillsOf(r).map((k) => MONSTERS[k].skill).join('・')}」</span></span>
        </button>`;
      })
      .join('')}</div></div>`;
    if (placed?.uid) {
      const i = s.layout.monsters.findIndex((m) => m.uid === placed.uid);
      const us = s.resolved.units.filter((u) => u.owner === placed.uid);
      const y = i >= 0 ? Object.entries(prod.perMonster[i]).filter(([, n]) => n) : [];
      body += `<div class="card info"><h3>${MONSTERS[placed.kind].name} <small>Lv${save.roster.find((r) => r.uid === placed.uid)?.level ?? 1} · ${DIR_NAME[placed.dir]}向き</small></h3>
        ${us.map((u) => `<p>「${MONSTERS[u.skill].skill}」攻撃 ${u.atk.toFixed(1)} · 間隔 ${u.interval.toFixed(2)}秒（毎秒 ${(u.atk / u.interval).toFixed(1)}）</p>`).join('')}
        ${working.has(placed.uid) ? '<p>鍛冶場で作業中（攻撃と生産もそのまま）</p>' : ''}
        <p>資材：${y.length ? y.map(([id, n]) => `${ELEMENT[id].name}+${n}`).join(' ') : 'なし'}</p>
        ${rotateRow(s, '別のマスを押すと移動。動かすと攻撃は溜め直し')}
        <div class="row" style="margin-top:6px"><button data-act="remove-monster" data-uid="${placed.uid}">外す</button></div></div>`;
    }
  } else {
    body += `<div class="card"><h3>施設を建てる <small>資材を使う</small></h3><div class="list">${FACILITY_ORDER.map((kind) => {
      const def = FACILITIES[kind];
      const sel = s.sel?.type === 'build' && s.sel.kind === kind;
      const ok = canAfford(alloc.remaining, def.cost) && requirementMet(s, kind);
      const count = L.facilities.filter((f) => f.kind === kind).length;
      return `<button class="item ${sel ? 'sel' : ''}" data-act="pick-build" data-kind="${kind}" ${ok || sel ? '' : 'disabled'}>
        <span class="icon sq" style="background:${FACILITY_COLOR[def.type]}">${facilityIcon(kind)}</span>
        <span>${def.name}${count ? ` ×${count}` : ''}</span>
        <span class="state">${FACILITY_TYPE_NAME[def.type]}</span>
        <span class="sub">${def.shape.length > 1 ? shapePreview(def.shape) : ''}<span>${costText(def.cost)}<br>${def.desc}</span></span>
      </button>`;
    }).join('')}</div></div>`;
    if (L.facilities.length) {
      body += `<div class="card"><h3>建てた施設 <small>建てた順。押すと選べる</small></h3><div class="list">${L.facilities
        .map((f) => {
          const def = FACILITIES[f.kind];
          const [text, cls] = STATUS_LABEL[status.get(f.id)];
          const sel = s.sel?.type === 'facility' && s.sel.id === f.id;
          return `<button class="item ${sel ? 'sel' : ''}" data-act="pick-facility" data-id="${f.id}">
            <span class="icon sq" style="background:${FACILITY_COLOR[def.type]}">${facilityIcon(f.kind)}</span>
            <span>${def.name}</span>
            <span class="state ${cls}">${text}</span>
          </button>`;
        })
        .join('')}</div></div>`;
    }
    if (placed?.id) {
      const def = FACILITIES[placed.kind];
      body += `<div class="card info"><h3>${def.name} <small>${DIR_NAME[placed.dir]}向き</small></h3>
        <p>${def.desc}</p>
        <p class="${status.get(placed.id) === 'active' ? '' : 'neg'}">${STATUS_LABEL[status.get(placed.id)][0]}</p>
        ${rotateRow(s, '別のマスを押すと移動')}
        <div class="row" style="margin-top:6px"><button data-act="remove-facility" data-id="${placed.id}">取り壊す</button></div></div>`;
    }
  }

  const els = ELEMENTS.filter((e) => s.region.elements.includes(e.id) || prod.bag[e.id] || alloc.used[e.id]);
  const mat = `<div class="card"><h3>資材 <small>配置で決まる量</small></h3>
    <table class="mat"><tr><th>属性</th><th>得る</th><th>使う</th><th>残り</th></tr>
    ${els
      .map((e) => `<tr><td>${chip(e.id, e.name)}</td><td>${prod.bag[e.id]}</td><td>${alloc.used[e.id]}</td><td class="${alloc.remaining[e.id] < 0 ? 'neg' : ''}">${alloc.remaining[e.id]}</td></tr>`)
      .join('')}
    </table></div>`;

  const b = s.battle;
  const groupNote = s.resolved.groupSize > 1 ? `角笛で${s.resolved.groupSize}つずつまとめて出す` : '敵の出方';
  const waves = `<div class="card"><h3>ウェーブ <small>${groupNote}</small></h3><div class="waves">${b.waves
    .map((w, i) => {
      const cls = b.phase === 'won' || i < b.wavesStarted - s.resolved.groupSize ? 'done' : i < b.wavesStarted ? 'now' : '';
      const list = waveSummary(w)
        .map(({ kind, n }) => {
          const e = ENEMIES[kind];
          return chip(e.element, `${e.boss ? '【ボス】' : e.elite ? '【強】' : ''}${e.name}×${n}`);
        })
        .join(' ');
      return `<div class="w ${cls}">${i + 1}. ${list}</div>`;
    })
    .join('')}</div></div>`;

  const help = `<div class="card"><details class="help"><summary>遊び方</summary><ul>
    <li>モンスターを押してから、草地のマスを押すと置けます。R キーか「回転」で向きを変えます。攻撃は向いている方の、塗られたマスに届きます。</li>
    <li>置いたモンスターや施設を押すと選べます。別のマスを押すと移動、その場で回転もできます。戦闘中でも動かせますが、攻撃は溜め直しになります。</li>
    <li>資源地（◆）のまわり8マスに置くと資材 +2、攻撃範囲のマスに入れると +1。モンスターと同じ属性なら +1。</li>
    <li>資材で施設を建てます。資材が減ると、足りない施設のうち最後に建てたものが止まります。</li>
    <li>鍛冶場（製造施設）は、前の2マス（点線）に、攻撃範囲が鍛冶場に重なる向きでモンスターを置くと動きます。動いている間だけ剣の台座が建てられ、効果が出ます。作業中のモンスターも攻撃と生産をします。</li>
    <li>連戦の角笛は重ねて置けます。1個で2ウェーブずつ、2個で3ウェーブずつまとめて出ます。</li>
    <li>ボス（王の印）を通すと、拠点は全損です。【強】の敵は拠点を2減らします。</li>
    <li>獲得ペース ＝ 手に入れたエレメント ÷ 全ウェーブを倒すのにかかった時間。一時停止中はタイマーが止まります。負けても手に入れたエレメントは持ち帰ります。</li>
  </ul></details>
  <div class="row" style="margin-top:8px"><button data-act="clear-all">配置を全部外す</button></div></div>`;

  side.innerHTML = tabs + body + mat + waves + help;
}

renderBank();
goHome();
