// アニマル系の絵（四つ足は左を向く。コウモリは正面）
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { fan, twinkle } from './parts.js';

// 正面のコウモリ。P は体、W は翼
function bat(c, P, W = P, { cy = 16, span = 1, earH = 4 } = {}) {
  const wing = [[11, cy - 1], [2, cy - 7], [3.5, cy - 1], [0.5, cy + 3], [4.5, cy + 2], [5.5, cy + 6], [11, cy + 3]].map(([x, y]) => [16 - (16 - x) * span, y]);
  c.poly(wing, W[2]);
  c.poly(wing.map(([x, y]) => [32 - x, y]), W[2]);
  c.poly([[11.5, cy - 2], [5, cy - 5], [6, cy + 1], [11.5, cy + 2]], W[1]);
  c.poly([[20.5, cy - 2], [27, cy - 5], [26, cy + 1], [20.5, cy + 2]], W[1]);
  c.poly([[11, cy - 3], [11.5, cy - 4 - earH], [14.5, cy - 4]], P[1]).poly([[21, cy - 3], [20.5, cy - 4 - earH], [17.5, cy - 4]], P[1]);
  c.ellipse(16, cy + 1, 6, 6, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= cy + 4);
  c.ellipse(16, cy + 3, 3, 2.5, P[0]);
  return c;
}

// 横向きの四つ足。P は体の色
function quad(c, P, o = {}) {
  const { cx = 18, cy = 20, rx = 8, ry = 5.5, hx = 10, hy = 14, hr = 6, legLen = 4, tail = 'thin', ear = 'point', belly = P[0], snout = P[0] } = o;
  const foot = cy + ry + legLen - 2;
  // しっぽ
  if (tail === 'thin') c.line(cx + rx - 1, cy - 1, cx + rx + 4, cy - 6, P[2], 2);
  if (tail === 'bushy') c.ellipse(cx + rx + 2, cy - 4, 3, 5, P[1]).ellipse(cx + rx + 2.5, cy - 7.5, 2, 1.6, P[0]);
  if (tail === 'short') c.ellipse(cx + rx, cy - 2, 2, 2, P[0]);
  // 奥の足
  c.rect(cx - rx + 4, cy + 1, 2, foot - cy, P[3]).rect(cx + rx - 4, cy + 1, 2, foot - cy, P[3]);
  // 体
  c.ellipse(cx, cy, rx, ry, P[1]);
  c.recolor(P[1], P[2], (x, y) => y + 0.5 > cy + ry * 0.4);
  if (belly) c.ellipse(cx - 1, cy + ry * 0.55, rx * 0.6, ry * 0.35, belly);
  // 手前の足
  c.rect(cx - rx + 2, cy + 2, 2, foot - cy - 1, P[2]).rect(cx + rx - 6, cy + 2, 2, foot - cy - 1, P[2]);
  // 耳
  if (ear === 'point') c.poly([[hx - 4, hy - 3], [hx - 4, hy - hr - 4], [hx, hy - hr + 1]], P[2]).poly([[hx + 1, hy - hr + 1], [hx + 3, hy - hr - 4], [hx + 5, hy - 3]], P[1]);
  if (ear === 'round') c.ellipse(hx - 3.5, hy - hr + 1, 2.2, 2.2, P[2]).ellipse(hx + 3.5, hy - hr + 1, 2.2, 2.2, P[1]);
  if (ear === 'long') c.ellipse(hx - 2, hy - hr - 4, 1.8, 5, P[2]).ellipse(hx + 2.5, hy - hr - 4.5, 1.8, 5, P[1]).ellipse(hx + 2.5, hy - hr - 4, 0.8, 3.5, C.pink[1]);
  // 頭
  c.ellipse(hx, hy, hr, hr * 0.92, P[1]);
  c.recolor(P[1], P[2], (x, y) => ((x + 0.5 - (hx - 1.5)) ** 2) / (hr * hr) + ((y + 0.5 - (hy - 1.5)) ** 2) / (hr * hr * 0.85) > 1 && x + 0.5 > hx);
  if (snout) c.ellipse(hx - hr + 2.5, hy + 2, 2.6, 2, snout);
  return c;
}

