// モンスター（仮）。第1地方（無・風・土）の33種、第2地方（水・雷）の22種、第3地方（炎・氷）の28種、第4地方（光・闇）の35種、
// 敵から名簿に入った15種（敵はどれも名簿のモンスター。src/data/enemies.js の monster）。
//   第1地方：調合で作れる13種 / 進化で手に入る6種 / 融合でしか生まれない12種 / 特別な組み合わせの融合でだけ生まれる2種
//   第2地方：調合で作れる18種 / 融合でしか生まれない4種（マシン系・テンタクル系）
//   第3地方：調合で作れる26種 / 融合でしか生まれない2種（レイス系）
//   第4地方：調合で作れる34種 / 特殊（9属性を同じ量ずつ）1種
// 入手は錬成・融合・進化だけ（戦闘でのドロップはない）。作り方は src/data/recipes.js、進化は src/data/evolutions.js、
// 融合のルール（系統の表と位階）は src/data/families.js。
// それぞれのモンスターは自分の「技」を1つ持つ（atk・interval・shape・skill がその技）。
// 融合で親の技を引き継ぐと、技を最大3つまで持てる。技は種類のIDで表す（例：'hawk' の技＝まいおりる）。
//   element: モンスターの属性。見た目と名前に合わせる。調合の表のモンスターは、ふつうは一番多く使ったエレメントと同じだが、
//            二番目のエレメントのほうが見た目に合うときはそちらにする（例：無＞氷で作るゆきだるまは氷。2026-11-12 に見直した）
//   family: 系統（体の種類）/ rank: 位階（系統の中での強さの順。融合で生まれるモンスターを決める）
//   atk: レベル1の1回の攻撃のダメージ / interval: 攻撃の間隔（秒）
//   shape: 攻撃範囲。上を向いたときの形（o = 自分、x = 攻撃が届くマス）。向きに合わせて回る
//   special: 比率をぴったり合わせた調合だけ / evolved: 進化だけ / fusion: 融合のルールだけ / rare: 特別な組み合わせの融合だけ
export const MONSTERS = {
  // --- 1種類だけで作る（位階1） ---
  slime: { name: 'プチスライム', element: 'none', family: 'gel', rank: 1, atk: 10, interval: 1.0, skill: 'たいあたり', shape: ['xxx', 'xxx', '.o.'] },
  bat: { name: 'そよかぜコウモリ', element: 'wind', family: 'beast', rank: 1, atk: 5, interval: 0.45, skill: 'かぜのは', shape: ['xxx', 'xox', 'xxx'] },
  turtle: { name: 'いわガメ', element: 'earth', family: 'rock', rank: 1, atk: 24, interval: 1.6, skill: 'いわおとし', shape: ['xxx', 'xox'] },

  // --- 2種類で作る（一番多い属性 > 二番目。位階2） ---
  sprite: { name: 'のはらの精', element: 'none', family: 'plant', rank: 2, atk: 6, interval: 0.8, skill: 'はっぱとばし', shape: ['xxxxx', '.xxx.', '..o..'] },
  dango: { name: 'どろダンゴ', element: 'earth', family: 'gel', rank: 2, atk: 9, interval: 1.0, skill: 'ころがる', shape: ['..x..', '..x..', 'xxoxx', '..x..', '..x..'] },
  hawk: { name: 'つむじタカ', element: 'wind', family: 'bird', rank: 2, atk: 14, interval: 1.2, skill: 'まいおりる', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  weasel: { name: 'かまいたち', element: 'wind', family: 'beast', rank: 2, atk: 7, interval: 0.6, skill: 'ななめぎり', shape: ['x...x', '.x.x.', '..o..'] },
  golem: { name: 'ねんどゴーレム', element: 'earth', family: 'rock', rank: 2, atk: 40, interval: 1.8, skill: 'おしつぶす', shape: ['x', 'o'] },
  lizard: { name: 'すなあらしトカゲ', element: 'earth', family: 'scale', rank: 2, atk: 16, interval: 1.3, skill: 'すなかけ', shape: ['xxxxx', '..o..'] },

  // --- 3種類で作る（一番多い属性で決まる。位階3） ---
  scarecrow: { name: 'まもりのかかし', element: 'none', family: 'fiend', rank: 3, atk: 5, interval: 1.0, skill: 'みはり', shape: ['xxxxx', 'x...x', 'x.o.x', 'x...x', 'xxxxx'] },
  swallow: { name: 'かぜきりツバメ', element: 'wind', family: 'bird', rank: 3, atk: 9, interval: 0.7, skill: 'つらぬく', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  crab: { name: 'いしだたみガニ', element: 'earth', family: 'rock', rank: 3, atk: 14, interval: 1.1, skill: 'はさむ', shape: ['xxx', '.o.', 'xxx'] },

  // --- 特殊（比率をぴったり合わせたときだけ。位階4） ---
  prism: { name: 'にじいろスライム', element: 'none', family: 'gel', rank: 4, atk: 14, interval: 0.8, skill: 'プリズム', shape: ['xxxxx', 'xxxxx', '..o..'], special: true },

  // --- 進化で手に入る（調合では作れない。位階は進化前＋2。一度手に入れれば図鑑錬成できる） ---
  bigslime: { name: 'ビッグスライム', element: 'none', family: 'gel', rank: 3, atk: 16, interval: 1.0, skill: 'のしかかり', shape: ['xxxxx', 'xxxxx', 'xxxxx', '..o..'], evolved: true },
  forestsprite: { name: 'もりの精', element: 'none', family: 'plant', rank: 4, atk: 8, interval: 0.7, skill: 'このはあらし', shape: ['xxxxxxx', '.xxxxx.', '..xxx..', '...o...'], evolved: true },
  stormbat: { name: 'あらしコウモリ', element: 'wind', family: 'beast', rank: 3, atk: 6, interval: 0.4, skill: 'つむじかぜ', shape: ['xxxxx', 'xxxxx', 'xxoxx', 'xxxxx', 'xxxxx'], evolved: true },
  eagle: { name: 'おおぞらワシ', element: 'wind', family: 'bird', rank: 4, atk: 24, interval: 1.1, skill: 'きゅうこうか', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'], evolved: true },
  rockturtle: { name: 'がんせきガメ', element: 'earth', family: 'rock', rank: 3, atk: 38, interval: 1.6, skill: 'がんせきおとし', shape: ['xxx', 'xxx', 'xox'], evolved: true },
  irongolem: { name: 'てつゴーレム', element: 'earth', family: 'rock', rank: 4, atk: 70, interval: 1.8, skill: 'てっつい', shape: ['xxx', '.o.'], evolved: true },

  // --- 融合でしか生まれない（融合のルールで決まる。一度手に入れれば図鑑錬成できる） ---
  stoneslime: { name: 'いしころスライム', element: 'earth', family: 'gel', rank: 3, atk: 30, interval: 1.5, skill: 'いしつぶて', shape: ['.x.', 'xxx', 'xox'], fusion: true },
  auroragel: { name: 'オーロラゲル', element: 'light', family: 'gel', rank: 5, atk: 12, interval: 0.7, skill: 'オーロラのまく', shape: ['xxxxxxx', 'xxxxxxx', '.xxxxx.', '...o...'], fusion: true },
  vine: { name: 'からみツタ', element: 'earth', family: 'plant', rank: 3, atk: 9, interval: 0.7, skill: 'からみつく', shape: ['x.x.x', '.xxx.', 'xxoxx'], fusion: true },
  ancienttree: { name: 'せんねんじゅ', element: 'earth', family: 'plant', rank: 5, atk: 22, interval: 1.4, skill: 'ねっこのうねり', shape: ['.xxxxx.', 'xxxxxxx', 'xxxoxxx', 'xxxxxxx', '.xxxxx.'], fusion: true },
  falcon: { name: 'はやてハヤブサ', element: 'wind', family: 'bird', rank: 3, atk: 10, interval: 0.7, skill: 'はやてづき', shape: ['xxx', 'xxx', 'xxx', 'xxx', '.o.'], fusion: true },
  cloudbird: { name: 'くもつきのおおとり', element: 'wind', family: 'bird', rank: 5, atk: 22, interval: 1.0, skill: 'くもきり', shape: ['xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', '.o.'], fusion: true },
  hedgehog: { name: 'いしはりネズミ', element: 'earth', family: 'beast', rank: 3, atk: 9, interval: 0.45, skill: 'はりとばし', shape: ['.x.', 'xox', '.x.'], fusion: true },
  griffon: { name: 'グリフォン', element: 'wind', family: 'beast', rank: 5, atk: 20, interval: 0.8, skill: 'つかみかかる', shape: ['.xxx.', 'xxxxx', 'xxxxx', 'xxoxx'], fusion: true },
  mossgolem: { name: 'こけむしゴーレム', element: 'earth', family: 'rock', rank: 3, atk: 34, interval: 1.6, skill: 'こけのこぶし', shape: ['.x.', 'xxx', '.o.'], fusion: true },
  earthgiant: { name: 'だいちのきょじん', element: 'earth', family: 'rock', rank: 5, atk: 80, interval: 2.0, skill: 'じならし', shape: ['xxx', 'xxx', '.o.'], fusion: true },
  piper: { name: 'かぜのふえふき', element: 'wind', family: 'fiend', rank: 4, atk: 7, interval: 0.5, skill: 'かぜのしらべ', shape: ['xxxxxxx', 'x.....x', 'x..o..x', 'x.....x', 'xxxxxxx'], fusion: true },
  wyvern: { name: 'ちびワイバーン', element: 'wind', family: 'scale', rank: 4, atk: 18, interval: 1.0, skill: 'かぜのブレス', shape: ['x...x', 'xx.xx', 'xxxxx', '..o..'], fusion: true },

  // --- 特別な組み合わせの融合でだけ生まれる（ルールの外。src/data/families.js の RARE_FUSIONS） ---
  skyshell: { name: 'そらとぶこうら', element: 'wind', family: 'rock', rank: 6, atk: 30, interval: 1.0, skill: 'こうらミサイル', shape: ['xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xxx', 'xox'], rare: true },
  sandscarecrow: { name: 'すなかぜのかかし', element: 'earth', family: 'fiend', rank: 5, atk: 12, interval: 0.8, skill: 'すなあらし', shape: ['xxxxxxx', 'x.....x', 'x.....x', 'x..o..x', 'x.....x', 'x.....x', 'xxxxxxx'], rare: true },

  // ===== 第2地方（水・雷）。調合で使うには研究「水の調合」「雷の調合」が要る =====
  // --- 1種類だけで作る（位階1） ---
  jelly: { name: 'しずくクラゲ', element: 'water', family: 'mollusk', rank: 1, atk: 7, interval: 0.8, skill: 'しずくのまく', shape: ['.xxx.', 'xxoxx', '.xxx.'] },
  sparkbot: { name: 'でんでんロボ', element: 'thunder', family: 'machine', rank: 1, atk: 18, interval: 1.3, skill: 'ビリッと', shape: ['x.x', 'x.x', '.o.'] },

  // --- 2種類で作る（一番多い属性 > 二番目。位階2） ---
  frog: { name: 'みずたまガエル', element: 'water', family: 'scale', rank: 2, atk: 12, interval: 0.9, skill: 'したのばし', shape: ['x', 'x', 'x', 'x', 'o'] },
  flyfish: { name: 'しぶきトビウオ', element: 'water', family: 'scale', rank: 2, atk: 8, interval: 0.6, skill: 'しぶきとばし', shape: ['x...x', 'x...x', '.x.x.', '..o..'] },
  mudoctopus: { name: 'どろタコ', element: 'water', family: 'mollusk', rank: 2, atk: 11, interval: 1.0, skill: 'はっぽうすみ', shape: ['x.x.x', '.....', 'x.o.x', '.....', 'x.x.x'] },
  shockjelly: { name: 'でんきクラゲ', element: 'thunder', family: 'mollusk', rank: 2, atk: 6, interval: 0.5, skill: 'しびれしょくしゅ', shape: ['xxx', 'xox', 'xxx'] },
  zapslime: { name: 'ビリビリスライム', element: 'thunder', family: 'gel', rank: 2, atk: 15, interval: 1.1, skill: 'ほうでん', shape: ['.x.', 'xxx', 'xxx', '.o.'] },
  thunderbird: { name: 'らいちょう', element: 'thunder', family: 'bird', rank: 2, atk: 20, interval: 1.3, skill: 'いなずまがえし', shape: ['x.....x', '.x...x.', '..x.x..', '...o...'] },
  magnetgolem: { name: 'じしゃくゴーレム', element: 'thunder', family: 'machine', rank: 2, atk: 32, interval: 1.6, skill: 'じりょくパンチ', shape: ['xxx', '.o.'] },
  eel: { name: 'でんきウナギ', element: 'thunder', family: 'scale', rank: 2, atk: 9, interval: 0.6, skill: 'でんげき', shape: ['xxxx', 'x...', 'o...'] },
  waterslime: { name: 'みずたまスライム', element: 'water', family: 'gel', rank: 2, atk: 10, interval: 0.9, skill: 'みずはね', shape: ['xxxxx', '..o..', 'xxxxx'] },
  windup: { name: 'ねじまき兵', element: 'none', family: 'machine', rank: 2, atk: 14, interval: 1.0, skill: 'ぜんまいやり', shape: ['xxx', 'xxx', 'xxx', '.o.'] },
  gull: { name: 'あまぐもカモメ', element: 'wind', family: 'bird', rank: 2, atk: 11, interval: 0.8, skill: 'あまつぶ', shape: ['.x.', 'xxx', '.x.', '.x.', '.o.'] },
  thunderweasel: { name: 'かみなりイタチ', element: 'thunder', family: 'beast', rank: 2, atk: 6, interval: 0.4, skill: 'いなびかり', shape: ['x.x', 'xox', 'x.x'] },
  croc: { name: 'どろんこワニ', element: 'earth', family: 'scale', rank: 2, atk: 30, interval: 1.7, skill: 'かみつく', shape: ['xx', 'xx', 'o.'] },
  magnetrock: { name: 'でんじいわ', element: 'earth', family: 'rock', rank: 2, atk: 12, interval: 1.2, skill: 'じばのなみ', shape: ['xx.xx', 'x...x', '..o..', 'x...x', 'xx.xx'] },

  // --- 3種類以上で作る（一番多い属性で決まる。位階3） ---
  singer: { name: 'みずうたい', element: 'water', family: 'fiend', rank: 3, atk: 8, interval: 0.8, skill: 'さざなみのうた', shape: ['xxxxx', 'xxxxx', '.xxx.', '..o..'] },
  raijin: { name: 'かみなりさま', element: 'thunder', family: 'fiend', rank: 3, atk: 26, interval: 1.2, skill: 'らいげき', shape: ['x.x.x', '.xxx.', '..o..'] },

  // --- 融合でしか生まれない（マシン系・テンタクル系） ---
  drone: { name: 'スパークドローン', element: 'thunder', family: 'machine', rank: 3, atk: 12, interval: 0.6, skill: 'スパーク', shape: ['xxx', 'x.x', 'xox'], fusion: true },
  cannon: { name: 'いかずちキャノン', element: 'thunder', family: 'machine', rank: 5, atk: 60, interval: 1.6, skill: 'いかずちほう', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'], fusion: true },
  squid: { name: 'うずまきイカ', element: 'water', family: 'mollusk', rank: 3, atk: 9, interval: 0.5, skill: 'うずまき', shape: ['.xxx.', 'x...x', 'x.o.x', 'x...x', '.xxx.'], fusion: true },
  kraken: { name: 'クラーケン', element: 'water', family: 'mollusk', rank: 5, atk: 18, interval: 0.7, skill: 'おおうずしお', shape: ['xxxxxxx', 'xxxxxxx', 'xxxxxxx', '...o...'], fusion: true },

  // ===== 第3地方（炎・氷）。調合で使うには研究「炎の調合」「氷の調合」が要る =====
  // --- 1種類だけで作る（位階1） ---
  hinoko: { name: 'ひのこだま', element: 'fire', family: 'gel', rank: 1, atk: 12, interval: 0.8, skill: 'ひのこ', shape: ['.x.', 'xxx', 'xox'] },
  penguin: { name: 'ちびペンギン', element: 'ice', family: 'bird', rank: 1, atk: 16, interval: 1.1, skill: 'こおりすべり', shape: ['x', 'x', 'x', 'x', 'x', 'o'] },

  // --- 2種類で作る（一番多い属性 > 二番目。位階2） ---
  stovesprite: { name: 'かまどのこびと', element: 'fire', family: 'fiend', rank: 2, atk: 14, interval: 0.9, skill: 'かまどのひ', shape: ['xxx', 'xxx', 'xox'] },
  firebird: { name: 'ほのおのとり', element: 'fire', family: 'bird', rank: 2, atk: 22, interval: 1.2, skill: 'ひのはばたき', shape: ['x...x', 'xx.xx', '.xxx.', '..o..'] },
  lavaturtle: { name: 'ようがんガメ', element: 'fire', family: 'rock', rank: 2, atk: 40, interval: 1.8, skill: 'ようがんおとし', shape: ['xxx', 'xxx', '.o.'] },
  steamghost: { name: 'ゆげおばけ', element: 'fire', family: 'wraith', rank: 2, atk: 9, interval: 0.6, skill: 'ゆげのまく', shape: ['xxxxx', 'x.o.x', 'xxxxx'] },
  firework: { name: 'はなびロボ', element: 'fire', family: 'machine', rank: 2, atk: 34, interval: 1.6, skill: 'うちあげはなび', shape: ['.xxx.', '.xxx.', '..x..', '..x..', '..o..'] },
  twinslime: { name: 'あかあおスライム', element: 'fire', family: 'gel', rank: 2, atk: 13, interval: 0.8, skill: 'あかあおビーム', shape: ['x...x', 'x...x', 'x.o.x'] },
  snowkid: { name: 'ゆきんこ', element: 'ice', family: 'fiend', rank: 2, atk: 10, interval: 0.6, skill: 'ゆきつぶて', shape: ['.x.', 'xxx', '.x.', '.o.'] },
  blizzardwolf: { name: 'ふぶきオオカミ', element: 'ice', family: 'beast', rank: 2, atk: 9, interval: 0.45, skill: 'ふぶきのきば', shape: ['xxx', 'xox', 'xxx'] },
  icerock: { name: 'つららいわ', element: 'ice', family: 'rock', rank: 2, atk: 26, interval: 1.4, skill: 'つららおとし', shape: ['x.x.x', '.....', 'x.o.x'] },
  seal: { name: 'ゆきアザラシ', element: 'ice', family: 'beast', rank: 2, atk: 18, interval: 1.0, skill: 'こおりのみち', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  aurorajelly: { name: 'オーロラクラゲ', element: 'ice', family: 'mollusk', rank: 2, atk: 8, interval: 0.6, skill: 'オーロラのひかり', shape: ['xxxxx', 'xxxxx', '.xox.'] },
  yukionna: { name: 'ゆきおんな', element: 'ice', family: 'wraith', rank: 2, atk: 12, interval: 0.8, skill: 'こおりのいき', shape: ['xxxxx', '.xxx.', '..o..', '.xxx.'] },
  candle: { name: 'ろうそくおばけ', element: 'fire', family: 'wraith', rank: 2, atk: 11, interval: 0.8, skill: 'ゆらめくひ', shape: ['.x.', 'xox', '.x.', '.x.'] },
  snowman: { name: 'ゆきだるま', element: 'ice', family: 'gel', rank: 2, atk: 24, interval: 1.4, skill: 'ゆきだまころがし', shape: ['xxx', 'xxx', 'xxx', '.o.'] },
  flamebat: { name: 'かえんコウモリ', element: 'fire', family: 'beast', rank: 2, atk: 8, interval: 0.45, skill: 'ひのこのは', shape: ['.xxx.', 'xxoxx', '.xxx.'] },
  snowowl: { name: 'ゆきフクロウ', element: 'ice', family: 'bird', rank: 2, atk: 20, interval: 1.1, skill: 'ゆきのかぜきり', shape: ['x...x', '.x.x.', 'x.o.x'] },
  magmagolem: { name: 'マグマゴーレム', element: 'fire', family: 'rock', rank: 2, atk: 60, interval: 2.0, skill: 'マグマパンチ', shape: ['xx', 'o.'] },
  mammoth: { name: 'こおりマンモス', element: 'ice', family: 'beast', rank: 2, atk: 46, interval: 1.9, skill: 'はなでなぎはらう', shape: ['xxx', 'xxx', 'x.x', '.o.'] },
  kappa: { name: 'おんせんカッパ', element: 'water', family: 'fiend', rank: 2, atk: 15, interval: 0.9, skill: 'あついみずでっぽう', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  icefish: { name: 'つららウオ', element: 'ice', family: 'scale', rank: 2, atk: 11, interval: 0.6, skill: 'つららとばし', shape: ['x.x', 'x.x', 'x.x', '.o.'] },
  plasmabot: { name: 'プラズマロボ', element: 'thunder', family: 'machine', rank: 2, atk: 16, interval: 0.8, skill: 'プラズマほう', shape: ['xxx', '.x.', '.x.', '.o.'] },
  thunderpenguin: { name: 'かみなりペンギン', element: 'thunder', family: 'bird', rank: 2, atk: 13, interval: 0.7, skill: 'でんげきすべり', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'] },

  // --- 3種類以上で作る（一番多い属性で決まる。位階3） ---
  flamelord: { name: 'えんの剣士', element: 'fire', family: 'fiend', rank: 3, atk: 30, interval: 1.0, skill: 'ほのおぎり', shape: ['xxx', 'xxx', 'xox', 'xxx'] },
  icewitch: { name: 'ひょうけつのまじょ', element: 'ice', family: 'fiend', rank: 3, atk: 12, interval: 0.6, skill: 'ひょうけつまほう', shape: ['.xxxxx.', 'xxxxxxx', '.xxxxx.', '...o...'] },

  // --- 融合でしか生まれない（レイス系） ---
  wisp: { name: 'さまようひとだま', element: 'fire', family: 'wraith', rank: 3, atk: 14, interval: 0.6, skill: 'ひとだまのひ', shape: ['xxx', 'x.x', 'xox', 'x.x', 'xxx'], fusion: true },
  winterghost: { name: 'ふゆのぼうれい', element: 'ice', family: 'wraith', rank: 5, atk: 26, interval: 0.7, skill: 'ふゆのよび声', shape: ['xxxxxxx', 'xxxxxxx', 'x.....x', 'x..o..x'], fusion: true },

  // ===== 第4地方（光・闇）。調合で使うには研究「光の調合」「闇の調合」が要る =====
  // --- 1種類だけで作る（位階1） ---
  lumen: { name: 'ひかりだま', element: 'light', family: 'gel', rank: 1, atk: 14, interval: 0.8, skill: 'ひかりのつぶ', shape: ['xxx', 'xxx', 'xox'] },
  darkbat: { name: 'やみコウモリ', element: 'dark', family: 'beast', rank: 1, atk: 9, interval: 0.45, skill: 'やみのは', shape: ['xxx', 'xox', 'xxx'] },

  // --- 2種類で作る（一番多い属性 > 二番目。位階2） ---
  cherub: { name: 'ちびてんし', element: 'light', family: 'fiend', rank: 2, atk: 16, interval: 0.8, skill: 'てんしのや', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  dove: { name: 'ひかりバト', element: 'light', family: 'bird', rank: 2, atk: 13, interval: 0.6, skill: 'ひかりのはね', shape: ['x.x.x', '.xxx.', '..o..'] },
  crystalgolem: { name: 'すいしょうゴーレム', element: 'light', family: 'rock', rank: 2, atk: 70, interval: 2.0, skill: 'すいしょうのこぶし', shape: ['xxx', '.o.'] },
  prismjelly: { name: 'にじいろクラゲ', element: 'light', family: 'mollusk', rank: 2, atk: 11, interval: 0.6, skill: 'にじのしょくしゅ', shape: ['.xxx.', 'xxoxx', '.xxx.', '..x..'] },
  holybot: { name: 'てんしロボ', element: 'light', family: 'machine', rank: 2, atk: 22, interval: 1.0, skill: 'せいなるビーム', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  phoenix: { name: 'ほうおう', element: 'fire', family: 'bird', rank: 2, atk: 30, interval: 1.3, skill: 'ほうおうのつばさ', shape: ['xxxxx', 'xxxxx', '..o..'] },
  diamondfox: { name: 'ダイヤギツネ', element: 'light', family: 'beast', rank: 2, atk: 12, interval: 0.5, skill: 'ダイヤのきば', shape: ['.x.', 'xxx', 'xox'] },
  twilight: { name: 'たそがれの精', element: 'light', family: 'plant', rank: 2, atk: 14, interval: 0.8, skill: 'たそがれのはな', shape: ['xxxxx', '.xxx.', '..o..', '.xxx.'] },
  shade: { name: 'かげぼうし', element: 'dark', family: 'wraith', rank: 2, atk: 15, interval: 0.7, skill: 'かげぬい', shape: ['x.x', '.x.', 'xox'] },
  raven: { name: 'やみガラス', element: 'dark', family: 'bird', rank: 2, atk: 26, interval: 1.2, skill: 'くろいはね', shape: ['x...x', '.x.x.', '..x..', '..o..'] },
  gravegolem: { name: 'はかいしゴーレム', element: 'dark', family: 'rock', rank: 2, atk: 48, interval: 1.7, skill: 'はかいしおとし', shape: ['xxx', 'xxx', '.o.'] },
  anglerfish: { name: 'やみアンコウ', element: 'dark', family: 'scale', rank: 2, atk: 18, interval: 0.9, skill: 'ちょうちんのひかり', shape: ['.x.', '.x.', 'xxx', 'xox'] },
  darkdrone: { name: 'ブラックロボ', element: 'dark', family: 'machine', rank: 2, atk: 20, interval: 0.8, skill: 'やみのレーザー', shape: ['xxx', 'x.x', 'x.x', '.o.'] },
  hellhound: { name: 'ヘルハウンド', element: 'dark', family: 'beast', rank: 2, atk: 14, interval: 0.5, skill: 'じごくのきば', shape: ['xxx', 'xxx', 'xox'] },
  reaper: { name: 'しにがみ', element: 'dark', family: 'wraith', rank: 2, atk: 38, interval: 1.4, skill: 'たましいがり', shape: ['xxxxx', 'x.o.x'] },
  fallen: { name: 'だてんし', element: 'dark', family: 'fiend', rank: 2, atk: 24, interval: 1.0, skill: 'くろいや', shape: ['x.x', 'x.x', 'x.x', 'x.x', '.o.'] },
  lightslime: { name: 'ひかりスライム', element: 'light', family: 'gel', rank: 2, atk: 16, interval: 0.9, skill: 'ぴかぴかたいあたり', shape: ['xxx', 'xxx', 'xxx', '.o.'] },
  darkslime: { name: 'やみスライム', element: 'dark', family: 'gel', rank: 2, atk: 18, interval: 1.0, skill: 'やみのしずく', shape: ['xxxxx', 'xxoxx'] },
  pegasus: { name: 'ペガサス', element: 'wind', family: 'beast', rank: 2, atk: 24, interval: 1.0, skill: 'てんくうのひづめ', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  nightjar: { name: 'よたか', element: 'wind', family: 'bird', rank: 2, atk: 12, interval: 0.5, skill: 'よるのかぜきり', shape: ['x.x', 'x.x', '.o.'] },
  amberturtle: { name: 'こはくガメ', element: 'earth', family: 'rock', rank: 2, atk: 44, interval: 1.6, skill: 'こはくのいし', shape: ['xxx', 'xxx', 'xox'] },
  toadstool: { name: 'どくキノコ', element: 'earth', family: 'plant', rank: 2, atk: 10, interval: 0.6, skill: 'どくのほうし', shape: ['xxxxx', 'x...x', 'x.o.x', 'x...x', 'xxxxx'] },
  pearlclam: { name: 'しんじゅガイ', element: 'water', family: 'mollusk', rank: 2, atk: 34, interval: 1.4, skill: 'しんじゅだん', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  inkling: { name: 'すみイカ', element: 'water', family: 'mollusk', rank: 2, atk: 12, interval: 0.6, skill: 'すみはき', shape: ['xxxxx', 'xxxxx', '.x.x.', '..o..'] },
  lightningmage: { name: 'いなずまのまどうし', element: 'thunder', family: 'fiend', rank: 2, atk: 28, interval: 1.1, skill: 'ひかりのいかずち', shape: ['x.x.x', 'x.x.x', '..o..'] },
  shadowbot: { name: 'かげロボ', element: 'dark', family: 'machine', rank: 2, atk: 17, interval: 0.7, skill: 'かげのでんげき', shape: ['xxx', 'xox', 'x.x'] },
  torchbearer: { name: 'せいかのもりびと', element: 'fire', family: 'fiend', rank: 2, atk: 22, interval: 0.9, skill: 'せいかのほのお', shape: ['xxx', 'xxx', 'xxx', 'xox'] },
  hellfire: { name: 'じごくび', element: 'fire', family: 'wraith', rank: 2, atk: 13, interval: 0.5, skill: 'じごくのほのお', shape: ['.xxx.', 'xxoxx', '.xxx.'] },
  frostflower: { name: 'しもばなの精', element: 'ice', family: 'plant', rank: 2, atk: 15, interval: 0.8, skill: 'しもばなふぶき', shape: ['xxxxxxx', '.xxxxx.', '...o...'] },
  frostwyrm: { name: 'こおりのワーム', element: 'ice', family: 'scale', rank: 2, atk: 36, interval: 1.5, skill: 'こおりのブレス', shape: ['xxx', 'xxx', 'xxx', '.o.'] },

  // --- 3種類以上で作る（一番多い属性で決まる。位階3） ---
  archangel: { name: 'だいてんし', element: 'light', family: 'fiend', rank: 3, atk: 34, interval: 1.0, skill: 'さばきのひかり', shape: ['xxxxx', 'xxxxx', 'xxoxx'] },
  demon: { name: 'まじん', element: 'dark', family: 'fiend', rank: 3, atk: 60, interval: 1.4, skill: 'まじんのこぶし', shape: ['xxx', 'xxx', 'xxx', '.o.'] },

  // --- 特殊（9属性を同じ量ずつ入れたときだけ。ゲームの名前「虹」のモンスター） ---
  arcenciel: { name: 'アルカンシエル', element: 'light', family: 'gel', rank: 6, atk: 40, interval: 0.8, skill: 'にじのかけはし', shape: ['xxxxxxx', 'xxxxxxx', 'xxxxxxx', 'xxxoxxx', 'xxxxxxx'], special: true },

  // ===== 敵から名簿に入ったモンスター（2026-11-12、Issue #28）。敵として出てくるモンスターは、どれも作れるようにする =====
  // 手に入れ方は仮。ボスは「その地域のエレメントの比率」をぴったり合わせた特殊な調合、まおうは まじん の進化
  // --- 特別な組み合わせの融合（src/data/families.js の RARE_FUSIONS） ---
  windrabbit: { name: 'かぜウサギ', element: 'wind', family: 'beast', rank: 2, atk: 8, interval: 0.5, skill: 'かぜのとびげり', shape: ['.x.', 'x.x', '.x.', '.o.'], rare: true },
  mole: { name: 'つちモグラ', element: 'earth', family: 'beast', rank: 2, atk: 12, interval: 0.8, skill: 'あなほり', shape: ['x.x', '.o.', 'x.x'], rare: true },
  // --- 融合でしか生まれない ---
  fluffysheep: { name: 'もこもこヒツジ', element: 'none', family: 'beast', rank: 2, atk: 16, interval: 1.2, skill: 'もこもこタックル', shape: ['xxx', '.o.'], fusion: true },
  chimera: { name: 'キメラ', element: 'fire', family: 'beast', rank: 4, atk: 24, interval: 0.9, skill: 'みつくちのほのお', shape: ['xxx', 'xxx', 'xxx', 'xox'], fusion: true },
  shark: { name: 'ちびザメ', element: 'water', family: 'scale', rank: 2, atk: 13, interval: 0.7, skill: 'かみつき', shape: ['x', 'x', 'x', 'o'], fusion: true },
  catfish: { name: 'おおナマズ', element: 'water', family: 'scale', rank: 3, atk: 20, interval: 1.1, skill: 'ひげむち', shape: ['xxxxx', 'x.o.x'], fusion: true },
  // --- 進化で手に入る（src/data/evolutions.js） ---
  wildram: { name: 'あばれヒツジ', element: 'none', family: 'beast', rank: 4, atk: 34, interval: 1.2, skill: 'つのつき', shape: ['xxx', 'xxx', '.o.'], evolved: true },
  bigmole: { name: 'おおモグラ', element: 'earth', family: 'beast', rank: 4, atk: 28, interval: 1.0, skill: 'じなりほり', shape: ['x...x', '.x.x.', '..o..', '.x.x.', 'x...x'], evolved: true },
  maou: { name: 'まおう', element: 'dark', family: 'fiend', rank: 5, atk: 90, interval: 1.4, skill: 'まおうのいかずち', shape: ['xxxxx', 'xxxxx', 'xxxxx', 'xxoxx', 'xxxxx'], evolved: true },
  // --- 特殊（地域のボス。その地域のエレメントの比率をぴったり合わせた調合だけ） ---
  forestlord: { name: 'もりのぬし', element: 'wind', family: 'plant', rank: 5, atk: 20, interval: 1.0, skill: 'もりのいぶき', shape: ['.xxx.', 'xxxxx', 'xxoxx', 'xxxxx', '.xxx.'], special: true },
  riverdragon: { name: 'かわのりゅう', element: 'water', family: 'scale', rank: 5, atk: 30, interval: 1.0, skill: 'かわのながれ', shape: ['xxx', 'xxx', 'xxx', 'xxx', 'xxx', '.o.'], special: true },
  volcanoking: { name: 'かざんのおう', element: 'fire', family: 'scale', rank: 5, atk: 45, interval: 1.3, skill: 'ふんかのブレス', shape: ['xxxxx', 'xxxxx', 'xxxxx', '..o..'], special: true },
  twinking: { name: 'えんひょうのおう', element: 'ice', family: 'gel', rank: 5, atk: 24, interval: 0.8, skill: 'えんひょうのあらし', shape: ['xxxxx', 'x...x', 'x.o.x', 'x...x', 'xxxxx'], special: true },
  sanctuaryguard: { name: 'せいいきのまもりて', element: 'light', family: 'rock', rank: 5, atk: 70, interval: 1.8, skill: 'せいなるいしのて', shape: ['xxx', 'xxx', 'xox'], special: true },
  borderking: { name: 'さかいのおう', element: 'light', family: 'wraith', rank: 5, atk: 30, interval: 0.9, skill: 'さかいのひかり', shape: ['xxxxxxx', '.xxxxx.', '..xox..'], special: true },
};
