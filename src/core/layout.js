// 地域マップの配置から、作業中のモンスター・資材・施設の状態・戦闘ユニットをまとめて計算する。
// 配置が変わるたびに呼び直す（画面なしでも動く）。
import { MONSTERS } from '../data/monsters.js';
import { FACILITIES } from '../data/facilities.js';
import { production, allocate } from './materials.js';
import { cellsOf, keyOf } from './shape.js';

/** 置き物（モンスターか施設）の定義。 */
export function defOf(item) {
  return item.uid ? MONSTERS[item.kind] : FACILITIES[item.kind];
}

export function footprintOf(item) {
  return cellsOf(defOf(item).shape, item.x, item.y, item.dir, 'footprint');
}

export function targetsOf(item) {
  return cellsOf(defOf(item).shape, item.x, item.y, item.dir, 'targets');
}

/** 置き物が占めるマス → 置き物。ignore に渡したものは除く（移動中のものなど）。 */
export function occupancy(layout, ignore) {
  const map = new Map();
  for (const it of [...layout.monsters, ...layout.facilities]) {
    if (it === ignore) continue;
    for (const c of footprintOf(it)) map.set(keyOf(c), it);
  }
  return map;
}

/** item を (x, y, dir) に置けるか。置き物の全部のマスが、空いている草地であること。 */
export function canPlace(map, layout, item, ignore) {
  const occ = occupancy(layout, ignore);
  return footprintOf(item).every((c) => map.cells[c.y]?.[c.x] === 'grass' && !occ.has(keyOf(c)));
}

/**
 * 戻り値：
 *   working:   Set<uid>         製造施設の作業場所にいるモンスター（攻撃も生産もしない）
 *   prod:      production() の戻り値（作業中でないモンスターだけ）
 *   alloc:     allocate() の戻り値
 *   status:    Map<id, 'active'|'materials'|'no-worker'|'needs-smithy'>
 *   units:     戦闘で攻撃するもの [{ id, source, x, y, element, atk, interval, targets:Set, buffed }]
 *   groupSize: 1度にまとめて出すウェーブの数（1 + 動いている角笛の数）
 */
export function resolveLayout(map, layout) {
  const facilities = layout.facilities;

  // 製造施設の作業場所にいるモンスター
  const workCells = new Map(); // 'x,y' → 製造施設
  for (const f of facilities) for (const c of cellsOf(FACILITIES[f.kind].shape, f.x, f.y, f.dir, 'work')) workCells.set(keyOf(c), f);
  const working = new Set();
  const workerOf = new Map(); // 製造施設 id → uid
  for (const m of layout.monsters) {
    const f = workCells.get(keyOf(m));
    if (f) {
      working.add(m.uid);
      if (!workerOf.has(f.id)) workerOf.set(f.id, m.uid);
    }
  }

  const free = layout.monsters
    .filter((m) => !working.has(m.uid))
    .map((m) => ({ ...m, element: MONSTERS[m.kind].element, targets: new Set(targetsOf(m).map(keyOf)) }));
  const prod = production(map.nodes, free);

  // 資材を割り当てる。鍛冶場が動いていなければ、鍛冶場が要る施設は資材を使わずに止める
  const withCost = (list) => list.map((f) => ({ ...f, cost: FACILITIES[f.kind].cost }));
  let alloc = allocate(prod.bag, withCost(facilities));
  const producing = (kind) =>
    facilities.some((f) => f.kind === kind && alloc.active.has(f.id) && workerOf.has(f.id));
  const blocked = new Set(facilities.filter((f) => FACILITIES[f.kind].requires && !producing(FACILITIES[f.kind].requires)).map((f) => f.id));
  if (blocked.size) alloc = allocate(prod.bag, withCost(facilities.filter((f) => !blocked.has(f.id))));

  const status = new Map();
  for (const f of facilities) {
    const def = FACILITIES[f.kind];
    if (blocked.has(f.id)) status.set(f.id, 'needs-smithy');
    else if (!alloc.active.has(f.id)) status.set(f.id, 'materials');
    else if (def.type === 'production' && !workerOf.has(f.id)) status.set(f.id, 'no-worker');
    else status.set(f.id, 'active');
  }
  const running = facilities.filter((f) => status.get(f.id) === 'active');

  // 戦闘ユニット
  const buffs = running
    .filter((f) => FACILITIES[f.kind].buff)
    .map((f) => ({ buff: FACILITIES[f.kind].buff, cells: new Set(targetsOf(f).map(keyOf)) }));
  const units = [];
  for (const m of free) {
    const def = MONSTERS[m.kind];
    let atkAdd = 0;
    let speedAdd = 0;
    for (const b of buffs) {
      if (!b.cells.has(keyOf(m))) continue;
      atkAdd += b.buff.atkAdd ?? 0;
      speedAdd += b.buff.speedAdd ?? 0;
    }
    units.push({
      id: m.uid,
      source: 'monster',
      x: m.x,
      y: m.y,
      element: def.element,
      atk: def.atk * (1 + atkAdd),
      interval: def.interval / (1 + speedAdd),
      targets: m.targets,
      buffed: { sword: atkAdd > 0, flag: speedAdd > 0 },
    });
  }
  for (const f of running) {
    const def = FACILITIES[f.kind];
    if (!def.atk) continue;
    units.push({ id: f.id, source: 'facility', x: f.x, y: f.y, element: 'none', atk: def.atk, interval: def.interval, targets: new Set(targetsOf(f).map(keyOf)), buffed: {} });
  }
  const groupSize = 1 + running.filter((f) => FACILITIES[f.kind].effect === 'group').length;

  return { working, workerOf, prod, alloc, status, units, groupSize };
}
