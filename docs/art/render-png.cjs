// 試し描きの絵を PNG にする：node docs/art/render-png.cjs docs/art/trial-1.png
// sprites.js の絵を PNG にして見る（拡大・3体を横に並べる）
const fs = require('fs');
const zlib = require('zlib');
const { SPRITES, SPRITE_SIZE } = require('./sprites-trial.cjs');

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
const scale = 5;
const names = Object.keys(SPRITES);
const W = SPRITE_SIZE * scale * names.length + 20 * (names.length + 1);
const H = SPRITE_SIZE * scale + 40;
const px = Buffer.alloc(W * H * 4);
// 背景：うすい市松
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const v = ((x >> 4) + (y >> 4)) % 2 ? 236 : 246;
    px.set([v, v, v + 4, 255], (y * W + x) * 4);
  }
names.forEach((name, i) => {
  const { palette, grid } = SPRITES[name]();
  const ox = 20 + i * (SPRITE_SIZE * scale + 20);
  const oy = 20;
  for (let y = 0; y < SPRITE_SIZE; y++)
    for (let x = 0; x < SPRITE_SIZE; x++) {
      const [r, g, b, a] = parse(palette[grid[y * SPRITE_SIZE + x]]);
      if (!a) continue;
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) {
          const p = ((oy + y * scale + dy) * W + ox + x * scale + dx) * 4;
          const t = a / 255;
          px[p] = Math.round(r * t + px[p] * (1 - t));
          px[p + 1] = Math.round(g * t + px[p + 1] * (1 - t));
          px[p + 2] = Math.round(b * t + px[p + 2] * (1 - t));
        }
    }
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
