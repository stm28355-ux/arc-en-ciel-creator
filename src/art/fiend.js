// ヒュマノ系（人型）の絵。頭の大きいちびキャラ
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { head, dress, fan, twinkle } from './parts.js';

// 体と手足（服の色 P、肌 skin）。手の位置を返す
function body(c, P, { skin = C.skin, top = 17, bottom = 26, wTop = 3.5, wBottom = 6.5, legs = true, arms = true, legCol } = {}) {
  if (legs) c.rect(13, bottom - 1, 2, 4, legCol ?? skin[2]).rect(17, bottom - 1, 2, 4, legCol ?? skin[2]);
  dress(c, P, { top, bottom, wTop, wBottom });
  if (arms) c.rect(10, top + 2, 2, 3, skin[1]).rect(20, top + 2, 2, 3, skin[2]);
  return { lx: 10, rx: 21, hy: top + 4 };
}

// 羽（天使・だてんし）
function wings(c, col, col2, { y = 15, span = 9 } = {}) {
  fan(c, 12, y, span, 3.0, 4.2, col);
  fan(c, 20, y, span, -1.05, 0.14, col);
  fan(c, 12, y + 1, span * 0.6, 3.1, 3.9, col2);
  fan(c, 20, y + 1, span * 0.6, -0.75, 0.04, col2);
  return c;
}

// 光の輪
function halo(c, cx, cy, col, broken = false) {
  c.ellipse(cx, cy, 4.5, 1.6, col).ellipse(cx, cy, 2.8, 0.6, null);
  if (broken) c.rect(cx + 1, cy - 2, 2, 4, null);
  return c;
}

// 畑を守るかかし（麻袋の顔・わらの帽子・一本足）
const scarecrow = () => {
  const c = makeCanvas();
  const B = ['#f7ead0', '#e3cfa6', '#c4ab7e', '#9c8458'];
  c.rect(15, 20, 2, 9, C.wood[2]);
  c.rect(3, 15, 26, 2, C.wood[2]);
  c.poly([[9, 14], [23, 14], [24, 22], [8, 22]], '#6f9fd6');
  c.rect(12, 16, 3, 3, '#e46a5a');
  c.recolor('#6f9fd6', '#4f7fb8', (x) => x >= 20);
  c.ellipse(16, 10, 6, 5.5, B[1]);
  c.recolor(B[1], B[2], (x, y) => x >= 19 && y >= 9);
  c.poly([[5, 7], [27, 7], [21, 4], [11, 4]], C.gold[2]).ellipse(16, 4, 4.5, 3, C.gold[1], (x, y) => y < 5);
  c.rect(10, 6, 12, 1, '#c44a3a');
  c.eyes(13, 9, 5, 'dot').dots([[13, 13], [14, 14], [15, 13], [16, 14], [17, 13], [18, 14]], INK);
  c.dots([[4, 14], [27, 17], [3, 17]], C.gold[1]);
  return c.outline().shadow(16, 29.5, 6).finish();
};

// 砂漠の風に吹かれつづけたかかし（まわりに砂嵐）
const sandscarecrow = () => {
  const c = makeCanvas();
  const B = ['#fbe8c4', '#e9c98d', '#c9a05e', '#9a7440'];
  for (let i = 0; i < 30; i++) {
    const a = i * 0.42;
    const r = 8 + i * 0.35;
    c.px(16 + Math.cos(a) * r, 15 + Math.sin(a) * r * 0.6, PAL.earth[1]);
  }
  c.rect(15, 20, 2, 9, C.wood[3]);
  c.rect(3, 15, 26, 2, C.wood[3]);
  c.poly([[8, 14], [24, 14], [26, 24], [22, 22], [19, 25], [15, 22], [11, 25], [6, 23]], '#b0704a');
  c.recolor('#b0704a', '#8a5236', (x) => x >= 20);
  c.ellipse(16, 10, 6, 5.5, B[1]);
  c.recolor(B[1], B[2], (x, y) => x >= 19 && y >= 9);
  c.poly([[5, 7], [27, 7], [21, 4], [11, 4]], B[3]).ellipse(16, 4, 4.5, 3, B[2], (x, y) => y < 5);
  c.rect(11, 8, 10, 2, '#5a4a3a').px(13, 8, '#9fd8f2').px(18, 8, '#9fd8f2');
  c.dots([[13, 13], [14, 14], [15, 13], [16, 14], [17, 13], [18, 14]], INK);
  return c.outline().shadow(16, 29.5, 6).finish();
};

