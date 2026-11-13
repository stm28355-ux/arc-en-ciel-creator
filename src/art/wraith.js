// レイス系の絵（おばけ・霊・炎）
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { head, twinkle, fan } from './parts.js';

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

// ===== 名簿を200種にしたとき =====

// 霧の体をもつヘビ（こりかたまった水の牙）
const mistsnake = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#d8eef8', '#a8d0e6', '#7ab0d0'];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = t * Math.PI * 2.6;
    c.ellipse(16 + Math.cos(a) * (9 - t * 5) + 0.5, 22 + Math.sin(a) * (4 - t * 2) - t * 6 + 0.5, 2.6, 2.6, i % 5 < 2 ? P[2] : P[1]);
  }
  c.ellipse(14, 9, 5, 4, P[1]);
  c.poly([[10, 9], [6, 10], [10, 12]], P[1]);
  c.px(8, 12, '#4ea8e6').px(10, 12, '#4ea8e6');
  c.eye(12, 7, 'angryL', '#2b69b1');
  c.outline();
  c.each((x, y) => {
    if (c.get(x, y) === null && ((x * 5 + y * 3) % 7 === 0) && Math.hypot(x - 16, y - 18) < 13) c.px(x, y, 'rgba(216,238,248,0.7)');
  });
  return c.shadow(16, 29.5, 9).finish();
};

// 輪のようにつらなった目が浮いている
const floweyes = () => {
  const c = makeCanvas();
  c.each((x, y) => {
    const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 15);
    if (d > 8.5 && d < 10) c.px(x, y, '#d8d2ec');
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = 16 + Math.cos(a) * 9.2;
    const y = 15 + Math.sin(a) * 9.2;
    c.ellipse(x, y, 2.6, 2.6, WHITE);
    c.rect(Math.floor(x - 0.5), Math.floor(y - 0.5), 1, 2, '#6a4aa9');
  }
  c.ellipse(16, 15, 2.5, 2.5, '#efe8ff').ellipse(16, 15, 1.2, 1.2, '#6a4aa9');
  return c.outline().shadow(16, 29.5, 7, 1.2).finish();
};

// 霧の体でできた、うずまき状の竜
const mistdragoon = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#d0eaf8', '#9ccbe6', '#6aa8d0'];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const a = t * Math.PI * 3.2;
    const r = 12 - t * 10;
    c.ellipse(16 + Math.cos(a) * r + 0.5, 17 + Math.sin(a) * r * 0.8 + 0.5, 2.8 - t, 2.8 - t, i % 6 < 3 ? P[1] : P[2]);
  }
  c.ellipse(7, 6, 4.5, 4, P[1]);
  c.poly([[4, 6], [0, 7], [4, 9]], P[1]);
  c.line(8, 3, 11, 0, PAL.water[2]).line(10, 4, 14, 2, PAL.water[2]);
  c.eye(5, 5, 'angryL', '#2b69b1');
  c.outline();
  c.dots([[27, 4], [29, 8], [3, 25], [28, 27]], P[2]);
  return c.shadow(16, 29.5, 10).finish();
};

// いつもウインクをしている雷の霊（顔と動きがうるさい）
const plasma = () => {
  const c = makeCanvas();
  const P = ['#fffbd2', '#ffe45a', '#f0b52a', '#bf8618'];
  ghost(c, P, { cy: 13, rx: 8.5, top: 4, bottom: 25 });
  c.poly([[8, 6], [5, 1], [11, 5]], '#7ff0ff').poly([[24, 6], [27, 1], [21, 5]], '#7ff0ff');
  c.eye(11, 11, 'tall').dots([[19, 13], [20, 12], [21, 12], [22, 13]], INK);
  c.mouth(16, 17, 'open');
  c.cheeks(9, 15, 13, '#ff9eb8');
  c.outline();
  for (const [x, y] of [[28, 10], [3, 18]]) c.dots([[x, y], [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]], '#7ff0ff');
  c.px(27, 22, P[1]).px(28, 23, P[1]).px(4, 7, P[1]);
  return c.shadow(16, 29.5, 7, 1.2).finish();
};

// 冷ややかな空気そのもの（冷笑の顔）
const reishow = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#e2f6fc', '#b4dcec', '#86bcd6'];
  ghost(c, P, { cy: 13, rx: 8, top: 4, bottom: 25, arms: false });
  c.recolor([P[1], P[2]], '#cbe9f6', (x, y) => y >= 21);
  c.dots([[10, 11], [11, 12], [12, 12], [13, 12]], '#2b4a6b').dots([[18, 12], [19, 12], [20, 12], [21, 11]], '#2b4a6b');
  c.dots([[13, 17], [14, 17], [15, 17], [16, 16], [17, 16]], '#2b4a6b');
  c.outline();
  c.dots([[3, 6], [4, 5], [28, 8], [27, 9], [2, 22], [29, 20]], WHITE);
  return c.shadow(16, 29.5, 7, 1.2).finish();
};

// 寝ぼけて夜中にさまよう白いおばけ（ナイトキャップ）
const sleepyghost = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#f6f4fb', '#d8d2ec', '#b0a8d0'];
  ghost(c, P, { cy: 14, rx: 8, top: 6, bottom: 26 });
  c.poly([[9, 8], [23, 8], [27, 2], [18, 3]], '#6f9fd6');
  c.ellipse(27.5, 2.5, 1.8, 1.8, WHITE);
  c.rect(9, 7, 14, 2, WHITE);
  c.eyes(12, 13, 7, 'line').mouth(16, 17, 'o');
  c.outline();
  c.dots([[2, 6], [3, 6], [4, 6], [4, 7], [3, 8], [2, 9], [3, 9], [4, 9]], '#9fb4d8');
  return c.shadow(16, 29.5, 7, 1.2).finish();
};

