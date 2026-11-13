// 地域を画面なしで最後まで流して、結果を表示する（調整の確認用）。
//   node tools/sim-region.mjs            全部の地域：調整の基準の仲間が、目標のレベルの5つ下と目標のレベルでどうなるか
//   node tools/sim-region.mjs forest     森だけ
//   node tools/sim-region.mjs samples    手で置いた第1地方の見本（テストで使う）
import { pathToFileURL } from 'node:url';
import { REGIONS } from '../src/data/regions.js';
import { parseMap } from '../src/core/map.js';
import { resolveLayout, canPlace, targetsOf, footprintOf, skillList } from '../src/core/layout.js';
import { yieldFrom } from '../src/core/materials.js';
import { DIRS, keyOf, cellsOf } from '../src/core/shape.js';
import { atkAt } from '../src/core/alchemy.js';
import { ATTACK_PER_LEVEL, FACILITY_PER_LEVEL, facilityAtkMulAt } from '../src/data/research.js';
import { MONSTERS } from '../src/data/monsters.js';
import { FACILITIES } from '../src/data/facilities.js';
import { createBattle, startBattle, step, pace } from '../src/core/battle.js';
import { bagTotal } from '../src/data/elements.js';

const M = (uid, kind, x, y, dir, level = 1) => ({ uid, kind, x, y, dir, level });
const F = (id, kind, x, y, dir) => ({ id, kind, x, y, dir });
const at = (list, level) => list.map((m) => ({ ...m, level }));

// ---------- 草原：無と風のモンスターだけ（土は森から） ----------
const GRASS_TEAM = [
  M('m1', 'slime', 5, 6, 'right'), // 無の資源地のとなり、道を3マス
  M('m2', 'sprite', 12, 9, 'right'), // 無の資源地のとなり、道を5マス
  M('m3', 'bat', 22, 9, 'up'), // 風の資源地のとなり、道を3マス
  M('m4', 'hawk', 21, 12, 'up'), // 道にそって6マス
  M('m5', 'slime', 15, 9, 'left'), // 無の資源地のとなり、道を3マス
];

// ---------- 森：草原のあとの仲間（無と風、融合で生まれたもの） ----------
const FOREST_TEAM = [
  M('m1', 'slime', 5, 9, 'right'), // 無の資源地のとなり
  M('m2', 'sprite', 11, 10, 'right'), // 風の資源地のとなり、道を5マス
  M('m3', 'bat', 18, 6, 'up'), // 道の角
  M('m4', 'hawk', 19, 14, 'up'), // 道にそって6マス
  M('m5', 'falcon', 13, 4, 'down'), // 道の角
  M('m6', 'hedgehog', 7, 11, 'up'),
];

// ---------- 砂漠：森のあとの仲間（土のモンスターも作れる） ----------
const DESERT_TEAM = [
  M('m1', 'golem', 8, 7, 'right'), // 道の角
  M('m2', 'turtle', 10, 3, 'left'), // 道の角
  M('m3', 'crab', 17, 6, 'right'),
  M('m4', 'lizard', 19, 10, 'left'), // 道にそって5マス、剣の台座の効果
  M('m5', 'eagle', 18, 14, 'up'), // 道にそって10マス
  M('m6', 'bat', 8, 9, 'up'),
  M('m7', 'hedgehog', 20, 11, 'up'), // 鍛冶場の作業場所
  M('m8', 'turtle', 22, 8, 'down'), // 土の資源地のとなり（資材）
  M('m9', 'slime', 24, 11, 'down'), // 無の資源地のとなり（資材）
];

// 手で置いた見本（施設の動きを確かめるテストで使う。強さの調整には下の STAGES を使う）
export const SAMPLES = {
  grassland: {
    'モンスターだけ': { monsters: GRASS_TEAM, facilities: [] },
    '光線塔＋旗': { monsters: GRASS_TEAM, facilities: [F('f1', 'beam', 22, 4, 'left'), F('f2', 'flag', 15, 7, 'down')] },
    // 草原には土がないので、角笛は研究で土の資源地を持ち込んだときだけ建てられる
    '角笛1個（土の資源地を持ち込み）': {
      monsters: GRASS_TEAM,
      facilities: [F('f1', 'beam', 22, 4, 'left'), { ...F('c1', 'carry', 6, 5, 'up'), element: 'earth' }, F('f2', 'horn', 0, 1, 'up')],
    },
  },
  forest: {
    '草原の仲間 Lv5＋光線塔・旗': { monsters: at(FOREST_TEAM, 5), facilities: [F('f1', 'beam', 19, 4, 'down'), F('f2', 'flag', 10, 11, 'up')] },
  },
  desert: {
    '森の仲間 Lv8＋鍛冶場・剣': { monsters: at(DESERT_TEAM, 8), facilities: [F('f1', 'smithy', 20, 12, 'up'), F('f2', 'sword', 20, 9, 'up')] },
  },
};

