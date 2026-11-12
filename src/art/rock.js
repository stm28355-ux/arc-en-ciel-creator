// ミネラル系の絵（カメ・ゴーレム・岩）
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { leaf, flower, twinkle, fan } from './parts.js';

// 角を丸めた四角
function rrect(c, x, y, w, h, col, r = 1) {
  c.rect(x, y, w, h, col);
  if (r >= 1) for (const [px, py] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) c.px(px, py, null);
  return c;
}

// 正面のゴーレム。P は体の色。返す値は顔の位置
function golem(c, P, { headW = 10, headH = 7, top = 4, bodyTop = 11, bodyH = 13, bodyW = 16, armW = 4 } = {}) {
  const cx = 16;
  rrect(c, cx - 6, 23, 4, 5, P[2]).rect(cx + 2, 23, 4, 5, P[2]);
  c.px(cx - 6, 27, null).px(cx + 5, 27, null);
  rrect(c, cx - bodyW / 2 - armW + 1, bodyTop + 2, armW, 11, P[2]);
  rrect(c, cx + bodyW / 2 - 1, bodyTop + 2, armW, 11, P[2]);
  rrect(c, cx - bodyW / 2, bodyTop, bodyW, bodyH, P[1], 1);
  c.recolor(P[1], P[2], (x, y) => x >= cx + bodyW / 2 - 4 || y >= bodyTop + bodyH - 2);
  rrect(c, cx - headW / 2, top, headW, headH + 1, P[1]);
  c.recolor(P[1], P[2], (x, y) => y < bodyTop && x >= cx + headW / 2 - 2);
  c.rect(cx - bodyW / 2 + 1, bodyTop + 1, 2, 1, P[0]).rect(cx - headW / 2 + 1, top + 1, 2, 1, P[0]);
  return { cx, eyeY: top + 3 };
}

// 横向きのカメ（左を向く）。甲らは shell(c) で描く
function turtle(c, skin, shellFn, { cy = 19, rx = 10, ry = 7.5 } = {}) {
  c.ellipse(26.5, 23, 2.5, 1.5, skin[2]);
  c.rect(9, 22, 4, 5, skin[2]).rect(20, 22, 4, 5, skin[2]);
  c.ellipse(6.5, 19.5, 4.5, 4, skin[1]);
  c.recolor(skin[1], skin[2], (x, y) => y >= 22);
  shellFn(c, 17, cy, rx, ry);
  c.rect(7, 24, 18, 2, skin[3]);
  return c;
}

// 甲らがまるごと岩のカメ
const turtle1 = () => {
  const c = makeCanvas();
  const S = C.stone;
  turtle(c, PAL.earth, (c2, cx, cy, rx, ry) => {
    c2.ellipse(cx, cy + 3, rx, ry + 1, S[2], (x, y) => y < 25);
    c2.cells((x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy - 3) / (ry + 1)) ** 2 <= 1 && y < 24, [[12, 16], [18, 14], [23, 18], [14, 21], [20, 21]], [S[1], S[2], S[1]], S[3], S[0], 0.9);
  });
  c.eye(4, 18, 'dot').px(3, 21, INK);
  return c.outline().shadow(16, 29, 12).finish();
};

// 川ぞいの粘土で作ったゴーレム（指のあと）
const golem1 = () => {
  const c = makeCanvas();
  const P = PAL.earth;
  const g = golem(c, P);
  c.dots([[11, 15], [12, 16], [19, 18], [20, 17], [14, 21]], P[2]);
  c.eyes(g.cx - 3, g.eyeY, 5, 'dot').mouth(g.cx, g.eyeY + 3, 'smile2');
  return c.outline().shadow(16, 29.5, 11).finish();
};

