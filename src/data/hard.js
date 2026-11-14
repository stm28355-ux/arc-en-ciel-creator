// 高難易度「ツーイス未踏区域」の10地域（フェーズ9、2026-11-14）。tools/make-hard.mjs で作った。
// 研究は全部最大が前提。hard.level が想定のレベル（80 か 99）、hard.limit が置けるモンスターの数。
// 敵の体力は tools/tune-regions.mjs で、調整の基準（tools/sim-region.mjs の STAGES）に合わせて決める。
// 敵はどれも名簿のモンスター（monster）。名前はモンスターの名前（src/data/enemies.js で付ける）。
export const HARD_ENEMIES = {
  h1fast: {
    monster: 'flamebat',
    element: 'fire',
    hp: 21400,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h1tank: {
    monster: 'firebird',
    element: 'fire',
    hp: 49900,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h1sub: {
    monster: 'stoneslime',
    element: 'earth',
    hp: 35700,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h1elite: {
    monster: 'flameflamingo',
    element: 'fire',
    hp: 214000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h1boss: {
    monster: 'infernoghost',
    element: 'fire',
    hp: 927000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h2fast: {
    monster: 'anemone',
    element: 'water',
    hp: 17100,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h2tank: {
    monster: 'singer',
    element: 'water',
    hp: 39800,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h2sub: {
    monster: 'frostflower',
    element: 'ice',
    hp: 28400,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h2elite: {
    monster: 'mistdragoon',
    element: 'water',
    hp: 171000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h2boss: {
    monster: 'tidepoolgel',
    element: 'water',
    hp: 739000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h3fast: {
    monster: 'eel',
    element: 'thunder',
    hp: 2920,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h3tank: {
    monster: 'megasparkbot',
    element: 'thunder',
    hp: 6810,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h3sub: {
    monster: 'falcon',
    element: 'wind',
    hp: 4860,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h3elite: {
    monster: 'denraishisou',
    element: 'thunder',
    hp: 29200,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h3boss: {
    monster: 'thundercloudgel',
    element: 'thunder',
    hp: 126000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h4fast: {
    monster: 'glowmoss',
    element: 'light',
    hp: 17900,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h4tank: {
    monster: 'pearlprincess',
    element: 'light',
    hp: 41800,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h4sub: {
    monster: 'wildram',
    element: 'none',
    hp: 29800,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h4elite: {
    monster: 'lightspirit',
    element: 'light',
    hp: 179000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h4boss: {
    monster: 'satellitebot',
    element: 'light',
    hp: 775000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h5fast: {
    monster: 'anglerfish',
    element: 'dark',
    hp: 32900,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h5tank: {
    monster: 'twins',
    element: 'dark',
    hp: 76700,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h5sub: {
    monster: 'firework',
    element: 'fire',
    hp: 54800,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h5elite: {
    monster: 'deathmetalspider',
    element: 'dark',
    hp: 329000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h5boss: {
    monster: 'shadowoctopus',
    element: 'dark',
    hp: 1420000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h6fast: {
    monster: 'frostwyrm',
    element: 'ice',
    hp: 22400,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h6tank: {
    monster: 'blizzardwolf',
    element: 'ice',
    hp: 52400,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h6sub: {
    monster: 'falcon',
    element: 'wind',
    hp: 37400,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h6elite: {
    monster: 'twinking',
    element: 'ice',
    hp: 224000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h6boss: {
    monster: 'fridgebot',
    element: 'ice',
    hp: 972000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h7fast: {
    monster: 'vine',
    element: 'earth',
    hp: 13600,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h7tank: {
    monster: 'rockturtle',
    element: 'earth',
    hp: 31700,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h7sub: {
    monster: 'raijin',
    element: 'thunder',
    hp: 22600,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h7elite: {
    monster: 'ancienttree',
    element: 'earth',
    hp: 136000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h7boss: {
    monster: 'fruitwhip',
    element: 'earth',
    hp: 588000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h8fast: {
    monster: 'anemone',
    element: 'water',
    hp: 11500,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h8tank: {
    monster: 'singer',
    element: 'water',
    hp: 26900,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h8sub: {
    monster: 'demon',
    element: 'dark',
    hp: 19200,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h8elite: {
    monster: 'mistsnake',
    element: 'water',
    hp: 115000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h8boss: {
    monster: 'mistdragoon',
    element: 'water',
    hp: 500000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h9fast: {
    monster: 'glowmoss',
    element: 'light',
    hp: 6220,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h9tank: {
    monster: 'pearlprincess',
    element: 'light',
    hp: 14500,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h9sub: {
    monster: 'frostflower',
    element: 'ice',
    hp: 10400,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h9elite: {
    monster: 'stardustgel',
    element: 'light',
    hp: 62200,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h9boss: {
    monster: 'lightspirit',
    element: 'light',
    hp: 269000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  },
  h10fast: {
    monster: 'anglerfish',
    element: 'dark',
    hp: 31300,
    speed: 1.6,
    drop: 6,
    damage: 1,
    size: 0.26
  },
  h10tank: {
    monster: 'twins',
    element: 'dark',
    hp: 72900,
    speed: 0.7,
    drop: 8,
    damage: 1,
    size: 0.34
  },
  h10sub: {
    monster: 'archangel',
    element: 'light',
    hp: 52100,
    speed: 1,
    drop: 6,
    damage: 1,
    size: 0.3
  },
  h10elite: {
    monster: 'deepsquid',
    element: 'dark',
    hp: 313000,
    speed: 0.6,
    drop: 40,
    damage: 2,
    size: 0.44,
    elite: true
  },
  h10boss: {
    monster: 'deathmetalspider',
    element: 'dark',
    hp: 1350000,
    speed: 0.4,
    drop: 300,
    damage: 0,
    size: 0.5,
    boss: true
  }
};

export const HARD_REGIONS = {
  hard1: {
    name: 'ツーイス第1区域',
    province: 'p5',
    hard: {
      level: 80,
      limit: 10,
      shape: '曲がった1本',
      nodes: 'ほどほど'
    },
    elements: [
      'fire',
      'earth'
    ],
    requires: 'castle',
    ground: 'volcano',
    baseHp: 3,
    waveGap: 4,
    map: [
      '..........R............F....',
      '.................R..........',
      'S######.........R...........',
      '..E...#.....................',
      '......#...~.#######..R......',
      '......#.....#.F...#....T....',
      '......#.....#.....#.....###B',
      '..R.R.#.....#.....#.....#..E',
      '..T...#.....#.....#.....#...',
      '....~.#.....#.T...#.....#...',
      '..~...#.....#.....#.....#...',
      '....T.#.....#.....#.....#...',
      '......#######...T.#######...',
      '.T..........................',
      '......N.....................',
      '..................F.........'
    ],
    waves: [
      [
        {
          enemy: 'h1fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h1sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h1tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h1sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h1elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h1fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h1boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h1tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h1elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard2: {
    name: 'ツーイス第2区域',
    province: 'p5',
    hard: {
      level: 80,
      limit: 7,
      shape: '渦巻き',
      nodes: '固めてある'
    },
    elements: [
      'water',
      'ice'
    ],
    requires: 'hard1',
    ground: 'sea',
    baseHp: 3,
    waveGap: 4,
    map: [
      '...................~........',
      'S##########################.',
      '..........................#.',
      '.########################.#.',
      '.#......................#.#.',
      '.#.####################.#.#.',
      '.#.#..................#.#.#.',
      '.#.#.##############BAA#.#.#.',
      '.#.#.#..IA..........IN#.#.#.',
      '.#.#.#..LD............#.#.#.',
      '.#.#.##################.#.#.',
      '.#.#....................#.#.',
      '.#.######################.#.',
      '.#.......................R#.',
      '.##########################.',
      'T...........................'
    ],
    waves: [
      [
        {
          enemy: 'h2fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h2sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h2tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h2sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h2elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h2fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h2boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h2tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h2elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard3: {
    name: 'ツーイス第3区域',
    province: 'p5',
    hard: {
      level: 80,
      limit: 5,
      shape: '置けないマスが多い',
      nodes: 'なし'
    },
    elements: [
      'thunder',
      'wind'
    ],
    requires: 'hard2',
    ground: 'storm',
    baseHp: 3,
    waveGap: 4,
    map: [
      '~.R....RRT..RR.RRR..T.R.RT..',
      '..RT.RRRRRRRT~RTRR.T.TRRR~RR',
      '..RT....R..R~R~~RR~~RTRR..RR',
      '..~..#######RRRT..TR...R.~RR',
      'RRRT.#.~T.~#.RRR.#######..~.',
      '.~.T.#.R~~.#.RRTT#T.RTR#TT..',
      '..RR.#~RR~.#RRTRR#T~R..#RTT.',
      'T.RT.#R~RR~#RRRT.#RRT~.#.RTR',
      'S#####RTRRT#.~RT.#.RR.R#TRR~',
      'R...R.RR.~.#TRR~T#.R~..#.R..',
      'R~R~RT..R..#.TR.T#RR~T.####B',
      '.~TR.TRRRT.#...T.#RT~RR.R.TR',
      '.RR~TRTRTRR#######.TRTRRTRR.',
      '.RTR.~TTTT.RRR~.R.~TRRTTRRRT',
      '.~RR.TTTRRR~R.R~~TRRRR~RRTT.',
      'R..R~.R.R..T.R~RR.R...TT.R..'
    ],
    waves: [
      [
        {
          enemy: 'h3fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h3sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h3tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h3sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h3elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h3fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h3boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h3tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h3elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard4: {
    name: 'ツーイス第4区域',
    province: 'p5',
    hard: {
      level: 80,
      limit: 7,
      shape: '入口が3つ',
      nodes: 'ほどほど'
    },
    elements: [
      'light',
      'none'
    ],
    requires: 'hard3',
    ground: 'holy',
    baseHp: 3,
    waveGap: 4,
    map: [
      '.......................L....',
      '..........................N.',
      'S########...................',
      '.RN.....#....T.T#######..T..',
      '........#.......#...L.#.....',
      '........#.......#.....#..T..',
      '........#R......#.....#.....',
      'S################.....#.....',
      '.....~..#.............#.....',
      '........#.....RR......#.....',
      '........#...T.........#.....',
      '........#......~......#####B',
      '........#....~..............',
      'S########..........R....T...',
      '...L...........N............',
      '.................~..........'
    ],
    waves: [
      [
        {
          enemy: 'h4fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h4sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h4tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h4sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h4elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h4fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h4boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h4tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h4elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard5: {
    name: 'ツーイス第5区域',
    province: 'p5',
    hard: {
      level: 80,
      limit: 10,
      shape: '行ったり来たり（たて）',
      nodes: '固めてある'
    },
    elements: [
      'dark',
      'fire'
    ],
    requires: 'hard4',
    ground: 'castle',
    baseHp: 3,
    waveGap: 4,
    map: [
      '............................',
      'S##..####..####..####..####.',
      '..#..#..#..#DD#..#..#.R#..#.',
      '..#..#..#..#FN#..#..#..#..#T',
      'FD#..#..#..#..#..#..#..#..#.',
      'LD#..#..#..#..#..#..#..#..#.',
      '..#..#..#..#..#..#..#..#..#.',
      '..#..#..#..#..#..#..#..#..#.',
      '..#..#..#..#..#..#..#..#..#.',
      '..#..#..#..#..#..#..#..#..#.',
      '..#..#..#..#..#..#..#..#..#.',
      '..#..#R.#..#..#..#..#..#..#.',
      '..#..#..#..#..#..#..#R.#..#R',
      '..#..#..#..#..#..#..#..#..#.',
      '..####..####..####..####..B.',
      '............................'
    ],
    waves: [
      [
        {
          enemy: 'h5fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h5sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h5tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h5sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h5elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h5fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h5boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h5tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h5elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard6: {
    name: 'ツーイス第6区域',
    province: 'p5',
    hard: {
      level: 99,
      limit: 7,
      shape: '曲がった1本',
      nodes: 'なし'
    },
    elements: [
      'ice',
      'wind'
    ],
    requires: 'hard5',
    ground: 'snow',
    baseHp: 3,
    waveGap: 4,
    map: [
      '............................',
      '............................',
      '........#######~..~.#######S',
      '..T.....#.....#.....#.......',
      '.R......#.....#.....#.......',
      '........#.....#.....#.......',
      'B##.~...#.~...#..TT.#.......',
      '..#.....#.....#.R...#.......',
      '..#....T#.....#.....#.......',
      '..#~....#..R..#######..T.R..',
      '..#~....#...................',
      '..#.....#...................',
      '..#....T#............~......',
      '..#######...................',
      '............R......R..T.....',
      '...........................T'
    ],
    waves: [
      [
        {
          enemy: 'h6fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h6sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h6tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h6sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h6elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h6fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h6boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h6tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h6elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard7: {
    name: 'ツーイス第7区域',
    province: 'p5',
    hard: {
      level: 99,
      limit: 5,
      shape: '渦巻き（まん中から外へ）',
      nodes: 'ほどほど'
    },
    elements: [
      'earth',
      'thunder'
    ],
    requires: 'hard6',
    ground: 'sand',
    baseHp: 3,
    waveGap: 4,
    map: [
      '..T................E.......Z',
      'B##########################.',
      '.........................T#.',
      '.########################.#.',
      '.#............E.........#.#.',
      '.#.####################.#Z#.',
      '.#.#..................#.#.#.',
      '.#R#.##############S..#.#.#.',
      '.#.#.#......R.........#.#.#.',
      '.#.#.#.......R.N......#.#.#.',
      '.#.#.##################.#.#.',
      '.#.#....E...T...........#.#.',
      '.#.######################.#.',
      '.#......R.................#.',
      '.##########################.',
      '............................'
    ],
    waves: [
      [
        {
          enemy: 'h7fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h7sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h7tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h7sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h7elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h7fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h7boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h7tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h7elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard8: {
    name: 'ツーイス第8区域',
    province: 'p5',
    hard: {
      level: 99,
      limit: 10,
      shape: '置けないマスが多い',
      nodes: '固めてある'
    },
    elements: [
      'water',
      'dark'
    ],
    requires: 'hard7',
    ground: 'sea',
    baseHp: 3,
    waveGap: 4,
    map: [
      'T..~RT~~~.T.R~...~T......AA.',
      '.TRTRT.R~~.TTTR~RT.~T~T..DN.',
      'R~RR.RRRRR...R~RRRRTR.T.....',
      '...TTTR.RR.R~~~R.T...R~.....',
      'S#########.R.RTRTR#########B',
      '~.TR.T...#.R~T.R.R#.....RT..',
      '..R~.R.~R#.~T~RTR.#.TR.~~RT.',
      '.~RRR~RT.#.T~RRRR~#RT~R.T~RR',
      'TTTRRT~R.#RRRTR.TT#RRTTR~RTT',
      '.RT.T..T.#.RR~TRR.#.R.RTTRR.',
      '..~RRTT~.#.R...RT.#..~RRR.RR',
      'RRRTR.RR.##########TRTRT.R~.',
      '~.RT.R.RR.T.........RRTRTRTR',
      'TR~R.T.~RRRRTR........~~RR.~',
      '.~RRTRT~RTRR~...DA..~.~~R.R.',
      '..R....RRRT.....LD..R.~.RR.R'
    ],
    waves: [
      [
        {
          enemy: 'h8fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h8sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h8tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h8sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h8elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h8fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h8boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h8tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h8elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard9: {
    name: 'ツーイス第9区域',
    province: 'p5',
    hard: {
      level: 99,
      limit: 5,
      shape: '入口が3つ（上から）',
      nodes: '固めてある'
    },
    elements: [
      'light',
      'ice'
    ],
    requires: 'hard8',
    ground: 'holy',
    baseHp: 3,
    waveGap: 4,
    map: [
      '...S.........S.........S....',
      '...#...LL....#.........#....',
      '...#...IN....#..TR.R...#....',
      '...#.........#..~..R...#..T.',
      '...#........R#.........#....',
      '...#.......T.#.........#....',
      'IL.#####################....',
      'LD...........#..............',
      '.........R...#........R.....',
      '.............#.....R........',
      '......R......#..............',
      '.....R...R...#############..',
      '.........................#..',
      '.....T.....R.............#..',
      '....T........~..~.....R..#..',
      '....R..............~.....B..'
    ],
    waves: [
      [
        {
          enemy: 'h9fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h9sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h9tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h9sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h9elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h9fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h9boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h9tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h9elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  },
  hard10: {
    name: 'ツーイス第10区域',
    province: 'p5',
    hard: {
      level: 99,
      limit: 7,
      shape: '行ったり来たり（よこ）',
      nodes: 'なし'
    },
    elements: [
      'dark',
      'light'
    ],
    requires: 'hard9',
    ground: 'castle',
    baseHp: 3,
    waveGap: 4,
    map: [
      '............................',
      'S##########################.',
      '..........................#.',
      '..............~...........#.',
      '.##########################.',
      '.#..........................',
      '.#.......................~..',
      '.##########################.',
      '..........................#.',
      '..........................#.',
      '.##########################.',
      '.#.............R.......R....',
      '.#..........................',
      '.##########################B',
      '.....R......................',
      '.~..........................'
    ],
    waves: [
      [
        {
          enemy: 'h10fast',
          count: 12,
          interval: 0.8,
          delay: 0
        },
        {
          enemy: 'h10sub',
          count: 8,
          interval: 1.2,
          delay: 4
        }
      ],
      [
        {
          enemy: 'h10tank',
          count: 10,
          interval: 1.2,
          delay: 0
        },
        {
          enemy: 'h10sub',
          count: 10,
          interval: 0.8,
          delay: 3
        },
        {
          enemy: 'h10elite',
          count: 2,
          interval: 4,
          delay: 10
        }
      ],
      [
        {
          enemy: 'h10fast',
          count: 12,
          interval: 0.6,
          delay: 0
        },
        {
          enemy: 'h10boss',
          count: 1,
          interval: 1,
          delay: 6
        },
        {
          enemy: 'h10tank',
          count: 8,
          interval: 1,
          delay: 10
        },
        {
          enemy: 'h10elite',
          count: 3,
          interval: 5,
          delay: 14
        }
      ]
    ]
  }
};

export const HARD_ORDER = [
  'hard1',
  'hard2',
  'hard3',
  'hard4',
  'hard5',
  'hard6',
  'hard7',
  'hard8',
  'hard9',
  'hard10'
];
