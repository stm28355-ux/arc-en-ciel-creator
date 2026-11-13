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

// ===== 名簿を200種にしたとき =====

// 機械の足のクモ（共通）。P は体の色、legs は足の色
function spider(c, P, legs, { cy = 17 } = {}) {
  for (const [dx, dy, ex, ey] of [[-4, -1, -13, -9], [-5, 1, -14, 2], [-4, 3, -12, 10], [-2, 4, -7, 11]]) {
    c.line(16 + dx, cy + dy, 16 + (dx + ex) / 2 - 1, cy + dy + ey / 2 - 3, legs, 1).line(16 + (dx + ex) / 2 - 1, cy + dy + ey / 2 - 3, 16 + ex, cy + ey, legs, 1);
    c.line(16 - dx, cy + dy, 16 - (dx + ex) / 2 + 1, cy + dy + ey / 2 - 3, legs, 1).line(16 - (dx + ex) / 2 + 1, cy + dy + ey / 2 - 3, 16 - ex, cy + ey, legs, 1);
  }
  c.ellipse(16, cy, 7, 5.5, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= cy + 2);
  return c;
}

// 望遠鏡のようにのびる複眼と、長い機械の手足のクモ
const metalspider = () => {
  const c = makeCanvas();
  const P = ['#fff6c8', '#d8c24a', '#a8922a', '#7a6a1c'];
  spider(c, P, C.metal[2]);
  c.rect(11, 9, 3, 6, C.metal[1]).rect(18, 9, 3, 6, C.metal[1]);
  c.ellipse(12.5, 8.5, 2.2, 2.2, '#2f3550').ellipse(19.5, 8.5, 2.2, 2.2, '#2f3550');
  c.px(12, 8, '#7ff0ff').px(19, 8, '#7ff0ff');
  c.rect(14, 17, 4, 2, '#2f3550');
  return c.outline().shadow(16, 29.5, 11).finish();
};

// 爆音の衝撃で敵を止めるメタルスパイダー（背中にスピーカー）
const deathmetalspider = () => {
  const c = makeCanvas();
  const P = ['#8a7aa8', '#3a3050', '#2a2240', '#1c1630'];
  spider(c, P, '#4a4060', { cy: 19 });
  c.rect(11, 9, 10, 7, '#2a2238').ellipse(16, 12.5, 3, 3, '#4a4060').ellipse(16, 12.5, 1.4, 1.4, '#8a7aa8');
  for (const [x, y] of [[10, 15], [22, 15], [16, 14]]) c.poly([[x - 1, y], [x, y - 3], [x + 1, y]], '#c8c0e0');
  c.eyes(12, 18, 6, 'angry', '#ff3a5a');
  c.outline();
  for (const r of [12, 14]) for (let a = -0.6; a <= 0.6; a += 0.3) {
    c.px(16 + Math.cos(a - Math.PI / 2) * r, 12 + Math.sin(a - Math.PI / 2) * r * 0.7, '#c79bff');
  }
  return c.shadow(16, 29.5, 11).finish();
};

