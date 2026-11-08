// Arc-en-ciel Creator：画面の組み立てと操作。
import { ELEMENTS, ELEMENT, bagTotal, addBag } from './data/elements.js';
import { MONSTERS } from './data/monsters.js';
import { FACILITIES, FACILITY_ORDER } from './data/facilities.js';
import { ENEMIES } from './data/enemies.js';
import { REGIONS, PROVINCES } from './data/regions.js';
import { parseMap, isBuildable } from './core/map.js';
import { production, allocate, canAfford, yieldFrom } from './core/materials.js';
import { buildUnits } from './core/units.js';
import { createBattle, startBattle, step, pace, paceBag, waveSummary } from './core/battle.js';
import { loadSave, writeSave, clearSave, regionSave, newSave } from './core/save.js';
import { draw, CELL, facilityIcon } from './ui/render.js';

const VERSION = 'v0.1.0';
const STEP = 1 / 60;

const app = document.getElementById('app');
const bankEl = document.getElementById('bank');
document.getElementById('version').textContent = VERSION;

let save = loadSave();
let screen = { name: 'home' };

// ---------- 持っているエレメントと、攻略済み地域からの自動の獲得 ----------
function incomeBag() {
  let bag = {};
  for (const r of Object.values(save.regions)) if (r.cleared) bag = addBag(bag, r.paceBag);
  return bag;
}
function renderBank() {
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

document.getElementById('reset-save').addEventListener('click', () => {
  if (!confirm('セーブを消して、最初からにしますか？')) return;
  clearSave();
  save = newSave();
  goHome();
});

// ---------- ホーム：地方と地域の選択 ----------
function goHome() {
  if (screen.name === 'map') bankRun(screen);
  screen = { name: 'home' };
  renderBank();
  app.innerHTML = PROVINCES.map((p) => {
    const regions = p.regions
      .map((id) => {
        const r = REGIONS[id];
        const rs = save.regions[id];
        const els = r.elements.map((e) => `<span class="chip"><span class="dot" style="background:${ELEMENT[e].color}"></span>${ELEMENT[e].name}</span>`).join(' ');
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
  app.querySelectorAll('[data-region]').forEach((el) => el.addEventListener('click', () => openRegion(el.dataset.region)));
}

// ---------- 地域マップ ----------
function openRegion(regionId) {
  const region = REGIONS[regionId];
  const map = parseMap(region.map);
  const rs = regionSave(save, regionId);
  const s = {
    name: 'map',
    regionId,
    region,
    map,
    rs,
    layout: rs.layout,
    battle: createBattle(region, map),
    banked: false,
    paused: false,
    speed: 1,
    sel: null, // {type:'monster', uid} | {type:'build', kind} | {type:'facility', id}
    hover: null,
    tab: 'monster',
    derived: null,
    result: null,
  };
  screen = s;
  derive(s);
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
  cv.addEventListener('mousemove', (ev) => {
    s.hover = cellAt(cv, ev, map);
  });
  cv.addEventListener('mouseleave', () => {
    s.hover = null;
  });
  cv.addEventListener('click', (ev) => onCellClick(s, cellAt(cv, ev, map)));
  cv.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    s.sel = null;
    renderSide(s);
  });
  app.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (el && screen === s) onAction(s, el.dataset.act, el.dataset);
  });
  renderHud(s);
  renderSide(s);
  requestAnimationFrame((t) => loop(s, t));
}

window.addEventListener('keydown', (ev) => {
  if (screen.name !== 'map') return;
  if (ev.key === 'Escape') {
    screen.sel = null;
    renderSide(screen);
  } else if (ev.key === ' ') {
    ev.preventDefault();
    onAction(screen, screen.battle.phase === 'ready' ? 'start' : 'pause', {});
  }
});

function cellAt(cv, ev, map) {
  const r = cv.getBoundingClientRect();
  const x = Math.floor(((ev.clientX - r.left) / r.width) * map.w);
  const y = Math.floor(((ev.clientY - r.top) / r.height) * map.h);
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  return { x, y };
}

function monsterInfo(m) {
  const def = MONSTERS[m.kind];
  return { ...m, element: def.element, range: def.range };
}

/** 配置から、資材・施設の動き・戦闘ユニットを計算し直す。 */
function derive(s) {
  const L = s.layout;
  const ms = L.monsters.map(monsterInfo);
  const prod = production(s.map.nodes, ms);
  const facs = L.facilities.map((f) => ({ ...f, cost: FACILITIES[f.kind].cost }));
  const alloc = allocate(prod.bag, facs);
  const ctx = buildUnits(L.monsters, L.facilities.filter((f) => alloc.active.has(f.id)));
  const nodeYield = new Map();
  for (const n of s.map.nodes) {
    const y = ms.reduce((sum, m) => sum + yieldFrom(m, n), 0);
    if (y) nodeYield.set(`${n.x},${n.y}`, y);
  }
  s.derived = { prod, alloc, ctx, nodeYield };
}

function occupied(s, exceptKey) {
  const set = new Set();
  for (const m of s.layout.monsters) set.add(`${m.x},${m.y}`);
  for (const f of s.layout.facilities) set.add(`${f.x},${f.y}`);
  if (exceptKey) set.delete(exceptKey);
  return set;
}

function changed(s) {
  derive(s);
  writeSave(save);
  renderSide(s);
}

function onCellClick(s, c) {
  if (!c || s.result) return;
  const L = s.layout;
  const sel = s.sel;
  const here = `${c.x},${c.y}`;
  if (sel?.type === 'monster') {
    const placed = L.monsters.find((m) => m.uid === sel.uid);
    const except = placed ? `${placed.x},${placed.y}` : null;
    if (!isBuildable(s.map, c.x, c.y, occupied(s, except))) return hint(s, 'そこには置けません（道・資源地・木・池・ほかのものがあるマス）');
    if (placed) Object.assign(placed, c);
    else {
      const r = save.roster.find((m) => m.uid === sel.uid);
      L.monsters.push({ uid: r.uid, kind: r.kind, x: c.x, y: c.y });
    }
    s.sel = null;
    return changed(s);
  }
  if (sel?.type === 'build') {
    const def = FACILITIES[sel.kind];
    if (!isBuildable(s.map, c.x, c.y, occupied(s))) return hint(s, 'そこには建てられません');
    if (!canAfford(s.derived.alloc.remaining, def.cost)) return hint(s, '資材が足りません');
    if (def.type === 'progress' && L.facilities.some((f) => f.kind === sel.kind)) return hint(s, '同じ進行施設は1つまで');
    L.facilities.push({ id: `f${L.nextFacilityId++}`, kind: sel.kind, x: c.x, y: c.y });
    s.sel = null;
    return changed(s);
  }
  const m = L.monsters.find((m) => `${m.x},${m.y}` === here);
  if (m) {
    s.sel = { type: 'monster', uid: m.uid };
    s.tab = 'monster';
    return renderSide(s);
  }
  const f = L.facilities.find((f) => `${f.x},${f.y}` === here);
  if (f) {
    s.sel = { type: 'facility', id: f.id };
    s.tab = 'build';
    return renderSide(s);
  }
  s.sel = null;
  renderSide(s);
}

function hint(s, text) {
  const el = document.getElementById('hint');
  el.textContent = text;
  clearTimeout(s.hintTimer);
  s.hintTimer = setTimeout(() => (el.textContent = ''), 2500);
}

/** この挑戦で手に入れたエレメントを持ち物に入れる（負けても失わない）。 */
function bankRun(s) {
  if (s.banked || bagTotal(s.battle.gained) === 0) return;
  s.banked = true;
  save.elements = addBag(save.elements, s.battle.gained);
  writeSave(save);
  renderBank();
}

function resetBattle(s) {
  bankRun(s);
  s.battle = createBattle(s.region, s.map);
  s.banked = false;
  s.result = null;
  s.paused = false;
  document.getElementById('overlay').innerHTML = '';
  renderSide(s);
}

function onAction(s, act, data) {
  const L = s.layout;
  switch (act) {
    case 'start':
      if (s.battle.phase === 'ready') startBattle(s.battle);
      s.paused = false;
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
    case 'remove-monster':
      L.monsters = L.monsters.filter((m) => m.uid !== data.uid);
      s.sel = null;
      return changed(s);
    case 'remove-facility':
      L.facilities = L.facilities.filter((f) => f.id !== data.id);
      s.sel = null;
      return changed(s);
    case 'clear-all':
      if (!confirm('置いたモンスターと施設を全部外しますか？')) return;
      L.monsters = [];
      L.facilities = [];
      s.sel = null;
      return changed(s);
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
    s.acc = (s.acc ?? 0) + dt * s.speed;
    let wave = b.wavesStarted;
    while (s.acc >= STEP && b.phase === 'running') {
      step(b, STEP, s.derived.ctx);
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
  const L = s.layout;
  let ghost = null;
  let focus = null;
  const h = s.hover;
  if (s.sel?.type === 'monster') {
    const placed = L.monsters.find((m) => m.uid === s.sel.uid);
    const kind = placed?.kind ?? save.roster.find((m) => m.uid === s.sel.uid).kind;
    const def = MONSTERS[kind];
    if (placed) focus = { x: placed.x, y: placed.y, range: def.range };
    if (h) {
      const ok = isBuildable(s.map, h.x, h.y, occupied(s, placed ? `${placed.x},${placed.y}` : null));
      ghost = { x: h.x, y: h.y, range: def.range, ok, label: def.name[0], color: ELEMENT[def.element].color };
    }
  } else if (s.sel?.type === 'build' && h) {
    const def = FACILITIES[s.sel.kind];
    const ok = isBuildable(s.map, h.x, h.y, occupied(s)) && canAfford(s.derived.alloc.remaining, def.cost);
    ghost = { x: h.x, y: h.y, range: def.range ?? def.buff?.radius, ok, label: facilityIcon(s.sel.kind), color: '#f0d9a7', square: true };
  } else if (s.sel?.type === 'facility') {
    const f = L.facilities.find((f) => f.id === s.sel.id);
    const def = FACILITIES[f.kind];
    if (def.range || def.buff) focus = { x: f.x, y: f.y, range: def.range ?? def.buff.radius };
  } else if (h) {
    const m = L.monsters.find((m) => m.x === h.x && m.y === h.y);
    if (m) focus = { x: m.x, y: m.y, range: MONSTERS[m.kind].range };
    const f = L.facilities.find((f) => f.x === h.x && f.y === h.y);
    if (f && (FACILITIES[f.kind].range || FACILITIES[f.kind].buff)) focus = { x: f.x, y: f.y, range: FACILITIES[f.kind].range ?? FACILITIES[f.kind].buff.radius };
  }
  // 置く前に、置いたら資源地からいくつ入るかを見せる
  let nodeYield = s.derived.nodeYield;
  if (ghost?.ok && s.sel?.type === 'monster') {
    const kind = L.monsters.find((m) => m.uid === s.sel.uid)?.kind ?? save.roster.find((m) => m.uid === s.sel.uid).kind;
    const others = L.monsters.filter((m) => m.uid !== s.sel.uid).map(monsterInfo);
    const me = monsterInfo({ kind, x: ghost.x, y: ghost.y });
    nodeYield = new Map();
    for (const n of s.map.nodes) {
      const y = [...others, me].reduce((sum, m) => sum + yieldFrom(m, n), 0);
      if (y) nodeYield.set(`${n.x},${n.y}`, y);
    }
  }
  return {
    map: s.map,
    battle: s.battle,
    monsters: L.monsters,
    facilities: L.facilities,
    stopped: s.derived.alloc.stopped,
    units: s.derived.ctx.units,
    nodeYield,
    hover: h,
    ghost,
    focus,
  };
}

function onFinish(s) {
  const b = s.battle;
  bankRun(s);
  const ov = document.getElementById('overlay');
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
      この地域から、記録したペースでエレメントが自動で入り続けます。</p>
      <div class="row" style="justify-content:center;margin-top:10px">
        <button class="primary" data-act="retry">配置を変えてもう一度</button>
        <button data-act="home">地域選択へ</button>
      </div></div></div>`;
  } else {
    s.result = 'lost';
    ov.innerHTML = `<div class="overlay"><div class="box">
      <h3>拠点を守りきれなかった</h3>
      <p>ウェーブ ${b.wavesStarted} / ${b.waves.length} で敗北。ウェーブ1からやり直しです。</p>
      <p class="hint">手に入れたエレメント ${bagTotal(b.gained)} は持ち帰りました。モンスターと施設は失いません。</p>
      <div class="row" style="justify-content:center;margin-top:10px">
        <button class="primary" data-act="retry">もう一度</button>
        <button data-act="home">地域選択へ</button>
      </div></div></div>`;
  }
  renderSide(s);
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
  const speeds = [1, 2, 4, 8].map((v) => `<button data-act="speed" data-v="${v}" class="${s.speed === v ? 'on' : ''}">${v}倍</button>`).join('');
  const stats = `
    <span class="stat">${s.region.name}</span>
    <span class="stat ${b.baseHp <= 1 ? 'hp-bad' : ''}">拠点 <b>${b.baseHp}</b>/${b.baseMax}</span>
    <span class="stat">ウェーブ <b>${b.wavesStarted}</b>/${b.waves.length}</span>
    <span class="stat">タイマー <b>${b.time.toFixed(1)}</b>秒${s.paused ? '（停止中）' : ''}</span>
    <span class="stat">エレメント <b>${bagTotal(b.gained)}</b></span>
    <span class="stat">ペース <b>${pace(b).toFixed(2)}</b>/秒</span>`;
  const ctrl = `${startBtn}
    ${b.phase !== 'ready' ? '<button data-act="retry">やり直す</button>' : ''}
    ${speeds}`;
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

function costText(cost) {
  return Object.entries(cost)
    .map(([id, n]) => `<span class="chip"><span class="dot" style="background:${ELEMENT[id].color}"></span>${ELEMENT[id].name}${n}</span>`)
    .join(' ');
}

function renderSide(s) {
  const side = document.getElementById('side');
  if (!side) return;
  const L = s.layout;
  const { prod, alloc } = s.derived;
  const tabs = `<div class="row">
    <button data-act="tab" data-v="monster" class="${s.tab === 'monster' ? 'on' : ''}">モンスター</button>
    <button data-act="tab" data-v="build" class="${s.tab === 'build' ? 'on' : ''}">建設</button>
  </div>`;

  let body = '';
  if (s.tab === 'monster') {
    body = `<div class="card"><h3>手持ちのモンスター <small>押してからマスを選ぶ</small></h3><div class="list">${save.roster
      .map((r) => {
        const def = MONSTERS[r.kind];
        const placed = L.monsters.find((m) => m.uid === r.uid);
        const sel = s.sel?.type === 'monster' && s.sel.uid === r.uid;
        return `<button class="item ${sel ? 'sel' : ''}" data-act="pick-monster" data-uid="${r.uid}">
          <span class="icon" style="background:${ELEMENT[def.element].color}">${def.name[0]}</span>
          <span>${def.name}</span>
          <span class="state ${placed ? 'placed' : ''}">${placed ? '配置中' : '待機'}</span>
          <span class="sub">${ELEMENT[def.element].name} · 攻撃${def.atk} · 間隔${def.interval}秒 · 範囲${def.range} · 技「${def.skill}」</span>
        </button>`;
      })
      .join('')}</div></div>`;
    if (s.sel?.type === 'monster' && L.monsters.some((m) => m.uid === s.sel.uid)) {
      const i = L.monsters.findIndex((m) => m.uid === s.sel.uid);
      const m = L.monsters[i];
      const u = s.derived.ctx.units.find((u) => u.id === m.uid);
      const y = Object.entries(prod.perMonster[i]).filter(([, n]) => n);
      body += `<div class="card info"><h3>${MONSTERS[m.kind].name}</h3>
        <p>攻撃 ${u.atk.toFixed(1)} · 間隔 ${u.interval.toFixed(2)}秒（毎秒 ${(u.atk / u.interval).toFixed(1)}）</p>
        <p>資材：${y.length ? y.map(([id, n]) => `${ELEMENT[id].name}+${n}`).join(' ') : 'なし'}</p>
        <p class="hint">別のマスを押すと移動します。</p>
        <button data-act="remove-monster" data-uid="${m.uid}">外す</button></div>`;
    }
  } else {
    body = `<div class="card"><h3>施設を建てる <small>資材を使う</small></h3><div class="list">${FACILITY_ORDER.map((kind) => {
      const def = FACILITIES[kind];
      const sel = s.sel?.type === 'build' && s.sel.kind === kind;
      const ok = canAfford(alloc.remaining, def.cost);
      return `<button class="item ${sel ? 'sel' : ''}" data-act="pick-build" data-kind="${kind}" ${ok || sel ? '' : 'disabled'}>
        <span class="icon sq" style="background:${def.type === 'progress' ? '#c9a7f0' : '#f0d9a7'}">${facilityIcon(kind)}</span>
        <span>${def.name}</span>
        <span class="state">${def.type === 'progress' ? '進行施設' : '戦闘施設'}</span>
        <span class="sub">${costText(def.cost)}<br>${def.desc}</span>
      </button>`;
    }).join('')}</div></div>`;
    if (L.facilities.length) {
      body += `<div class="card"><h3>建てた施設 <small>建てた順</small></h3><div class="list">${L.facilities
        .map((f) => {
          const def = FACILITIES[f.kind];
          const stopped = alloc.stopped.has(f.id);
          const sel = s.sel?.type === 'facility' && s.sel.id === f.id;
          return `<div class="item ${sel ? 'sel' : ''}">
            <span class="icon sq" style="background:${def.type === 'progress' ? '#c9a7f0' : '#f0d9a7'}">${facilityIcon(f.kind)}</span>
            <span>${def.name}</span>
            <span class="state ${stopped ? 'stopped' : 'placed'}">${stopped ? '停止（資材不足）' : '動いている'}</span>
            <span class="sub"><button data-act="remove-facility" data-id="${f.id}">取り壊す</button></span>
          </div>`;
        })
        .join('')}</div></div>`;
    }
  }

  const els = ELEMENTS.filter((e) => s.region.elements.includes(e.id) || prod.bag[e.id] || alloc.used[e.id]);
  const mat = `<div class="card"><h3>資材 <small>配置で決まる量</small></h3>
    <table class="mat"><tr><th>属性</th><th>得る</th><th>使う</th><th>残り</th></tr>
    ${els
      .map((e) => `<tr><td><span class="chip"><span class="dot" style="background:${e.color}"></span>${e.name}</span></td><td>${prod.bag[e.id]}</td><td>${alloc.used[e.id]}</td><td class="${alloc.remaining[e.id] < 0 ? 'neg' : ''}">${alloc.remaining[e.id]}</td></tr>`)
      .join('')}
    </table></div>`;

  const b = s.battle;
  const waves = `<div class="card"><h3>ウェーブ <small>敵の出方</small></h3><div class="waves">${b.waves
    .map((w, i) => {
      const cls = i < b.wavesStarted - 1 || (b.phase === 'won' && i < b.wavesStarted) ? 'done' : i === b.wavesStarted - 1 ? 'now' : '';
      const list = waveSummary(w)
        .map(({ kind, n }) => `<span class="chip"><span class="dot" style="background:${ELEMENT[ENEMIES[kind].element].color}"></span>${ENEMIES[kind].name}×${n}</span>`)
        .join(' ');
      return `<div class="w ${cls}">${i + 1}. ${list}</div>`;
    })
    .join('')}</div></div>`;

  const help = `<div class="card"><details class="help"><summary>遊び方</summary><ul>
    <li>モンスターを押してから、草地のマスを押すと置けます。もう一度マスを押すと移動、右クリックか Esc で取り消し。</li>
    <li>資源地（◆）のとなりに置くと資材 +2、攻撃範囲に入れると +1。モンスターと同じ属性なら +1。</li>
    <li>資材で施設を建てます。資材が減ると、足りない施設のうち最後に建てたものが止まります。</li>
    <li>戦闘開始（スペースキー）で敵が出てきます。拠点の耐久が 0 になると負け。負けても失うものはありません。</li>
    <li>獲得ペース ＝ 手に入れたエレメント ÷ 全ウェーブを倒すのにかかった時間。一時停止中はタイマーが止まります。</li>
  </ul></details>
  <div class="row" style="margin-top:8px"><button data-act="clear-all">配置を全部外す</button></div></div>`;

  side.innerHTML = tabs + body + mat + waves + help;
}

renderBank();
goHome();
