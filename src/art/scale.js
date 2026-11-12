// スケイル系の絵（魚・トカゲ・竜。横向きは左を向く）
import { makeCanvas, PAL, C, WHITE, INK } from './kit.js';
import { fan, twinkle } from './parts.js';

// 横向きの魚。P は体の色。目の位置を返す
function fish(c, P, { cx = 15, cy = 16, rx = 9, ry = 6, belly = P[0], fin = P[2], tailW = 6 } = {}) {
  c.poly([[cx + rx - 2, cy], [cx + rx + tailW, cy - 6], [cx + rx + tailW - 2, cy], [cx + rx + tailW, cy + 6]], fin);
  c.poly([[cx - 2, cy - ry + 1], [cx + 2, cy - ry - 3], [cx + 5, cy - ry + 1]], fin);
  c.ellipse(cx, cy, rx, ry, P[1]);
  c.recolor(P[1], P[2], (x, y) => y + 0.5 > cy + ry * 0.35);
  c.ellipse(cx - 1, cy + ry * 0.5, rx * 0.6, ry * 0.3, belly);
  c.poly([[cx + 1, cy + 1], [cx + 5, cy + 4], [cx + 1, cy + 4]], fin);
  return { ex: cx - rx + 3, ey: cy - 2 };
}

// 横向きのトカゲ・ワニの体（頭は左）
function lizardBody(c, P, { cy = 21, len = 22, h = 4.5, head = 5, belly = P[0] } = {}) {
  c.line(24, cy, 30, cy - 6, P[2], 2);
  c.rect(10, cy + 2, 2, 4, P[3]).rect(20, cy + 2, 2, 4, P[3]);
  c.ellipse(16, cy, len / 2 - 2, h, P[1]);
  c.ellipse(7, cy - 2, head + 1, head * 0.85, P[1]);
  c.recolor(P[1], P[2], (x, y) => y + 0.5 > cy + 1);
  c.ellipse(15, cy + h * 0.55, len / 3, h * 0.3, belly);
  c.rect(12, cy + 2, 2, 4, P[2]).rect(22, cy + 2, 2, 4, P[2]);
  return c;
}

// 砂漠の砂色のトカゲ（しっぽで砂を巻き上げる）
const lizard = () => {
  const c = makeCanvas();
  const P = ['#fff0c8', '#e8c47a', '#c49a4c', '#9a7432'];
  lizardBody(c, P, { cy: 21 });
  c.dots([[14, 18], [18, 18], [22, 19]], P[3]);
  c.eye(5, 17, 'dot').px(2, 20, INK);
  c.outline();
  c.dots([[29, 10], [28, 8], [26, 9], [30, 12], [27, 6]], PAL.earth[1]);
  return c.shadow(16, 29.5, 12).finish();
};

// まだ子どもの小さなワイバーン（風のブレス）
const wyvern = () => {
  const c = makeCanvas();
  const P = PAL.wind;
  fan(c, 18, 13, 12, -2.3, -1.0, P[2]);
  fan(c, 18, 13, 8, -2.1, -1.1, P[1]);
  c.line(22, 22, 29, 17, P[2], 2).poly([[28, 15], [31, 16], [29, 19]], P[2]);
  c.rect(14, 24, 3, 4, P[3]).rect(19, 24, 3, 4, P[3]);
  c.ellipse(18, 20, 6.5, 5.5, P[1]);
  c.ellipse(17, 22, 4, 3, P[0]);
  c.ellipse(11, 13, 5.5, 5, P[1]);
  c.recolor(P[1], P[2], (x, y) => x >= 13 && y >= 15 && y < 17);
  c.poly([[10, 8], [12, 4], [13, 9]], WHITE).poly([[13, 9], [16, 6], [15, 11]], WHITE);
  c.eye(8, 11, 'dot').px(6, 15, INK);
  c.outline();
  c.dots([[2, 16], [3, 15], [1, 18], [3, 19], [2, 21]], P[0]);
  return c.shadow(18, 29.5, 8).finish();
};

// 水玉もようのカエル（正面）
const frog = () => {
  const c = makeCanvas();
  const P = PAL.water;
  c.ellipse(16, 20.5, 10, 7, P[1], (x, y) => y < 28);
  c.recolor(P[1], P[2], (x, y) => y >= 25 || x >= 23);
  c.ellipse(16, 23, 6, 3.5, P[0]);
  c.ellipse(10, 12, 3.5, 3.5, P[1]).ellipse(22, 12, 3.5, 3.5, P[1]);
  c.ellipse(10, 12, 2, 2, WHITE).ellipse(22, 12, 2, 2, WHITE);
  c.rect(10, 11, 1, 2, INK).rect(22, 11, 1, 2, INK);
  for (const [x, y] of [[8, 19], [24, 20], [12, 26], [21, 26]]) c.ellipse(x, y, 1.4, 1.4, WHITE);
  c.mouth(16, 17, 'grin');
  c.rect(6, 26, 4, 2, P[2]).rect(22, 26, 4, 2, P[2]);
  return c.outline().shadow(16, 29.5, 11).finish();
};

