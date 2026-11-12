// 小さな PNG 書き出し（道具用）。画像の RGBA の配列を PNG にする
import { deflateSync } from 'node:zlib';

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};

/** '#rrggbb' か 'rgba(r,g,b,a)' を [r,g,b,a] に */
export function parseColor(col) {
  if (!col) return [0, 0, 0, 0];
  if (col.startsWith('rgba')) {
    const [r, g, b, a] = col.match(/[\d.]+/g).map(Number);
    return [r, g, b, Math.round(a * 255)];
  }
  const n = parseInt(col.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

/** 描ける画像（W×H）。put で色を重ね、encode で PNG にする */
export function makeImage(W, H, bg = [0, 0, 0, 0]) {
  const px = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) px.set(bg, i * 4);
  const img = {
    W,
    H,
    put(x, y, [r, g, b, a]) {
      if (!a || x < 0 || y < 0 || x >= W || y >= H) return;
      const p = (y * W + x) * 4;
      const t = a / 255;
      px[p] = Math.round(r * t + px[p] * (1 - t));
      px[p + 1] = Math.round(g * t + px[p + 1] * (1 - t));
      px[p + 2] = Math.round(b * t + px[p + 2] * (1 - t));
      px[p + 3] = Math.max(px[p + 3], a);
    },
    fill(x0, y0, w, h, col) {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) img.put(x, y, col);
    },
    // 絵（{ size, palette, grid }）を scale 倍で置く
    sprite(s, ox, oy, scale = 1) {
      for (let y = 0; y < s.size; y++)
        for (let x = 0; x < s.size; x++) {
          const col = parseColor(s.palette[s.grid[y * s.size + x]]);
          if (col[3]) img.fill(ox + x * scale, oy + y * scale, scale, scale, col);
        }
    },
    encode() {
      const raw = Buffer.alloc((W * 4 + 1) * H);
      for (let y = 0; y < H; y++) px.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
      const ihdr = Buffer.alloc(13);
      ihdr.writeUInt32BE(W, 0);
      ihdr.writeUInt32BE(H, 4);
      ihdr[8] = 8;
      ihdr[9] = 6;
      return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
    },
  };
  return img;
}
