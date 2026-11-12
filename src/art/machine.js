// マシン系の絵
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { fan, twinkle } from './parts.js';

function rrect(c, x, y, w, h, col) {
  c.rect(x, y, w, h, col);
  for (const [px, py] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) c.px(px, py, null);
  return c;
}
// 箱の体と頭のロボット。P は体の色。顔の位置を返す
function robot(c, P, { headY = 5, headW = 12, headH = 9, bodyY = 15, bodyW = 12, bodyH = 9, legs = true } = {}) {
  if (legs) c.rect(12, bodyY + bodyH - 1, 3, 5, P[3]).rect(17, bodyY + bodyH - 1, 3, 5, P[3]);
  rrect(c, 16 - bodyW / 2, bodyY, bodyW, bodyH, P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 16 + bodyW / 2 - 3 && y >= bodyY);
  rrect(c, 16 - headW / 2, headY, headW, headH, P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 16 + headW / 2 - 3 && y < bodyY);
  c.rect(16 - headW / 2 + 1, headY + 1, 3, 1, P[0]);
  // 顔の画面
  rrect(c, 16 - headW / 2 + 2, headY + 2, headW - 4, headH - 4, '#2f3550');
  return { fx: 16 - headW / 2 + 2, fy: headY + 2, fw: headW - 4, fh: headH - 4 };
}

// 頭にアンテナの小さなロボット
const sparkbot = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  c.line(11, 7, 9, 2, C.metal[3]).line(21, 7, 23, 2, C.metal[3]);
  const f = robot(c, P, { headY: 6, headW: 14, headH: 9, bodyY: 16, bodyW: 10, bodyH: 8 });
  c.rect(7, 17, 3, 2, C.metal[2]).rect(22, 17, 3, 2, C.metal[2]);
  c.eyes(f.fx + 2, f.fy + 1, 5, 'happy', '#7ff0ff').mouth(16, f.fy + 3, 'smile2', '#7ff0ff');
  c.rect(14, 19, 4, 2, C.red[1]);
  c.outline();
  twinkle(c, 9, 1, WHITE);
  twinkle(c, 23, 1, WHITE);
  return c.shadow(16, 29.5, 7).finish();
};

// 磁石のうでのゴーレム
const magnetgolem = () => {
  const c = makeCanvas();
  const P = C.metal;
  c.rect(10, 23, 4, 5, P[3]).rect(18, 23, 4, 5, P[3]);
  rrect(c, 8, 12, 16, 12, P[1]);
  c.recolor(P[1], P[2], (x) => x >= 20);
  rrect(c, 11, 4, 10, 8, P[1]);
  for (const sx of [-1, 1]) {
    const x = sx < 0 ? 2 : 25;
    c.rect(x, 12, 5, 10, PAL.thunder[2]).rect(x + 1, 15, 3, 7, null);
    c.rect(x, 20, 2, 2, C.red[1]).rect(x + 3, 20, 2, 2, C.blue[1]);
  }
  c.rect(13, 6, 6, 3, '#2f3550').rect(14, 7, 1, 1, '#7ff0ff').rect(17, 7, 1, 1, '#7ff0ff');
  c.rect(12, 15, 8, 4, PAL.thunder[1]).line(15, 15, 14, 17, INK).line(14, 17, 17, 17, INK).line(17, 17, 16, 18, INK);
  return c.outline().shadow(16, 29.5, 12).finish();
};

// ぜんまいで動く木の兵隊（背中のぜんまい・やり）
const windup = () => {
  const c = makeCanvas();
  const R = ['#ffd0c8', '#e04a4a', '#b02e34', '#7a2028'];
  c.line(25, 2, 25, 28, C.wood[2]).poly([[24, 4], [25, 0], [26, 4]], C.metal[1]);
  c.rect(4, 15, 4, 1, C.gold[2]).rect(3, 13, 2, 5, C.gold[1]).rect(1, 14, 2, 3, C.gold[1]);
  c.rect(12, 23, 3, 6, '#3a3a52').rect(17, 23, 3, 6, '#3a3a52');
  rrect(c, 9, 14, 14, 10, R[1]);
  c.recolor(R[1], R[2], (x) => x >= 19);
  c.rect(15, 15, 2, 8, C.gold[1]).rect(9, 21, 14, 1, WHITE);
  c.rect(23, 16, 2, 4, '#f6d2b0');
  c.ellipse(16, 10, 5, 4.5, '#f6d2b0');
  c.rect(11, 1, 10, 6, '#2f2f48').rect(11, 6, 10, 1, C.gold[1]).px(16, 3, C.gold[1]);
  c.eyes(14, 9, 3, 'small').rect(11, 11, 2, 1, '#ff9eb8').rect(19, 11, 2, 1, '#ff9eb8');
  return c.outline().shadow(16, 29.5, 8).finish();
};

// プロペラで浮かぶ小さな機械（ひとつ目）
const drone = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  c.rect(6, 3, 20, 2, C.metal[2]).rect(15, 4, 2, 5, C.metal[3]);
  c.ellipse(16, 14, 8.5, 6.5, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 16);
  c.rect(7, 13, 18, 2, C.metal[3]);
  c.ellipse(16, 13.5, 3.5, 3.5, '#2f3550').ellipse(16, 13.5, 1.8, 1.8, '#7ff0ff').px(15, 12, WHITE);
  c.line(10, 19, 8, 23, C.metal[3]).line(22, 19, 24, 23, C.metal[3]);
  c.outline();
  c.dots([[6, 23], [7, 25], [25, 24], [26, 22]], P[0]);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// 長い砲身に雷をためる大砲の機械
