// 頁面內容以樣板字串組合；${...} 會插入運算結果，map 將資料轉成標籤，join 將標籤串起來。
// 依頁面類型組合本季內容與互動功能
// 讀取本季星座資料
const D = window.STARS;
// 本季星座清單
const ids = ["orion", "taurus", "gemini", "canis_major"];
// 解析網址參數；讀取 id 後決定目前要顯示的星座。
const q = new URLSearchParams(location.search),
  id = D[q.get("id")] ? q.get("id") : "orion";
// 將 &、<、> 等字元轉成 HTML 實體，避免一般文字被當成網頁標籤解析。
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
// 依星座代號產生連結；story 為 true 時改連到完整故事頁。
const url = (k, story = false) =>
  `${story ? "story" : "constellation"}.html?id=${k}`;
// 依星座資料產生連結卡片；compact 決定顯示短標語或較完整的介紹。
const card = (k, compact = false) =>
  `<a class="card link" href="${url(k)}"><h3>${D[k].cn} · ${D[k].en}</h3><p>${compact ? D[k].tag : D[k].lead}</p><p style="color:var(--gold);margin-top:12px">探索星座 ↗</p></a>`;
// 依星座代號組合 SVG 示意圖；回傳 HTML 字串，供介紹頁與卡片使用。
function art(k) {
  const d = D[k];
  const shapes = {
    // 獵戶座資料
    orion: {
      path: "M185 105 L300 145 L425 98 M185 105 L145 280 L300 145 L440 300 L425 98 M245 203 L300 195 L355 187 M300 195 L308 255",
      pts: [
        [185, 105],
        [425, 98],
        [145, 280],
        [440, 300],
        [245, 203],
        [300, 195],
        [355, 187],
        [308, 255],
      ],
      symbol: "✧",
    },
    // 金牛座資料
    taurus: {
      path: "M125 105 L205 175 L270 250 L340 175 L415 105 M205 175 L100 60 M340 175 L500 50",
      pts: [
        [125, 105],
        [205, 175],
        [270, 250],
        [340, 175],
        [415, 105],
        [100, 60],
        [500, 50],
      ],
      symbol: "♉",
    },
    // 雙子座資料
    gemini: {
      path: "M200 80 L205 160 L170 265 M205 160 L275 255 M355 85 L345 165 L300 270 M345 165 L410 260 M200 80 L355 85 M205 160 L345 165",
      pts: [
        [200, 80],
        [355, 85],
        [205, 160],
        [345, 165],
        [170, 265],
        [275, 255],
        [300, 270],
        [410, 260],
      ],
      symbol: "♊",
    },
    // 大犬座資料
    canis_major: {
      path: "M185 100 L300 155 L385 110 M300 155 L265 280 L410 300 M265 280 L145 330 M385 110 L475 175",
      pts: [
        [185, 100],
        [300, 155],
        [385, 110],
        [265, 280],
        [410, 300],
        [145, 330],
        [475, 175],
      ],
      symbol: "✦",
    },
  };
  const s = shapes[k];
  return `<div class="sky"><svg viewBox="0 0 600 420" role="img" aria-label="${esc(d.cn)}藝術星點示意，非精確星圖"><defs><radialGradient id="halo-${k}"><stop stop-color="${d.color}" stop-opacity=".27"/><stop offset="1" stop-color="${d.color}" stop-opacity="0"/></radialGradient></defs><circle cx="310" cy="205" r="190" fill="url(#halo-${k})"/><text x="300" y="260" font-size="170" text-anchor="middle" fill="${d.color}" opacity=".1" font-family="Georgia">${s.symbol}</text><path d="${s.path}" fill="none" stroke="${d.color}" stroke-width="2.3" opacity=".9"/>${s.pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 0 ? 7 : 5}" fill="#ffe9b8" stroke="${d.color}" stroke-width="2"/>`).join("")}<text x="300" y="397" font-size="17" letter-spacing="5" text-anchor="middle" fill="#e8d7b7">${d.en.toUpperCase()}</text></svg><span class="tag">✧ 星座概念示意 · 非精確星圖</span></div>`;
}
// 產生導覽列 HTML；active 用來標示目前所在的頁面。
function header(active) {
  return `
  <header>
    <div class="nav">
      <a class="logo" href="index.html">
        <b>✦</b> 星序<small>Seasons of the Sky</small></a>
      <button
        class="menu"
        aria-label="展開導覽"
        onclick="document.querySelector('.navlinks').classList.toggle('open')">
        ☰
      </button>
      <nav class="navlinks">
        <a href="../index.html" class="${active === "home" ? "active" : ""}">首頁</a>
        <a href="../index.html#seasons">四季星空</a>
        <a href="index.html#atlas" class="${active === "atlas" ? "active" : ""}">星座圖鑑</a>
        <a href="stories.html" class="${active === "stories" ? "active" : ""}">星座故事</a>
        <a href="guide.html" class="${active === "guide" ? "active" : ""}">觀星指南</a>
        <a href="about.html">關於星序</a>
      </nav>
    </div>
  </header>`;
}
// 將編號、標題與內容包成相同的區塊結構，避免各頁重複撰寫版型。
function section(n, title, body) {
  return `<section class="section" id="s${n}"><div class="section-head"><h2>${n} · ${title}</h2></div>${body}</section>`;
}
// 將資料中的參考來源轉成連結清單，放在內容下方。
function source(d) {
  return `<section class="section" id="sources"><div class="section-head"><h2>參考資料與製作說明</h2></div><div class="panel sources"><p>本文依參考資料整理並重新撰寫。神話為文化傳說，不是科學史實。插圖與星點連線是原創概念示意。</p><ul>${d.sources.map(([name, link]) => `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a></li>`).join("")}</ul></div></section>`;
}
// 頁尾
function footer() {
  return `<footer>✦ 星序 Seasons of the Sky · 冬季星空 · 2026</footer>`;
}
// 將頁首、主要內容與頁尾組合後寫入 body，產生目前頁面的完整內容。
function layout(active, body) {
  // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
  document.body.innerHTML = header(active) + `<main>${body}</main>` + footer();
}
// 讀取網址指定的星座，組合亮星、辨識方法、神話與相關星座等介紹。
function detail() {
  const d = D[id],
    others = ids.filter((k) => k !== id);
  document.title = `${d.cn} ${d.en}｜星序`;
  layout(
    "atlas",
    `<div class="crumb"><a href="../index.html#catalog">星座圖鑑</a> <span>›</span> <a href="index.html">冬季星空</a> <span>›</span> ${d.cn}</div><section class="hero">${art(id)}<div><div class="eyebrow">WINTER CONSTELLATION</div><h1>${d.cn}</h1><div class="latin">${d.en.toUpperCase()} · ${d.sub}</div><p class="lead">${d.lead}</p><div class="stats"><div class="stat"><label>適合觀測月份（臺灣晚間）</label><strong>${d.season}</strong></div><div class="stat"><label>代表亮星</label><strong>${d.star}</strong></div><div class="stat"><label>星座面積</label><strong>${d.area}</strong></div><div class="stat"><label>星座補充資訊</label><strong>${d.sign}</strong></div></div><a class="btn" href="#s01">認識${d.cn} ↓</a><a class="btn secondary" href="${url(id, true)}">閱讀完整神話 ↗</a></div></section>` +
      section(
        "02",
        "在星空中認出" + d.cn,
        `<div class="feature"><div><p>${d.recognize}</p><div class="note">🔭 星座連線圖是辨識輔助，實際尋星時請搭配可信星圖或觀星 App。</div></div><div class="diagram">${art(id)}<div class="tiny">藝術星點連線概念，非實際星圖。</div></div></div>`,
      ) +
      interactive(id) +
      section(
        "01",
        "值得認識的亮星",
        `<div class="cards">${d.stars.map(([name, desc]) => `<div class="card"><h3>✦ ${name}</h3><p>${desc}</p></div>`).join("")}</div>`,
      ) +
      section(
        "03",
        "遙遠的宇宙寶藏",
        `<div class="guide">${d.deep.map(([name, desc]) => `<div class="panel"><div class="eyebrow">DEEP SKY DISCOVERY</div><h3 style="color:var(--gold)">${name}</h3><p>${desc}</p></div>`).join("")}</div>`,
      ) +
      section(
        "04",
        "星座背後的神話",
        `<div class="story-banner"><div class="artline">${{ orion: "🏹", taurus: "♉", gemini: "♊", canis_major: "🐕" }[id]}<span>${d.en.toUpperCase()} · MYTHOLOGY</span></div><div><div class="eyebrow">GREEK MYTHOLOGY</div><h3>${d.mythtitle}</h3><p>${d.mythlead}</p><a class="btn" href="${url(id, true)}">閱讀完整故事 →</a></div></div>`,
      ) +
      section(
        "05",
        "簡易觀星指南",
        `<div class="guide"><div class="panel"><div class="eyebrow">OBSERVATION GUIDE</div><h3>如何尋找${d.cn}？</h3><p>${d.recognize}</p><a class="btn secondary" href="guide.html">前往完整觀星指南 ↗</a></div><div class="panel"><div class="eyebrow">CULTURAL NOTE</div><h3>歷史與文化小知識</h3><p>${d.history}</p><p class="tiny">※ 觀測月份是一般性建議，不代表特定今晚的可見性或天氣。</p></div></div>`,
      ) +
      section(
        "06",
        "繼續探索冬季星空",
        `<div class="related">${others.map((k) => card(k, true)).join("")}</div>`,
      ) +
      source(d),
  );
}
// 依目前星座資料產生神話故事頁，並加入章節與返回連結。
function story() {
  const d = D[id];
  document.title = `${d.cn}神話｜星序`;
  layout(
    "stories",
    `<div class="crumb"><a href="stories.html">星座故事</a> <span>›</span> ${d.cn} <span>›</span> ${d.mythtitle}</div><section class="story-banner"><div class="artline">${{ orion: "🏹", taurus: "♉", gemini: "♊", canis_major: "🐕" }[id]}<span>${d.en.toUpperCase()} · MYTHOLOGY</span></div><div><div class="eyebrow">GREEK MYTHOLOGY · ${d.en.toUpperCase()}</div><h1 style="font-family:'Noto Serif TC',serif;font-size:clamp(29px,4vw,46px);line-height:1.45">${d.cn}神話<br>${d.mythtitle}</h1><p>${d.mythlead}</p><a class="btn secondary" href="${url(id)}">← 返回${d.cn}介紹</a></div></section><section class="section"><div class="panel"><div class="note">這是神話傳說的重新敘述，並非經科學證實的歷史事件。不同文獻對人物與細節可能有不同版本。</div>${d.chapters.map(([name, txt], i) => `<div class="chapter"><div class="eyebrow">CHAPTER ${String(i + 1).padStart(2, "0")}</div><h3>第${["一", "二", "三", "四", "五"][i]}章｜${name}</h3><p>${txt}</p></div>`).join("")}<details style="margin:24px auto;max-width:840px" open><summary style="color:var(--gold);cursor:pointer;font-size:19px">✦ 不同版本與神話小知識</summary><p>${d.extra}</p></details><div style="text-align:center"><a class="btn" href="${url(id)}">← 回到${d.cn}天文介紹</a><a class="btn secondary" href="stories.html">更多星座故事 →</a></div></div></section>` +
      source(d),
  );
}
// 建立本季首頁與圖鑑卡片，提供後續搜尋功能使用的容器。
function home() {
  document.title = "星序｜冬季星空";
  layout(
    "home",
    `<section class="hero"><div><div class="eyebrow">SEASONS OF THE SKY · WINTER</div><h1>星序<br>冬季星空</h1><div class="latin">FOUR STORIES AMONG THE STARS</div><p class="lead">從獵戶腰帶三星出發，認識金牛座的七姊妹、雙子座的兄弟與大犬座的天狼星，探索冬季星空的科學與神話。</p><a class="btn" href="#explore">開始探索 ↓</a><a class="btn secondary" href="stories.html">閱讀神話故事 ↗</a></div>${art("orion")}</section><section class="section" id="explore"><div class="section-head"><h2>探索星序</h2></div><div class="collection">${[
      ["四季星空", "index.html#seasons", "依季節認識夜空"],
      ["星座圖鑑", "index.html#atlas", "探索四個冬季星座"],
      ["星座故事", "stories.html", "閱讀完整希臘神話"],
      ["觀星指南", "guide.html", "初學者的尋星方法"],
    ]
      .map(
        ([t, l, s]) =>
          `<a class="card link" href="${l}"><div class="inside"><h3>${t} ↗</h3><p>${s}</p></div></a>`,
      )
      .join(
        "",
      )}</div></section><section class="section" id="seasons"><div class="section-head"><h2>四季星空</h2></div><div class="panel"><div class="eyebrow">WINTER · 冬季</div><h2>冬季星空已開放探索</h2><p>本次預覽完成冬季四個星座；春、夏、秋季內容已分別完成，將在後續整合版本呈現。</p><a class="btn secondary" href="#atlas">查看冬季星座 ↓</a></div></section><section class="section" id="atlas"><div class="section-head"><h2>冬季星座圖鑑</h2></div><p class="muted">搜尋中文名稱、拉丁名稱或代表亮星，點選卡片進入完整介紹。</p><input class="search" id="search" aria-label="搜尋冬季星座" placeholder="例如：獵戶座、Taurus、天狼星、M42……"><div class="collection" id="results">${ids.map((k) => `<a class="card link" href="${url(k)}">${art(k)}<div class="inside"><h3>${D[k].cn} · ${D[k].en}</h3><p>${D[k].tag}</p><p style="color:var(--gold)">查看完整介紹 →</p></div></a>`).join("")}</div><p class="tiny" id="count"></p></section>`,
  );
}
// 將本季星座的神話標題與摘要轉成故事卡片列表。
function stories() {
  document.title = "星座故事｜星序";
  layout(
    "stories",
    `<div class="eyebrow">MYTHOLOGY · WINTER</div><h1 style="font-family:'Noto Serif TC',serif;font-size:44px">冬季星座故事</h1><p class="muted">四則古老傳說，各自擁有完整閱讀頁面。神話版本可能不同，故事與天文知識分開呈現。</p>${network()}<div class="collection">${ids.map((k) => `<a class="card link" href="${url(k, true)}">${art(k)}<div class="inside"><h3>${D[k].cn}｜${D[k].mythtitle}</h3><p>${D[k].mythlead}</p><p style="color:var(--gold)">閱讀完整故事 →</p></div></a>`).join("")}</div>`,
  );
}
// 產生觀星準備、尋星方法與星座查詢介面。
function guide() {
  document.title = "觀星指南｜星序";
  layout(
    "guide",
    `<div class="eyebrow">OBSERVATION GUIDE</div><h1 style="font-family:'Noto Serif TC',serif;font-size:44px">新手觀星指南</h1><p class="muted">不需要即時天氣 API，也能學會尋星的第一步。</p>` +
      section(
        "01",
        "觀星前準備",
        `<div class="cards"><div class="card"><h3>選擇時間</h3><p>挑選晴朗、雲量少的夜晚；月光較弱時，更容易看到暗星。</p></div><div class="card"><h3>遠離光害</h3><p>選擇安全、視野開闊且路燈較少的地方，避免私闖或前往危險地形。</p></div><div class="card"><h3>帶上工具</h3><p>可使用星圖 App、紅光手電筒與雙筒望遠鏡；肉眼也能先辨認亮星。</p></div></div>`,
      ) +
      section(
        "02",
        "尋找冬季星座",
        `<div class="panel"><p>冬季夜晚先找到獵戶座中央的腰帶三星；沿著三星往東南方延伸，能找到大犬座的天狼星。獵戶座的東北方有雙子座的北河二、北河三；獵戶座西北方則有金牛座的橙色畢宿五、V 形畢星團與昴宿星團。參宿四、天狼星和小犬座的南河三還能構成「冬季大三角」。</p><div class="note">實際方位與高度會隨日期、時間及觀測地點改變；這是季節性尋星指南，非即時星位。</div></div>`,
      ) +
      section(
        "03",
        "查詢星座觀測資訊",
        `<div class="panel"><label for="pick">選擇想看的星座：</label><select id="pick" class="search">${ids.map((k) => `<option value="${k}">${D[k].cn} · ${D[k].en}</option>`).join("")}</select><div id="guideResult"></div></div>`,
      ) +
      section(
        "04",
        "觀星注意事項",
        `<div class="guide"><div class="panel"><h3>保護夜間視力</h3><p>避免反覆使用強白光照射眼睛，讓眼睛有時間適應黑暗；不要用望遠鏡直視太陽。</p></div><div class="panel"><h3>安全比觀測更重要</h3><p>注意交通、地形、天氣與保暖；夜間到戶外觀測最好結伴同行。</p></div></div>`,
      ) +
      section(
        "05",
        "常見問題",
        `<div class="panel"><details open><summary>城市裡也能觀星嗎？</summary><p>可以先觀察月亮與亮星，但光害會讓較暗的星座和星團難以辨認。</p></details><details><summary>需要天文望遠鏡嗎？</summary><p>不一定。認識星座先從肉眼和星圖開始；觀察 M31 與大犬座雙星團時，雙筒望遠鏡很實用。</p></details><details><summary>為什麼今天看不到推薦的星座？</summary><p>可能是觀測季節、時間、雲量、光害或地平線遮擋不同。本版沒有即時星位與天氣運算。</p></details></div>`,
      ),
  );
}
// 產生網站介紹與製作說明頁面。
function about() {
  layout(
    "home",
    `<div class="eyebrow">ABOUT THE PROJECT</div><h1 style="font-family:'Noto Serif TC',serif">關於星序</h1><div class="panel"><p>《星序｜Seasons of the Sky》是一個以四季星空為主題的天文科普與故事探索網站。透過星座介紹、神話故事與初學者觀星指南，讓讀者從夜空中的亮星出發，認識星空與文化。</p><p>《星序》目前收錄春、夏、秋、冬四季共 16 個代表星座；本頁聚焦冬季的四個星座：獵戶座、金牛座、雙子座、大犬座。</p><a class="btn" href="index.html#atlas">開始探索冬季星空 →</a></div>`,
  );
}
// 讀取頁面類型
const page = document.body.dataset.page;
if (page === "detail") detail();
else if (page === "story") story();
else if (page === "stories") stories();
else if (page === "guide") guide();
else if (page === "about") about();
else home();
if (page === "home") {
  // 輸入內容改變時立即更新結果，不必額外按下搜尋按鈕。
  document.querySelector("#search").addEventListener("input", (e) => {
    // 先去掉搜尋文字前後空白並轉成小寫，降低大小寫與多餘空白的影響。
    const term = e.target.value.trim().toLowerCase(),
      matches = ids.filter((k) =>
        [D[k].cn, D[k].en, D[k].star, D[k].lead, ...D[k].deep.map((a) => a[0])]
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
    document.querySelector("#results").innerHTML = matches.length
      ? matches
          .map(
            (k) =>
              `<a class="card link" href="${url(k)}">${art(k)}<div class="inside"><h3>${D[k].cn} · ${D[k].en}</h3><p>${D[k].tag}</p><p style="color:var(--gold)">查看完整介紹 →</p></div></a>`,
          )
          .join("")
      : "<p>找不到符合的冬季星座，試試其他關鍵字。</p>";
    document.querySelector("#count").textContent =
      `顯示 ${matches.length} 個星座`;
  });
}
if (page === "guide") {
  const select = document.querySelector("#pick"),
    update = () => {
      const d = D[select.value];
      // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
      document.querySelector("#guideResult").innerHTML =
        `<h3 style="color:var(--gold)">${d.cn} · ${d.en}</h3><p>適合觀測月份（臺灣晚間）：<strong>${d.season}</strong></p><p>代表亮星：${d.star}</p><p>${d.recognize}</p><a class="btn" href="${url(select.value)}">查看完整星座介紹 →</a><p class="tiny">這是固定的季節性資訊，不是今晚的即時觀測預報。</p>`;
    };
  // 使用者完成選項變更後，重新顯示對應的內容。
  select.addEventListener("change", update);
  update();
}
// 產生互動探索區
function interactive(k) {
  if (k === "orion")
    return section(
      "✦",
      "互動探索｜獵戶腰帶三星",
      `<div class="panel"><p>點選三顆腰帶亮星，了解它們的特色。沿著腰帶向東南方延伸，還能找到天狼星。</p><div class="interactive-visual" id="interactive-visual" aria-live="polite">${visualMarkup(k, 0)}</div><div class="star-actions">${[
        ["參宿一 Alnitak", "位於腰帶一端，附近有馬頭星雲與火焰星雲。"],
        ["參宿二 Alnilam", "位於腰帶中央，是一顆藍超巨星。"],
        ["參宿三 Mintaka", "位於腰帶另一端，是多星系統。"],
      ]
        .map(
          ([a, b], i) =>
            `<button class="star-choice" data-fact="${esc(b)}" aria-pressed="${i === 0}">${a}</button>`,
        )
        .join(
          "",
        )}</div><div class="note" id="star-fact">位於腰帶一端，附近有馬頭星雲與火焰星雲。</div><a class="btn secondary" href="constellation.html?id=canis_major">沿腰帶找到大犬座 →</a></div>`,
    );
  if (k === "taurus")
    return section(
      "✦",
      "互動探索｜畢宿五與畢星團",
      `<div class="panel"><p>它們看起來在同一片 V 形星群中，實際距離卻不同。點選比較。</p><div class="interactive-visual" id="interactive-visual" aria-live="polite">${visualMarkup(k, 0)}</div><div class="star-actions"><button class="star-choice" data-fact="畢宿五約距離地球 65 光年，是較近的前景橙色巨星，不屬於畢星團。" aria-pressed="true">畢宿五 · 約 65 光年</button><button class="star-choice" data-fact="畢星團約距離地球 150 光年，是形成牛頭 V 形輪廓的疏散星團。">畢星團 · 約 150 光年</button></div><div class="note" id="star-fact">畢宿五約距離地球 65 光年，是較近的前景橙色巨星，不屬於畢星團。</div><a class="btn secondary" href="story.html?id=orion">閱讀獵戶座追逐七姊妹的神話 →</a></div>`,
    );
  if (k === "gemini")
    return section(
      "✦",
      "互動探索｜雙生星辰",
      `<div class="panel"><p>比較北河二與北河三：名字相近，恆星結構卻非常不同。</p><div class="interactive-visual" id="interactive-visual" aria-live="polite">${visualMarkup(k, 0)}</div><div class="star-actions"><button class="star-choice" data-fact="北河二 Castor：距離約 52 光年，肉眼看似一顆星，實際是六顆恆星組成的多星系統。" aria-pressed="true">北河二 Castor</button><button class="star-choice" data-fact="北河三 Pollux：距離約 34 光年，是雙子座最亮的橙色巨星。">北河三 Pollux</button></div><div class="note" id="star-fact">北河二 Castor：距離約 52 光年，肉眼看似一顆星，實際是六顆恆星組成的多星系統。</div><div class="note">☄ 雙子座流星雨通常在 12 月中旬達極大期，母體與 (3200) Phaethon 有關；ZHR 並非實際可見流星數。</div></div>`,
    );
  return section(
    "✦",
    "互動探索｜天狼星的雙星祕密",
    `<div class="panel"><p>切換「肉眼」與「雙星」模式，看看天狼星 A 與白矮星 B。</p><div class="interactive-visual" id="interactive-visual" aria-live="polite">${visualMarkup(k, 0)}</div><div class="star-actions"><button class="star-choice" data-fact="肉眼所見幾乎都是天狼星 A 的明亮星光；天狼星 B 太暗且太接近主星，肉眼無法分辨。" aria-pressed="true">肉眼觀察</button><button class="star-choice" data-fact="天狼星是一個雙星系統：天狼星 A 是 A 型主序星，天狼星 B 是白矮星，兩者相互繞行週期約 50 年。">雙星系統</button></div><div class="note" id="star-fact">肉眼所見幾乎都是天狼星 A 的明亮星光；天狼星 B 太暗且太接近主星，肉眼無法分辨。</div><a class="btn secondary" href="constellation.html?id=orion">回到獵戶座 →</a></div>`,
  );
}
// 產生星座連線示意
function network() {
  return `<div class="panel" style="margin:22px 0"><div class="eyebrow">CONNECTED MYTHS</div><h2>冬季神話的星空連結</h2><p>獵戶座追逐金牛座的七姊妹，大犬座則被描繪成獵人的忠實夥伴；雙子座的兄弟故事訴說共享命運。</p><div class="myth-network">${[
    ["orion", "🏹 獵戶座", "巨人獵手"],
    ["taurus", "♉ 金牛座", "七姊妹與白牛"],
    ["gemini", "♊ 雙子座", "永恆兄弟"],
    ["canis_major", "🐕 大犬座", "獵人忠犬"],
  ]
    .map(
      ([k, n, t]) =>
        `<a href="${url(k, true)}"><strong>${n}</strong><small>${t}</small></a>`,
    )
    .join("")}</div></div>`;
}
// 產生冬季星空示意圖
function visualMarkup(k, n) {
  // 將星點資料 map 成 SVG 標籤，再用 join 組成一段完整的繪圖字串。
  const dots = Array.from(
    { length: 48 },
    (_, i) =>
      `<circle cx="${(i * 79 + 23) % 600}" cy="${(i * 47 + 31) % 310}" r="${i % 8 === 0 ? 1.6 : 0.85}" fill="#dbeaff" opacity="${i % 3 === 0 ? 0.68 : 0.32}"/>`,
  ).join("");
  // 繪製示意圖外框
  const shell = (inside, caption) =>
    `<div class="interactive-sky"><svg viewBox="0 0 600 310" role="img" aria-label="${caption}"><defs><radialGradient id="winterGlow"><stop offset="0" stop-color="#f8d999" stop-opacity=".5"/><stop offset="1" stop-color="#f8d999" stop-opacity="0"/></radialGradient><radialGradient id="blueGlow"><stop offset="0" stop-color="#b8ddff" stop-opacity=".5"/><stop offset="1" stop-color="#b8ddff" stop-opacity="0"/></radialGradient></defs>${dots}${inside}</svg><p class="visual-caption">${caption} · 教學示意，非精確星位或比例</p></div>`;
  // 繪製示意星點
  const star = (x, y, r = 6, c = "#e6f2ff", active = false) =>
    `<circle cx="${x}" cy="${y}" r="${active ? 38 : 17}" fill="${active ? "url(#winterGlow)" : "url(#blueGlow)"}"/><circle cx="${x}" cy="${y}" r="${active ? r + 3 : r}" fill="${c}" stroke="${active ? "#ffe1a1" : "none"}" stroke-width="2"/>`;
  // 加入圖中文字標示
  const label = (x, y, t) =>
    `<text x="${x}" y="${y}" text-anchor="middle" fill="#e9d9b5" font-size="16">${t}</text>`;
  if (k === "orion") {
    const names = ["參宿一 · Alnitak", "參宿二 · Alnilam", "參宿三 · Mintaka"];
    const pos = [
      [165, 160],
      [300, 148],
      [435, 136],
    ];
    return shell(
      `<path d="M110 73 L165 160 L300 148 L435 136 L500 64 M165 160 L130 240 M435 136 L470 232" stroke="#9cb7d9" stroke-width="1.5" fill="none" stroke-dasharray="5 6" opacity=".65"/>${pos.map(([x, y], i) => star(x, y, 7, "#eaf6ff", n === i)).join("")}${star(110, 73, 5, "#f5b18a")}${star(500, 64, 5)}${star(130, 240, 5)}${star(470, 232, 5)}${label(pos[n][0], pos[n][1] - 50, names[n])}`,
      "點亮獵戶座腰帶三星",
    );
  }
  if (k === "taurus") {
    // 把天球座標平移並縮放到示意圖；x 反向換算，y 則讓赤緯較高的星點靠上。
    const pts = [
      [135, 65],
      [205, 125],
      [275, 202],
      [350, 125],
      [430, 65],
    ];
    return shell(
      `<path d="M135 65 L205 125 L275 202 L350 125 L430 65" stroke="#e0c18a" stroke-width="2" stroke-dasharray="5 6" fill="none"/>${pts.map(([x, y], i) => star(x, y, i === 2 ? 9 : 5, i === 2 ? "#f5a16b" : "#dbeaff", n === 0 ? i === 2 : i !== 2)).join("")}${label(300, 270, n === 0 ? "畢宿五 · 約 65 光年" : "畢星團 · 約 150 光年")}`,
      "探索 V 形牛頭與前景恆星",
    );
  }
  if (k === "gemini") {
    if (n === 0)
      return shell(
        `<ellipse cx="300" cy="151" rx="190" ry="94" stroke="#e4c58f" stroke-dasharray="6 7" fill="none" opacity=".6"/>${[
          [155, 135],
          [184, 150],
          [270, 102],
          [292, 124],
          [402, 174],
          [424, 194],
        ]
          .map(([x, y], i) =>
            star(
              x,
              y,
              6,
              i % 2 ? "#dcefff" : "#ffe6b5",
              i === 0 || i === 2 || i === 4,
            ),
          )
          .join("")}${label(300, 282, "北河二 Castor · 六顆恆星（三組雙星）")}`,
        "北河二多星系統結構",
      );
    return shell(
      `${star(300, 145, 26, "#f9b36e", true)}${label(300, 248, "北河三 Pollux · 橙色巨星")}`,
      "北河三橙色巨星",
    );
  }
  if (n === 0)
    return shell(
      `${star(300, 144, 22, "#eaf6ff", true)}${label(300, 248, "肉眼：明亮的天狼星 A")}`,
      "天狼星肉眼觀察",
    );
  return shell(
    `<ellipse cx="300" cy="146" rx="180" ry="86" stroke="#d5b983" stroke-width="2" stroke-dasharray="6 7" fill="none" opacity=".7"/>${star(240, 150, 22, "#eaf6ff", true)}${star(435, 106, 5, "#ffffff", true)}${label(240, 231, "天狼星 A")}${label(435, 64, "天狼星 B · 白矮星")}`,
    "天狼星雙星系統",
  );
}
// 依本季頁面上的元件是否存在，啟動對應的額外互動。
function initExtra() {
  // 季節篩選按鈕
  const buttons = [...document.querySelectorAll(".star-choice[data-fact]")];
  const visual = document.querySelector("#interactive-visual");
  const k = id;
  // 更新互動結果
  const update = (n) => {
    if (visual) visual.innerHTML = visualMarkup(k, n);
  };
  // 為每個季節按鈕綁定點擊事件；切換篩選條件後，同步按鈕樣式並更新卡片。
  buttons.forEach((b, i) =>
    b.addEventListener("click", () => {
      const fact = document.querySelector("#star-fact");
      if (fact) fact.textContent = b.dataset.fact;
      // 只有目前選擇的季節保留 active 類別，讓按鈕樣式與篩選條件一致。
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      update(i);
    }),
  );
  if (buttons.length) update(0);
}
initExtra();
