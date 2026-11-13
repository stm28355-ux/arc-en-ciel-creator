// バード系の絵（横向きは左を向く）
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { fan, twinkle } from './parts.js';

const BEAK = C.gold;
const FOOT = '#f2a03c';

// 横向きの、まるい鳥。P は体の色、opts で形を変える
function sideBird(c, P, { cx = 16, cy = 18, rx = 8, ry = 7.5, belly = P[0], beak = BEAK[1], wing = P[2], tail = 'short', feet = true, eyeKind = 'dot' } = {}) {
  if (tail === 'short') c.poly([[cx + rx - 3, cy - 1], [cx + rx + 4, cy - 7], [cx + rx + 3, cy - 3], [cx + rx + 1, cy + 2]], P[2]);
  if (tail === 'fork') c.poly([[cx + rx - 3, cy], [cx + rx + 7, cy - 5], [cx + rx + 3, cy + 0.5], [cx + rx + 7, cy + 4]], P[2]);
  if (feet) c.rect(cx - 3, cy + ry - 1, 1, 3, FOOT).rect(cx + 1, cy + ry - 1, 1, 3, FOOT).px(cx - 4, cy + ry + 1, FOOT).px(cx, cy + ry + 1, FOOT);
  c.ellipse(cx, cy, rx, ry, P[1]);
  c.recolor(P[1], P[2], (x, y) => y + 0.5 > cy + ry * 0.55);
  c.ellipse(cx - 2, cy + 2.5, rx * 0.55, ry * 0.45, belly);
  if (wing) c.ellipse(cx + 2.5, cy + 1, rx * 0.55, ry * 0.4, wing);
  c.poly([[cx - rx + 1, cy - 3], [cx - rx - 4, cy - 1.5], [cx - rx + 1, cy]], beak);
  c.eye(cx - rx + 3, cy - 4, eyeKind);
  return c;
}

// 飛んでいる鳥（正面寄り。左右に羽を広げる）
function flyingBird(c, P, { cx = 16, cy = 16, rx = 5.5, ry = 6.5, span = 13, wing = P[1], wing2 = P[2], up = true } = {}) {
  const a0 = up ? -2.9 : 2.6;
  const a1 = up ? -2.0 : 3.5;
  fan(c, cx - 2, cy, span, a0, a1, wing);
  fan(c, cx + 2, cy, span, Math.PI - a1, Math.PI - a0, wing);
  fan(c, cx - 2, cy + 1, span * 0.7, a0 + 0.2, a1 + 0.1, wing2);
  fan(c, cx + 2, cy + 1, span * 0.7, Math.PI - a1 - 0.1, Math.PI - a0 - 0.2, wing2);
  c.ellipse(cx, cy, rx, ry, P[1]);
  c.ellipse(cx, cy + 2, rx * 0.6, ry * 0.5, P[0]);
  return c;
}

// つむじ風で昇るタカ。頭にうずまきの冠羽
const hawk = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  c.line(15, 11, 14, 6, P[2], 2).line(14, 6, 17, 5, P[2], 1).px(17, 6, P[2]);
  sideBird(c, P, { cy: 18, rx: 8.5, ry: 8, belly: WHITE, wing: P[2], eyeKind: 'angryL' });
  c.dots([[13, 20], [11, 22], [14, 23]], P[1]);
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 風を切りさいて飛ぶツバメ（二股のしっぽ）
const swallow = () => {
  const c = makeCanvas();
  const P = ['#bfe9ff', '#3f8fcf', '#2b5f9e', '#203f73'];
  fan(c, 18, 15, 11, -2.5, -1.7, P[2]);
  sideBird(c, P, { cy: 17, rx: 8, ry: 6.5, belly: WHITE, wing: P[2], tail: 'fork', feet: false, beak: INK });
  c.rect(8, 16, 3, 1, '#ff6a5a');
  c.dots([[3, 21], [4, 21], [5, 21], [2, 24], [3, 24]], PAL.wind[1]);
  return c.outline().shadow(16, 29.5, 7).finish();
};

