// 地域マップの配置から、作業中のモンスター・資材・施設の状態・戦闘ユニットをまとめて計算する。
// 配置が変わるたびに呼び直す（画面なしでも動く）。
import { MONSTERS } from '../data/monsters.js';
import { FACILITIES } from '../data/facilities.js';
import { production, allocate } from './materials.js';
import { cellsOf, keyOf } from './shape.js';
import { atkAt } from './alchemy.js';

/** 置き物（モンスターか施設）の定義。 */
export function defOf(item) {
  return item.uid ? MONSTERS[item.kind] : FACILITIES[item.kind];
}

export function footprintOf(item) {
  return cellsOf(defOf(item).shape, item.x, item.y, item.dir, 'footprint');
}

/** モンスターは持っている技の範囲を全部合わせる。 */
export function targetsOf(item) {
  if (!item.uid) return cellsOf(defOf(item).shape, item.x, item.y, item.dir, 'targets');
  const seen = new Map();
  for (const k of skillList(item)) for (const c of skillTargets(item, k)) seen.set(keyOf(c), c);
  return [...seen.values()];
}

/** 置いたモンスターの技（種類のID）。skills がなければ自分の技だけ。 */
export function skillList(m) {
  return m.skills?.length ? m.skills : [m.kind];
}

function skillTargets(m, skill) {
  return cellsOf(MONSTERS[skill].shape, m.x, m.y, m.dir, 'targets');
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
 * layout.monsters の各要素は { uid, kind, x, y, dir, level?, skills?, atkMul? }（level がなければ1、skills がなければ自分の技だけ。atkMul は研究の攻撃力）。
 * layout.facilityMul：研究「戦闘施設の強化」の倍率（光線塔の攻撃力、剣・旗の効き目）。
 * layout.carrySlots：研究で持ち込める資源地の数（なければ置いた分だけ全部効く）。持ち込みの資源地は facilities に kind 'carry' で入る。
 * 戻り値：
 *   working:   Set<uid>         製造施設で作業しているモンスター（作業場所にいて、攻撃範囲が施設に重なる）
 *   prod:      production() の戻り値
 *   alloc:     allocate() の戻り値
 *   status:    Map<id, 'active'|'materials'|'no-worker'|'needs-smithy'>
 *   units:     戦闘で攻撃するもの [{ id, owner?, skill?, source, x, y, element, atk, interval, targets:Set, buffed }]
 *              モンスターは技1つにつき1ユニット（id = 'uid:技'、owner = uid）
 *   groupSize: 1度にまとめて出すウェーブの数（1 + 動いている角笛の数）
 *   carried:   資材が入る持ち込みの資源地 [{ x, y, element }]
 *   slow:      Map<'x,y', 0〜1> 敵を遅くするマスと割合（霧の噴水）
 *   units の splash = true は、範囲のマスにいる敵すべてに当たる（雷の塔）
 */
export function resolveLayout(map, layout) {
  const facilities = layout.facilities;

  const all = layout.monsters.map((m) => ({ ...m, element: MONSTERS[m.kind].element, targets: new Set(targetsOf(m).map(keyOf)) }));

  // 製造施設の作業：作業場所にいて、攻撃範囲が製造施設のマスに重なっているモンスター。
  // 作業していても、攻撃も生産もする（作業場所の縛りで、変わった配置を考える面白さを出す）
  const workCells = new Map(); // 'x,y' → 製造施設
  for (const f of facilities) for (const c of cellsOf(FACILITIES[f.kind].shape, f.x, f.y, f.dir, 'work')) workCells.set(keyOf(c), f);
  const working = new Set();
  const workerOf = new Map(); // 製造施設 id → uid
  for (const m of all) {
    const f = workCells.get(keyOf(m));
    if (!f || !footprintOf(f).some((c) => m.targets.has(keyOf(c)))) continue;
    working.add(m.uid);
    if (!workerOf.has(f.id)) workerOf.set(f.id, m.uid);
  }

  // 持ち込みの資源地（研究）。持ち込める数より多く置いていれば、あとから置いたものは効かない
  const carrySlots = layout.carrySlots ?? Infinity;
  const carryOn = new Set(facilities.filter((f) => f.kind === 'carry').slice(0, carrySlots).map((f) => f.id));
  const carried = facilities.filter((f) => carryOn.has(f.id)).map((f) => ({ x: f.x, y: f.y, element: f.element }));
  const prod = production([...map.nodes, ...carried], all);

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
    if (def.type === 'carry') status.set(f.id, carryOn.has(f.id) ? 'active' : 'research-off');
    else if (blocked.has(f.id)) status.set(f.id, 'needs-smithy');
    else if (!alloc.active.has(f.id)) status.set(f.id, 'materials');
    else if (def.type === 'production' && !workerOf.has(f.id)) status.set(f.id, 'no-worker');
    else status.set(f.id, 'active');
  }
  const running = facilities.filter((f) => status.get(f.id) === 'active');

  // 戦闘ユニット
  const buffs = running
    .filter((f) => FACILITIES[f.kind].buff)
    .map((f) => ({ buff: FACILITIES[f.kind].buff, cells: new Set(targetsOf(f).map(keyOf)) }));
  const facilityMul = layout.facilityMul ?? 1; // 研究「戦闘施設の強化」
  const units = [];
  for (const m of all) {
    const def = MONSTERS[m.kind];
    let atkAdd = 0;
    let speedAdd = 0;
    for (const b of buffs) {
      if (!b.cells.has(keyOf(m))) continue;
      atkAdd += (b.buff.atkAdd ?? 0) * facilityMul;
      speedAdd += (b.buff.speedAdd ?? 0) * facilityMul;
    }
    for (const skill of skillList(m)) {
      units.push({
        id: `${m.uid}:${skill}`,
        owner: m.uid,
        skill,
        source: 'monster',
        x: m.x,
        y: m.y,
        element: def.element,
        atk: atkAt(skill, m.level) * (1 + atkAdd) * (m.atkMul ?? 1),
        interval: MONSTERS[skill].interval / (1 + speedAdd),
        targets: new Set(skillTargets(m, skill).map(keyOf)),
        buffed: { sword: atkAdd > 0, flag: speedAdd > 0 },
      });
    }
  }
  for (const f of running) {
    const def = FACILITIES[f.kind];
    if (!def.atk) continue;
    units.push({ id: f.id, source: 'facility', x: f.x, y: f.y, element: 'none', atk: def.atk * facilityMul, interval: def.interval, targets: new Set(targetsOf(f).map(keyOf)), buffed: {}, splash: !!def.splash });
  }
  const groupSize = 1 + running.filter((f) => FACILITIES[f.kind].effect === 'group').length;

  // 足止め：動いている霧の噴水の範囲のマス → 遅くする割合（重ねても一番大きいものだけ。戦闘施設の強化で増える。80%まで）
  const slow = new Map();
  for (const f of running) {
    const s = FACILITIES[f.kind].slow;
    if (!s) continue;
    const v = Math.min(0.8, s * facilityMul);
    for (const c of targetsOf(f)) slow.set(keyOf(c), Math.max(slow.get(keyOf(c)) ?? 0, v));
  }

  return { working, workerOf, prod, alloc, status, units, groupSize, carried, slow };
}
