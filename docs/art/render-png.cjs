// sprites-trial.cjs の絵を PNG にして見る。
//   上の段：64 の絵を2倍（図鑑の大きさ）
//   中の段：32 の絵を4倍（上と同じ大きさで比べる）
//   下の段：地域マップの草地（1マス32）を2倍にしたもの。各モンスターの左＝64を縮めた絵、右＝32で描いた絵
// 使い方：node docs/art/render-png.cjs docs/art/trial-2.png
const fs = require('fs');
const zlib = require('zlib');
const { SPRITES } = require('./sprites-trial.cjs');

function parse(c) {
  if (!c) return [0, 0, 0, 0];
  if (c.startsWith('rgba')) {
    const [r, g, b, a] = c.match(/[\d.]+/g).map(Number);
    return [r, g, b, Math.round(a * 255)];
  }
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}

const names = Object.keys(SPRITES);
const COL = 128;
const GAP = 24;
const W = GAP + names.length * (COL + GAP);
const ROW3 = 64;
const H = GAP + COL + GAP + COL + GAP + ROW3 + GAP;
const px = Buffer.alloc(W * H * 4);
const put = (x, y, [r, g, b, a]) => {
  if (!a || x < 0 || y < 0 || x >= W || y >= H) return;
  const p = (y * W + x) * 4;
  const t = a / 255;
  px[p] = Math.round(r * t + px[p] * (1 - t));
  px[p + 1] = Math.round(g * t + px[p + 1] * (1 - t));
  px[p + 2] = Math.round(b * t + px[p + 2] * (1 - t));
  px[p + 3] = 255;
};
// 背景：うすい市松
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const v = ((x >> 4) + (y >> 4)) % 2 ? 236 : 246;
    put(x, y, [v, v, v + 4, 255]);
  }
// sample(x, y) が色を返す絵を、scale 倍で置く
function blit(size, sample, ox, oy, scale) {
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const col = sample(x, y);
      for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) put(ox + x * scale + dx, oy + y * scale + dy, col);
    }
}
const sampler = (s) => (x, y) => parse(s.palette[s.grid[y * s.size + x]]);
// ブラウザで 64 の絵を 32 の大きさに縮めたとき（いちばん近いドットだけが残る）
const shrunk = (s) => (x, y) => parse(s.palette[s.grid[(2 * y + 1) * s.size + 2 * x + 1]]);

const y1 = GAP;
const y2 = GAP + COL + GAP;
const y3 = y2 + COL + GAP;
// 草地（1マス32を2倍）
for (let y = 0; y < ROW3; y++)
  for (let x = GAP; x < W - GAP; x++) {
    const tile = ((x - GAP) >> 6) % 2;
    put(x, y3 + y, tile ? [143, 207, 106, 255] : [134, 198, 98, 255]);
  }
names.forEach((name, i) => {
  const ox = GAP + i * (COL + GAP);
  const s64 = SPRITES[name][64]();
  const s32 = SPRITES[name][32]();
  blit(64, sampler(s64), ox, y1, 2);
  blit(32, sampler(s32), ox, y2, 4);
  blit(32, shrunk(s64), ox, y3, 2);
  blit(32, sampler(s32), ox + 64, y3, 2);
});

const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) px.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync(process.argv[2], png);
console.log('wrote', W, 'x', H);
