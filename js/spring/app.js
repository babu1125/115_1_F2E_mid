// 頁面內容以樣板字串組合；${...} 會插入運算結果，map 將資料轉成標籤，join 將標籤串起來。
// 依頁面類型組合本季內容與互動功能
// 讀取本季星座資料
const D = window.STARS;
// 本季星座清單
const ids = ["leo", "virgo", "bootes", "cancer"];
// 解析網址參數；讀取 id 後決定目前要顯示的星座。
const q = new URLSearchParams(location.search),
  id = D[q.get("id")] ? q.get("id") : "leo";
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
  const d = D[k],
    p = {
      // 獅子座資料
      leo: "M105 270 L150 158 L214 111 L260 160 L243 244 L105 270 M260 160 L350 211 L485 174 M350 211 L420 265",
      // 室女座資料
      virgo:
        "M140 108 L225 150 L315 103 L400 180 L322 267 L225 150 L175 260 M315 103 L345 57",
      // 牧夫座資料
      bootes:
        "M290 60 L205 136 L253 240 L345 268 L418 166 L290 60 M253 240 L305 343",
      // 巨蟹座資料
      cancer:
        "M140 125 L235 182 L330 105 M235 182 L240 270 L165 320 M240 270 L340 328",
    }[k];
  // 星座示意圖的星點座標
  const points = {
    // 獅子座資料
    leo: [
      [105, 270],
      [150, 158],
      [214, 111],
      [260, 160],
      [243, 244],
      [350, 211],
      [485, 174],
      [420, 265],
    ],
    // 室女座資料
    virgo: [
      [140, 108],
      [225, 150],
      [315, 103],
      [400, 180],
      [322, 267],
      [175, 260],
      [345, 57],
    ],
    // 牧夫座資料
    bootes: [
      [290, 60],
      [205, 136],
      [253, 240],
      [345, 268],
      [418, 166],
      [305, 343],
    ],
    // 巨蟹座資料
    cancer: [
      [140, 125],
      [235, 182],
      [330, 105],
      [240, 270],
      [165, 320],
      [340, 328],
    ],
  }[k];
  // 各季節或星座的圖示
  const symbols = { leo: "♌", virgo: "♍", bootes: "✧", cancer: "♋" };
  return `<div class="sky"><svg viewBox="0 0 600 420" aria-label="${esc(d.cn)}藝術星點連線示意，非精確星圖" role="img"><defs><radialGradient id="halo"><stop stop-color="${d.color}" stop-opacity=".28"/><stop offset="1" stop-color="${d.color}" stop-opacity="0"/></radialGradient></defs><circle cx="310" cy="205" r="180" fill="url(#halo)"/><text x="300" y="245" font-size="185" text-anchor="middle" fill="${d.color}" opacity=".18" font-family="Georgia">${symbols[k]}</text><path d="${p}" fill="none" stroke="${d.color}" stroke-width="2.4" opacity=".9"/>${points.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 0 ? 7 : 5}" fill="#ffe9b8" stroke="${d.color}" stroke-width="2"/>`).join("")}<text x="300" y="397" font-size="17" letter-spacing="6" text-anchor="middle" fill="#e8d7b7">${d.en.toUpperCase()}</text></svg><span class="tag">✧ 藝術星圖示意 · 非精確星點座標</span></div>`;
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
  return `<footer>✦ 星序 Seasons of the Sky · 春季星空 · 2026</footer>`;
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
    `<div class="crumb"><a href="../index.html#catalog">星座圖鑑</a> <span>›</span> <a href="index.html">春季星空</a> <span>›</span> ${d.cn}</div><section class="hero">${art(id)}<div><div class="eyebrow">SPRING CONSTELLATION</div><h1>${d.cn}</h1><div class="latin">${d.en.toUpperCase()} · ${d.sub}</div><p class="lead">${d.lead}</p><div class="stats"><div class="stat"><label>適合觀測月份（臺灣晚間）</label><strong>${d.season}</strong></div><div class="stat"><label>代表亮星</label><strong>${d.star}</strong></div><div class="stat"><label>星座面積</label><strong>${d.area}</strong></div><div class="stat"><label>西洋占星日期／類別</label><strong>${d.sign}</strong></div></div><a class="btn" href="#s01">認識${d.cn} ↓</a><a class="btn secondary" href="${url(id, true)}">閱讀完整神話 ↗</a></div></section>` +
      section(
        "01",
        "值得認識的亮星",
        `<div class="cards">${d.stars.map(([name, desc]) => `<div class="card"><h3>✦ ${name}</h3><p>${desc}</p></div>`).join("")}</div>`,
      ) +
      section(
        "02",
        "在星空中認出" + d.cn,
        `<div class="feature">
            <div>
                <p>${d.recognize}</p>
                <div class="note">🔭 星座連線圖是辨識輔助，實際尋星時請搭配可信星圖或觀星 App。</div>
            </div>
            <div class="diagram">${art(id)}
                <div class="tiny">藝術星點連線概念，非實際星圖。</div>
            </div>
        </div>`,
      ) +
      section(
        "03",
        "遙遠的宇宙寶藏",
        `<div class="guide">${d.deep.map(([name, desc]) => `<div class="panel"><div class="eyebrow">DEEP SKY DISCOVERY</div><h3 style="color:var(--gold)">${name}</h3><p>${desc}</p></div>`).join("")}</div>`,
      ) +
      section(
        "04",
        "星座背後的神話",
        `<div class="story-banner"><div class="artline">${{ leo: "♌", virgo: "♍", bootes: "✧", cancer: "♋" }[id]}<span>${d.en.toUpperCase()} · MYTHOLOGY</span></div><div><div class="eyebrow">GREEK MYTHOLOGY</div><h3>${d.mythtitle}</h3><p>${d.mythlead}</p><a class="btn" href="${url(id, true)}">閱讀完整故事 →</a></div></div>`,
      ) +
      section(
        "05",
        "簡易觀星指南",
        `<div class="guide"><div class="panel"><div class="eyebrow">OBSERVATION GUIDE</div><h3>如何尋找${d.cn}？</h3><p>${d.recognize}</p><a class="btn secondary" href="guide.html">前往完整觀星指南 ↗</a></div><div class="panel"><div class="eyebrow">CULTURAL NOTE</div><h3>歷史與文化小知識</h3><p>${d.history}</p><p class="tiny">※ 觀測月份是一般性建議，不代表特定今晚的可見性或天氣。</p></div></div>`,
      ) +
      section(
        "06",
        "繼續探索春季星空",
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
    `<div class="crumb"><a href="stories.html">星座故事</a> <span>›</span> ${d.cn} <span>›</span> ${d.mythtitle}</div><section class="story-banner"><div class="artline">${{ leo: "♌", virgo: "♍", bootes: "✧", cancer: "♋" }[id]}<span>${d.en.toUpperCase()} · MYTHOLOGY</span></div><div><div class="eyebrow">GREEK MYTHOLOGY · ${d.en.toUpperCase()}</div><h1 style="font-family:'Noto Serif TC',serif;font-size:clamp(29px,4vw,46px);line-height:1.45">${d.cn}神話<br>${d.mythtitle}</h1><p>${d.mythlead}</p><a class="btn secondary" href="${url(id)}">← 返回${d.cn}介紹</a></div></section><section class="section"><div class="panel"><div class="note">這是神話傳說的重新敘述，並非經科學證實的歷史事件。不同文獻對人物與細節可能有不同版本。</div>${d.chapters.map(([name, txt], i) => `<div class="chapter"><div class="eyebrow">CHAPTER ${String(i + 1).padStart(2, "0")}</div><h3>第${["一", "二", "三", "四", "五"][i]}章｜${name}</h3><p>${txt}</p></div>`).join("")}<details style="margin:24px auto;max-width:840px" open><summary style="color:var(--gold);cursor:pointer;font-size:19px">✦ 不同版本與神話小知識</summary><p>${d.extra}</p></details><div style="text-align:center"><a class="btn" href="${url(id)}">← 回到${d.cn}天文介紹</a><a class="btn secondary" href="stories.html">更多星座故事 →</a></div></div></section>` +
      source(d),
  );
}
// 建立本季首頁與圖鑑卡片，提供後續搜尋功能使用的容器。
function home() {
  document.title = "星序｜春季星空";
  layout(
    "home",
    `<section class="hero"><div><div class="eyebrow">SEASONS OF THE SKY · SPRING</div><h1>星序<br>春季星空</h1><div class="latin">FOUR STORIES AMONG THE STARS</div><p class="lead">從獅子的鬃毛、少女的麥穗，到守望北方的牧人與藏在微光中的巨蟹。循著星光，探索四個春季星座的科學與神話。</p><a class="btn" href="#explore">開始探索 ↓</a><a class="btn secondary" href="stories.html">閱讀神話故事 ↗</a></div>${art("leo")}</section><section class="section" id="explore"><div class="section-head"><h2>探索星序</h2></div><div class="collection">${[
      ["四季星空", "index.html#seasons", "依季節認識夜空"],
      ["星座圖鑑", "index.html#atlas", "探索四個春季星座"],
      ["星座故事", "stories.html", "閱讀完整希臘神話"],
      ["觀星指南", "guide.html", "初學者的尋星方法"],
    ]
      .map(
        ([t, l, s]) =>
          `<a class="card link" href="${l}"><div class="inside"><h3>${t} ↗</h3><p>${s}</p></div></a>`,
      )
      .join(
        "",
      )}</div></section><section class="section" id="seasons"><div class="section-head"><h2>四季星空</h2></div><div class="panel"><div class="eyebrow">SPRING · 春季</div><h2>春季星空已開放探索</h2><p>本次預覽先完成春季四個星座；夏、秋、冬季的內容會在後續版本擴充。</p><a class="btn secondary" href="#atlas">查看春季星座 ↓</a></div></section><section class="section" id="atlas"><div class="section-head"><h2>春季星座圖鑑</h2></div><p class="muted">搜尋中文名稱、拉丁名稱或代表亮星，點選卡片進入完整介紹。</p><input class="search" id="search" aria-label="搜尋春季星座" placeholder="例如：獅子座、Virgo、大角星、M44……"><div class="collection" id="results">${ids.map((k) => `<a class="card link" href="${url(k)}">${art(k)}<div class="inside"><h3>${D[k].cn} · ${D[k].en}</h3><p>${D[k].tag}</p><p style="color:var(--gold)">查看完整介紹 →</p></div></a>`).join("")}</div><p class="tiny" id="count"></p></section>`,
  );
}
// 將本季星座的神話標題與摘要轉成故事卡片列表。
function stories() {
  document.title = "星座故事｜星序";
  layout(
    "stories",
    `<div class="eyebrow">MYTHOLOGY · SPRING</div><h1 style="font-family:'Noto Serif TC',serif;font-size:44px">春季星座故事</h1><p class="muted">四則古老傳說，各自擁有完整閱讀頁面。神話版本可能不同，故事與天文知識分開呈現。</p><div class="collection">${ids.map((k) => `<a class="card link" href="${url(k, true)}">${art(k)}<div class="inside"><h3>${D[k].cn}｜${D[k].mythtitle}</h3><p>${D[k].mythlead}</p><p style="color:var(--gold)">閱讀完整故事 →</p></div></a>`).join("")}</div>`,
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
        "尋找春季星座",
        `<div class="panel"><p>從北斗七星斗柄的弧線延伸，可先找到牧夫座的大角星，再延伸至室女座的角宿一。獅子座則可由鐮刀星群與軒轅十四辨認；巨蟹座位於雙子座與獅子座之間，較暗，建議到光害少的地方尋找。</p><div class="note">實際方位與高度會隨日期、時間和觀測地點改變；本指南提供一般尋星方法，不假裝即時預測。</div></div>`,
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
        `<div class="panel"><details open><summary>城市裡也能觀星嗎？</summary><p>可以先觀察月亮與亮星，但光害會讓較暗的星座和星團難以辨認。</p></details><details><summary>需要天文望遠鏡嗎？</summary><p>不一定。認識星座先從肉眼和星圖開始；觀察 M44 等寬廣星團時，雙筒望遠鏡很實用。</p></details><details><summary>為什麼今天看不到推薦的星座？</summary><p>可能是觀測季節、時間、雲量、光害或地平線遮擋不同。本版沒有即時星位與天氣運算。</p></details></div>`,
      ),
  );
}
// 產生網站介紹與製作說明頁面。
function about() {
  layout(
    "home",
    `<div class="eyebrow">ABOUT THE PROJECT</div><h1 style="font-family:'Noto Serif TC',serif">關於星序</h1><div class="panel"><p>《星序｜Seasons of the Sky》是一個以四季星空為主題的天文科普與故事探索網站。透過星座介紹、神話故事與初學者觀星指南，讓讀者從夜空中的亮星出發，認識星空與文化。</p><p>《星序》目前收錄春、夏、秋、冬四季共 16 個代表星座；本頁聚焦春季的四個星座：獅子座、室女座、牧夫座、巨蟹座。</p><a class="btn" href="index.html#atlas">開始探索春季星空 →</a></div>`,
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
      : "<p>找不到符合的春季星座，試試其他關鍵字。</p>";
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
