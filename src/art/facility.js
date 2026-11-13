// 施設の絵（2026-11-14）。モンスターと同じく、ポップな太い縁取りのドット絵。
// 大きさは施設のマスに合わせる（1マス＝32。上を向いたときの形で、2×2マスなら 64×64、魔術研究所は 96×32）。
// 横を向いたときは、地図に描くときに絵を回す（src/ui/render.js）。
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { twinkle } from './parts.js';

const GLASS = ['#ffffff', '#e8f6ff', '#bfe3f5', '#8fc3dc'];
const BRICK = ['#f6c8a8', '#d98a62', '#b0613f', '#7d3f2a'];
const NIGHT = '#3a2a5a';

/** 角を丸めた四角 */
function rrect(c, x, y, w, h, col) {
  c.rect(x, y, w, h, col);
  for (const [px, py] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) c.px(px, py, null);
  return c;
}
/** 右側に影をつける（x0 より右を影の色に） */
const shadeRight = (c, from, to, x0, test) => c.recolor(from, to, (x, y) => x >= x0 && (!test || test(x, y)));
/** ほのお（下の中心 cx,by、高さ h、太さ w） */
function flame(c, cx, by, h, w, P = PAL.fire) {
  c.poly([[cx - w, by], [cx - w * 0.9, by - h * 0.45], [cx - w * 0.3, by - h * 0.75], [cx, by - h], [cx + w * 0.4, by - h * 0.7], [cx + w * 0.9, by - h * 0.4], [cx + w, by]], P[2]);
  c.poly([[cx - w * 0.6, by], [cx - w * 0.5, by - h * 0.4], [cx, by - h * 0.7], [cx + w * 0.5, by - h * 0.4], [cx + w * 0.6, by]], P[1]);
  c.poly([[cx - w * 0.3, by], [cx, by - h * 0.4], [cx + w * 0.3, by]], P[0]);
  return c;
}
/** いなずま（左上 x,y、大きさ s） */
function bolt(c, x, y, s, col) {
  c.poly([[x + 2 * s, y], [x + 5 * s, y], [x + 3.5 * s, y + 3 * s], [x + 5.5 * s, y + 3 * s], [x + 1.5 * s, y + 8 * s], [x + 2.5 * s, y + 4.5 * s], [x + 0.5 * s, y + 4.5 * s]], col);
  return c;
}
/** 雪の結晶 */
function snowflake(c, cx, cy, r, col) {
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    c.line(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, col);
  }
  return c;
}
/** 円（輪）。太さ t の輪を col で描く */
function ring(c, cx, cy, r, t, col) {
  c.ellipse(cx, cy, r, r, col, (x, y) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 >= (r - t) ** 2);
  return c;
}
/** 魔法陣（64×64）。P は属性の色、center は真ん中の絵 */
function magicCircle(P, center) {
  const c = makeCanvas(64, 64);
  c.ellipse(32, 33, 29, 27, P[3]);
  c.ellipse(32, 33, 26.5, 24.5, '#3b2440');
  ring(c, 32, 33, 20, 1.6, P[1]);
  // 4つの先がとがった星（方位の印のような形）と、内側の小さな輪
  const star = [];
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 4;
    const r = i % 2 ? 6 : 18;
    star.push([32 + Math.cos(a) * r, 33 + Math.sin(a) * r * 0.95]);
  }
  for (let i = 0; i < 8; i++) c.line(...star[i], ...star[(i + 1) % 8], P[1]);
  ring(c, 32, 33, 12, 1, P[2]);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    c.rect(Math.round(32 + Math.cos(a) * 23.5), Math.round(33 + Math.sin(a) * 21.5), 2, 2, P[0]);
  }
  center(c);
  c.outline();
  return c.finish();
}

