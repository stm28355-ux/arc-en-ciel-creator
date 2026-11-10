// 施設（仮）。区分は3つ。
//   戦闘施設：戦いそのものに効く（敵を撃つ、モンスターを強くする）
//   進行施設：戦闘の進み方を変える
//   製造施設：作業場所（w）にいて、攻撃範囲が施設に重なるモンスターがいる間だけ動き、別の施設を建てられるようにする
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
    desc: '作業場所（前の2マス）に、攻撃範囲が鍛冶場に重なる向きでモンスターを置くと動く。動いている間だけ剣の台座を建てられる。作業中も攻撃と生産をする',
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
  // --- 第2地方の資材（水・雷）で建てる ---
  fog: {
    name: '霧の噴水',
    type: 'combat',
    cost: { water: 2 },
    desc: '前の9マスにいる敵の歩みを40%遅くする（いくつ重ねても40%まで）',
    slow: 0.4,
    shape: ['xxx', 'xxx', 'xxx', '.o.'],
  },
  tower: {
    name: '雷の塔',
    type: 'combat',
    cost: { thunder: 2, earth: 1 },
    desc: '前の6マスにいる敵すべてに、雷を落とす',
    atk: 10,
    interval: 1.5,
    splash: true,
    shape: ['xxx', 'xxx', '.o.'],
  },
  // --- 第3地方の資材（炎・氷）で建てる ---
  brazier: {
    name: 'かがり火',
    type: 'combat',
    cost: { fire: 2, earth: 1 },
    desc: 'まわり8マスの敵すべてに火をつけ、3秒のあいだやけどにする（毎秒10）',
    atk: 4,
    interval: 1.0,
    splash: true,
    burn: { dps: 10, dur: 3 },
    shape: ['xxx', 'xox', 'xxx'],
  },
  icicle: {
    name: 'つららの塔',
    type: 'combat',
    cost: { ice: 2, water: 1 },
    desc: '向いている方へまっすぐ5マス。当たった敵を2秒のあいだ50%遅くする',
    atk: 14,
    interval: 1.2,
    chill: { slow: 0.5, dur: 2 },
    shape: ['x', 'x', 'x', 'x', 'x', 'o'],
  },
  // --- 第4地方の資材（光・闇）で建てる。第4地方は資材が少ないので、資源地の持ち込みと合わせて使う ---
  altar: {
    name: '光の祭壇',
    type: 'combat',
    cost: { light: 2, fire: 1 },
    desc: '前の9マスにいる敵が受けるダメージ +25%（いくつ重ねても25%まで）',
    expose: 0.25,
    shape: ['xxx', 'xxx', 'xxx', '.o.'],
  },
  darktower: {
    name: '闇の塔',
    type: 'combat',
    cost: { dark: 2 },
    desc: '向いている方へまっすぐ6マス。【強】とボスには3倍のダメージ',
    atk: 40,
    interval: 2.0,
    bossMul: 3,
    shape: ['x', 'x', 'x', 'x', 'x', 'x', 'o'],
  },
  // 研究「資源地の持ち込み」で置ける資源地。資材は使わない。element は置くときに選ぶ（攻略した地域の資源地の属性）
  carry: {
    name: '持ち込みの資源地',
    type: 'carry',
    cost: {},
    desc: '研究で持ち込んだ資源地。地域の資源地と同じく、まわり8マスや攻撃範囲に入れたモンスターから資材が入る',
    shape: ['o'],
  },
};

export const FACILITY_ORDER = ['beam', 'smithy', 'sword', 'flag', 'horn', 'fog', 'tower', 'brazier', 'icicle', 'altar', 'darktower'];

export const FACILITY_TYPE_NAME = { combat: '戦闘施設', progress: '進行施設', production: '製造施設', carry: '持ち込み' };
