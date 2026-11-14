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

test('施設の絵：どの施設にも絵があり、大きさは施設のマス（上を向いたとき）×32。縁取りは palette[1]', async () => {
  const { FACILITIES, FACILITY_ORDER } = await import('../src/data/facilities.js');
  const { drawFacilitySprite } = await import('../src/art/facility.js');
  const { parseShape } = await import('../src/core/shape.js');
  for (const kind of FACILITY_ORDER) {
    const s = drawFacilitySprite(kind);
    assert.ok(s, `${kind} の絵がある`);
    const fp = parseShape(FACILITIES[kind].shape).footprint;
    const w = Math.max(...fp.map(([x]) => x)) - Math.min(...fp.map(([x]) => x)) + 1;
    const h = Math.max(...fp.map(([, y]) => y)) - Math.min(...fp.map(([, y]) => y)) + 1;
    assert.equal(s.w, w * 32, `${kind} の横`);
    assert.equal(s.h, h * 32, `${kind} の縦`);
    assert.equal(s.grid.length, s.w * s.h);
    assert.equal(s.palette[1], OUTLINE);
    assert.ok(s.grid.filter((v) => v === 1).length > 20, `${kind} は縁取りがある`);
  }
});

test('資源地の絵：9属性すべてに32×32の絵があり、縁取りは palette[1]', async () => {
  const { drawNodeSprite } = await import('../src/art/node.js');
  const { ELEMENT_IDS } = await import('../src/data/elements.js');
  for (const el of ELEMENT_IDS) {
    const s = drawNodeSprite(el);
    assert.ok(s, el);
    assert.equal(s.w, 32);
    assert.equal(s.h, 32);
    assert.equal(s.palette[1], OUTLINE);
  }
});