// 風を笛に通して音楽にする旅の笛ふき
const piper = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  body(c, ['#ffffff', '#5fae84', '#3f8a64', '#2a6448'], { top: 17, wBottom: 7.5 });
  head(c, { cy: 11.5 });
  c.ellipse(16, 7, 8.5, 2, '#8a5a3a').ellipse(16, 5, 5, 3, '#a8704a', (x, y) => y < 7);
  c.line(20, 4, 26, 0, '#ff6a5a', 1).px(25, 1, '#ffd84d');
  c.eyes(13, 11, 5, 'closed');
  c.line(8, 15, 20, 15, C.wood[1], 1);
  c.dots([[11, 15], [13, 15]], C.wood[3]);
  c.rect(9, 14, 2, 2, C.skin[1]).rect(18, 14, 2, 2, C.skin[1]);
  c.outline();
  c.rect(26, 9, 2, 2, P[1]).rect(27, 5, 1, 4, P[1]).px(28, 6, P[1]);
  c.rect(3, 10, 2, 2, P[1]).rect(4, 6, 1, 4, P[1]).px(5, 7, P[1]);
  return c.shadow(16, 29.5, 8).finish();
};

// 水の髪をもつ歌い手（試し描きのもの）
const singer = () => {
  const c = makeCanvas();
  const SK = ['#ffe2d2', '#f4bea6'];
  const H = ['#93d8ff', '#4ea8e6', '#2f78bf'];
  const D = ['#7fe0f0', '#3aa6c9'];
  c.ellipse(16, 13.5, 9.5, 9, H[2]).ellipse(7.5, 20, 3, 6, H[2]).ellipse(24.5, 20, 3, 6, H[2]);
  c.rect(6, 25, 2, 2, H[1]).rect(24, 25, 2, 2, H[1]).rect(7, 16, 1, 5, H[0]);
  c.each((x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    if (py >= 19.5 && py <= 27.5 && Math.abs(px - 16) <= 3 + (py - 19.5) * 0.75) c.px(x, y, D[0]);
  });
  c.recolor(D[0], D[1], (x, y) => x > 17 || y >= 26);
  for (let i = 0; i < 4; i++) c.rect(9 + i * 4, 27, 2, 1, i % 2 ? H[1] : H[0]);
  c.rect(11, 21, 2, 2, SK[0]).rect(19, 21, 2, 2, SK[1]);
  c.ellipse(16, 14, 6.5, 6, SK[0]);
  c.recolor(SK[0], SK[1], (x, y) => y >= 18 || (x >= 21 && y >= 12));
  c.ellipse(16, 8.5, 7.75, 4.25, H[1]);
  for (const bx of [10, 13, 16, 19, 22]) c.dots([[bx, 11], [bx - 1, 10], [bx + 1, 10]], H[1]);
  c.rect(12, 6, 3, 1, H[0]);
  c.dots([[23, 4], [23, 5], [22, 6], [23, 6], [24, 6], [22, 7], [23, 7], [24, 7]], H[0]).px(22, 6, WHITE);
  for (const ex of [13, 19]) c.dots([[ex - 1, 15], [ex, 14], [ex + 1, 15]], INK);
  c.rect(10, 16, 2, 1, '#ff9eb0').rect(21, 16, 2, 1, '#ff9eb0').rect(16, 17, 1, 2, '#d4415a');
  c.rect(27, 10, 2, 2, '#ffd84d').rect(28, 6, 1, 4, '#ffd84d').px(29, 7, '#ffd84d');
  return c.outline().shadow(16, 29.5, 9, 1.5).finish();
};

// 雲の上で太鼓をたたく小さな雷の主
const raijin = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    c.ellipse(16 + Math.cos(a) * 11.5, 12 + Math.sin(a) * 9, 2.4, 2.4, '#e46a5a').ellipse(16 + Math.cos(a) * 11.5, 12 + Math.sin(a) * 9, 1.2, 1.2, P[1]);
  }
  for (const [x, r] of [[9, 4], [16, 5], [23, 4]]) c.ellipse(x, 26, r, 3, WHITE);
  c.recolor(WHITE, '#d8e0ea', (x, y) => y >= 27);
  body(c, ['#ffffff', '#f4d23c', '#c9a020', '#9a7a18'], { top: 17, bottom: 24, wBottom: 6, legs: false });
  c.rect(11, 20, 10, 2, '#3a3450');
  head(c, { cy: 11.5 });
  c.poly([[9, 8], [10, 2], [13, 5], [16, 1], [19, 5], [22, 2], [23, 8]], P[1]);
  c.poly([[11, 5], [12, 1], [13.5, 4.5]], WHITE).poly([[18.5, 4.5], [20, 1], [21, 5]], WHITE);
  c.eyes(13, 11, 5, 'angry').mouth(16, 15, 'grin');
  return c.outline().finish();
};