// ===== 第1地方 =====
const beam = () => {
  const c = makeCanvas();
  const P = PAL.none;
  c.poly([[7, 29], [25, 29], [22, 23], [10, 23]], C.stone[1]);
  shadeRight(c, C.stone[1], C.stone[2], 19);
  rrect(c, 12, 11, 8, 13, P[1]);
  shadeRight(c, P[1], P[2], 17);
  c.rect(13, 13, 2, 7, WHITE).rect(15, 16, 2, 3, P[3]);
  c.rect(10, 9, 12, 3, C.gold[1]);
  shadeRight(c, C.gold[1], C.gold[2], 18);
  c.poly([[16, 0.5], [22, 5.5], [16, 10], [10, 5.5]], '#bdf3ff');
  c.poly([[16, 0.5], [12, 5], [16, 5]], WHITE);
  c.outline();
  twinkle(c, 25, 3);
  twinkle(c, 6, 6, '#bdf3ff');
  return c.shadow(16, 30.5, 10).finish();
};

const flag = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  c.ellipse(10, 28, 6, 2.2, C.moss[2]);
  c.rect(9, 4, 2, 24, C.wood[2]);
  c.poly([[11, 5], [19, 3.5], [28, 6], [24, 10], [28, 14.5], [19, 14], [11, 14]], P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 11);
  c.rect(12, 6, 9, 2, P[0]);
  c.ellipse(10, 3.5, 2, 2, C.gold[1]);
  c.outline();
  c.line(17, 19, 26, 19, P[0]).line(26, 19, 27, 18, P[0]).line(14, 23, 22, 23, P[0]).line(22, 23, 23, 22, P[0]);
  return c.shadow(12, 30.5, 8).finish();
};

const stonethrower = () => {
  const c = makeCanvas();
  const W = C.wood;
  c.rect(5, 22, 22, 4, W[1]);
  c.poly([[9, 22], [14, 12], [17, 12], [13, 22]], W[2]);
  c.line(10, 21, 23, 7, W[1], 3);
  c.ellipse(23, 6, 5, 3.5, W[2]);
  c.ellipse(23, 4.5, 4, 3.5, C.stone[1]);
  c.recolor(C.stone[1], C.stone[2], (x, y) => x >= 24 && y >= 5);
  c.px(21, 3, WHITE);
  for (const x of [9, 23]) {
    c.ellipse(x, 26.5, 3.5, 3.5, W[3]);
    c.ellipse(x, 26.5, 1.5, 1.5, C.metal[2]);
  }
  c.recolor(W[1], W[2], (x, y) => y >= 24);
  c.outline();
  return c.shadow(16, 30.5, 11).finish();
};

// 大いしゆみ（1×2マス、32×64）。上へ太い矢を撃つ
const ballista = () => {
  const c = makeCanvas(32, 64);
  const W = C.wood;
  const P = PAL.wind;
  c.rect(5, 46, 22, 12, W[2]);
  c.rect(5, 46, 22, 3, W[1]);
  for (const x of [8, 24]) {
    c.ellipse(x, 58.5, 4, 4, W[3]);
    c.ellipse(x, 58.5, 1.5, 1.5, C.metal[2]);
  }
  rrect(c, 12, 14, 8, 36, W[1]);
  shadeRight(c, W[1], W[2], 17);
  // 弓（ゆるいアーチ）
  for (let i = 0; i <= 24; i++) {
    const x = 2 + i;
    const y = 18 - Math.round(5 * Math.sin((i / 24) * Math.PI));
    c.rect(x, y, 2, 3, P[3]);
  }
  c.rect(3, 15, 3, 4, C.metal[2]).rect(26, 15, 3, 4, C.metal[2]);
  c.line(3, 19, 16, 32, INK).line(28, 19, 16, 32, INK);
  // 矢
  c.rect(15, 4, 2, 30, C.wood[3]);
  c.poly([[16, 0], [20, 6], [12, 6]], C.metal[1]);
  c.poly([[15, 28], [11, 34], [15, 32]], P[1]).poly([[17, 28], [21, 34], [17, 32]], P[1]);
  c.rect(13, 38, 6, 3, C.metal[2]);
  c.outline();
  c.line(4, 8, 8, 6, P[0]).line(24, 10, 28, 8, P[0]);
  return c.finish();
};

