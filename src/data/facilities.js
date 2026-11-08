// 施設（仮）。企画まとめの「戦闘施設」と「進行施設」の2種類。
// cost は資材の量。資材は地域マップの中だけで使い、持ち出さない。
export const FACILITIES = {
  beam: {
    name: '光線塔',
    type: 'combat',
    cost: { none: 3 },
    desc: '範囲に入った敵を自動で撃つ',
    atk: 8,
    interval: 1.0,
    range: 3.0,
  },
  sword: {
    name: '剣の台座',
    type: 'combat',
    cost: { earth: 2, none: 1 },
    desc: 'となり8マスのモンスターの攻撃力 +30%',
    buff: { atkAdd: 0.3, radius: 1.5 },
  },
  flag: {
    name: '追い風の旗',
    type: 'combat',
    cost: { wind: 2 },
    desc: '2マス以内のモンスターの攻撃の速さ +30%',
    buff: { speedAdd: 0.3, radius: 2.0 },
  },
  horn: {
    name: '連戦の角笛',
    type: 'progress',
    cost: { wind: 2, earth: 2 },
    desc: '前のウェーブが出きったら、待たずに次のウェーブを出す（2ウェーブ同時になる）',
    effect: 'overlap',
  },
};

export const FACILITY_ORDER = ['beam', 'sword', 'flag', 'horn'];
