// モンスターの絵を、ブラウザで使える形（canvas と画像の URL）にする。一度作ったら覚えておく。
//   look：ally（味方）/ enemy（敵：赤）/ elite（強い敵：橙）/ boss（ボス：紫）/ silhouette（図鑑でまだ見ていない）
// 敵は大きさを変えずに、縁取りの色（palette[1]）とオーラで見分ける（2026-11-12 決定。見本は docs/art/enemy-look.png）。
import { drawSprite } from '../art/sprites.js';

const LOOKS = {
  ally: { outline: null, aura: null },
  enemy: { outline: '#8a1424', aura: [[230, 50, 60], 1] },
  elite: { outline: '#8a4a00', aura: [[255, 150, 20], 2] },
  boss: { outline: '#4a1170', aura: [[176, 70, 255], 3] },
};

const parse = (c) => {
  if (!c) return [0, 0, 0, 0];
  if (c.startsWith('rgba')) {
    const [r, g, b, a] = c.match(/[\d.]+/g).map(Number);
    return [r, g, b, Math.round(a * 255)];
  }
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
};

/** 絵の RGBA（size×size×4）。flip で左右反転 */
function pixels(kind, look, flip) {
  const s = drawSprite(kind);
  if (!s) return null;
  const N = s.size;
  const out = new Uint8ClampedArray(N * N * 4);
  if (look === 'silhouette') {
    s.grid.forEach((v, i) => {
      const [, , , a] = parse(s.palette[v]);
      if (a === 255) out.set([58, 56, 76, 255], i * 4);
      else if (a) out.set([0, 0, 0, a], i * 4);
    });
    return { N, out };
  }
  const lk = LOOKS[look] ?? LOOKS.ally;
  const pal = s.palette.map((c, i) => (i === 1 && lk.outline ? parse(lk.outline) : parse(c)));
  const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : s.grid[y * N + (flip ? N - 1 - x : x)]);
  const solid = (x, y) => {
    const v = at(x, y);
    return v !== 0 && pal[v][3] === 255;
  };
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const v = at(x, y);
      let col = v ? pal[v] : [0, 0, 0, 0];
      if (!(v && col[3] === 255) && lk.aura) {
        const [rgb, width] = lk.aura;
        let d = 99;
        for (let dy = -width; dy <= width; dy++) for (let dx = -width; dx <= width; dx++) if (solid(x + dx, y + dy)) d = Math.min(d, Math.max(Math.abs(dx), Math.abs(dy)));
        if (d <= width) col = [...rgb, Math.round(255 * (1 - (d - 1) / (width + 0.5)) * 0.85)];
      }
      out.set(col, (y * N + x) * 4);
    }
  return { N, out };
}

const canvases = new Map();
/** 絵の canvas（size×size）。まだ描いていないモンスターは null */
export function spriteCanvas(kind, look = 'ally', flip = false) {
  const key = `${kind}/${look}/${flip ? 1 : 0}`;
  if (!canvases.has(key)) {
    const p = pixels(kind, look, flip);
    if (!p) {
      canvases.set(key, null);
    } else {
      const cv = document.createElement('canvas');
      cv.width = p.N;
      cv.height = p.N;
      cv.getContext('2d').putImageData(new ImageData(p.out, p.N, p.N), 0, 0);
      canvases.set(key, cv);
    }
  }
  return canvases.get(key);
}

const urls = new Map();
/** 画面の一覧で使う画像の URL（data:） */
export function spriteUrl(kind, look = 'ally') {
  const key = `${kind}/${look}`;
  if (!urls.has(key)) urls.set(key, spriteCanvas(kind, look)?.toDataURL() ?? null);
  return urls.get(key);
}

/** 一覧のアイコン（img）。絵がないときは null */
export function spriteImg(kind, { look = 'ally', size = 32, cls = 'sprite' } = {}) {
  const url = spriteUrl(kind, look);
  return url ? `<img class="${cls}" src="${url}" width="${size}" height="${size}" alt="">` : null;
}
