// 進化（仮）。条件を満たすと、モンスター詳細で進化できる。進化するとレベルは1に戻る。
// 条件は戦闘の記録（モンスターごとの stats）で数える。
//   kills        敵を倒した数（とどめを刺した数）
//   swordKills   剣の台座の効果が乗った状態で倒した数
//   flagKills    追い風の旗の効果が乗った状態で倒した数
//   eliteKills   【強】の敵を倒した数
//   bossKills    ボスにとどめを刺した数
//   workerClears 作業施設（鍛冶場・錬金アトリエ・魔術研究所・極限研究所）で作業したまま地域を攻略した数
//   bossKills:敵の種類  そのボスにとどめを刺した数（例：bossKills:maou）
//   elementKills:属性   その属性の敵を倒した数（例：elementKills:dark）
//   burnKills   やけどしている敵（かがり火・火矢やぐら・溶岩の大釜）にとどめを刺した数
//   chillKills  攻撃で遅くなっている敵（つららの塔・氷の砲台・吹雪魔法陣・大渦の泉）を倒した数
//   slowKills   遅くなるマス（霧の噴水・闇の大時計の範囲）にいる敵を倒した数
//   exposeKills 受けるダメージが増えるマス（光の祭壇・アシッドポーション・闇の大時計の範囲）にいる敵を倒した数
//   「倒した数」はどれも、このモンスターの攻撃でとどめを刺した数（負けた回も数える）。「攻略」は勝ったときだけ数える
//   text は遊ぶ人が読む文。どの施設が対象かまで書く（2026-11-15：「凍えた敵」では分からないという報告で書き直した）
//   clears:地域          その地域を攻略したとき、配置されていた数（例：clears:snow）
//   nodeClears:属性     その属性の資源地のとなり（まわり8マス）に置いて攻略した数
//   perfectClears        拠点の耐久を減らさずに攻略したとき、配置されていた数
//   skill3Clears         技を3つ持った状態で攻略したとき、配置されていた数
// 進化すると、ちがう系統になることもある（2026-11-13、企画者OK）
export const EVOLUTIONS = {
  slime: { to: 'bigslime', stat: 'kills', n: 100, text: '敵を100体倒す' },
  sprite: { to: 'forestsprite', stat: 'bossKills', n: 1, text: 'ボスにとどめを刺す' },
  bat: { to: 'stormbat', stat: 'flagKills', n: 40, text: '追い風の旗の範囲に置いて、敵を40体倒す' },
  hawk: { to: 'eagle', stat: 'eliteKills', n: 3, text: '【強】の敵を3体倒す' },
  turtle: { to: 'rockturtle', stat: 'swordKills', n: 30, text: '剣の台座のまわり8マスに置いて、敵を30体倒す（剣の台座は、鍛冶場が動いている間だけ効く）' },
  golem: { to: 'irongolem', stat: 'workerClears', n: 1, text: '作業施設（鍛冶場・錬金アトリエ・魔術研究所・極限研究所）の作業場所で作業したまま、地域を攻略する' },
  fluffysheep: { to: 'wildram', stat: 'kills', n: 150, text: '敵を150体倒す' },
  mole: { to: 'bigmole', stat: 'eliteKills', n: 5, text: '【強】の敵を5体倒す' },
  demon: { to: 'maou', stat: 'bossKills:maou', n: 1, text: 'サーモルン魔王城のボス（まおう）にとどめを刺す' },
  metalspider: { to: 'deathmetalspider', stat: 'nodeClears:dark', n: 1, text: '闇の資源地のまわり8マスに置いて、地域を攻略する（持ち込んだ資源地でもよい）' },
  voidseed: { to: 'voidtree', stat: 'nodeClears:none', n: 1, text: '無の資源地のまわり8マスに置いて、地域を攻略する（持ち込んだ資源地でもよい）' },
  tornadoflower: { to: 'machinaflower', stat: 'flagKills', n: 100, text: '追い風の旗の範囲に置いて、敵を100体倒す' },
  musclea: { to: 'mastor', stat: 'swordKills', n: 100, text: '剣の台座のまわり8マスに置いて、敵を100体倒す（剣の台座は、鍛冶場が動いている間だけ効く）' },
  twilight: { to: 'dawnsprite', stat: 'exposeKills', n: 100, text: '光の祭壇・アシッドポーション・闇の大時計の範囲（敵が受けるダメージが増えるマス）にいる敵を、100体倒す' },
  toadstool: { to: 'illusionshroom', stat: 'elementKills:dark', n: 100, text: '闇の敵を100体倒す' },
  frostflower: { to: 'icebloom', stat: 'chillKills', n: 50, text: 'つららの塔・氷の砲台・吹雪魔法陣・大渦の泉の攻撃で遅くなっている敵を、50体倒す（遅くなるのは、攻撃が当たってから1〜2秒のあいだ）' },
  penguin: { to: 'emperorpenguin', stat: 'clears:snow', n: 3, text: 'モンレ雪山に置いたまま、3回攻略する' },
  dango: { to: 'muddoll', stat: 'elementKills:earth', n: 100, text: '土の敵を100体倒す' },
  sparkbot: { to: 'megasparkbot', stat: 'skill3Clears', n: 1, text: '技を3つ持った状態で地域に置き、攻略する' },
  windup: { to: 'karakuri', stat: 'perfectClears', n: 3, text: '地域に置いたまま、拠点の耐久を1も減らさずに3回攻略する' },
  firework: { to: 'starminebot', stat: 'elementKills:fire', n: 100, text: '炎の敵を100体倒す' },
  lizard: { to: 'sanddrake', stat: 'clears:desert', n: 5, text: 'ビリフ砂漠に置いたまま、5回攻略する' },
  frog: { to: 'rainfrog', stat: 'slowKills', n: 50, text: '霧の噴水・闇の大時計の範囲（敵が遅くなるマス）にいる敵を、50体倒す' },
  icefish: { to: 'oarfish', stat: 'elementKills:ice', n: 100, text: '氷の敵を100体倒す' },
  jelly: { to: 'bubblejelly', stat: 'clears:river', n: 5, text: 'キロット川に置いたまま、5回攻略する' },
  mudoctopus: { to: 'potoctopus', stat: 'kills', n: 200, text: '敵を200体倒す' },
  shockjelly: { to: 'boltjelly', stat: 'elementKills:thunder', n: 100, text: '雷の敵を100体倒す' },
  pearlclam: { to: 'pearlprincess', stat: 'elementKills:light', n: 100, text: '光の敵を100体倒す' },
  snowman: { to: 'blizzardspirit', stat: 'clears:mixed', n: 3, text: 'ルアップ混山に置いたまま、3回攻略する' },
  hinoko: { to: 'onibi', stat: 'burnKills', n: 50, text: 'かがり火・火矢やぐら・溶岩の大釜でやけどしている敵に、50回とどめを刺す（やけどのダメージで倒れた分は数えない）' },
};

/** 進化後 → 進化前 */
export const EVOLVED_FROM = Object.fromEntries(Object.entries(EVOLUTIONS).map(([from, e]) => [e.to, from]));
