// 敵（仮）。草原地域の敵。倒すと drop の数だけ、その敵の属性のエレメントが手に入る。
//   speed: 1秒に進むマス数 / damage: 拠点まで通したときに減る拠点の耐久
export const ENEMIES = {
  slime: { name: 'スライム', element: 'none', hp: 30, speed: 1.0, drop: 1, damage: 1, size: 0.28 },
  rabbit: { name: 'かぜウサギ', element: 'wind', hp: 18, speed: 1.8, drop: 1, damage: 1, size: 0.24 },
  mole: { name: 'つちモグラ', element: 'earth', hp: 75, speed: 0.75, drop: 1, damage: 1, size: 0.32 },
  king: { name: 'キングスライム', element: 'none', hp: 700, speed: 0.5, drop: 10, damage: 2, size: 0.45 },
};
