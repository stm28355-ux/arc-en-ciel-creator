// 地方と地域。第1地方（草原・森・砂漠）が遊べる。地方の正式な名前は未決。
//
// マップの記号
//   .  地面（モンスター・施設を置ける。見た目は地域の ground で変わる）
//   #  道（敵が通る。置けない）   S 敵が出てくる所   B 拠点
//   N  資源地：無   W  資源地：風   E  資源地：土
//   T  木（置けない）   ~  水（置けない）   R  岩（置けない）
//
// elements：その地域で手に入るエレメント（多い順）。資源地と敵の属性をこの割合にする
// requires：この地域を攻略すると開く
// ground：地面の見た目（grass 草原 / forest 森 / sand 砂漠）
export const REGIONS = {
  grassland: {
    name: '草原',
    province: 'p1',
    elements: ['none', 'wind'], // 無＞風。土は出ない（土は森から）
    ground: 'grass',
    baseHp: 3,
    waveGap: 4, // ウェーブとウェーブの間の待ち時間（秒）
    map: [
      '............................',
      '..........W.T......T.....TT.',
      '..........................T.',
      'S#######....................',
      '.......#......########......',
      '.......#......#......#......',
      '....N..#......#......#......',
      '.......#......#......#......',
      '.......#...N..#......#......',
      '.TT....#......#.N....#......',
      '.T.....#......#......#.W....',
      '.......#......#......######B',
      '.......########.............',
      '.....W......................',
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
        { enemy: 'sheep', count: 8, interval: 1.6, delay: 0 },
        { enemy: 'slime', count: 8, interval: 0.9, delay: 2 },
      ],
      [
        { enemy: 'rabbit', count: 12, interval: 0.6, delay: 0 },
        { enemy: 'sheep', count: 8, interval: 1.4, delay: 3 },
        { enemy: 'slime', count: 10, interval: 0.7, delay: 6 },
        { enemy: 'ram', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'slime', count: 10, interval: 0.8, delay: 0 },
        { enemy: 'king', count: 1, interval: 1, delay: 6 },
        { enemy: 'rabbit', count: 10, interval: 0.5, delay: 9 },
        { enemy: 'sheep', count: 6, interval: 1.2, delay: 12 },
        { enemy: 'ram', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  forest: {
    name: '森',
    province: 'p1',
    elements: ['wind', 'earth', 'none'], // 風＞土・無
    requires: 'grassland',
    ground: 'forest',
    baseHp: 3,
    waveGap: 4,
    // 木が多く、道のそばに置ける場所が少ない。道は長い
    map: [
      'TTT.....TTT..TT.....TTT..TTT',
      'T........T....T......T....TT',
      'S######.................T..T',
      '......#...TT....W........N..',
      '...W..#.....................',
      '......#.TT..########........',
      '..T...#..T..#......#........',
      '..TT..#.....#......#..TT....',
      '......#.....#..E.T.#...T.T..',
      '....N.#...W.#......#......T.',
      '...T..#.T...#..TT..#........',
      '......#.....#...T..#...W....',
      '.T....#######......#........',
      '.TT~~..............########B',
      '....~...E.....TT............',
      'TT.............TT....TT...TT',
    ],
    waves: [
      [
        { enemy: 'squirrel', count: 10, interval: 1.0, delay: 0 },
        { enemy: 'moss', count: 4, interval: 1.2, delay: 6 },
      ],
      [
        { enemy: 'moss', count: 8, interval: 1.0, delay: 0 },
        { enemy: 'squirrel', count: 10, interval: 0.7, delay: 4 },
      ],
      [
        { enemy: 'mushroom', count: 6, interval: 1.8, delay: 0 },
        { enemy: 'owl', count: 6, interval: 1.2, delay: 3 },
        { enemy: 'squirrel', count: 8, interval: 0.6, delay: 6 },
      ],
      [
        { enemy: 'owl', count: 10, interval: 1.0, delay: 0 },
        { enemy: 'mushroom', count: 6, interval: 1.5, delay: 3 },
        { enemy: 'moss', count: 8, interval: 0.8, delay: 6 },
        { enemy: 'bigowl', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'squirrel', count: 12, interval: 0.6, delay: 0 },
        { enemy: 'treant', count: 1, interval: 1, delay: 6 },
        { enemy: 'owl', count: 8, interval: 0.9, delay: 9 },
        { enemy: 'mushroom', count: 6, interval: 1.4, delay: 12 },
        { enemy: 'bigowl', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  desert: {
    name: '砂漠',
    province: 'p1',
    elements: ['earth', 'wind', 'none'], // 土＞風・無
    requires: 'forest',
    ground: 'sand',
    baseHp: 3,
    waveGap: 4,
    // 岩とオアシスのほかは開けていて置きやすい。道は短い
    map: [
      'RR.........W..........RR....',
      'R.....RR....................',
      '.........##########.......RR',
      '.........#........#........R',
      '.........#...E....#....W....',
      '.........#........#.........',
      '.....E...#.....RR.#.........',
      '.........#.....R..#.....RR..',
      'S#########...~~...#..E......',
      '.............~~...#.........',
      '..................#......N..',
      '...N........E.....#.........',
      'R.................#.........',
      '..................#########B',
      '..RR......R.................',
      '...R.......R.........R......',
    ],
    waves: [
      [
        { enemy: 'dust', count: 10, interval: 0.9, delay: 0 },
        { enemy: 'mole', count: 6, interval: 1.4, delay: 4 },
      ],
      [
        { enemy: 'mole', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'dryslime', count: 6, interval: 1.0, delay: 3 },
        { enemy: 'dust', count: 8, interval: 0.6, delay: 6 },
      ],
      [
        { enemy: 'scorpion', count: 6, interval: 1.8, delay: 0 },
        { enemy: 'mole', count: 8, interval: 1.1, delay: 3 },
        { enemy: 'dust', count: 10, interval: 0.5, delay: 6 },
      ],
      [
        { enemy: 'mole', count: 10, interval: 1.0, delay: 0 },
        { enemy: 'scorpion', count: 6, interval: 1.5, delay: 3 },
        { enemy: 'dryslime', count: 8, interval: 0.8, delay: 6 },
        { enemy: 'bigmole', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'dust', count: 12, interval: 0.5, delay: 0 },
        { enemy: 'sandking', count: 1, interval: 1, delay: 6 },
        { enemy: 'scorpion', count: 8, interval: 1.2, delay: 9 },
        { enemy: 'mole', count: 8, interval: 1.0, delay: 12 },
        { enemy: 'bigmole', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
};

export const PROVINCES = [
  { id: 'p1', name: '第1地方（名前は未定）', elements: ['none', 'wind', 'earth'], regions: ['grassland', 'forest', 'desert'] },
  { id: 'p2', name: '第2地方', elements: ['water', 'thunder'], regions: [], note: '川・雷雨・海（水・雷）' },
  { id: 'p3', name: '第3地方', elements: ['fire', 'ice'], regions: [], note: '火山・雪山・混成（炎・氷）' },
  { id: 'p4', name: '第4地方', elements: ['light', 'dark'], regions: [], note: '聖域・境界・魔王城（光・闇）' },
];
