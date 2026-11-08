// モンスター（仮）。第一地域を試すための最初の5体。
// 本来の入手は調合錬成のチュートリアル（無属性エレメントで最初の仲間を作る）だが、
// 仮版では最初から手持ちにしている。
//   atk: 1回の攻撃のダメージ / interval: 攻撃の間隔（秒） / range: 攻撃範囲（マス、中心からの距離）
export const MONSTERS = {
  slime: { name: 'プチスライム', element: 'none', atk: 10, interval: 1.0, range: 2.0, skill: 'たいあたり' },
  sprite: { name: 'のはらの精', element: 'none', atk: 6, interval: 0.8, range: 3.0, skill: 'はっぱとばし' },
  bat: { name: 'そよかぜコウモリ', element: 'wind', atk: 5, interval: 0.45, range: 2.5, skill: 'かぜのは' },
  hawk: { name: 'つむじタカ', element: 'wind', atk: 14, interval: 1.2, range: 3.5, skill: 'まいおりる' },
  turtle: { name: 'いわガメ', element: 'earth', atk: 24, interval: 1.6, range: 1.5, skill: 'いわおとし' },
};

/** 手持ち（仮）。uid はセーブで配置を覚えるための個体ID。 */
export const STARTER_ROSTER = [
  { uid: 'm1', kind: 'slime' },
  { uid: 'm2', kind: 'sprite' },
  { uid: 'm3', kind: 'bat' },
  { uid: 'm4', kind: 'hawk' },
  { uid: 'm5', kind: 'turtle' },
];