// 大風車（2×2マス）
const windmill = () => {
  const c = makeCanvas(64, 64);
  const S = C.stone;
  c.poly([[19, 61], [45, 61], [41, 27], [23, 27]], S[0]);
  c.recolor(S[0], S[1], (x) => x >= 38);
  c.rect(28, 49, 8, 12, C.wood[2]);
  c.ellipse(32, 49, 4, 4, C.wood[2]);
  c.rect(26, 35, 5, 5, '#6fb4f5').rect(34, 35, 5, 5, '#6fb4f5');
  c.poly([[19, 29], [32, 14], [45, 29]], PAL.wind[3]);
  c.recolor(PAL.wind[3], PAL.wind[2], (x, y) => x < 32 && y > 20);
  // 羽根（4枚、ななめ）
  const hub = [32, 22];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const pt = (u, v) => [hub[0] + u * ca - v * sa, hub[1] + u * sa + v * ca];
    c.poly([pt(4, -1), pt(27, -1), pt(27, 6), pt(6, 6)], '#fff8e6');
    c.line(...pt(3, 0), ...pt(28, 0), C.wood[2], 2);
    for (const u of [11, 18, 25]) c.line(...pt(u, 0), ...pt(u, 6), C.wood[1]);
  }
  c.ellipse(32, 22, 3.5, 3.5, C.wood[3]);
  c.ellipse(32, 22, 1.5, 1.5, C.gold[1]);
  c.outline();
  return c.finish();
};

// 鍛冶場（2×1マス、64×32）。左に炉、右に金床
const smithy = () => {
  const c = makeCanvas(64, 32);
  c.rect(8, 1, 7, 10, BRICK[2]);
  c.rect(7, 1, 9, 2, BRICK[3]);
  rrect(c, 3, 9, 30, 20, BRICK[1]);
  shadeRight(c, BRICK[1], BRICK[2], 27);
  for (let y = 12; y < 28; y += 4) c.line(4, y, 31, y, BRICK[2]);
  c.ellipse(18, 22, 8, 7, BRICK[3], (x, y) => y >= 15);
  c.rect(11, 22, 15, 6, BRICK[3]);
  flame(c, 18, 27, 10, 6);
  // 金床
  c.poly([[37, 15], [57, 15], [57, 19], [47, 21], [41, 20], [35, 17]], C.metal[2]);
  c.rect(38, 15, 18, 2, C.metal[1]);
  c.poly([[44, 21], [51, 21], [54, 28], [41, 28]], C.metal[3]);
  // かなづち
  c.line(55, 5, 47, 13, C.wood[2], 2);
  c.rect(52, 2, 7, 5, C.metal[3]);
  c.outline();
  c.dots([[22, 13], [25, 11], [20, 10]], PAL.fire[0]);
  return c.finish();
};

const sword = () => {
  const c = makeCanvas();
  const S = C.stone;
  c.poly([[6, 29], [26, 29], [23, 21], [9, 21]], S[1]);
  shadeRight(c, S[1], S[2], 20);
  c.rect(6, 27, 20, 2, S[2]);
  c.rect(15, 9, 3, 13, C.metal[1]);
  c.rect(17, 9, 1, 13, C.metal[2]);
  c.rect(11, 8, 11, 2, C.gold[1]);
  c.rect(15, 2, 3, 6, C.wood[2]);
  c.ellipse(16.5, 2, 2.3, 2.3, C.gold[1]);
  c.px(15, 10, WHITE).px(15, 11, WHITE);
  c.outline();
  twinkle(c, 24, 6, C.gold[0]);
  return c.shadow(16, 30.5, 11).finish();
};

const horn = () => {
  const c = makeCanvas();
  c.rect(10, 22, 12, 4, C.wood[2]).rect(8, 26, 16, 3, C.wood[3]);
  // 曲がった角（丸を並べて太くしていく）
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = 7 + t * 18;
    const y = 18 - Math.sin(t * Math.PI * 0.85) * 10;
    c.ellipse(x, y, 1.5 + t * 4, 1.5 + t * 4, '#fff3d6');
  }
  c.recolor('#fff3d6', '#efd7a6', (x, y) => y >= 14);
  for (const t of [0.3, 0.55, 0.8]) {
    const x = 7 + t * 18;
    const y = 18 - Math.sin(t * Math.PI * 0.85) * 10;
    c.line(x - 1, y - 2 - t * 4, x + 1, y + 2 + t * 4, C.gold[2], 2);
  }
  c.ellipse(26, 9.5, 3.5, 4.5, C.wood[3]);
  c.ellipse(5.5, 19, 1.5, 1.5, C.gold[2]);
  c.outline();
  c.line(29, 3, 31, 1, WHITE).line(29, 15, 31, 17, WHITE);
  return c.shadow(16, 30.5, 10).finish();
};

