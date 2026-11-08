// 研究（仮）。エレメントを使って、ゲーム全体に効く強化を進める（企画まとめ「研究（永続強化）」）。
// 研究したものは ON/OFF できる（縛りプレイ用）。OFF にしても使ったエレメントは戻らない。
//   max:   研究できる回数（レベル）
//   costs: レベルごとの値段（costs[0] がレベル1にする値段）
//   needs: 先に研究しておくもの
// 草原を1回攻略すると約116、攻略後の自動獲得は約0.38/秒（v0.4.2 のシミュレーション）。値段はこれを目安にした仮のもの。
export const RESEARCH = {
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
  pace: {
    name: '獲得ペース',
    desc: '攻略した地域から自動で入るエレメント +10%',
    max: 5,
    costs: [1, 2, 3, 4, 5].map((n) => ({ none: 35 * n, earth: 15 * n })),
  },
  carry: {
    name: '資源地の持ち込み',
    desc: '攻略した地域の資源地を、地域マップに1つ持ち込める（どの地域でも）',
    max: 2,
    costs: [{ none: 50, wind: 50, earth: 50 }, { none: 150, wind: 150, earth: 150 }],
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
};

export const RESEARCH_ORDER = ['baseHp', 'attack', 'pace', 'carry', 'limit1', 'limit2'];

// 1レベルあたりの効き目
export const BASE_HP_PER_LEVEL = 1;
export const ATTACK_PER_LEVEL = 0.05;
export const PACE_PER_LEVEL = 0.1;
