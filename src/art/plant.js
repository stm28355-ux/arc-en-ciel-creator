// プラント系の絵
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { head, dress, leaf, flower, twinkle } from './parts.js';

// 草原の花から生まれた、葉っぱの服を着た小さな精
const sprite = () => {
  const c = makeCanvas();
  const L = C.leaf;
  c.ellipse(8, 17, 3.2, 2, '#d8f7c8').ellipse(24, 17, 3.2, 2, '#d8f7c8');
  c.rect(13, 26, 2, 3, C.skin[1]).rect(17, 26, 2, 3, C.skin[2]);
  dress(c, L, { top: 17, bottom: 26, wTop: 3.5, wBottom: 7 });
  c.dots([[10, 26], [14, 26], [18, 26], [22, 26]], L[3]);
  c.rect(10, 19, 2, 2, C.skin[1]).rect(21, 19, 2, 2, C.skin[2]);
  head(c, { cy: 11.5, rx: 6.5, ry: 6 });
  c.ellipse(16, 7.5, 7, 3.5, L[1], (x, y) => y < 9);
  c.dots([[10, 9], [11, 9], [21, 9], [22, 9]], L[1]);
  flower(c, 21.5, 5, 1.8, C.pink[1], C.gold[1]);
  c.eyes(13, 11, 5, 'dot').mouth(15, 15, 'smile2');
  return c.outline().shadow(16, 29.5, 7).finish();
};

// のはらの精が、森に認められた姿。葉っぱのマントと冠
const forestsprite = () => {
  const c = makeCanvas();
  const L = C.leaf;
  c.poly([[9, 16], [23, 16], [27, 28], [5, 28]], L[2]);
  c.recolor(L[2], L[3], (x, y) => y >= 26 || x >= 23);
  c.rect(13, 26, 2, 3, C.skin[1]).rect(17, 26, 2, 3, C.skin[2]);
  dress(c, C.wood, { top: 18, bottom: 26, wTop: 3, wBottom: 5 });
  head(c, { cy: 11, rx: 7, ry: 6.5 });
  c.ellipse(16, 7, 7.5, 3.5, L[2], (x, y) => y < 8.5);
  c.rect(8, 7, 2, 10, L[2]).rect(22, 7, 2, 10, L[2]);
  leaf(c, 11, 3.5, 3.2, -2.2, L[1]);
  leaf(c, 16, 2, 3.2, -Math.PI / 2, L[1]);
  leaf(c, 21, 3.5, 3.2, -0.95, L[1]);
  c.eyes(13, 11, 5, 'happy').mouth(15, 14, 'smile2');
  c.outline();
  leaf(c, 3, 10, 2, 0.6, L[0]);
  leaf(c, 28, 20, 2, -0.6, L[0]);
  return c.shadow(16, 29.5, 11).finish();
};

// 地面をはうツタのかたまり。すき間から目がのぞく
const vine = () => {
  const c = makeCanvas();
  const M = C.moss;
  c.line(9, 21, 6, 15, M[2], 2).line(6, 15, 8, 11, M[2], 2).line(8, 11, 11, 12, M[2], 2);
  c.line(23, 21, 26, 14, M[2], 2).line(26, 14, 24, 10, M[2], 2).line(24, 10, 21, 11, M[2], 2);
  c.ellipse(16, 22, 11, 6.5, M[2]);
  c.rect(6, 26, 20, 2, PAL.earth[2]);
  for (const [x0, y0, x1, y1] of [[7, 22, 13, 17], [12, 26, 20, 17], [18, 26, 25, 20], [9, 25, 15, 21]]) c.line(x0, y0, x1, y1, M[1]);
  leaf(c, 11, 17, 2.4, -0.5, C.leaf[1]);
  leaf(c, 22, 17, 2.4, -2.6, C.leaf[1]);
  leaf(c, 16, 16, 2, -Math.PI / 2, C.leaf[1]);
  c.rect(12, 20, 8, 3, M[3]);
  c.eyes(13, 20, 5, 'dot', '#fff6a8');
  c.px(13, 20, INK).px(18, 20, INK);
  return c.outline().shadow(16, 29.5, 12).finish();
};

// 千年生きた大木に宿る主
const ancienttree = () => {
  const c = makeCanvas();
  const W = C.wood;
  const L = C.leaf;
  c.line(10, 26, 4, 28, W[2], 2).line(22, 26, 28, 28, W[2], 2);
  c.poly([[11, 13], [21, 13], [23, 28], [9, 28]], W[1]);
  c.recolor(W[1], W[2], (x) => x >= 18);
  c.line(13, 19, 13, 27, W[3]).line(19, 21, 19, 27, W[3]);
  c.ellipse(16, 9.5, 14, 8, L[2]);
  c.ellipse(11, 7, 6, 4.5, L[1]).ellipse(20, 6, 6, 4, L[1]).ellipse(16, 4, 5, 3, L[1]);
  c.recolor(L[2], L[3], (x, y) => y >= 14);
  c.dots([[8, 5], [18, 3], [23, 8]], L[0]);
  c.eyes(13, 18, 5, 'line').mouth(16, 22, 'flat');
  c.ellipse(16, 25.5, 1.5, 1.5, W[3]);
  return c.outline().shadow(16, 29.5, 13).finish();
};

