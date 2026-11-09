// 地域の進み方：どの地域が開いているか。画面なしで動く。
import { REGIONS } from '../data/regions.js';

/** 地域が開いているか。requires の地域を攻略していれば開く（requires がなければ最初から開いている）。 */
export function regionOpen(save, regionId) {
  const req = REGIONS[regionId].requires;
  return !req || !!save.regions[req]?.cleared;
}

/** regionId をはじめて攻略したときに開く地域 */
export function opensAfter(regionId) {
  return Object.keys(REGIONS).filter((id) => REGIONS[id].requires === regionId);
}
