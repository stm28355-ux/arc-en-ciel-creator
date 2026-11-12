// モンスターの絵（32×32 のドット絵）を、図形の組み合わせで描く道具。
// 画面がなくても動く（node でも、ブラウザでも）。描いた結果は { size, palette, grid }：
//   palette[0] は透明、palette[1] はいつも縁取りの色（敵の絵は palette[1] を赤などに変えて見分ける）
//   grid は size×size の色の番号
// 描き方の決まり（2026-11-12）：ポップな太い縁取り、属性の色、かわいい顔。ほっぺは無理に付けない。
export const SIZE = 32;
export const OUTLINE = '#2a2238';
export const SHADOW = 'rgba(42,34,56,0.22)';
export const WHITE = '#ffffff';
export const INK = '#2a2238'; // 目・口など
export const PINK = '#ff9eb8';

// 属性ごとの色：[明るい, ふつう, 影, 濃い影]
export const PAL = {
  none: ['#ffffff', '#f1edff', '#d3cbf0', '#a99fd6'],
  wind: ['#dcffe0', '#9be8a6', '#5fc47b', '#3a9a5a'],
  earth: ['#f4d6a8', '#d9a76a', '#a97543', '#7a5130'],
  water: ['#d8f3ff', '#82cbf6', '#4699de', '#2b69b1'],
  thunder: ['#fffbd2', '#ffe45a', '#f0b52a', '#bf8618'],
  fire: ['#ffe1a6', '#ff9b52', '#ec5b32', '#b53425'],
  ice: ['#f6feff', '#cbf3fb', '#91d6ea', '#5aacc9'],
  light: ['#fffef2', '#fff2a6', '#f5d366', '#d6a63a'],
  dark: ['#dcc8f4', '#9e7ad6', '#6b4aa9', '#43307a'],
};
// よく使うほかの色
export const C = {
  stone: ['#e3ded3', '#bdb6aa', '#948c80', '#6e675e'],
  wood: ['#e8c48e', '#c08a52', '#8f5f34', '#633f22'],
  leaf: ['#d8f7a6', '#9fdc63', '#62ad3d', '#3d7d2a'],
  skin: ['#fff0e6', '#ffe0cf', '#f4bea6', '#d99a82'],
  metal: ['#f2f4f8', '#c9cfdb', '#9aa3b5', '#6c7488'],
  gold: ['#fff4b8', '#ffd84d', '#e0a92a', '#a87418'],
  red: ['#ffc0b0', '#ff6b5a', '#d23b3b', '#992430'],
  blue: ['#c8e8ff', '#6fb4f5', '#3a7fd6', '#285aa6'],
  pink: ['#ffe3ee', '#ffb3cd', '#f27aa6', '#c4507d'],
  black: ['#6b6680', '#45405a', '#2f2b40', '#1d1a2a'],
  snow: ['#ffffff', '#f4f9ff', '#d6e6f5', '#aac3dc'],
  moss: ['#cdeea0', '#8cc95c', '#5f9c3c', '#3f7028'],
  lava: ['#fff1a0', '#ffb43c', '#ff6a2a', '#d23a1e'],
  purple: ['#efd8ff', '#c79bf2', '#9666cf', '#6a43a0'],
};

