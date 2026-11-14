// 戦闘：ウェーブ制で敵が道を進み、モンスターと戦闘施設が自動で攻撃する。
// 乱数は使わない（同じ配置なら同じ結果になる）。
import { ENEMIES } from '../data/enemies.js';
import { emptyBag, bagTotal, affinity } from '../data/elements.js';
import { pointOnPath, pathLength } from './map.js';

/** opts.baseHpAdd：研究で増えた拠点の耐久 */
// 道が複数ある地域（二股・合流・2列・拠点2か所）では、敵は道を順番に使う（ウェーブのグループで route を決めることもできる）。
// 拠点の耐久は、拠点が2か所あっても1つ（どちらに通されても減る）。
export function createBattle(region, map, { baseHpAdd = 0 } = {}) {
  const routes = map.routes ?? [map.path];
  return {
    phase: 'ready', // ready → running → won | lost
    waves: region.waves,
    waveGap: region.waveGap,
    routes,
    lens: routes.map(pathLength),
    pathLen: pathLength(routes[0]),
    path: routes[0],
    baseHp: region.baseHp + baseHpAdd,
    baseMax: region.baseHp + baseHpAdd,
    time: 0, // 獲得ペース用のタイマー。step を呼ばない間（一時停止中）は進まない
    wavesStarted: 0,
    pending: [], // まだ出ていない敵 { at, enemy, wave }
    gapUntil: null,
    enemies: [],
    nextEnemyId: 1,
    cooldowns: {},
    gained: emptyBag(), // この挑戦で手に入れたエレメント
    effects: [], // 描画用：攻撃の線
    kills: [], // 倒した記録（進化の条件に使う）
    damage: { monster: 0, facility: 0 }, // 与えたダメージ（モンスターと施設。調整の確かめ用）
    log: [],
  };
}

/** ctx.groupSize（角笛の数＋1）だけ、ウェーブをまとめて出す。 */
export function startBattle(b, ctx = { groupSize: 1 }) {
  if (b.phase !== 'ready') return;
  b.phase = 'running';
  startGroup(b, ctx.groupSize);
}

function startGroup(b, size) {
  for (let i = 0; i < size && b.wavesStarted < b.waves.length; i++) startWave(b);
}

function startWave(b) {
  const w = b.wavesStarted;
  for (const g of b.waves[w]) {
    for (let i = 0; i < g.count; i++) b.pending.push({ at: b.time + g.delay + i * g.interval, enemy: g.enemy, wave: w, route: g.route ?? i % b.routes.length });
  }
  b.pending.sort((p, q) => p.at - q.at);
  b.wavesStarted += 1;
  b.gapUntil = null;
}

