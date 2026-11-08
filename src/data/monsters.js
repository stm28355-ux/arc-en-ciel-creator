// モンスター（仮）。第一地域を試すための最初の5体。
// 本来の入手は調合錬成のチュートリアル（無属性エレメントで最初の仲間を作る）だが、
// 仮版では最初から手持ちにしている。
//   atk: 1回の攻撃のダメージ / interval: 攻撃の間隔（秒）
//   shape: 攻撃範囲。上を向いたときの形（o = 自分、x = 攻撃が届くマス）。向きに合わせて回る
export const MONSTERS = {
  slime: {
    name: 'プチスライム',
    element: 'none',
    atk: 10,
    interval: 1.0,
    skill: 'たいあたり',
    shape: ['xxx', 'xxx', '.o.'],
  },
  sprite: {
    name: 'のはらの精',
    element: 'none',
    atk: 6,
    interval: 0.8,
    skill: 'はっぱとばし',
    shape: ['xxxxx', '.xxx.', '..o..'],
  },
  bat: {
    name: 'そよかぜコウモリ',
    element: 'wind',
    atk: 5,
    interval: 0.45,
    skill: 'かぜのは',
    shape: ['xxx', 'xox', 'xxx'],
  },
  hawk: {
    name: 'つむじタカ',
    element: 'wind',
    atk: 14,
    interval: 1.2,
    skill: 'まいおりる',
    shape: ['x', 'x', 'x', 'x', 'x', 'x', 'o'],
  },
  turtle: {
    name: 'いわガメ',
    element: 'earth',
    atk: 24,
    interval: 1.6,
    skill: 'いわおとし',
    shape: ['xxx', 'xox'],
  },
};

/** 手持ち（仮）。uid はセーブで配置を覚えるための個体ID。 */
export const STARTER_ROSTER = [
  { uid: 'm1', kind: 'slime' },
  { uid: 'm2', kind: 'sprite' },
  { uid: 'm3', kind: 'bat' },
  { uid: 'm4', kind: 'hawk' },
  { uid: 'm5', kind: 'turtle' },
];