// 強敵をしとめたつむじタカ。白い頭と、大きく広げた翼
const eagle = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  flyingBird(c, [WHITE, P[2], P[3], P[3]], { cy: 17, rx: 6, ry: 7.5, span: 15, wing: P[2], wing2: P[3] });
  c.ellipse(16, 11, 4.5, 4, WHITE);
  c.ellipse(16, 19, 4, 4, P[1]);
  c.poly([[14.5, 13], [17.5, 13], [16, 16.5]], BEAK[1]);
  c.eyes(13, 10, 5, 'angry');
  c.rect(14, 24, 1, 3, FOOT).rect(17, 24, 1, 3, FOOT);
  return c.outline().shadow(16, 29.5, 9).finish();
};

// はやてのように飛ぶハヤブサ（急降下）
const falcon = () => {
  const c = makeCanvas();
  const P = ['#e0f7ef', '#6fb9a8', '#3f8a7b', '#2a5f56'];
  c.poly([[15, 15], [30, 9], [25, 15], [21, 19]], P[2]);
  c.poly([[17, 16], [27, 12], [22, 17]], P[3]);
  sideBird(c, P, { cy: 18, rx: 8, ry: 7, belly: WHITE, wing: null, eyeKind: 'angryL' });
  c.line(11, 17, 11, 19, P[3]);
  c.dots([[13, 21], [15, 22], [12, 23]], P[2]);
  c.outline();
  c.dots([[3, 9], [4, 9], [5, 9], [2, 12], [3, 12]], WHITE);
  return c.shadow(16, 29.5, 7).finish();
};

// 雲を突きぬける大きな鳥。まわりに雲
const cloudbird = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  c.poly([[19, 20], [30, 26], [27, 28], [17, 24]], P[1]);
  c.poly([[19, 22], [26, 29], [22, 29], [17, 25]], P[0]);
  flyingBird(c, [WHITE, P[1], P[2], P[3]], { cy: 15, rx: 6, ry: 7.5, span: 15, wing: P[1], wing2: P[0] });
  c.poly([[14.5, 11], [17.5, 11], [16, 14]], BEAK[1]);
  c.eyes(13, 8, 5, 'dot');
  c.line(16, 5, 15, 2, P[2]).line(17, 5, 19, 2, P[2]);
  c.outline();
  for (const [x, y] of [[4, 26], [26, 6]]) c.ellipse(x, y, 3, 1.6, WHITE).ellipse(x + 2, y - 1, 2, 1.4, WHITE);
  return c.finish();
};

// 雷雲の中に巣を作る、ふっくらした鳥
const thunderbird = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  c.poly([[14, 10], [16, 5], [16, 8], [19, 4], [18, 9]], P[2]);
  sideBird(c, P, { cy: 18, rx: 9, ry: 8.5, belly: P[0], wing: P[2] });
  c.line(18, 18, 20, 20).line(20, 20, 18, 21, P[3]).line(18, 21, 21, 24, P[3]);
  c.recolor(INK, P[3], (x, y) => x >= 18 && y >= 18);
  c.eye(10, 14, 'dot');
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 雨雲を連れたカモメ
const gull = () => {
  const c = makeCanvas();
  const P = [WHITE, '#f4f8fb', '#9fc3c7', '#6f9aa0'];
  sideBird(c, P, { cy: 20, rx: 8.5, ry: 7, belly: WHITE, wing: PAL.wind[2], beak: '#ffc23c' });
  c.px(8, 18, '#ff6a5a');
  c.ellipse(19, 5.5, 5, 2.5, '#c9d6e3').ellipse(16, 5, 3, 2.5, '#c9d6e3').ellipse(22, 4.5, 2.5, 2, '#c9d6e3');
  c.outline();
  c.dots([[16, 9], [19, 10], [22, 9]], PAL.water[2]);
  return c.shadow(16, 29.5, 8).finish();
};

