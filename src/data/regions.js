// 地方と地域。第1地方の草原だけ遊べる（仮版）。地方の正式な名前は未決。
//
// マップの記号
//   .  草地（モンスター・施設を置ける）
//   #  道（敵が通る。置けない）   S 敵が出てくる所   B 拠点
//   N  資源地：無（牧草地）   W  資源地：風（風の丘）   E  資源地：土（岩場）
//   T  木（置けない）          ~  池（置けない）
export const REGIONS = {
  grassland: {
    name: '草原',
    province: 'p1',
    elements: ['none', 'wind', 'earth'],
    baseHp: 3,
    waveGap: 4, // ウェーブとウェーブの間の待ち時間（秒）。進行施設で縮められる
    map: [
      '............................',
      '..........W.T......T.....TT.',
      '..........................T.',
      'S#######....................',
      '.......#......########......',
      '.......#......#......#......',
      '....N..#......#......#......',
      '.......#......#......#..W...',
      '.......#...N..#......#......',
      '.TT....#......#.E....#......',
      '.T.....#......#......#......',
      '.......#......#......######B',
      '.......########.............',
      '.....E......................',
      '.........~~.......N.....N...',
      '.........~~~................',
    ],
    // ウェーブ：敵の出方。delay = ウェーブ開始からの秒、interval = 1体ごとの間隔（秒）
    waves: [
      [{ enemy: 'slime', count: 8, interval: 1.2, delay: 0 }],
      [
        { enemy: 'slime', count: 8, interval: 1.0, delay: 0 },
        { enemy: 'rabbit', count: 6, interval: 0.8, delay: 4 },
      ],
      [
        { enemy: 'mole', count: 8, interval: 1.6, delay: 0 },
        { enemy: 'slime', count: 8, interval: 0.9, delay: 2 },
      ],
      [
        { enemy: 'rabbit', count: 12, interval: 0.6, delay: 0 },
        { enemy: 'mole', count: 8, interval: 1.4, delay: 3 },
        { enemy: 'slime', count: 10, interval: 0.7, delay: 6 },
      ],
      [
        { enemy: 'slime', count: 10, interval: 0.8, delay: 0 },
        { enemy: 'king', count: 1, interval: 1, delay: 6 },
        { enemy: 'rabbit', count: 10, interval: 0.5, delay: 9 },
        { enemy: 'mole', count: 6, interval: 1.2, delay: 12 },
      ],
    ],
  },
  forest: { name: '森', province: 'p1', elements: ['wind', 'earth'], locked: true },
  desert: { name: '砂漠', province: 'p1', elements: ['earth', 'none'], locked: true },
};

export const PROVINCES = [
  { id: 'p1', name: '第1地方（名前は未定）', regions: ['grassland', 'forest', 'desert'] },
  { id: 'p2', name: '第2地方', regions: [], note: '川・雷雨・海（水・雷）' },
  { id: 'p3', name: '第3地方', regions: [], note: '火山・雪山・混成（炎・氷）' },
  { id: 'p4', name: '第4地方', regions: [], note: '聖域・境界・魔王城（光・闇）' },
];
