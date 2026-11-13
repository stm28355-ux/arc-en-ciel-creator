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

// ===== 名簿を200種にしたとき =====

// 宙に浮かぶ何かの種。穴の中は見えない（のぞくと心をみだされる）
const voidseed = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#e8e4f0', '#c4bdd6', '#9a92b4'];
  c.poly([[16, 2], [25, 12], [24, 20], [16, 25], [8, 20], [7, 12]], P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 20 || y >= 21);
  c.line(16, 3, 16, 7, P[3]);
  c.ellipse(16, 15, 4.5, 4.5, '#1a1428');
  for (let i = 0; i < 14; i++) c.px(16 + Math.cos(i * 0.9) * (0.5 + i * 0.25), 15 + Math.sin(i * 0.9) * (0.5 + i * 0.25), '#6a4aa9');
  c.ellipse(11, 9, 1.5, 2, P[0]);
  c.outline();
  c.dots([[5, 26], [27, 24], [3, 8], [28, 6]], C.purple[1]);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// 「無」をつかさどる、宙に浮く樹（幹に穴、根がたれる）
const voidtree = () => {
  const c = makeCanvas();
  const W = ['#f4f2f8', '#d8d2e4', '#ada4c0', '#847aa0'];
  c.line(12, 22, 9, 27, W[2]).line(16, 22, 16, 28, W[2]).line(20, 22, 23, 27, W[2]);
  c.poly([[12, 12], [20, 12], [21, 23], [11, 23]], W[1]);
  c.recolor(W[1], W[2], (x) => x >= 18);
  c.ellipse(16, 17, 2.5, 3, '#1a1428');
  c.ellipse(16, 8, 13, 6.5, '#ffffff');
  c.ellipse(10, 6, 5, 3.5, '#f4f2f8').ellipse(22, 7, 5, 3.5, '#f4f2f8');
  c.recolor(['#ffffff', '#f4f2f8'], W[1], (x, y) => y >= 11);
  c.eyes(12, 8, 7, 'line', '#6a4aa9');
  c.outline();
  c.dots([[4, 18], [28, 20], [6, 22]], C.purple[1]);
  return c.shadow(16, 30, 8, 1.2).finish();
};

// 花びらが扇風機のように回る花
const tornadoflower = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  c.line(16, 18, 16, 28, C.leaf[2], 2);
  leaf(c, 12, 24, 3.2, -0.5, C.leaf[1]);
  leaf(c, 20, 25, 3.2, -2.6, C.leaf[1]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    c.poly([[16, 11], [16 + Math.cos(a) * 11, 11 + Math.sin(a) * 9], [16 + Math.cos(a + 0.6) * 8, 11 + Math.sin(a + 0.6) * 7]], i % 2 ? P[1] : '#ffe3ee');
  }
  c.ellipse(16, 11, 3.5, 3.5, C.gold[1]);
  c.eyes(14, 10, 3, 'pip').mouth(16, 12, 'smile2');
  c.outline();
  c.dots([[3, 4], [4, 3], [28, 18], [29, 17], [2, 17]], P[0]);
  return c.shadow(16, 29.5, 6).finish();
};

// 竜の形にからみあったツタ（先に爪の形の硬い実）
const dragvine = () => {
  const c = makeCanvas();
  const L = C.leaf;
  const W = PAL.wind;
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    c.ellipse(26 - t * 13 + Math.sin(t * 6) * 2 + 0.5, 27 - t * 16 + 0.5, 2.6, 2.6, i % 4 < 2 ? L[2] : L[3]);
  }
  c.ellipse(10, 9, 6, 4.5, W[1]);
  c.poly([[5, 9], [0, 11], [5, 13]], W[1]);
  c.poly([[10, 5], [13, 1], [14, 6]], L[1]).poly([[13, 6], [17, 3], [16, 8]], L[1]);
  c.eye(7, 7, 'angryL');
  for (const [x, y] of [[20, 18], [23, 24]]) c.poly([[x, y], [x + 4, y - 2], [x + 2, y + 2]], '#e8c47a');
  c.outline();
  leaf(c, 28, 14, 2, -0.5, L[0]);
  return c.shadow(18, 29.5, 9).finish();
};