// 背中の甲らが石だたみの灰色のカニ（試し描きのもの）
const crab = () => {
  const c = makeCanvas();
  const S = ['#e6e1d6', '#bdb6aa', '#a9a297', '#cdc7bb'];
  const BODY = '#9d968c';
  const SHADE = '#77716a';
  [[9, 23, 5, 27], [11, 24, 8, 28], [13, 25, 11, 29]].forEach(([a, b, d, e]) => {
    c.line(a, b, d, e, SHADE).line(31 - a, b, 31 - d, e, SHADE);
  });
  c.line(8, 20, 5, 15, BODY, 2).line(24, 20, 27, 15, BODY, 2);
  for (const [px, py] of [[5, 11], [27, 11]]) {
    c.ellipse(px, py, 3.6, 4, BODY, (x, y) => !(y + 0.5 < py - 0.5 && Math.abs(x + 0.5 - px) < (py - 0.5 - (y + 0.5)) * 0.8));
    c.recolor(BODY, SHADE, (x, y) => y >= py + 2 && Math.abs(x + 0.5 - px) < 4);
    c.px(Math.floor(px) - 1, py, '#c4beb3');
  }
  const inBody = (x, y) => ((x + 0.5 - 16) / 10.5) ** 2 + ((y + 0.5 - 20.5) / 6.3) ** 2 <= 1;
  c.each((x, y) => { if (inBody(x, y)) c.px(x, y, SHADE); });
  c.cells((x, y) => inBody(x, y) && y <= 22, [[9.5, 16.5], [14, 15.3], [18.5, 15.3], [23, 16.5], [6.5, 20.5], [11.5, 19.5], [16, 19.2], [20.5, 19.5], [25.5, 20.5]], [S[1], S[3], S[2]], '#8b847a', S[0], 0.8);
  c.dots([[9, 15], [10, 14], [11, 15]], '#86b35c');
  c.dots([[12, 13], [12, 14], [19, 13], [19, 14]], SHADE);
  for (const [px, py] of [[11, 11], [19, 11]]) c.rect(px, py, 2, 2, '#1c1b1f').px(px, py, WHITE);
  return c.outline().shadow(16, 29, 11, 1.5).finish();
};

// 甲らが大きな岩山になったカメ。背中に小鳥の巣
const rockturtle = () => {
  const c = makeCanvas();
  const S = C.stone;
  turtle(c, PAL.earth, (c2, cx, cy) => {
    c2.poly([[7, 24], [11, 13], [15, 16], [19, 8], [23, 15], [27, 13], [28, 24]], S[1]);
    c2.recolor(S[1], S[2], (x, y) => y >= 20 || x >= 22);
    c2.dots([[11, 14], [19, 9], [20, 10], [27, 14]], S[0]);
    c2.line(13, 19, 17, 21, S[3]).line(21, 18, 24, 21, S[3]);
  });
  c.ellipse(19, 7.5, 3, 1.5, C.wood[2]).ellipse(19, 5.5, 1.6, 1.6, '#ffd84d').px(18, 5, INK).px(17, 6, '#ff9a3c');
  c.eye(4, 18, 'dot').px(3, 21, INK);
  return c.outline().shadow(16, 29, 13).finish();
};

// 鍛冶場で鉄に打ち直されたゴーレム（リベットつき）
const irongolem = () => {
  const c = makeCanvas();
  const P = C.metal;
  const g = golem(c, P, { headW: 10, headH: 6, top: 4, bodyW: 18, armW: 5 });
  c.dots([[9, 13], [22, 13], [9, 21], [22, 21], [12, 6], [19, 6]], P[3]);
  c.rect(13, 16, 6, 3, P[2]);
  c.rect(g.cx - 4, g.eyeY, 3, 1, '#ff9a3c').rect(g.cx + 1, g.eyeY, 3, 1, '#ff9a3c');
  c.outline();
  c.dots([[3, 27], [28, 27]], '#ffb43c');
  return c.shadow(16, 29.5, 12).finish();
};

// 全身にこけが生えたゴーレム
const mossgolem = () => {
  const c = makeCanvas();
  const S = C.stone;
  const g = golem(c, S);
  const M = C.moss;
  c.ellipse(16, 4.5, 5, 1.6, M[1]).ellipse(11, 12, 4, 1.5, M[1]).ellipse(20, 12, 4, 1.5, M[1]);
  c.dots([[6, 14], [7, 15], [25, 16], [26, 15], [13, 20], [19, 22], [10, 24]], M[2]);
  flower(c, 20, 3, 1, '#ffe3ee', C.gold[1], 4);
  c.eyes(g.cx - 3, g.eyeY, 5, 'dot').mouth(g.cx, g.eyeY + 3, 'smile2');
  return c.outline().shadow(16, 29.5, 11).finish();
};

// 大地そのものが立ち上がった巨人（肩が山）
const earthgiant = () => {
  const c = makeCanvas();
  const P = PAL.earth;
  c.rect(8, 22, 6, 7, P[2]).rect(18, 22, 6, 7, P[2]);
  c.poly([[1, 13], [5, 6], [9, 9], [13, 5], [19, 5], [23, 9], [27, 6], [31, 13], [29, 24], [3, 24]], P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 20 || x >= 24);
  c.poly([[3, 8], [5, 5.5], [7, 8]], WHITE).poly([[25, 8], [27, 5.5], [29, 8]], WHITE);
  c.ellipse(16, 7, 5, 4, P[1]);
  c.dots([[5, 16], [26, 17], [12, 21], [20, 19]], P[3]);
  c.ellipse(7, 20, 1.6, 1.2, C.leaf[1]).ellipse(25, 22, 1.6, 1.2, C.leaf[1]);
  c.eyes(12, 13, 6, 'dot').mouth(16, 17, 'flat');
  return c.outline().shadow(16, 29.5, 14).finish();
};

