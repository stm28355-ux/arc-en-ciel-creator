// テンタクル系の絵（クラゲ・タコ・イカ・貝）
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { twinkle } from './parts.js';

// クラゲ：かさ（P）と、ゆれる触手
function jellyfish(c, P, { cy = 12, rx = 9, ry = 8, tent = P[2], tentN = 5, tentLen = 12, point = false } = {}) {
  for (let i = 0; i < tentN; i++) {
    const x0 = 16 - rx + 3 + (i * (rx * 2 - 6)) / (tentN - 1);
    for (let k = 0; k < tentLen; k++) c.px(x0 + Math.round(Math.sin((k + i * 2) / 2.2)), cy + 2 + k, tent);
  }
  c.ellipse(16, cy, rx, ry, P[1], (x, y) => y + 0.5 <= cy + 2.5);
  if (point) c.poly([[13, cy - ry + 2], [16, cy - ry - 3], [19, cy - ry + 2]], P[1]);
  for (let x = 16 - rx + 1; x < 16 + rx; x += 3) c.ellipse(x + 0.5, cy + 2.5, 1.6, 1.4, P[2]);
  c.recolor(P[1], P[2], (x, y) => x + 0.5 > 16 + rx * 0.45 && y > cy - ry * 0.4);
  c.ellipse(16 - rx * 0.45, cy - ry * 0.45, 1.6, 2, P[0]);
  return c;
}

// しずくのような丸いかさのクラゲ（水の膜）
const jelly = () => {
  const c = makeCanvas();
  const P = PAL.water;
  jellyfish(c, P, { cy: 13, rx: 8, ry: 7, point: true, tentLen: 10 });
  c.eyes(13, 10, 5, 'dot').mouth(16, 13, 'smile2');
  c.outline();
  // 水の膜（縁取りなしの、うすい泡）
  c.each((x, y) => {
    const d = Math.hypot((x + 0.5 - 16) / 13, (y + 0.5 - 14.5) / 13.5);
    if (d <= 1 && d > 0.9 && c.get(x, y) === null) c.px(x, y, 'rgba(190,232,255,0.75)');
  });
  c.px(8, 7, WHITE).px(9, 6, WHITE);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// 触手に電気をためたクラゲ
const shockjelly = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  jellyfish(c, P, { cy: 11, rx: 9, ry: 7.5, tent: P[2], tentLen: 14 });
  c.eyes(12, 8, 6, 'angry').mouth(16, 11, 'smile2');
  c.outline();
  c.line(4, 18, 6, 21, P[1]).line(6, 21, 4, 22, P[1]).line(4, 22, 6, 25, P[1]);
  c.line(27, 17, 29, 20, P[1]).line(29, 20, 27, 21, P[1]).line(27, 21, 29, 24, P[1]);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// かさの中でオーロラがゆらめくクラゲ
const aurorajelly = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#e2f8ff', '#b3e2f2', '#86c6de'];
  jellyfish(c, P, { cy: 12, rx: 9.5, ry: 8, tent: PAL.ice[2], tentLen: 13 });
  const bands = ['#a7f0c4', '#9ee3f5', '#f5b8e6'];
  c.each((x, y) => {
    if (c.get(x, y) !== P[1] || y < 6) return;
    const k = Math.floor((y + Math.sin(x / 2) * 1.2) / 2) % 3;
    c.px(x, y, bands[k]);
  });
  c.eyes(13, 9, 5, 'closed').mouth(16, 12, 'smile2');
  c.outline();
  twinkle(c, 4, 4, WHITE);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// かさが虹色に光るクラゲ
const prismjelly = () => {
  const c = makeCanvas();
  const RB = ['#ff8a8a', '#ffb870', '#ffe66e', '#9be8a6', '#86e0f0', '#8ab4ff', '#c79bf2'];
  jellyfish(c, PAL.light, { cy: 12, rx: 9.5, ry: 8, tent: '#ffffff', tentN: 7, tentLen: 13 });
  c.each((x, y) => {
    if (y > 14 && y < 28 && c.get(x, y) === '#ffffff') c.px(x, y, RB[Math.floor((x - 7) / 2.6)] ?? RB[6]);
  });
  c.eyes(13, 9, 5, 'dot').mouth(16, 12, 'smile');
  c.outline();
  twinkle(c, 27, 4, WHITE);
  return c.shadow(16, 29.5, 6, 1.2).finish();
};

// 川底の泥にかくれているタコ（8本の足から墨）
const mudoctopus = () => {
  const c = makeCanvas();
  const P = ['#e8c8d8', '#b47a96', '#8c5876', '#643e56'];
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * 0.05 + (i / 7) * Math.PI * 0.9;
    c.line(16, 19, 16 - Math.cos(a) * 12, 21 + Math.sin(a) * 6, i % 2 ? P[2] : P[1], 2);
  }
  c.ellipse(16, 13, 8, 8, P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 19 && y >= 11);
  c.dots([[11, 8], [12, 7]], P[0]);
  c.ellipse(16, 27, 13, 2, PAL.earth[2], (x, y) => c.get(x, y) === null);
  c.eyes(12, 12, 6, 'dot').mouth(16, 16, 'o');
  c.outline();
  c.dots([[3, 6], [28, 5], [26, 10], [5, 11]], '#3a3048');
  return c.shadow(16, 30, 13, 1.2).finish();
};

