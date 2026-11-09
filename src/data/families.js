// 系統と融合のルール（仮）。
// 融合で生まれるモンスターは、次の順で決まる（親と同じモンスターのままにすることもできる）。
//   1. 子の系統：同じ系統どうしならその系統。違う系統どうしなら FAMILY_TABLE で決まる
//   2. 子の位階：親2体の位階の平均（切り捨て）＋1
//   3. その系統の「融合でしか生まれないモンスター」のうち、位階がそれ以上で一番近いもの。なければ一番上のもの
// これとは別に、RARE_FUSIONS の組み合わせ（種類どうし）だけで生まれるモンスターがいる。
// 系統の名前はカタカナにそろえる。表示はここの name だけを使うので、名前を変えるときはここだけ直す。
export const FAMILIES = {
  gel: { name: 'ゲル' },
  plant: { name: 'プラント' },
  bird: { name: 'バード' },
  beast: { name: 'アニマル' },
  rock: { name: 'ミネラル' },
  fiend: { name: 'ヒュマノ' }, // 人型
  machine: { name: 'マシン' },
  scale: { name: 'スケイル' },
  mollusk: { name: 'テンタクル' },
  wraith: { name: 'レイス' },
};
export const FAMILY_ORDER = Object.keys(FAMILIES);

/** 系統の名前（「ゲル系」など） */
export const familyName = (id) => `${FAMILIES[id].name}系`;

// 違う系統どうしの融合で、子の系統（順番は関係ない）。10系統で45通り。
// 第1地方にいる7系統どうしは、その7系統のどれかになるようにしている。
const PAIRS = [
  ['gel', 'plant', 'plant'],
  ['gel', 'bird', 'gel'],
  ['gel', 'beast', 'beast'],
  ['gel', 'rock', 'gel'],
  ['gel', 'fiend', 'fiend'],
  ['gel', 'scale', 'scale'],
  ['plant', 'bird', 'bird'],
  ['plant', 'beast', 'plant'],
  ['plant', 'rock', 'rock'],
  ['plant', 'fiend', 'fiend'],
  ['plant', 'scale', 'plant'],
  ['bird', 'beast', 'beast'],
  ['bird', 'rock', 'bird'],
  ['bird', 'fiend', 'fiend'],
  ['bird', 'scale', 'scale'],
  ['beast', 'rock', 'rock'],
  ['beast', 'fiend', 'beast'],
  ['beast', 'scale', 'scale'],
  ['rock', 'fiend', 'rock'],
  ['rock', 'scale', 'scale'],
  ['fiend', 'scale', 'fiend'],
  // 第2地方以降の系統（マシン・軟体・レイス）が入る組み合わせ
  ['gel', 'machine', 'machine'],
  ['gel', 'mollusk', 'mollusk'],
  ['gel', 'wraith', 'wraith'],
  ['plant', 'machine', 'machine'],
  ['plant', 'mollusk', 'mollusk'],
  ['plant', 'wraith', 'wraith'],
  ['bird', 'machine', 'machine'],
  ['bird', 'mollusk', 'bird'],
  ['bird', 'wraith', 'wraith'],
  ['beast', 'machine', 'machine'],
  ['beast', 'mollusk', 'mollusk'],
  ['beast', 'wraith', 'wraith'],
  ['rock', 'machine', 'machine'],
  ['rock', 'mollusk', 'mollusk'],
  ['rock', 'wraith', 'wraith'],
  ['fiend', 'machine', 'machine'],
  ['fiend', 'mollusk', 'mollusk'],
  ['fiend', 'wraith', 'wraith'],
  ['machine', 'scale', 'machine'],
  ['machine', 'mollusk', 'machine'],
  ['machine', 'wraith', 'wraith'],
  ['scale', 'mollusk', 'scale'],
  ['scale', 'wraith', 'wraith'],
  ['mollusk', 'wraith', 'mollusk'],
];

export const pairKey = (a, b) => [a, b].sort((x, y) => FAMILY_ORDER.indexOf(x) - FAMILY_ORDER.indexOf(y)).join('+');

/** 'gel+rock' → 'gel' */
export const FAMILY_TABLE = Object.fromEntries(PAIRS.map(([a, b, child]) => [pairKey(a, b), child]));

/** 子の位階：親2体の位階の平均（切り捨て）＋ FUSION_RANK_UP */
export const FUSION_RANK_UP = 1;

// ルールの外の、特別な組み合わせ（種類どうし。順番は関係ない）
export const RARE_FUSIONS = [
  { kind: 'skyshell', parents: ['turtle', 'swallow'] },
  { kind: 'sandscarecrow', parents: ['scarecrow', 'lizard'] },
];