// 機械になって回りながら浮かぶ花（機械の葉っぱから機銃）
const machinaflower = () => {
  const c = makeCanvas();
  const M = C.metal;
  const W = PAL.wind;
  c.rect(15, 18, 2, 7, M[3]);
  c.poly([[16, 20], [6, 17], [6, 20], [16, 22]], W[2]).poly([[16, 20], [26, 17], [26, 20], [16, 22]], W[2]);
  c.rect(3, 17, 3, 2, M[3]).rect(26, 17, 3, 2, M[3]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    c.poly([[16, 10], [16 + Math.cos(a) * 9, 10 + Math.sin(a) * 8], [16 + Math.cos(a + 0.5) * 7, 10 + Math.sin(a + 0.5) * 6]], i % 2 ? M[1] : W[1]);
  }
  c.ellipse(16, 10, 3.5, 3.5, M[2]).ellipse(16, 10, 1.6, 1.6, '#2f3550');
  c.px(15, 9, '#7ff0ff');
  c.outline();
  c.dots([[2, 6], [3, 4], [29, 5], [28, 3], [9, 27], [23, 27]], W[0]);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// バーベルを持ち上げつづける、筋トレ器具のモンスター
const musclea = () => {
  const c = makeCanvas();
  const M = C.metal;
  c.rect(6, 22, 3, 6, M[3]).rect(23, 22, 3, 6, M[3]);
  c.rect(5, 20, 22, 3, '#c84a4a');
  c.rect(9, 11, 14, 10, '#c84a4a');
  c.recolor('#c84a4a', '#a83434', (x) => x >= 20);
  c.line(10, 12, 7, 6, M[2], 1).line(22, 12, 25, 6, M[2], 1);
  c.rect(2, 5, 28, 2, M[2]).rect(1, 2, 3, 8, C.black[1]).rect(28, 2, 3, 8, C.black[1]);
  c.eyes(12, 14, 6, 'angry', '#ffffff').mouth(16, 18, 'grin', '#ffffff');
  return c.outline().shadow(16, 29.5, 12).finish();
};

// アヒルの形をしたやかんのロボット（口から熱いシャワー）
const duckpot = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#e8f4fb', '#b8d8ec', '#8ab8d8'];
  c.ellipse(17, 20, 10, 8, P[1], (x, y) => y < 28);
  c.recolor(P[1], P[2], (x, y) => y >= 24 || x >= 24);
  c.rect(7, 27, 20, 1, P[3]);
  c.ellipse(11, 11, 5, 4.5, P[1]);
  c.poly([[7, 11], [1, 12], [1, 14], [7, 14]], '#ffb43c');
  c.line(14, 7, 20, 7, C.black[2], 1).line(20, 7, 21, 10, C.black[2], 1);
  c.ellipse(20, 20, 4, 2.5, P[2]);
  c.eye(9, 9, 'dot');
  c.outline();
  for (const [x, y] of [[2, 8], [4, 5], [1, 4]]) c.ellipse(x, y, 1.4, 1.2, WHITE);
  c.dots([[0, 16], [1, 18], [3, 17]], PAL.water[1]);
  return c.shadow(16, 29.5, 10).finish();
};

// 冷蔵庫の形をしたロボット（扉からつめたいビーム）
const fridgebot = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#eef6fb', '#c8dceb', '#9fbcd4'];
  c.rect(11, 26, 3, 3, C.metal[3]).rect(18, 26, 3, 3, C.metal[3]);
  rrect(c, 8, 3, 16, 24, P[1]);
  c.recolor(P[1], P[2], (x) => x >= 21);
  c.rect(8, 12, 16, 1, P[3]);
  c.rect(21, 5, 1, 5, C.metal[2]).rect(21, 15, 1, 7, C.metal[2]);
  c.rect(5, 15, 3, 2, C.metal[2]).rect(24, 15, 3, 2, C.metal[2]);
  c.eyes(12, 6, 5, 'dot', '#3a7fd6').mouth(15, 9, 'smile2', '#3a7fd6');
  c.rect(11, 16, 6, 1, PAL.ice[2]).rect(11, 19, 4, 1, PAL.ice[2]);
  c.outline();
  c.dots([[4, 4], [28, 6], [27, 25]], PAL.ice[1]);
  return c.shadow(16, 29.5, 9).finish();
};

// 空のずっと上をまわるロボット（太陽の板とアンテナ）
const satellitebot = () => {
  const c = makeCanvas();
  const B = ['#c8e8ff', '#5a8ad8', '#3a64b0', '#2a4a88'];
  for (const x0 of [1, 22]) {
    c.rect(x0, 12, 9, 7, B[1]);
    for (let x = x0 + 3; x < x0 + 9; x += 3) c.rect(x, 12, 1, 7, B[3]);
    c.rect(x0, 15, 9, 1, B[3]);
  }
  c.rect(10, 15, 12, 1, C.metal[3]);
  rrect(c, 11, 10, 10, 11, C.gold[1]);
  c.recolor(C.gold[1], C.gold[2], (x) => x >= 18);
  c.ellipse(16, 6, 4, 2, C.metal[1]).line(16, 6, 16, 2, C.metal[3]).px(16, 1, PAL.light[1]);
  c.rect(13, 13, 6, 4, '#2f3550');
  c.eyes(14, 14, 3, 'pip', '#fff6a8');
  c.outline();
  twinkle(c, 3, 4, PAL.light[1]);
  twinkle(c, 28, 26, WHITE);
  return c.finish();
};

