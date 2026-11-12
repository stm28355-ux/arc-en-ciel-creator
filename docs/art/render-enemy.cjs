// 味方と敵を、同じ絵（32のマップ用）で見分ける見本。大きさは変えず、縁取りの色とオーラで分ける。
//   列：味方（草地） / 敵（道） / 強い敵（道） / ボス（道）
//   行：sprites-trial.cjs のモンスター
// 敵は道を歩く向きに合わせて左右を反転する。
// 使い方：node docs/art/render-enemy.cjs docs/art/enemy-look.png
const fs = require('fs');
const zlib = require('zlib');
const { SPRITES } = require('./sprites-trial.cjs');

const parse = (c) => {
  if (!c) return [0, 0, 0, 0];
  if (c.startsWith('rgba')) {
    const [r, g, b, a] = c.match(/[\d.]+/g).map(Number);
    return [r, g, b, Math.round(a * 255)];
  }
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
};
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
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};

// 見分け方：縁取りの色（パレットの1番）と、まわりのオーラ（色・太さ）
const LOOKS = [
  { name: 'ally', ground: 'grass', outline: null, aura: null },
  { name: 'enemy', ground: 'path', outline: '#8a1424', aura: [[230, 50, 60], 1], flip: true },
  { name: 'elite', ground: 'path', outline: '#8a4a00', aura: [[255, 150, 20], 2], flip: true },
  { name: 'boss', ground: 'path', outline: '#4a1170', aura: [[176, 70, 255], 3], flip: true },
];

// 1体ぶんの 32×32 の色（RGBA）を作る。オーラは絵の外側に、外へ行くほど薄く塗る
function look(sprite, lk) {
  const N = sprite.size;
  const pal = sprite.palette.map((c, i) => (i === 1 && lk.outline ? parse(lk.outline) : parse(c)));
  const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : sprite.grid[y * N + (lk.flip ? N - 1 - x : x)]);
  const out = [];
  const solid = (x, y) => {
    const v = at(x, y);
    return v !== 0 && pal[v][3] === 255;
  };
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const v = at(x, y);
      if (v && pal[v][3] === 255) {
        out.push(pal[v]);
        continue;
      }
      let col = v ? pal[v] : [0, 0, 0, 0];
      if (lk.aura) {
        const [rgb, width] = lk.aura;
        let d = 99;
        for (let dy = -width; dy <= width; dy++)
          for (let dx = -width; dx <= width; dx++) if (solid(x + dx, y + dy)) d = Math.min(d, Math.max(Math.abs(dx), Math.abs(dy)));
        if (d <= width) col = [...rgb, Math.round(255 * (1 - (d - 1) / (width + 0.5)) * 0.85)];
      }
      out.push(col);
    }
  return out;
}

const names = Object.keys(SPRITES);
const S = 3; // 1ドットを3倍で見せる（1マス32 → 96）
const T = 32 * S;
const GAP = 12;
const W = GAP + LOOKS.length * (T + GAP);
const H = GAP + names.length * (T + GAP);
const px = Buffer.alloc(W * H * 4);
const put = (x, y, [r, g, b, a]) => {
  if (!a) return;
  const p = (y * W + x) * 4;
  const t = a / 255;
  px[p] = Math.round(r * t + px[p] * (1 - t));
  px[p + 1] = Math.round(g * t + px[p + 1] * (1 - t));
  px[p + 2] = Math.round(b * t + px[p + 2] * (1 - t));
  px[p + 3] = 255;
};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(x, y, [40, 44, 52, 255]);
const GROUND = { grass: [[143, 207, 106], [134, 198, 98]], path: [[214, 190, 140], [205, 180, 128]] };
names.forEach((name, row) => {
  const sprite = SPRITES[name][32]();
  LOOKS.forEach((lk, col) => {
    const ox = GAP + col * (T + GAP);
    const oy = GAP + row * (T + GAP);
    const [g1, g2] = GROUND[lk.ground];
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) put(ox + x, oy + y, [...(((x >> 3) + (y >> 3)) % 2 ? g1 : g2), 255]);
    const cells = look(sprite, lk);
    cells.forEach((c, i) => {
      const x = i % 32;
      const y = Math.floor(i / 32);
      for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) put(ox + x * S + dx, oy + y * S + dy, c);
    });
  });
});
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) px.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 6;
fs.writeFileSync(process.argv[2], Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('wrote', W, 'x', H);
