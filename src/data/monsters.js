// モンスター（仮）。第1地方（無・風・土）で作れる13種。
// 入手は錬成だけ（戦闘でのドロップはない）。作り方は src/data/recipes.js。
//   element: モンスターの属性（調合で一番多く使ったエレメント）
//   atk: レベル1の1回の攻撃のダメージ / interval: 攻撃の間隔（秒）
//   shape: 攻撃範囲。上を向いたときの形（o = 自分、x = 攻撃が届くマス）。向きに合わせて回る
export const MONSTERS = {
  // --- 1種類だけで作る ---
  slime: { name: 'プチスライム', element: 'none', atk: 10, interval: 1.0, skill: 'たいあたり', shape: ['xxx', 'xxx', '.o.'] },
  bat: { name: 'そよかぜコウモリ', element: 'wind', atk: 5, interval: 0.45, skill: 'かぜのは', shape: ['xxx', 'xox', 'xxx'] },
  turtle: { name: 'いわガメ', element: 'earth', atk: 24, interval: 1.6, skill: 'いわおとし', shape: ['xxx', 'xox'] },

  // --- 2種類で作る（一番多い属性 > 二番目） ---
  sprite: { name: 'のはらの精', element: 'none', atk: 6, interval: 0.8, skill: 'はっぱとばし', shape: ['xxxxx', '.xxx.', '..o..'] },
  dango: { name: 'どろダンゴ', element: 'none', atk: 9, interval: 1.0, skill: 'ころがる', shape: ['..x..', '..x..', 'xxoxx', '..x..', '..x..'] },
  hawk: { name: 'つむじタカ', element: 'wind', atk: 14, interval: 1.2, skill: 'まいおりる', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  weasel: { name: 'かまいたち', element: 'wind', atk: 7, interval: 0.6, skill: 'ななめぎり', shape: ['x...x', '.x.x.', '..o..'] },
  golem: { name: 'ねんどゴーレム', element: 'earth', atk: 40, interval: 1.8, skill: 'おしつぶす', shape: ['x', 'o'] },
  lizard: { name: 'すなあらしトカゲ', element: 'earth', atk: 16, interval: 1.3, skill: 'すなかけ', shape: ['xxxxx', '..o..'] },

  // --- 3種類で作る（一番多い属性で決まる） ---
  scarecrow: { name: 'まもりのかかし', element: 'none', atk: 5, interval: 1.0, skill: 'みはり', shape: ['xxxxx', 'x...x', 'x.o.x', 'x...x', 'xxxxx'] },
  swallow: { name: 'かぜきりツバメ', element: 'wind', atk: 9, interval: 0.7, skill: 'つらぬく', shape: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'o'] },
  crab: { name: 'いしだたみガニ', element: 'earth', atk: 14, interval: 1.1, skill: 'はさむ', shape: ['xxx', '.o.', 'xxx'] },

  // --- 特殊（比率をぴったり合わせたときだけ） ---
  prism: { name: 'にじいろスライム', element: 'none', atk: 14, interval: 0.8, skill: 'プリズム', shape: ['xxxxx', 'xxxxx', '..o..'], special: true },
};
