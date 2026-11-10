// 敵（仮）。倒すと drop の数だけ、その敵の属性のエレメントが手に入る。
// 地域ごとに、手に入るエレメントの割合が地域の属性になるように敵を出す（草原：無＞風、森：風＞土・無、砂漠：土＞風・無、
// 川：水＞無・土、雷雨：雷＞水・土、海：水＞雷・風、火山：炎＞土・雷、雪山：氷＞水・風、混成：炎・氷＞無、
// 聖域：光2・炎1、境界：光1・闇1、魔王城：闇だけ）。
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

  // --- 川（水＞無・土） ---
  fishling: { name: 'はねザカナ', element: 'water', hp: 300, speed: 1.3, drop: 2, damage: 1, size: 0.26 },
  rivercrab: { name: 'かわガニ', element: 'water', hp: 460, speed: 0.8, drop: 2, damage: 1, size: 0.32 },
  mistball: { name: 'きりだま', element: 'none', hp: 350, speed: 1.0, drop: 1, damage: 1, size: 0.3 },
  pebble: { name: 'ころいし', element: 'earth', hp: 590, speed: 0.7, drop: 2, damage: 1, size: 0.32 },
  catfish: { name: 'おおナマズ', element: 'water', hp: 2430, speed: 0.6, drop: 10, damage: 2, size: 0.42, elite: true },
  riverdragon: { name: 'かわのりゅう', element: 'water', hp: 6480, speed: 0.4, drop: 40, damage: 0, size: 0.5, boss: true },

  // --- 雷雨（雷＞水・土） ---
  sparkbug: { name: 'ビリムシ', element: 'thunder', hp: 220, speed: 1.6, drop: 2, damage: 1, size: 0.25 },
  raincloud: { name: 'あまぐも', element: 'water', hp: 360, speed: 0.9, drop: 2, damage: 1, size: 0.32 },
  mudman: { name: 'どろにんぎょう', element: 'earth', hp: 500, speed: 0.7, drop: 2, damage: 1, size: 0.34 },
  thunderbear: { name: 'かみなりグマ', element: 'thunder', hp: 590, speed: 0.8, drop: 3, damage: 1, size: 0.36 },
  thunderwolf: { name: 'いかずちオオカミ', element: 'thunder', hp: 2340, speed: 0.9, drop: 12, damage: 2, size: 0.42, elite: true },
  raijinboss: { name: 'らいじん', element: 'thunder', hp: 5940, speed: 0.4, drop: 50, damage: 0, size: 0.5, boss: true },

  // --- 海（水＞雷・風） ---
  seabreeze: { name: 'うみかぜ', element: 'wind', hp: 350, speed: 2.0, drop: 2, damage: 1, size: 0.25 },
  bluejelly: { name: 'あおクラゲ', element: 'water', hp: 600, speed: 0.9, drop: 2, damage: 1, size: 0.32 },
  shark: { name: 'ちびザメ', element: 'water', hp: 830, speed: 1.2, drop: 3, damage: 1, size: 0.34 },
  stingray: { name: 'しびれエイ', element: 'thunder', hp: 730, speed: 0.9, drop: 3, damage: 1, size: 0.34 },
  bigoctopus: { name: 'おおダコ', element: 'water', hp: 4250, speed: 0.6, drop: 14, damage: 2, size: 0.44, elite: true },
  seaking: { name: 'うみのおう', element: 'water', hp: 10750, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },

  // --- 火山（炎＞土・雷） ---
  firesprite: { name: 'ほのおのこ', element: 'fire', hp: 380, speed: 1.4, drop: 2, damage: 1, size: 0.26 },
  lavaslug: { name: 'ようがんナメクジ', element: 'fire', hp: 750, speed: 0.6, drop: 3, damage: 1, size: 0.34 },
  magmarock: { name: 'マグマいし', element: 'earth', hp: 810, speed: 0.7, drop: 2, damage: 1, size: 0.34 },
  sparkfox: { name: 'いなずまギツネ', element: 'thunder', hp: 480, speed: 1.5, drop: 2, damage: 1, size: 0.28 },
  flamegiant: { name: 'ほのおのきょじん', element: 'fire', hp: 3250, speed: 0.6, drop: 14, damage: 2, size: 0.44, elite: true },
  volcanoking: { name: 'かざんのおう', element: 'fire', hp: 8750, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },

  // --- 雪山（氷＞水・風） ---
  snowhare: { name: 'ゆきウサギ', element: 'ice', hp: 640, speed: 1.7, drop: 3, damage: 1, size: 0.25 },
  icebeetle: { name: 'こおりカブト', element: 'ice', hp: 1610, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  sleetcloud: { name: 'みぞれぐも', element: 'water', hp: 1040, speed: 0.9, drop: 2, damage: 1, size: 0.32 },
  gust: { name: 'こがらし', element: 'wind', hp: 740, speed: 2.0, drop: 2, damage: 1, size: 0.25 },
  yeti: { name: 'イエティ', element: 'ice', hp: 6900, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  snowqueen: { name: 'ゆきの女王', element: 'ice', hp: 18400, speed: 0.4, drop: 100, damage: 0, size: 0.5, boss: true },

  // --- 混成（炎・氷＞無） ---
  firefly: { name: 'ひのこムシ', element: 'fire', hp: 420, speed: 1.5, drop: 2, damage: 1, size: 0.25 },
  frostfly: { name: 'こおりムシ', element: 'ice', hp: 420, speed: 1.5, drop: 2, damage: 1, size: 0.25 },
  ashgolem: { name: 'はいのゴーレム', element: 'fire', hp: 960, speed: 0.6, drop: 3, damage: 1, size: 0.36 },
  frostgolem: { name: 'しものゴーレム', element: 'ice', hp: 960, speed: 0.6, drop: 3, damage: 1, size: 0.36 },
  greyslime: { name: 'はいいろスライム', element: 'none', hp: 600, speed: 1.0, drop: 1, damage: 1, size: 0.3 },
  chimera: { name: 'キメラ', element: 'fire', hp: 3840, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  twinking: { name: 'えんひょうのおう', element: 'ice', hp: 10800, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },
  // --- 聖域（光2・炎1） ---
  wisplight: { name: 'ひかりのせい', element: 'light', hp: 880, speed: 1.4, drop: 3, damage: 1, size: 0.26 },
  holyknight: { name: 'せいきし', element: 'light', hp: 2450, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  flamespirit: { name: 'せいかのたま', element: 'fire', hp: 1230, speed: 1.2, drop: 5, damage: 1, size: 0.3 },
  seraph: { name: 'セラフ', element: 'light', hp: 10500, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  sanctuaryguard: { name: 'せいいきのまもりて', element: 'light', hp: 28000, speed: 0.4, drop: 80, damage: 0, size: 0.5, boss: true },

  // --- 境界（光1・闇1） ---
  lightling: { name: 'ひかりのこびと', element: 'light', hp: 510, speed: 1.3, drop: 3, damage: 1, size: 0.26 },
  shadowling: { name: 'かげのこびと', element: 'dark', hp: 510, speed: 1.3, drop: 3, damage: 1, size: 0.26 },
  lightguard: { name: 'ひかりのたて', element: 'light', hp: 1360, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  darkguard: { name: 'やみのたて', element: 'dark', hp: 1360, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  eclipse: { name: 'にっしょく', element: 'dark', hp: 5950, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  borderking: { name: 'さかいのおう', element: 'light', hp: 15300, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },

  // --- 魔王城（闇1） ---
  imp: { name: 'こあくま', element: 'dark', hp: 460, speed: 1.5, drop: 3, damage: 1, size: 0.26 },
  gargoyle: { name: 'ガーゴイル', element: 'dark', hp: 780, speed: 1.1, drop: 4, damage: 1, size: 0.32 },
  lich: { name: 'リッチ', element: 'dark', hp: 980, speed: 0.9, drop: 4, damage: 1, size: 0.32 },
  darkknight: { name: 'やみのきし', element: 'dark', hp: 1430, speed: 0.7, drop: 5, damage: 1, size: 0.36 },
  demonlord: { name: 'まぞく', element: 'dark', hp: 5850, speed: 0.6, drop: 30, damage: 2, size: 0.44, elite: true },
  maou: { name: 'まおう', element: 'dark', hp: 19500, speed: 0.35, drop: 150, damage: 0, size: 0.52, boss: true },
};