// 体を回して渦をつくるイカ（うずまきのもよう）
const squid = () => {
  const c = makeCanvas();
  const P = ['#ffe6f0', '#f28ab0', '#d4628e', '#a8436a'];
  for (let i = 0; i < 5; i++) c.line(11 + i * 2.5, 19, 9 + i * 3.5, 28, i % 2 ? P[2] : P[1], 2);
  c.poly([[16, 1], [24, 9], [23, 20], [9, 20], [8, 9]], P[1]);
  c.poly([[8, 9], [3, 12], [8, 14]], P[2]).poly([[24, 9], [29, 12], [24, 14]], P[2]);
  c.recolor(P[1], P[2], (x, y) => x >= 20);
  for (let i = 0; i < 18; i++) {
    const a = i * 0.6;
    const r = 0.5 + i * 0.22;
    c.px(16 + Math.cos(a) * r, 9 + Math.sin(a) * r, P[3]);
  }
  c.eyes(12, 14, 7, 'dot').mouth(16, 18, 'smile2');
  c.outline();
  c.dots([[3, 22], [28, 20], [2, 5]], PAL.water[1]);
  return c.shadow(16, 29.5, 9).finish();
};

// 海の底にすむ巨大なイカの王
const kraken = () => {
  const c = makeCanvas();
  const P = ['#b8e0e8', '#3f7f96', '#2c6076', '#1e4456'];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * 0.08 + (i / 5) * Math.PI * 0.84;
    const ex = 16 - Math.cos(a) * 15;
    const ey = 20 + Math.sin(a) * 8;
    c.line(16, 17, ex, ey, i % 2 ? P[2] : P[1], 3);
    c.ellipse(ex + 0.5, ey - 1.5, 1.5, 1.5, i % 2 ? P[2] : P[1]);
  }
  c.poly([[16, 0], [27, 9], [26, 19], [6, 19], [5, 9]], P[1]);
  c.recolor(P[1], P[2], (x) => x >= 22);
  c.dots([[10, 6], [12, 4], [9, 9]], P[0]);
  c.eyes(10, 12, 9, 'angry', '#ffd84d');
  c.rect(10, 12, 2, 2, '#ffd84d').rect(19, 12, 2, 2, '#ffd84d').px(11, 13, INK).px(19, 13, INK);
  c.dots([[8, 22], [12, 25], [20, 25], [24, 22]], P[0]);
  return c.outline().shadow(16, 29.5, 14).finish();
};

// 大きな真珠をかかえた貝
const pearlclam = () => {
  const c = makeCanvas();
  const P = ['#f4f0ff', '#c8c0e8', '#a69cd0', '#7d72ae'];
  c.ellipse(16, 13, 12, 8, P[1], (x, y) => y < 14);
  for (let x = 6; x <= 26; x += 4) c.line(16, 6, x, 13, P[2]);
  c.ellipse(16, 22, 12, 6, P[1], (x, y) => y >= 19);
  c.recolor(P[1], P[2], (x, y) => y >= 25);
  c.rect(5, 14, 22, 5, '#ffb3c8');
  c.ellipse(16, 16, 4, 3.5, WHITE).px(15, 15, '#fff6a8');
  c.eyes(8, 20, 14, 'dot');
  c.outline();
  twinkle(c, 26, 3, WHITE);
  return c.shadow(16, 29.5, 12).finish();
};

// 小さなイカ。おどろくと墨をはく
const inkling = () => {
  const c = makeCanvas();
  const P = PAL.water;
  c.ellipse(24, 18, 5.5, 4.5, '#3a3450').ellipse(27, 14, 3, 3, '#3a3450').ellipse(28, 21, 3, 2.5, '#3a3450');
  for (let i = 0; i < 4; i++) c.line(11 + i * 3, 20, 10 + i * 3.5, 27, i % 2 ? P[2] : P[1], 2);
  c.poly([[15, 3], [22, 10], [21, 21], [9, 21], [8, 10]], P[1]);
  c.recolor(P[1], P[2], (x) => x >= 18);
  c.eyes(11, 14, 6, 'dot').mouth(15, 18, 'o');
  c.dots([[10, 8], [11, 7]], P[0]);
  return c.outline().shadow(15, 29.5, 8).finish();
};

export const MOLLUSK = { jelly, shockjelly, aurorajelly, prismjelly, mudoctopus, squid, kraken, pearlclam, inkling };