// 水面をはねるトビウオ（羽のようなひれ）
const flyfish = () => {
  const c = makeCanvas();
  const P = ['#e6f6ff', '#6fb4e8', '#3f86c8', '#2a5f9a'];
  fan(c, 16, 14, 11, -2.2, -1.0, '#bfe9ff');
  const e = fish(c, P, { cx: 14, cy: 16, rx: 9, ry: 5, belly: WHITE });
  c.eye(e.ex, e.ey, 'dot');
  c.outline();
  c.dots([[5, 25], [9, 27], [14, 25], [20, 27], [25, 25]], PAL.water[1]);
  c.dots([[6, 24], [21, 26]], WHITE);
  return c.finish();
};

// 体をくねらせて電撃を放つウナギ
const eel = () => {
  const c = makeCanvas();
  const P = PAL.thunder;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    c.ellipse(6 + t * 22 + 0.5, 16 + Math.sin(t * Math.PI * 2) * 5 + 0.5, 3.4 - t * 1.4, 3.4 - t * 1.4, P[1]);
  }
  c.recolor(P[1], P[2], (x, y) => (x % 6 === 0 || x % 6 === 1) && x > 9);
  c.ellipse(5, 15, 4, 3.5, P[1]);
  c.eye(3, 13, 'dot').mouth(3, 17, 'smile2');
  c.outline();
  c.line(12, 4, 14, 7, P[1]).line(14, 7, 12, 8, P[1]).line(12, 8, 14, 11, P[1]);
  c.line(22, 23, 24, 26, P[1]).line(24, 26, 22, 27, P[1]);
  return c.shadow(16, 29.5, 12).finish();
};

// 泥の中にひそむワニ（大きな口）
const croc = () => {
  const c = makeCanvas();
  const P = ['#d8e8a0', '#8fa85a', '#6a8442', '#4a5e2e'];
  lizardBody(c, P, { cy: 21, h: 5, head: 5 });
  c.poly([[1, 18], [9, 16], [9, 21], [1, 21]], P[1]);
  c.rect(1, 21, 8, 2, P[2]);
  c.dots([[2, 20], [4, 20], [6, 20], [3, 21], [5, 21]], WHITE);
  c.dots([[13, 17], [16, 16], [19, 17], [22, 18]], P[3]);
  c.eye(8, 15, 'dot');
  c.ellipse(16, 27, 12, 2, PAL.earth[2], (x, y) => c.get(x, y) === null);
  c.outline();
  c.dots([[10, 26], [21, 26]], PAL.earth[3]);
  return c.shadow(16, 29.5, 13).finish();
};

// 背びれがつららの魚
const icefish = () => {
  const c = makeCanvas();
  const P = PAL.ice;
  for (const [x, h] of [[11, 7], [14, 9], [17, 8], [20, 6]]) c.poly([[x - 1.5, 13], [x + 1.5, 13], [x, 13 - h]], WHITE);
  const e = fish(c, ['#ffffff', '#a8e4f4', '#6cc0d8', '#4a98b8'], { cx: 15, cy: 18, rx: 9, ry: 6, belly: WHITE });
  c.eye(e.ex, e.ey, 'dot');
  c.outline();
  twinkle(c, 27, 6, WHITE);
  return c.shadow(16, 29.5, 10).finish();
};

// 深い闇にすむアンコウ（ちょうちんの光）
const anglerfish = () => {
  const c = makeCanvas();
  const P = ['#9a86c4', '#4a3d6a', '#33294d', '#221a36'];
  c.line(10, 9, 8, 3, P[0]).line(8, 3, 5, 3, P[0]);
  c.ellipse(4, 4.5, 2.5, 2.5, '#fff6a8');
  const e = fish(c, P, { cx: 16, cy: 18, rx: 11, ry: 8, belly: P[1] });
  c.poly([[5, 19], [13, 21], [5, 24]], '#1c1430');
  c.dots([[6, 20], [8, 20], [10, 21], [7, 23], [9, 22]], WHITE);
  c.eye(e.ex + 2, e.ey - 2, 'dot', '#fff6a8');
  c.outline();
  twinkle(c, 4, 4, WHITE);
  return c.shadow(16, 29.5, 11).finish();
};