// 技をきわめたでんでんロボの大きな姿（アンテナ4本）
const megasparkbot = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  for (const [x0, x1] of [[9, 5], [13, 11], [19, 21], [23, 27]]) c.line(x0, 6, x1, 1, C.metal[3]);
  const f = robot(c, P, { headY: 5, headW: 18, headH: 10, bodyY: 15, bodyW: 16, bodyH: 9 });
  c.rect(3, 16, 5, 3, C.metal[2]).rect(24, 16, 5, 3, C.metal[2]);
  c.eyes(f.fx + 3, f.fy + 2, 7, 'happy', '#7ff0ff').mouth(16, f.fy + 4, 'grin', '#7ff0ff');
  c.rect(13, 18, 6, 3, C.red[1]);
  c.outline();
  for (const x of [5, 11, 21, 27]) c.px(x, 0, WHITE);
  return c.shadow(16, 29.5, 10).finish();
};

// ねじまき兵たちの大将（かぶと・ぜんまい・やり）
const karakuri = () => {
  const c = makeCanvas();
  const R = ['#ffd0c8', '#c83a3a', '#a02a30', '#781e24'];
  c.line(26, 1, 26, 28, C.wood[2]).poly([[25, 4], [26, 0], [27, 4]], C.metal[1]);
  c.rect(3, 15, 4, 1, C.gold[2]).rect(2, 13, 2, 5, C.gold[1]).rect(0, 14, 2, 3, C.gold[1]);
  c.rect(12, 23, 3, 6, '#2f2f48').rect(17, 23, 3, 6, '#2f2f48');
  rrect(c, 8, 13, 16, 11, R[1]);
  c.recolor(R[1], R[2], (x) => x >= 20);
  for (let y = 15; y < 23; y += 2) c.rect(9, y, 14, 1, R[3]);
  c.rect(24, 15, 2, 4, '#f6d2b0');
  c.ellipse(16, 9, 5, 4.5, '#f6d2b0');
  c.poly([[9, 7], [23, 7], [21, 3], [11, 3]], C.black[2]);
  c.poly([[10, 4], [7, -1], [13, 3]], C.gold[1]).poly([[22, 4], [25, -1], [19, 3]], C.gold[1]);
  c.eyes(14, 9, 3, 'small').rect(14, 12, 4, 1, C.black[2]);
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 花火を次々に打ち上げるロボット（背中にたくさんの筒）
const starminebot = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  for (const [x, h] of [[9, 8], [13, 10], [17, 9], [21, 7]]) rrect(c, x, 14 - h, 3, h, C.red[1]).rect(x, 14 - h + 2, 3, 1, WHITE);
  const f = robot(c, P, { headY: 14, headW: 14, headH: 0, bodyY: 13, bodyW: 16, bodyH: 11 });
  c.rect(11, 15, 10, 5, '#2f3550');
  c.eyes(13, 16, 5, 'dot', '#ffd84d');
  c.rect(4, 16, 4, 2, C.metal[2]).rect(24, 16, 4, 2, C.metal[2]);
  c.outline();
  twinkle(c, 6, 2, '#ffd84d');
  twinkle(c, 26, 3, '#8ab4ff');
  twinkle(c, 16, 0, '#ff8aa0');
  twinkle(c, 29, 9, '#9be8a6');
  return c.shadow(16, 29.5, 9).finish();
};

export const MACHINE = { metalspider, deathmetalspider, machinaflower, musclea, duckpot, fridgebot, satellitebot, megasparkbot, karakuri, starminebot, sparkbot, magnetgolem, windup, drone, cannon, firework, plasmabot, holybot, darkdrone, shadowbot };
