// 使用立即執行函式包住變數，減少與其他腳本互相影響；依網址與 data-page 決定擴充內容
// 季節頁面擴充與互動星圖
(() => {
  "use strict";
  // 讀取共用互動設定；前面的資料檔必須先載入，這裡才取得得到
  const config = window.XINGXU_V2;
  // 缺少必要設定或不在季節頁時就結束，避免後續使用不存在的資料
  if (!config) return;
  // 目前選擇的季節
  const season = location.pathname.match(
    /\/(spring|summer|autumn|winter)\//,
  )?.[1];
  // 缺少必要設定或不在季節頁時就結束，避免後續使用不存在的資料
  if (!season) return;
  const names = {
    spring: "春季",
    summer: "夏季",
    autumn: "秋季",
    winter: "冬季",
  };
  // 本季星座清單
  const ids = {
    spring: ["leo", "virgo", "bootes", "cancer"],
    summer: ["lyra", "aquila", "cygnus", "scorpius"],
    autumn: ["andromeda", "pegasus", "cassiopeia", "perseus"],
    winter: ["orion", "taurus", "gemini", "canis_major"],
  }[season];
  // 讀取頁面類型
  const page = document.body.dataset.page;
  // 頁面使用的資料
  const data = window.STARS;
  // 解析網址 ? 後面的參數，讓不同連結能開啟指定星座
  const query = new URLSearchParams(location.search);
  // 決定目前顯示的星座
  const id = ids.includes(query.get("id")) ? query.get("id") : ids[0];
  // 將文字中的 HTML 特殊字元轉成實體，再安全地放入產生的 HTML 字串
  const e = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const svgNS = "http://www.w3.org/2000/svg";
  // 使用共用恆星座標組合 SVG 星點與連線；有介紹的亮星另外加上可操作標記
  function draw(k, mode = "both", mini = false) {
    const d = data[k],
      shared = window.XINGXU_CONSTELLATION_CHART?.(k);
    // 建立背景星點，補足畫面的星空氛圍
    const bg = Array.from(
      { length: 35 },
      (_, i) =>
        `<circle cx="${(i * 137 + 47) % 600}" cy="${(i * 97 + 61) % 420}" r="${i % 5 ? 1 : 1.7}" fill="#dbe8fa" opacity=".42"/>`,
    ).join("");
    if (!shared) {
      return `<svg viewBox="0 0 600 420" role="img" aria-label="${e(d.cn)}觀測站尚無足夠星點"><rect width="600" height="420" fill="#0d1b38"/>${bg}<text x="300" y="205" text-anchor="middle" fill="#e5c88f" font-size="18">觀測站目前缺少此星座的完整座標</text></svg>`;
    }
    const { pts, edges } = shared;
    // 將陣列轉成以英文星名為索引的物件，之後可直接用名稱查出座標
    const byName = Object.fromEntries(pts.map((p) => [p.en, p]));
    const lines = edges
      .map(([a, b]) => {
        const x = byName[a],
          y = byName[b];
        return `<line x1="${x.x}" y1="${x.y}" x2="${y.x}" y2="${y.y}" stroke="#a2ccef" stroke-width="1.8" opacity=".85"/>`;
      })
      .join("");
    // 可點選亮星的英文名稱對照；用名稱比對介紹，避免資料順序不同時配錯內容
    const namedKeys = {
      // 獅子座資料
      leo: ["Regulus", "Algieba", "Denebola"],
      // 室女座資料
      virgo: ["Spica", "Porrima", "Vindemiatrix"],
      // 牧夫座資料
      bootes: ["Arcturus", "Izar", "Nekkar"],
      // 巨蟹座資料
      cancer: ["Altarf", "Asellus Borealis", "Asellus Australis"],
      // 天琴座資料
      lyra: ["Vega", "Sheliak", "Epsilon Lyrae"],
      // 天鷹座資料
      aquila: ["Altair", "Alshain", "Tarazed", "Eta Aquilae"],
      // 天鵝座資料
      cygnus: ["Deneb", "Albireo", "61 Cygni"],
      // 天蠍座資料
      scorpius: ["Antares", "Shaula", "Lesath"],
      // 仙女座資料
      andromeda: ["Alpheratz", "Mirach", "Almach"],
      // 飛馬座資料
      pegasus: ["Enif", "Markab", "Scheat", "Algenib"],
      // 仙后座資料
      cassiopeia: ["Schedar", "Caph", "Gamma Cassiopeiae", "Ruchbah", "Segin"],
      // 英仙座資料
      perseus: ["Mirfak", "Algol"],
      // 獵戶座資料
      orion: ["Rigel", "Betelgeuse", "Alnitak", "Alnilam", "Mintaka"],
      // 金牛座資料
      taurus: ["Aldebaran", "Elnath"],
      // 雙子座資料
      gemini: ["Pollux", "Castor", "Alhena"],
      // 大犬座資料
      canis_major: ["Sirius", "Adhara", "Wezen", "Mirzam", "VY Canis Majoris"],
    };
    // 找出每個星點對應的亮星介紹索引；找不到時為 -1，該點只作為背景星點顯示。
    const named = pts.map((p) => (namedKeys[k] || []).indexOf(p.en));
    // 將星點資料 map 成 SVG 標籤，再用 join 組成一段完整的繪圖字串。
    const dots = pts
      .map((p, j) =>
        named[j] >= 0
          ? `<g class="v2-star" data-i="${named[j]}" tabindex="0" role="button" aria-label="查看${e(d.stars[named[j]][0])}"><circle cx="${p.x}" cy="${p.y}" r="18" fill="transparent"/><circle cx="${p.x}" cy="${p.y}" r="${p.mag < 1.5 ? 7 : 5}" fill="#fff1c4" stroke="#9bc8ec" stroke-width="1.6"/></g>`
          : `<circle cx="${p.x}" cy="${p.y}" r="${p.mag < 2 ? 5.3 : 4}" fill="#dce9fb" stroke="#8cb5d6" stroke-width=".7"/>`,
      )
      .join("");
    return `<svg viewBox="0 0 600 420" role="img" aria-label="${e(d.cn)}星空觀測站同源星點與連線"><rect width="600" height="420" fill="#0d1b38"/>${bg}${lines}${dots}<text x="300" y="398" fill="#e5c88f" font-size="16" letter-spacing="5" text-anchor="middle">${e(d.en.toUpperCase())}</text></svg>`;
  }
  // 包裝互動星圖與回饋區；mini 模式會省略部分操作說明。
  function chart(k, mini = false) {

    return `<div class="v2-chart" data-k="${k}"><div class="v2-canvas">${draw(k, "stars", mini)}</div>${mini ? "" : `<div class="v2-feedback" aria-live="polite">點擊發亮且有介紹的星點，或下方亮星卡片，探索亮星 ✦</div><p class="v2-disclaimer">本圖與星空觀測站共用現有星點及連線資料；只開放已有介紹的亮星點選。</p>`}</div>`;
  }
  // 綁定星圖與亮星卡片的操作，讓選取標示及說明文字一起更新。
  function bindChart(root) {
    root.querySelectorAll(".v2-chart").forEach((box) => {
      const k = box.dataset.k;
      // i 是亮星的編號；用它從目前星座的資料中取出名稱與介紹。
      const choose = (i) => {
        const star = data[k].stars[i];
        // 編號沒有對應資料時就停止，避免後面讀取不存在的名稱或介紹。
        if (!star) return;
        box
          .querySelectorAll(".v2-star")
          .forEach((n) => n.classList.toggle("chosen", +n.dataset.i === i));
        const f = box.querySelector(".v2-feedback");
        if (f)
          // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
          f.innerHTML = `<strong>✦ ${e(star[0])}</strong><p>${e(star[1])}</p><small>其他輔助星點只用於構成星座形狀。</small>`;
      };
      // 綁定控制項事件
      const bind = () =>
        box.querySelectorAll(".v2-star").forEach((n) => {
          // data-i 存的是這顆星的編號；前面的 + 把文字轉成數字，再交給 choose 顯示介紹。
          const go = () => choose(+n.dataset.i);
          // 點這顆星時執行 go，依星點編號更新下方介紹。
          n.addEventListener("click", go);
          // 讀取鍵盤按鍵，處理縮放、方向移動或元件的鍵盤選取操作。
          n.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.preventDefault();
              go();
            }
          });
        });
      box.querySelectorAll("[data-mode]").forEach((btn) =>
        btn.addEventListener("click", () => {
          box
            .querySelectorAll("[data-mode]")
            .forEach((b) => b.classList.toggle("active", b === btn));
          // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
          box.querySelector(".v2-canvas").innerHTML = draw(k, btn.dataset.mode);
          bind();
        }),
      );
      bind();
    });
  }
  // 季節星空裝飾圖
  function seasonArt() {
    const p = config.patterns[season],
      pts = p.coords;
    const lines =
      pts.map((a) => a.join(",")).join(" ") + " " + pts[0].join(",");
    return `<div class="v2-season-art"><svg viewBox="0 0 560 400" role="img" aria-label="${p.title}示意圖"><rect width="560" height="400" rx="20" fill="#0c1b37"/>${Array.from({ length: 55 }, (_, i) => `<circle cx="${(i * 139 + 31) % 550}" cy="${(i * 71 + 19) % 390}" r="1" fill="#d7e9fa" opacity=".35"/>`).join("")}<polyline points="${lines}" fill="none" stroke="#e5c488" stroke-width="2.5" stroke-dasharray="4 7"/>${pts.map((a, i) => `<g class="v2-pattern-star" data-i="${i}" tabindex="0" role="button" aria-label="${p.names[i]}"><circle cx="${a[0]}" cy="${a[1]}" r="21" fill="transparent"/><circle cx="${a[0]}" cy="${a[1]}" r="7" fill="#fff0be"/><text x="${a[0]}" y="${a[1] + 29}" text-anchor="middle" fill="#f5e0b2" font-size="15">${p.names[i]}</text></g>`).join("")}<text x="280" y="380" fill="#e7c88e" text-anchor="middle" letter-spacing="3" font-size="19">${p.title}</text></svg><div class="v2-pattern-feedback">${p.sub} · 點選亮星認識位置</div><p class="v2-disclaimer">星群構圖為藝術示意，並非實際天球投影。</p></div>`;
  }
  // 綁定星群辨識區的控制項與結果更新。
  function bindPattern(root) {
    root.querySelectorAll(".v2-pattern-star").forEach((el) => {
      // 控制項對應操作
      const fn = () => {
        const p = config.patterns[season];
        root.querySelector(".v2-pattern-feedback").textContent =
          `✦ ${p.names[+el.dataset.i]}｜${p.title}的代表亮星`;
      };
      // 點擊操作
      el.addEventListener("click", fn);
      // 讀取鍵盤按鍵，處理縮放、方向移動或元件的鍵盤選取操作。
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          fn();
        }
      });
    });
  }
  // 組合星座圖片
  function collage() {
    return `<div class="v2-collage">${ids.map((k) => `<a href="constellation.html?id=${k}" aria-label="前往${data[k].cn}介紹">${atlasPicture(k)}<span>${data[k].cn} · ${data[k].en}</span></a>`).join("")}</div>`;
  }
  // Artwork is independent of the observatory-backed interactive star chart.
  // 星座圖鑑圖片
  function atlasPicture(k) {
    const d = data[k];
    return `<div class="xx-atlas-image"><img src="../images/constellations/${k}.png" alt="${e(d.cn)}星座圖片" loading="lazy" onload="this.parentElement.classList.add('xx-loaded')" onerror="this.style.display='none'"><div class="xx-atlas-fallback">${e(d.cn)}圖片尚未放入</div></div>`;
  }
  // Deep-sky pictures: try common formats and keep the original schematic as fallback.
  // Each image belongs in images/deep-sky/{constellation}-{card number}.{extension}.
  // 選擇深空天體圖片
  function deepAsset(k, i, name) {
    const base = `../images/deep-sky/${k}-${i + 1}`;
    const fallback = deepPicture(k, i, name);
    return `<div class="xx-deep-image"><img src="${base}.png" alt="${e(name)}天體圖片" loading="lazy" data-base="${base}" data-ext="0" onload="this.parentElement.classList.add('xx-loaded')" onerror="window.xingxuTryDeepImage(this)"><div class="xx-deep-placeholder">${fallback}</div></div>`;
  }
  window.xingxuTryDeepImage = function(img) {
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const next = Number(img.dataset.ext || 0) + 1;
    if (next < extensions.length) {
      img.dataset.ext = String(next);
      img.src = img.dataset.base + extensions[next];
    } else {
      img.style.display = 'none';
    }
  };
  // 深空天體圖文區
  function deepPicture(k, i, name) {
    const seed = (k.length * 17 + i * 29) % 100;
    const galaxy = /M\d|NGC|星系|銀河|星雲/.test(name);
    let circles = Array.from({ length: 150 }, (_, n) => {
      let x = (n * 113 + seed * 17) % 560,
        y = (n * 61 + seed * 19) % 180,
        r = n % 7 === 0 ? 2 : 0.8;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${n % 3 ? "#d4e4fa" : "#f3d8a1"}" opacity="${n % 5 === 0 ? ".8" : ".35"}"/>`;
    }).join("");
    return `<svg viewBox="0 0 560 180" role="img" aria-label="${e(name)}原創示意插畫，非天文實拍"><defs><radialGradient id="neb-${k}-${i}"><stop stop-color="${galaxy ? "#c2a4c8" : "#89b9d4"}" stop-opacity=".8"/><stop offset=".45" stop-color="#607ca9" stop-opacity=".38"/><stop offset="1" stop-color="#122442" stop-opacity="0"/></radialGradient></defs><rect width="560" height="180" fill="#0c1a35"/><ellipse cx="280" cy="90" rx="${galaxy ? 150 : 100}" ry="${galaxy ? 42 : 78}" transform="rotate(-19 280 90)" fill="url(#neb-${k}-${i})"/>${circles}<text x="280" y="163" fill="#e9d3a6" font-size="12" text-anchor="middle" letter-spacing="2">ORIGINAL SCHEMATIC ILLUSTRATION</text></svg>`;
  }
  // 深空天體補充說明
  function deepExplanation(name, desc) {
    if (/M\d|NGC/.test(name))
      return `M 是梅西耶天體目錄的編號，NGC 是新總星表的編號。這些代號用來識別星系、星團或星雲等深空天體，不是單顆恆星。${desc}`;
    return `這個深空天體位於${names[season]}星空的相關星座方向。${desc} 觀察深空天體通常需要合適的天空條件與觀測工具。`;
  }
  // 主視覺圖片
  function heroPicture(k) {
    const d = data[k];
    return `<div class="xx-art-slot"><img src="../images/constellations/${k}.png" alt="${e(d.cn)}星座形象插畫" loading="eager" onload="this.parentElement.classList.add('xx-loaded')" onerror="this.style.display='none'"><div class="xx-art-fallback"><span class="xx-art-symbol">✦</span><strong>${e(d.cn)}</strong><span>${e(d.en.toUpperCase())}</span><small>星座圖片製作中 · 請將 ${k}.png 放入 images/constellations/</small></div></div>`;
  }
  // 補上星座介紹頁需要的圖片、星圖與探索內容。
  function updateDetail() {
    const hero = document.querySelector("section.hero");
    if (hero) {
      const art = hero.querySelector(".sky");
      if (art) art.outerHTML = heroPicture(id);
    }
    const feature = document.querySelector(".feature .diagram");
    if (feature) feature.innerHTML = chart(id);
    const sections = [...document.querySelectorAll(".section")];

    const starSection = sections.find((s) =>
      s.querySelector("h2")?.textContent.includes("值得認識的亮星"),
    );
    if (starSection) {
      starSection.querySelectorAll(".card").forEach((card, i) => {
        card.classList.add("v2-star-card");
        card.setAttribute("role", "button");
        card.tabIndex = 0;
        card.insertAdjacentHTML(
          "beforeend",
          '<span class="v2-cta">✦ 點擊在星圖中查看</span>',
        );
        // 控制項對應操作
        const fn = () => {
          const box =
            document.querySelector(".feature .v2-chart") ||
            document.querySelector(".hero .v2-chart");
          if (!box) return;
          const node = box.querySelector(`.v2-star[data-i="${i}"]`);
          if (!node) {
            return;
          }
          node.dispatchEvent(new Event("click"));
          box.scrollIntoView({ behavior: "smooth", block: "center" });
        };
        // 點擊操作
        card.addEventListener("click", fn);
        // 讀取鍵盤按鍵，處理縮放、方向移動或元件的鍵盤選取操作。
        card.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            fn();
          }
        });
      });
    }
    // Place bright-star reference cards directly above the interactive star chart.
    if (starSection) {

      const target = sections.find(
        (s) =>
          s !== starSection &&
          (s.querySelector(".interactive-visual") ||
            s.querySelector(".feature .diagram")),
      );
      if (target && target !== starSection) target.before(starSection);
    }

    const deepSection = sections.find((s) =>
      s.querySelector("h2")?.textContent.includes("遙遠的宇宙寶藏"),
    );
    if (deepSection) {
      const guide = deepSection.querySelector(".guide");
      if (guide) {
        // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
        guide.innerHTML = data[id].deep
          .map(
            ([name, desc], i) =>
              `<details class="panel v2-deep"><summary><span class="eyebrow">DEEP SKY DISCOVERY</span><h3>${e(name)}</h3><p>${e(desc)}</p><span class="v2-cta">＋ 展開簡短圖文介紹</span></summary><div class="v2-deep-body">${deepAsset(id, i, name)}<p>${e(deepExplanation(name, desc))}</p><p class="v2-disclaimer">Image source: Stellarium</p></div></details>`,
          )
          .join("");
      }
    }
    bindChart(document);
  }
  // 補上本季首頁的圖片與探索區內容。
  function updateHome() {
    const hero = document.querySelector("section.hero");
    if (hero) {
      const art = hero.querySelector(".sky");
      if (art) art.outerHTML = seasonArt();
      else {
        const existing = hero.querySelector(".v2-season-art");
        if (!existing) hero.insertAdjacentHTML("beforeend", seasonArt());
      }
      bindPattern(hero);
      const start = hero.querySelector('a[href="#explore"]');
      if (start) start.href = "#atlas";
    }
    const explore = document.querySelector("#explore");
    if (explore) explore.remove();
    const seasonsSection = document.querySelector("#seasons");
    if (seasonsSection) seasonsSection.remove();
    const atlas = document.querySelector("#atlas");
    if (atlas) {
      const head = atlas.querySelector(".section-head");
      if (head)
        head.querySelector("h2").textContent = names[season] + "星座圖鑑";
      atlas.querySelectorAll(".collection > a").forEach((card, i) => {
        const k = ids[i];
        if (!k) return;
        const art = card.querySelector(".sky");
        if (art) art.outerHTML = atlasPicture(k);
      });
      bindChart(atlas);
    }
    // search result cards are rendered dynamically by the original app; replace their art on each input.
    // 搜尋欄位
    const search = document.querySelector("#search");
    if (search)
      // 輸入內容改變時立即更新結果，不必額外按下搜尋按鈕。
      search.addEventListener("input", () => {
        requestAnimationFrame(() => {
          document.querySelectorAll("#results > a").forEach((a) => {
            const k = new URL(a.href).searchParams.get("id");
            if (!ids.includes(k)) return;
            const art = a.querySelector(".sky");
            if (art) art.outerHTML = atlasPicture(k);
          });
        });
      });
  }
  if (page === "detail") updateDetail();
  if (page === "home") updateHome();
  // Consistent return links for every season, and a clearly labelled project status.
  const footer = document.querySelector("footer");
  if (footer) footer.insertAdjacentHTML("beforeend", "");
})();
