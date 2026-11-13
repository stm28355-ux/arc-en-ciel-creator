// ゲル系の絵
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';

const RAINBOW = ['#ff8a8a', '#ffb870', '#ffe66e', '#9be8a6', '#86e0f0', '#8ab4ff', '#c79bf2'];

// しずく形の体（下が丸く、上がとがる）
export function dropBody(c, P, { cx = 16, cy = 21, rx = 11, ry = 7, top = 7.5, coneW = 9.5, bottom = 28 } = {}) {
  c.each((x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    const dx = (px - cx) / rx;
    const dy = (py - cy) / ry;
    const inBall = dx * dx + dy * dy <= 1 && py <= bottom;
    const inCone = py >= top && py <= cy && Math.abs(px - cx) <= Math.pow((py - top) / (cy - top), 0.85) * coneW;
    if (inBall || inCone) c.px(x, y, P[1]);
  });
  c.shadeBody(P[1], P[2], { cx: cx - 2.5, cy: cy - 2.5, rx: rx + 1, ry: ry + 2.5 });
  c.recolor(P[2], P[3], (x, y) => y >= bottom - 1);
  c.rect(cx - 6, cy - 6, 1, 3, P[0]).px(cx - 4, cy - 9, P[0]);
  return c;
}

// まるい体（下は平ら）
export function blobBody(c, P, { cx = 16, cy = 20, rx = 10, ry = 8.5, bottom = 28 } = {}) {
  c.ellipse(cx, cy, rx, ry, P[1], (x, y) => y + 0.5 <= bottom);
  c.shadeBody(P[1], P[2], { cx: cx - 2, cy: cy - 2, rx: rx, ry: ry });
  c.recolor(P[2], P[3], (x, y) => y >= bottom - 1);
  c.ellipse(cx - rx * 0.5, cy - ry * 0.5, 1.6, 1.2, P[0]);
  return c;
}

// 4つの角のきらめき
export function sparkle(c, x, y, col = WHITE) {
  return c.dots([[x, y], [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]], col);
}

const slime = () => {
  const c = makeCanvas();
  dropBody(c, PAL.none);
  c.eyes(12, 19, 6).mouth(15, 23, 'smile2').cheeks(9, 23, 12);
  return c.outline().shadow(16, 29, 9.5).finish();
};

// 火の粉がまるく集まったゲル（浮いている）
const hinoko = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  c.poly([[9, 17], [10, 9], [13, 13], [16, 5], [19, 13], [22, 9], [23, 17]], P[2]);
  c.poly([[12, 16], [13, 12], [16, 9], [19, 12], [20, 16]], P[1]);
  c.ellipse(16, 19, 8, 7.5, P[1]);
  c.shadeBody(P[1], P[2], { cx: 14.5, cy: 17.5, rx: 7.5, ry: 7 });
  c.ellipse(15, 18, 4, 3.5, P[0]);
  c.eyes(12, 17, 6, 'dot').mouth(15, 21, 'smile');
  c.outline();
  c.dots([[5, 10], [27, 12], [26, 6]], C.lava[0]);
  return c.shadow(16, 29.5, 6, 1.3).finish();
};

// 光が集まった玉（浮いている）
const lumen = () => {
  const c = makeCanvas();
  const P = PAL.light;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    c.line(16 + Math.cos(a) * 10, 16 + Math.sin(a) * 10, 16 + Math.cos(a) * 12.5, 16 + Math.sin(a) * 12.5, P[2]);
  }
  c.ellipse(16.5, 16.5, 8, 8, P[1]);
  c.shadeBody(P[1], P[2], { cx: 15, cy: 15, rx: 7.5, ry: 7.5 });
  c.ellipse(15, 15, 4.5, 4.5, P[0]);
  c.eyes(13, 15, 5, 'dot').mouth(16, 19, 'smile');
  return c.outline().shadow(16.5, 29.5, 5, 1.2).finish();
};

// 泥をまとってまんまる。頭に小さな芽
const dango = () => {
  const c = makeCanvas();
  const P = PAL.earth;
  blobBody(c, P, { cy: 19.5, rx: 10.5, ry: 8.8 });
  c.dots([[10, 22], [20, 14], [22, 23], [13, 26], [18, 25]], P[3]);
  c.line(16, 11, 16, 8, C.leaf[2]).ellipse(14, 7.5, 2, 1.2, C.leaf[1]).ellipse(18.5, 7, 2, 1.2, C.leaf[1]);
  c.eyes(12, 18, 6, 'dot').mouth(15, 22, 'smile');
  return c.outline().shadow(16, 29, 10).finish();
};

