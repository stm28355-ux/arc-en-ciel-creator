import { HARD_REGIONS, HARD_ORDER } from './hard.js';
// 地方と地域。第1〜第4地方の12地域。第4地方の魔王城を攻略すると表のクリア。地方の正式な名前は未決。
//
// マップの記号
//   .  地面（モンスター・施設を置ける。見た目は地域の ground で変わる）
//   #  道（敵が通る。置けない）   S 敵が出てくる所   B 拠点
//   資源地：N 無  W 風  E 土  A 水  Z 雷  F 炎  I 氷  L 光  D 闇
//   T  木（置けない）   ~  水（置けない）   R  岩（置けない）   V  溶岩（置けない）
//   S と B は複数あってよい（2か所から出る、拠点が2か所）。道は二股に分かれたり合流したりしてよい
//
// elements：その地域で手に入るエレメント（多い順）。資源地と敵の属性をこの割合にする
// requires：この地域を攻略すると開く
// ground：地面の見た目（grass 草原 / forest 森 / sand 砂漠 / river 川 / storm 雷雨 / sea 海 / volcano 火山 / snow 雪山 / mixed 混成 / holy 聖域 / boundary 境界 / castle 魔王城）
// finale：はじめて攻略すると表のクリア
export const REGIONS = {
  grassland: {
    name: 'チキル平原',
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
    name: 'ポーカ森林',
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
    name: 'ビリフ砂漠',
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
    name: 'キロット川',
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
    name: 'パリカ雷雨荒野',
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
    name: 'ガーリク海',
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
  // ===== 第3地方（炎・氷）。道の形が地域ごとに違う =====
  volcano: {
    name: 'レオジン火山',
    province: 'p3',
    elements: ['fire', 'earth', 'thunder'], // 炎＞土・雷
    requires: 'sea',
    ground: 'volcano',
    baseHp: 3,
    waveGap: 4,
    // 道が二股に分かれて、また合流する（敵は上と下の道に交互に入る）。真ん中は溶岩
    map: [
      'VV...........Z..............',
      'V......................RR...',
      '.....############...........',
      '.....#..........#...........',
      '..F..#....F.....#.....F.....',
      '.....#..........#...........',
      '.....#..VVVVVV..#...........',
      'S#####..VVVVVV..###########B',
      '.....#..VVVVVV..#...........',
      '.....#..........#...........',
      '.....#....F.....#...E.......',
      '.....#..........#........Z..',
      '.....############...........',
      '..E.........................',
      '.......R...........V.......V',
      '............R.......V.....VV',
    ],
    waves: [
      [
        { enemy: 'firesprite', count: 10, interval: 0.9, delay: 0 },
        { enemy: 'sparkfox', count: 4, interval: 1, delay: 5 },
      ],
      [
        { enemy: 'lavaslug', count: 6, interval: 1.6, delay: 0 },
        { enemy: 'firesprite', count: 10, interval: 0.7, delay: 3 },
      ],
      [
        { enemy: 'magmarock', count: 6, interval: 1.5, delay: 0 },
        { enemy: 'firesprite', count: 10, interval: 0.6, delay: 3 },
        { enemy: 'sparkfox', count: 6, interval: 0.8, delay: 6 },
      ],
      [
        { enemy: 'lavaslug', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'magmarock', count: 6, interval: 1.3, delay: 3 },
        { enemy: 'firesprite', count: 10, interval: 0.6, delay: 6 },
        { enemy: 'flamegiant', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'firesprite', count: 12, interval: 0.5, delay: 0 },
        { enemy: 'volcanoking', count: 1, interval: 1, delay: 6 },
        { enemy: 'lavaslug', count: 8, interval: 1, delay: 9 },
        { enemy: 'sparkfox', count: 6, interval: 0.8, delay: 12 },
        { enemy: 'flamegiant', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  snow: {
    name: 'モンレ雪山',
    province: 'p3',
    elements: ['ice', 'water', 'wind'], // 氷＞水・風
    requires: 'volcano',
    ground: 'snow',
    baseHp: 3,
    waveGap: 4,
    // 敵が上と下の2か所から出てきて、途中で合流する
    map: [
      '..TT..........TT..........TT',
      '............................',
      'S##########...............R.',
      '..........#.......W.........',
      '.....I....#.................',
      '..........#...........#####B',
      '..........#..I....R...#.....',
      '.......R..#...........#.....',
      '..T....R..#######.....#.A...',
      '...T...R..#.....#.....#.....',
      '..........#.....#..I..#.....',
      '..........#.R...#.....#....T',
      '.....I....#.....#######.....',
      '..........#.................',
      'S##########..A...........W..',
      '....................TT..R...',
    ],
    waves: [
      [
        { enemy: 'snowhare', count: 10, interval: 0.9, delay: 0 },
        { enemy: 'gust', count: 4, interval: 0.8, delay: 5 },
      ],
      [
        { enemy: 'icebeetle', count: 6, interval: 1.6, delay: 0 },
        { enemy: 'snowhare', count: 10, interval: 0.7, delay: 3 },
      ],
      [
        { enemy: 'sleetcloud', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'snowhare', count: 10, interval: 0.6, delay: 3 },
        { enemy: 'gust', count: 6, interval: 0.6, delay: 6 },
      ],
      [
        { enemy: 'icebeetle', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'sleetcloud', count: 6, interval: 1.2, delay: 3 },
        { enemy: 'snowhare', count: 10, interval: 0.6, delay: 6 },
        { enemy: 'yeti', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'snowhare', count: 12, interval: 0.5, delay: 0 },
        { enemy: 'snowqueen', count: 1, interval: 1, delay: 6 },
        { enemy: 'icebeetle', count: 8, interval: 1, delay: 9 },
        { enemy: 'gust', count: 6, interval: 0.6, delay: 12 },
        { enemy: 'yeti', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  mixed: {
    name: 'ルアップ混山',
    province: 'p3',
    elements: ['fire', 'ice', 'none'], // 炎・氷＞無
    requires: 'snow',
    ground: 'mixed',
    baseHp: 3,
    waveGap: 4,
    // 途中で分かれて、拠点が上と下の2か所にある（拠点の耐久は1つ。どちらに通されても減る）。上は溶岩、下は岩
    map: [
      'VVV.......VV..............VV',
      'V.............F............V',
      '............................',
      '........############........',
      '........#..........#...F....',
      '....F...#..........#........',
      '........#.......VV.########B',
      '........#...................',
      'S########....N..........N...',
      '........#...................',
      '........#.......RR.########B',
      '....I...#..........#........',
      '........#..........#...I....',
      '........############........',
      'R..........................R',
      'RRR.......RR..I...........RR',
    ],
    waves: [
      [
        { enemy: 'firefly', count: 8, interval: 0.9, delay: 0 },
        { enemy: 'frostfly', count: 8, interval: 0.9, delay: 0.45 },
      ],
      [
        { enemy: 'greyslime', count: 8, interval: 1, delay: 0 },
        { enemy: 'firefly', count: 8, interval: 0.8, delay: 3 },
        { enemy: 'frostfly', count: 8, interval: 0.8, delay: 3.4 },
      ],
      [
        { enemy: 'ashgolem', count: 5, interval: 1.6, delay: 0 },
        { enemy: 'frostgolem', count: 5, interval: 1.6, delay: 0.8 },
        { enemy: 'greyslime', count: 6, interval: 0.8, delay: 6 },
      ],
      [
        { enemy: 'firefly', count: 10, interval: 0.6, delay: 0 },
        { enemy: 'frostfly', count: 10, interval: 0.6, delay: 0.3 },
        { enemy: 'ashgolem', count: 4, interval: 1.4, delay: 4 },
        { enemy: 'frostgolem', count: 4, interval: 1.4, delay: 4.7 },
        { enemy: 'chimera', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'greyslime', count: 10, interval: 0.6, delay: 0 },
        { enemy: 'twinking', count: 1, interval: 1, delay: 6 },
        { enemy: 'firefly', count: 8, interval: 0.7, delay: 9 },
        { enemy: 'frostfly', count: 8, interval: 0.7, delay: 9.35 },
        { enemy: 'chimera', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  // ===== 第4地方（光・闇）。資材が少なめ（資源地の数：聖域 光2・炎1、境界 光1・闇1、魔王城 闇1） =====
  sanctuary: {
    name: 'マグパロ聖域',
    province: 'p4',
    elements: ['light', 'fire'], // 光2・炎1
    requires: 'mixed',
    ground: 'holy',
    baseHp: 3,
    waveGap: 4,
    // 道は1本で長い。水と柱で置ける場所が少し減る
    map: [
      '............................',
      '............................',
      '..R...########..RR..#######B',
      '......#......#......#.......',
      '..R...#......#......#.......',
      '......#......#......#.......',
      '......#..~~..#......#...R.R.',
      '......#..~~..#...L..#.......',
      '...L..#..~~..#......#.......',
      '......#..~~..#......#.......',
      '......#......#......#...F...',
      '......#......#......#.......',
      '......#......#......#.......',
      'S######..RR..########..~~~..',
      '.......................~~~..',
      '.......................~~~..',
    ],
    waves: [
      [
        { enemy: 'wisplight', count: 10, interval: 0.9, delay: 0 },
        { enemy: 'flamespirit', count: 6, interval: 1, delay: 4 },
      ],
      [
        { enemy: 'holyknight', count: 6, interval: 1.6, delay: 0 },
        { enemy: 'wisplight', count: 10, interval: 0.7, delay: 3 },
      ],
      [
        { enemy: 'flamespirit', count: 10, interval: 0.8, delay: 0 },
        { enemy: 'holyknight', count: 6, interval: 1.4, delay: 3 },
        { enemy: 'wisplight', count: 8, interval: 0.6, delay: 6 },
      ],
      [
        { enemy: 'holyknight', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'flamespirit', count: 10, interval: 0.8, delay: 3 },
        { enemy: 'wisplight', count: 10, interval: 0.6, delay: 6 },
        { enemy: 'seraph', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'wisplight', count: 12, interval: 0.5, delay: 0 },
        { enemy: 'sanctuaryguard', count: 1, interval: 1, delay: 6 },
        { enemy: 'holyknight', count: 8, interval: 1, delay: 9 },
        { enemy: 'flamespirit', count: 10, interval: 0.7, delay: 12 },
        { enemy: 'seraph', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  boundary: {
    name: 'ハチマチ境界',
    province: 'p4',
    elements: ['light', 'dark'], // 光1・闇1
    requires: 'sanctuary',
    ground: 'boundary',
    baseHp: 3,
    waveGap: 4,
    // 2列：上の道（光の側）と下の道（闇の側）が別々で、拠点も2か所（拠点の耐久は1つ）。真ん中は境目の水
    map: [
      '.............R..............',
      '............................',
      'S########..........########B',
      '........#..........#........',
      '....L...#..........#........',
      '........#..........#........',
      '........############........',
      'R.........~~~~~~~~........R.',
      '.R........~~~~~~~~.........R',
      '........############........',
      '........#..........#........',
      '........#..........#...D....',
      '........#..........#........',
      'S########..........########B',
      '............................',
      '..............R.............',
    ],
    waves: [
      [
        { enemy: 'lightling', count: 8, interval: 0.9, delay: 0 },
        { enemy: 'shadowling', count: 8, interval: 0.9, delay: 0.45 },
      ],
      [
        { enemy: 'lightguard', count: 4, interval: 1.6, delay: 0 },
        { enemy: 'darkguard', count: 4, interval: 1.6, delay: 0.8 },
        { enemy: 'lightling', count: 6, interval: 0.8, delay: 5 },
        { enemy: 'shadowling', count: 6, interval: 0.8, delay: 5.4 },
      ],
      [
        { enemy: 'lightling', count: 10, interval: 0.6, delay: 0 },
        { enemy: 'shadowling', count: 10, interval: 0.6, delay: 0.3 },
        { enemy: 'lightguard', count: 4, interval: 1.4, delay: 5 },
        { enemy: 'darkguard', count: 4, interval: 1.4, delay: 5.7 },
      ],
      [
        { enemy: 'lightguard', count: 6, interval: 1.2, delay: 0 },
        { enemy: 'darkguard', count: 6, interval: 1.2, delay: 0.6 },
        { enemy: 'lightling', count: 8, interval: 0.6, delay: 6 },
        { enemy: 'shadowling', count: 8, interval: 0.6, delay: 6.3 },
        { enemy: 'eclipse', count: 1, interval: 1, delay: 10 },
      ],
      [
        { enemy: 'lightling', count: 10, interval: 0.5, delay: 0 },
        { enemy: 'shadowling', count: 10, interval: 0.5, delay: 0.25 },
        { enemy: 'borderking', count: 1, interval: 1, delay: 6 },
        { enemy: 'darkguard', count: 6, interval: 1, delay: 9 },
        { enemy: 'lightguard', count: 6, interval: 1, delay: 9.5 },
        { enemy: 'eclipse', count: 2, interval: 3, delay: 14 },
      ],
    ],
  },
  castle: {
    name: 'サーモルン魔王城',
    province: 'p4',
    elements: ['dark'], // 闇1
    requires: 'boundary',
    ground: 'castle',
    finale: true, // はじめて攻略すると「表のクリア」
    baseHp: 3,
    waveGap: 4,
    // 2か所から出て合流し、また分かれて拠点が2か所（道は4通り）。上と下は溶岩
    map: [
      'VVVVVVVVVVVVVVVVVVVVVVVVVVVV',
      '........................R...',
      'S######.....................',
      '......#.......#############B',
      '......#...R...#.............',
      '...R..#.......#.R...........',
      '......#.......#...VVVVVV....',
      '......#########...VVVVVV....',
      '......#.......#...VVVVVV....',
      '...R..#.......#.R...........',
      '......#...D...#.............',
      '......#.......#############B',
      'S######.....................',
      '........................R...',
      '............................',
      'VVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    ],
    waves: [
      [
        { enemy: 'imp', count: 12, interval: 0.8, delay: 0 },
        { enemy: 'gargoyle', count: 4, interval: 1.2, delay: 6 },
      ],
      [
        { enemy: 'darkknight', count: 6, interval: 1.6, delay: 0 },
        { enemy: 'imp', count: 12, interval: 0.6, delay: 3 },
      ],
      [
        { enemy: 'lich', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'gargoyle', count: 8, interval: 0.9, delay: 3 },
        { enemy: 'imp', count: 12, interval: 0.5, delay: 6 },
      ],
      [
        { enemy: 'darkknight', count: 8, interval: 1.2, delay: 0 },
        { enemy: 'lich', count: 8, interval: 1, delay: 3 },
        { enemy: 'imp', count: 12, interval: 0.5, delay: 6 },
        { enemy: 'demonlord', count: 2, interval: 4, delay: 10 },
      ],
      [
        { enemy: 'imp', count: 16, interval: 0.4, delay: 0 },
        { enemy: 'maou', count: 1, interval: 1, delay: 6 },
        { enemy: 'darkknight', count: 8, interval: 1, delay: 9 },
        { enemy: 'gargoyle', count: 8, interval: 0.7, delay: 12 },
        { enemy: 'demonlord', count: 4, interval: 3, delay: 14 },
      ],
    ],
  },
};

// 地方の名前（2026-11-14 企画者の決定）。no は何番目の地方か（研究などの説明では「第1地方」と書く）
export const PROVINCES = [
  { id: 'p1', no: 1, name: 'ミルト王国', elements: ['none', 'wind', 'earth'], regions: ['grassland', 'forest', 'desert'] },
  { id: 'p2', no: 2, name: 'べジブ共和国', elements: ['water', 'thunder'], regions: ['river', 'storm', 'sea'] },
  // 第3・第4地方の手に入るエレメント（企画者の案。作るときにこの割合にする）
  //   火山：炎＞土・雷 / 雪山：氷＞水・風 / 混成：炎・氷＞無
  //   第4地方は資材が少なめで、資源地の数で決める。聖域：光2・炎1 / 境界：光1・闇1 / 魔王城：闇1
  { id: 'p3', no: 3, name: 'フツルー山脈', elements: ['fire', 'ice'], regions: ['volcano', 'snow', 'mixed'] },
  { id: 'p4', no: 4, name: 'フィラッシュ混沌地', elements: ['light', 'dark'], regions: ['sanctuary', 'boundary', 'castle'] },
];

// 高難易度（フェーズ9、2026-11-14）：ツーイス未踏区域の10地域。中身は src/data/hard.js。地図のまん中の霧の島から入る
Object.assign(REGIONS, HARD_REGIONS);
export const HARD_AREA = { name: 'ツーイス未踏区域', regions: HARD_ORDER };
