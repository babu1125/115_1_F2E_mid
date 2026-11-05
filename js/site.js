// 先取得頁面元素與資料，再綁定操作事件；render 統一處理卡片與搜尋結果的更新。
// 首頁搜尋、季節篩選與導覽互動
(() => {
  "use strict";
  function init() {
    // 恆星或星座資料
    const stars = window.XINGXU_CATALOG || [];
    // 星座卡片容器與搜尋控制項
    const grid = document.querySelector("#starGrid"),
      search = document.querySelector("#search"),
      buttons = [...document.querySelectorAll("[data-season]")],
      count = document.querySelector("#resultCount"),
      empty = document.querySelector("#empty");
    // 只有圖鑑元件完整的頁面才啟動搜尋；其他頁面仍可使用導覽列。
    const hasCatalog = Boolean(grid && search && count && empty);
    // 目前選擇的季節
    let season = "all";
    // 各季節或星座的圖示
    const symbols = { spring: "✿", summer: "✧", autumn: "◇", winter: "❄" };
    // 依目前狀態重畫內容；篩選或操作完成後再呼叫，讓畫面保持同步。
    function render() {
      if (!hasCatalog) return;
      // 先去掉搜尋文字前後空白並轉成小寫，降低大小寫與多餘空白的影響。
      const term = search.value.trim().toLocaleLowerCase();
      // 先看季節是否符合，再把名稱和介紹合起來搜尋；兩個條件都通過才留下這筆星座。
      const matched = stars.filter(
        (s) =>
          (season === "all" || s.season === season) &&
          [s.cn, s.en, s.tag, s.lead, s.seasonCN]
            .join(" ")
            .toLocaleLowerCase()
            .includes(term),
      );
      // 先清空舊內容，再加入這次產生的元素，避免每次更新都重複堆疊。
      grid.replaceChildren();
      // 為每筆搜尋結果建立卡片，填入星座名稱、介紹及詳細頁連結後加入圖鑑。
      for (const s of matched) {
        const a = document.createElement("a");
        a.className = "star-card";
        a.href = `${s.season}/constellation.html?id=${encodeURIComponent(s.id)}`;
        const sym = document.createElement("div");
        sym.className = "star-symbol";
        sym.textContent = symbols[s.season];
        const small = document.createElement("small");
        small.textContent = `${s.emoji} ${s.seasonCN} · ${s.en.toUpperCase()}`;
        const h = document.createElement("h3");
        h.textContent = s.cn;
        const p = document.createElement("p");
        p.textContent = s.tag || s.lead;
        const b = document.createElement("b");
        b.textContent = "探索星座 ↗";
        a.append(sym, small, h, p, b);
        grid.append(a);
      }
      count.textContent = `找到 ${matched.length} 個星座`;
      empty.hidden = matched.length !== 0;
    }
    // 為每個季節按鈕綁定點擊事件；切換篩選條件後，同步按鈕樣式並更新卡片。
    if (hasCatalog) buttons.forEach((b) =>
      b.addEventListener("click", () => {
        season = b.dataset.season;
        // 只有目前選擇的季節保留 active 類別，讓按鈕樣式與篩選條件一致。
        buttons.forEach((x) => x.classList.toggle("active", x === b));
        render();
      }),
    );
    // 每次輸入或刪除文字都重新篩選，讓卡片馬上跟著搜尋內容更新。
    if (hasCatalog) search.addEventListener("input", render);
    // 導覽列與選單控制
    const nav = document.querySelector(".top nav"),
      navBtn = document.querySelector("#navBtn");
    // 導覽元件存在時才綁定操作，避免共用腳本在其他頁面取得 null。
    if (nav && navBtn) {
      // 點擊操作
      navBtn.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        navBtn.setAttribute("aria-expanded", String(open));
      });
      // 點選導覽連結後收合選單，並更新 aria-expanded 狀態。
      nav.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("open");
          navBtn.setAttribute("aria-expanded", "false");
        }),
      );
    }
    render();
  }

  // 等 HTML 解析完成再尋找元素；腳本放在 head 或 body 都能使用。
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
