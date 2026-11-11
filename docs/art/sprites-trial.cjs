// ドット絵の試し描き。図形の組み合わせで描く（ポップな太い縁取り）。
// 画面がなくても動く：grid（色の番号の配列）を作るだけ。0 = 透明。
// 大きさは2つ：64（図鑑で使う細かい絵）と 32（地域マップの1マスにそのまま置く絵）。
// ドット絵は縮めると線や目が消えるので、32 は 64 を縮めずに、32 のマス目で描き直している。
var SIZES = [64, 32];

function makeCanvas(N) {
  var g = new Array(N * N).fill(0);
  var api = {
    N: N,
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
    dots: function (list, c) {
      list.forEach(function (p) { api.set(p[0], p[1], c); });
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
    // 石だたみ：inside の中を、種の点に一番近いマスごとの石に分け、境目を目地の色にする。
    // 石の上の端は明るく、下の端は暗くする（shadeBottom が true のとき）。
    cobble: function (inside, seeds, colors, mortar, hi, sh, gap, shadeBottom) {
      var id = new Array(N * N).fill(-1);
      api.each(function (x, y) {
        if (!inside(x, y)) return;
        var d1 = 1e9, d2 = 1e9, i1 = -1;
        seeds.forEach(function (s, i) {
          var d = Math.hypot(x + 0.5 - s[0], (y + 0.5 - s[1]) * 1.25);
          if (d < d1) { d2 = d1; d1 = d; i1 = i; } else if (d < d2) d2 = d;
        });
        if (d2 - d1 < gap) g[y * N + x] = mortar;
        else { id[y * N + x] = i1; g[y * N + x] = colors[i1 % colors.length]; }
      });
      var at = function (x, y) { return x < 0 || y < 0 || x >= N || y >= N ? -1 : id[y * N + x]; };
      api.each(function (x, y) {
        var i = id[y * N + x];
        if (i < 0) return;
        if (at(x, y - 1) !== i) g[y * N + x] = hi;
        else if (shadeBottom && (at(x, y + 1) !== i || at(x + 1, y) !== i)) g[y * N + x] = sh;
      });
    },
  };
  return api;
}

// ---------- プチスライム（無） ----------
var SLIME_P = [null, '#2b2540', '#f6f3ff', '#d2cbf0', '#ffffff', '#ff9eb8', 'rgba(43,37,64,0.18)', '#a99fd6'];
var SL = { O: 1, BODY: 2, SHADE: 3, HI: 4, PINK: 5, SHADOW: 6, DEEP: 7 };

function slime64() {
  var c = makeCanvas(64);
  c.ellipse(32, 57.5, 19, 3.2, SL.SHADOW);
  // しずくの形：下の楕円＋上にとがる三角
  c.each(function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    var dx = (px - 32) / 22, dy = (py - 42) / 14;
    if ((dx * dx + dy * dy <= 1 && py <= 55.5) || (py >= 15 && py <= 42 && Math.abs(px - 32) <= Math.pow((py - 15) / 27, 0.85) * 19)) c.set(x, y, SL.BODY);
  });
  c.recolor(SL.BODY, SL.SHADE, function (x, y) {
    var dx = (x + 0.5 - 27) / 24, dy = (y + 0.5 - 37) / 19;
    return dx * dx + dy * dy > 1;
  });
  c.recolor(SL.SHADE, SL.DEEP, function (x, y) { return y >= 53; });
  c.ellipse(21.5, 33, 3, 5.5, SL.HI);
  c.ellipse(25.5, 25.5, 1.6, 1.6, SL.HI);
  [25, 39].forEach(function (ex) {
    c.ellipse(ex, 40, 2.6, 4.2, SL.O);
    c.set(ex - 1, 38, SL.HI);
    c.set(ex - 1, 39, SL.HI);
  });
  c.ellipse(19.5, 46, 2.8, 1.6, SL.PINK);
  c.ellipse(44.5, 46, 2.8, 1.6, SL.PINK);
  c.dots([[30, 45], [31, 46], [32, 46], [33, 46], [34, 45]], SL.O);
  c.outline(SL.O, [SL.SHADOW]);
  return { palette: SLIME_P, grid: c.g, size: 64 };
}

