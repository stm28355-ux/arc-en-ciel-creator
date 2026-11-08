// 生産と建設。資材は時間では貯まらず、モンスターの配置で決まる固定の量（企画まとめ「生産」）。
import { emptyBag, ELEMENT_IDS } from '../data/elements.js';
import { cellDist } from './map.js';

// 仮の数値
export const YIELD_ADJACENT = 2; // 資源地のとなり8マスに置いた
export const YIELD_IN_RANGE = 1; // となりではないが、攻撃範囲に資源地が入っている
export const YIELD_SAME_ELEMENT = 1; // モンスターと資源地の属性が同じなら上乗せ

/**
 * 1体のモンスターが1つの資源地から得る資材の量。
 * monster = { x, y, element, range }
 */
export function yieldFrom(monster, node) {
  const adjacent = Math.max(Math.abs(monster.x - node.x), Math.abs(monster.y - node.y)) <= 1;
  let amount = 0;
  if (adjacent) amount = YIELD_ADJACENT;
  else if (cellDist(monster, node) <= monster.range) amount = YIELD_IN_RANGE;
  if (amount > 0 && monster.element === node.element) amount += YIELD_SAME_ELEMENT;
  return amount;
}

/** 置いたモンスター全員から得る資材の合計。 */
export function production(nodes, monsters) {
  const bag = emptyBag();
  const perMonster = monsters.map(() => emptyBag());
  monsters.forEach((m, i) => {
    for (const node of nodes) {
      const a = yieldFrom(m, node);
      bag[node.element] += a;
      perMonster[i][node.element] += a;
    }
  });
  return { bag, perMonster };
}

/**
 * 建てた施設に資材を割り当てる。facilities は建てた順。
 * 資材が足りないときは、足りない属性を使う施設のうち一番最後に建てたものから止める
 * （企画まとめ「未決事項」への回答）。止めたあと、足りるようになった施設は建てた順に動き直す。
 * 戻り値：{ active: Set<id>, stopped: Set<id>, used, remaining }
 */
export function allocate(bag, facilities) {
  const active = new Set(facilities.map((f) => f.id));
  for (;;) {
    let used = sumCost(facilities.filter((f) => active.has(f.id)));
    const short = ELEMENT_IDS.filter((id) => used[id] > (bag[id] ?? 0));
    if (short.length === 0) {
      // 止めた施設のうち、今の残りで足りるものは建てた順に動かし直す
      const left = emptyBag();
      for (const id of ELEMENT_IDS) left[id] = (bag[id] ?? 0) - used[id];
      for (const f of facilities) {
        if (active.has(f.id) || !canAfford(left, f.cost)) continue;
        active.add(f.id);
        for (const [id, n] of Object.entries(f.cost)) left[id] -= n;
        used = sumCost(facilities.filter((g) => active.has(g.id)));
      }
      const remaining = emptyBag();
      for (const id of ELEMENT_IDS) remaining[id] = (bag[id] ?? 0) - used[id];
      const stopped = new Set(facilities.filter((f) => !active.has(f.id)).map((f) => f.id));
      return { active, stopped, used, remaining };
    }
    const victim = [...facilities].reverse().find((f) => active.has(f.id) && short.some((id) => (f.cost[id] ?? 0) > 0));
    active.delete(victim.id);
  }
}

function sumCost(list) {
  const used = emptyBag();
  for (const f of list) for (const [id, n] of Object.entries(f.cost)) used[id] += n;
  return used;
}

/** 今の残りで、この費用の施設を新しく建てられるか。 */
export function canAfford(remaining, cost) {
  return Object.entries(cost).every(([id, n]) => (remaining[id] ?? 0) >= n);
}