// なぜか空を飛べるようになった甲ら（中から目がのぞく）
const skyshell = () => {
  const c = makeCanvas();
  const S = C.stone;
  fan(c, 9, 16, 8, 3.4, 4.3, WHITE);
  fan(c, 23, 16, 8, -1.2, -0.3, WHITE);
  c.ellipse(16, 15, 10, 7, S[1], (x, y) => y < 17);
  c.cells((x, y) => ((x + 0.5 - 16) / 10) ** 2 + ((y + 0.5 - 15) / 7) ** 2 <= 1 && y < 16, [[11, 12], [16, 10], [21, 12], [13, 15], [19, 15]], [S[1], S[2]], S[3], S[0], 0.9);
  c.rect(6, 16, 21, 3, PAL.earth[2]);
  c.rect(11, 17, 10, 2, '#2a2238');
  c.px(13, 17, WHITE).px(18, 17, WHITE);
  c.outline();
  c.dots([[8, 23], [8, 24], [16, 24], [16, 25], [24, 23], [24, 24]], PAL.wind[1]);
  return c.shadow(16, 29.5, 8, 1.2).finish();
};

// 雷に打たれて磁気をおびた岩（赤と青の先）
const magnetrock = () => {
  const c = makeCanvas();
  const S = C.stone;
  c.poly([[5, 27], [7, 14], [13, 8], [20, 8], [26, 14], [28, 27]], S[1]);
  c.recolor(S[1], S[2], (x, y) => x >= 21 || y >= 24);
  c.rect(7, 10, 4, 4, C.red[1]).rect(22, 10, 4, 4, C.blue[1]);
  c.dots([[12, 12], [19, 11]], S[0]);
  c.eyes(12, 16, 7, 'dot').mouth(16, 21, 'smile');
  c.outline();
  for (const [x, y] of [[3, 7], [2, 9], [29, 7], [30, 9]]) c.px(x, y, PAL.thunder[1]);
  c.dots([[2, 12], [3, 13], [29, 12], [28, 13]], PAL.thunder[1]);
  return c.shadow(16, 29.5, 12).finish();
};

// 甲らのすきまから溶岩がのぞくカメ
const lavaturtle = () => {
  const c = makeCanvas();
  const D = ['#8a7a72', '#5a4c48', '#43373a', '#2e2428'];
  turtle(c, PAL.fire, (c2, cx, cy, rx, ry) => {
    c2.ellipse(cx, cy + 3, rx, ry + 1, D[1], (x, y) => y < 25);
    c2.cells((x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy - 3) / (ry + 1)) ** 2 <= 1 && y < 24, [[12, 16], [18, 14], [23, 18], [14, 21], [20, 21]], [D[1], D[2]], C.lava[1], D[0], 0.9);
    c2.recolor(C.lava[1], C.lava[0], (x, y) => y < 17);
  });
  c.eye(4, 18, 'dot').px(3, 21, INK);
  c.outline();
  c.dots([[14, 7], [20, 6], [17, 4]], C.lava[1]);
  return c.shadow(16, 29, 12).finish();
};

// つららを生やした岩
const icerock = () => {
  const c = makeCanvas();
  const S = ['#e7f0f6', '#b7c6d4', '#8fa0b4', '#6a7a90'];
  const I = PAL.ice;
  c.poly([[4, 18], [8, 8], [16, 5], [24, 8], [28, 18]], S[1]);
  c.recolor(S[1], S[2], (x, y) => x >= 22 || y >= 15);
  c.ellipse(16, 7, 8, 2.5, WHITE, (x, y) => y < 8);
  for (const [x, len] of [[6, 7], [10, 10], [14, 8], [18, 11], [22, 8], [26, 6]]) c.poly([[x - 2, 18], [x + 2, 18], [x, 18 + len]], I[1]);
  c.recolor(I[1], I[2], (x) => x % 4 === 0);
  c.eyes(12, 11, 7, 'dot').mouth(16, 15, 'smile2');
  return c.outline().shadow(16, 30, 11, 1.2).finish();
};

// 岩の体のすきまにマグマが流れるゴーレム
const magmagolem = () => {
  const c = makeCanvas();
  const D = ['#7a6a66', '#4e4246', '#3a3036', '#2a2228'];
  const g = golem(c, D, { bodyW: 16, armW: 5 });
  const L = C.lava;
  c.line(10, 13, 13, 18, L[1]).line(13, 18, 11, 22, L[1]).line(20, 12, 19, 17, L[1]).line(19, 17, 22, 21, L[1]);
  c.line(5, 16, 6, 21, L[1]).line(26, 15, 27, 20, L[1]);
  c.rect(g.cx - 4, g.eyeY, 3, 2, L[0]).rect(g.cx + 1, g.eyeY, 3, 2, L[0]);
  c.outline();
  c.dots([[4, 4], [27, 3], [29, 6]], L[1]);
  return c.shadow(16, 29.5, 11).finish();
};

