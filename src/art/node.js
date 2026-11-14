// 資源地の絵（2026-11-14 企画者の注文：漢字の◆では無骨なので絵にする）。32×32。
// 岩の台に属性の色の結晶が生えていて、右上に属性の小さな印（風はうず、土は小石、水はしずく…）。
import { makeCanvas, PAL, C, WHITE } from './kit.js';
import { twinkle } from './parts.js';

/** 結晶（中心の下 cx,by、高さ h、太さ w）。P は属性の色 */
function shard(c, cx, by, h, w, P) {
  c.poly([[cx - w, by], [cx - w, by - h * 0.7], [cx, by - h], [cx + w, by - h * 0.7], [cx + w, by]], P[1]);
  c.poly([[cx, by - h], [cx + w, by - h * 0.7], [cx + w, by], [cx, by]], P[2]);
  c.line(cx - w + 1, by - h * 0.65, cx - w + 1, by - 2, P[0]);
  return c;
}

/** 印（右上の小さな絵） */
const MARK = {
  none: (c) => twinkle(c, 25, 5, WHITE).px(25, 5, PAL.none[3]),
  wind: (c) => c.line(22, 6, 27, 6, PAL.wind[3]).line(27, 6, 28, 4, PAL.wind[3]).line(23, 9, 28, 9, PAL.wind[3]),
  earth: (c) => c.ellipse(25, 6, 2.6, 2, C.stone[2]).px(24, 5, C.stone[0]),
  water: (c) => c.poly([[25, 1.5], [27.8, 6], [25, 8.5], [22.2, 6]], PAL.water[2]).px(24, 5, WHITE),
  thunder: (c) => c.poly([[25, 1], [27.5, 1], [26, 4], [28, 4], [24, 9.5], [25, 5.5], [23, 5.5]], PAL.thunder[1]),
  fire: (c) => c.poly([[23, 9], [22.5, 5.5], [25, 1.5], [27.5, 5.5], [27, 9]], PAL.fire[2]).poly([[24, 9], [25, 5], [26, 9]], PAL.fire[0]),
  ice: (c) => c.line(25, 2, 25, 9, PAL.ice[3]).line(22, 4, 28, 7, PAL.ice[3]).line(22, 7, 28, 4, PAL.ice[3]),
  light: (c) => c.ellipse(25, 5.5, 2.5, 2.5, PAL.light[2]).dots([[25, 1], [25, 10], [20.5, 5.5], [29.5, 5.5]], PAL.light[2]),
  dark: (c) => c.ellipse(25, 5.5, 3, 3, PAL.dark[2]).ellipse(26.5, 4.5, 2.4, 2.4, null),
};

function node(element) {
  const c = makeCanvas();
  const P = element === 'none' ? ['#ffffff', '#f4f0ff', '#cfc6ec', '#9d93c9'] : PAL[element];
  // 岩の台
  c.ellipse(16, 25, 12, 5, C.stone[1]);
  c.ellipse(16, 24, 11, 3.5, C.stone[0]);
  c.recolor(C.stone[1], C.stone[2], (x, y) => y >= 27);
  // 結晶（まん中が大きく、左右に小さいもの）
  shard(c, 10.5, 25, 10, 2.5, P);
  shard(c, 21.5, 25, 12, 2.6, P);
  shard(c, 16, 25, 19, 3.5, P);
  c.outline();
  MARK[element](c);
  twinkle(c, 6, 9, WHITE);
  return c.finish();
}

const cache = new Map();
/** 資源地の絵（属性ごと。一度描いたら覚えておく） */
export function drawNodeSprite(element) {
  if (!MARK[element]) return null;
  if (!cache.has(element)) cache.set(element, node(element));
  return cache.get(element);
}
export const NODE_ELEMENTS = Object.keys(MARK);