/**
 * 見本の配置を自動で作る（地域が増えて、手で置くのが大変なため）。
 * team = [{ kind, level, skills? }]：1体ずつ、道に届くマスの数＋資源地から入る資材×0.5 が一番多い場所・向きに置く
 *   道が複数ある地域では、すでに届いているマスほど点を下げて、どの道にも置くようにする（1マスの点 = 1 / (1 + 届いている数)）
 * facilities = [kind]：並べた順に置く
 *   攻撃する施設：道に届くマスが一番多い場所
 *   モンスターを強くする施設（剣・旗・風車・ポーション・秘伝書）：効果の範囲にいるモンスターの強さ（1秒あたりのダメージ）が一番大きい場所
 *   敵を遅くする・受けるダメージを増やす施設：モンスターの攻撃が届く道のマスに、一番多く重なる場所
 *   製造施設（鍛冶場・アトリエ・研究所）：作業するモンスター（extra.workers[種類]、なければそよかぜコウモリ）と一緒に、
 *     作業するモンスターの攻撃が道に一番多く届く場所に置く
 * extra：配置に足すもの（atkMul・facilityMul・facilityAtkMul など研究の効き目）。extra.carry = [属性] なら、その資源地を持ち込み、
 *   置いたモンスターから一番多く資材が入るマスに置く（資材の少ない第4地方用）
 */