export function makeCanvas(N = SIZE) {
  const g = new Array(N * N).fill(null);
  const inside = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  const c = {
    N,
    g,
    get: (x, y) => (inside(x, y) ? g[y * N + x] : null),
    px(x, y, col) {
      x = Math.round(x);
      y = Math.round(y);
      if (inside(x, y)) g[y * N + x] = col;
      return c;
    },
    dots(list, col) {
      for (const [x, y] of list) c.px(x, y, col);
      return c;
    },
    each(fn) {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) fn(x, y);
    },
    // 楕円（中心 cx,cy と半径。ドットの中心で判定）。test(x,y) が false のドットは塗らない
    ellipse(cx, cy, rx, ry, col, test) {
      c.each((x, y) => {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) g[y * N + x] = col;
      });
      return c;
    },
    rect(x0, y0, w, h, col) {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) c.px(x, y, col);
      return c;
    },
    // 多角形（点の並び。ドットの中心が中にあれば塗る）
    poly(pts, col, test) {
      c.each((x, y) => {
        const px = x + 0.5;
        const py = y + 0.5;
        let inPoly = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inPoly = !inPoly;
        }
        if (inPoly && (!test || test(x, y))) g[y * N + x] = col;
      });
      return c;
    },
    // 線（w が 1 より大きいと丸い筆）
    line(x0, y0, x1, y1, col, w = 1) {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        if (w <= 1) c.px(x, y, col);
        else c.ellipse(x + 0.5, y + 0.5, w / 2, w / 2, col);
      }
      return c;
    },
    // ある色のドットのうち test に合うものを別の色にする（影・光）
    recolor(from, to, test) {
      const list = Array.isArray(from) ? from : [from];
      c.each((x, y) => {
        if (list.includes(g[y * N + x]) && (!test || test(x, y))) g[y * N + x] = to;
      });
      return c;
    },
    // 体の影：中心 (cx,cy) の楕円より外（右下寄り）を影の色に。lightAt を渡すとそこに光を置く
    shadeBody(base, shade, { cx, cy, rx, ry, deep, deepY } = {}) {
      c.recolor(base, shade, (x, y) => {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        return dx * dx + dy * dy > 1;
      });
      if (deep && deepY != null) c.recolor(shade, deep, (x, y) => y >= deepY);
      return c;
    },
    // 左半分を右へ写す（左右対称の絵）
    mirror(center = N / 2) {
      c.each((x, y) => {
        if (x + 0.5 < center) {
          const mx = Math.round(2 * center - x - 1);
          if (inside(mx, y)) g[y * N + mx] = g[y * N + x];
        }
      });
      return c;
    },
    // 左右を反転する（向きを変える）
    flip() {
      for (let y = 0; y < N; y++) {
        const row = g.slice(y * N, y * N + N).reverse();
        for (let x = 0; x < N; x++) g[y * N + x] = row[x];
      }
      return c;
    },
    // 描いた形のまわりを縁取りする（透明なドットのうち、上下左右に色があるもの）
    outline(col = OUTLINE) {
      const add = [];
      c.each((x, y) => {
        if (g[y * N + x] !== null) return;
        const near = [c.get(x - 1, y), c.get(x + 1, y), c.get(x, y - 1), c.get(x, y + 1)];
        if (near.some((v) => v !== null && v !== col && v !== SHADOW)) add.push([x, y]);
      });
      for (const [x, y] of add) g[y * N + x] = col;
      return c;
    },
    // 足もとの影（縁取りのあとで、空いているところにだけ置く）
    shadow(cx = N / 2, cy = N - 2.5, rx = 9, ry = 1.6) {
      c.ellipse(cx, cy, rx, ry, SHADOW, (x, y) => g[y * N + x] === null);
      return c;
    },
    // 石だたみ・うろこ：inside の中を、種の点に一番近いドットごとに分け、境目を線の色にする
    cells(insideFn, seeds, colors, lineCol, hi, gap = 0.8) {
      const id = new Array(N * N).fill(-1);
      c.each((x, y) => {
        if (!insideFn(x, y)) return;
        let d1 = 1e9;
        let d2 = 1e9;
        let i1 = -1;
        seeds.forEach((s, i) => {
          const d = Math.hypot(x + 0.5 - s[0], (y + 0.5 - s[1]) * 1.25);
          if (d < d1) {
            d2 = d1;
            d1 = d;
            i1 = i;
          } else if (d < d2) d2 = d;
        });
        if (d2 - d1 < gap) g[y * N + x] = lineCol;
        else {
          id[y * N + x] = i1;
          g[y * N + x] = colors[i1 % colors.length];
        }
      });
      if (hi)
        c.each((x, y) => {
          const i = id[y * N + x];
          if (i >= 0 && (y === 0 || id[(y - 1) * N + x] !== i)) g[y * N + x] = hi;
        });
      return c;
    },
    // ---------- 顔 ----------
    // 目。kind：tall（2×3、光つき）/ dot（2×2、光つき）/ small（1×2）/ closed（^）/ happy（∩）/ line（ー）/ angry（つり目）/ sleepy（下向きの弧）
    eye(x, y, kind = 'tall', col = INK) {
      switch (kind) {
        case 'tall':
          c.rect(x, y, 2, 3, col).px(x, y, WHITE);
          break;
        case 'dot':
          c.rect(x, y, 2, 2, col).px(x, y, WHITE);
          break;
        case 'small':
          c.rect(x, y, 1, 2, col);
          break;
        case 'pip':
          c.px(x, y, col);
          break;
        case 'closed':
          c.dots([[x - 1, y + 1], [x, y], [x + 1, y + 1]], col);
          break;
        case 'happy':
          c.dots([[x - 1, y], [x, y - 1], [x + 1, y]], col);
          break;
        case 'line':
          c.rect(x - 1, y, 3, 1, col);
          break;
        case 'angryL':
          c.rect(x, y, 2, 2, col).px(x - 1, y - 1, col).px(x, y - 1, col).px(x + 1, y, WHITE);
          break;
        case 'angryR':
          c.rect(x, y, 2, 2, col).px(x + 2, y - 1, col).px(x + 1, y - 1, col).px(x, y, WHITE);
          break;
        default:
          throw new Error(`目の形がない：${kind}`);
      }
      return c;
    },
    // 2つの目（左の目の x と、間の幅）
    eyes(x, y, gap, kind = 'tall', col = INK) {
      if (kind === 'angry') return c.eye(x, y, 'angryL', col).eye(x + gap, y, 'angryR', col);
      return c.eye(x, y, kind, col).eye(x + gap, y, kind, col);
    },
    // 口。kind：smile（∪ 小）/ grin（∪ 大）/ open（○）/ flat（ー）/ cat（ω）/ fang（牙つき）/ o（小さい○）
    mouth(x, y, kind = 'smile', col = INK) {
      switch (kind) {
        case 'smile':
          c.dots([[x - 1, y], [x, y + 1], [x + 1, y]], col);
          break;
        case 'smile2':
          c.dots([[x, y], [x + 1, y]], col);
          break;
        case 'grin':
          c.dots([[x - 2, y], [x - 1, y + 1], [x, y + 1], [x + 1, y + 1], [x + 2, y]], col);
          break;
        case 'open':
          c.rect(x - 1, y, 3, 2, col).px(x, y + 1, '#ff7a8c');
          break;
        case 'o':
          c.rect(x, y, 1, 2, col);
          break;
        case 'flat':
          c.rect(x - 1, y, 3, 1, col);
          break;
        case 'cat':
          c.dots([[x - 2, y], [x - 1, y + 1], [x, y], [x + 1, y + 1], [x + 2, y]], col);
          break;
        case 'fang':
          c.rect(x - 2, y, 5, 1, col).px(x - 1, y + 1, WHITE).px(x + 1, y + 1, WHITE);
          break;
        default:
          throw new Error(`口の形がない：${kind}`);
      }
      return c;
    },
    cheeks(x, y, gap, col = PINK) {
      return c.rect(x, y, 2, 1, col).rect(x + gap, y, 2, 1, col);
    },
    // ---------- 仕上げ ----------
    // 色の番号に直す。palette[1] は縁取りの色
    finish() {
      const palette = [null, OUTLINE];
      const index = new Map([[OUTLINE, 1]]);
      const grid = g.map((col) => {
        if (col === null) return 0;
        if (!index.has(col)) {
          index.set(col, palette.length);
          palette.push(col);
        }
        return index.get(col);
      });
      return { size: N, palette, grid };
    },
  };
  return c;
}
