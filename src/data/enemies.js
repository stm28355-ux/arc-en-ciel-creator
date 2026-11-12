// 敵（仮）。倒すと drop の数だけ、その敵の属性のエレメントが手に入る。
// 敵はどれも名簿のモンスター（monster）。名前と見た目はモンスターのものを使い、敵としての強さはここで決める。
// element はモンスターの属性と同じにする（テストで確かめる）。同じモンスターが、地域ごとに強さを変えて出てくることもある。
import { MONSTERS } from './monsters.js';

// 地域ごとに、手に入るエレメントの割合が地域の属性になるように敵を出す（草原：無＞風、森：風＞土・無、砂漠：土＞風・無、
// 川：水＞無・土、雷雨：雷＞水・土、海：水＞雷・風、火山：炎＞土・雷、雪山：氷＞水・風、混成：炎・氷＞無、
// 聖域：光2・炎1、境界：光1・闇1、魔王城：闇だけ）。
//   speed: 1秒に進むマス数 / damage: 拠点まで通したときに減る拠点の耐久
//   boss: 最後のボス。通したら拠点の耐久が全部なくなる（倒さないとクリアにならない）
//   elite: 強めの敵。拠点を2減らす
export const ENEMIES = {
  // --- 草原（無＞風。土は出ない） ---
  slime: { monster: 'slime', element: 'none', hp: 30, speed: 1.0, drop: 1, damage: 1, size: 0.28 },
  rabbit: { monster: 'windrabbit', element: 'wind', hp: 18, speed: 1.8, drop: 1, damage: 1, size: 0.24 },
  sheep: { monster: 'fluffysheep', element: 'none', hp: 75, speed: 0.75, drop: 1, damage: 1, size: 0.32 },
  ram: { monster: 'wildram', element: 'none', hp: 140, speed: 0.6, drop: 4, damage: 2, size: 0.38, elite: true },
  king: { monster: 'bigslime', element: 'none', hp: 260, speed: 0.5, drop: 10, damage: 0, size: 0.45, boss: true },

  // --- 森（風＞土・無） ---
  squirrel: { monster: 'weasel', element: 'wind', hp: 45, speed: 1.5, drop: 1, damage: 1, size: 0.25 },
  moss: { monster: 'sprite', element: 'none', hp: 70, speed: 0.9, drop: 1, damage: 1, size: 0.3 },
  mushroom: { monster: 'toadstool', element: 'earth', hp: 130, speed: 0.7, drop: 2, damage: 1, size: 0.32 },
  owl: { monster: 'nightjar', element: 'wind', hp: 80, speed: 1.1, drop: 2, damage: 1, size: 0.3 },
  bigowl: { monster: 'eagle', element: 'wind', hp: 320, speed: 0.7, drop: 6, damage: 2, size: 0.4, elite: true },
  treant: { monster: 'forestlord', element: 'wind', hp: 700, speed: 0.45, drop: 20, damage: 0, size: 0.48, boss: true },

  // --- 砂漠（土＞風・無） ---
  dust: { monster: 'swallow', element: 'wind', hp: 45, speed: 2.0, drop: 1, damage: 1, size: 0.25 },
  mole: { monster: 'mole', element: 'earth', hp: 90, speed: 0.75, drop: 2, damage: 1, size: 0.32 },
  dryslime: { monster: 'scarecrow', element: 'none', hp: 80, speed: 0.9, drop: 1, damage: 1, size: 0.3 },
  scorpion: { monster: 'crab', element: 'earth', hp: 165, speed: 0.8, drop: 3, damage: 1, size: 0.34 },
  bigmole: { monster: 'bigmole', element: 'earth', hp: 450, speed: 0.6, drop: 8, damage: 2, size: 0.42, elite: true },
  sandking: { monster: 'earthgiant', element: 'earth', hp: 1100, speed: 0.4, drop: 30, damage: 0, size: 0.5, boss: true },

  // --- 川（水＞無・土） ---
  fishling: { monster: 'flyfish', element: 'water', hp: 300, speed: 1.3, drop: 2, damage: 1, size: 0.26 },
  rivercrab: { monster: 'frog', element: 'water', hp: 460, speed: 0.8, drop: 2, damage: 1, size: 0.32 },
  mistball: { monster: 'prism', element: 'none', hp: 350, speed: 1.0, drop: 1, damage: 1, size: 0.3 },
  pebble: { monster: 'stoneslime', element: 'earth', hp: 590, speed: 0.7, drop: 2, damage: 1, size: 0.32 },
  catfish: { monster: 'catfish', element: 'water', hp: 2430, speed: 0.6, drop: 10, damage: 2, size: 0.42, elite: true },
  riverdragon: { monster: 'riverdragon', element: 'water', hp: 6480, speed: 0.4, drop: 40, damage: 0, size: 0.5, boss: true },

  // --- 雷雨（雷＞水・土） ---
  sparkbug: { monster: 'drone', element: 'thunder', hp: 220, speed: 1.6, drop: 2, damage: 1, size: 0.25 },
  raincloud: { monster: 'waterslime', element: 'water', hp: 360, speed: 0.9, drop: 2, damage: 1, size: 0.32 },
  mudman: { monster: 'golem', element: 'earth', hp: 500, speed: 0.7, drop: 2, damage: 1, size: 0.34 },
  thunderbear: { monster: 'magnetgolem', element: 'thunder', hp: 590, speed: 0.8, drop: 3, damage: 1, size: 0.36 },
  thunderwolf: { monster: 'thunderweasel', element: 'thunder', hp: 2340, speed: 0.9, drop: 12, damage: 2, size: 0.42, elite: true },
  raijinboss: { monster: 'raijin', element: 'thunder', hp: 5940, speed: 0.4, drop: 50, damage: 0, size: 0.5, boss: true },

  // --- 海（水＞雷・風） ---
  seabreeze: { monster: 'gull', element: 'wind', hp: 350, speed: 2.0, drop: 2, damage: 1, size: 0.25 },
  bluejelly: { monster: 'jelly', element: 'water', hp: 600, speed: 0.9, drop: 2, damage: 1, size: 0.32 },
  shark: { monster: 'shark', element: 'water', hp: 830, speed: 1.2, drop: 3, damage: 1, size: 0.34 },
  stingray: { monster: 'eel', element: 'thunder', hp: 730, speed: 0.9, drop: 3, damage: 1, size: 0.34 },
  bigoctopus: { monster: 'squid', element: 'water', hp: 4250, speed: 0.6, drop: 14, damage: 2, size: 0.44, elite: true },
  seaking: { monster: 'kraken', element: 'water', hp: 10750, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },

  // --- 火山（炎＞土・雷） ---
  firesprite: { monster: 'hinoko', element: 'fire', hp: 380, speed: 1.4, drop: 2, damage: 1, size: 0.26 },
  lavaslug: { monster: 'lavaturtle', element: 'fire', hp: 750, speed: 0.6, drop: 3, damage: 1, size: 0.34 },
  magmarock: { monster: 'turtle', element: 'earth', hp: 810, speed: 0.7, drop: 2, damage: 1, size: 0.34 },
  sparkfox: { monster: 'thunderweasel', element: 'thunder', hp: 480, speed: 1.5, drop: 2, damage: 1, size: 0.28 },
  flamegiant: { monster: 'magmagolem', element: 'fire', hp: 3250, speed: 0.6, drop: 14, damage: 2, size: 0.44, elite: true },
  volcanoking: { monster: 'volcanoking', element: 'fire', hp: 8750, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },

  // --- 雪山（氷＞水・風） ---
  snowhare: { monster: 'blizzardwolf', element: 'ice', hp: 640, speed: 1.7, drop: 3, damage: 1, size: 0.25 },
  icebeetle: { monster: 'icerock', element: 'ice', hp: 1610, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  sleetcloud: { monster: 'kappa', element: 'water', hp: 1040, speed: 0.9, drop: 2, damage: 1, size: 0.32 },
  gust: { monster: 'falcon', element: 'wind', hp: 740, speed: 2.0, drop: 2, damage: 1, size: 0.25 },
  yeti: { monster: 'mammoth', element: 'ice', hp: 6900, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  snowqueen: { monster: 'icewitch', element: 'ice', hp: 18400, speed: 0.4, drop: 100, damage: 0, size: 0.5, boss: true },

  // --- 混成（炎・氷＞無） ---
  firefly: { monster: 'flamebat', element: 'fire', hp: 420, speed: 1.5, drop: 2, damage: 1, size: 0.25 },
  frostfly: { monster: 'snowowl', element: 'ice', hp: 420, speed: 1.5, drop: 2, damage: 1, size: 0.25 },
  ashgolem: { monster: 'firework', element: 'fire', hp: 960, speed: 0.6, drop: 3, damage: 1, size: 0.36 },
  frostgolem: { monster: 'snowman', element: 'ice', hp: 960, speed: 0.6, drop: 3, damage: 1, size: 0.36 },
  greyslime: { monster: 'slime', element: 'none', hp: 600, speed: 1.0, drop: 1, damage: 1, size: 0.3 },
  chimera: { monster: 'chimera', element: 'fire', hp: 3840, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  twinking: { monster: 'twinking', element: 'ice', hp: 10800, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },
  // --- 聖域（光2・炎1） ---
  wisplight: { monster: 'lumen', element: 'light', hp: 880, speed: 1.4, drop: 3, damage: 1, size: 0.26 },
  holyknight: { monster: 'crystalgolem', element: 'light', hp: 2450, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  flamespirit: { monster: 'torchbearer', element: 'fire', hp: 1230, speed: 1.2, drop: 5, damage: 1, size: 0.3 },
  seraph: { monster: 'archangel', element: 'light', hp: 10500, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  sanctuaryguard: { monster: 'sanctuaryguard', element: 'light', hp: 28000, speed: 0.4, drop: 80, damage: 0, size: 0.5, boss: true },

  // --- 境界（光1・闇1） ---
  lightling: { monster: 'dove', element: 'light', hp: 510, speed: 1.3, drop: 3, damage: 1, size: 0.26 },
  shadowling: { monster: 'darkbat', element: 'dark', hp: 510, speed: 1.3, drop: 3, damage: 1, size: 0.26 },
  lightguard: { monster: 'holybot', element: 'light', hp: 1360, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  darkguard: { monster: 'gravegolem', element: 'dark', hp: 1360, speed: 0.7, drop: 4, damage: 1, size: 0.34 },
  eclipse: { monster: 'fallen', element: 'dark', hp: 5950, speed: 0.6, drop: 20, damage: 2, size: 0.44, elite: true },
  borderking: { monster: 'borderking', element: 'light', hp: 15300, speed: 0.4, drop: 60, damage: 0, size: 0.5, boss: true },

  // --- 魔王城（闇1） ---
  imp: { monster: 'shade', element: 'dark', hp: 460, speed: 1.5, drop: 3, damage: 1, size: 0.26 },
  gargoyle: { monster: 'raven', element: 'dark', hp: 780, speed: 1.1, drop: 4, damage: 1, size: 0.32 },
  lich: { monster: 'reaper', element: 'dark', hp: 980, speed: 0.9, drop: 4, damage: 1, size: 0.32 },
  darkknight: { monster: 'shadowbot', element: 'dark', hp: 1430, speed: 0.7, drop: 5, damage: 1, size: 0.36 },
  demonlord: { monster: 'demon', element: 'dark', hp: 5850, speed: 0.6, drop: 30, damage: 2, size: 0.44, elite: true },
  maou: { monster: 'maou', element: 'dark', hp: 19500, speed: 0.35, drop: 150, damage: 0, size: 0.52, boss: true },
};

// 敵の名前は、名簿のモンスターの名前
for (const e of Object.values(ENEMIES)) e.name = MONSTERS[e.monster].name;