const bat1 = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  bat(c, P);
  c.eyes(13, 15, 4, 'dot').px(15, 19, WHITE).px(17, 19, WHITE).mouth(16, 18, 'smile2');
  c.outline();
  c.dots([[3, 25], [4, 25], [5, 25], [26, 26], [27, 26], [28, 26]], P[0]);
  return c.shadow(16, 29.5, 6).finish();
};

const darkbat = () => {
  const c = makeCanvas();
  const P = PAL.dark;
  bat(c, P, ['#7a6aa0', '#5a4a80', '#3b2d5c', '#2a2040']);
  c.eyes(13, 15, 4, 'dot', '#ff4a6a').px(15, 19, WHITE).px(17, 19, WHITE).mouth(16, 18, 'smile2');
  return c.outline().shadow(16, 29.5, 6).finish();
};

const flamebat = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  bat(c, P, [C.lava[0], C.lava[1], P[2], P[3]]);
  c.dots([[3, 9], [2, 10], [29, 9], [30, 10], [8, 21], [24, 21]], C.lava[1]);
  c.eyes(13, 15, 4, 'dot').px(15, 19, WHITE).px(17, 19, WHITE).mouth(16, 18, 'smile2');
  c.outline();
  c.dots([[6, 4], [26, 3], [16, 26]], C.lava[0]);
  return c.shadow(16, 29.5, 6).finish();
};

// 嵐をまとったコウモリ。まわりにつむじ風
const stormbat = () => {
  const c = makeCanvas();
  const P = ['#cdf3e4', '#5fb69a', '#3d8a72', '#2a6050'];
  for (let i = 0; i < 26; i++) {
    const a = i * 0.45;
    const r = 6 + i * 0.4;
    c.px(16 + Math.cos(a) * r, 16 + Math.sin(a) * r * 0.75, PAL.wind[0]);
  }
  bat(c, P, P, { span: 1.08, earH: 5 });
  c.eyes(13, 15, 4, 'angry').px(15, 19, WHITE).px(17, 19, WHITE).mouth(16, 18, 'smile2');
  return c.outline().shadow(16, 29.5, 7).finish();
};

// 前足が鎌のイタチ
const weasel = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  quad(c, P, { cx: 19, cy: 20, rx: 8.5, ry: 4.5, hx: 10, hy: 15, hr: 5.5, ear: 'round', tail: 'bushy' });
  c.poly([[6, 22], [2, 17], [3, 22], [6, 26]], '#eef8ff');
  c.line(6, 22, 6, 26, P[2]);
  c.eyes(7, 13, 4, 'angry').px(5, 17, INK);
  return c.outline().shadow(17, 29.5, 10).finish();
};

// 稲光と同じ速さで走るイタチ。しっぽが稲妻
const thunderweasel = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  c.poly([[25, 18], [30, 12], [27, 13], [30, 7], [24, 13], [27, 12]], P[2]);
  quad(c, P, { cx: 18, cy: 20, rx: 8.5, ry: 4.5, hx: 10, hy: 15, hr: 5.5, ear: 'round', tail: 'none' });
  c.dots([[18, 18], [19, 19], [18, 20]], P[3]);
  c.eyes(7, 13, 4, 'dot').px(5, 17, INK);
  c.outline();
  c.dots([[27, 22], [28, 22], [29, 22], [26, 25], [27, 25]], P[1]);
  return c.shadow(17, 29.5, 10).finish();
};

// 背中の針が小石のハリネズミ
const hedgehog = () => {
  const c = makeCanvas();
  const S = C.stone;
  const P = ['#fbe6cf', '#e8c29b', '#c79a6c', '#9a7048'];
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + 0.25 + (i / 8) * (Math.PI - 0.5);
    c.poly([[18 + Math.cos(a) * 6, 19 + Math.sin(a) * 5], [18 + Math.cos(a) * 12, 19 + Math.sin(a) * 10.5], [18 + Math.cos(a + 0.22) * 7, 19 + Math.sin(a + 0.22) * 6]], i % 2 ? S[1] : S[2]);
  }
  c.ellipse(18, 19.5, 9, 7, S[1]);
  c.recolor(S[1], S[2], (x, y) => y >= 22);
  c.ellipse(9.5, 21, 5, 4.5, P[1]);
  c.ellipse(13, 25, 6, 2.5, P[1]);
  c.rect(12, 26, 2, 2, P[3]).rect(20, 26, 2, 2, P[3]);
  c.px(5, 21, INK).eye(8, 19, 'dot');
  c.dots([[15, 15], [20, 13], [23, 17], [17, 19]], S[0]);
  return c.outline().shadow(16, 29.5, 10).finish();
};