// 氷の上をすべるペンギンの子ども（正面）
const penguin = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  const back = '#3d6f9e';
  c.ellipse(16, 18.5, 9, 9.5, back, (x, y) => y < 28);
  c.ellipse(16, 20.5, 6, 6.5, WHITE, (x, y) => y < 28);
  c.recolor(WHITE, P[1], (x, y) => x >= 18 && y >= 22);
  c.ellipse(7, 20, 2, 4, back).ellipse(25, 20, 2, 4, back);
  c.poly([[14.5, 15], [17.5, 15], [16, 17.5]], '#ffb43c');
  c.eyes(12, 12, 6, 'dot', INK);
  c.recolor(back, '#2c5582', (x, y) => y < 9);
  c.rect(11, 27, 3, 2, '#ffb43c').rect(18, 27, 3, 2, '#ffb43c');
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 炎の羽をもつ鳥。はばたくと火の粉
const firebird = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  c.poly([[22, 19], [30, 15], [27, 21], [31, 24], [22, 23]], P[2]);
  c.poly([[23, 20], [28, 18], [27, 22]], C.lava[1]);
  fan(c, 18, 16, 11, -2.6, -1.6, P[2]);
  fan(c, 18, 16, 8, -2.4, -1.7, C.lava[1]);
  sideBird(c, P, { cy: 19, rx: 8, ry: 7, belly: P[0], wing: null, tail: null });
  c.poly([[12, 12], [11, 6], [14, 10], [15, 5], [16, 11]], P[2]);
  c.eye(11, 15, 'dot');
  c.outline();
  c.dots([[5, 8], [26, 5], [8, 4]], C.lava[0]);
  return c.shadow(16, 29.5, 8).finish();
};

// 真っ白なフクロウ（正面、大きな目）
const snowowl = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  c.poly([[8, 8], [11, 4], [12, 9]], WHITE).poly([[24, 8], [21, 4], [20, 9]], WHITE);
  c.ellipse(16, 17.5, 10, 10.5, WHITE, (x, y) => y < 28);
  c.recolor(WHITE, P[1], (x, y) => x >= 20 || y >= 25);
  c.ellipse(12, 14, 3.5, 3.5, P[0]).ellipse(20, 14, 3.5, 3.5, P[0]);
  c.ellipse(12, 14, 2, 2, '#ffd84d').ellipse(20, 14, 2, 2, '#ffd84d');
  c.rect(12, 13, 1, 2, INK).rect(20, 13, 1, 2, INK);
  c.poly([[15, 17], [17, 17], [16, 19]], C.wood[2]);
  c.dots([[10, 21], [13, 23], [19, 22], [22, 20], [16, 24]], P[2]);
  c.rect(12, 27, 2, 2, C.gold[2]).rect(18, 27, 2, 2, C.gold[2]);
  return c.outline().shadow(16, 29.5, 9).finish();
};

// 雷をまとったペンギン。おなかですべる
const thunderpenguin = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  c.ellipse(17, 21, 11.5, 6, '#3a3a52', (x, y) => y < 28);
  c.ellipse(16, 23.5, 9, 3.5, P[1]);
  c.ellipse(6, 18, 4.5, 4.5, '#3a3a52');
  c.poly([[2, 18], [-1, 19], [2, 20]], '#ffb43c');
  c.eye(4, 16, 'dot', WHITE);
  c.px(4, 16, INK);
  c.ellipse(19, 17, 4, 1.8, '#3a3a52');
  c.line(15, 21, 17, 23, P[3]).line(17, 23, 15, 24, P[3]).line(15, 24, 18, 26, P[3]);
  c.rect(27, 22, 3, 2, '#ffb43c');
  c.outline();
  c.dots([[24, 13], [25, 12], [27, 13], [28, 12], [30, 14]], P[1]);
  return c.shadow(16, 29.5, 13).finish();
};