// 体の中で小さな稲妻が走る黄色いスライム
const zapslime = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  dropBody(c, P);
  c.line(19, 13, 17, 17, P[3]).line(17, 17, 21, 17, P[3]).line(21, 17, 18, 22, P[3]);
  c.eyes(10, 19, 6).mouth(13, 23, 'grin');
  c.outline();
  sparkle(c, 4, 9, P[0]);
  sparkle(c, 27, 6, P[0]);
  return c.shadow(16, 29, 9.5).finish();
};

// 水をたっぷり吸った、すきとおったスライム。頭の上にしずく
const waterslime = () => {
  const c = makeCanvas();
  const P = PAL.water;
  dropBody(c, P, { top: 9 });
  c.recolor(P[1], P[0], (x, y) => y < 17 && x < 15);
  c.rect(19, 15, 2, 1, WHITE);
  c.eyes(12, 19, 6).mouth(16, 23, 'o');
  c.poly([[24, 2], [26.5, 6.5], [21.5, 6.5]], P[1]).ellipse(24, 7, 2.5, 2.2, P[1]).px(23, 6, WHITE);
  return c.outline().shadow(16, 29, 9.5).finish();
};

// 右半分が赤、左半分が青
const twinslime = () => {
  const c = makeCanvas();
  blobBody(c, PAL.fire, { cy: 19.5, rx: 11, ry: 9 });
  const B = C.blue;
  c.recolor(PAL.fire[1], B[1], (x) => x < 16);
  c.recolor([PAL.fire[2], PAL.fire[3]], B[2], (x) => x < 16);
  c.recolor(PAL.fire[0], B[0], (x) => x < 16);
  c.line(16, 11, 16, 27, '#ffffff');
  c.eyes(11, 18, 8, 'dot').mouth(16, 22, 'smile');
  return c.outline().shadow(16, 29, 10.5).finish();
};