// かまどの火を守る小人（とんがり帽子とひげ）
const stovesprite = () => {
  const c = makeCanvas();
  body(c, ['#fff4e2', '#e9d3b0', '#c9ad84', '#9c8458'], { top: 18, bottom: 26, wBottom: 6.5, legCol: '#5a4038' });
  head(c, { cy: 13, rx: 6, ry: 5.5 });
  c.poly([[9, 11], [23, 11], [20, 3], [13, 1]], PAL.fire[2]).poly([[13, 1], [11, 0], [15, 4]], PAL.fire[2]);
  c.rect(9, 10, 14, 2, PAL.fire[3]);
  c.poly([[11, 15], [21, 15], [19, 21], [16, 23], [13, 21]], WHITE);
  c.eyes(13, 12, 5, 'dot').px(16, 15, '#ff9a7a');
  c.outline();
  c.dots([[5, 5], [27, 8], [25, 3]], C.lava[1]);
  return c.shadow(16, 29.5, 7).finish();
};

// 雪の日に現れる、わらの帽子の子ども（雪玉を持つ）
const snowkid = () => {
  const c = makeCanvas();
  const S = ['#fbf0c8', '#e8cf8a', '#c9a858', '#9c8040'];
  body(c, S, { top: 17, bottom: 26, wTop: 5, wBottom: 8 });
  for (let x = 8; x <= 23; x += 2) c.line(x, 20, x - 0.5, 26, S[2]);
  head(c, { cy: 12.5, rx: 6, ry: 5.5 });
  c.poly([[5, 11], [27, 11], [16, 1]], S[1]);
  c.recolor(S[1], S[2], (x, y) => x >= 18 && y < 11);
  c.eyes(13, 12, 5, 'dot').mouth(16, 15, 'smile').cheeks(11, 15, 9);
  c.ellipse(24, 21, 3, 3, WHITE);
  c.outline();
  c.dots([[3, 4], [28, 5], [4, 20]], WHITE);
  return c.shadow(16, 29.5, 8).finish();
};

// 温泉が大好きなカッパ。頭の皿にお湯、湯気
const kappa = () => {
  const c = makeCanvas();
  const G = ['#d9f7b0', '#8fd46a', '#5fae48', '#3f8634'];
  c.ellipse(16, 21, 7, 6, '#7a8f4a');
  body(c, G, { top: 17, bottom: 26, wTop: 4, wBottom: 6 });
  c.ellipse(16, 22, 3.5, 3.5, '#f2e6a8');
  head(c, { cy: 11.5, rx: 6.5, ry: 6, skin: G });
  c.ellipse(16, 6, 5, 1.8, '#e8f6ff').ellipse(16, 6, 3.5, 1, PAL.water[1]);
  c.poly([[13, 13], [19, 13], [16, 16]], '#ffc23c');
  c.eyes(12, 10, 7, 'dot');
  c.outline();
  c.line(13, 3, 12, 1, WHITE).line(16, 3, 17, 0, WHITE).line(19, 3, 20, 1, WHITE);
  return c.shadow(16, 29.5, 8).finish();
};