function slime32() {
  var c = makeCanvas(32);
  c.ellipse(16, 29, 9.5, 1.6, SL.SHADOW);
  c.each(function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    var dx = (px - 16) / 11, dy = (py - 21) / 7;
    if ((dx * dx + dy * dy <= 1 && py <= 28) || (py >= 7.5 && py <= 21 && Math.abs(px - 16) <= Math.pow((py - 7.5) / 13.5, 0.85) * 9.5)) c.set(x, y, SL.BODY);
  });
  c.recolor(SL.BODY, SL.SHADE, function (x, y) {
    var dx = (x + 0.5 - 13.5) / 12, dy = (y + 0.5 - 18.5) / 9.5;
    return dx * dx + dy * dy > 1;
  });
  c.recolor(SL.SHADE, SL.DEEP, function (x, y) { return y >= 27; });
  c.rect(10, 15, 1, 3, SL.HI);
  c.set(12, 12, SL.HI);
  [12, 18].forEach(function (ex) {
    c.rect(ex, 19, 2, 3, SL.O);
    c.set(ex, 19, SL.HI);
  });
  c.rect(9, 23, 2, 1, SL.PINK);
  c.rect(21, 23, 2, 1, SL.PINK);
  c.dots([[15, 23], [16, 23]], SL.O);
  c.outline(SL.O, [SL.SHADOW]);
  return { palette: SLIME_P, grid: c.g, size: 32 };
}

// ---------- いしだたみガニ（土）：背中の甲らが、そのまま石だたみ。顔は描かない ----------
var CRAB_P = [null, '#2b2a2e', '#9d968c', '#77716a', '#c4beb3', '#5f5a54', '#bdb6aa', '#a9a297', '#cdc7bb', '#e6e1d6', '#8b847a', '#1c1b1f', '#ffffff', 'rgba(43,42,46,0.2)', '#86b35c'];
var CR = { O: 1, BODY: 2, SHADE: 3, LIGHT: 4, MORTAR: 5, S1: 6, S2: 7, S3: 8, SHI: 9, SSH: 10, EYE: 11, WHITE: 12, SHADOW: 13, MOSS: 14 };

function crab64() {
  var c = makeCanvas(64);
  c.ellipse(32, 58, 22, 3, CR.SHADOW);
  // 足（左右3本ずつ）
  [[18, 45, 9, 54], [21, 48, 14, 57], [25, 50, 20, 58]].forEach(function (l) {
    c.line(l[0], l[1], l[2], l[3], CR.SHADE, 3);
    c.line(64 - l[0], l[1], 64 - l[2], l[3], CR.SHADE, 3);
  });
  // うでと、はさみ（上が開いている。丸い石のような手ざわり）
  c.line(16, 40, 10, 29, CR.BODY, 4);
  c.line(48, 40, 54, 29, CR.BODY, 4);
  [[9.5, 22], [54.5, 22]].forEach(function (p) {
    c.ellipse(p[0], p[1], 7, 8, CR.BODY, function (x, y) {
      var py = y + 0.5, px = x + 0.5;
      return !(py < p[1] - 1 && Math.abs(px - p[0]) < (p[1] - 1 - py) * 0.75);
    });
    c.recolor(CR.BODY, CR.SHADE, function (x, y) { return y >= p[1] + 4 && Math.abs(x + 0.5 - p[0]) < 8; });
    c.ellipse(p[0] - 2.5, p[1] + 0.5, 1.8, 2.6, CR.LIGHT);
  });
  // からだ：上は石だたみの甲ら、下は暗いおなか
  var inBody = function (x, y) {
    var dx = (x + 0.5 - 32) / 21, dy = (y + 0.5 - 41) / 12.5;
    return dx * dx + dy * dy <= 1;
  };
  c.each(function (x, y) { if (inBody(x, y)) c.set(x, y, CR.SHADE); });
  c.cobble(
    function (x, y) { return inBody(x, y) && y <= 45; },
    [[21, 32], [29, 31], [37, 31], [45, 33], [14, 40], [22, 38], [31, 37.5], [40, 38], [49, 40], [18, 45], [27, 44], [36, 44], [45, 45]],
    [CR.S1, CR.S2, CR.S3], CR.MORTAR, CR.SHI, CR.SSH, 1.4, true,
  );
  // 石のすきまの、こけ
  c.dots([[19, 31], [20, 31], [21, 30], [22, 31], [20, 30]], CR.MOSS);
  // 目（くき＋黒い目玉）
  c.line(27, 31, 26, 24, CR.SHADE, 2);
  c.line(37, 31, 38, 24, CR.SHADE, 2);
  [[26, 21], [38, 21]].forEach(function (p) {
    c.ellipse(p[0], p[1], 2.8, 3, CR.EYE);
    c.set(p[0] - 1, p[1] - 1, CR.WHITE);
  });
  c.outline(CR.O, [CR.SHADOW]);
  return { palette: CRAB_P, grid: c.g, size: 64 };
}

