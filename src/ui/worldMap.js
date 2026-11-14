// 地方・地域を選ぶ地図（2026-11-14 企画者の注文：地方・地域の選択が味気ないので地図を用意する）。
// 4つの島（地方）を橋でつなぎ、地域をピンで出す。ピンの中はその地域のボスの絵（まだ開いていない地域は影）。
// 真ん中の霧の島は高難易度の「ツーイス未踏区域」（フェーズ9で作る。今は入れない）。
// 地図はポップな太い縁取りの絵（SVG）。押せるのはピン（data-pick）。
import { REGIONS, PROVINCES, HARD_AREA } from '../data/regions.js';
import { ENEMIES } from '../data/enemies.js';
import { spriteUrl } from './spriteImage.js';

const INK = '#2a2238';

// 地域のピンの位置（地図は 1000×640）
export const PIN = {
  grassland: [130, 515], forest: [250, 450], desert: [365, 525],
  river: [625, 520], storm: [745, 455], sea: [860, 525],
  volcano: [860, 215], snow: [760, 120], mixed: [635, 200],
  sanctuary: [365, 200], boundary: [250, 115], castle: [130, 205],
};
// 島の形（点をなめらかにつなぐ）
const ISLAND = {
  p4: { fill: '#dccff5', label: [250, 30], pts: [[80, 90], [180, 52], [300, 58], [420, 80], [452, 170], [432, 268], [330, 305], [200, 300], [90, 282], [50, 182]] },
  p3: { fill: '#ecd8ba', label: [750, 30], pts: [[565, 82], [680, 48], [820, 55], [930, 92], [955, 190], [922, 288], [800, 305], [660, 300], [566, 260], [548, 160]] },
  p1: { fill: '#bde99d', label: [250, 622], pts: [[72, 420], [180, 388], [320, 392], [440, 420], [456, 510], [420, 588], [290, 606], [160, 602], [72, 568], [46, 490]] },
  p2: { fill: '#bfe8dc', label: [750, 622], pts: [[562, 418], [700, 388], [840, 392], [944, 430], [958, 520], [910, 592], [770, 608], [640, 600], [562, 568], [546, 490]] },
};
const HARD_PTS = [[468, 324], [500, 314], [534, 325], [542, 352], [530, 380], [500, 388], [470, 380], [458, 352]];

/** 点をなめらかにつないだ閉じた形（Catmull-Rom を3次ベジェにする） */
function smooth(pts) {
  const n = pts.length;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return `${d} Z`;
}

const bossOf = (regionId) => ENEMIES[[...new Set(REGIONS[regionId].waves.flat().map((g) => g.enemy))].find((e) => ENEMIES[e].boss)].monster;

// ---------- 島の飾り ----------
const tree = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><rect x="-2.5" y="2" width="5" height="9" fill="#8f5f34" stroke="${INK}" stroke-width="2"/><circle r="10" fill="#5fae4a" stroke="${INK}" stroke-width="2.5"/><circle cx="-3" cy="-3" r="3.5" fill="#9fdc63"/></g>`;
const mountain = (x, y, w, h, fill, cap) =>
  `<path d="M${x - w},${y} L${x},${y - h} L${x + w},${y} Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
  (cap ? `<path d="M${x - w * 0.36},${y - h * 0.64} L${x},${y - h} L${x + w * 0.36},${y - h * 0.64} L${x + w * 0.14},${y - h * 0.56} L${x},${y - h * 0.66} L${x - w * 0.16},${y - h * 0.56} Z" fill="${cap}"/>` : '');
const tuft = (x, y) => `<path d="M${x - 5},${y} q2,-7 4,0 q2,-9 4,0 q2,-6 4,0" fill="none" stroke="#5fae4a" stroke-width="2.5" stroke-linecap="round"/>`;