// ゆきだるま（氷）
const snowman = () => {
  const c = makeCanvas();
  const S = C.snow;
  const P = PAL.ice;
  c.line(8, 18, 3, 13, C.wood[2], 1).line(5, 15, 4, 12, C.wood[2], 1);
  c.line(24, 18, 28, 13, C.wood[2], 1).line(27, 15, 29, 12, C.wood[2], 1);
  c.ellipse(16, 22.5, 8.5, 6.5, S[1]);
  c.ellipse(16, 12, 6.5, 6, S[1]);
  c.shadeBody(S[1], P[2], { cx: 14.5, cy: 21, rx: 8, ry: 6 });
  c.recolor(P[2], S[1], (x, y) => y < 17);
  c.recolor(S[1], P[2], (x, y) => y < 17 && ((x + 0.5 - 14.5) ** 2) / 36 + ((y + 0.5 - 10.5) ** 2) / 30 > 1);
  c.rect(8, 4, 16, 2, C.blue[2]).rect(10, 1, 12, 3, C.blue[1]);
  c.eyes(13, 11, 5, 'dot').rect(15, 14, 1, 1, '#ff8a3c').rect(16, 14, 3, 1, '#ff8a3c');
  c.px(16, 20, INK).px(16, 23, INK);
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 光を飲みこんだスライム
const lightslime = () => {
  const c = makeCanvas();
  const P = PAL.light;
  dropBody(c, P);
  c.eyes(12, 19, 6, 'tall').mouth(15, 23, 'smile2');
  c.outline();
  sparkle(c, 25, 9, WHITE);
  sparkle(c, 5, 14, P[0]);
  return c.shadow(16, 29, 9.5).finish();
};

// 闇を飲みこんだ黒いスライム。体からしずくがたれる
const darkslime = () => {
  const c = makeCanvas();
  const P = PAL.dark;
  dropBody(c, P, { bottom: 27 });
  c.rect(9, 26, 2, 3, P[3]).rect(20, 26, 2, 2, P[3]).px(9, 29, P[3]);
  c.eyes(12, 19, 6, 'dot', '#1c1430').mouth(15, 23, 'smile2', '#1c1430');
  return c.outline().shadow(16, 29.5, 9.5).finish();
};

// 小石をたくさん飲みこんだ、ごつごつのスライム
const stoneslime = () => {
  const c = makeCanvas();
  const P = PAL.earth;
  blobBody(c, P, { cy: 19, rx: 10.5, ry: 9 });
  for (const [x, y, r] of [[10, 14, 1.8], [20, 12, 1.6], [23, 21, 2], [9, 23, 1.6], [17, 25, 1.5], [14, 10, 1.3]]) {
    c.ellipse(x, y, r, r * 0.9, C.stone[1]);
    c.px(Math.round(x - 0.5), Math.round(y - 0.5), C.stone[0]);
  }
  c.eyes(12, 17, 6, 'dot').mouth(15, 21, 'smile');
  return c.outline().shadow(16, 29, 10).finish();
};

// 大きくなったプチスライム
const bigslime = () => {
  const c = makeCanvas();
  dropBody(c, PAL.none, { cy: 20.5, rx: 14, ry: 8.5, top: 3, coneW: 12, bottom: 28.5 });
  c.eyes(10, 17, 10).mouth(15, 22, 'grin').cheeks(6, 22, 18);
  return c.outline().shadow(16, 29.5, 13).finish();
};

// 体の中に小さな虹がかかる、すきとおったスライム
const prism = () => {
  const c = makeCanvas();
  dropBody(c, PAL.none);
  c.recolor([PAL.none[1], PAL.none[2]], null, () => false);
  c.each((x, y) => {
    const v = c.get(x, y);
    if (v !== PAL.none[1] && v !== PAL.none[2]) return;
    const d = x + y - 34;
    if (d >= -3 && d < 4) c.px(x, y, RAINBOW[d + 3]);
  });
  c.eyes(10, 17, 6).mouth(13, 21, 'smile2');
  c.outline();
  sparkle(c, 26, 8, '#fff6a8');
  return c.shadow(16, 29, 9.5).finish();
};

// オーロラの膜がゆらめく大きなゲル（見つめると眠くなる）
const auroragel = () => {
  const c = makeCanvas();
  const base = ['#f4fffb', '#dffaf0', '#b7e7dd', '#8ccfc6'];
  blobBody(c, base, { cy: 18.5, rx: 13.5, ry: 10.5, bottom: 28.5 });
  const bands = ['#a7f0c4', '#9ee3f5', '#f5b8e6'];
  c.each((x, y) => {
    const v = c.get(x, y);
    if (v !== base[1] && v !== base[2]) return;
    const w = y + Math.sin(x / 2.6) * 1.6;
    const k = Math.floor(w / 3) % 4;
    if (k < 3 && y > 10 && y < 26) c.px(x, y, bands[k]);
  });
  c.eyes(11, 18, 10, 'closed').mouth(16, 22, 'smile');
  c.outline();
  sparkle(c, 4, 6, '#fff6a8');
  sparkle(c, 28, 4, WHITE);
  return c.shadow(16, 29.5, 13).finish();
};

// 右は炎、左は氷のゲルの王。かんむりをかぶっている
const twinking = () => {
  const c = makeCanvas();
  const F = PAL.fire;
  const I = PAL.ice;
  blobBody(c, F, { cy: 19.5, rx: 13.5, ry: 9.5, bottom: 28.5 });
  c.recolor(F[1], I[1], (x) => x < 16);
  c.recolor([F[2], F[3]], I[2], (x) => x < 16);
  c.recolor(F[0], I[0], (x) => x < 16);
  c.poly([[9, 11], [9, 3], [12.5, 7], [16, 1.5], [19.5, 7], [23, 3], [23, 11]], C.gold[1]);
  c.recolor(C.gold[1], C.gold[2], (x, y) => y >= 9);
  c.px(16, 6, C.red[1]).px(11, 8, C.blue[1]).px(21, 8, C.blue[1]);
  c.eyes(10, 17, 10, 'angry').mouth(16, 22, 'grin');
  return c.outline().shadow(16, 29.5, 13).finish();
};

// 9つの属性を合わせた、虹そのもののゲル
const arcenciel = () => {
  const c = makeCanvas();
  dropBody(c, PAL.none, { cy: 20.5, rx: 13.5, ry: 8.5, top: 4, coneW: 12, bottom: 28.5 });
  c.each((x, y) => {
    const v = c.get(x, y);
    if (!v || v === PAL.none[0]) return;
    const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 34);
    const k = Math.floor((d - 8) / 2.6);
    if (k >= 0 && k < RAINBOW.length) c.px(x, y, RAINBOW[RAINBOW.length - 1 - k]);
  });
  c.eyes(11, 17, 8).mouth(15, 22, 'smile2');
  c.outline();
  sparkle(c, 16, 1, '#fff6a8');
  sparkle(c, 4, 9, WHITE);
  sparkle(c, 28, 11, WHITE);
  return c.shadow(16, 29.5, 13).finish();
};