function crab32() {
  var c = makeCanvas(32);
  c.ellipse(16, 29, 11, 1.5, CR.SHADOW);
  [[9, 23, 5, 27], [11, 24, 8, 28], [13, 25, 11, 29]].forEach(function (l) {
    c.line(l[0], l[1], l[2], l[3], CR.SHADE, 1);
    c.line(31 - l[0], l[1], 31 - l[2], l[3], CR.SHADE, 1);
  });
  c.line(8, 20, 5, 15, CR.BODY, 2);
  c.line(24, 20, 27, 15, CR.BODY, 2);
  [[5, 11], [27, 11]].forEach(function (p) {
    c.ellipse(p[0], p[1], 3.6, 4, CR.BODY, function (x, y) {
      var py = y + 0.5, px = x + 0.5;
      return !(py < p[1] - 0.5 && Math.abs(px - p[0]) < (p[1] - 0.5 - py) * 0.8);
    });
    c.recolor(CR.BODY, CR.SHADE, function (x, y) { return y >= p[1] + 2 && Math.abs(x + 0.5 - p[0]) < 4; });
    c.set(Math.floor(p[0]) - 1, p[1], CR.LIGHT);
  });
  var inBody = function (x, y) {
    var dx = (x + 0.5 - 16) / 10.5, dy = (y + 0.5 - 20.5) / 6.3;
    return dx * dx + dy * dy <= 1;
  };
  c.each(function (x, y) { if (inBody(x, y)) c.set(x, y, CR.SHADE); });
  c.cobble(
    function (x, y) { return inBody(x, y) && y <= 22; },
    [[9.5, 16.5], [14, 15.3], [18.5, 15.3], [23, 16.5], [6.5, 20.5], [11.5, 19.5], [16, 19.2], [20.5, 19.5], [25.5, 20.5]],
    [CR.S1, CR.S3, CR.S2], CR.SSH, CR.SHI, CR.SSH, 0.8, false,
  );
  c.dots([[9, 15], [10, 14], [11, 15]], CR.MOSS);
  c.dots([[12, 13], [12, 14], [19, 13], [19, 14]], CR.SHADE);
  [[11, 11], [19, 11]].forEach(function (p) {
    c.rect(p[0], p[1], 2, 2, CR.EYE);
    c.set(p[0], p[1], CR.WHITE);
  });
  c.outline(CR.O, [CR.SHADOW]);
  return { palette: CRAB_P, grid: c.g, size: 32 };
}

// ---------- みずうたい（水・人型） ----------
var SINGER_P = [null, '#1d2a48', '#ffe2d2', '#f4bea6', '#4ea8e6', '#93d8ff', '#2f78bf', '#ffffff', '#ff9eb0', '#d4415a', 'rgba(29,42,72,0.18)', '#ffd84d', '#7fe0f0', '#3aa6c9'];
var SG = { O: 1, SKIN: 2, SKSH: 3, HAIR: 4, HAIRL: 5, HAIRD: 6, WHITE: 7, PINK: 8, MOUTH: 9, SHADOW: 10, NOTE: 11, DRESS: 12, DRESSD: 13 };

function singer64() {
  var c = makeCanvas(64);
  c.ellipse(32, 59, 18, 3, SG.SHADOW);
  // うしろ髪（水の流れ）
  c.ellipse(32, 27, 19, 18, SG.HAIRD);
  c.ellipse(15, 40, 6, 12, SG.HAIRD);
  c.ellipse(49, 40, 6, 12, SG.HAIRD);
  c.ellipse(13, 51, 3, 3, SG.HAIR);
  c.ellipse(51, 51, 3, 3, SG.HAIR);
  c.ellipse(16, 36, 1.4, 6, SG.HAIRL);
  c.ellipse(48.5, 36, 1.2, 5, SG.HAIR);
  // ドレス（下は波）
  c.each(function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    if (py >= 39 && py <= 55 && Math.abs(px - 32) <= 6 + (py - 39) * 0.75) c.set(x, y, SG.DRESS);
  });
  c.recolor(SG.DRESS, SG.DRESSD, function (x, y) { return x > 34 || y >= 53; });
  for (var i = 0; i < 5; i++) c.ellipse(19 + i * 6.5, 55.5, 3.6, 2.6, i % 2 ? SG.HAIR : SG.HAIRL);
  c.ellipse(23, 44, 2.6, 3.4, SG.SKIN);
  c.ellipse(41, 44, 2.6, 3.4, SG.SKSH);
  // 顔
  c.ellipse(32, 28, 13, 12, SG.SKIN);
  c.recolor(SG.SKIN, SG.SKSH, function (x, y) { return y >= 37 || (x >= 42 && y >= 24); });
  // 前髪
  c.ellipse(32, 17, 15.5, 8.5, SG.HAIR);
  for (var b = 0; b < 6; b++) {
    var bx = 20 + b * 4.8;
    for (var yy = 21; yy <= 25; yy++) {
      var half = (25 - yy) * 0.7;
      for (var xx = Math.floor(bx - half); xx <= Math.ceil(bx + half); xx++) c.set(xx, yy, SG.HAIR);
    }
  }
  c.ellipse(26, 14, 4, 2, SG.HAIRL);
  // しずくの髪かざり
  c.each(function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    var dx = (px - 46) / 3.2, dy = (py - 14) / 3.2;
    if (dx * dx + dy * dy <= 1 || (py >= 7.5 && py <= 14 && Math.abs(px - 46) <= (py - 7.5) * 0.5)) c.set(x, y, SG.HAIRL);
  });
  c.set(45, 13, SG.WHITE);
  // 目を閉じて歌う
  [26, 38].forEach(function (ex) { c.dots([[ex - 2, 30], [ex - 1, 29], [ex, 28], [ex + 1, 29], [ex + 2, 30]], SG.O); });
  c.ellipse(21.5, 33, 2.4, 1.4, SG.PINK);
  c.ellipse(42.5, 33, 2.4, 1.4, SG.PINK);
  c.ellipse(32, 35, 2.2, 2.4, SG.MOUTH);
  c.set(32, 36, SG.PINK);
  // 音符（2つ）
  [[55, 20], [5, 17]].forEach(function (n) {
    c.ellipse(n[0], n[1], 2.6, 2.1, SG.NOTE);
    c.line(n[0] + 2, n[1], n[0] + 2, n[1] - 8, SG.NOTE, 1);
    c.line(n[0] + 2, n[1] - 8, n[0] + 5, n[1] - 6, SG.NOTE, 1);
  });
  c.outline(SG.O, [SG.SHADOW]);
  return { palette: SINGER_P, grid: c.g, size: 64 };
}

