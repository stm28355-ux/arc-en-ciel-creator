// 地域の敵の体力を、調整の基準（tools/sim-region.mjs の STAGES）の仲間が目標のレベルでちょうど攻略できるように合わせる。
//   node tools/tune-regions.mjs              全部の地域：今の体力で何レベルで攻略できるかと、合わせるのに要る体力の倍率
//   node tools/tune-regions.mjs river sea    その地域だけ
//   node tools/tune-regions.mjs --write      倍率を src/data/enemies.js の体力に当てはめ、一番よい置き方（w）を STAGES に書く
// 置き方は資源地をどれだけ大事にするか（w）を何通りか試し、一番低いレベルで攻略できるものを使う（ふつうに工夫する人のつもり）。
// 草原は最初の案内に合わせてあるので変えない。
import fs from 'node:fs';
import { REGIONS } from '../src/data/regions.js';
import { ENEMIES } from '../src/data/enemies.js';
import { STAGES, stageLayout, simulate } from './sim-region.mjs';

const WEIGHTS = [0.5, 1, 1.5, 2];
const args = process.argv.slice(2);
const write = args.includes('--write');
const only = args.filter((a) => !a.startsWith('--'));

const enemiesOf = (regionId) => [...new Set(REGIONS[regionId].waves.flatMap((w) => w.map((g) => g.enemy)))];
const won = (regionId, lv, w) => simulate(regionId, stageLayout(regionId, lv, STAGES[regionId], w)).b.phase === 'won';
/** 一番低いレベルで攻略できる置き方と、そのレベル */
function bestClear(regionId, max = 99) {
  let best = null;
  for (const w of WEIGHTS) {
    if (best?.lv === 1) break;
    if (!won(regionId, best ? best.lv - 1 : max, w)) continue;
    let lo = 0;
    let hi = best ? best.lv - 1 : max;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (won(regionId, mid, w)) hi = mid;
      else lo = mid;
    }
    best = { lv: hi, w };
  }
  return best;
}
/** 体力は上から3けたにそろえる（100未満は1の位まで） */
export function roundHp(x) {
  if (x < 100) return Math.max(1, Math.round(x));
  const p = 10 ** (Math.floor(Math.log10(x)) - 2);
  return Math.round(x / p) * p;
}
const withHp = (regionId, base, m, fn) => {
  for (const e of enemiesOf(regionId)) ENEMIES[e].hp = roundHp(base[e] * m);
  try {
    return fn();
  } finally {
    for (const e of enemiesOf(regionId)) ENEMIES[e].hp = base[e];
  }
};

const results = {};
for (const [regionId, stage] of Object.entries(STAGES)) {
  if (regionId === 'grassland' || (only.length && !only.includes(regionId))) continue;
  const base = Object.fromEntries(enemiesOf(regionId).map((e) => [e, ENEMIES[e].hp]));
  const now = bestClear(regionId);
  // 目標のレベルで攻略できる一番大きい倍率（どれかの置き方で勝てれば OK）
  const ok = (m) => withHp(regionId, base, m, () => WEIGHTS.some((w) => won(regionId, stage.target, w)));
  let lo = 0.05;
  let hi = 1e6; // 高難易度の敵は体力の比だけ決めてあるので、大きな倍率まで探す
  for (let i = 0; i < 16; i++) {
    const mid = Math.sqrt(lo * hi);
    if (ok(mid)) lo = mid;
    else hi = mid;
  }
  const m = lo;
  const after = withHp(regionId, base, m, () => bestClear(regionId));
  results[regionId] = { m, w: after?.w ?? stage.w };
  console.log(`${REGIONS[regionId].name}: 今 Lv${now?.lv ?? '-'}（w${now?.w}） 目標 Lv${stage.target} → 体力 ×${m.toFixed(6)}（合わせたあと Lv${after?.lv}、w${after?.w}）`);
}

if (write) {
  // 敵は src/data/enemies.js か、高難易度なら src/data/hard.js にある
  const files = Object.fromEntries(['src/data/enemies.js', 'src/data/hard.js'].map((f) => [f, fs.readFileSync(f, 'utf8')]));
  for (const [regionId, { m }] of Object.entries(results)) {
    for (const e of enemiesOf(regionId)) {
      const hp = roundHp(ENEMIES[e].hp * m);
      const re = new RegExp(`(\\n  ${e}: \\{[^}]*?hp: )\\d+`);
      const f = Object.keys(files).find((k) => re.test(files[k]));
      if (!f) throw new Error(`敵が見つからない：${e}`);
      files[f] = files[f].replace(re, `$1${hp}`);
    }
  }
  for (const [f, src] of Object.entries(files)) fs.writeFileSync(f, src);
  let sim = fs.readFileSync('tools/sim-region.mjs', 'utf8');
  for (const [regionId, { w }] of Object.entries(results)) {
    const re = new RegExp(`(\\n  ${regionId}: \\{ target: \\d+, cap: \\d+, w: )[\\d.]+`);
    sim = sim.replace(re, `$1${w}`);
  }
  fs.writeFileSync('tools/sim-region.mjs', sim);
  console.log('src/data/enemies.js と tools/sim-region.mjs に書いた');
}
