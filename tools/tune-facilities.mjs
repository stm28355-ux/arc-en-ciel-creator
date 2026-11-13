// 調整の基準（tools/sim-region.mjs の STAGES）の施設の組み合わせを、少しずつ変えて良くする。
// 「ふつうに工夫する人」が選びそうな施設にするため（並べ方しだいで、資材を取り合ってかえって弱くなることがある）。
//   node tools/tune-facilities.mjs desert         砂漠だけ
//   node tools/tune-facilities.mjs                全部の地域
// 1つずつ「外す」「足す」を試し、攻略できるレベルが下がるものを選ぶ。下がらなくなったら止める。結果は表示するだけ
// （STAGES に手で写す）。置き方の w も 0.5〜2 を試す。
import { REGIONS } from '../src/data/regions.js';
import { FACILITIES, FACILITY_ORDER } from '../src/data/facilities.js';
import { STAGES, stageLayout, simulate } from './sim-region.mjs';
import { parseMap } from '../src/core/map.js';

const WEIGHTS = [0.5, 1, 1.5, 2];
const PROVINCE_OF = { p1: 1, p2: 2, p3: 3, p4: 4 };
// 施設が使えるようになる地方（建設の一覧の並び：第1地方の施設 → 第2地方 …）
const FAC_PROVINCE = {};
{
  let p = 1;
  for (const k of FACILITY_ORDER) {
    if (k === 'fog') p = 2;
    if (k === 'brazier') p = 3;
    if (k === 'altar') p = 4;
    FAC_PROVINCE[k] = p;
  }
}

const won = (id, stage, lv) => simulate(id, stageLayout(id, lv, stage)).b.phase === 'won';
/** 攻略できる一番低いレベル（upTo より下だけ探す。upTo でも勝てなければ upTo+1 を返す） */
function clearBelow(id, stage, upTo) {
  if (!won(id, stage, upTo)) return upTo + 1;
  let lo = 0;
  let hi = upTo;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (won(id, stage, mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

export function improve(id, log = console.log) {
  const base = STAGES[id];
  const province = PROVINCE_OF[REGIONS[id].province];
  // 足してみる施設：その地方までの施設のうち、地域の資源地と持ち込みの資源地の属性だけで建てられるもの。
  // 製造施設は、それが要る施設と一緒にだけ足す（作業するモンスターが1体増えるので、製造施設だけを足すと強く見えてしまう）
  const have = new Set([...parseMap(REGIONS[id].map).nodes.map((n) => n.element), ...(base.carry ?? [])]);
  const affordable = (k) => Object.keys(FACILITIES[k].cost).every((e) => have.has(e));
  const pool = FACILITY_ORDER.filter(
    (k) => FAC_PROVINCE[k] <= province && FACILITIES[k].type === 'combat' && affordable(k) && (!FACILITIES[k].requires || affordable(FACILITIES[k].requires)),
  );
  const mk = (facilities, w) => ({ ...base, facilities, w });
  let best = { facilities: base.facilities, w: base.w };
  best.lv = clearBelow(id, mk(best.facilities, best.w), 99);
  log(`${REGIONS[id].name}: 今 Lv${best.lv}（${best.facilities.map((k) => FACILITIES[k].name).join('・')}、w${best.w}）`);
  for (let round = 0; round < 8; round++) {
    const cands = [];
    for (const k of new Set(best.facilities)) {
      const i = best.facilities.lastIndexOf(k);
      let next = best.facilities.filter((_, j) => j !== i);
      // 製造施設を外すときは、それが要る施設も外す
      if (FACILITIES[k].type === 'production') next = next.filter((x) => FACILITIES[x].requires !== k);
      // それが要る施設がなくなった製造施設は外す
      next = next.filter((x) => FACILITIES[x].type !== 'production' || next.some((y) => FACILITIES[y].requires === x));
      cands.push({ facilities: next, note: `${FACILITIES[k].name}を1つ外す` });
    }
    for (const k of pool) {
      const req = FACILITIES[k].requires;
      const add = req && !best.facilities.includes(req) ? [req, k] : [k];
      if (best.facilities.filter((x) => x === k).length >= 3 || best.facilities.length >= 20) continue;
      cands.push({ facilities: [...best.facilities, ...add], note: `${FACILITIES[k].name}を足す` });
    }
    let found = null;
    for (const c of cands) {
      for (const w of [best.w]) {
        const target = (found?.lv ?? best.lv) - 1;
        if (target < 1) break;
        const lv = clearBelow(id, mk(c.facilities, w), target);
        if (lv <= target) found = { ...c, w, lv };
      }
    }
    if (!found) {
      // 置き方の w を変えてみる
      for (const w of WEIGHTS) {
        if (w === best.w) continue;
        const target = (found?.lv ?? best.lv) - 1;
        if (target < 1) break;
        const lv = clearBelow(id, mk(best.facilities, w), target);
        if (lv <= target) found = { facilities: best.facilities, w, lv, note: `置き方を w${w} に` };
      }
    }
    if (!found) break;
    best = found;
    log(`  → Lv${best.lv}：${found.note}（w${best.w}）`);
  }
  log(`  結果 Lv${best.lv} w${best.w} [${best.facilities.map((k) => `'${k}'`).join(', ')}]`);
  return best;
}

const only = process.argv.slice(2);
for (const id of Object.keys(STAGES)) if (!only.length || only.includes(id)) improve(id);
