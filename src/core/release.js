// 逃がす（2026-11-15 企画者の注文：まとめて逃がしたい。エレメントに戻ってくれると嬉しい）。画面なしで動く。
// 逃がすと、そのモンスターに使ったエレメントの半分が、同じ属性で戻る（切り捨て）。
//   使ったエレメント（m.spent）：作ったとき（調合・図鑑錬成）に払った分＋レベルアップに払った分。融合で生まれたモンスターは、親2体の分を足す
//   v0.9.4 より前に作ったモンスターは記録がないので、見積もる（図鑑錬成の値段＋レベルアップの値段。払う属性は段ごとの決まりから）。
//   見積もりで「どの属性でもよい」段（61から先）は無にする（別の属性に化けないように）
import { ELEMENT_IDS } from '../data/elements.js';
import { removeMonsters, estimateSpent } from './breeding.js';

export { estimateSpent };

export const RELEASE_RATE = 0.5;

const add = (a, b) => {
  const out = { ...a };
  for (const [id, n] of Object.entries(b ?? {})) out[id] = (out[id] ?? 0) + n;
  return out;
};

/** そのモンスターに使ったエレメント */
export const spentOf = (m) => m.spent ?? estimateSpent(m);

/** 使ったエレメントを足しておく（レベルアップのとき） */
export function addSpent(m, payment) {
  m.spent = add(spentOf(m), payment);
}

/** 逃がしたときに戻るエレメント（モンスターごとの合計の半分、切り捨て） */
export function releaseRefund(monsters) {
  let total = {};
  for (const m of monsters) total = add(total, spentOf(m));
  const out = {};
  for (const id of ELEMENT_IDS) {
    const n = Math.floor((total[id] ?? 0) * RELEASE_RATE);
    if (n > 0) out[id] = n;
  }
  return out;
}

/** まとめて逃がす。手持ちと配置から消え、エレメントが戻る。戻ったエレメントを返す */
export function release(save, uids) {
  const list = save.roster.filter((m) => uids.includes(m.uid));
  const refund = releaseRefund(list);
  removeMonsters(save, list.map((m) => m.uid));
  save.elements = add(save.elements, refund);
  return refund;
}
