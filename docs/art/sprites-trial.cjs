// 64×64 のドット絵を、図形の組み合わせで描く（ポップな太い縁取り）。
// 画面がなくても動く：grid（色の番号の配列）を作るだけ。0 = 透明。
var SPRITE_SIZE = 64;

function makeCanvas() {
  var N = SPRITE_SIZE;
  var g = new Array(N * N).fill(0);
  var api = {
    g: g,
    set: function (x, y, c) {
      x = Math.round(x);
      y = Math.round(y);
      if (x >= 0 && y >= 0 && x < N && y < N) g[y * N + x] = c;
    },
    get: function (x, y) {
      if (x < 0 || y < 0 || x >= N || y >= N) return 0;
      return g[y * N + x];
    },
    each: function (fn) {
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) fn(x, y);
    },
    ellipse: function (cx, cy, rx, ry, c, test) {
      api.each(function (x, y) {
        var dx = (x + 0.5 - cx) / rx;
        var dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) g[y * N + x] = c;
      });
    },
    rect: function (x0, y0, w, h, c) {
      for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) api.set(x, y, c);
    },
    line: function (x0, y0, x1, y1, c, w) {
      var steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
      for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        var x = x0 + (x1 - x0) * t;
        var y = y0 + (y1 - y0) * t;
        if ((w || 1) <= 1) api.set(x, y, c);
        else api.ellipse(x, y, w / 2, w / 2, c);
      }
    },
    // 塗った形のまわりを縁取りの色で囲む（ignore の色は縁取りしない：影など）
    outline: function (c, ignore) {
      var add = [];
      api.each(function (x, y) {
        if (g[y * N + x] !== 0) return;
        var near = [api.get(x - 1, y), api.get(x + 1, y), api.get(x, y - 1), api.get(x, y + 1)];
        if (near.some(function (v) { return v !== 0 && v !== c && (!ignore || ignore.indexOf(v) < 0); })) add.push([x, y]);
      });
      add.forEach(function (p) { g[p[1] * N + p[0]] = c; });
    },
    // 指定の色の部分だけ、条件に合うマスを別の色にする（影や光）
    recolor: function (from, to, test) {
      api.each(function (x, y) {
        if (g[y * N + x] === from && test(x, y)) g[y * N + x] = to;
      });
    },
  };
  return api;
}

// ---------- プチスライム（無） ----------
function drawSlime() {
  var P = [null, '#2b2540', '#f6f3ff', '#d2cbf0', '#ffffff', '#ff9eb8', 'rgba(43,37,64,0.18)', '#a99fd6'];
  var O = 1, BODY = 2, SHADE = 3, HI = 4, PINK = 5, SHADOW = 6, DEEP = 7;
  var c = makeCanvas();
  c.ellipse(32, 57.5, 19, 3.2, SHADOW);
  // しずくの形：下の楕円＋上にとがる三角
  var inside = function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    var dx = (px - 32) / 22, dy = (py - 42) / 14;
    if (dx * dx + dy * dy <= 1 && py <= 55.5) return true;
    if (py >= 15 && py <= 42) {
      var w = Math.pow((py - 15) / 27, 0.85) * 19;
      return Math.abs(px - 32) <= w;
    }
    return false;
  };
  c.each(function (x, y) { if (inside(x, y)) c.set(x, y, BODY); });
  // 影：右下
  c.recolor(BODY, SHADE, function (x, y) {
    var dx = (x + 0.5 - 27) / 24, dy = (y + 0.5 - 37) / 19;
    return dx * dx + dy * dy > 1;
  });
  c.recolor(SHADE, DEEP, function (x, y) { return y >= 53; });
  // 光
  c.ellipse(21.5, 33, 3, 5.5, HI);
  c.ellipse(25.5, 25.5, 1.6, 1.6, HI);
  // 目
  [25, 39].forEach(function (ex) {
    c.ellipse(ex, 40, 2.6, 4.2, O);
    c.set(ex - 1, 38, HI);
    c.set(ex - 1, 39, HI);
  });
  // ほっぺと口
  c.ellipse(19.5, 46, 2.8, 1.6, PINK);
  c.ellipse(44.5, 46, 2.8, 1.6, PINK);
  [[30, 45], [31, 46], [32, 46], [33, 46], [34, 45]].forEach(function (p) { c.set(p[0], p[1], O); });
  c.outline(O, [SHADOW]);
  return { palette: P, grid: c.g };
}