export function autoLayout(regionId, team, facilities = [], { carry = [], workers = {}, nodeWeight = 0.5, ...extra } = {}) {
  const map = parseMap(REGIONS[regionId].map);
  const onPath = new Set(map.routes.flatMap((r) => r.map(keyOf)));
  const layout = { monsters: [], facilities: [] };
  const spread = map.routes.length > 1;
  const covered = new Map(); // マス → 届いているユニットの数
  const hitBy = new Map(); // 道のマス → そこに届くモンスターの技の数（遅くする・受けるダメージを増やす施設の点）
  const pathScore = (cells) => cells.filter((c) => onPath.has(keyOf(c))).reduce((sum, c) => sum + (spread ? 1 / (1 + (covered.get(keyOf(c)) ?? 0)) : 1), 0);
  const cover = (cells) => {
    for (const c of cells) if (onPath.has(keyOf(c))) covered.set(keyOf(c), (covered.get(keyOf(c)) ?? 0) + 1);
  };
  const level = team[0]?.level ?? 1;
  const dps = (m) => skillList(m).reduce((sum, k) => sum + atkAt(k, m.level) / MONSTERS[k].interval, 0);
  const addMonster = (m) => {
    layout.monsters.push(m);
    cover(targetsOf(m));
    for (const k of skillList(m))
      for (const c of cellsOf(MONSTERS[k].shape, m.x, m.y, m.dir, 'targets')) if (onPath.has(keyOf(c))) hitBy.set(keyOf(c), (hitBy.get(keyOf(c)) ?? 0) + 1);
  };
  const best = (make, score) => {
    let top = null;
    for (let y = 0; y < map.h; y++)
      for (let x = 0; x < map.w; x++)
        for (const dir of DIRS) {
          const item = make(x, y, dir);
          if (!item || !canPlace(map, layout, item)) continue;
          const sc = score(item);
          if (!top || sc > top.sc) top = { item, sc };
        }
    return top?.item;
  };
  const nodeYield = (m) => {
    const set = new Set(targetsOf(m).map(keyOf));
    return map.nodes.reduce((sum, n) => sum + yieldFrom({ x: m.x, y: m.y, element: MONSTERS[m.kind].element, targets: set }, n), 0);
  };
  team.forEach(({ kind, level: lv, skills }, i) => {
    const item = best(
      (x, y, dir) => ({ uid: `m${i + 1}`, kind, x, y, dir, level: lv, skills, atkMul: extra.atkMul }),
      (m) => pathScore(targetsOf(m)) + nodeWeight * nodeYield(m),
    );
    if (item) addMonster(item);
  });
  carry.forEach((element, i) => {
    const item = best(
      (x, y, dir) => (dir === 'up' ? { id: `c${i + 1}`, kind: 'carry', element, x, y, dir } : null),
      (c) => layout.monsters.reduce((sum, m) => sum + yieldFrom({ x: m.x, y: m.y, element: MONSTERS[m.kind].element, targets: new Set(targetsOf(m).map(keyOf)) }, c), 0),
    );
    if (item) layout.facilities.push(item);
  });
  let wn = 0;
  facilities.forEach((kind, i) => {
    const def = FACILITIES[kind];
    const id = `f${i + 1}`;
    if (def.type === 'production') {
      // 製造施設と、作業するモンスターを一緒に置く
      const wkind = workers[kind] ?? 'bat';
      let top = null;
      for (let y = 0; y < map.h; y++)
        for (let x = 0; x < map.w; x++)
          for (const dir of DIRS) {
            const f = { id, kind, x, y, dir };
            if (!canPlace(map, layout, f)) continue;
            const foot = new Set(footprintOf(f).map(keyOf));
            layout.facilities.push(f);
            for (const wc of cellsOf(def.shape, x, y, dir, 'work'))
              for (const wdir of DIRS) {
                const w = { uid: `w${wn + 1}`, kind: wkind, x: wc.x, y: wc.y, dir: wdir, level, atkMul: extra.atkMul };
                if (!canPlace(map, layout, w) || !targetsOf(w).some((c) => foot.has(keyOf(c)))) continue;
                const sc = pathScore(targetsOf(w)) + 0.5 * nodeYield(w);
                if (!top || sc > top.sc) top = { f, w, sc };
              }
            layout.facilities.pop();
          }
      if (!top) return;
      wn += 1;
      layout.facilities.push(top.f);
      addMonster(top.w);
      return;
    }
    const item = best(
      (x, y, dir) => ({ id, kind, x, y, dir }),
      (f) => {
        const t = targetsOf(f);
        if (def.buff) {
          const set = new Set(t.map(keyOf));
          return layout.monsters.filter((m) => set.has(keyOf(m))).reduce((sum, m) => sum + dps(m), 0);
        }
        if (!def.atk && (def.slow || def.expose)) return t.reduce((sum, c) => sum + (hitBy.get(keyOf(c)) ?? 0), 0);
        if (!def.atk) return 0;
        return pathScore(t);
      },
    );
    if (!item) return;
    layout.facilities.push(item);
    if (def.atk) cover(targetsOf(item));
  });
  return { ...layout, ...extra, carrySlots: carry.length };
}

// ---------- 調整の基準（v0.8.5、2026-11-14 の全体の調整） ----------
// 企画者の注文：第1地方は融合なし（調合で作れるモンスターだけ）、第2地方からは融合で技を3つ持っている状態で調整する。
// 地域ごとに「ふつうに進めた人」の仲間・研究・施設を決め、何レベルで攻略できるかを見る（target が目標のレベル）。
//   研究：attack（攻撃力）・facilityAtk（施設の攻撃力）・facility（施設の効き目）・baseHp（拠点の耐久）のレベル
//   carry：持ち込む資源地（その地域にない属性の資材を足す。研究「資源地の持ち込み」の数まで、前に攻略した地域の属性だけ）
//   w：モンスターを置くときに、資源地から入る資材をどれだけ大事にするか（npm run tune で一番よいものを選んだ）
//   レベルの上限：限界突破なし15、I 30、II 40、III 50、IV 60。
//     雪山（氷）と聖域・境界（闇）は、その地域で手に入るエレメントで次の限界突破をするので、今の上限で攻略できるようにする
const RES = (attack, facilityAtk, facility, baseHp) => ({ attack, facilityAtk, facility, baseHp });
/** 第2地方からの仲間：自分の技と、仲間のうち次の2体の技を持つ（融合で技を3つ） */
const fused = (kinds) => kinds.map((kind, i) => ({ kind, skills: [kind, kinds[(i + 1) % kinds.length], kinds[(i + 2) % kinds.length]] }));
const plain = (kinds) => kinds.map((kind) => ({ kind }));