/** dt 秒だけ進める。ctx = { units, groupSize, slow?, expose? }（resolveLayout の戻り値） */
export function step(b, dt, ctx) {
  if (b.phase !== 'running') return;
  b.time += dt;

  // 出現
  while (b.pending.length && b.pending[0].at <= b.time) {
    const p = b.pending.shift();
    const def = ENEMIES[p.enemy];
    b.enemies.push({ id: b.nextEnemyId++, kind: p.enemy, hp: def.hp, maxHp: def.hp, dist: 0, wave: p.wave, route: p.route ?? 0 });
  }
  const lenOf = (e) => b.lens[e.route ?? 0];
  const posOf = (e) => pointOnPath(b.routes[e.route ?? 0], e.dist);

  // 移動と、拠点まで通された敵
  // 足止めのマスにいる敵と、凍えている敵（つららの塔）は遅くなる。重なったときは大きい方だけ
  for (const e of b.enemies) {
    let slow = e.chill && e.chill.until > b.time ? e.chill.slow : 0;
    if (ctx.slow?.size) {
      const p = posOf(e);
      slow = Math.max(slow, ctx.slow.get(`${Math.floor(p.x)},${Math.floor(p.y)}`) ?? 0);
    }
    e.dist += ENEMIES[e.kind].speed * (1 - slow) * dt;
  }
  const leaked = b.enemies.filter((e) => e.dist >= lenOf(e));
  if (leaked.length) {
    // ボスを通したら拠点は全損（ボスを倒さないとクリアにならない）
    for (const e of leaked) {
      if (ENEMIES[e.kind].boss) b.bossLeaked = true;
      b.baseHp -= ENEMIES[e.kind].boss ? b.baseHp : ENEMIES[e.kind].damage;
    }
    b.enemies = b.enemies.filter((e) => e.dist < lenOf(e));
    if (b.baseHp <= 0) {
      b.baseHp = 0;
      b.phase = 'lost';
      return;
    }
  }

  // やけど（かがり火）：時間がたつごとに体力が減る
  for (const e of b.enemies) {
    if (!e.burn || e.burn.until <= b.time || e.hp <= 0) continue;
    e.hp -= e.burn.dps * dt;
    b.damage[e.burn.src?.source ?? 'facility'] += e.burn.dps * dt;
    if (e.hp <= 0 && !e.killedBy) e.killedBy = e.burn.src;
  }

  // 攻撃：範囲のマスにいる敵のうち、拠点まで一番近い敵をねらう。splash のユニットは範囲の敵すべてに当たる
  //   burn = { dps, dur }：当たった敵をやけどにする / chill = { slow, dur }：当たった敵を凍えさせて遅くする
  for (const e of b.effects) e.life -= dt;
  b.effects = b.effects.filter((e) => e.life > 0);
  for (const u of ctx.units) {
    const cd = (b.cooldowns[u.id] ?? 0) - dt;
    if (cd > 0) {
      b.cooldowns[u.id] = cd;
      continue;
    }
    const inRange = [];
    for (const e of b.enemies) {
      if (e.hp <= 0) continue;
      const p = posOf(e);
      if (u.targets.has(`${Math.floor(p.x)},${Math.floor(p.y)}`)) inRange.push({ e, p, left: lenOf(e) - e.dist });
    }
    if (!inRange.length) {
      b.cooldowns[u.id] = 0;
      continue;
    }
    const hits = u.splash ? inRange : [inRange.reduce((a, c) => (c.left < a.left ? c : a))];
    for (const { e, p } of hits) {
      const def = ENEMIES[e.kind];
      const exposed = 1 + (ctx.expose?.get(`${Math.floor(p.x)},${Math.floor(p.y)}`) ?? 0);
      const vsBoss = u.bossMul && (def.elite || def.boss) ? u.bossMul : 1;
      // 属性の相性：攻撃の属性が相手の属性に強いなら ×1.2（やけども同じ）
      const aff = affinity(u.element, def.element);
      e.hp -= u.atk * exposed * vsBoss * aff;
      b.damage[u.source] += u.atk * exposed * vsBoss * aff;
      if (u.burn) e.burn = { dps: u.burn.dps * aff, until: b.time + u.burn.dur, src: u };
      if (u.chill) e.chill = { slow: u.chill.slow, until: b.time + u.chill.dur };
      if (e.hp <= 0 && !e.killedBy) e.killedBy = u;
      b.effects.push({ from: { x: u.x + 0.5, y: u.y + 0.5 }, to: p, element: u.element, life: 0.12 });
    }
    b.cooldowns[u.id] = u.interval;
  }
  const dead = b.enemies.filter((e) => e.hp <= 0);
  for (const e of dead) {
    const def = ENEMIES[e.kind];
    b.gained[def.element] += def.drop;
    const u = e.killedBy;
    // 倒したときの敵のようす（進化の条件に使う）：やけど・凍えた・霧で遅くなった・光の祭壇の範囲
    const p = posOf(e);
    const cell = `${Math.floor(p.x)},${Math.floor(p.y)}`;
    b.kills.push({
      owner: u?.owner ?? null, enemy: e.kind, sword: !!u?.buffed.sword, flag: !!u?.buffed.flag, elite: !!def.elite, boss: !!def.boss,
      burn: !!(e.burn && e.burn.until > b.time), chill: !!(e.chill && e.chill.until > b.time), slow: !!ctx.slow?.get(cell), expose: !!ctx.expose?.get(cell),
    });
  }
  if (dead.length) b.enemies = b.enemies.filter((e) => e.hp > 0);

  // 今のウェーブ（まとめて出したもの）を全部倒したら、間をあけて次へ
  if (b.pending.length === 0 && b.enemies.length === 0) {
    if (b.wavesStarted >= b.waves.length) b.phase = 'won';
    else {
      if (b.gapUntil === null) b.gapUntil = b.time + b.waveGap;
      if (b.time >= b.gapUntil) startGroup(b, ctx.groupSize ?? 1);
    }
  }
}

/** 動かした・回したユニットは、攻撃の間隔が溜まるまで攻撃できない。 */
export function rechargeUnit(b, unit) {
  if (b.phase === 'running' && unit) b.cooldowns[unit.id] = unit.interval;
}

/** 獲得ペース：全ウェーブで手に入れたエレメント ÷ 通しで倒すのにかかった時間（企画まとめの回答）。 */
export function pace(b) {
  return b.time > 0 ? bagTotal(b.gained) / b.time : 0;
}

/** 属性ごとの獲得ペース（攻略済み地域から自動で入るエレメントの内訳）。 */
export function paceBag(b) {
  const out = emptyBag();
  if (b.time <= 0) return out;
  for (const [id, n] of Object.entries(b.gained)) out[id] = n / b.time;
  return out;
}

/** 次に出てくるウェーブの中身（画面の予告用）。 */
export function waveSummary(wave) {
  const count = {};
  for (const g of wave) count[g.enemy] = (count[g.enemy] ?? 0) + g.count;
  return Object.entries(count).map(([kind, n]) => ({ kind, n }));
}
