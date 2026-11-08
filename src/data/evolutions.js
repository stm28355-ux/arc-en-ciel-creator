// 進化（仮）。条件を満たすと、モンスター詳細で進化できる。進化するとレベルは1に戻る。
// 条件は戦闘の記録（モンスターごとの stats）で数える。
//   kills        敵を倒した数（とどめを刺した数）
//   swordKills   剣の台座の効果が乗った状態で倒した数
//   flagKills    追い風の旗の効果が乗った状態で倒した数
//   eliteKills   【強】の敵を倒した数
//   bossKills    ボスにとどめを刺した数
//   workerClears 鍛冶場で作業したまま地域を攻略した数
export const EVOLUTIONS = {
  slime: { to: 'bigslime', stat: 'kills', n: 100, text: '敵を100体倒す' },
  sprite: { to: 'forestsprite', stat: 'bossKills', n: 1, text: 'ボスにとどめを刺す' },
  bat: { to: 'stormbat', stat: 'flagKills', n: 40, text: '追い風の旗の効果が乗った状態で、敵を40体倒す' },
  hawk: { to: 'eagle', stat: 'eliteKills', n: 3, text: '【強】の敵を3体倒す' },
  turtle: { to: 'rockturtle', stat: 'swordKills', n: 30, text: '剣の台座の効果が乗った状態で、敵を30体倒す' },
  golem: { to: 'irongolem', stat: 'workerClears', n: 1, text: '鍛冶場で作業したまま、地域を攻略する' },
};

/** 進化後 → 進化前 */
export const EVOLVED_FROM = Object.fromEntries(Object.entries(EVOLUTIONS).map(([from, e]) => [e.to, from]));