// ===== 第2地方 =====
const fog = () => {
  const c = makeCanvas();
  const P = PAL.water;
  c.ellipse(16, 24, 13, 5.5, C.stone[1]);
  c.ellipse(16, 23, 11, 3.5, P[2]);
  c.rect(14, 12, 4, 11, C.stone[1]);
  c.ellipse(16, 12, 5, 2, C.stone[1]);
  c.ellipse(16, 11.5, 3.5, 1.2, P[1]);
  c.recolor(C.stone[1], C.stone[2], (x, y) => x >= 22 || (x >= 17 && y < 23));
  c.line(16, 10, 16, 4, P[1], 2).line(16, 5, 10, 10, P[1]).line(16, 5, 22, 10, P[1]);
  c.outline();
  const mist = 'rgba(232,246,255,0.9)';
  c.ellipse(6, 6, 4, 2.5, mist).ellipse(26, 5, 4.5, 2.5, mist).ellipse(28, 15, 3, 2, mist).ellipse(4, 15, 3, 2, mist);
  return c.finish();
};

const tower = () => {
  const c = makeCanvas();
  const S = C.metal;
  c.poly([[8, 29], [24, 29], [21, 13], [11, 13]], S[1]);
  shadeRight(c, S[1], S[2], 19);
  c.rect(9, 10, 14, 4, S[2]);
  c.rect(9, 8, 3, 2, S[2]).rect(14.5, 8, 3, 2, S[2]).rect(20, 8, 3, 2, S[2]);
  c.rect(14, 20, 4, 5, S[3]);
  c.ellipse(16, 4.5, 4.5, 4.5, PAL.thunder[1]);
  c.ellipse(15, 3.5, 1.5, 1.5, WHITE);
  c.outline();
  bolt(c, 3, 2, 1, PAL.thunder[1]);
  bolt(c, 24, 4, 0.9, PAL.thunder[1]);
  return c.shadow(16, 30.5, 9).finish();
};

const lightningrod = () => {
  const c = makeCanvas();
  c.poly([[10, 29], [22, 29], [18, 22], [14, 22]], C.stone[1]);
  shadeRight(c, C.stone[1], C.stone[2], 18);
  c.rect(15, 6, 2, 17, C.metal[2]);
  c.poly([[16, 1], [18.5, 7], [13.5, 7]], C.metal[1]);
  for (const y of [11, 15, 19]) c.rect(13, y, 6, 2, '#e09a5a');
  c.outline();
  c.line(12, 2, 9, 5, PAL.thunder[1]).line(9, 5, 11, 6, PAL.thunder[1]).line(11, 6, 7, 10, PAL.thunder[1]);
  c.line(20, 2, 23, 5, PAL.thunder[1]).line(23, 5, 21, 6, PAL.thunder[1]).line(21, 6, 25, 10, PAL.thunder[1]);
  return c.shadow(16, 30.5, 8).finish();
};

// 大渦の泉（2×2マス）。上から見た丸い泉に、うずまき
const whirlpool = () => {
  const c = makeCanvas(64, 64);
  const P = PAL.water;
  c.ellipse(32, 34, 29, 26, C.stone[1]);
  c.recolor(C.stone[1], C.stone[2], (x, y) => y >= 46);
  c.ellipse(32, 33, 25, 22, P[2]);
  for (let i = 0; i < 220; i++) {
    const t = i / 220;
    const a = t * Math.PI * 5;
    const r = 2 + t * 21;
    c.rect(Math.round(32 + Math.cos(a) * r), Math.round(33 + Math.sin(a) * r * 0.9), 2, 2, i % 2 ? P[1] : P[0]);
  }
  c.ellipse(32, 33, 3, 3, P[3]);
  c.outline();
  return c.finish();
};

