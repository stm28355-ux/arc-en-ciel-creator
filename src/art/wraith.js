// レイス系の絵（おばけ・霊・炎）
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { head, twinkle } from './parts.js';

// 布をかぶったようなおばけ（下がゆらゆら。浮いている）
function ghost(c, P, { cx = 16, cy = 12, rx = 8, top = 3, bottom = 25, arms = true } = {}) {
  c.ellipse(cx, cy, rx, cy - top, P[1], (x, y) => y < cy + 1);
  c.rect(cx - rx, cy, rx * 2, bottom - cy - 2, P[1]);
  for (let i = 0; i < 4; i++) {
    const x = cx - rx + i * (rx / 2);
    c.poly([[x, bottom - 3], [x + rx / 2, bottom - 3], [x + rx / 4 + (i % 2 ? 1 : -1), bottom + 1]], P[1]);
  }
  if (arms) c.ellipse(cx - rx - 1, cy + 4, 2.2, 1.6, P[1]).ellipse(cx + rx + 1, cy + 3, 2.2, 1.6, P[1]);
  c.recolor(P[1], P[2], (x, y) => x + 0.5 > cx + rx * 0.45 && y > cy - 2);
  c.ellipse(cx - rx * 0.45, cy - (cy - top) * 0.45, 1.5, 1.8, P[0]);
  return c;
}

// 温泉の湯気から生まれたおばけ（のぼせて赤い）
const steamghost = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#fff6ee', '#f2d8c8', '#d8b4a0'];
  ghost(c, P);
  for (const [x, y, r] of [[9, 6, 2.5], [23, 7, 2.5], [16, 3, 3]]) c.ellipse(x, y, r, r * 0.8, P[1]);
  c.eyes(12, 11, 6, 'closed').mouth(16, 15, 'smile').cheeks(10, 14, 10, '#ff8a7a');
  c.outline();
  c.line(5, 2, 6, 0, WHITE).line(26, 3, 27, 1, WHITE);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// 雪山に現れる、白い着物の女のひと（下は霧のように消える）
const yukionna = () => {
  const c = makeCanvas();
  const K = ['#ffffff', '#eef6ff', '#c8daec', '#9fb8d2'];
  c.poly([[10, 16], [22, 16], [24, 24], [19, 28], [16, 25], [13, 28], [8, 24]], K[1]);
  c.recolor(K[1], K[2], (x, y) => x >= 19 || y >= 25);
  c.rect(10, 20, 12, 2, '#9fc8e8');
  c.ellipse(16, 11, 8, 8.5, '#2a2a40', (x, y) => y < 19);
  head(c, { cy: 11.5, rx: 5.5, ry: 5.5, skin: ['#ffffff', '#f2f8ff', '#d6e4f2', '#b7c8de'] });
  c.ellipse(16, 7, 6, 3, '#2a2a40', (x, y) => y < 8);
  c.eyes(13, 11, 5, 'closed', '#4a6a8a').mouth(16, 14, 'smile2', '#c86a8a');
  c.outline();
  c.dots([[24, 13], [26, 12], [27, 14], [29, 13]], '#c8e8ff');
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// ろうそくに宿ったおばけ
const candle = () => {
  const c = makeCanvas();
  const W = ['#ffffff', '#fbf6ec', '#e6dcc6', '#c8b898'];
  c.rect(11, 10, 10, 17, W[1]);
  c.recolor(W[1], W[2], (x) => x >= 18);
  c.ellipse(16, 10, 5, 1.5, W[0]);
  c.rect(11, 11, 2, 4, W[0]).rect(19, 11, 2, 6, W[2]).px(12, 15, W[0]);
  c.ellipse(16, 27, 7, 1.6, C.gold[2]);
  c.line(16, 9, 16, 7, INK);
  c.poly([[13.5, 7], [16, 0], [18.5, 7], [16, 9]], PAL.fire[1]).poly([[15, 7], [16, 3], [17, 7]], C.lava[0]);
  c.eyes(13, 16, 5, 'dot').mouth(16, 20, 'o');
  c.outline();
  return c.shadow(16, 29.5, 8).finish();
};

// 行き先を忘れてさまよう人魂（青白い火）
const wisp = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#c8e8ff', '#8ab8f0', '#5a86d0'];
  c.poly([[20, 15], [30, 6], [27, 14], [31, 18], [22, 20]], P[2]);
  c.ellipse(15, 16, 7.5, 7.5, P[1]);
  c.poly([[9, 12], [12, 4], [14, 10], [18, 3], [21, 12]], P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 18 && y >= 15);
  c.ellipse(13, 15, 3, 3, P[0]);
  c.eyes(11, 15, 5, 'dot', '#3a4a7a').mouth(14, 19, 'o', '#3a4a7a');
  c.outline();
  twinkle(c, 4, 24, P[1]);
  return c.shadow(15, 29.5, 6, 1.2).finish();
};