// 氷の中をはい進む大きなワーム（冷たいブレス）
const frostwyrm = () => {
  const c = makeCanvas();
  const P = ['#ffffff', '#cdeaf7', '#8fc0de', '#5f92b8'];
  for (let i = 0; i < 5; i++) c.ellipse(27 - i * 4, 24 - i * 2.2, 4, 4, i % 2 ? P[1] : P[2]);
  c.ellipse(9, 11, 6.5, 6, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 14 && x >= 8);
  c.poly([[4, 12], [0, 10], [0, 16], [4, 15]], '#2a3a5a');
  c.dots([[2, 11], [2, 15]], WHITE);
  c.poly([[9, 5], [11, 1], [12, 6]], WHITE).poly([[12, 7], [16, 4], [14, 9]], WHITE);
  c.eye(6, 8, 'angryL');
  c.ellipse(27, 26, 4, 1.5, '#e8f6ff');
  c.outline();
  c.dots([[1, 20], [2, 22], [4, 21], [1, 24]], WHITE);
  return c.shadow(18, 29.5, 11).finish();
};

// まだ小さいサメ
const shark = () => {
  const c = makeCanvas();
  const P = ['#e6f2ff', '#7aa6d6', '#5684b8', '#3a6094'];
  c.poly([[14, 12], [18, 4], [21, 12]], P[2]);
  const e = fish(c, P, { cx: 15, cy: 17, rx: 10, ry: 6, belly: WHITE, fin: P[2] });
  c.eye(e.ex, e.ey, 'dot');
  c.mouth(7, 19, 'fang');
  c.dots([[13, 16], [14, 16], [13, 18]], P[3]);
  c.outline();
  c.dots([[4, 27], [9, 28], [22, 28], [27, 27]], PAL.water[1]);
  return c.shadow(16, 29.5, 10).finish();
};

// 川の底の大きなナマズ（長いひげ）
const catfish = () => {
  const c = makeCanvas();
  const P = ['#e8e2c8', '#9c9478', '#7a7258', '#58523e'];
  c.line(6, 21, 1, 25, P[3]).line(1, 25, 0, 28, P[3]).line(7, 20, 2, 16, P[3]).line(2, 16, 0, 15, P[3]);
  const e = fish(c, P, { cx: 16, cy: 19, rx: 12, ry: 6.5, belly: P[0] });
  c.eye(e.ex, e.ey, 'dot');
  c.mouth(7, 21, 'flat');
  c.dots([[15, 16], [19, 15], [22, 17], [12, 15]], P[3]);
  return c.outline().shadow(16, 29.5, 13).finish();
};

// 川の流れから生まれた細長い竜
const riverdragon = () => {
  const c = makeCanvas();
  const P = PAL.water;
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const x = 17 + Math.sin(t * Math.PI * 2.4) * 8 - t * 9;
    const y = 27 - t * 17;
    c.ellipse(x + 0.5, y + 0.5, 3.2 - t * 0.6, 3.2 - t * 0.6, t > 0.85 ? P[1] : i % 6 < 3 ? P[1] : P[2]);
  }
  c.ellipse(8, 8, 5, 4.5, P[1]);
  c.poly([[4, 8], [0, 9], [0, 12], [5, 11]], P[0]);
  c.line(9, 4, 12, 0, C.gold[1]).line(11, 5, 15, 2, C.gold[1]);
  c.line(3, 11, 0, 15, WHITE).line(5, 11, 3, 16, WHITE);
  c.eye(6, 6, 'dot');
  c.outline();
  c.dots([[22, 10], [26, 13], [18, 4]], WHITE);
  return c.shadow(18, 29.5, 10).finish();
};

// 火山の奥にすむ炎の竜の王
const volcanoking = () => {
  const c = makeCanvas();
  const P = PAL.fire;
  fan(c, 18, 13, 13, -2.4, -0.9, P[3]);
  fan(c, 18, 13, 9, -2.2, -1.0, P[2]);
  c.line(24, 23, 30, 19, P[2], 3).poly([[29, 16], [32, 18], [30, 22]], C.lava[1]);
  c.rect(14, 24, 4, 4, P[3]).rect(21, 24, 4, 4, P[3]);
  c.ellipse(19, 20, 8, 6.5, P[1]);
  c.ellipse(18, 22, 5, 3.5, C.lava[0]);
  c.ellipse(10, 12, 6.5, 6, P[1]);
  c.recolor(P[1], P[2], (x, y) => y >= 15 && y < 17 && x >= 12);
  c.poly([[8, 8], [6, 1], [11, 6]], C.gold[1]).poly([[12, 7], [15, 0], [15, 8]], C.gold[1]);
  c.eye(7, 10, 'angryL').mouth(6, 15, 'fang');
  c.poly([[3, 14], [-1, 12], [0, 20], [3, 18]], C.lava[1]);
  return c.outline().shadow(18, 29.5, 12).finish();
};

export const SCALE = { lizard, wyvern, frog, flyfish, eel, croc, icefish, anglerfish, frostwyrm, shark, catfish, riverdragon, volcanoking };
