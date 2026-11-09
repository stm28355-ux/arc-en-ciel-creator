// 敵（仮）。倒すと drop の数だけ、その敵の属性のエレメントが手に入る。
// 地域ごとに、手に入るエレメントの割合が地域の属性になるように敵を出す（草原：無＞風、森：風＞土・無、砂漠：土＞風・無）。
//   speed: 1秒に進むマス数 / damage: 拠点まで通したときに減る拠点の耐久
//   boss: 最後のボス。通したら拠点の耐久が全部なくなる（倒さないとクリアにならない）
//   elite: 強めの敵。拠点を2減らす
export const ENEMIES = {
  // --- 草原（無＞風。土は出ない） ---
  slime: { name: 'スライム', element: 'none', hp: 30, speed: 1.0, drop: 1, damage: 1, size: 0.28 },
  rabbit: { name: 'かぜウサギ', element: 'wind', hp: 18, speed: 1.8, drop: 1, damage: 1, size: 0.24 },
  sheep: { name: 'もこもこヒツジ', element: 'none', hp: 75, speed: 0.75, drop: 1, damage: 1, size: 0.32 },
  ram: { name: 'あばれヒツジ', element: 'none', hp: 140, speed: 0.6, drop: 4, damage: 2, size: 0.38, elite: true },
  king: { name: 'キングスライム', element: 'none', hp: 260, speed: 0.5, drop: 10, damage: 0, size: 0.45, boss: true },

  // --- 森（風＞土・無） ---
  squirrel: { name: 'つむじリス', element: 'wind', hp: 45, speed: 1.5, drop: 1, damage: 1, size: 0.25 },
  moss: { name: 'こけだま', element: 'none', hp: 70, speed: 0.9, drop: 1, damage: 1, size: 0.3 },
  mushroom: { name: 'おばけキノコ', element: 'earth', hp: 130, speed: 0.7, drop: 2, damage: 1, size: 0.32 },
  owl: { name: 'よるフクロウ', element: 'wind', hp: 80, speed: 1.1, drop: 2, damage: 1, size: 0.3 },
  bigowl: { name: 'おおフクロウ', element: 'wind', hp: 320, speed: 0.7, drop: 6, damage: 2, size: 0.4, elite: true },
  treant: { name: 'もりのぬし', element: 'wind', hp: 700, speed: 0.45, drop: 20, damage: 0, size: 0.48, boss: true },

  // --- 砂漠（土＞風・無） ---
  dust: { name: 'すなけむり', element: 'wind', hp: 45, speed: 2.0, drop: 1, damage: 1, size: 0.25 },
  mole: { name: 'つちモグラ', element: 'earth', hp: 90, speed: 0.75, drop: 2, damage: 1, size: 0.32 },
  dryslime: { name: 'ひからびスライム', element: 'none', hp: 80, speed: 0.9, drop: 1, damage: 1, size: 0.3 },
  scorpion: { name: 'すなサソリ', element: 'earth', hp: 165, speed: 0.8, drop: 3, damage: 1, size: 0.34 },
  bigmole: { name: 'おおモグラ', element: 'earth', hp: 450, speed: 0.6, drop: 8, damage: 2, size: 0.42, elite: true },
  sandking: { name: 'すなのおう', element: 'earth', hp: 1100, speed: 0.4, drop: 30, damage: 0, size: 0.5, boss: true },
};
