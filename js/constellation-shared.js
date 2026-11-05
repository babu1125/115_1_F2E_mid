// 共用星座圖：由恆星資料計算星點與連線
/* Single source: observatory-data.js and constellation-lines.js. */
window.XINGXU_CONSTELLATION_CHART = function (k) {
  // 篩選指定星座的恆星
  const all = (window.XINGXU_STARS || []).filter((s) => s.group === k);
  if (all.length < 2) return null;
  // 建立星名對照表
  const lookup = Object.fromEntries(all.map((s) => [s.en, s]));
  // 星座內有效的連線
  const edges = (window.XINGXU_CONSTELLATION_LINES || []).filter(
    ([a, b]) => lookup[a] && lookup[b],
  );
  const base = all[0].ra;
  // 以第一顆星的赤經為基準處理跨越 0° 的情況，避免同一星座在圖上被拉得過寬。
  const coords = all.map((s) => ({
    ...s,
    xra: base + (((s.ra - base + 540) % 360) - 180),
  }));
  const raMin = Math.min(...coords.map((s) => s.xra)),
    raMax = Math.max(...coords.map((s) => s.xra));
  const decMin = Math.min(...coords.map((s) => s.dec)),
    decMax = Math.max(...coords.map((s) => s.dec));
  // 將赤緯中心換成弧度，供後續 cos 計算使用；Math 三角函式使用弧度。
  const dec0 = (((decMin + decMax) / 2) * Math.PI) / 180;
  // 依赤緯修正水平方向跨度，再計算圖形需要的顯示空間。
  const spanX = Math.max(0.5, (raMax - raMin) * Math.cos(dec0)),
    spanY = Math.max(0.5, decMax - decMin);
  // 比較可用寬度與高度，選較小的倍率，讓整個星座都能放進畫面。
  const scale = Math.min(455 / spanX, 285 / spanY);
  const midRA = (raMin + raMax) / 2,
    midDec = (decMin + decMax) / 2;
  // 把天球座標平移並縮放到示意圖；x 反向換算，y 則讓赤緯較高的星點靠上。
  const pts = coords.map((s) => ({
    ...s,
    x: 300 - (s.xra - midRA) * Math.cos(dec0) * scale,
    y: 194 - (s.dec - midDec) * scale,
  }));
  return { pts, edges };
};
