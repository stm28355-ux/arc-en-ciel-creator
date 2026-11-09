// 地方と地域。第1地方（草原・森・砂漠）と第2地方（川・雷雨・海）が遊べる。地方の正式な名前は未決。
//
// マップの記号
//   .  地面（モンスター・施設を置ける。見た目は地域の ground で変わる）
//   #  道（敵が通る。置けない）   S 敵が出てくる所   B 拠点
//   資源地：N 無  W 風  E 土  A 水  Z 雷  F 炎  I 氷  L 光  D 闇
//   T  木（置けない）   ~  水（置けない）   R  岩（置けない）
//
// elements：その地域で手に入るエレメント（多い順）。資源地と敵の属性をこの割合にする
// requires：この地域を攻略すると開く
// ground：地面の見た目（grass 草原 / forest 森 / sand 砂漠 / river 川 / storm 雷雨 / sea 海）
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
  // ===== 第2地方（水・雷） =====
  river: {
    name: '川',
    province: 'p2',
    elements: ['water', 'none', 'earth'], // 水＞無・土
    requires: 'desert',
    ground: 'river',
    baseHp: 3,
    waveGap: 4,
    // 2本の川を橋でわたる。川のそばは置けない
    map: [
      'TT.......~~.......~~........',
      '.........~~.....T.~~....E...',
      '..E......~~.......~~........',
      '.....##########...~~........',
      '.....#...~~...#...~~..#####B',
      '.....#...~~...#...~~..#.....',
      '.....#...~~...#.A.~~..#.....',
      '.....#...~~.A.#...~~..#...T.',
      '...A.#...~~...#...~~..#....T',
      'T....#...~~...#...~~..#..A..',
      '.....#.N.~~...#...~~..#.....',
      '.....#...~~...#...~~..#.....',
      '.....#...~~...#########.....',
      'S#####...~~.......~~........',
      '.........~~.T.....~~N.......',
      '.........~~..T....~~......TT',
    ],
    waves: [
      [
        { enemy: 'fishling', count: 10, interval: 0.9, delay: 0 },
        { enemy: 'mistball', count: 6, interval: 1.1, delay: 4 },
      ],
      [
        { enemy: 'rivercrab', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'fishling', count: 10, interval: 0.7, delay: 3 },
      ],
      [
        { enemy: 'pebble', count: 6, interval: 1.6, delay: 0 },
        { enemy: 'rivercrab', count: 8, interval: 1, delay: 3 },
        { enemy: 'mistball', count: 8, interval: 0.8, delay: 6 },
      ],
      [
        { enemy: 'fishling', count: 14, interval: 0.6, delay: 0 },
        { enemy: 'rivercrab', count: 8, interval: 1, delay: 3 },
        { enemy: 'pebble', count: 6, interval: 1.4, delay: 6 },
        { enemy: 'catfish', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'fishling', count: 12, interval: 0.6, delay: 0 },
        { enemy: 'riverdragon', count: 1, interval: 1, delay: 6 },
        { enemy: 'rivercrab', count: 10, interval: 0.9, delay: 9 },
        { enemy: 'mistball', count: 8, interval: 0.8, delay: 12 },
        { enemy: 'catfish', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  storm: {
    name: '雷雨',
    province: 'p2',
    elements: ['thunder', 'water', 'earth'], // 雷＞水・土
    requires: 'river',
    ground: 'storm',
    baseHp: 3,
    waveGap: 4,
    // 岩場。道は長い横の3本
    map: [
      '.....RR......TT..A......T...',
      '..........................RR',
      'S####################.......',
      '....................#.......',
      '...T......Z.........#.......',
      '....................#..Z....',
      '.R..................#.....T.',
      '......###############......R',
      '......#.....................',
      '...Z..#..RR.......R......E..',
      '......#........Z............',
      '......#.....................',
      '......#####################B',
      '............................',
      '..E.....T...A.........RR....',
      'R...............T...........',
    ],
    waves: [
      [
        { enemy: 'sparkbug', count: 12, interval: 0.8, delay: 0 },
        { enemy: 'raincloud', count: 4, interval: 1.2, delay: 5 },
      ],
      [
        { enemy: 'raincloud', count: 8, interval: 1.1, delay: 0 },
        { enemy: 'sparkbug', count: 12, interval: 0.6, delay: 3 },
      ],
      [
        { enemy: 'mudman', count: 6, interval: 1.6, delay: 0 },
        { enemy: 'thunderbear', count: 6, interval: 1.3, delay: 3 },
        { enemy: 'sparkbug', count: 10, interval: 0.5, delay: 6 },
      ],
      [
        { enemy: 'thunderbear', count: 10, interval: 1, delay: 0 },
        { enemy: 'mudman', count: 6, interval: 1.4, delay: 3 },
        { enemy: 'raincloud', count: 8, interval: 0.8, delay: 6 },
        { enemy: 'thunderwolf', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'sparkbug', count: 14, interval: 0.5, delay: 0 },
        { enemy: 'raijinboss', count: 1, interval: 1, delay: 6 },
        { enemy: 'thunderbear', count: 8, interval: 0.9, delay: 9 },
        { enemy: 'raincloud', count: 6, interval: 1, delay: 12 },
        { enemy: 'thunderwolf', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  sea: {
    name: '海',
    province: 'p2',
    elements: ['water', 'thunder', 'wind'], // 水＞雷・風
    requires: 'storm',
    ground: 'sea',
    baseHp: 3,
    waveGap: 4,
    // 上と下が海の砂浜。道は短い
    map: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '..........~~~.......Z......R',
      '...A......~~~............W..',
      '...............#########....',
      'S#######.......#.......#....',
      '.......#.......#.......#..~~',
      '.......#.......#...A...#..~~',
      '.......#...A...#.......#....',
      '..W....#.......#.......#..A.',
      '.......#.......#.......#....',
      '.......#########.......#....',
      '.R...R.................####B',
      '...........Z......R.........',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    ],
    waves: [
      [
        { enemy: 'bluejelly', count: 10, interval: 1, delay: 0 },
        { enemy: 'seabreeze', count: 6, interval: 0.8, delay: 4 },
      ],
      [
        { enemy: 'shark', count: 8, interval: 1.1, delay: 0 },
        { enemy: 'stingray', count: 6, interval: 1.2, delay: 3 },
      ],
      [
        { enemy: 'bluejelly', count: 10, interval: 0.8, delay: 0 },
        { enemy: 'seabreeze', count: 10, interval: 0.5, delay: 3 },
        { enemy: 'shark', count: 6, interval: 1.2, delay: 6 },
      ],
      [
        { enemy: 'shark', count: 10, interval: 0.9, delay: 0 },
        { enemy: 'stingray', count: 8, interval: 1, delay: 3 },
        { enemy: 'bluejelly', count: 8, interval: 0.8, delay: 6 },
        { enemy: 'bigoctopus', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'seabreeze', count: 12, interval: 0.5, delay: 0 },
        { enemy: 'seaking', count: 1, interval: 1, delay: 6 },
        { enemy: 'shark', count: 10, interval: 0.8, delay: 9 },
        { enemy: 'stingray', count: 6, interval: 1, delay: 12 },
        { enemy: 'bigoctopus', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
};

export const PROVINCES = [
  { id: 'p1', name: '第1地方（名前は未定）', elements: ['none', 'wind', 'earth'], regions: ['grassland', 'forest', 'desert'] },
  { id: 'p2', name: '第2地方（名前は未定）', elements: ['water', 'thunder'], regions: ['river', 'storm', 'sea'] },
  // 第3・第4地方の手に入るエレメント（企画者の案。作るときにこの割合にする）
  //   火山：炎＞土・雷 / 雪山：氷＞水・風 / 混成：炎・氷＞無
  //   第4地方は資材が少なめで、資源地の数で決める。聖域：光2・炎1 / 境界：光1・闇1 / 魔王城：闇1
  { id: 'p3', name: '第3地方', elements: ['fire', 'ice'], regions: [], note: '火山・雪山・混成（炎・氷）' },
  { id: 'p4', name: '第4地方', elements: ['light', 'dark'], regions: [], note: '聖域・境界・魔王城（光・闇）。資材が少なめ' },
];