function decorations() {
  const out = [];
  // ミルト王国：平原の草、森の木、砂漠の砂
  for (const [x, y] of [[95, 470], [170, 560], [80, 540], [205, 500], [120, 590]]) out.push(tuft(x, y));
  out.push(`<ellipse cx="365" cy="545" rx="72" ry="42" fill="#f3d98f" stroke="${INK}" stroke-width="2.5" stroke-dasharray="6 5"/>`);
  out.push(`<path d="M318,560 q14,-12 28,0 M368,570 q14,-12 28,0 M340,528 q12,-10 24,0" fill="none" stroke="#d9a76a" stroke-width="3" stroke-linecap="round"/>`);
  for (const [x, y, s] of [[205, 425, 1], [228, 405, 0.9], [290, 418, 1], [300, 470, 0.85], [205, 470, 0.85], [270, 495, 0.8]]) out.push(tree(x, y, s));
  // べジブ共和国：川、雷雲、海
  out.push(`<path d="M590,392 C610,430 580,460 610,490 S650,560 625,606" fill="none" stroke="#4699de" stroke-width="12" stroke-linecap="round"/><path d="M590,392 C610,430 580,460 610,490 S650,560 625,606" fill="none" stroke="#82cbf6" stroke-width="5" stroke-linecap="round"/>`);
  out.push(`<g transform="translate(745,402)"><ellipse cx="0" cy="0" rx="34" ry="16" fill="#8a8fa6" stroke="${INK}" stroke-width="3"/><ellipse cx="-14" cy="-8" rx="16" ry="12" fill="#a6abc0"/><path d="M-4,12 l8,0 l-5,9 l7,0 l-14,17 l4,-12 l-6,0 z" fill="#ffe45a" stroke="${INK}" stroke-width="2"/></g>`);
  out.push(`<path d="M905,470 C960,480 965,560 905,585 C860,600 830,570 850,545 C870,520 860,480 905,470 Z" fill="#82cbf6" stroke="${INK}" stroke-width="2.5"/><path d="M870,540 q8,-6 16,0 q8,6 16,0" fill="none" stroke="#fff" stroke-width="2.5"/>`);
  // フツルー山脈：火山、雪山、混ざった山
  out.push(mountain(860, 245, 52, 70, '#a97543', null));
  out.push(`<path d="M846,182 L874,182 L868,175 L852,175 Z" fill="#ff6a2a" stroke="${INK}" stroke-width="2"/><circle cx="870" cy="160" r="8" fill="#d6d0e0"/><circle cx="880" cy="148" r="6" fill="#e6e0ee"/>`);
  out.push(mountain(760, 150, 58, 80, '#91d6ea', '#ffffff'));
  out.push(mountain(700, 140, 36, 50, '#a97543', '#ffffff'));
  out.push(`<path d="M590,232 L635,165 L680,232 Z" fill="#ff9b52" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M635,165 L680,232 L635,232 Z" fill="#cbf3fb"/><path d="M590,232 L635,165 L680,232 Z" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`);
  out.push(mountain(905, 120, 30, 40, '#a97543', '#ffffff'));
  // フィラッシュ混沌地：聖域の光、境界（光と闇に半分ずつ）、魔王城
  out.push(`<circle cx="365" cy="215" r="48" fill="#fff6c8" stroke="${INK}" stroke-width="2.5" stroke-dasharray="5 5"/>`);
  for (const x of [335, 395]) out.push(`<rect x="${x - 5}" y="185" width="10" height="34" fill="#fffef2" stroke="${INK}" stroke-width="2.5"/>`);
  out.push(`<path d="M250,62 A52,52 0 0 0 250,166 Z" fill="#fff2a6" stroke="${INK}" stroke-width="2.5"/><path d="M250,62 A52,52 0 0 1 250,166 Z" fill="#6b4aa9" stroke="${INK}" stroke-width="2.5"/>`);
  out.push(`<g transform="translate(130,240)"><path d="M-38,0 L-38,-34 L-30,-34 L-30,-42 L-22,-42 L-22,-34 L-10,-34 L-10,-52 L-4,-60 L4,-60 L10,-52 L10,-34 L22,-34 L22,-42 L30,-42 L30,-34 L38,-34 L38,0 Z" fill="#43307a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="-6" y="-16" width="12" height="16" fill="#1d1a2a"/><circle cx="0" cy="-44" r="3" fill="#ff7ad9"/></g>`);
  return out.join('');
}

/** 地域を順につなぐ道（点線）。橋をわたる */
function route() {
  const ids = ['grassland', 'forest', 'desert', 'river', 'storm', 'sea', 'volcano', 'snow', 'mixed', 'sanctuary', 'boundary', 'castle'];
  const pts = ids.map((id) => PIN[id]);
  return `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 14" opacity="0.95"/>`;
}

function bridge(x1, y1, x2, y2) {
  const horizontal = y1 === y2;
  const len = horizontal ? x2 - x1 : y2 - y1;
  const planks = [];
  for (let t = 6; t < len; t += 12)
    planks.push(horizontal ? `<line x1="${x1 + t}" y1="${y1 - 11}" x2="${x1 + t}" y2="${y1 + 11}" stroke="${INK}" stroke-width="2"/>` : `<line x1="${x1 - 11}" y1="${y1 + t}" x2="${x1 + 11}" y2="${y1 + t}" stroke="${INK}" stroke-width="2"/>`);
  const rect = horizontal ? `x="${x1}" y="${y1 - 12}" width="${len}" height="24"` : `x="${x1 - 12}" y="${y1}" width="24" height="${len}"`;
  return `<rect ${rect} fill="#c08a52" stroke="${INK}" stroke-width="3" rx="4"/>${planks.join('')}`;
}

