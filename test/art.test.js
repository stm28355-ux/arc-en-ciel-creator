import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MONSTERS } from '../src/data/monsters.js';
import { SPRITES, drawSprite } from '../src/art/sprites.js';
import { OUTLINE } from '../src/art/kit.js';

test('モンスターの絵：どのモンスターにも32×32の絵がある。縁取りは palette[1]', () => {
  for (const kind of Object.keys(MONSTERS)) {
    const s = drawSprite(kind);
    assert.ok(s, `${kind} の絵がない`);
    assert.equal(s.size, 32, kind);
    assert.equal(s.grid.length, 32 * 32, kind);
    assert.equal(s.palette[1], OUTLINE, `${kind} の縁取り`);
    assert.ok(s.grid.every((v) => Number.isInteger(v) && v >= 0 && v < s.palette.length), `${kind} の色の番号`);
    const used = s.grid.filter((v) => v !== 0).length;
    assert.ok(used > 120, `${kind} の絵が小さすぎる（${used}ドット）`);
    assert.ok(s.grid.includes(1), `${kind} に縁取りがない`);
  }
  for (const kind of Object.keys(SPRITES)) assert.ok(MONSTERS[kind], `${kind} はモンスターにいない`);
});
