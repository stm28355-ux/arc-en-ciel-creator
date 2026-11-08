// モンスター（仮）。第1地方（無・風・土）で手に入る33種。
//   調合で作れる13種 / 進化で手に入る6種 / 融合でしか生まれない12種 / 特別な組み合わせの融合でだけ生まれる2種
// 入手は錬成・融合・進化だけ（戦闘でのドロップはない）。作り方は src/data/recipes.js、進化は src/data/evolutions.js、
// 融合のルール（系統の表と位階）は src/data/families.js。
// それぞれのモンスターは自分の「技」を1つ持つ（atk・interval・shape・skill がその技）。
// 融合で親の技を引き継ぐと、技を最大3つまで持てる。技は種類のIDで表す（例：'hawk' の技＝まいおりる）。
//   element: モンスターの属性（調合で一番多く使ったエレメント）
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
  dango: { name: 'どろダンゴ', element: 'none', family: 'gel', rank: 2, atk: 9, interval: 1.0, skill: 'ころがる', shape: ['..x..', '..x..', 'xxoxx', '..x..', '..x..'] },
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
  auroragel: { name: 'オーロラゲル', element: 'none', family: 'gel', rank: 5, atk: 12, interval: 0.7, skill: 'オーロラのまく', shape: ['xxxxxxx', 'xxxxxxx', '.xxxxx.', '...o...'], fusion: true },
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
};