const P2_TEAM = fused(['eagle', 'irongolem', 'rockturtle', 'stormbat', 'griffon', 'cloudbird', 'earthgiant', 'bigslime', 'frog', 'jelly']);
const P3_TEAM = fused(['cannon', 'kraken', 'earthgiant', 'irongolem', 'eagle', 'griffon', 'cloudbird', 'magmagolem', 'mammoth', 'firebird', 'yukionna', 'icewitch']);
const P4_TEAM = fused(['cannon', 'kraken', 'earthgiant', 'irongolem', 'eagle', 'griffon', 'winterghost', 'magmagolem', 'mammoth', 'phoenix', 'reaper', 'demon', 'archangel', 'arcenciel']);
const P1_FAC = ['smithy', 'sword', 'beam', 'flag', 'windmill', 'stonethrower', 'ballista'];
const P2_FAC = ['atelier', 'buffpotion', 'acidpotion', 'smithy', 'sword', 'whirlpool', 'tower', 'lightningrod', 'fog', 'flag', 'windmill', 'beam', 'stonethrower', 'ballista'];
const P3_FAC = ['magiclab', 'flamecircle', 'blizzardcircle', 'atelier', 'buffpotion', 'acidpotion', 'smithy', 'sword', 'cauldron', 'brazier', 'firearrow', 'icicle', 'frostcannon', 'whirlpool', 'tower', 'fog', 'flag', 'windmill'];
const P4_FAC = ['extremelab', 'lightbook', 'darkbook', 'darkclock', 'altar', 'mirror', 'darktower', 'smithy', 'sword', 'atelier', 'buffpotion', 'acidpotion', 'magiclab', 'flamecircle', 'flag', 'windmill'];
const WORKERS = { smithy: 'bat', atelier: 'bat', magiclab: 'bat', extremelab: 'bat' };

export const STAGES = {
  grassland: { target: 1, cap: 15, w: 0.5, team: plain(['slime', 'sprite', 'bat', 'hawk', 'slime']), facilities: ['beam', 'flag'], research: RES(0, 0, 0, 0) },
  forest: { target: 8, cap: 15, w: 0.5, team: plain(['slime', 'slime', 'sprite', 'bat', 'bat', 'hawk']), facilities: ['beam', 'flag', 'windmill', 'ballista', 'beam'], research: RES(1, 1, 1, 0) },
  desert: { target: 13, cap: 15, w: 2, team: plain(['golem', 'turtle', 'crab', 'lizard', 'swallow', 'hawk', 'prism', 'bat']), facilities: P1_FAC, research: RES(3, 3, 2, 1) },
  river: { target: 20, cap: 30, w: 1.5, team: P2_TEAM, facilities: P2_FAC, research: RES(5, 5, 5, 2), carry: ['wind'] },
  storm: { target: 25, cap: 30, w: 1, team: P2_TEAM, facilities: P2_FAC, research: RES(6, 6, 5, 2), carry: ['wind'] },
  sea: { target: 30, cap: 30, w: 1, team: P2_TEAM, facilities: P2_FAC, research: RES(8, 8, 5, 3), carry: ['earth', 'none'] },
  volcano: { target: 35, cap: 40, w: 0.5, team: P3_TEAM, facilities: P3_FAC, research: RES(10, 10, 5, 3), carry: ['water', 'wind'] },
  snow: { target: 40, cap: 40, w: 2, team: P3_TEAM, facilities: P3_FAC, research: RES(11, 11, 5, 3), carry: ['fire', 'thunder', 'earth'] },
  mixed: { target: 45, cap: 50, w: 0.5, team: P3_TEAM, facilities: P3_FAC, research: RES(13, 13, 5, 3), carry: ['thunder', 'water', 'earth'] },
  sanctuary: { target: 48, cap: 50, w: 0.5, team: P4_TEAM, facilities: P4_FAC, research: RES(15, 15, 5, 3), carry: ['dark', 'light', 'fire', 'earth'] },
  boundary: { target: 50, cap: 50, w: 1, team: P4_TEAM, facilities: P4_FAC, research: RES(16, 16, 5, 3), carry: ['light', 'dark', 'fire', 'earth'] },
  castle: { target: 58, cap: 60, w: 0.5, team: P4_TEAM, facilities: P4_FAC, research: RES(18, 18, 5, 3), carry: ['light', 'dark', 'fire', 'earth', 'thunder'] },
};