// 錬金アトリエ（2×2マス）。三角屋根の小さな家と、色つきのけむり
const atelier = () => {
  const c = makeCanvas(64, 64);
  const roof = ['#c8f0e6', '#5cc6b0', '#3a9a88', '#26706a'];
  c.rect(42, 8, 7, 16, BRICK[2]);
  rrect(c, 9, 28, 46, 33, '#fff3d6');
  shadeRight(c, '#fff3d6', '#efd7a6', 44);
  c.poly([[4, 31], [32, 8], [60, 31]], roof[1]);
  c.recolor(roof[1], roof[2], (x, y) => y >= 26);
  c.rect(27, 44, 10, 17, C.wood[2]);
  c.ellipse(32, 44, 5, 5, C.wood[2], (x, y) => y < 44);
  c.rect(13, 36, 10, 9, '#6fb4f5').rect(41, 36, 10, 9, '#6fb4f5');
  c.line(18, 36, 18, 44, '#fff3d6').line(46, 36, 46, 44, '#fff3d6');
  // 看板のフラスコ
  c.ellipse(32, 22, 4, 4, '#9bf07a');
  c.rect(31, 15, 3, 5, GLASS[2]);
  c.outline();
  c.ellipse(46, 4, 3, 2.5, '#ffb3cd').ellipse(51, 2, 2, 1.5, '#9bf07a').ellipse(43, 1, 1.5, 1.2, '#ffe45a');
  return c.finish();
};

/** まるいフラスコ（liquid は中身の色） */
function flask(c, liquid) {
  c.rect(13, 3, 6, 9, GLASS[1]);
  c.rect(12, 2, 8, 2, C.wood[2]);
  c.ellipse(16, 20, 10, 9, GLASS[1]);
  c.ellipse(16, 21.5, 8.5, 7, liquid[1], (x, y) => y >= 17);
  c.recolor(liquid[1], liquid[2], (x, y) => y >= 25 || x >= 21);
  c.rect(10, 15, 2, 4, WHITE).px(14, 5, WHITE).px(14, 6, WHITE);
  return c;
}
const acidpotion = () => {
  const c = makeCanvas();
  const acid = ['#e9ffb8', '#9bf07a', '#5cc25a', '#3a8a3c'];
  flask(c, acid);
  c.dots([[13, 20], [18, 22], [20, 19], [15, 24]], acid[0]);
  c.outline();
  c.ellipse(23, 8, 1.5, 1.5, acid[1]).ellipse(26, 4, 1, 1, acid[1]).ellipse(9, 9, 1, 1, acid[1]);
  return c.shadow(16, 30.5, 8).finish();
};
const buffpotion = () => {
  const c = makeCanvas();
  flask(c, PAL.thunder);
  bolt(c, 13, 16, 1, WHITE);
  c.outline();
  c.poly([[25, 4], [28, 8], [26.5, 8], [26.5, 12], [23.5, 12], [23.5, 8], [22, 8]], PAL.thunder[1]);
  return c.shadow(16, 30.5, 8).finish();
};

// ===== 第3地方 =====
const brazier = () => {
  const c = makeCanvas();
  const M = C.black;
  c.line(10, 28, 14, 19, M[2], 2).line(22, 28, 18, 19, M[2], 2).line(16, 28, 16, 19, M[1], 2);
  c.ellipse(16, 17, 9, 4, M[1]);
  c.ellipse(16, 15.5, 8, 2, M[3]);
  flame(c, 16, 16, 15, 7);
  c.outline();
  c.dots([[7, 6], [25, 4], [24, 10]], PAL.fire[1]);
  return c.shadow(16, 30.5, 8).finish();
};

const firearrow = () => {
  const c = makeCanvas();
  const W = C.wood;
  c.line(8, 29, 12, 14, W[2], 2).line(24, 29, 20, 14, W[2], 2);
  c.line(9, 26, 22, 18, W[3]).line(23, 26, 10, 18, W[3]);
  c.rect(7, 12, 18, 4, W[1]);
  c.poly([[6, 12], [16, 4], [26, 12]], PAL.fire[3]);
  c.recolor(PAL.fire[3], PAL.fire[2], (x) => x < 16);
  c.outline();
  // 火のついた矢
  c.line(22, 10, 29, 3, C.wood[3], 1);
  flame(c, 29, 4, 5, 2.5);
  return c.shadow(16, 30.5, 10).finish();
};

