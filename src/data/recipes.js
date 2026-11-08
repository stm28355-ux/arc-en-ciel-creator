// 調合錬成の組み合わせ表（仮）と、図鑑錬成の値段。
// 決め手は「一番多いエレメント」「二番目に多いエレメント」「使ったエレメントの種類の数」（企画まとめ）。
//   types 1：一番多い（＝使った）エレメントで決まる
//   types 2：一番多い＋二番目で決まる
//   types 3：一番多いエレメントで決まる
//   special：比率をぴったり合わせたときだけ生まれる。ふつうの表より先に見る
// 同じ量のときは ELEMENTS の並び（無・風・土・…）で前のものを「多い」とする。
export const MIX_MIN_TOTAL = 10; // 調合錬成に使うエレメントの合計の最小
export const MIX_MAX_TOTAL = 60;

export const RECIPES = [
  { kind: 'prism', special: { none: 1, wind: 1, earth: 1 } },

  { kind: 'slime', types: 1, first: 'none' },
  { kind: 'bat', types: 1, first: 'wind' },
  { kind: 'turtle', types: 1, first: 'earth' },

  { kind: 'sprite', types: 2, first: 'none', second: 'wind' },
  { kind: 'dango', types: 2, first: 'none', second: 'earth' },
  { kind: 'hawk', types: 2, first: 'wind', second: 'none' },
  { kind: 'weasel', types: 2, first: 'wind', second: 'earth' },
  { kind: 'golem', types: 2, first: 'earth', second: 'none' },
  { kind: 'lizard', types: 2, first: 'earth', second: 'wind' },

  { kind: 'scarecrow', types: 3, first: 'none' },
  { kind: 'swallow', types: 3, first: 'wind' },
  { kind: 'crab', types: 3, first: 'earth' },
];

// 図鑑錬成の値段：一度手に入れたモンスターを、考えずに作れる決まった量（調合の最小より少し多い）
export const CODEX_COST = {
  slime: { none: 12 },
  bat: { wind: 12 },
  turtle: { earth: 12 },
  sprite: { none: 8, wind: 4 },
  dango: { none: 8, earth: 4 },
  hawk: { wind: 8, none: 4 },
  weasel: { wind: 8, earth: 4 },
  golem: { earth: 8, none: 4 },
  lizard: { earth: 8, wind: 4 },
  scarecrow: { none: 6, wind: 3, earth: 3 },
  swallow: { wind: 6, none: 3, earth: 3 },
  crab: { earth: 6, none: 3, wind: 3 },
  prism: { none: 5, wind: 5, earth: 5 },
  // 進化で手に入るもの：進化前の約3倍
  bigslime: { none: 36 },
  forestsprite: { none: 24, wind: 12 },
  stormbat: { wind: 36 },
  eagle: { wind: 24, none: 12 },
  rockturtle: { earth: 36 },
  irongolem: { earth: 24, none: 12 },
  // 融合でしか生まれないもの：位階3は30、位階4は40、位階5は54くらい
  stoneslime: { earth: 20, none: 10 },
  auroragel: { none: 36, wind: 9, earth: 9 },
  vine: { earth: 20, none: 10 },
  ancienttree: { earth: 36, none: 18 },
  falcon: { wind: 20, none: 10 },
  cloudbird: { wind: 36, none: 18 },
  hedgehog: { earth: 20, wind: 10 },
  griffon: { wind: 36, earth: 18 },
  mossgolem: { earth: 20, none: 10 },
  earthgiant: { earth: 40, none: 14 },
  piper: { wind: 28, none: 12 },
  wyvern: { wind: 28, earth: 12 },
  // 特別な組み合わせでだけ生まれるもの
  skyshell: { wind: 36, earth: 36 },
  sandscarecrow: { earth: 30, none: 12, wind: 12 },
};

// 図鑑で、まだ手に入れていないモンスターに出すヒント
export const HINTS = {
  types1: '1種類のエレメントだけで作る',
  types2: '2種類のエレメントで作る',
  types3: '3種類のエレメントで作る',
  special: '比率をぴったり合わせると生まれる',
  evolved: '進化で手に入る',
  fusion: '融合で生まれる',
  rare: '特別な組み合わせの融合でだけ生まれる',
};