// ---------- いしだたみガニ（土） ----------
function drawCrab() {
  var P = [null, '#2a1d17', '#e2874f', '#b85d33', '#cfc7b8', '#9a907f', '#ffffff', 'rgba(42,29,23,0.2)', '#f2a36d', '#ffd2b0', '#e86a5c'];
  var O = 1, SHELL = 2, SHADE = 3, STONE = 4, MORTAR = 5, WHITE = 6, SHADOW = 7, LIGHT = 8, BELLY = 9, CHEEK = 10;
  var c = makeCanvas();
  c.ellipse(32, 58, 22, 3, SHADOW);
  // 足（左右3本ずつ）
  [[18, 45, 9, 54], [21, 48, 14, 57], [25, 50, 20, 58]].forEach(function (l) {
    c.line(l[0], l[1], l[2], l[3], SHADE, 3);
    c.line(64 - l[0], l[1], 64 - l[2], l[3], SHADE, 3);
  });
  // うで
  c.line(16, 40, 10, 29, SHELL, 4);
  c.line(48, 40, 54, 29, SHELL, 4);
  // はさみ（上が開いている）
  [[9.5, 22], [54.5, 22]].forEach(function (p) {
    c.ellipse(p[0], p[1], 7, 8, SHELL, function (x, y) {
      var py = y + 0.5, px = x + 0.5;
      return !(py < p[1] - 1 && Math.abs(px - p[0]) < (p[1] - 1 - py) * 0.75);
    });
    c.ellipse(p[0] - 2, p[1] + 2, 2.4, 3, LIGHT);
  });
  // からだ
  c.ellipse(32, 41, 21, 12.5, SHELL);
  c.recolor(SHELL, SHADE, function (x, y) { return y >= 47; });
  c.ellipse(32, 47, 13, 4.5, BELLY, function (x, y) { return y >= 45; });
  // 背中の石だたみ：目地を塗ってから石を置く
  c.ellipse(32, 38, 18, 9.5, MORTAR, function (x, y) { return y <= 41; });
  var stones = [
    [17, 34, 6, 4], [24, 31, 7, 4], [32, 31, 7, 4], [40, 32, 6, 4],
    [15, 39, 6, 3], [22, 36, 7, 4], [30, 36, 6, 4], [37, 37, 7, 4], [45, 38, 4, 3],
  ];
  stones.forEach(function (s) {
    for (var y = s[1]; y < s[1] + s[3]; y++)
      for (var x = s[0]; x < s[0] + s[2]; x++) {
        var corner = (x === s[0] || x === s[0] + s[2] - 1) && (y === s[1] || y === s[1] + s[3] - 1);
        if (!corner && c.get(x, y) === MORTAR) c.set(x, y, STONE);
      }
    c.set(s[0] + 1, s[1], WHITE);
  });
  // 目（くき＋目玉）
  c.line(27, 31, 25, 23, SHADE, 2);
  c.line(37, 31, 39, 23, SHADE, 2);
  [[25, 20], [39, 20]].forEach(function (p) {
    c.ellipse(p[0], p[1], 3.6, 3.8, WHITE);
    c.ellipse(p[0] + 0.5, p[1] + 0.5, 1.6, 2, O);
    c.set(p[0] - 1, p[1] - 1, WHITE);
  });
  // 口とほっぺ
  [[29, 47], [30, 48], [31, 48], [32, 48], [33, 48], [34, 47]].forEach(function (p) { c.set(p[0], p[1], O); });
  c.ellipse(22, 46, 2.2, 1.3, CHEEK);
  c.ellipse(42, 46, 2.2, 1.3, CHEEK);
  c.outline(O, [SHADOW]);
  return { palette: P, grid: c.g };
}

