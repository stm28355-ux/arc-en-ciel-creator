// 進化（仮）。条件を満たすと、モンスター詳細で進化できる。進化するとレベルは1に戻る。
// 条件は戦闘の記録（モンスターごとの stats）で数える。
//   kills        敵を倒した数（とどめを刺した数）
//   swordKills   剣の台座の効果が乗った状態で倒した数
//   flagKills    追い風の旗の効果が乗った状態で倒した数
//   eliteKills   【強】の敵を倒した数
//   bossKills    ボスにとどめを刺した数
//   workerClears 鍛冶場で作業したまま地域を攻略した数
//   bossKills:敵の種類  そのボスにとどめを刺した数（例：bossKills:maou）
//   elementKills:属性   その属性の敵を倒した数（例：elementKills:dark）
//   burnKills / chillKills / slowKills / exposeKills  やけど・凍えた・霧で遅くなった・光の祭壇の範囲の敵を倒した数
//   clears:地域          その地域を攻略したとき、配置されていた数（例：clears:snow）
//   nodeClears:属性     その属性の資源地のとなり（まわり8マス）に置いて攻略した数
//   perfectClears        拠点の耐久を減らさずに攻略したとき、配置されていた数
//   skill3Clears         技を3つ持った状態で攻略したとき、配置されていた数
// 進化すると、ちがう系統になることもある（2026-11-13、企画者OK）
export const EVOLUTIONS = {
  slime: { to: 'bigslime', stat: 'kills', n: 100, text: '敵を100体倒す' },
  sprite: { to: 'forestsprite', stat: 'bossKills', n: 1, text: 'ボスにとどめを刺す' },
  bat: { to: 'stormbat', stat: 'flagKills', n: 40, text: '追い風の旗の効果が乗った状態で、敵を40体倒す' },
  hawk: { to: 'eagle', stat: 'eliteKills', n: 3, text: '【強】の敵を3体倒す' },
  turtle: { to: 'rockturtle', stat: 'swordKills', n: 30, text: '剣の台座の効果が乗った状態で、敵を30体倒す' },
  golem: { to: 'irongolem', stat: 'workerClears', n: 1, text: '鍛冶場で作業したまま、地域を攻略する' },
  fluffysheep: { to: 'wildram', stat: 'kills', n: 150, text: '敵を150体倒す' },
  mole: { to: 'bigmole', stat: 'eliteKills', n: 5, text: '【強】の敵を5体倒す' },
  demon: { to: 'maou', stat: 'bossKills:maou', n: 1, text: '魔王城のまおうにとどめを刺す' },
  metalspider: { to: 'deathmetalspider', stat: 'nodeClears:dark', n: 1, text: '闇の資源地のとなりに置いて、地域を攻略する' },
  voidseed: { to: 'voidtree', stat: 'nodeClears:none', n: 1, text: '無の資源地のとなりに置いて、地域を攻略する' },
  tornadoflower: { to: 'machinaflower', stat: 'flagKills', n: 100, text: '追い風の旗の効果が乗った状態で、敵を100体倒す' },
  musclea: { to: 'mastor', stat: 'swordKills', n: 100, text: '剣の台座の効果が乗った状態で、敵を100体倒す' },
  twilight: { to: 'dawnsprite', stat: 'exposeKills', n: 100, text: '光の祭壇の範囲で、敵を100体倒す' },
  toadstool: { to: 'illusionshroom', stat: 'elementKills:dark', n: 100, text: '闇の敵を100体倒す' },
  frostflower: { to: 'icebloom', stat: 'chillKills', n: 50, text: '凍えた敵を50体倒す' },
  penguin: { to: 'emperorpenguin', stat: 'clears:snow', n: 3, text: '雪山を3回攻略したとき、配置されている' },
  dango: { to: 'muddoll', stat: 'elementKills:earth', n: 100, text: '土の敵を100体倒す' },
  sparkbot: { to: 'megasparkbot', stat: 'skill3Clears', n: 1, text: '技を3つ持った状態で、地域を攻略する' },
  windup: { to: 'karakuri', stat: 'perfectClears', n: 3, text: '拠点の耐久を減らさずに、地域を3回攻略する' },
  firework: { to: 'starminebot', stat: 'elementKills:fire', n: 100, text: '炎の敵を100体倒す' },
  lizard: { to: 'sanddrake', stat: 'clears:desert', n: 5, text: '砂漠を5回攻略したとき、配置されている' },
  frog: { to: 'rainfrog', stat: 'slowKills', n: 50, text: '霧の噴水で遅くなった敵を50体倒す' },
  icefish: { to: 'oarfish', stat: 'elementKills:ice', n: 100, text: '氷の敵を100体倒す' },
  jelly: { to: 'bubblejelly', stat: 'clears:river', n: 5, text: '川を5回攻略したとき、配置されている' },
  mudoctopus: { to: 'potoctopus', stat: 'kills', n: 200, text: '敵を200体倒す' },
  shockjelly: { to: 'boltjelly', stat: 'elementKills:thunder', n: 100, text: '雷の敵を100体倒す' },
  pearlclam: { to: 'pearlprincess', stat: 'elementKills:light', n: 100, text: '光の敵を100体倒す' },
  snowman: { to: 'blizzardspirit', stat: 'clears:mixed', n: 3, text: '混成を3回攻略したとき、配置されている' },
  hinoko: { to: 'onibi', stat: 'burnKills', n: 50, text: 'やけどの敵に50回とどめを刺す' },
};

/** 進化後 → 進化前 */
export const EVOLVED_FROM = Object.fromEntries(Object.entries(EVOLUTIONS).map(([from, e]) => [e.to, from]));