// 炎の剣をふるう剣士
const flamelord = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  c.line(23, 18, 28, 3, '#fff3c4', 2);
  c.poly([[24, 12], [28, 2], [30, 6], [29, 13]], C.lava[1]);
  c.rect(21, 18, 4, 2, C.wood[3]);
  body(c, ['#ffe0c8', '#d84a3a', '#a83228', '#7a2420'], { top: 17, bottom: 26, wBottom: 6.5, legCol: '#4a3a3a' });
  c.rect(10, 21, 12, 1, C.gold[1]);
  head(c, { cy: 11.5 });
  c.ellipse(16, 7, 7, 3.5, '#5a2a2a', (x, y) => y < 9);
  c.rect(9, 8, 14, 2, P[2]).line(9, 9, 5, 12, P[2]);
  c.eyes(13, 11, 5, 'angry').mouth(16, 15, 'flat');
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 氷の城に住む魔女（とんがり帽子と氷の杖）
const icewitch = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  c.line(24, 8, 24, 27, C.wood[1]);
  c.dots([[24, 4], [24, 5], [24, 6], [22, 5], [23, 5], [25, 5], [26, 5], [23, 4], [25, 6], [23, 6], [25, 4]], P[1]);
  body(c, ['#e8f8ff', '#6fb4e8', '#4a8cc8', '#2f66a0'], { top: 17, bottom: 27, wBottom: 8, legs: false });
  head(c, { cy: 12.5, rx: 6, ry: 5.5, skin: ['#ffffff', '#f2fbff', '#d6ecf5', '#b7d4e2'] });
  c.rect(10, 11, 2, 7, '#e8f8ff').rect(20, 11, 2, 7, '#e8f8ff');
  c.poly([[6, 10], [26, 10], [19, 6], [17, -1], [13, 6]], '#4a8cc8');
  c.recolor('#4a8cc8', '#2f66a0', (x, y) => y >= 9);
  c.px(15, 4, P[0]);
  c.eyes(13, 12, 5, 'dot', '#2b4a6b').mouth(16, 15, 'smile2', '#2b4a6b');
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 小さな羽の天使（光の弓）
const cherub = () => {
  const c = makeCanvas();
  const P = PAL.light;
  wings(c, WHITE, '#fff6d6', { y: 17, span: 8 });
  body(c, [WHITE, '#fffbea', '#f0e2b4', '#d8c48a'], { top: 18, bottom: 25, wBottom: 5.5 });
  head(c, { cy: 12.5, rx: 6, ry: 5.5 });
  c.ellipse(16, 8.5, 6.5, 3, C.gold[1], (x, y) => y < 10).dots([[10, 10], [22, 10]], C.gold[1]);
  halo(c, 16, 4, P[2]);
  c.eyes(13, 12, 5, 'dot').mouth(16, 15, 'smile').cheeks(11, 15, 9);
  c.line(6, 17, 6, 25, C.gold[2]).line(6, 17, 9, 21, P[0]).line(9, 21, 6, 25, P[0]);
  return c.outline().shadow(16, 29.5, 7).finish();
};

// 羽が黒くなってしまった天使
const fallen = () => {
  const c = makeCanvas();
  const P = PAL.dark;
  wings(c, '#3b2d5c', '#5a4a80', { y: 17, span: 10 });
  body(c, ['#c8b8e8', '#4a3d6a', '#33294d', '#221a36'], { top: 18, bottom: 26, wBottom: 6 });
  head(c, { cy: 12.5, rx: 6, ry: 5.5 });
  c.ellipse(16, 8.5, 6.8, 3.2, '#e8e0f4', (x, y) => y < 10).rect(9, 9, 2, 6, '#e8e0f4').rect(21, 9, 2, 6, '#e8e0f4');
  halo(c, 16, 4, '#8a7aa8', true);
  c.eyes(13, 12, 5, 'dot', '#6a1a3a').mouth(16, 15, 'smile2');
  c.line(25, 16, 25, 25, '#2a2238').line(25, 16, 23, 20, P[1]).line(23, 20, 25, 25, P[1]);
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 稲妻をあやつる魔道士（フードと杖）
const lightningmage = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  c.line(24, 6, 24, 27, C.wood[1]);
  c.poly([[22, 6], [26, 1], [25, 5], [27, 5], [23, 10], [24, 6]], P[1]);
  body(c, ['#fff6c8', '#e8c43a', '#c09a24', '#8a6c18'], { top: 17, bottom: 27, wBottom: 8, legs: false });
  c.ellipse(16, 11.5, 8, 8, '#c09a24');
  c.poly([[10, 6], [16, 0], [22, 6]], '#c09a24');
  head(c, { cy: 12.5, rx: 5.5, ry: 5 });
  c.ellipse(16, 8.5, 6, 2, '#c09a24', (x, y) => y < 9);
  c.eyes(13, 12, 5, 'dot').mouth(16, 15, 'smile2');
  c.outline();
  twinkle(c, 4, 8, P[1]);
  return c.shadow(16, 29.5, 9).finish();
};