// 土から顔を出すモグラ
const mole = () => {
  const c = makeCanvas();
  const E = PAL.earth;
  const P = ['#b8a6d0', '#7d6a99', '#5c4b78', '#3f3156'];
  c.ellipse(16, 18, 7.5, 8, P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 19 || y >= 22);
  c.ellipse(16, 21, 3.5, 2.5, '#f7c6c0').px(16, 20, '#e8768a');
  c.ellipse(9, 21, 2.5, 2, '#f7c6c0').ellipse(23, 21, 2.5, 2, '#f7c6c0');
  c.dots([[7, 22], [9, 23], [21, 23], [23, 22]], WHITE);
  c.ellipse(16, 27, 13, 3.5, E[2]);
  c.ellipse(16, 26, 13, 2, E[1], (x, y) => y < 26);
  c.dots([[6, 27], [12, 28], [21, 27], [25, 28]], E[3]);
  c.eyes(13, 15, 5, 'line');
  return c.outline().shadow(16, 30, 13, 1.2).finish();
};

// 大きくなったつちモグラ。大きなつめ
const bigmole = () => {
  const c = makeCanvas();
  const P = ['#b8a6d0', '#7d6a99', '#5c4b78', '#3f3156'];
  c.ellipse(16, 17, 10, 10.5, P[1], (x, y) => y < 28);
  c.recolor(P[1], P[2], (x, y) => x >= 21 || y >= 24);
  c.ellipse(16, 19, 6, 5, '#d8cbe8', (x, y) => y < 28);
  c.ellipse(16, 13.5, 3.5, 2.5, '#f7c6c0').px(16, 12, '#e8768a');
  for (const sx of [-1, 1]) {
    const x = 16 + sx * 10;
    c.ellipse(x, 21, 3.5, 3, '#f7c6c0');
    c.dots([[x - 2, 24], [x, 25], [x + 2, 24]], WHITE);
  }
  c.eyes(11, 9, 8, 'line');
  c.rect(10, 27, 4, 2, P[3]).rect(18, 27, 4, 2, P[3]);
  return c.outline().shadow(16, 29.5, 12).finish();
};

// 長い耳で風を受けるウサギ
const windrabbit = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#e8fbef', '#b6e6c6', '#80c49a'];
  quad(c, P, { cx: 18, cy: 21, rx: 7, ry: 5, hx: 11, hy: 15, hr: 5.5, ear: 'long', tail: 'short', legLen: 3, snout: WHITE });
  c.px(7, 17, '#ff8aa0');
  c.eyes(8, 13, 4, 'dot');
  c.outline();
  c.dots([[22, 7], [23, 7], [24, 7], [25, 7], [24, 10], [25, 10], [26, 10]], PAL.wind[1]);
  return c.shadow(17, 29.5, 9).finish();
};

// ふわふわの毛のヒツジ
const fluffysheep = () => {
  const c = makeCanvas();
  const W = ['#ffffff', '#fbf9ff', '#e2ddf2', '#bcb4d8'];
  c.rect(12, 24, 2, 4, '#5a5068').rect(21, 24, 2, 4, '#5a5068');
  for (const [x, y, r] of [[13, 15, 4], [18, 13, 4.5], [23, 16, 4], [11, 20, 4], [17, 20, 5], [24, 21, 4]]) c.ellipse(x, y, r, r, W[1]);
  c.recolor(W[1], W[2], (x, y) => y >= 22 || x >= 26);
  c.ellipse(8.5, 16.5, 4.2, 4.5, '#f6e7d6');
  c.recolor('#f6e7d6', '#e2cdb4', (x) => x >= 10);
  c.ellipse(5.5, 14, 2, 1.2, '#f6e7d6').ellipse(11.5, 13, 2, 1.2, '#e2cdb4');
  c.ellipse(9, 12.5, 3, 1.8, W[1]);
  c.eyes(6, 16, 4, 'closed').mouth(8, 19, 'smile2');
  return c.outline().shadow(17, 29.5, 10).finish();
};