const icicle = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  c.poly([[16, 1], [22, 18], [20, 28], [12, 28], [10, 18]], P[1]);
  c.recolor(P[1], P[2], (x) => x >= 17);
  c.poly([[8, 12], [11, 20], [10, 28], [6, 28], [5, 20]], P[2]);
  c.poly([[24, 10], [27, 19], [26, 28], [22, 28], [21, 19]], P[2]);
  c.line(14, 6, 13, 18, WHITE);
  c.outline();
  twinkle(c, 27, 4, WHITE);
  return c.shadow(16, 30.5, 10).finish();
};

const frostcannon = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  c.rect(6, 21, 20, 5, C.metal[2]);
  for (const x of [9, 23]) {
    c.ellipse(x, 26, 3.5, 3.5, C.metal[3]);
    c.ellipse(x, 26, 1.3, 1.3, C.metal[1]);
  }
  rrect(c, 11, 5, 10, 18, P[1]);
  shadeRight(c, P[1], P[2], 18);
  c.rect(10, 3, 12, 4, P[3]);
  c.ellipse(16, 4.5, 3, 1.3, INK);
  snowflake(c, 16, 15, 3, WHITE);
  c.outline();
  c.dots([[6, 4], [26, 3], [27, 9]], WHITE);
  return c.shadow(16, 30.5, 11).finish();
};

// 溶岩の大釜（2×2マス）
const cauldron = () => {
  const c = makeCanvas(64, 64);
  const M = C.black;
  flame(c, 20, 62, 10, 5);
  flame(c, 44, 62, 10, 5);
  c.rect(14, 50, 5, 9, M[2]).rect(45, 50, 5, 9, M[2]);
  c.ellipse(32, 38, 24, 18, M[1]);
  c.recolor(M[1], M[2], (x, y) => (x - 26) ** 2 / 600 + (y - 32) ** 2 / 300 > 1);
  c.ellipse(32, 24, 25, 7, M[0]);
  c.ellipse(32, 24, 21, 5, C.lava[2]);
  c.ellipse(30, 23, 14, 3, C.lava[1]);
  c.ellipse(24, 23, 3, 1.5, C.lava[0]).ellipse(38, 24, 2, 1, C.lava[0]);
  c.outline();
  c.ellipse(26, 13, 3, 3, C.lava[1]).ellipse(38, 9, 2, 2, C.lava[2]).ellipse(31, 4, 1.5, 1.5, C.lava[1]);
  return c.finish();
};

// 魔術研究所（3×1マス、96×32）。横に長い建物と、両はしのとんがり屋根
const magiclab = () => {
  const c = makeCanvas(96, 32);
  const roof = C.purple;
  rrect(c, 10, 12, 76, 19, '#efe6ff');
  shadeRight(c, '#efe6ff', '#d6c8f0', 74);
  c.rect(8, 9, 80, 5, roof[2]);
  for (const x of [4, 76]) {
    rrect(c, x, 10, 16, 21, '#efe6ff');
    c.poly([[x - 2, 11], [x + 8, -1], [x + 18, 11]], roof[1]);
    c.recolor(roof[1], roof[2], (px) => px >= x + 8);
    c.rect(x + 5, 17, 6, 7, '#ffd84d');
  }
  for (const x of [26, 38, 52, 64]) c.rect(x, 17, 6, 7, '#9fdcff');
  c.rect(44, 19, 8, 12, C.wood[2]);
  c.ellipse(48, 19, 4, 3, C.wood[2], (x, y) => y < 19);
  c.outline();
  twinkle(c, 12, 2, '#ffd84d');
  twinkle(c, 84, 2, '#ffd84d');
  c.dots([[48, 4], [47, 5], [49, 5], [48, 6]], '#c79bf2');
  return c.finish();
};

const flamecircle = () =>
  magicCircle(PAL.fire, (c) => {
    flame(c, 32, 40, 14, 6);
  });
const blizzardcircle = () =>
  magicCircle(PAL.ice, (c) => {
    snowflake(c, 32, 33, 7, WHITE);
    c.ellipse(32, 33, 2, 2, PAL.ice[1]);
  });

