// 研究（仮）。エレメントを使って、ゲーム全体に効く強化を進める（企画まとめ「研究（永続強化）」）。
// 研究したものは ON/OFF できる。OFF にしても使ったエレメントは戻らない。
// 研究の項目は、これからも必要に応じて増やす。
//   max:   研究できる回数（レベル）
//   costs: レベルごとの値段（costs[0] がレベル1にする値段）
//   needs: 先に研究しておくもの
// 草原を1回攻略すると約116、攻略後の自動獲得は約0.38/秒（v0.4.2 のシミュレーション）。値段はこれを目安にした仮のもの。
export const RESEARCH = {
  // 調合錬成で使えるエレメントを開放する。無は最初から使える。値段にその属性を入れて、手に入れてから研究するようにする
  mixWind: {
    name: '風の調合',
    desc: '調合錬成で風のエレメントを使えるようにする',
    max: 1,
    costs: [{ wind: 20, none: 20 }],
  },
  mixEarth: {
    name: '土の調合',
    desc: '調合錬成で土のエレメントを使えるようにする',
    max: 1,
    costs: [{ earth: 20, wind: 20 }],
  },
  mixWater: {
    name: '水の調合',
    desc: '調合錬成で水のエレメントを使えるようにする',
    max: 1,
    costs: [{ water: 30, earth: 30 }],
  },
  mixThunder: {
    name: '雷の調合',
    desc: '調合錬成で雷のエレメントを使えるようにする',
    max: 1,
    costs: [{ thunder: 30, water: 30 }],
  },
  mixFire: {
    name: '炎の調合',
    desc: '調合錬成で炎のエレメントを使えるようにする',
    max: 1,
    costs: [{ fire: 40, thunder: 40 }],
  },
  mixIce: {
    name: '氷の調合',
    desc: '調合錬成で氷のエレメントを使えるようにする',
    max: 1,
    costs: [{ ice: 40, water: 40 }],
  },
  mixLight: {
    name: '光の調合',
    desc: '調合錬成で光のエレメントを使えるようにする',
    max: 1,
    costs: [{ light: 50, fire: 50 }],
  },
  mixDark: {
    name: '闇の調合',
    desc: '調合錬成で闇のエレメントを使えるようにする',
    max: 1,
    costs: [{ dark: 50, light: 50 }],
  },
  baseHp: {
    name: '拠点の耐久',
    desc: '拠点の耐久 +1（どの地域でも）',
    max: 3,
    costs: [{ earth: 40, none: 20 }, { earth: 100, none: 50 }, { earth: 200, none: 100 }],
  },
  attack: {
    name: '攻撃力',
    desc: 'モンスターの攻撃力 +5%',
    max: 5,
    costs: [1, 2, 3, 4, 5].map((n) => ({ wind: 30 * n, none: 10 * n })),
  },
  facility: {
    name: '戦闘施設の強化',
    desc: '光線塔の攻撃力と、剣の台座・追い風の旗の効き目 +10%',
    max: 5,
    costs: [1, 2, 3, 4, 5].map((n) => ({ none: 30 * n, wind: 20 * n })),
  },
  pace: {
    name: '獲得ペース',
    desc: '攻略した地域から自動で入るエレメント +10%',
    max: 5,
    costs: [1, 2, 3, 4, 5].map((n) => ({ none: 35 * n, earth: 15 * n })),
  },
  carry: {
    name: '資源地の持ち込み',
    desc: '攻略した地域の資源地を、地域マップに1つ持ち込める（どの地域でも）。資材の少ない第4地方で役に立つ',
    max: 5,
    costs: [
      { none: 50, wind: 50, earth: 50 },
      { none: 150, wind: 150, earth: 150 },
      { water: 200, thunder: 200 },
      { fire: 300, ice: 300 },
      { light: 400, dark: 400 },
    ],
  },
  limit1: {
    name: '限界突破 I',
    desc: 'レベルの上限 15 → 30。16からも第1地方のエレメントで上げる',
    max: 1,
    costs: [{ none: 200, wind: 200, earth: 200 }],
  },
  limit2: {
    name: '限界突破 II',
    desc: 'レベルの上限 30 → 40。31からは第2地方のエレメント（水・雷）で上げる',
    max: 1,
    needs: 'limit1',
    costs: [{ water: 300, thunder: 300 }],
  },
  // 限界突破は 30・40・50・60・99（企画者の決定、2026-11-10）
  limit3: {
    name: '限界突破 III',
    desc: 'レベルの上限 40 → 50。41からは第3地方のエレメント（炎・氷）で上げる',
    max: 1,
    needs: 'limit2',
    costs: [{ fire: 400, ice: 400 }],
  },
  limit4: {
    name: '限界突破 IV',
    desc: 'レベルの上限 50 → 60。51からは第4地方のエレメント（光・闇）で上げる',
    max: 1,
    needs: 'limit3',
    costs: [{ light: 500, dark: 500 }],
  },
  limit5: {
    name: '限界突破 V',
    desc: 'レベルの上限 60 → 99。61からはどのエレメントでも上げられる',
    max: 1,
    needs: 'limit4',
    costs: [{ none: 300, wind: 300, earth: 300, water: 300, thunder: 300, fire: 300, ice: 300, light: 300, dark: 300 }],
  },
};

export const RESEARCH_ORDER = ['mixWind', 'mixEarth', 'mixWater', 'mixThunder', 'mixFire', 'mixIce', 'mixLight', 'mixDark', 'baseHp', 'attack', 'facility', 'pace', 'carry', 'limit1', 'limit2', 'limit3', 'limit4', 'limit5'];

/** 調合錬成で使うのに研究が要るエレメント → 研究 */
export const MIX_UNLOCK = { wind: 'mixWind', earth: 'mixEarth', water: 'mixWater', thunder: 'mixThunder', fire: 'mixFire', ice: 'mixIce', light: 'mixLight', dark: 'mixDark' };

// 1レベルあたりの効き目
export const BASE_HP_PER_LEVEL = 1;
export const ATTACK_PER_LEVEL = 0.05;
export const PACE_PER_LEVEL = 0.1;
export const FACILITY_PER_LEVEL = 0.1;
