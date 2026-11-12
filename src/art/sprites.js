// モンスターの絵（32×32 のドット絵）。系統ごとのファイルで描いて、ここでまとめる。
// SPRITES[kind]() が { size, palette, grid } を返す。まだ描いていないモンスターは SPRITES にない。
import { GEL } from './gel.js';
import { PLANT } from './plant.js';
import { BIRD } from './bird.js';
import { BEAST } from './beast.js';
import { ROCK } from './rock.js';
import { FIEND } from './fiend.js';
import { MACHINE } from './machine.js';
import { SCALE } from './scale.js';
import { MOLLUSK } from './mollusk.js';
import { WRAITH } from './wraith.js';

export const SPRITES = { ...GEL, ...PLANT, ...BIRD, ...BEAST, ...ROCK, ...FIEND, ...MACHINE, ...SCALE, ...MOLLUSK, ...WRAITH };

const cache = new Map();
/** そのモンスターの絵（一度描いたら覚えておく）。まだ描いていなければ null */
export function drawSprite(kind) {
  if (!SPRITES[kind]) return null;
  if (!cache.has(kind)) cache.set(kind, SPRITES[kind]());
  return cache.get(kind);
}