// ===== 第4地方 =====
const altar = () => {
  const c = makeCanvas();
  const S = C.stone;
  c.poly([[4, 29], [28, 29], [26, 19], [6, 19]], S[0]);
  shadeRight(c, S[0], S[1], 22);
  c.rect(4, 17, 24, 3, S[1]);
  c.rect(11, 20, 10, 9, PAL.light[1]);
  c.rect(15, 20, 2, 9, C.gold[2]);
  c.ellipse(16, 9, 5.5, 5.5, PAL.light[1]);
  c.ellipse(15, 8, 2.5, 2.5, WHITE);
  for (const x of [6, 25]) c.rect(x, 12, 2, 5, WHITE).px(x, 11, PAL.fire[1]).px(x, 10, PAL.fire[0]);
  c.outline();
  for (const [x, y] of [[16, 1], [8, 4], [24, 4]]) twinkle(c, x, y, PAL.light[1]);
  return c.shadow(16, 30.5, 12).finish();
};

const mirror = () => {
  const c = makeCanvas();
  c.line(10, 28, 13, 22, C.gold[2], 2).line(22, 28, 19, 22, C.gold[2], 2);
  c.ellipse(16, 13, 9.5, 11, C.gold[1]);
  c.recolor(C.gold[1], C.gold[2], (x, y) => x >= 22 || y >= 21);
  c.ellipse(16, 13, 7.5, 9, '#d8f3ff');
  c.recolor('#d8f3ff', '#a8dcf5', (x, y) => x + y >= 32);
  c.line(12, 9, 16, 5, WHITE).line(12, 13, 19, 6, WHITE);
  c.ellipse(16, 1.5, 2, 1.5, C.gold[1]);
  c.outline();
  twinkle(c, 27, 4, PAL.light[1]);
  return c.shadow(16, 30.5, 8).finish();
};

const darktower = () => {
  const c = makeCanvas();
  const P = PAL.dark;
  c.poly([[8, 29], [24, 29], [21, 11], [11, 11]], C.black[1]);
  shadeRight(c, C.black[1], C.black[2], 19);
  c.poly([[9, 12], [16, 0], [23, 12]], P[2]);
  c.recolor(P[2], P[3], (x) => x >= 16);
  c.ellipse(16, 18, 3.5, 2.5, '#ff7ad9');
  c.ellipse(16, 18, 1, 2, INK);
  c.rect(14, 24, 4, 5, C.black[3]);
  c.outline();
  c.dots([[5, 6], [4, 5], [6, 5], [27, 9], [26, 8], [28, 8]], P[1]);
  return c.shadow(16, 30.5, 9).finish();
};

// 闇の大時計（2×2マス）。時計の塔と、むらさきの文字盤
const darkclock = () => {
  const c = makeCanvas(64, 64);
  const P = PAL.dark;
  rrect(c, 16, 22, 32, 40, C.black[1]);
  shadeRight(c, C.black[1], C.black[2], 40);
  c.poly([[13, 24], [32, 3], [51, 24]], P[2]);
  c.recolor(P[2], P[3], (x) => x >= 32);
  c.ellipse(32, 32, 13, 13, C.gold[1]);
  c.ellipse(32, 32, 11, 11, NIGHT);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    c.px(Math.round(32 + Math.cos(a) * 9), Math.round(32 + Math.sin(a) * 9), i % 3 ? P[1] : C.gold[0]);
  }
  c.line(32, 32, 32, 25, C.gold[0], 2).line(32, 32, 37, 35, C.gold[0]);
  c.rect(27, 50, 10, 12, C.black[3]);
  c.ellipse(32, 50, 5, 4, C.black[3], (x, y) => y < 50);
  c.outline();
  c.ellipse(32, 4, 2, 2, '#ff7ad9');
  for (const [x, y] of [[8, 12], [56, 14], [6, 40], [58, 44]]) c.dots([[x, y], [x + 1, y - 1], [x + 2, y]], P[1]);
  return c.finish();
};