// 葉っぱの筒から、からい種を飛ばす
const peppercannon = () => {
  const c = makeCanvas();
  const L = C.leaf;
  c.ellipse(16, 25, 7, 3.5, C.wood[2]);
  c.poly([[11, 24], [8, 9], [14, 6], [20, 10], [21, 24]], L[1]);
  c.recolor(L[1], L[2], (x) => x >= 17);
  c.ellipse(11, 7.5, 3.5, 2.5, L[3]).ellipse(11, 7.5, 2, 1.4, '#3a2a20');
  c.eyes(12, 15, 5, 'angry').mouth(15, 19, 'flat');
  c.outline();
  for (const [x, y] of [[5, 3], [2, 6]]) c.ellipse(x, y, 1.6, 1.2, PAL.fire[2]);
  c.dots([[7, 1], [3, 2]], C.lava[1]);
  return c.shadow(16, 29.5, 8).finish();
};

// 雷の性質をもつ4本の草（四方を向く）
const denraishisou = () => {
  const c = makeCanvas();
  const Y = PAL.thunder;
  c.ellipse(16, 24, 8, 4, C.wood[1], (x, y) => y >= 22);
  c.rect(8, 21, 16, 2, C.wood[2]);
  for (const [x0, x1, y1] of [[11, 5, 9], [14, 12, 4], [18, 20, 4], [21, 27, 9]]) {
    c.line(x0, 21, x1, y1, C.leaf[2], 2);
    c.poly([[x1 - 1.5, y1 + 1], [x1 + 1.5, y1 - 2], [x1 + 0.5, y1 + 1], [x1 + 2, y1 + 1]], Y[1]);
  }
  c.eyes(13, 24, 5, 'dot').mouth(16, 26, 'smile2');
  c.outline();
  c.dots([[3, 4], [29, 3], [16, 0]], Y[0]);
  return c.shadow(16, 29.5, 9).finish();
};

// たんぽぽの綿毛に宿った小さな精
const dandelion = () => {
  const c = makeCanvas();
  c.line(16, 16, 16, 27, C.leaf[2]);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    c.ellipse(16 + Math.cos(a) * 8, 11 + Math.sin(a) * 7.5, 2.2, 2.2, '#ffffff');
  }
  c.ellipse(16, 11, 8, 7.5, '#ffffff');
  c.each((x, y) => { if (c.get(x, y) === '#ffffff' && (x * 7 + y * 3) % 5 === 0) c.px(x, y, '#e6eef8'); });
  c.ellipse(16, 11, 4.5, 4, '#fff6d6');
  leaf(c, 13, 25, 3, -0.4, C.leaf[1]);
  c.eyes(14, 10, 3, 'dot').mouth(16, 13, 'smile2');
  c.outline();
  c.dots([[28, 24], [27, 26], [4, 26]], '#ffffff');
  return c.shadow(16, 29.5, 5).finish();
};

// たそがれの精が、夜明けの光を浴びた姿
const dawnsprite = () => {
  const c = makeCanvas();
  const P = PAL.light;
  c.line(16, 18, 16, 27, C.leaf[2], 2);
  leaf(c, 12, 23, 3.5, -0.5, C.leaf[1]);
  leaf(c, 20.5, 24, 3.5, -2.6, C.leaf[1]);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    c.ellipse(16 + Math.cos(a) * 7.5, 11 + Math.sin(a) * 7, 3, 3, i % 2 ? '#ffb4a0' : P[1]);
  }
  c.ellipse(16, 11, 5.5, 5, '#fff8e0');
  c.eyes(13, 10, 5, 'happy').mouth(16, 13, 'smile');
  c.outline();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.5;
    c.px(16 + Math.cos(a) * 14, 11 + Math.sin(a) * 12, P[0]);
  }
  return c.shadow(16, 29.5, 7).finish();
};