const layoutCache = new Map(); // stage → Map(w → 配置)
/** 基準の配置（置き方はレベルで変わらないので、一度作ったら使い回す）。level を変えたものを返す */
export function stageLayout(regionId, level, stage = STAGES[regionId], w = stage.w) {
  if (!layoutCache.has(stage)) layoutCache.set(stage, new Map());
  const byW = layoutCache.get(stage);
  if (!byW.has(w)) {
    const r = stage.research;
    const team = stage.team.map((m) => ({ ...m, level: 1 }));
    byW.set(
      w,
      autoLayout(regionId, team, stage.facilities, {
        atkMul: 1 + ATTACK_PER_LEVEL * r.attack,
        facilityMul: 1 + FACILITY_PER_LEVEL * r.facility,
        facilityAtkMul: facilityAtkMulAt(r.facilityAtk),
        carry: stage.carry ?? [],
        workers: WORKERS,
        nodeWeight: w,
      }),
    );
  }
  const base = byW.get(w);
  return { ...base, monsters: base.monsters.map((m) => ({ ...m, level })), baseHpAdd: stage.research.baseHp };
}

/** 基準の仲間が攻略できる一番低いレベル（max まで。できなければ null） */
export function clearLevel(regionId, stage = STAGES[regionId], max = 99, w = stage.w) {
  const won = (lv) => simulate(regionId, stageLayout(regionId, lv, stage, w)).b.phase === 'won';
  if (!won(max)) return null;
  let lo = 0; // 負ける
  let hi = max; // 勝つ
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (won(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

export function simulate(regionId, layout, { maxTime = 1200 } = {}) {
  const region = REGIONS[regionId];
  const map = parseMap(region.map);
  const r = resolveLayout(map, layout);
  const b = createBattle(region, map, { baseHpAdd: layout.baseHpAdd ?? 0 });
  startBattle(b, r);
  const dt = 1 / 30;
  const losses = []; // 拠点が減ったとき（ウェーブと秒）
  let hp = b.baseHp;
  while (b.phase === 'running' && b.time < maxTime) {
    step(b, dt, r);
    if (b.baseHp !== hp) {
      losses.push(`W${b.wavesStarted}@${b.time.toFixed(0)}s-${hp - b.baseHp}`);
      hp = b.baseHp;
    }
  }
  return { b, r, losses };
}

export function report(name, b, r, losses) {
  const mat = Object.entries(r.prod.bag).filter(([, n]) => n).map(([k, n]) => `${k}${n}`).join(' ');
  const st = [...r.status.entries()].filter(([, s]) => s !== 'active').map(([id, s]) => `${id}:${s}`).join(' ');
  const got = Object.entries(b.gained).filter(([, n]) => n).map(([k, n]) => `${k}${n}`).join(' ');
  return (
    `${name}: ${b.phase} 拠点${b.baseHp}/${b.baseMax} ウェーブ${b.wavesStarted}/${b.waves.length} ` +
    `時間${b.time.toFixed(1)}s エレメント${bagTotal(b.gained)}[${got}] ペース${pace(b).toFixed(3)}/s 資材[${mat}] 止まった施設[${st}] 拠点が減った[${losses.join(' ')}]`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const only = process.argv[2];
  if (only !== 'samples') {
    for (const [regionId, stage] of Object.entries(STAGES)) {
      if (only && only !== regionId) continue;
      console.log(`--- ${REGIONS[regionId].name}（目標 Lv${stage.target}） ---`);
      for (const lv of [Math.max(1, stage.target - 5), stage.target]) {
        const { b, r, losses } = simulate(regionId, stageLayout(regionId, lv));
        console.log(report(`Lv${lv}`, b, r, losses));
      }
    }
    process.exit(0);
  }
  for (const [regionId, samples] of Object.entries(SAMPLES)) {
    if (only && only !== regionId) continue;
    console.log(`--- ${REGIONS[regionId].name} ---`);
    for (const [name, layout] of Object.entries(samples)) {
      const { b, r, losses } = simulate(regionId, layout);
      console.log(report(name, b, r, losses));
    }
  }
}
