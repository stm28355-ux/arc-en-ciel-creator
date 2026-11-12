// いくつかの系統で使う部品（頭・服・葉・羽など）
import { C, WHITE } from './kit.js';

// 顔（肌の楕円。右下に影）
export function head(c, { cx = 16, cy = 12, rx = 6.5, ry = 6, skin = C.skin } = {}) {
  c.ellipse(cx, cy, rx, ry, skin[1]);
  c.recolor(skin[1], skin[2], (x, y) => ((x + 0.5 - (cx - 1.5)) ** 2) / (rx * rx) + ((y + 0.5 - (cy - 1.5)) ** 2) / (ry * ry) > 1);
  return c;
}

// すそが広がる服（台形）。P は [明るい, ふつう, 影, 濃い影]
export function dress(c, P, { cx = 16, top = 18, bottom = 27, wTop = 3, wBottom = 7 } = {}) {
  c.poly([[cx - wTop, top], [cx + wTop, top], [cx + wBottom, bottom], [cx - wBottom, bottom]], P[1]);
  c.recolor(P[1], P[2], (x, y) => x + 0.5 >= cx + 1.5 || y >= bottom - 1);
  return c;
}

// 葉っぱ一枚（中心・長さ・向き（ラジアン）・太さ）
export function leaf(c, cx, cy, len, ang, col, w = 0.45) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = (i / 8) * Math.PI;
    pts.push([Math.cos(t) * len, Math.sin(t) * len * w]);
  }
  for (let i = 8; i >= 0; i--) {
    const t = (i / 8) * Math.PI;
    pts.push([Math.cos(t) * len, -Math.sin(t) * len * w]);
  }
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  c.poly(pts.map(([x, y]) => [cx + x * ca - y * sa, cy + x * sa + y * ca]), col);
  return c;
}

// 花（中心と花びらの数・大きさ）
export function flower(c, cx, cy, r, petal, center, n = 5) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    c.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.75, r * 0.75, petal);
  }
  c.ellipse(cx, cy, r * 0.6, r * 0.6, center);
  return c;
}

// 鳥の羽・コウモリの翼などに使う、扇の形（根もと・長さ・開く角度）
export function fan(c, x, y, len, a0, a1, col, steps = 10) {
  const pts = [[x, y]];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    pts.push([x + Math.cos(a) * len, y + Math.sin(a) * len]);
  }
  c.poly(pts, col);
  return c;
}

// 小さな光（十字）
export function twinkle(c, x, y, col = WHITE) {
  return c.dots([[x, y], [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]], col);
}