const cannon = () => {
  const c = makeCanvas();
  const P = C.metal;
  c.rect(3, 23, 26, 5, '#4a4a60').dots([[6, 25], [11, 25], [16, 25], [21, 25], [26, 25]], P[1]);
  rrect(c, 8, 14, 18, 10, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 20);
  c.poly([[12, 15], [2, 4], [6, 1], [16, 13]], P[2]);
  c.poly([[5, 6], [3, 4], [6, 2], [8, 4]], PAL.thunder[1]);
  for (const t of [0.3, 0.55, 0.8]) c.px(16 - 13 * t, 14 - 11 * t, PAL.thunder[1]);
  rrect(c, 17, 9, 7, 6, P[1]);
  c.rect(18, 11, 5, 2, '#2f3550').px(19, 11, '#7ff0ff').px(21, 11, '#7ff0ff');
  c.outline();
  c.dots([[24, 5], [25, 3], [27, 6]], WHITE);
  return c.shadow(16, 29.5, 13).finish();
};

// 頭が打ち上げ花火の筒のロボット
const firework = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  c.line(16, 3, 17, 0, C.wood[2]);
  rrect(c, 12, 3, 8, 11, C.red[1]);
  c.rect(12, 6, 8, 1, WHITE).rect(12, 10, 8, 1, WHITE);
  c.recolor(C.red[1], C.red[2], (x) => x >= 18);
  const f = robot(c, P, { headY: 13, headW: 12, headH: 0, bodyY: 13, bodyW: 14, bodyH: 11 });
  c.rect(11, 15, 10, 5, '#2f3550');
  c.eyes(13, 16, 5, 'dot', '#ffd84d');
  c.rect(5, 16, 4, 2, C.metal[2]).rect(23, 16, 4, 2, C.metal[2]);
  c.outline();
  twinkle(c, 6, 4, '#ffd84d');
  twinkle(c, 26, 6, '#8ab4ff');
  twinkle(c, 24, 1, '#ff8aa0');
  return c.shadow(16, 29.5, 8).finish();
};

// 胸にプラズマの球をかかえたロボット
const plasmabot = () => {
  const c = makeCanvas();
  const P = ['#fff6c8', '#e8c43a', '#c09a24', '#8a6c18'];
  const f = robot(c, P, { headY: 4, headW: 12, headH: 8, bodyY: 13, bodyW: 16, bodyH: 11 });
  c.rect(4, 14, 4, 6, P[2]).rect(24, 14, 4, 6, P[2]);
  c.ellipse(16, 18.5, 4, 4, '#c79bff').ellipse(16, 18.5, 2.2, 2.2, '#efe0ff').px(15, 17, WHITE);
  c.eyes(f.fx + 2, f.fy + 1, 3, 'dot', '#c79bff');
  c.outline();
  c.dots([[10, 25], [22, 25], [5, 11], [27, 12]], '#c79bff');
  return c.shadow(16, 29.5, 9).finish();
};

// 頭に光の輪をのせたロボット
const holybot = () => {
  const c = makeCanvas();
  const P = [WHITE, '#f4f1e6', '#d8cfb6', '#b0a48a'];
  fan(c, 10, 17, 7, 3.0, 4.0, PAL.light[1]);
  fan(c, 22, 17, 7, -0.85, 0.14, PAL.light[1]);
  const f = robot(c, P, { headY: 6, headW: 12, headH: 8, bodyY: 15, bodyW: 12, bodyH: 9 });
  c.ellipse(16, 2.5, 5, 1.6, PAL.light[2]).ellipse(16, 2.5, 3, 0.6, null);
  c.rect(f.fx + 1, f.fy + 2, f.fw - 2, 1, PAL.light[1]);
  c.rect(14, 18, 4, 3, C.gold[1]);
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 黒い装甲のロボット（赤い目）
const darkdrone = () => {
  const c = makeCanvas();
  const P = ['#6a6680', '#3a3650', '#2a2640', '#1c1a2c'];
  const f = robot(c, P, { headY: 5, headW: 12, headH: 8, bodyY: 14, bodyW: 16, bodyH: 10 });
  c.poly([[8, 14], [4, 12], [5, 19], [8, 18]], P[2]).poly([[24, 14], [28, 12], [27, 19], [24, 18]], P[2]);
  c.rect(f.fx, f.fy + 1, f.fw, 2, '#ff3a5a').rect(f.fx + 1, f.fy + 1, 2, 1, '#ffb0c0');
  c.rect(12, 17, 8, 4, PAL.dark[2]);
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 影の中でも動けるロボット（影から電撃）
const shadowbot = () => {
  const c = makeCanvas();
  const P = PAL.dark;
  const f = robot(c, ['#b89ae0', '#6b4aa9', '#4f3584', '#33225a'], { headY: 6, headW: 12, headH: 8, bodyY: 15, bodyW: 12, bodyH: 9, legs: false });
  c.poly([[10, 23], [22, 23], [26, 28], [6, 28]], '#33225a');
  c.eyes(f.fx + 2, f.fy + 1, 4, 'dot', '#ffe45a');
  c.line(4, 11, 7, 15, PAL.thunder[1]).line(7, 15, 5, 16, PAL.thunder[1]).line(5, 16, 8, 20, PAL.thunder[1]);
  return c.outline().shadow(16, 29.5, 10).finish();
};

export const MACHINE = { sparkbot, magnetgolem, windup, drone, cannon, firework, plasmabot, holybot, darkdrone, shadowbot };