// ---------- みずうたい（水・人型） ----------
function drawSinger() {
  var P = [null, '#1d2a48', '#ffe2d2', '#f4bea6', '#4ea8e6', '#93d8ff', '#2f78bf', '#ffffff', '#ff9eb0', '#d4415a', 'rgba(29,42,72,0.18)', '#ffd84d', '#7fe0f0', '#3aa6c9'];
  var O = 1, SKIN = 2, SKSH = 3, HAIR = 4, HAIRL = 5, HAIRD = 6, WHITE = 7, PINK = 8, MOUTH = 9, SHADOW = 10, NOTE = 11, DRESS = 12, DRESSD = 13;
  var c = makeCanvas();
  c.ellipse(32, 59, 18, 3, SHADOW);
  // うしろ髪（水の流れ）
  c.ellipse(32, 27, 19, 18, HAIRD);
  c.ellipse(15, 40, 6, 12, HAIRD);
  c.ellipse(49, 40, 6, 12, HAIRD);
  c.ellipse(13, 51, 3, 3, HAIR);
  c.ellipse(51, 51, 3, 3, HAIR);
  // 髪の光（水のつや）
  c.ellipse(16, 36, 1.4, 6, HAIRL);
  c.ellipse(48.5, 36, 1.2, 5, HAIR);
  // ドレス（下は波）
  c.each(function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    if (py >= 39 && py <= 55) {
      var w = 6 + (py - 39) * 0.75;
      if (Math.abs(px - 32) <= w) c.set(x, y, DRESS);
    }
  });
  c.recolor(DRESS, DRESSD, function (x, y) { return x > 34 || y >= 53; });
  // 波のすそ
  for (var i = 0; i < 5; i++) c.ellipse(19 + i * 6.5, 55.5, 3.6, 2.6, i % 2 ? HAIR : HAIRL);
  // うで
  c.ellipse(23, 44, 2.6, 3.4, SKIN);
  c.ellipse(41, 44, 2.6, 3.4, SKSH);
  // 顔
  c.ellipse(32, 28, 13, 12, SKIN);
  c.recolor(SKIN, SKSH, function (x, y) { return y >= 37 || (x >= 42 && y >= 24); });
  // 前髪
  c.ellipse(32, 17, 15.5, 8.5, HAIR);
  for (var b = 0; b < 6; b++) {
    var bx = 20 + b * 4.8;
    for (var yy = 21; yy <= 25; yy++) {
      var half = (25 - yy) * 0.7;
      for (var xx = Math.floor(bx - half); xx <= Math.ceil(bx + half); xx++) c.set(xx, yy, HAIR);
    }
  }
  c.ellipse(26, 14, 4, 2, HAIRL);
  // しずくの髪かざり
  c.each(function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    var dx = (px - 46) / 3.2, dy = (py - 14) / 3.2;
    if (dx * dx + dy * dy <= 1 || (py >= 7.5 && py <= 14 && Math.abs(px - 46) <= (py - 7.5) * 0.5)) c.set(x, y, HAIRL);
  });
  c.set(45, 13, WHITE);
  // 目を閉じて歌う
  [26, 38].forEach(function (ex) {
    [[-2, 30], [-1, 29], [0, 28], [1, 29], [2, 30]].forEach(function (p) { c.set(ex + p[0], p[1], O); });
  });
  c.ellipse(21.5, 33, 2.4, 1.4, PINK);
  c.ellipse(42.5, 33, 2.4, 1.4, PINK);
  // 歌う口
  c.ellipse(32, 35, 2.2, 2.4, MOUTH);
  c.set(32, 36, PINK);
  // 音符（2つ）
  [[55, 20, 1], [5, 17, -1]].forEach(function (n) {
    c.ellipse(n[0], n[1], 2.6, 2.1, NOTE);
    c.line(n[0] + 2, n[1], n[0] + 2, n[1] - 8, NOTE, 1);
    c.line(n[0] + 2, n[1] - 8, n[0] + 5, n[1] - 6, NOTE, 1);
  });
  c.outline(O, [SHADOW]);
  return { palette: P, grid: c.g };
}

var SPRITES = { slime: drawSlime, crab: drawCrab, singer: drawSinger };
if (typeof module !== 'undefined') module.exports = { SPRITES: SPRITES, SPRITE_SIZE: SPRITE_SIZE };
