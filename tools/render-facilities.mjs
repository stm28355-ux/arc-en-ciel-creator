// 施設の絵を一覧の PNG にする（確かめる用）。
//   node tools/render-facilities.mjs            → docs/art/sheet-facilities.png（3倍）
//   node tools/render-facilities.mjs out.png 4  → 出す場所と倍率を指定
// 草地のマス目の上に、施設のマス（上を向いたとき）の大きさで置く。
import fs from 'node:fs';
import { FACILITIES, FACILITY_ORDER } from '../src/data/facilities.js';
import { drawFacilitySprite } from '../src/art/facility.js';
import { makeImage } from './png.mjs';

const out = process.argv[2] ?? 'docs/art/sheet-facilities.png';
const scale = Number(process.argv[3] ?? 3);
const GAP = 8 * scale;
const ROW_W = 1100 * scale / 3;
// 横に並べて、はみ出したら次の行へ
const items = FACILITY_ORDER.map((kind) => ({ kind, s: drawFacilitySprite(kind) }));
let x = GAP;
let y = GAP;
let rowH = 0;
const pos = [];
for (const it of items) {
  const w = (it.s?.w ?? 32) * scale;
  const h = (it.s?.h ?? 32) * scale;
  if (x + w + GAP > ROW_W) {
    x = GAP;
    y += rowH + GAP;
    rowH = 0;
  }
  pos.push({ ...it, x, y, w, h });
  x += w + GAP;
  rowH = Math.max(rowH, h);
}
const W = ROW_W;
const H = y + rowH + GAP;
const img = makeImage(W, H, [44, 48, 58, 255]);
let drawn = 0;
for (const p of pos) {
  for (let yy = 0; yy < p.h / scale; yy++)
    for (let xx = 0; xx < p.w / scale; xx++)
      img.fill(p.x + xx * scale, p.y + yy * scale, scale, scale, ((xx >> 3) + (yy >> 3)) % 2 ? [143, 207, 106, 255] : [134, 198, 98, 255]);
  if (p.s) {
    img.sprite(p.s, p.x, p.y, scale);
    drawn++;
  } else img.fill(p.x + 4 * scale, p.y + 4 * scale, p.w - 8 * scale, p.h - 8 * scale, [255, 255, 255, 60]);
}
fs.writeFileSync(out, img.encode());
console.log(`${out}：${drawn} / ${items.length} の施設を描いた`);
console.log(items.map((it) => `${FACILITIES[it.kind].name}${it.s ? '' : '（まだ）'}`).join(' / '));