// 極限研究所（3×2マス、96×64）。光と闇に半分ずつ分かれた丸屋根の大きな建物
const extremelab = () => {
  const c = makeCanvas(96, 64);
  const wall = ['#ffffff', '#f1edff', '#d3cbf0', '#a99fd6'];
  for (const x of [4, 78]) {
    rrect(c, x, 22, 14, 40, wall[1]);
    c.poly([[x - 1, 23], [x + 7, 11], [x + 15, 23]], x < 40 ? PAL.light[2] : PAL.dark[2]);
  }
  rrect(c, 16, 32, 64, 30, wall[1]);
  shadeRight(c, wall[1], wall[2], 70);
  c.rect(14, 28, 68, 5, wall[2]);
  // 丸屋根（左が光、右が闇）
  c.ellipse(48, 30, 22, 20, PAL.light[1], (x, y) => y < 30 && x < 48);
  c.ellipse(48, 30, 22, 20, PAL.dark[1], (x, y) => y < 30 && x >= 48);
  c.recolor(PAL.light[1], PAL.light[2], (x, y) => x < 34 && y > 18);
  c.recolor(PAL.dark[1], PAL.dark[2], (x, y) => x > 62 && y > 18);
  c.rect(46, 4, 4, 8, C.metal[2]);
  c.ellipse(48, 3, 3, 3, '#ffffff');
  for (const x of [24, 34, 58, 68]) c.rect(x, 38, 6, 9, x < 48 ? '#ffe45a' : '#c79bf2');
  c.rect(42, 44, 12, 18, C.wood[2]);
  c.ellipse(48, 44, 6, 5, C.wood[2], (x, y) => y < 44);
  c.rect(47, 44, 2, 18, C.wood[3]);
  for (const x of [7, 81]) c.rect(x + 3, 32, 4, 6, x < 40 ? '#ffe45a' : '#c79bf2');
  c.outline();
  twinkle(c, 40, 6, PAL.light[1]);
  c.dots([[58, 5], [57, 6], [59, 6], [58, 7]], PAL.dark[1]);
  return c.finish();
};

/** 本（open = ひらいた本） */
const lightbook = () => {
  const c = makeCanvas();
  const G = C.gold;
  c.poly([[3, 17], [16, 21], [29, 17], [29, 26], [16, 29], [3, 26]], G[2]);
  c.poly([[4, 14], [16, 18], [16, 27], [4, 23]], '#fffbe8');
  c.poly([[28, 14], [16, 18], [16, 27], [28, 23]], '#fff2c6');
  for (const y of [17, 20]) c.line(6, y, 13, y + 2, PAL.light[2]).line(19, y + 2, 26, y, PAL.light[2]);
  c.outline();
  c.ellipse(16, 11, 3, 3, PAL.light[1]);
  c.line(16, 1, 16, 6, PAL.light[1]).line(8, 4, 11, 8, PAL.light[1]).line(24, 4, 21, 8, PAL.light[1]);
  twinkle(c, 4, 6, WHITE);
  twinkle(c, 28, 8, WHITE);
  return c.shadow(16, 30.5, 11).finish();
};
const darkbook = () => {
  const c = makeCanvas();
  const P = PAL.dark;
  c.poly([[6, 9], [24, 7], [27, 25], [9, 28]], P[2]);
  c.poly([[24, 7], [27, 9], [29, 26], [27, 25]], '#fff3d6');
  c.recolor(P[2], P[3], (x, y) => x + y >= 38);
  c.line(8, 9, 11, 27, P[3], 2);
  c.ellipse(17, 17, 5, 4, C.gold[1]);
  c.ellipse(17, 17, 3, 2.5, '#ff7ad9');
  c.ellipse(17, 17, 1, 2, INK);
  c.outline();
  c.dots([[4, 4], [3, 3], [5, 3], [28, 3], [27, 2], [29, 2], [3, 28]], P[1]);
  return c.shadow(16, 30.5, 10).finish();
};

export const FACILITY_SPRITES = {
  beam, flag, stonethrower, ballista, windmill, smithy, sword, horn,
  fog, tower, lightningrod, whirlpool, atelier, acidpotion, buffpotion,
  brazier, firearrow, icicle, frostcannon, cauldron, magiclab, flamecircle, blizzardcircle,
  altar, mirror, darktower, darkclock, extremelab, lightbook, darkbook,
};

const cache = new Map();
/** 施設の絵（一度描いたら覚えておく）。絵のない施設は null */
export function drawFacilitySprite(kind) {
  if (!FACILITY_SPRITES[kind]) return null;
  if (!cache.has(kind)) cache.set(kind, FACILITY_SPRITES[kind]());
  return cache.get(kind);
}