// 角が生えたもこもこヒツジ
const wildram = () => {
  const c = makeCanvas();
  const W = ['#ffffff', '#f6f3ff', '#d8d2ec', '#b0a8d0'];
  c.rect(12, 24, 2, 4, '#5a5068').rect(21, 24, 2, 4, '#5a5068');
  for (const [x, y, r] of [[14, 14, 4.5], [20, 12, 5], [25, 16, 4], [12, 20, 4.5], [18, 20, 5.5], [25, 22, 4]]) c.ellipse(x, y, r, r, W[1]);
  c.recolor(W[1], W[2], (x, y) => y >= 22 || x >= 27);
  c.ellipse(8.5, 17, 4.5, 4.8, '#e9d4bb');
  c.recolor('#e9d4bb', '#d2b89a', (x) => x >= 10);
  const H = ['#fff3d6', '#e8c47a', '#c49a4c'];
  c.ellipse(11, 12, 4, 4, H[1]).ellipse(11, 12, 2, 2, H[2]).ellipse(5, 9, 2.2, 2.2, H[1]);
  c.eyes(5, 16, 5, 'angry').mouth(8, 20, 'flat');
  return c.outline().shadow(17, 29.5, 11).finish();
};

// 吹雪の中を走るオオカミ
const blizzardwolf = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#e6f4fb', '#9fcbe0', '#6f9fbb'];
  quad(c, P, { cx: 19, cy: 19.5, rx: 8.5, ry: 5.5, hx: 10, hy: 14, hr: 6, ear: 'point', tail: 'bushy', snout: WHITE });
  c.px(4, 15, INK).dots([[6, 18], [7, 19]], WHITE);
  c.eyes(7, 11, 4, 'angry', '#2b4a6b');
  c.outline();
  c.dots([[24, 5], [28, 9], [3, 6], [27, 26]], WHITE);
  return c.shadow(17, 29.5, 10).finish();
};

// 真っ白なアザラシ（寝そべり）
const seal = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#f2f8ff', '#cbdff0', '#9cbad6'];
  c.poly([[24, 22], [30, 18], [29, 24], [30, 28], [24, 26]], P[2]);
  c.ellipse(16, 22, 10, 6, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 25);
  c.ellipse(9, 16.5, 6, 5.5, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 25 || (x >= 12 && y >= 19));
  c.ellipse(13, 25, 3, 1.5, P[3]);
  c.eyes(5, 15, 5, 'dot').px(7, 18, INK).px(8, 18, INK);
  c.dots([[4, 18], [3, 19], [11, 18], [12, 19]], '#b5c9de');
  return c.outline().shadow(16, 29.5, 12).finish();
};

// 氷の時代のマンモス。長い鼻と牙
const mammoth = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  const F = ['#e8f6ff', '#9fcbe6', '#6f9ec4', '#4f7aa2'];
  c.rect(10, 22, 3, 6, F[3]).rect(15, 22, 3, 6, F[2]).rect(20, 22, 3, 6, F[3]).rect(24, 22, 3, 6, F[2]);
  c.ellipse(18, 16, 11, 9, F[1]);
  c.recolor(F[1], F[2], (x, y) => y >= 19);
  c.dots([[14, 10], [18, 9], [22, 11], [25, 14], [12, 14]], F[0]);
  c.ellipse(9, 14, 6, 6.5, F[1]);
  c.line(6, 17, 4, 24, F[1], 2).px(4, 25, F[2]);
  c.line(9, 19, 4, 21, WHITE, 2).line(4, 21, 3, 19, WHITE, 1);
  c.ellipse(13, 12, 3, 4, F[2]);
  c.eye(7, 11, 'dot');
  c.outline();
  c.dots([[28, 4], [26, 7], [3, 4]], P[0]);
  return c.shadow(17, 29.5, 12).finish();
};

// 毛先がダイヤのようにきらめくキツネ
const diamondfox = () => {
  const c = makeCanvas();
  const P = PAL.light;
  c.poly([[24, 18], [30, 9], [31, 16], [27, 21]], P[1]);
  c.poly([[28, 11], [30, 9], [31, 12], [29, 14]], '#c8f2ff');
  quad(c, P, { cx: 18, cy: 20.5, rx: 7.5, ry: 4.5, hx: 10, hy: 15, hr: 5.5, ear: 'point', tail: 'none', snout: WHITE });
  c.px(4, 16, INK);
  c.eyes(7, 13, 4, 'dot');
  c.outline();
  twinkle(c, 29, 4, '#c8f2ff');
  twinkle(c, 3, 25, P[0]);
  return c.shadow(17, 29.5, 9).finish();
};