/**
 * 地図の SVG。opts = { isOpen(id), isCleared(id), selected }
 */
export function worldMapSvg({ isOpen, isCleared, selected }) {
  const hardIds = HARD_AREA.regions;
  const hardOpen = isOpen(hardIds[0]);
  const hardCleared = hardIds.filter(isCleared).length;
  const hardSel = hardIds.includes(selected);
  const islands = PROVINCES.map((p) => {
    const is = ISLAND[p.id];
    const [lx, ly] = is.label;
    const w = p.name.length * 17 + 40;
    return `<path d="${smooth(is.pts)}" fill="${is.fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <g class="map-label"><rect x="${lx - w / 2}" y="${ly - 17}" width="${w}" height="32" rx="16" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <text x="${lx}" y="${ly + 6}" text-anchor="middle" font-size="17" font-weight="bold" fill="${INK}">${p.name}</text></g>`;
  }).join('');
  const pins = Object.entries(PIN)
    .map(([id, [x, y]]) => {
      const open = isOpen(id);
      const cleared = isCleared(id);
      const sel = selected === id;
      const url = spriteUrl(bossOf(id), open ? 'ally' : 'silhouette');
      const name = REGIONS[id].name;
      const w = name.length * 13 + 18;
      return `<g class="pin ${open ? '' : 'locked'} ${sel ? 'sel' : ''}" data-pick="${id}" transform="translate(${x},${y})">
        ${sel ? `<circle r="36" fill="none" stroke="#ff78a6" stroke-width="5" class="pin-ring"/>` : ''}
        <circle r="28" fill="${open ? '#fff' : '#e4e0ea'}" stroke="${INK}" stroke-width="4"/>
        ${url ? `<image href="${url}" x="-24" y="-26" width="48" height="48" style="image-rendering:pixelated" opacity="${open ? 1 : 0.7}"/>` : ''}
        ${cleared ? `<path transform="translate(22,-22)" d="M0,-11 L3.2,-3.5 L11,-3.4 L4.8,1.6 L7,9.5 L0,5 L-7,9.5 L-4.8,1.6 L-11,-3.4 L-3.2,-3.5 Z" fill="#ffd84d" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` : ''}
        <rect x="${-w / 2}" y="32" width="${w}" height="24" rx="12" fill="${open ? '#fff' : '#e4e0ea'}" stroke="${INK}" stroke-width="2.5"/>
        <text y="49" text-anchor="middle" font-size="13" font-weight="bold" fill="${open ? INK : '#8a7ea0'}">${name}</text>
      </g>`;
    })
    .join('');
  // まん中の霧の島：ツーイス未踏区域（サーモルン魔王城を攻略すると開く。押すと10の区域を右に出す）
  const hard = `<g class="pin hard-island ${hardOpen ? '' : 'locked'} ${hardSel ? 'sel' : ''}" data-pick="hard">
      ${hardSel ? `<path d="${smooth(HARD_PTS)}" fill="none" stroke="#ff78a6" stroke-width="10" class="pin-ring"/>` : ''}
      <path d="${smooth(HARD_PTS)}" fill="${hardOpen ? '#cfc2f0' : '#d8d6e2'}" stroke="${INK}" stroke-width="4" stroke-dasharray="${hardOpen ? '0' : '10 6'}"/>
      <ellipse cx="490" cy="345" rx="26" ry="10" fill="#fff" opacity="0.8"/><ellipse cx="512" cy="365" rx="20" ry="8" fill="#fff" opacity="0.7"/>
      <text x="500" y="362" text-anchor="middle" font-size="${hardOpen ? 18 : 30}" font-weight="bold" fill="${hardOpen ? INK : '#8a7ea0'}">${hardOpen ? `${hardCleared}/${hardIds.length}` : '？'}</text>
      <rect x="436" y="396" width="128" height="22" rx="11" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <text x="500" y="411" text-anchor="middle" font-size="12" font-weight="bold" fill="#6b5f80">${HARD_AREA.name}</text>
    </g>`;
  const waves = [];
  for (const [x, y] of [[40, 340], [150, 350], [880, 345], [960, 360], [460, 610], [520, 40], [40, 620], [960, 20]]) waves.push(`<path d="M${x - 14},${y} q7,-7 14,0 q7,7 14,0" fill="none" stroke="#e4f6ff" stroke-width="3" stroke-linecap="round"/>`);
  return `<svg class="world-map" viewBox="0 0 1000 640" role="img" aria-label="地方と地域の地図">
    <rect width="1000" height="640" rx="24" fill="#9fd8f5"/>
    ${waves.join('')}
    ${bridge(452, 505, 548, 505)}${bridge(860, 300, 860, 395)}${bridge(452, 180, 548, 180)}
    ${islands}${hard}${decorations()}${route()}${pins}
  </svg>`;
}