function singer32() {
  var c = makeCanvas(32);
  c.ellipse(16, 29.5, 9, 1.5, SG.SHADOW);
  c.ellipse(16, 13.5, 9.5, 9, SG.HAIRD);
  c.ellipse(7.5, 20, 3, 6, SG.HAIRD);
  c.ellipse(24.5, 20, 3, 6, SG.HAIRD);
  c.rect(6, 25, 2, 2, SG.HAIR);
  c.rect(24, 25, 2, 2, SG.HAIR);
  c.rect(7, 16, 1, 5, SG.HAIRL);
  c.each(function (x, y) {
    var px = x + 0.5, py = y + 0.5;
    if (py >= 19.5 && py <= 27.5 && Math.abs(px - 16) <= 3 + (py - 19.5) * 0.75) c.set(x, y, SG.DRESS);
  });
  c.recolor(SG.DRESS, SG.DRESSD, function (x, y) { return x > 17 || y >= 26; });
  for (var i = 0; i < 4; i++) c.rect(9 + i * 4, 27, 2, 1, i % 2 ? SG.HAIR : SG.HAIRL);
  c.rect(11, 21, 2, 2, SG.SKIN);
  c.rect(19, 21, 2, 2, SG.SKSH);
  c.ellipse(16, 14, 6.5, 6, SG.SKIN);
  c.recolor(SG.SKIN, SG.SKSH, function (x, y) { return y >= 18 || (x >= 21 && y >= 12); });
  c.ellipse(16, 8.5, 7.75, 4.25, SG.HAIR);
  [10, 13, 16, 19, 22].forEach(function (bx) { c.dots([[bx, 11], [bx - 1, 10], [bx + 1, 10]], SG.HAIR); });
  c.rect(12, 6, 3, 1, SG.HAIRL);
  // しずくの髪かざり
  c.dots([[23, 4], [23, 5], [22, 6], [23, 6], [24, 6], [22, 7], [23, 7], [24, 7]], SG.HAIRL);
  c.set(22, 6, SG.WHITE);
  // 目を閉じて歌う
  [13, 19].forEach(function (ex) { c.dots([[ex - 1, 15], [ex, 14], [ex + 1, 15]], SG.O); });
  c.rect(10, 16, 2, 1, SG.PINK);
  c.rect(21, 16, 2, 1, SG.PINK);
  c.rect(16, 17, 1, 2, SG.MOUTH);
  // 音符
  c.rect(27, 10, 2, 2, SG.NOTE);
  c.rect(28, 6, 1, 4, SG.NOTE);
  c.set(29, 7, SG.NOTE);
  c.outline(SG.O, [SG.SHADOW]);
  return { palette: SINGER_P, grid: c.g, size: 32 };
}

var SPRITES = {
  slime: { 64: slime64, 32: slime32 },
  crab: { 64: crab64, 32: crab32 },
  singer: { 64: singer64, 32: singer32 },
};
if (typeof module !== 'undefined') module.exports = { SPRITES: SPRITES, SIZES: SIZES };