// 聖なる火を守りつづける守り人（たいまつ）
const torchbearer = () => {
  const c = makeCanvas();
  c.line(24, 9, 24, 24, C.wood[2], 2);
  c.poly([[22, 9], [24, 1], [26, 9]], PAL.fire[2]).poly([[23, 9], [24, 4], [25, 9]], C.lava[0]);
  body(c, ['#ffffff', '#f6f1e6', '#d9cfba', '#b0a48a'], { top: 17, bottom: 27, wBottom: 7.5, legs: false });
  c.rect(15, 18, 2, 9, C.gold[1]);
  head(c, { cy: 12, rx: 6, ry: 5.5 });
  c.ellipse(16, 10, 8, 7, '#f6f1e6', (x, y) => y < 8 || x < 10 || x > 21);
  c.recolor('#f6f1e6', '#d9cfba', (x, y) => x >= 21 && y < 17);
  c.eyes(13, 11, 5, 'line').mouth(16, 14, 'smile2');
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 天使たちをたばねる大きな翼の天使（光の槍）
const archangel = () => {
  const c = makeCanvas();
  const P = PAL.light;
  wings(c, WHITE, P[1], { y: 15, span: 13 });
  c.line(26, 2, 26, 28, C.gold[2]).poly([[24, 5], [26, 0], [28, 5]], P[1]);
  body(c, [WHITE, '#fffdf4', '#efe3bf', '#d6c48e'], { top: 17, bottom: 27, wBottom: 7.5, legs: false });
  c.rect(10, 21, 12, 1, C.gold[1]);
  head(c, { cy: 11.5, rx: 6, ry: 5.5 });
  c.ellipse(16, 8, 7, 3.2, C.gold[1], (x, y) => y < 10).rect(9, 8, 2, 9, C.gold[1]).rect(21, 8, 2, 9, C.gold[1]);
  halo(c, 16, 3, P[2]);
  c.eyes(13, 11, 5, 'line').mouth(16, 14, 'smile2');
  return c.outline().shadow(16, 29.5, 10).finish();
};

// 闇の力を宿した大男（角）
const demon = () => {
  const c = makeCanvas();
  const S = ['#c8a8e8', '#8f6ac0', '#6a4a9c', '#4a3274'];
  c.rect(10, 24, 4, 5, '#2a2238').rect(18, 24, 4, 5, '#2a2238');
  c.ellipse(16, 19, 11, 7, S[1]);
  c.recolor(S[1], S[2], (x, y) => x >= 21 || y >= 23);
  c.ellipse(4.5, 20, 3, 4, S[1]).ellipse(27.5, 20, 3, 4, S[2]);
  c.rect(8, 23, 16, 3, '#3a3048');
  c.ellipse(16, 10.5, 6, 5.5, S[1]);
  c.recolor(S[1], S[2], (x, y) => x >= 19 && y >= 9 && y < 16);
  c.poly([[10, 8], [7, 1], [12, 6]], '#f2e6c8').poly([[22, 8], [25, 1], [20, 6]], '#f2e6c8');
  c.eyes(13, 9, 5, 'angry', '#ffd84d');
  c.mouth(16, 13, 'fang');
  c.rect(12, 17, 2, 1, S[3]).rect(18, 17, 2, 1, S[3]);
  return c.outline().shadow(16, 29.5, 12).finish();
};

// 魔王城の玉座にすわる闇の王（かんむりとマント）
const maou = () => {
  const c = makeCanvas();
  const S = ['#c8a8e8', '#8f6ac0', '#6a4a9c', '#4a3274'];
  c.poly([[5, 28], [9, 12], [23, 12], [27, 28]], '#c43a4a');
  c.poly([[7, 28], [10, 14], [22, 14], [25, 28]], '#2a2238');
  body(c, ['#6a5a8a', '#3a3050', '#2a2238', '#1c1828'], { top: 15, bottom: 27, wTop: 4, wBottom: 8, legs: false, skin: S });
  c.rect(14, 16, 4, 6, C.gold[1]).px(15, 18, C.red[1]).px(16, 18, C.red[1]);
  head(c, { cy: 10, rx: 6, ry: 5.5, skin: S });
  c.poly([[10, 7], [5, 0], [7, 0], [12, 5]], '#f2e6c8').poly([[22, 7], [27, 0], [25, 0], [20, 5]], '#f2e6c8');
  c.poly([[11, 6], [11, 1], [13, 3.5], [16, 0], [19, 3.5], [21, 1], [21, 6]], C.gold[1]);
  c.px(16, 3, C.red[1]);
  c.eyes(13, 9, 5, 'angry', '#ff4a4a').mouth(16, 13, 'flat');
  return c.outline().shadow(16, 29.5, 12).finish();
};

export const FIEND = { scarecrow, sandscarecrow, piper, singer, raijin, stovesprite, snowkid, kappa, flamelord, icewitch, cherub, fallen, lightningmage, torchbearer, archangel, demon, maou };
