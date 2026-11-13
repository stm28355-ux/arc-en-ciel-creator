// ページの背景（2026-11-14 企画者の注文：ポップな感じ。モンスターを並べるが、見えるとネタばれになるので影にする）。
// 虹の淡いグラデーションの上に、モンスターの影（形だけ、うすい色）を散らした模様を重ねる。
// 模様は一度だけ作り、ページの背景としてくり返す。並びは毎回同じ（乱数の種を決めてある）。
import { MONSTERS } from '../data/monsters.js';
import { drawSprite } from '../art/sprites.js';

const TILE_W = 960;
const TILE_H = 640;
const COLS = 6;
const ROWS = 4;

/** 影の模様の画像（data URL） */
export function shadowPattern() {
  const cv = document.createElement('canvas');
  cv.width = TILE_W;
  cv.height = TILE_H;
  const g = cv.getContext('2d');
  let seed = 20261114;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const kinds = Object.keys(MONSTERS);
  const cw = TILE_W / COLS;
  const ch = TILE_H / ROWS;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const s = drawSprite(kinds[Math.floor(rnd() * kinds.length)]);
      if (!s) continue;
      const scale = 2 + Math.floor(rnd() * 2); // 64 か 96
      const size = 32 * scale;
      // ずらした格子（1行おきに半マスずらし、マスの中で少しゆらす）。右にはみ出した分は左はしに描き、くり返しても切れないようにする
      const x = c * cw + (r % 2 ? cw / 2 : 0) + rnd() * (cw - size) * 0.6;
      const y = r * ch + rnd() * (ch - size);
      const flip = rnd() < 0.5;
      g.fillStyle = 'rgba(110, 80, 170, 0.10)';
      for (const ox of x + size > TILE_W ? [x, x - TILE_W] : [x])
        for (let py = 0; py < 32; py++)
          for (let px = 0; px < 32; px++) {
            const v = s.grid[py * 32 + px];
            if (!v || !String(s.palette[v]).startsWith('#')) continue;
            g.fillRect(Math.round(ox + (flip ? 31 - px : px) * scale), Math.round(y + py * scale), scale, scale);
          }
    }
  return cv.toDataURL();
}

/** ページの背景に模様をつける（最初に1回） */
export function applyBackground() {
  try {
    document.body.style.setProperty('--shadow-pattern', `url(${shadowPattern()})`);
  } catch {
    // 模様が作れなくても、グラデーションだけで表示する
  }
}
