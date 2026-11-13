// 生産と建設。資材は時間では貯まらず、モンスターの配置で決まる固定の量（企画まとめ「生産」）。
import { emptyBag, ELEMENT_IDS } from '../data/elements.js';

// 仮の数値
export const YIELD_ADJACENT = 2; // 資源地のまわり8マスに置いた
export const YIELD_IN_RANGE = 1; // まわりではないが、攻撃範囲のマスに資源地がある
export const YIELD_SAME_ELEMENT = 1; // モンスターと資源地の属性が同じなら上乗せ

/**
 * 1体のモンスターが1つの資源地から得る資材の量。
 * monster = { x, y, element, targets: Set<'x,y'> }（targets = 攻撃範囲のマス）
 */
export function yieldFrom(monster, node) {
  const adjacent = Math.max(Math.abs(monster.x - node.x), Math.abs(monster.y - node.y)) <= 1;
  let amount = 0;
  if (adjacent) amount = YIELD_ADJACENT;
  else if (monster.targets.has(`${node.x},${node.y}`)) amount = YIELD_IN_RANGE;
  if (amount > 0 && monster.element === node.element) amount += YIELD_SAME_ELEMENT;
  return amount;
}

/** 置いたモンスター全員から得る資材の合計。 */
export function production(nodes, monsters) {
  const bag = emptyBag();
  const perMonster = monsters.map(() => emptyBag());
  const perNode = new Map();
  monsters.forEach((m, i) => {
    for (const node of nodes) {
      const a = yieldFrom(m, node);
      if (!a) continue;
      bag[node.element] += a;
      perMonster[i][node.element] += a;
      perNode.set(`${node.x},${node.y}`, (perNode.get(`${node.x},${node.y}`) ?? 0) + a);
    }
  });
  return { bag, perMonster, perNode };
}

/**
 * 建てた施設に資材を割り当てる。facilities は建てた順。施設は { id, cost, costAny? }。
 * costAny は「どの属性でもよい」量で、ほかの施設が使っていない資材の合計から使う（連戦の角笛）。
 * 資材が足りないときは、足りない属性を使う施設のうち一番最後に建てたものから止める
 * （企画まとめ「未決事項」への回答）。止めたあと、足りるようになった施設は建てた順に動き直す。
 * 戻り値：{ active: Set<id>, stopped: Set<id>, used, remaining }
 */
export function allocate(bag, facilities) {
  const active = new Set(facilities.map((f) => f.id));
  const on = () => facilities.filter((f) => active.has(f.id));
  for (;;) {
    let used = sumCost(on());
    const short = ELEMENT_IDS.filter((id) => used[id] > (bag[id] ?? 0));
    const left = emptyBag();
    for (const id of ELEMENT_IDS) left[id] = (bag[id] ?? 0) - used[id];
    const anyNeed = on().reduce((n, f) => n + (f.costAny ?? 0), 0);
    if (short.length === 0 && total(left) >= anyNeed) {
      // 止めた施設のうち、今の残りで足りるものは建てた順に動かし直す
      let anyLeft = total(left) - anyNeed;
      for (const f of facilities) {
        if (active.has(f.id) || !canAfford(left, f.cost)) continue;
        const need = Object.values(f.cost).reduce((a, b) => a + b, 0) + (f.costAny ?? 0);
        if (need > anyLeft) continue;
        active.add(f.id);
        for (const [id, n] of Object.entries(f.cost)) left[id] -= n;
        anyLeft -= need;
      }
      used = sumCost(on());
      const remaining = emptyBag();
      for (const id of ELEMENT_IDS) remaining[id] = (bag[id] ?? 0) - used[id];
      // どの属性でもよい分は、残りの多い属性から使う
      let rest = on().reduce((n, f) => n + (f.costAny ?? 0), 0);
      while (rest > 0) {
        const id = ELEMENT_IDS.reduce((a, b) => (remaining[b] > remaining[a] ? b : a));
        if (remaining[id] <= 0) break;
        remaining[id] -= 1;
        used[id] += 1;
        rest -= 1;
      }
      const stopped = new Set(facilities.filter((f) => !active.has(f.id)).map((f) => f.id));
      return { active, stopped, used, remaining };
    }
    const victim = short.length
      ? [...facilities].reverse().find((f) => active.has(f.id) && short.some((id) => (f.cost[id] ?? 0) > 0))
      : [...facilities].reverse().find((f) => active.has(f.id) && f.costAny);
    active.delete(victim.id);
  }
}

const total = (bag) => ELEMENT_IDS.reduce((n, id) => n + Math.max(0, bag[id] ?? 0), 0);

function sumCost(list) {
  const used = emptyBag();
  for (const f of list) for (const [id, n] of Object.entries(f.cost)) used[id] += n;
  return used;
}

/** 今の残りで、この費用の施設を新しく建てられるか。any は「どの属性でもよい」量 */
export function canAfford(remaining, cost, any = 0) {
  if (!Object.entries(cost).every(([id, n]) => (remaining[id] ?? 0) >= n)) return false;
  const leftover = ELEMENT_IDS.reduce((n, id) => n + Math.max(0, (remaining[id] ?? 0) - (cost[id] ?? 0)), 0);
  return leftover >= any;
}