// 夕暮れにだけ咲く花の精（光と影のまざった花びら）
const twilight = () => {
  const c = makeCanvas();
  const P = PAL.light;
  c.line(16, 18, 16, 27, C.leaf[2], 2);
  leaf(c, 12, 23, 3.5, -0.5, C.leaf[1]);
  leaf(c, 20.5, 24, 3.5, -2.6, C.leaf[1]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const dusk = i >= 2 && i <= 5;
    c.ellipse(16 + Math.cos(a) * 7, 11 + Math.sin(a) * 6.5, 3.4, 3.2, dusk ? C.purple[2] : '#ffb870');
  }
  c.ellipse(16, 11, 5.5, 5, P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 19 && y >= 12);
  c.eyes(13, 10, 5, 'dot').mouth(16, 13, 'smile');
  c.outline();
  twinkle(c, 28, 4, P[0]);
  return c.shadow(16, 29.5, 7).finish();
};

// 毒々しいもようのキノコ
const toadstool = () => {
  const c = makeCanvas();
  const K = C.purple;
  c.ellipse(16, 21.5, 5.5, 6.5, '#f7ecd8', (x, y) => y < 28);
  c.recolor('#f7ecd8', '#dccbb0', (x) => x >= 19);
  c.ellipse(16, 12, 13, 8, K[2], (x, y) => y < 15);
  c.recolor(K[2], K[3], (x, y) => y >= 13 || x >= 25);
  c.rect(5, 14, 22, 1, '#e8d8bc');
  for (const [x, y, r] of [[10, 9, 1.8], [17, 7, 2], [23, 10, 1.6], [13, 12, 1.2], [6, 12, 1]]) c.ellipse(x, y, r, r, '#d6f56b');
  c.eyes(13, 19, 5, 'dot').mouth(16, 23, 'cat');
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 霜の花びらをもつ精
const frostflower = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  dress(c, P, { top: 18, bottom: 27, wTop: 3, wBottom: 8 });
  for (let x = 8; x <= 23; x += 3) c.poly([[x, 26], [x + 3, 26], [x + 1.5, 29]], P[2]);
  c.rect(10, 19, 2, 2, C.skin[1]).rect(21, 19, 2, 2, C.skin[2]);
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    const x = 16 + Math.cos(a) * 7.5;
    const y = 11 + Math.sin(a) * 7;
    c.poly([[x + Math.cos(a) * 3.5, y + Math.sin(a) * 3.5], [x + Math.cos(a + 1.6) * 2, y + Math.sin(a + 1.6) * 2], [x - Math.cos(a) * 2, y - Math.sin(a) * 2], [x + Math.cos(a - 1.6) * 2, y + Math.sin(a - 1.6) * 2]], i % 2 ? P[1] : P[0]);
  }
  head(c, { cy: 12, rx: 6.5, ry: 6, skin: ['#ffffff', '#f2fbff', '#d6ecf5', '#b7d4e2'] });
  c.ellipse(16, 8, 7, 3, P[2], (x, y) => y < 9);
  c.eyes(13, 12, 5, 'dot', '#2b4a6b').mouth(15, 15, 'smile2', '#2b4a6b');
  c.outline();
  twinkle(c, 27, 5, WHITE);
  twinkle(c, 4, 22, WHITE);
  return c.shadow(16, 29.5, 8).finish();
};

// 森でいちばん古い木に宿った主。枝の角と、こけのひげ
const forestlord = () => {
  const c = makeCanvas();
  const W = C.wood;
  const P = PAL.wind;
  c.line(10, 10, 6, 4, W[2], 2).line(7, 6, 3, 6, W[2], 1).line(8, 7, 9, 2, W[2], 1);
  c.line(22, 10, 26, 4, W[2], 2).line(25, 6, 29, 6, W[2], 1).line(24, 7, 23, 2, W[2], 1);
  c.ellipse(16, 19, 13, 9.5, P[2], (x, y) => y < 28.5);
  c.ellipse(11, 14, 6, 4, P[1]).ellipse(21, 13, 5, 3.5, P[1]);
  c.recolor(P[2], P[3], (x, y) => y >= 25);
  c.poly([[11, 20], [21, 20], [19, 28], [16, 26], [13, 28]], C.moss[0]);
  c.dots([[13, 23], [16, 24], [19, 23], [14, 26], [18, 26]], C.moss[1]);
  c.ellipse(16, 18, 1.4, 1.6, W[2]);
  c.eyes(11, 15, 8, 'dot', '#1d4a2c');
  c.px(11, 15, '#fff6a8').px(19, 15, '#fff6a8');
  c.outline();
  leaf(c, 3, 16, 2, 0.4, C.leaf[0]);
  leaf(c, 29, 22, 2, -0.4, C.leaf[0]);
  return c.shadow(16, 29.5, 13).finish();
};

export const PLANT = { sprite, forestsprite, vine, ancienttree, twilight, toadstool, frostflower, forestlord };