// 光る羽をもつハト
const dove = () => {
  const c = makeCanvas();
  const P = PAL.light;
  fan(c, 19, 17, 11, -2.5, -1.4, P[1]);
  fan(c, 19, 17, 7, -2.3, -1.5, WHITE);
  sideBird(c, [WHITE, '#fffdf4', P[1], P[2]], { cy: 20, rx: 8, ry: 7, belly: WHITE, wing: null, beak: '#ffb3a0' });
  c.eye(11, 16, 'dot');
  c.outline();
  twinkle(c, 6, 6, P[1]);
  twinkle(c, 28, 26, P[1]);
  return c.shadow(16, 29.5, 8).finish();
};

// 光の尾羽をもつ伝説の鳥の、まだ若い姿
const phoenix = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  c.line(22, 20, 30, 27, C.gold[1], 2).line(21, 22, 26, 30, P[2], 2).line(23, 18, 31, 21, C.gold[2], 2);
  fan(c, 18, 16, 12, -2.7, -1.5, P[2]);
  fan(c, 18, 16, 8, -2.5, -1.6, C.gold[1]);
  sideBird(c, P, { cy: 19, rx: 7.5, ry: 6.5, belly: C.gold[0], wing: null, tail: null, feet: false });
  c.line(12, 12, 11, 6, C.gold[2]).line(13, 12, 14, 7, C.gold[2]).px(11, 6, P[2]).px(14, 7, P[2]);
  c.eye(11, 15, 'dot');
  c.outline();
  twinkle(c, 4, 26, C.gold[0]);
  return c.shadow(16, 29.5, 7).finish();
};

