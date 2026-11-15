// 図鑑の「作り方」と、実際の作り方（調合錬成・融合・進化）が合っているかを、200体すべてで確かめる（2026-11-15）。
//   node tools/check-recipes.mjs
// 図鑑の文から配合や親を作り、ゲームと同じ関数で本当にそのモンスターが生まれるかを見る。食い違いがあれば表示する。
import { MONSTERS } from '../src/data/monsters.js';
import { RECIPES, MIX_MIN_TOTAL, MIX_MAX_TOTAL, MIX_ELEMENTS } from '../src/data/recipes.js';
import { RARE_FUSIONS } from '../src/data/families.js';
import { EVOLUTIONS, EVOLVED_FROM } from '../src/data/evolutions.js';
import { mixResult } from '../src/core/alchemy.js';
import { fusionMembers, fusionCandidates } from '../src/core/breeding.js';

export function checkRecipes() {
  const problems = [];
  const bad = (kind, text) => problems.push(`${MONSTERS[kind].name}（${kind}）：${text}`);
  for (const [kind, d] of Object.entries(MONSTERS)) {
    if (d.evolved) {
      const from = EVOLVED_FROM[kind];
      if (!from || EVOLUTIONS[from]?.to !== kind) bad(kind, '進化前が見つからない');
      continue;
    }
    if (d.rare) {
      const r = RARE_FUSIONS.find((x) => x.kind === kind);
      if (!r) {
        bad(kind, '特別な組み合わせがない');
        continue;
      }
      const [p, q] = r.parents;
      if (!fusionCandidates({ kind: p, skills: [p] }, { kind: q, skills: [q] }).some((c) => c.kind === kind)) bad(kind, `${p}×${q} の融合で生まれない`);
      continue;
    }
    if (d.fusion) {
      // 子の位階ごとに、どのモンスターが生まれるか（融合のルールと同じ選び方）
      const members = fusionMembers(d.family);
      const ranks = [];
      for (let r = 2; r <= 12; r++) if ((members.find((k) => MONSTERS[k].rank >= r) ?? members.at(-1)) === kind) ranks.push(r);
      const i = members.indexOf(kind);
      const lo = i > 0 ? MONSTERS[members[i - 1]].rank + 1 : 2;
      const hi = i < members.length - 1 ? d.rank : 12;
      const want = [];
      for (let r = Math.max(2, lo); r <= hi; r++) want.push(r);
      if (ranks.join() !== want.join()) bad(kind, `融合の位階の範囲が図鑑とちがう（図鑑 ${lo}〜${hi}、本当は ${ranks.join(',')}）`);
      continue;
    }
    // 調合錬成（ふつうの表と特殊）
    const r = RECIPES.find((x) => x.kind === kind);
    if (!r) {
      bad(kind, '調合の表にない');
      continue;
    }
    const tries = [];
    if (r.special) {
      const sum = Object.values(r.special).reduce((a, b) => a + b, 0);
      for (let k = Math.ceil(MIX_MIN_TOTAL / sum); k * sum <= MIX_MAX_TOTAL; k++) tries.push(Object.fromEntries(Object.entries(r.special).map(([e, n]) => [e, n * k])));
    } else if (r.types === 1) tries.push({ [r.first]: 12 });
    else if (r.types === 2) tries.push({ [r.first]: 7, [r.second]: 5 }, { [r.first]: 20, [r.second]: 1 });
    else {
      const others = MIX_ELEMENTS.filter((e) => e !== r.first);
      for (let i = 0; i < others.length; i++) for (let j = i + 1; j < others.length; j++) tries.push({ [r.first]: 6, [others[i]]: 4, [others[j]]: 3 });
    }
    for (const mix of tries) {
      const got = mixResult(mix);
      if (got.kind !== kind) bad(kind, `配合 ${JSON.stringify(mix)} で ${got.kind ? MONSTERS[got.kind].name : got.reason} が生まれる`);
    }
  }
  return problems;
}

if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/').split('/').pop() ?? '')) {
  const problems = checkRecipes();
  console.log(problems.length ? problems.join('\n') : '食い違いなし');
}
