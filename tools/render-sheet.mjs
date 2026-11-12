// モンスターの絵を一覧の PNG にする（確かめる用）。
//   node tools/render-sheet.mjs gel            → docs/art/sheet-gel.png（その系統だけ、4倍）
//   node tools/render-sheet.mjs all            → docs/art/sheet-all.png（全部、2倍。系統ごとに1行）
//   node tools/render-sheet.mjs gel out.png 6  → 出す場所と倍率を指定
// まだ描いていないモンスターは、うすい四角になる。
import fs from 'node:fs';
import { MONSTERS } from '../src/data/monsters.js';
import { FAMILY_ORDER } from '../src/data/families.js';
import { SPRITES, drawSprite } from '../src/art/sprites.js';
import { makeImage } from './png.mjs';

const which = process.argv[2] ?? 'all';
const scale = Number(process.argv[4] ?? (which === 'all' ? 2 : 4));
const out = process.argv[3] ?? `docs/art/sheet-${which}.png`;
const families = which === 'all' ? FAMILY_ORDER : [which];
const rows = families.map((f) => Object.keys(MONSTERS).filter((k) => MONSTERS[k].family === f).sort((a, b) => MONSTERS[a].rank - MONSTERS[b].rank));
const T = 32 * scale;
const GAP = 4 * scale;
const cols = which === 'all' ? Math.max(...rows.map((r) => r.length)) : Math.min(8, rows[0].length);
const lines = which === 'all' ? rows : Array.from({ length: Math.ceil(rows[0].length / cols) }, (_, i) => rows[0].slice(i * cols, i * cols + cols));
const W = GAP + cols * (T + GAP);
const H = GAP + lines.length * (T + GAP);
const img = makeImage(W, H, [44, 48, 58, 255]);
let drawn = 0;
lines.forEach((line, r) =>
  line.forEach((kind, i) => {
    const ox = GAP + i * (T + GAP);
    const oy = GAP + r * (T + GAP);
    // 草地のマス目（地域マップに置いたときの見え方に近い）
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) img.fill(ox + x * scale, oy + y * scale, scale, scale, ((x >> 3) + (y >> 3)) % 2 ? [143, 207, 106, 255] : [134, 198, 98, 255]);
    if (SPRITES[kind]) {
      img.sprite(drawSprite(kind), ox, oy, scale);
      drawn++;
    } else img.fill(ox + 4 * scale, oy + 4 * scale, 24 * scale, 24 * scale, [255, 255, 255, 60]);
  }),
);
fs.writeFileSync(out, img.encode());
console.log(`${out}：${drawn} 体を描いた（${families.join(', ')}）`);
for (const line of lines) console.log(line.map((k) => `${MONSTERS[k].name}${SPRITES[k] ? '' : '（まだ）'}`).join(' / '));