// 夜より黒いカラス
const raven = () => {
  const c = makeCanvas();
  const P = ['#8f7fb8', '#4a3d6a', '#33294d', '#221a36'];
  sideBird(c, P, { cy: 18, rx: 8.5, ry: 8, belly: P[1], wing: P[2], beak: '#8a84a0', eyeKind: 'dot' });
  c.recolor(INK, '#ff5a7a', (x, y) => x === 11 && y === 15);
  c.dots([[17, 14], [18, 13], [19, 13]], P[0]);
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 夜空を飛ぶ、地味な色の鳥（うしろに三日月）
const nightjar = () => {
  const c = makeCanvas();
  const P = ['#d9d2c0', '#a29a86', '#7a7262', '#59523f'];
  c.ellipse(24, 7, 4.5, 4.5, '#fff1a8').ellipse(26, 5.5, 3.8, 3.8, null);
  c.recolor(null, null);
  c.each((x, y) => { if (c.get(x, y) === '#fff1a8' && ((x + 0.5 - 26) ** 2 + (y + 0.5 - 5.5) ** 2) < 14) c.px(x, y, null); });
  sideBird(c, P, { cy: 19, rx: 8.5, ry: 6.5, belly: P[0], wing: PAL.wind[2], tail: 'fork' });
  c.dots([[13, 17], [16, 15], [18, 18], [14, 21]], P[3]);
  return c.outline().shadow(16, 29.5, 8).finish();
};

// ===== 名簿を200種にしたとき =====

// どこにでもいる、ふくら雀
const sparrow = () => {
  const c = makeCanvas();
  const P = ['#f6e8d6', '#c8946a', '#9a6a46', '#6e4a30'];
  sideBird(c, P, { cy: 19, rx: 8.5, ry: 7.5, belly: '#fbf3e8', wing: P[2], beak: '#4a3a30' });
  c.recolor(P[1], '#8a5a3a', (x, y) => y < 14);
  c.ellipse(9, 18, 2, 1.4, WHITE).px(8, 20, INK).px(9, 20, INK);
  c.dots([[18, 18], [20, 19], [17, 21]], P[3]);
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 大きなくちばしに水をためる鳥
const pelican = () => {
  const c = makeCanvas();
  const P = [WHITE, '#f6f8fb', '#cfd8e2', '#a8b4c4'];
  sideBird(c, P, { cx: 18, cy: 19, rx: 8, ry: 7.5, belly: WHITE, wing: '#cfd8e2', beak: '#ffb43c', feet: true });
  c.poly([[11, 13], [1, 15], [1, 17], [11, 17]], '#ffb43c');
  c.ellipse(6, 19, 5, 3, '#ffd88a');
  c.ellipse(6, 19.5, 3, 1.5, PAL.water[1]);
  c.eye(13, 13, 'dot');
  return c.outline().shadow(17, 29.5, 9).finish();
};

// 羽を広げると稲妻のもようが光るクジャク
const thunderpeacock = () => {
  const c = makeCanvas();
  const Y = PAL.thunder;
  fan(c, 16, 21, 15, -Math.PI + 0.15, -0.15, Y[1], 16);
  fan(c, 16, 21, 11, -Math.PI + 0.25, -0.25, Y[2], 16);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + 0.35 + (i / 6) * (Math.PI - 0.7);
    c.ellipse(16 + Math.cos(a) * 12.5, 21 + Math.sin(a) * 12.5, 1.4, 1.4, '#3a7fd6').px(Math.round(16 + Math.cos(a) * 12.5), Math.round(21 + Math.sin(a) * 12.5), '#7ff0ff');
  }
  c.ellipse(16, 21, 4.5, 5.5, '#2f8f9a');
  c.ellipse(16, 13.5, 3.2, 3.2, '#2f8f9a');
  c.dots([[15, 9], [16, 8], [17, 9], [16, 7]], Y[1]);
  c.poly([[15, 14.5], [17, 14.5], [16, 16.5]], C.gold[2]);
  c.eyes(14, 12, 3, 'pip', WHITE);
  c.rect(14, 26, 1, 2, FOOT).rect(17, 26, 1, 2, FOOT);
  return c.outline().shadow(16, 29.5, 8).finish();
};

// 片足で立ち、炎のダンスをおどるフラミンゴ
const flameflamingo = () => {
  const c = makeCanvas();
  const P = ['#ffd6c8', '#ff8a7a', '#e85a52', '#b8383a'];
  c.line(17, 21, 17, 29, '#e85a52').line(17, 25, 21, 23, '#e85a52');
  c.poly([[22, 13], [30, 9], [27, 15], [31, 18], [23, 18]], C.lava[1]);
  c.ellipse(19, 15, 7, 5, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 17);
  c.line(13, 13, 10, 8, P[1], 2).line(10, 8, 11, 4, P[1], 2);
  c.ellipse(12, 3.5, 3, 2.5, P[1]);
  c.poly([[9, 3], [5, 5], [7, 7], [9, 5]], WHITE).px(5, 6, INK).px(6, 7, INK);
  c.eye(12, 2, 'pip');
  c.outline();
  c.dots([[26, 4], [28, 7], [4, 14]], C.lava[0]);
  return c.shadow(17, 29.5, 6).finish();
};

// 雪山で育った、ちびペンギンの大人の姿
const emperorpenguin = () => {
  const c = makeCanvas();
  const back = '#3a5a80';
  c.ellipse(16, 17, 9.5, 11.5, back, (x, y) => y < 28);
  c.ellipse(16, 19.5, 6.5, 8.5, WHITE, (x, y) => y < 28);
  c.recolor(WHITE, PAL.ice[1], (x, y) => x >= 18 && y >= 21);
  c.ellipse(6.5, 18, 2, 5, back).ellipse(25.5, 18, 2, 5, back);
  c.ellipse(11, 11, 2, 1.6, '#ffc23c').ellipse(21, 11, 2, 1.6, '#ffc23c');
  c.ellipse(16, 13, 5, 2, '#fff1c8');
  c.poly([[14.5, 10], [17.5, 10], [16, 12.5]], '#ff9a3c');
  c.eyes(12, 7, 6, 'dot');
  c.rect(11, 27, 3, 2, '#ffb43c').rect(18, 27, 3, 2, '#ffb43c');
  return c.outline().shadow(16, 29.5, 9).finish();
};

export const BIRD = { hawk, swallow, eagle, falcon, cloudbird, thunderbird, gull, penguin, firebird, snowowl, thunderpenguin, dove, phoenix, raven, nightjar, sparrow, pelican, thunderpeacock, flameflamingo, emperorpenguin };
