// 地域マップを canvas に描く。
import { ELEMENT } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { FACILITIES } from '../data/facilities.js';
import { ENEMIES } from '../data/enemies.js';
import { pointOnPath } from '../core/map.js';

export const CELL = 32;

const FACILITY_ICON = { beam: '光', sword: '剣', flag: '旗', horn: '笛' };
export const facilityIcon = (kind) => FACILITY_ICON[kind] ?? '施';

/**
 * view = {
 *   map, battle, monsters:[{uid,kind,x,y}], facilities:[{id,kind,x,y}], stopped:Set,
 *   units, nodeYield: Map<'x,y', number>, hover:{x,y}|null, ghost:{x,y,range,ok,label,color,square}|null,
 *   focus:{x,y,range}|null
 * }
 */
export function draw(ctx, view) {
  const { map } = view;
  ctx.save();
  ctx.clearRect(0, 0, map.w * CELL, map.h * CELL);
  drawGround(ctx, map);
  drawNodes(ctx, map, view.nodeYield);
  drawBase(ctx, map, view.battle);

  if (view.focus) drawRange(ctx, view.focus, 'rgba(143,184,255,0.16)', 'rgba(143,184,255,0.7)');

  for (const f of view.facilities) drawFacility(ctx, f, view.stopped.has(f.id));
  for (const m of view.monsters) drawMonster(ctx, m, view.units.find((u) => u.id === m.uid));

  if (view.ghost) {
    const g = view.ghost;
    if (g.range) drawRange(ctx, g, g.ok ? 'rgba(255,255,255,0.10)' : 'rgba(255,90,90,0.10)', g.ok ? 'rgba(255,255,255,0.6)' : 'rgba(255,90,90,0.7)');
    ctx.globalAlpha = 0.6;
    token(ctx, g.x, g.y, g.color, g.label, g.square);
    ctx.globalAlpha = 1;
    if (!g.ok) cross(ctx, g.x, g.y);
  }
  if (view.hover && !view.ghost) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.strokeRect(view.hover.x * CELL + 0.5, view.hover.y * CELL + 0.5, CELL - 1, CELL - 1);
  }

  drawEnemies(ctx, map, view.battle);
  for (const e of view.battle.effects) {
    ctx.strokeStyle = ELEMENT[e.element].color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.min(1, e.life / 0.12);
    ctx.beginPath();
    ctx.moveTo(e.from.x * CELL, e.from.y * CELL);
    ctx.lineTo(e.to.x * CELL, e.to.y * CELL);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawGround(ctx, map) {
  for (let y = 0; y < map.h; y++) {
    for (let x = 0; x < map.w; x++) {
      const t = map.cells[y][x];
      const px = x * CELL;
      const py = y * CELL;
      ctx.fillStyle = (x + y) % 2 ? '#5d9a4c' : '#62a050';
      ctx.fillRect(px, py, CELL, CELL);
      if (t === 'path') {
        ctx.fillStyle = '#d9c08b';
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = 'rgba(120,90,50,0.12)';
        ctx.fillRect(px + 4, py + 4, CELL - 8, CELL - 8);
      } else if (t === 'water') {
        ctx.fillStyle = '#3f86c4';
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(px + 6, py + 10, 12, 2);
      } else if (t === 'tree') {
        ctx.fillStyle = '#6b4a2b';
        ctx.fillRect(px + 14, py + 18, 4, 10);
        ctx.fillStyle = '#2f6b33';
        ctx.beginPath();
        ctx.arc(px + 16, py + 14, 11, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // 出てくる所
  const s = map.start;
  ctx.fillStyle = 'rgba(160,40,40,0.55)';
  ctx.fillRect(s.x * CELL, s.y * CELL, CELL, CELL);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▶', s.x * CELL + CELL / 2, s.y * CELL + CELL / 2);
}

function drawNodes(ctx, map, nodeYield) {
  for (const n of map.nodes) {
    const cx = n.x * CELL + CELL / 2;
    const cy = n.y * CELL + CELL / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(n.x * CELL, n.y * CELL, CELL, CELL);
    ctx.fillStyle = ELEMENT[n.element].color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx + 12, cy);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 12, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ELEMENT[n.element].name, cx, cy + 1);
    const y = nodeYield.get(`${n.x},${n.y}`);
    if (y) {
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(`+${y}`, cx + 10, cy - 11);
      ctx.fillText(`+${y}`, cx + 10, cy - 11);
    }
  }
}

function drawBase(ctx, map, battle) {
  const b = map.base;
  const px = b.x * CELL;
  const py = b.y * CELL;
  ctx.fillStyle = '#8a8fa8';
  ctx.fillRect(px + 3, py + 6, CELL - 6, CELL - 8);
  ctx.fillStyle = '#5b6077';
  for (let i = 0; i < 3; i++) ctx.fillRect(px + 3 + i * 10, py + 2, 6, 6);
  ctx.fillStyle = battle.baseHp <= 1 ? '#ff7b6b' : '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${battle.baseHp}`, px + CELL / 2, py + CELL / 2 + 3);
}

function drawRange(ctx, c, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc((c.x + 0.5) * CELL, (c.y + 0.5) * CELL, c.range * CELL, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function token(ctx, x, y, color, label, square) {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#1b1b1b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (square) ctx.roundRect(cx - 12, cy - 12, 24, 24, 4);
  else ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1b1b1b';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1);
}

function cross(ctx, x, y) {
  ctx.strokeStyle = '#ff5a5a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x * CELL + 6, y * CELL + 6);
  ctx.lineTo(x * CELL + CELL - 6, y * CELL + CELL - 6);
  ctx.moveTo(x * CELL + CELL - 6, y * CELL + 6);
  ctx.lineTo(x * CELL + 6, y * CELL + CELL - 6);
  ctx.stroke();
}

function drawMonster(ctx, m, unit) {
  const def = MONSTERS[m.kind];
  token(ctx, m.x, m.y, ELEMENT[def.element].color, def.name[0], false);
  // 施設の効果がのっている印
  if (unit?.buffed.sword) mark(ctx, m.x, m.y, -1, '#ffd36b');
  if (unit?.buffed.flag) mark(ctx, m.x, m.y, 1, '#9ff0b0');
}

function mark(ctx, x, y, side, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#1b1b1b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x * CELL + CELL / 2 + side * 11, y * CELL + 5, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawFacility(ctx, f, stopped) {
  const def = FACILITIES[f.kind];
  const color = def.type === 'progress' ? '#c9a7f0' : '#f0d9a7';
  ctx.globalAlpha = stopped ? 0.45 : 1;
  token(ctx, f.x, f.y, color, facilityIcon(f.kind), true);
  ctx.globalAlpha = 1;
  if (stopped) {
    ctx.fillStyle = '#ff5a5a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('停止', f.x * CELL + CELL / 2, f.y * CELL + CELL - 2);
  }
}

function drawEnemies(ctx, map, battle) {
  for (const e of battle.enemies) {
    const def = ENEMIES[e.kind];
    const p = pointOnPath(map.path, e.dist);
    const r = def.size * CELL;
    ctx.fillStyle = ELEMENT[def.element].color;
    ctx.strokeStyle = '#3a1010';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x * CELL, p.y * CELL, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 目
    ctx.fillStyle = '#3a1010';
    ctx.fillRect(p.x * CELL - r * 0.4, p.y * CELL - r * 0.2, 2, 3);
    ctx.fillRect(p.x * CELL + r * 0.3, p.y * CELL - r * 0.2, 2, 3);
    // HP
    const w = Math.max(16, r * 2);
    ctx.fillStyle = '#300';
    ctx.fillRect(p.x * CELL - w / 2, p.y * CELL - r - 6, w, 3);
    ctx.fillStyle = '#ff6b5b';
    ctx.fillRect(p.x * CELL - w / 2, p.y * CELL - r - 6, (w * Math.max(0, e.hp)) / e.maxHp, 3);
  }
}