// 地獄の門を守る黒い犬。赤い目と、ほのおのたてがみ
const hellhound = () => {
  const c = makeCanvas();
  const P = ['#7a6aa0', '#3e3354', '#2a2240', '#1c1630'];
  quad(c, P, { cx: 19, cy: 20, rx: 8.5, ry: 5.5, hx: 10, hy: 14, hr: 6, ear: 'point', tail: 'thin', snout: '#5a4d78' });
  c.poly([[13, 9], [15, 4], [16, 9], [19, 5], [19, 12], [14, 13]], PAL.fire[2]);
  c.poly([[15, 9], [16, 7], [17, 10]], C.lava[1]);
  c.px(4, 15, INK);
  c.eyes(7, 12, 4, 'angry', '#ff4a4a');
  c.mouth(6, 17, 'fang', '#120e1e');
  return c.outline().shadow(17, 29.5, 10).finish();
};

// 翼をもつ白い馬
const pegasus = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#f8fbff', '#d6e4ef', '#aac0d4'];
  fan(c, 18, 16, 12, -2.4, -1.2, PAL.wind[1]);
  fan(c, 18, 16, 8, -2.2, -1.3, PAL.wind[0]);
  quad(c, P, { cx: 19, cy: 20, rx: 8, ry: 5, hx: 10, hy: 12, hr: 5, ear: 'point', tail: 'none', legLen: 5, snout: P[1] });
  c.line(14, 8, 16, 15, PAL.wind[2], 2);
  c.line(26, 18, 29, 24, PAL.wind[2], 2);
  c.eye(7, 11, 'dot').px(5, 14, '#b6a6c0');
  return c.outline().shadow(18, 29.5, 10).finish();
};

// ワシの頭と翼、獅子の体の獣
const griffon = () => {
  const c = makeCanvas();
  const L = PAL.earth;
  fan(c, 19, 15, 13, -2.6, -1.2, PAL.wind[2]);
  fan(c, 19, 15, 9, -2.4, -1.3, PAL.wind[1]);
  quad(c, L, { cx: 19, cy: 20, rx: 8.5, ry: 5.5, hx: 10, hy: 13, hr: 6, ear: 'none', tail: 'thin', snout: null, belly: L[0] });
  c.ellipse(10, 13, 6, 5.5, WHITE);
  c.recolor(WHITE, '#dfe7ee', (x, y) => y >= 16 && x >= 11);
  c.poly([[5, 12], [0, 15], [3, 17], [6, 16]], C.gold[1]);
  c.poly([[11, 8], [13, 4], [14, 9]], WHITE);
  c.eye(7, 11, 'angryL');
  return c.outline().shadow(18, 29.5, 11).finish();
};

// 獅子の頭・やぎの体・へびのしっぽ。口から炎
const chimera = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  const G = ['#fff4e2', '#e6d3b8', '#bfa584', '#8f7658'];
  c.line(26, 19, 29, 12, '#7fbf5a', 2).ellipse(29, 10.5, 2, 1.6, '#7fbf5a').px(28, 10, INK);
  quad(c, G, { cx: 19, cy: 20, rx: 8.5, ry: 5.5, hx: 10, hy: 14, hr: 5.5, ear: 'none', tail: 'none', snout: null });
  c.poly([[18, 13], [20, 7], [21, 13]], G[2]);
  c.ellipse(10, 14, 7.5, 7, P[2]);
  c.ellipse(10, 14.5, 5, 5, P[0]);
  c.eyes(7, 12, 4, 'angry');
  c.mouth(9, 17, 'fang');
  c.poly([[5, 17], [0, 15], [1, 19], [0, 23], [5, 20]], C.lava[1]);
  return c.outline().shadow(17, 29.5, 11).finish();
};

export const BEAST = { bat: bat1, darkbat, flamebat, stormbat, weasel, thunderweasel, hedgehog, mole, bigmole, windrabbit, fluffysheep, wildram, blizzardwolf, seal, mammoth, diamondfox, hellhound, pegasus, griffon, chimera };
