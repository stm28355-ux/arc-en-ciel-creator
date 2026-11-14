// パレット：左（または上）のマス目にアイコンを並べて選ぶ部品（2026-11-14 企画者の注文。参考はアトリエ系のコンテナ画面）。
// モンスター画面（手持ち・融合・図鑑）、施設のページ、地域マップのモンスター・建設で使う。
// 8列の市松のマス目。行が多いときはマス目の中だけスクロールする。

/**
 * title：上の見出し / tabs：絞りこみのボタン（HTML） / foot：下の一言
 * key：スクロールの位置を覚えるための名前（描き直しても位置が戻らないように keepScroll で使う）
 * attr：押したときの操作を入れる data 属性の名前（'mact' なら data-mact）
 * rows：見える行の数
 * cells = [{ pic: 絵の HTML, act, data: {name: value}, sel?, dim?, disabled?, lv?, mark?, dot?: 色, title? }]
 */
export function palette({ title = '', tabs = '', cells, foot = '', key = 'palette', attr = 'mact', rows = 6, empty = 'ここに出せるものがありません' }) {
  const body = cells
    .map((c) => {
      const data = Object.entries(c.data ?? {})
        .map(([k, v]) => `data-${k}="${v}"`)
        .join(' ');
      return `<button class="pcell ${c.sel ? 'sel' : ''} ${c.dim ? 'dim' : ''}" data-${attr}="${c.act}" ${data} title="${c.title ?? ''}" ${c.disabled ? 'disabled' : ''}>
        ${c.pic}
        ${c.lv ? `<span class="plv">${c.lv}</span>` : ''}
        ${c.mark ? `<span class="pmark">${c.mark}</span>` : ''}
        ${c.dot ? `<i class="pdot" style="background:${c.dot}"></i>` : ''}
      </button>`;
    })
    .join('');
  return `<section class="palette">
    ${title ? `<h3 class="ptitle">${title}</h3>` : ''}
    ${tabs ? `<div class="ptabs">${tabs}</div>` : ''}
    <div class="pgrid" data-keep-scroll="${key}" style="max-height:calc(72px * ${rows} + 4px)">${body}</div>
    ${cells.length ? '' : `<p class="pempty">${empty}</p>`}
    ${foot ? `<p class="pfoot">${foot}</p>` : ''}
  </section>`;
}

/**
 * root の中身を描き直す。描き直しの前後で、パレットなど data-keep-scroll のついた所のスクロールの位置を変えない
 * （図鑑を下までスクロールして選ぶと、一番上に戻ってしまうのを直した。2026-11-14）
 */
export function keepScroll(root, render) {
  const saved = new Map([...root.querySelectorAll('[data-keep-scroll]')].map((el) => [el.dataset.keepScroll, el.scrollTop]));
  render();
  for (const el of root.querySelectorAll('[data-keep-scroll]')) {
    if (saved.has(el.dataset.keepScroll)) el.scrollTop = saved.get(el.dataset.keepScroll);
  }
}
