// 資源地の絵を一覧の PNG にする（確かめる用）。node tools/render-nodes.mjs → docs/art/sheet-nodes.png（4倍）
import fs from 'node:fs';
import { drawNodeSprite, NODE_ELEMENTS } from '../src/art/node.js';
import { makeImage } from './png.mjs';

const scale = 4;
const T = 32 * scale;
const GAP = 8 * scale;
const img = makeImage(GAP + NODE_ELEMENTS.length * (T + GAP), T + 2 * GAP, [44, 48, 58, 255]);
NODE_ELEMENTS.forEach((el, i) => {
  const ox = GAP + i * (T + GAP);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) img.fill(ox + x * scale, GAP + y * scale, scale, scale, ((x >> 3) + (y >> 3)) % 2 ? [143, 207, 106, 255] : [134, 198, 98, 255]);
  img.sprite(drawNodeSprite(el), ox, GAP, scale);
});
fs.writeFileSync('docs/art/sheet-nodes.png', img.encode());
console.log('docs/art/sheet-nodes.png', NODE_ELEMENTS.join(' '));
