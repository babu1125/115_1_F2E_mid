// Canvas 不會自動保存 HTML 元件；視野或狀態改變後，必須呼叫 render 重新繪製。
// 星空觀測站的繪圖與操作
(() => {
  "use strict";
  // 恆星或星座資料
  const stars = window.XINGXU_STARS || [],

    canvas = document.getElementById("sky"),

    vp = document.getElementById("viewport"),

    ctx = canvas.getContext("2d");
  const seasonMap = {
    spring: "春季",
    summer: "夏季",
    autumn: "秋季",
    winter: "冬季",
  };
  // 季節與星座對照
  const groups = {
    spring: ["leo", "virgo", "bootes", "cancer"],
    summer: ["lyra", "aquila", "cygnus", "scorpius"],
    autumn: ["andromeda", "pegasus", "cassiopeia", "perseus"],
    winter: ["orion", "taurus", "gemini", "canis_major"],
  };
  // 星座連線資料
  const links = window.XINGXU_CONSTELLATION_LINES || [];
  // 將陣列轉成以英文星名為索引的物件，之後可直接用名稱查出座標。
  const byName = Object.fromEntries(stars.map((s) => [s.en, s]));
  // 視野中心與縮放設定
  let centerRA = 90,
    centerDec = 15,
    fov = 100,
    showLines = true,
    showLabels = true,
    selected = null,
    activeAsterism = null,
    projected = [];
  // 記錄畫布尺寸、像素比例、視野中心、縮放及選取狀態，供繪圖與操作共用。
  let W = 0,
    H = 0,
    dpr = 1,
    down = null,
    drag = false;
  // 限制數值範圍
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)),
    wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
  // 產生背景星點用的偽隨機數
  const rand = (n) => {
    const x = Math.sin(n * 127.1 + 23.8) * 43758.5453;
    return x - Math.floor(x);
  };
  // 建立背景星點，補足畫面的星空氛圍。
  const bg = []; // No synthetic points presented as astronomical stars.
  // 依容器尺寸與裝置像素比例設定 Canvas，讓星空在高解析度螢幕上保持清晰。
  function resize() {
    const r = vp.getBoundingClientRect();
    W = Math.max(300, r.width);
    H = Math.max(250, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }
  // 以視野中心為基準，將恆星赤經、赤緯投影成畫布上的 x、y；赤經增加時向畫面左側移動。
  function pos(s) {
    const rad = Math.PI / 180,
      d = (s.ra - centerRA) * rad,
      lat = s.dec * rad,
      lat0 = centerDec * rad;
    const c = Math.max(
      -1,
      Math.min(
        1,
        Math.sin(lat0) * Math.sin(lat) +
          Math.cos(lat0) * Math.cos(lat) * Math.cos(d),
      ),
    );
    const ang = Math.acos(c),
      k = ang < 1e-9 ? 1 : ang / Math.sin(ang);
    const east = (k * Math.cos(lat) * Math.sin(d)) / rad,
      north =
        (k *
          (Math.cos(lat0) * Math.sin(lat) -
            Math.sin(lat0) * Math.cos(lat) * Math.cos(d))) /
        rad;
    // 比較可用寬度與高度，選較小的倍率，讓整個星座都能放進畫面。
    const scale = W / fov;
    return { x: W / 2 - east * scale, y: H / 2 - north * scale };
  }
  // 檢查投影座標是否在畫面附近；margin 保留邊緣緩衝，避免星點突然消失。
  function visible(p, margin = 25) {
    return (
      p.x >= -margin && p.x <= W + margin && p.y >= -margin && p.y <= H + margin
    );
  }
  // 使用由中心向外變透明的漸層繪製光暈，再配合星點本體形成發光效果。
  function glow(x, y, r, color) {

    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);

    ctx.fill();
  }
  // 依目前狀態重畫內容；篩選或操作完成後再呼叫，讓畫面保持同步。
  function render() {
    if (!W) return;

    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(
      W * 0.47,
      H * 0.42,
      5,
      W * 0.5,
      H * 0.5,
      Math.max(W, H) * 0.76,
    );
    grad.addColorStop(0, "#1c3454");
    grad.addColorStop(0.55, "#0c1a31");
    grad.addColorStop(1, "#040a17");

    ctx.fillStyle = grad;

    ctx.fillRect(0, 0, W, H);
    // No unverified stars are plotted.
    bg.forEach((s, i) => {
      const p = pos(s);
      if (!visible(p, 2)) return;

      ctx.fillStyle =
        s.hue > 0.82 ? "rgba(255,222,185,.46)" : "rgba(194,214,247,.36)";

      ctx.beginPath();
      ctx.arc(p.x, p.y, s.mag > 0.93 ? 1.15 : 0.48, 0, Math.PI * 2);

      ctx.fill();
    });
    // Coordinate grid hidden: straight RA/Dec lines would be misleading under spherical projection.
    if (showLines) {

      ctx.strokeStyle = "rgba(224,188,123,.40)";

      ctx.lineWidth = 1.15;

      ctx.setLineDash([5, 5]);
      links.forEach(([a, b]) => {
        const sa = byName[a],
          sb = byName[b];
        if (!sa || !sb || Math.abs(wrap(sa.ra - sb.ra)) > 35) return;
        const pa = pos(sa),
          pb = pos(sb);
        if (Math.abs(pa.x - pb.x) > W * 0.8) return;

        ctx.beginPath();

        ctx.moveTo(pa.x, pa.y);

        ctx.lineTo(pb.x, pb.y);

        ctx.stroke();
      });

      ctx.setLineDash([]);
    }
    if (activeAsterism) {
      const names = activeAsterism.names,
        coords = names
          .map((n) => byName[n])
          .filter(Boolean)
          .map(pos);
      if (coords.length === names.length) {

        ctx.save();

        ctx.strokeStyle = "#f1ca7d";

        ctx.lineWidth = 2.1;

        ctx.setLineDash([7, 5]);

        ctx.beginPath();
        coords.forEach((pt, i) =>

          i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y),
        );

        ctx.closePath();

        ctx.stroke();

        ctx.setLineDash([]);
        coords.forEach((pt) => {

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 11, 0, 2 * Math.PI);

          ctx.stroke();
        });

        ctx.restore();
      }
    }
    projected = [];
    // 逐顆繪製恆星：依星等決定大小，並補上光暈、選取框與名稱。
    stars.forEach((s) => {
      const p = pos(s);
      if (!visible(p, 15)) return;
      projected.push({ ...p, star: s });
      const r =
        s.featured === true
          ? clamp(5.5 - s.mag * 0.8, 3.2, 7.5)
          : clamp(3.6 - s.mag * 0.8, 1.5, 5.0);
      const warm = [
        "Betelgeuse",
        "Antares",
        "Aldebaran",
        "Arcturus",
        "Pollux",
        "Mirach",
      ].includes(s.en);
      const c = warm ? "#ffd3a4" : "#dbeeff";
      glow(
        p.x,
        p.y,
        r * 5,
        warm ? "rgba(255,164,108,.20)" : "rgba(153,199,255,.19)",
      );

      ctx.fillStyle = c;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

      ctx.fill();
      if (selected === s) {

        ctx.strokeStyle = "#f4cf87";

        ctx.lineWidth = 1.8;

        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);

        ctx.stroke();

        ctx.setLineDash([]);
      }
      if (showLabels && s.cn && (s.mag < 1.5 || selected === s) && fov < 160) {

        ctx.font = "12px sans-serif";

        ctx.textAlign = "left";

        ctx.fillStyle = "#e6d4b3";

        ctx.fillText(s.cn, p.x + 10, p.y - 8);
      }
    });

    document.getElementById("centerLabel").textContent =
      `RA ${(centerRA / 15).toFixed(1)}h · Dec ${centerDec >= 0 ? "+" : ""}${centerDec.toFixed(1)}°`;

    document.getElementById("fovLabel").textContent =
      `視野寬度 ${fov.toFixed(0)}°`;
  }
  // 記錄目前選取的恆星，更新名稱、星等、座標與介紹，再重畫選取標示。
  function info(s) {
    activeAsterism = null;
    selected = s;

    const el = document.getElementById("starInfo");
    const cn = s.group

      ? Object.entries(groups).find(([_, ids]) => ids.includes(s.group))?.[0]
      : null;
    const groupLabel = {
      // 獅子座資料
      leo: "獅子座",
      // 室女座資料
      virgo: "室女座",
      // 牧夫座資料
      bootes: "牧夫座",
      // 巨蟹座資料
      cancer: "巨蟹座",
      // 天琴座資料
      lyra: "天琴座",
      // 天鷹座資料
      aquila: "天鷹座",
      // 天鵝座資料
      cygnus: "天鵝座",
      // 天蠍座資料
      scorpius: "天蠍座",
      // 仙女座資料
      andromeda: "仙女座",
      // 飛馬座資料
      pegasus: "飛馬座",
      // 仙后座資料
      cassiopeia: "仙后座",
      // 英仙座資料
      perseus: "英仙座",
      // 獵戶座資料
      orion: "獵戶座",
      // 金牛座資料
      taurus: "金牛座",
      // 雙子座資料
      gemini: "雙子座",
      // 大犬座資料
      canis_major: "大犬座",
    }[s.group];
    // 先清空舊內容，再加入這次產生的元素，避免每次更新都重複堆疊。
    el.replaceChildren();
    const title = document.createElement("h2");
    title.textContent = s.cn;
    el.append(title);
    const latin = document.createElement("div");
    latin.className = "obs-name-en";
    latin.textContent = s.en;
    el.append(latin);
    const meta = document.createElement("div");
    meta.className = "obs-meta";
    // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
    meta.innerHTML = `<b>所屬星座：</b>${groupLabel || "其他星座"}<br><b>視星等（約）：</b>${s.mag.toFixed(2)}<br><b>赤經（J2000）：</b>${(s.ra / 15).toFixed(3)}h<br><b>赤緯（J2000）：</b>${s.dec >= 0 ? "+" : ""}${s.dec.toFixed(3)}°`;
    el.append(meta);
    const desc = document.createElement("p");
    desc.textContent = s.desc;
    el.append(desc);
    if (cn) {
      const link = document.createElement("a");
      link.className = "obs-link";
      link.href = `${cn}/constellation.html?id=${s.group}`;
      link.textContent = `探索${groupLabel} ↗`;
      el.append(link);
    }
    render();
  }
  // 將視野中心移到指定恆星，限制赤緯範圍與視野寬度，並顯示介紹。
  function focus(s) {
    centerRA = s.ra;
    centerDec = clamp(s.dec, -75, 75);
    fov = Math.min(fov, 75);
    info(s);
  }
  // B. 放大與縮小：fov 是視野寬度；減小它會放大星空，增加它會縮小星空。
  function zoom(mult) {
    fov = clamp(fov * mult, 18, 300);
    render();
  }
  // A. 開始拖曳：記下手指／滑鼠的位置和當時的星空中心，移動時才知道要移多少。
  canvas.addEventListener("pointerdown", (e) => {
    // 按下後即使游標移出畫布，也繼續接收這次操作。
    canvas.setPointerCapture(e.pointerId);
    // 保存起點與當時中心；pointermove 會用新位置和這些舊值比較。
    down = { x: e.clientX, y: e.clientY, ra: centerRA, dec: centerDec };
    // 尚未移動，先視為點擊；移動超過門檻才算拖曳。
    drag = false;
  });
  // 持續讀取游標或觸控位置，換算拖曳位移或雙指距離並更新視野。
  canvas.addEventListener("pointermove", (e) => {
    if (!down) return;
    // 計算游標離開起點的水平與垂直距離。
    const dx = e.clientX - down.x,
      dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) > 5) drag = true;
    // 把畫面上的移動量換成天球角度；視野越窄，同樣移動像素代表越小角度。
    const factor = fov / W;
    centerRA =
      (((down.ra +
        (dx * factor) / Math.max(0.2, Math.cos((centerDec * Math.PI) / 180))) %
        360) +
        360) %
      360;
    centerDec = clamp(down.dec + dy * factor, -78, 78);
    render();
  });
  // 結束這次操作；拖曳與單純點擊會使用不同的處理方式。
  canvas.addEventListener("pointerup", (e) => {
    if (!down) return;
    down = null;
    if (drag) return;

    const rect = canvas.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    // C. 點選星星：只找允許查看介紹的亮星，避免背景星點也被選中。
    const match = projected
      .filter((p) => p.star.featured === true)
      // 勾股定理計算每顆亮星到點擊位置的直線距離，再由近到遠排列。
      .map((p) => ({ ...p, dist: Math.hypot(p.x - x, p.y - y) }))
      .sort((a, b) => a.dist - b.dist)[0];
    // 最近的亮星落在容許範圍內才顯示介紹；距離太遠就不選取。
    if (match && match.dist < Math.max(19, 27 - fov / 20)) info(match.star);
  });
  // 系統中斷觸控時清除操作紀錄，避免視野繼續跟著移動。
  canvas.addEventListener("pointercancel", () => (down = null));
  // 依滾輪方向調整縮放；取消預設捲動，讓滾輪用來操作星空。
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      zoom(e.deltaY > 0 ? 1.12 : 0.89);
    },
    { passive: false },
  );
  // 讀取鍵盤按鍵，處理縮放、方向移動或元件的鍵盤選取操作。
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "+" || e.key === "=") zoom(0.86);
    if (e.key === "-") zoom(1.16);
    const step = fov * 0.07;
    if (e.key === "ArrowLeft") centerRA = (centerRA - step + 360) % 360;
    if (e.key === "ArrowRight") centerRA = (centerRA + step) % 360;
    if (e.key === "ArrowUp") centerDec = clamp(centerDec + step, -78, 78);
    if (e.key === "ArrowDown") centerDec = clamp(centerDec - step, -78, 78);
    render();
  });
  // Two-finger touch pinch (pointer events; pointerdown single-finger drag remains supported).
  // 使用 Map 以 pointerId 記錄每個觸控點，可同時追蹤兩根手指。
  const touches = new Map();
  // 保存上次雙指距離，供本次距離比值計算縮放倍率。
  let pinchDist = null;
  // 記錄按下時的滑鼠或觸控座標，作為之後計算位移的起點。
  canvas.addEventListener("pointerdown", (e) => {
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      down = null;
      pinchDist = null;
    }
  });
  // 持續讀取游標或觸控位置，換算拖曳位移或雙指距離並更新視野。
  canvas.addEventListener("pointermove", (e) => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const [a, b] = [...touches.values()],
        dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist) zoom(pinchDist / dist);
      pinchDist = dist;
      down = null;
    }
  });
  // 移除已結束的觸控點，並清空上一次雙指距離，避免下一次縮放跳動。
  const clearTouch = (e) => {
    touches.delete(e.pointerId);
    pinchDist = null;
  };
  // 結束這次操作；拖曳與單純點擊會使用不同的處理方式。
  canvas.addEventListener("pointerup", clearTouch);
  // 系統中斷觸控時清除操作紀錄，避免視野繼續跟著移動。
  canvas.addEventListener("pointercancel", clearTouch);

  // 切換星座連線顯示，同步按鈕文字與 aria-pressed，再重畫星空。
  document.getElementById("lines").onclick = (e) => {
    showLines = !showLines;
    e.currentTarget.setAttribute("aria-pressed", String(showLines));
    e.currentTarget.textContent = "✧ 星座連線：" + (showLines ? "開" : "關");
    render();
  };

  // 切換亮星名稱顯示，同步按鈕狀態並重畫星空。
  document.getElementById("labels").onclick = (e) => {
    showLabels = !showLabels;
    e.currentTarget.setAttribute("aria-pressed", String(showLabels));
    e.currentTarget.textContent = "✦ 亮星名稱：" + (showLabels ? "開" : "關");
    render();
  };

  // 綁定控制項操作
  // 放大鈕乘上小於 1 的倍數，讓視野變窄、星星看起來變大。
  document.getElementById("zoomIn").onclick = () => zoom(0.78);

  // 綁定控制項操作
  // 縮小鈕乘上大於 1 的倍數，讓視野變寬、看到更多天空。
  document.getElementById("zoomOut").onclick = () => zoom(1.28);

  // 恢復預設視野與選取狀態，再重新繪製星空。
  document.getElementById("reset").onclick = () => {
    centerRA = 90;
    centerDec = 15;
    fov = 100;
    selected = null;
    activeAsterism = null;
    render();
  };

  const quick = document.getElementById("quickStars");
  [
    "Betelgeuse",
    "Sirius",
    "Vega",
    "Arcturus",
    "Antares",
    "Deneb",
    "Alpheratz",
    "Polaris",
  ].forEach((name) => {
    const s = byName[name];
    if (!s) return;
    const b = document.createElement("button");
    b.textContent = s.cn;
    // 綁定控制項操作
    b.onclick = () => focus(s);
    quick.append(b);
  });
  const asterisms = [
    {
      label: "春季大三角",
      names: ["Arcturus", "Spica", "Regulus"],
      note: "本網站採用大角星、角宿一、軒轅十四的春季大三角版本；部分星圖以五帝座一代替軒轅十四。",
    },
    {
      label: "夏季大三角",
      names: ["Vega", "Deneb", "Altair"],
      note: "織女星、天津四、牛郎星。",
    },
    {
      label: "秋季四邊形",
      names: ["Alpheratz", "Scheat", "Markab", "Algenib"],
      note: "飛馬座大四邊形，其中壁宿二屬於仙女座。",
    },
    {
      label: "冬季大三角",
      names: ["Betelgeuse", "Sirius", "Procyon"],
      note: "參宿四、天狼星、南河三。",
    },
  ];
  const astTitle = document.createElement("div");
  astTitle.className = "obs-asterism-heading";
  astTitle.textContent = "✧ 四季代表星群";
  quick.append(astTitle);
  asterisms.forEach((group) => {
    const missing = group.names.filter((n) => !byName[n]);
    if (missing.length) return;
    const b = document.createElement("button");
    b.textContent = group.label;
    b.className = "obs-asterism-button";
    // 綁定控制項操作
    b.onclick = () => {
      const ss = group.names.map((n) => byName[n]);
      const a = ss.map((x) => (x.ra * Math.PI) / 180),
        dec = ss.map((x) => x.dec);
      const meanRA =
        ((Math.atan2(
          a.reduce((v, x) => v + Math.sin(x), 0),
          a.reduce((v, x) => v + Math.cos(x), 0),
        ) *
          180) /
          Math.PI +
          360) %
        360;
      centerRA = meanRA;
      centerDec = dec.reduce((x, y) => x + y, 0) / dec.length;
      const raSpan = Math.max(
        ...ss.map(
          (x) =>
            Math.abs(wrap(x.ra - centerRA)) *
            Math.cos((centerDec * Math.PI) / 180),
        ),
      );
      const decSpan = Math.max(...ss.map((x) => Math.abs(x.dec - centerDec)));
      fov = clamp(Math.max(raSpan * 2.9, decSpan * 3.7, 35), 35, 160);
      selected = null;
      activeAsterism = group;

      const infoEl = document.getElementById("starInfo");
      // 先清空舊內容，再加入這次產生的元素，避免每次更新都重複堆疊。
      infoEl.replaceChildren();
      const h = document.createElement("h2");
      h.textContent = group.label;
      infoEl.append(h);
      const d = document.createElement("p");
      d.textContent = group.note;
      infoEl.append(d);
      const detail = document.createElement("p");
      detail.textContent = ss.map((x) => x.cn + "（" + x.en + "）").join("、");
      infoEl.append(detail);
      render();
    };
    quick.append(b);
  });
  // 視窗尺寸改變時重新計算畫布大小並重畫。
  window.addEventListener("resize", resize);
  resize();
})();