// 光が集まって生まれた精霊（軽やかに舞う）
const lightspirit = () => {
  const c = makeCanvas();
  const P = PAL.light;
  fan(c, 13, 14, 9, 3.2, 4.3, '#fffbe8');
  fan(c, 19, 14, 9, -1.15, -0.05, '#fffbe8');
  ghost(c, [WHITE, '#fffbe0', P[1], P[2]], { cx: 16, cy: 13, rx: 6, top: 6, bottom: 24, arms: false });
  c.ellipse(16, 4, 4, 1.4, P[2]).ellipse(16, 4, 2.4, 0.5, null);
  c.eyes(13, 12, 5, 'happy').mouth(16, 15, 'smile');
  c.outline();
  twinkle(c, 3, 22, P[1]);
  twinkle(c, 28, 24, P[1]);
  twinkle(c, 26, 3, WHITE);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// 主をなくした鎧に宿った、まぼろしの騎士
const phantomknight = () => {
  const c = makeCanvas();
  const M = ['#a8a0c0', '#6a6488', '#4e4868', '#36304e'];
  c.line(25, 4, 25, 22, '#c8c0e0', 2).rect(22, 21, 7, 2, M[3]).rect(24, 23, 2, 3, M[2]);
  c.poly([[10, 15], [22, 15], [24, 26], [20, 23], [16, 27], [12, 23], [8, 26]], M[1]);
  c.recolor(M[1], M[2], (x) => x >= 19);
  c.ellipse(16, 10, 6.5, 6.5, M[1]);
  c.recolor(M[1], M[2], (x, y) => x >= 19 && y < 15);
  c.rect(11, 9, 10, 3, '#1c1430');
  c.rect(12, 10, 2, 1, '#c79bff').rect(18, 10, 2, 1, '#c79bff');
  c.poly([[14, 3], [16, -1], [18, 3]], '#9a5ad6');
  c.outline();
  c.dots([[5, 8], [4, 12], [27, 27], [6, 26]], '#c79bff');
  return c.shadow(16, 29.5, 9).finish();
};

// 夏の業火が形になった亡霊（ふゆのぼうれいと、にらみ合う）
const infernoghost = () => {
  const c = makeCanvas();
  const P = ['#ffe1a6', '#ff9b52', '#ec5b32', '#b53425'];
  c.poly([[3, 14], [29, 14], [27, 28], [23, 24], [20, 29], [16, 24], [12, 29], [9, 24], [5, 28]], P[2]);
  c.recolor(P[2], P[3], (x) => x >= 22);
  ghost(c, P, { cy: 12, rx: 8, top: 5, bottom: 22, arms: false });
  for (const [x, h] of [[10, 5], [13, 8], [16, 9], [19, 8], [22, 5]]) c.poly([[x - 1.8, 7], [x + 1.8, 7], [x, 7 - h]], C.lava[1]);
  c.rect(11, 10, 10, 5, '#3a1418');
  c.rect(12, 11, 2, 2, '#fff1a0').rect(18, 11, 2, 2, '#fff1a0');
  c.outline();
  c.dots([[2, 6], [29, 5], [1, 22], [30, 24]], C.lava[0]);
  return c.shadow(16, 29.5, 11).finish();
};

// ゆきだるまに吹雪の霊が宿った姿
const blizzardspirit = () => {
  const c = makeCanvas();
  const S = C.snow;
  const P = PAL.ice;
  c.poly([[10, 20], [22, 20], [21, 26], [18, 24], [16, 28], [14, 24], [11, 26]], P[1]);
  c.ellipse(16, 18, 7.5, 5.5, S[1]);
  c.ellipse(16, 9, 6, 5.5, S[1]);
  c.recolor(S[1], P[2], (x, y) => x >= 19 && (y >= 14 || y >= 6));
  c.rect(10, 2, 12, 2, C.blue[2]).rect(12, 0, 8, 2, C.blue[1]);
  c.eyes(13, 8, 5, 'angry', '#2b4a6b').mouth(16, 12, 'o', '#2b4a6b');
  c.outline();
  for (let i = 0; i < 18; i++) c.px(16 + Math.cos(i * 0.7) * (9 + i * 0.3), 15 + Math.sin(i * 0.7) * (6 + i * 0.2), WHITE);
  return c.shadow(16, 29.5, 8).finish();
};

// やけどの敵を追いかけまわしたひのこだまの、青い炎の姿
const onibi = () => {
  const c = makeCanvas();
  const P = ['#e8f6ff', '#8ab8ff', '#5a86e0', '#3a5ab8'];
  c.poly([[9, 18], [9, 9], [12, 13], [14, 5], [17, 11], [20, 4], [22, 12], [23, 18]], P[2]);
  c.poly([[11, 17], [12, 12], [15, 10], [18, 9], [20, 13], [21, 17]], P[1]);
  c.ellipse(16, 19, 7, 6.5, P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 19 && y >= 17);
  c.ellipse(14.5, 18, 3.5, 3, P[0]);
  c.eyes(12, 17, 6, 'dot', '#2a3a7a').mouth(15, 21, 'smile', '#2a3a7a');
  c.outline();
  c.dots([[4, 10], [27, 14], [26, 6]], P[1]);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

export const WRAITH = { mistsnake, floweyes, mistdragoon, plasma, reishow, sleepyghost, lightspirit, phantomknight, infernoghost, blizzardspirit, onibi, steamghost, yukionna, candle, wisp, winterghost, shade, reaper, hellfire, borderking };
