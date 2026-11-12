// 地域マップを canvas に描く。
import { ELEMENT } from '../data/elements.js';
import { MONSTERS } from '../data/monsters.js';
import { FACILITIES } from '../data/facilities.js';
import { ENEMIES } from '../data/enemies.js';
import { pointOnPath } from '../core/map.js';
import { footprintOf, targetsOf } from '../core/layout.js';
import { cellsOf, rotate } from '../core/shape.js';
import { spriteCanvas } from './spriteImage.js';

export const CELL = 32;

const FACILITY_ICON = { beam: '光', sword: '剣', flag: '旗', horn: '笛', smithy: '鍛', carry: '◆', fog: '霧', tower: '雷', brazier: '火', icicle: '氷', altar: '光', darktower: '闇' };
export const facilityIcon = (kind) => FACILITY_ICON[kind] ?? '施';
export const FACILITY_COLOR = { combat: '#f0d9a7', progress: '#c9a7f0', production: '#a7d8f0', carry: '#e0e0e0' };

/**
 * view = { map, battle, layout, resolved, hover:{x,y}|null,
 *          ghost: { item, ok } | null（置こうとしているもの）, focus: item | null（範囲を見せるもの） }
 */
export function draw(ctx, view) {
  const { map, layout, resolved } = view;
  ctx.save();
  ctx.clearRect(0, 0, map.w * CELL, map.h * CELL);
  drawGround(ctx, map, view.ground);
  // 地域の資源地と、研究で持ち込んだ資源地
  const carried = layout.facilities.filter((f) => f.kind === 'carry').map((f) => ({ x: f.x, y: f.y, element: f.element, carried: true, off: resolved.status.get(f.id) !== 'active' }));
  drawNodes(ctx, [...map.nodes, ...carried], view.nodeYield ?? resolved.prod.perNode);
  drawBase(ctx, map, view.battle);

  // 製造施設の作業場所
  for (const f of layout.facilities) {
    for (const c of cellsOf(FACILITIES[f.kind].shape, f.x, f.y, f.dir, 'work')) {
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(167,216,240,0.9)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(c.x * CELL + 2.5, c.y * CELL + 2.5, CELL - 5, CELL - 5);
      ctx.setLineDash([]);
    }
  }

  if (view.focus) drawTargets(ctx, view.focus, 'rgba(143,184,255,0.28)', 'rgba(143,184,255,0.9)');

  for (const f of layout.facilities) if (f.kind !== 'carry') drawFacility(ctx, f, resolved.status.get(f.id));
  for (const m of layout.monsters) drawMonster(ctx, m, resolved.units.find((u) => u.owner === m.uid), resolved.working.has(m.uid));

  if (view.ghost) {
    const { item, ok } = view.ghost;
    drawTargets(ctx, item, ok ? 'rgba(255,255,255,0.18)' : 'rgba(255,90,90,0.15)', ok ? 'rgba(255,255,255,0.8)' : 'rgba(255,90,90,0.8)');
    ctx.globalAlpha = 0.65;
    if (item.uid) drawMonster(ctx, item, null, false);
    else if (item.kind === 'carry') drawNodes(ctx, [{ ...item, carried: true }], new Map());
    else drawFacility(ctx, item, 'active');
    ctx.globalAlpha = 1;
    if (!ok) for (const c of footprintOf(item)) cross(ctx, c.x, c.y);
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

// 地面の色（地域の ground）：[市松の2色, 道の色]
const GROUND = {
  grass: ['#5d9a4c', '#62a050', '#d9c08b'],
  forest: ['#3f7a3a', '#43803e', '#b89a6a'],
  sand: ['#d8bf86', '#dcc48c', '#b9915a'],
  river: ['#5a9a56', '#5f9f5a', '#c9b089'],
  storm: ['#4f5d58', '#54635d', '#8f8a7a'],
  sea: ['#e2cf98', '#e6d49e', '#c2a46e'],
  volcano: ['#4a3a34', '#4f3e37', '#7a5a4a'],
  snow: ['#dfe7ec', '#e6edf1', '#aab8c2'],
  mixed: ['#6b6670', '#706b75', '#9a8f86'],
  holy: ['#e9dfbd', '#eee5c6', '#c4b07e'],
  boundary: ['#67647e', '#6c6983', '#a39fb8'],
  castle: ['#3a3240', '#3f3745', '#6a5d6e'],
};

function drawGround(ctx, map, ground = 'grass') {
  const [g1, g2, road] = GROUND[ground] ?? GROUND.grass;
  for (let y = 0; y < map.h; y++) {
    for (let x = 0; x < map.w; x++) {
      const t = map.cells[y][x];
      const px = x * CELL;
      const py = y * CELL;
      ctx.fillStyle = (x + y) % 2 ? g1 : g2;
      ctx.fillRect(px, py, CELL, CELL);
      if (t === 'path') {
        ctx.fillStyle = road;
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = 'rgba(120,90,50,0.12)';
        ctx.fillRect(px + 4, py + 4, CELL - 8, CELL - 8);
      } else if (t === 'water') {
        ctx.fillStyle = '#3f86c4';
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(px + 6, py + 10, 12, 2);
      } else if (t === 'lava') {
        ctx.fillStyle = '#c4421f';
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = 'rgba(255,200,80,0.55)';
        ctx.fillRect(px + 5, py + 8, 10, 3);
        ctx.fillRect(px + 16, py + 20, 9, 3);
      } else if (t === 'rock') {
        ctx.fillStyle = '#8b7d6b';
        ctx.beginPath();
        ctx.moveTo(px + 5, py + 26);
        ctx.lineTo(px + 10, py + 9);
        ctx.lineTo(px + 21, py + 6);
        ctx.lineTo(px + 28, py + 18);
        ctx.lineTo(px + 26, py + 27);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(px + 12, py + 10, 6, 3);
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
  // マス目の線（範囲をマスで数えやすくする）
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 1; x < map.w; x++) {
    ctx.moveTo(x * CELL + 0.5, 0);
    ctx.lineTo(x * CELL + 0.5, map.h * CELL);
  }
  for (let y = 1; y < map.h; y++) {
    ctx.moveTo(0, y * CELL + 0.5);
    ctx.lineTo(map.w * CELL, y * CELL + 0.5);
  }
  ctx.stroke();
  for (const s of map.starts ?? [map.start]) {
    ctx.fillStyle = 'rgba(160,40,40,0.55)';
    ctx.fillRect(s.x * CELL, s.y * CELL, CELL, CELL);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶', s.x * CELL + CELL / 2, s.y * CELL + CELL / 2);
  }
}

function drawNodes(ctx, nodes, perNode) {
  for (const n of nodes) {
    const cx = n.x * CELL + CELL / 2;
    const cy = n.y * CELL + CELL / 2;
    const alpha = ctx.globalAlpha;
    if (n.off) ctx.globalAlpha *= 0.4;
    if (n.carried) {
      // 持ち込んだ資源地：点線の枠で地域の資源地と見分ける
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(n.x * CELL + 1.5, n.y * CELL + 1.5, CELL - 3, CELL - 3);
      ctx.setLineDash([]);
    }
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
    ctx.globalAlpha = alpha;
    if (n.off) label(ctx, 'OFF', cx, cy + 12);
    const y = perNode.get(`${n.x},${n.y}`);
    if (y) label(ctx, `+${y}`, cx + 10, cy - 11);
  }
}

function label(ctx, text, x, y) {
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

// 拠点が2か所あっても、拠点の耐久は1つ（両方に同じ数を出す）
function drawBase(ctx, map, battle) {
  for (const b of map.bases ?? [map.base]) drawOneBase(ctx, b, battle);
}

function drawOneBase(ctx, b, battle) {
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

/** 攻撃・効果の範囲のマスを塗る。 */
function drawTargets(ctx, item, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  for (const c of targetsOf(item)) {
    ctx.fillRect(c.x * CELL, c.y * CELL, CELL, CELL);
    ctx.strokeRect(c.x * CELL + 0.5, c.y * CELL + 0.5, CELL - 1, CELL - 1);
  }
}

/** 向きの印（前の辺に小さな三角）。 */
function facing(ctx, cx, cy, dir, r) {
  const [fx, fy] = rotate([0, -1], dir);
  const [sx, sy] = [-fy, fx];
  const tipX = cx + fx * (r + 6);
  const tipY = cy + fy * (r + 6);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1b1b1b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(cx + fx * (r + 1) + sx * 5, cy + fy * (r + 1) + sy * 5);
  ctx.lineTo(cx + fx * (r + 1) - sx * 5, cy + fy * (r + 1) - sy * 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawMonster(ctx, m, unit, working) {
  const def = MONSTERS[m.kind];
  const cx = m.x * CELL + CELL / 2;
  const cy = m.y * CELL + CELL / 2;
  // 絵は左向きに描いてあるので、右を向いているときは左右を反転する
  const [fx] = rotate([0, -1], m.dir ?? 'up');
  const img = spriteCanvas(m.kind, 'ally', fx > 0);
  if (img) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, m.x * CELL, m.y * CELL, CELL, CELL);
  } else {
    ctx.fillStyle = ELEMENT[def.element].color;
    ctx.strokeStyle = '#1b1b1b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1b1b1b';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.name[0], cx, cy + 1);
  }
  facing(ctx, cx, cy, m.dir, 11);
  if (working) label(ctx, '作業', cx, cy + 12);
  if (unit?.buffed.sword) mark(ctx, cx - 11, cy - 11, '#ffd36b');
  if (unit?.buffed.flag) mark(ctx, cx + 11, cy - 11, '#9ff0b0');
}

function mark(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#1b1b1b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

const STATUS_TEXT = { materials: '資材不足', 'no-worker': '作業なし', 'needs-smithy': '鍛冶場停止' };

function drawFacility(ctx, f, status) {
  const def = FACILITIES[f.kind];
  const cells = footprintOf(f);
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const x0 = Math.min(...xs) * CELL + 4;
  const y0 = Math.min(...ys) * CELL + 4;
  const w = (Math.max(...xs) + 1) * CELL - 4 - x0;
  const h = (Math.max(...ys) + 1) * CELL - 4 - y0;
  const stopped = status && status !== 'active';
  ctx.globalAlpha *= stopped ? 0.5 : 1;
  ctx.fillStyle = FACILITY_COLOR[def.type];
  ctx.strokeStyle = '#1b1b1b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x0, y0, w, h, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1b1b1b';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(facilityIcon(f.kind), x0 + w / 2, y0 + h / 2 + 1);
  ctx.globalAlpha = ctx.globalAlpha / (stopped ? 0.5 : 1);
  // 向きに意味のある施設（範囲や作業場所がある）だけ向きの印を出す
  if (def.shape.length > 1) facing(ctx, x0 + w / 2, y0 + h / 2, f.dir, ['left', 'right'].includes(f.dir) ? w / 2 : h / 2);
  if (stopped) label(ctx, STATUS_TEXT[status] ?? '停止', x0 + w / 2, y0 + h - 2);
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

function drawEnemies(ctx, map, battle) {
  for (const e of battle.enemies) {
    const def = ENEMIES[e.kind];
    const route = map.routes?.[e.route ?? 0] ?? map.path;
    const p = pointOnPath(route, e.dist);
    // 敵も名簿のモンスターの絵。大きさは同じで、縁取りの色とオーラで分ける。進む向きに合わせて左右を反転
    const ahead = pointOnPath(route, e.dist + 0.3);
    const img = spriteCanvas(def.monster, def.boss ? 'boss' : def.elite ? 'elite' : 'enemy', ahead.x - p.x > 0.05);
    let r = def.size * CELL;
    if (img) {
      r = CELL / 2;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, p.x * CELL - r, p.y * CELL - r, CELL, CELL);
    } else {
      ctx.fillStyle = ELEMENT[def.element].color;
      ctx.strokeStyle = def.boss ? '#8a0000' : def.elite ? '#7a4a00' : '#3a1010';
      ctx.lineWidth = def.boss || def.elite ? 3 : 2;
      ctx.beginPath();
      ctx.arc(p.x * CELL, p.y * CELL, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (def.boss) label(ctx, '王', p.x * CELL, p.y * CELL - r - 12);
    const w = Math.max(16, r * 2);
    ctx.fillStyle = '#300';
    ctx.fillRect(p.x * CELL - w / 2, p.y * CELL - r - 6, w, 3);
    ctx.fillStyle = '#ff6b5b';
    ctx.fillRect(p.x * CELL - w / 2, p.y * CELL - r - 6, (w * Math.max(0, e.hp)) / e.maxHp, 3);
  }
}