// どくキノコが闇を吸って育った姿（うずまきのもよう）
const illusionshroom = () => {
  const c = makeCanvas();
  const K = ['#d8c4f2', '#5a3a96', '#432a78', '#2e1c56'];
  c.ellipse(16, 22, 5, 6, '#e8e0f4', (x, y) => y < 28);
  c.recolor('#e8e0f4', '#c4b8dc', (x) => x >= 19);
  c.ellipse(16, 12, 13, 8.5, K[1], (x, y) => y < 16);
  c.recolor(K[1], K[2], (x, y) => y >= 13 || x >= 25);
  for (const [cx, cy] of [[10, 10], [21, 9]]) for (let i = 0; i < 10; i++) c.px(cx + Math.cos(i * 1.1) * (0.4 + i * 0.25), cy + Math.sin(i * 1.1) * (0.4 + i * 0.25), '#c79bff');
  c.rect(4, 15, 24, 1, '#c4b8dc');
  c.eyes(13, 20, 5, 'closed', '#4a2a78').mouth(16, 24, 'smile2', '#4a2a78');
  c.outline();
  c.dots([[4, 5], [27, 4], [29, 20], [3, 21]], '#c79bff');
  return c.shadow(16, 29.5, 8).finish();
};

// 氷の満開をむかえた精（雪の結晶の花びら）
const icebloom = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  dress(c, P, { top: 18, bottom: 27, wTop: 3, wBottom: 8 });
  c.rect(10, 19, 2, 2, C.skin[1]).rect(21, 19, 2, 2, C.skin[2]);
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    const x = 16 + Math.cos(a) * 8.5;
    const y = 12 + Math.sin(a) * 8;
    c.line(16 + Math.cos(a) * 5, 12 + Math.sin(a) * 5, x, y, WHITE);
    c.dots([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]], P[1]);
  }
  head(c, { cy: 12, rx: 6.5, ry: 6, skin: ['#ffffff', '#f2fbff', '#d6ecf5', '#b7d4e2'] });
  c.ellipse(16, 8, 7, 3, P[2], (x, y) => y < 9);
  flower(c, 21, 7, 1.6, WHITE, P[1], 6);
  c.eyes(13, 12, 5, 'dot', '#2b4a6b').mouth(15, 15, 'smile2', '#2b4a6b');
  c.outline();
  twinkle(c, 4, 22, WHITE);
  return c.shadow(16, 29.5, 8).finish();
};

// 水の上にうかぶ、はすの花の精
const lotus = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#ffd6e6', '#f2a6c4', '#d47aa0'];
  c.ellipse(16, 25, 13, 3.5, C.leaf[2]);
  c.ellipse(16, 24.5, 12, 2.5, C.leaf[1]);
  c.poly([[16, 24], [28, 22], [28, 26]], C.leaf[3]);
  for (const [x, y, w] of [[9, 18, 4], [23, 18, 4], [12, 15, 4], [20, 15, 4], [16, 12, 4.5]]) c.ellipse(x, y, w * 0.7, w + 1, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 20);
  c.ellipse(16, 19, 5, 3.5, '#fff1a8');
  c.eyes(13, 18, 5, 'dot').mouth(16, 21, 'smile2');
  c.outline();
  c.dots([[4, 27], [28, 28]], PAL.water[1]);
  return c.finish();
};

// 暗い場所で光るこけのかたまり
const glowmoss = () => {
  const c = makeCanvas();
  const M = ['#f2ffc8', '#c8ee7a', '#94c84e', '#6a9c34'];
  c.ellipse(16, 20, 11, 8, M[2], (x, y) => y < 28);
  for (const [x, y, r] of [[10, 16, 4], [16, 13, 4.5], [22, 16, 4], [12, 21, 3.5], [20, 21, 3.5]]) c.ellipse(x, y, r, r, M[1]);
  c.recolor(M[1], M[2], (x, y) => y >= 23);
  c.dots([[11, 14], [17, 11], [23, 15], [14, 18]], '#fffbd2');
  c.eyes(12, 17, 7, 'happy').mouth(16, 20, 'smile');
  c.outline();
  twinkle(c, 4, 9, '#fffbd2');
  twinkle(c, 28, 7, '#fffbd2');
  twinkle(c, 26, 25, PAL.light[1]);
  return c.shadow(16, 29.5, 11).finish();
};

export const PLANT = { sprite, forestsprite, vine, ancienttree, twilight, toadstool, frostflower, forestlord, voidseed, voidtree, tornadoflower, dragvine, peppercannon, denraishisou, dandelion, dawnsprite, illusionshroom, icebloom, lotus, glowmoss };
