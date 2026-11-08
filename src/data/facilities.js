// 施設（仮）。区分は3つ。
//   戦闘施設：戦いそのものに効く（敵を撃つ、モンスターを強くする）
//   進行施設：戦闘の進み方を変える
//   製造施設：モンスターを作業場所（w）に置いている間だけ動き、別の施設を建てられるようにする
// cost は資材の量。資材は地域マップの中だけで使い、持ち出さない。
// shape は上を向いたときの形（o = 施設のマス、x = 攻撃・効果が届くマス、w = 作業場所）。
export const FACILITIES = {
  beam: {
    name: '光線塔',
    type: 'combat',
    cost: { none: 3 },
    desc: '向いている方へまっすぐ8マス、敵を撃つ',
    atk: 8,
    interval: 1.0,
    shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'],
  },
  smithy: {
    name: '鍛冶場',
    type: 'production',
    cost: { earth: 1 },
    desc: '作業場所（前の2マス）にモンスターを置くと動く。動いている間だけ剣の台座を建てられる。作業中のモンスターは攻撃も生産もしない',
    shape: ['ww', 'oo'],
  },
  sword: {
    name: '剣の台座',
    type: 'combat',
    cost: { earth: 2, none: 1 },
    requires: 'smithy',
    desc: 'まわり8マスのモンスターの攻撃力 +50%（鍛冶場が動いている間だけ）',
    buff: { atkAdd: 0.5 },
    shape: ['xxx', 'xox', 'xxx'],
  },
  flag: {
    name: '追い風の旗',
    type: 'combat',
    cost: { wind: 2 },
    desc: '向いている方の6マスのモンスターの攻撃の速さ +30%',
    buff: { speedAdd: 0.3 },
    shape: ['xxx', 'xxx', '.o.'],
  },
  horn: {
    name: '連戦の角笛',
    type: 'progress',
    cost: { wind: 2, earth: 2 },
    desc: 'ウェーブをまとめて出す。1個で2つずつ（2-2-1）、2個で3つずつ（3-2）…',
    effect: 'group',
    shape: ['o'],
  },
};

export const FACILITY_ORDER = ['beam', 'smithy', 'sword', 'flag', 'horn'];

export const FACILITY_TYPE_NAME = { combat: '戦闘施設', progress: '進行施設', production: '製造施設' };
