// 置いたモンスターと動いている施設から、戦闘で攻撃する「ユニット」の一覧を作る。
import { MONSTERS } from '../data/monsters.js';
import { FACILITIES } from '../data/facilities.js';
import { cellDist } from './map.js';

/**
 * monsters:   [{ uid, kind, x, y }]
 * facilities: [{ id, kind, x, y }]（動いているものだけを渡す）
 * 戻り値: { units, overlap }
 *   units = [{ id, source:'monster'|'facility', x, y, element, atk, interval, range, buffed }]
 *   overlap = 進行施設「連戦の角笛」が動いているか
 */
export function buildUnits(monsters, facilities) {
  const swords = facilities.filter((f) => FACILITIES[f.kind].buff?.atkAdd);
  const flags = facilities.filter((f) => FACILITIES[f.kind].buff?.speedAdd);
  const units = [];
  for (const m of monsters) {
    const def = MONSTERS[m.kind];
    let atkAdd = 0;
    let speedAdd = 0;
    for (const s of swords) if (cellDist(m, s) <= FACILITIES[s.kind].buff.radius) atkAdd += FACILITIES[s.kind].buff.atkAdd;
    for (const f of flags) if (cellDist(m, f) <= FACILITIES[f.kind].buff.radius) speedAdd += FACILITIES[f.kind].buff.speedAdd;
    units.push({
      id: m.uid,
      source: 'monster',
      x: m.x,
      y: m.y,
      element: def.element,
      atk: def.atk * (1 + atkAdd),
      interval: def.interval / (1 + speedAdd),
      range: def.range,
      buffed: { sword: atkAdd > 0, flag: speedAdd > 0 },
    });
  }
  for (const f of facilities) {
    const def = FACILITIES[f.kind];
    if (!def.atk) continue;
    units.push({ id: f.id, source: 'facility', x: f.x, y: f.y, element: 'none', atk: def.atk, interval: def.interval, range: def.range, buffed: {} });
  }
  const overlap = facilities.some((f) => FACILITIES[f.kind].effect === 'overlap');
  return { units, overlap };
}