// 水晶の体のゴーレム
const crystalgolem = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#d7f3ff', '#9fd8f2', '#6fb3d6'];
  const g = golem(c, P, { bodyW: 14, armW: 4 });
  for (const [x, y, h] of [[9, 11, 6], [22, 11, 7], [16, 4, 4]]) c.poly([[x - 2, y], [x, y - h], [x + 2, y]], PAL.light[1]);
  c.line(10, 14, 14, 22, WHITE).line(19, 13, 21, 19, WHITE);
  c.eyes(g.cx - 3, g.eyeY, 5, 'dot', '#2b4a6b');
  c.outline();
  twinkle(c, 3, 6, PAL.light[1]);
  twinkle(c, 28, 25, WHITE);
  return c.shadow(16, 29.5, 11).finish();
};

// 古い墓石が集まったゴーレム
const gravegolem = () => {
  const c = makeCanvas();
  const P = ['#c9c0dc', '#8f86a6', '#6b6284', '#4b4462'];
  c.rect(10, 23, 4, 5, P[2]).rect(18, 23, 4, 5, P[2]);
  c.ellipse(16, 8, 6, 5, P[1], (x, y) => y < 9).rect(10, 8, 12, 4, P[1]);
  c.rect(7, 12, 18, 12, P[1]);
  c.ellipse(4.5, 16, 3, 6, P[2]).ellipse(27.5, 16, 3, 6, P[2]);
  c.recolor(P[1], P[2], (x, y) => x >= 21 || y >= 21);
  c.rect(12, 15, 8, 1, P[3]).rect(12, 18, 8, 1, P[3]).rect(13, 21, 6, 1, P[3]);
  c.dots([[9, 13], [11, 6]], P[0]).dots([[8, 21], [24, 13], [10, 10]], C.moss[2]);
  c.eyes(13, 8, 5, 'dot', '#c9a8ff');
  return c.outline().shadow(16, 29.5, 12).finish();
};

// 甲らがこはくのカメ。中に大昔の虫
const amberturtle = () => {
  const c = makeCanvas();
  const A = ['#fff0b0', '#f2b03c', '#d6862a', '#a85e1e'];
  turtle(c, PAL.earth, (c2, cx, cy, rx, ry) => {
    c2.ellipse(cx, cy + 3, rx, ry + 1, A[1], (x, y) => y < 25);
    c2.recolor(A[1], A[2], (x, y) => y >= 21 || x >= 24);
    c2.ellipse(13, 14, 3, 1.5, A[0]);
    c2.ellipse(18, 18, 2, 1.2, '#5a3a1e').line(16, 17, 15, 16, '#5a3a1e').line(20, 17, 21, 16, '#5a3a1e').ellipse(18, 18, 0.8, 0.8, '#5a3a1e');
  });
  c.eye(4, 18, 'dot').px(3, 21, INK);
  c.outline();
  twinkle(c, 27, 8, A[0]);
  return c.shadow(16, 29, 12).finish();
};

// 聖域の入り口を守る、光る石像
const sanctuaryguard = () => {
  const c = makeCanvas();
  const S = ['#ffffff', '#efe9dc', '#cfc6b2', '#a89e88'];
  c.ellipse(16, 3.5, 5, 1.6, null);
  c.ellipse(16, 3.5, 5, 1.5, PAL.light[1]).ellipse(16, 3.5, 3, 0.7, null);
  fan(c, 9, 13, 8, 3.3, 4.4, S[1]);
  fan(c, 23, 13, 8, -1.25, -0.15, S[1]);
  const g = golem(c, S, { headW: 8, headH: 6, top: 5, bodyW: 14, armW: 4 });
  c.rect(12, 26, 8, 2, S[3]);
  c.poly([[16, 13], [19, 17], [16, 21], [13, 17]], PAL.light[2]).px(16, 17, WHITE);
  c.eyes(g.cx - 3, g.eyeY + 1, 5, 'line', PAL.light[3]);
  c.outline();
  twinkle(c, 3, 22, PAL.light[1]);
  twinkle(c, 28, 21, PAL.light[1]);
  return c.shadow(16, 29.5, 11).finish();
};

export const ROCK = { turtle: turtle1, golem: golem1, crab, rockturtle, irongolem, mossgolem, earthgiant, skyshell, magnetrock, lavaturtle, icerock, magmagolem, crystalgolem, gravegolem, amberturtle, sanctuaryguard };
