// 頁面內容以樣板字串組合；${...} 會插入運算結果，map 將資料轉成標籤，join 將標籤串起來。
// 依頁面類型組合本季內容與互動功能
// 讀取本季星座資料
const D = window.STARS;
// 本季星座清單
const ids = ["andromeda", "pegasus", "cassiopeia", "perseus"];
// 解析網址參數；讀取 id 後決定目前要顯示的星座。
const q = new URLSearchParams(location.search),
  id = D[q.get("id")] ? q.get("id") : "andromeda";
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
    // 仙女座資料
    andromeda: {
      path: "M80 110 L180 160 L295 180 L410 145 L515 195 M295 180 L340 260",
      pts: [
        [80, 110],
        [180, 160],
        [295, 180],
        [410, 145],
        [515, 195],
        [340, 260],
      ],
      symbol: "✧",
    },
    // 飛馬座資料
    pegasus: {
      path: "M145 95 L395 95 L425 300 L155 290 Z M395 95 L490 165 L540 210 M155 290 L100 340",
      pts: [
        [145, 95],
        [395, 95],
        [425, 300],
        [155, 290],
        [490, 165],
        [540, 210],
        [100, 340],
      ],
      symbol: "♞",
    },
    // 仙后座資料
    cassiopeia: {
      path: "M65 260 L175 115 L285 245 L395 110 L530 240",
      pts: [
        [65, 260],
        [175, 115],
        [285, 245],
        [395, 110],
        [530, 240],
      ],
      symbol: "♛",
    },
    // 英仙座資料
    perseus: {
      path: "M255 95 L295 170 L220 240 L145 300 M295 170 L400 245 L490 315 M220 240 L275 330",
      pts: [
        [255, 95],
        [295, 170],
        [220, 240],
        [145, 300],
        [400, 245],
        [490, 315],
        [275, 330],
      ],
      symbol: "⚔",
    },
  };
  const s = shapes[k];
  return `<div class="sky"><svg viewBox="0 0 600 420" aria-label="${esc(d.cn)}藝術星點示意，非精確星圖" role="img"><defs><radialGradient id="halo"><stop stop-color="${d.color}" stop-opacity=".3"/><stop offset="1" stop-color="${d.color}" stop-opacity="0"/></radialGradient></defs><circle cx="310" cy="205" r="190" fill="url(#halo)"/><text x="300" y="260" font-size="175" text-anchor="middle" fill="${d.color}" opacity=".12" font-family="Georgia">${s.symbol}</text><path d="${s.path}" fill="none" stroke="${d.color}" stroke-width="2.4" opacity=".92"/>${s.pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 0 ? 7 : 5}" fill="#ffe9b8" stroke="${d.color}" stroke-width="2"/>`).join("")}<text x="300" y="397" font-size="17" letter-spacing="6" text-anchor="middle" fill="#e8d7b7">${d.en.toUpperCase()}</text></svg><span class="tag">✧ 藝術星圖示意 · 非精確座標</span></div>`;
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
  return `<footer>✦ 星序 Seasons of the Sky · 秋季星空 · 2026</footer>`;
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
    `<div class="crumb"><a href="../index.html#catalog">星座圖鑑</a> <span>›</span> <a href="index.html">秋季星空</a> <span>›</span> ${d.cn}</div><section class="hero">${art(id)}<div><div class="eyebrow">AUTUMN CONSTELLATION</div><h1>${d.cn}</h1><div class="latin">${d.en.toUpperCase()} · ${d.sub}</div><p class="lead">${d.lead}</p><div class="stats"><div class="stat"><label>適合觀測月份（臺灣晚間）</label><strong>${d.season}</strong></div><div class="stat"><label>代表亮星</label><strong>${d.star}</strong></div><div class="stat"><label>星座面積</label><strong>${d.area}</strong></div><div class="stat"><label>星座補充資訊</label><strong>${d.sign}</strong></div></div><a class="btn" href="#s01">認識${d.cn} ↓</a><a class="btn secondary" href="${url(id, true)}">閱讀完整神話 ↗</a></div></section>` +
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
        `<div class="story-banner"><div class="artline">${{ andromeda: "✧", pegasus: "♞", cassiopeia: "♛", perseus: "⚔" }[id]}<span>${d.en.toUpperCase()} · MYTHOLOGY</span></div><div><div class="eyebrow">GREEK MYTHOLOGY</div><h3>${d.mythtitle}</h3><p>${d.mythlead}</p><a class="btn" href="${url(id, true)}">閱讀完整故事 →</a></div></div>`,
      ) +
      section(
        "05",
        "簡易觀星指南",
        `<div class="guide"><div class="panel"><div class="eyebrow">OBSERVATION GUIDE</div><h3>如何尋找${d.cn}？</h3><p>${d.recognize}</p><a class="btn secondary" href="guide.html">前往完整觀星指南 ↗</a></div><div class="panel"><div class="eyebrow">CULTURAL NOTE</div><h3>歷史與文化小知識</h3><p>${d.history}</p><p class="tiny">※ 觀測月份是一般性建議，不代表特定今晚的可見性或天氣。</p></div></div>`,
      ) +
      section(
        "06",
        "繼續探索秋季星空",
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
    `<div class="crumb"><a href="stories.html">星座故事</a> <span>›</span> ${d.cn} <span>›</span> ${d.mythtitle}</div><section class="story-banner"><div class="artline">${{ andromeda: "✧", pegasus: "♞", cassiopeia: "♛", perseus: "⚔" }[id]}<span>${d.en.toUpperCase()} · MYTHOLOGY</span></div><div><div class="eyebrow">GREEK MYTHOLOGY · ${d.en.toUpperCase()}</div><h1 style="font-family:'Noto Serif TC',serif;font-size:clamp(29px,4vw,46px);line-height:1.45">${d.cn}神話<br>${d.mythtitle}</h1><p>${d.mythlead}</p><a class="btn secondary" href="${url(id)}">← 返回${d.cn}介紹</a></div></section><section class="section"><div class="panel"><div class="note">這是神話傳說的重新敘述，並非經科學證實的歷史事件。不同文獻對人物與細節可能有不同版本。</div>${d.chapters.map(([name, txt], i) => `<div class="chapter"><div class="eyebrow">CHAPTER ${String(i + 1).padStart(2, "0")}</div><h3>第${["一", "二", "三", "四", "五"][i]}章｜${name}</h3><p>${txt}</p></div>`).join("")}<details style="margin:24px auto;max-width:840px" open><summary style="color:var(--gold);cursor:pointer;font-size:19px">✦ 不同版本與神話小知識</summary><p>${d.extra}</p></details><div style="text-align:center"><a class="btn" href="${url(id)}">← 回到${d.cn}天文介紹</a><a class="btn secondary" href="stories.html">更多星座故事 →</a></div></div></section>` +
      source(d),
  );
}
// 建立本季首頁與圖鑑卡片，提供後續搜尋功能使用的容器。
function home() {
  document.title = "星序｜秋季星空";
  layout(
    "home",
    `<section class="hero"><div><div class="eyebrow">SEASONS OF THE SKY · AUTUMN</div><h1>星序<br>秋季星空</h1><div class="latin">FOUR STORIES AMONG THE STARS</div><p class="lead">從飛馬座大四邊形出發，走向仙女座的遙遠星系、仙后座的 W 形星光，以及英仙座的傳奇英雄。探索秋季星空的科學與神話。</p><a class="btn" href="#explore">開始探索 ↓</a><a class="btn secondary" href="stories.html">閱讀神話故事 ↗</a></div>${art("andromeda")}</section><section class="section" id="explore"><div class="section-head"><h2>探索星序</h2></div><div class="collection">${[
      ["四季星空", "index.html#seasons", "依季節認識夜空"],
      ["星座圖鑑", "index.html#atlas", "探索四個秋季星座"],
      ["星座故事", "stories.html", "閱讀完整希臘神話"],
      ["觀星指南", "guide.html", "初學者的尋星方法"],
    ]
      .map(
        ([t, l, s]) =>
          `<a class="card link" href="${l}"><div class="inside"><h3>${t} ↗</h3><p>${s}</p></div></a>`,
      )
      .join(
        "",
      )}</div></section><section class="section" id="seasons"><div class="section-head"><h2>四季星空</h2></div><div class="panel"><div class="eyebrow">AUTUMN · 秋季</div><h2>秋季星空已開放探索</h2><p>本次預覽先完成秋季四個星座；春、夏、冬季內容將在後續整合版本呈現。</p><a class="btn secondary" href="#atlas">查看秋季星座 ↓</a></div></section><section class="section" id="atlas"><div class="section-head"><h2>秋季星座圖鑑</h2></div><p class="muted">搜尋中文名稱、拉丁名稱或代表亮星，點選卡片進入完整介紹。</p><input class="search" id="search" aria-label="搜尋秋季星座" placeholder="例如：仙女座、Pegasus、天船三、M31……"><div class="collection" id="results">${ids.map((k) => `<a class="card link" href="${url(k)}">${art(k)}<div class="inside"><h3>${D[k].cn} · ${D[k].en}</h3><p>${D[k].tag}</p><p style="color:var(--gold)">查看完整介紹 →</p></div></a>`).join("")}</div><p class="tiny" id="count"></p></section>`,
  );
}
// 將本季星座的神話標題與摘要轉成故事卡片列表。
function stories() {
  document.title = "星座故事｜星序";
  layout(
    "stories",
    `<div class="eyebrow">MYTHOLOGY · AUTUMN</div><h1 style="font-family:'Noto Serif TC',serif;font-size:44px">秋季星座故事</h1><p class="muted">四則古老傳說，各自擁有完整閱讀頁面。神話版本可能不同，故事與天文知識分開呈現。</p>${network()}<div class="collection">${ids.map((k) => `<a class="card link" href="${url(k, true)}">${art(k)}<div class="inside"><h3>${D[k].cn}｜${D[k].mythtitle}</h3><p>${D[k].mythlead}</p><p style="color:var(--gold)">閱讀完整故事 →</p></div></a>`).join("")}</div>`,
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
        "尋找秋季星座",
        `<div class="panel"><p>秋季夜晚可先找出由室宿一、室宿二、壁宿一與壁宿二組成的「飛馬座大四邊形」（不是三角形）。由壁宿二沿仙女座亮星延伸，可尋找仙女座與 M31；北方的仙后座呈 W／M 形，英仙座則位於仙后座與金牛座附近，能利用天船三與大陵五辨認。觀察方向會隨日期、時間與地點改變。</p><div class="note">實際方位與高度會隨日期、時間和觀測地點改變；本指南提供一般尋星方法，不假裝即時預測。</div></div>`,
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
        `<div class="panel"><details open><summary>城市裡也能觀星嗎？</summary><p>可以先觀察月亮與亮星，但光害會讓較暗的星座和星團難以辨認。</p></details><details><summary>需要天文望遠鏡嗎？</summary><p>不一定。認識星座先從肉眼和星圖開始；觀察 M31 與英仙座雙星團時，雙筒望遠鏡很實用。</p></details><details><summary>為什麼今天看不到推薦的星座？</summary><p>可能是觀測季節、時間、雲量、光害或地平線遮擋不同。本版沒有即時星位與天氣運算。</p></details></div>`,
      ),
  );
}
// 產生網站介紹與製作說明頁面。
function about() {
  layout(
    "home",
    `<div class="eyebrow">ABOUT THE PROJECT</div><h1 style="font-family:'Noto Serif TC',serif">關於星序</h1><div class="panel"><p>《星序｜Seasons of the Sky》是一個以四季星空為主題的天文科普與故事探索網站。透過星座介紹、神話故事與初學者觀星指南，讓讀者從夜空中的亮星出發，認識星空與文化。</p><p>《星序》目前收錄春、夏、秋、冬四季共 16 個代表星座；本頁聚焦秋季的四個星座：仙女座、飛馬座、仙后座、英仙座。</p><a class="btn" href="index.html#atlas">開始探索秋季星空 →</a></div>`,
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
      : "<p>找不到符合的秋季星座，試試其他關鍵字。</p>";
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
  if (k === "pegasus")
    return section(
      "✦",
      "互動探索｜秋季四邊形",
      `<div class="panel"><p>四顆星中有三顆屬於飛馬座，另一顆壁宿二屬於仙女座。點選星名認識它們。</p><div class="star-actions">${[
        ["室宿一 Markab", "飛馬座 α 星，是四邊形的一角。"],
        ["室宿二 Scheat", "飛馬座 β 星，是一顆紅巨星。"],
        ["壁宿一 Algenib", "飛馬座 γ 星，位於四邊形一角。"],
        ["壁宿二 Alpheratz", "仙女座 α 星，也是通往仙女座星系的路標。"],
      ]
        .map(
          ([a, b], i) =>
            `<button class="star-choice" data-fact="${esc(b)}" aria-pressed="${i === 0}">${a}</button>`,
        )
        .join(
          "",
        )}</div><div class="note" id="star-fact">飛馬座 α 星，是四邊形的一角。</div><p class="tiny">星點圖為藝術示意，不代表精確方位。</p><a class="btn secondary" href="constellation.html?id=andromeda">前往仙女座 →</a></div>`,
    );
  if (k === "cassiopeia")
    return section(
      "✦",
      "互動探索｜W 與 M",
      `<div class="panel"><p>地球自轉讓 W 形星群在不同時刻呈現不同角度，按下按鈕切換觀看示意。</p><div class="w-wrap"><svg id="w-diagram" viewBox="0 0 520 190" role="img" aria-label="仙后座 W 形藝術示意"><path d="M50 120 L145 50 L250 125 L355 50 L470 120" stroke="#e4c994" stroke-width="3" fill="none"/>${[
        [50, 120],
        [145, 50],
        [250, 125],
        [355, 50],
        [470, 120],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#fff0bc"/>`)
        .join(
          "",
        )}</svg></div><button class="star-choice" id="flip-w">旋轉 180°｜切換 W / M 視角</button><p class="tiny">此功能示範方向變化，不是當下星空定位或北極星指向計算。</p></div>`,
    );
  if (k === "perseus")
    return section(
      "✦",
      "互動探索｜大陵五的食變",
      `<div class="panel"><p>調整示意進度，看看當較暗的伴星遮擋亮星時，觀測亮度如何下降。</p><div class="eclipse-visual"><div class="eclipse-main"></div><div class="eclipse-companion" id="eclipse-companion"></div></div><label for="eclipse-range">食變過程（教學模擬）</label><input id="eclipse-range" type="range" min="0" max="100" value="0" style="width:100%"><div class="note" id="eclipse-caption">伴星尚未遮擋主要亮星。</div><p class="tiny">大陵五實際主要食變週期約 2.867 天；此模型不是精確光變曲線。</p></div>`,
    );
  return section(
    "✦",
    "互動探索｜兩座星系的未來",
    `<div class="panel"><p>仙女座星系與銀河系目前相距約 250 萬光年。科學家仍在研究未來是否會相遇與合併。</p><div class="galaxy-stage"><span class="galaxy one" id="galaxy-one"></span><span class="galaxy two" id="galaxy-two"></span></div><div class="star-actions"><button class="star-choice" id="galaxy-now">現在</button><button class="star-choice" id="galaxy-future">未來數十億年（可能情境）</button></div><div class="note" id="galaxy-caption">目前兩座星系仍相距約 250 萬光年。</div><p class="tiny">此為概念動畫；星系的相遇與合併並非已確定的未來事件。</p></div>`,
  );
}
// 產生星座連線示意
function network() {
  return `<div class="panel" style="margin:22px 0"><div class="eyebrow">CONNECTED MYTHS</div><h2>秋季神話人物關係圖</h2><p>從王后卡西歐佩亞的誇耀，到安朵美達被獻祭、珀耳修斯出手相救，以及飛馬在美杜莎死後誕生。點選人物探索故事。</p><div class="myth-network">${[
    ["cassiopeia", "👑 仙后座", "公主的母親"],
    ["andromeda", "✧ 仙女座", "等待救援的公主"],
    ["perseus", "⚔ 英仙座", "救出公主的英雄"],
    ["pegasus", "♞ 飛馬座", "美杜莎之血誕生的神馬"],
  ]
    .map(
      ([k, n, t]) =>
        `<a href="${url(k, true)}"><strong>${n}</strong><small>${t}</small></a>`,
    )
    .join("")}</div></div>`;
}
// 依本季頁面上的元件是否存在，啟動對應的額外互動。
function initExtra() {
  document.querySelectorAll(".star-choice[data-fact]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelector("#star-fact").textContent = b.dataset.fact;
      document
        .querySelectorAll(".star-choice[data-fact]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }),
  );
  const flip = document.querySelector("#flip-w");
  if (flip)
    // 點擊操作
    flip.addEventListener("click", () => {
      const el = document.querySelector("#w-diagram");
      el.classList.toggle("flipped");
      flip.textContent = el.classList.contains("flipped")
        ? "旋轉回 W 形"
        : "旋轉 180°｜切換 W / M 視角";
    });
  const range = document.querySelector("#eclipse-range");
  if (range) {
    // 更新本季互動結果
    const f = () => {
      let p = +range.value;
      document.querySelector("#eclipse-companion").style.left =
        `calc(50% + ${(p - 50) * 3.5}px)`;
      document.querySelector("#eclipse-caption").textContent =
        p > 33 && p < 67
          ? "伴星正從亮星前方經過，觀測亮度降低。"
          : "伴星未遮擋主要亮星，觀測亮度較高。";
    };
    // 輸入內容改變時立即更新結果，不必額外按下搜尋按鈕。
    range.addEventListener("input", f);
    f();
  }
  const future = document.querySelector("#galaxy-future"),
    now = document.querySelector("#galaxy-now");
  if (future) {
    // 點擊操作
    future.addEventListener("click", () => {
      document.querySelector(".galaxy-stage").classList.add("approach");
      document.querySelector("#galaxy-caption").textContent =
        "可能情境：兩座星系近距離交會，甚至合併；模擬結果仍有不確定性。";
    });
    // 點擊操作
    now.addEventListener("click", () => {
      document.querySelector(".galaxy-stage").classList.remove("approach");
      document.querySelector("#galaxy-caption").textContent =
        "目前兩座星系仍相距約 250 萬光年。";
    });
  }
}
initExtra();