// 冬そのものが形になった亡霊（つららのかんむり、ぼろぼろの衣）
const winterghost = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#d8eef8', '#9fc8e0', '#6f9fc0'];
  c.poly([[3, 14], [29, 14], [27, 28], [23, 24], [20, 29], [16, 24], [12, 29], [9, 24], [5, 28]], P[2]);
  c.recolor(P[2], P[3], (x) => x >= 22);
  ghost(c, P, { cy: 12, rx: 8, top: 4, bottom: 22, arms: false });
  for (const [x, h] of [[10, 5], [13, 7], [16, 8], [19, 7], [22, 5]]) c.poly([[x - 1.5, 6], [x + 1.5, 6], [x, 6 - h]], WHITE);
  c.rect(11, 9, 10, 5, '#2a3a5a');
  c.rect(12, 10, 2, 2, '#9ff0ff').rect(18, 10, 2, 2, '#9ff0ff');
  c.outline();
  c.dots([[2, 6], [29, 5], [1, 22], [30, 24]], WHITE);
  return c.shadow(16, 29.5, 11).finish();
};

// 持ち主から離れてしまった影（人の形）
const shade = () => {
  const c = makeCanvas();
  const P = ['#8a72c0', '#4a3a72', '#3a2c5c', '#2a2046'];
  c.rect(13, 22, 2, 6, P[2]).rect(17, 22, 2, 6, P[2]);
  c.poly([[11, 15], [21, 15], [22, 23], [10, 23]], P[1]);
  c.rect(8, 16, 2, 6, P[1]).rect(22, 16, 2, 6, P[2]);
  c.ellipse(16, 10, 5.5, 5.5, P[1]);
  c.recolor(P[1], P[2], (x) => x >= 19);
  c.eyes(13, 9, 5, 'dot', WHITE);
  c.px(13, 9, P[0]).px(18, 9, P[0]);
  c.outline();
  c.poly([[10, 28], [22, 28], [29, 31], [3, 31]], 'rgba(42,34,56,0.35)', (x, y) => c.get(x, y) === null);
  return c.finish();
};

// 大きな鎌をかついだ、黒いフードの死神
const reaper = () => {
  const c = makeCanvas();
  const P = ['#6a6080', '#3a3450', '#2a2640', '#1c1a2c'];
  c.line(25, 3, 25, 27, C.wood[2]);
  c.poly([[25, 3], [16, 0], [10, 3], [18, 2], [25, 6]], C.metal[1]);
  c.poly([[9, 13], [23, 13], [25, 27], [21, 24], [16, 28], [11, 24], [7, 27]], P[1]);
  c.recolor(P[1], P[2], (x) => x >= 19);
  c.ellipse(16, 10, 7, 7, P[1]);
  c.poly([[11, 5], [16, 1], [21, 5]], P[1]);
  c.ellipse(16, 11, 4.5, 4, '#120e1e');
  c.rect(13, 10, 2, 2, '#ff5a7a').rect(17, 10, 2, 2, '#ff5a7a');
  c.rect(22, 17, 3, 2, '#e8e0f0');
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 地獄から迷い出た黒い炎
const hellfire = () => {
  const c = makeCanvas();
  const P = ['#c88aff', '#6a3aa8', '#4a2480', '#2e1456'];
  c.poly([[7, 26], [6, 14], [10, 18], [11, 7], [14, 13], [16, 2], [19, 12], [22, 6], [23, 17], [26, 12], [25, 26]], P[2]);
  c.poly([[10, 26], [10, 18], [13, 21], [16, 10], [19, 20], [22, 17], [22, 26]], P[1]);
  c.poly([[13, 26], [14, 21], [16, 18], [18, 22], [19, 26]], '#ff6a4a');
  c.eyes(12, 17, 6, 'angry', '#ff3a3a');
  c.recolor('#ff3a3a', '#ff3a3a');
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 光と闇のさかいにすむ霊の王（半分は光、半分は影）
const borderking = () => {
  const c = makeCanvas();
  const L = ['#ffffff', '#fff6d0', '#f0d888', '#d8b860'];
  const D = ['#b8a0e0', '#5a4890', '#45366e', '#2e2450'];
  ghost(c, L, { cy: 13, rx: 9, top: 5, bottom: 26 });
  c.recolor([L[0], L[1], L[2]], D[1], (x) => x >= 16);
  c.recolor(D[1], D[2], (x, y) => x >= 22 && y >= 12);
  c.poly([[9, 6], [9, 0], [12, 3], [16, -1], [20, 3], [23, 0], [23, 6]], C.gold[1]);
  c.px(16, 3, C.red[1]);
  c.eye(11, 12, 'tall').eye(19, 12, 'tall', '#ffe45a');
  c.mouth(16, 17, 'smile2');
  c.outline();
  twinkle(c, 3, 5, L[1]);
  twinkle(c, 29, 24, D[0]);
  return c.shadow(16, 29.5, 9, 1.4).finish();
};

export const WRAITH = { steamghost, yukionna, candle, wisp, winterghost, shade, reaper, hellfire, borderking };