// ===== 名簿を200種にしたとき =====

// 毒そのものが意思をもったモンスター（紫の体に緑の毒のまだら、泡）
const evolpoison = () => {
  const c = makeCanvas();
  const P = ['#e6c8ff', '#9b5fd6', '#7440ac', '#4f2a80'];
  const G = '#9be86a';
  dropBody(c, P, { top: 9, bottom: 27 });
  for (const [x, y, r] of [[10, 17, 1.6], [21, 14, 1.3], [18, 25, 1.5], [24, 21, 1.2]]) c.ellipse(x, y, r, r, G);
  c.rect(8, 26, 2, 3, P[3]).rect(22, 26, 2, 2, P[3]).px(8, 29, G);
  c.ellipse(26, 8, 1.8, 1.8, G).ellipse(5, 12, 1.3, 1.3, G).ellipse(23, 4, 1, 1, G);
  c.eyes(11, 19, 7, 'angry', '#1c1430').mouth(15, 23, 'cat', '#1c1430');
  return c.outline().shadow(16, 29.5, 9.5).finish();
};

// 流れ星のかけらを集めたゲル（夜空の体に星）
const stardustgel = () => {
  const c = makeCanvas();
  const P = ['#c8d4ff', '#4f5fb0', '#3a4892', '#2a3470'];
  blobBody(c, P, { cy: 19.5, rx: 11, ry: 9 });
  for (const [x, y] of [[10, 14], [21, 13], [24, 20], [8, 22], [16, 25], [13, 11]]) c.px(x, y, '#fff6a8');
  sparkle(c, 19, 22, '#fff6a8');
  c.eyes(12, 17, 6, 'dot', '#fff6a8').mouth(15, 21, 'smile', '#fff6a8');
  c.outline();
  c.line(26, 3, 21, 8, '#fff6a8');
  sparkle(c, 27, 2, WHITE);
  return c.shadow(16, 29, 10).finish();
};

// 雷雲がぎゅっと固まったゲル（下に稲妻）
const thundercloudgel = () => {
  const c = makeCanvas();
  const P = ['#f4f6fa', '#c3cbd8', '#98a3b8', '#6f7a90'];
  for (const [x, y, rx, ry] of [[10, 15, 6, 5.5], [17, 11, 7, 6.5], [23, 15, 6, 5.5], [16, 18, 11, 5]]) c.ellipse(x, y, rx, ry, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 19);
  c.ellipse(13, 9, 2.5, 1.5, P[0]);
  const Y = PAL.thunder[1];
  c.line(9, 23, 7, 26, Y).line(7, 26, 10, 26, Y).line(10, 26, 8, 29, Y);
  c.line(22, 23, 20, 26, Y).line(20, 26, 23, 26, Y).line(23, 26, 21, 29, Y);
  c.eyes(12, 13, 8, 'angry').mouth(17, 17, 'fang');
  return c.outline().finish();
};

// 潮だまりにすむ大きなゲル（中を小魚やヒトデが泳ぐ）
const tidepoolgel = () => {
  const c = makeCanvas();
  const P = ['#e6f8ff', '#9fdcf4', '#6cbede', '#4a9cc4'];
  blobBody(c, P, { cy: 18.5, rx: 14, ry: 10.5, bottom: 28.5 });
  c.ellipse(8, 22, 2, 1.2, '#ff9a52').px(10, 22, '#ff9a52').px(6, 21, INK);
  c.ellipse(22, 14, 1.8, 1.1, '#ffd84d').px(24, 14, '#ffd84d');
  c.dots([[19, 24], [18, 25], [20, 25], [19, 26], [17, 24], [21, 24]], '#ff8aa0');
  c.line(12, 27, 13, 23, C.leaf[2]).line(25, 27, 26, 23, C.leaf[2]);
  c.eyes(11, 15, 9, 'dot').mouth(16, 19, 'smile');
  return c.outline().shadow(16, 29.5, 13).finish();
};

export const GEL = { slime, hinoko, lumen, dango, zapslime, waterslime, twinslime, snowman, lightslime, darkslime, stoneslime, bigslime, prism, auroragel, twinking, arcenciel, evolpoison, stardustgel, thundercloudgel, tidepoolgel };
