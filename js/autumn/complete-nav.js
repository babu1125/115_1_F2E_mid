// 補齊季節頁面的導覽連結
(function () {
  // 檢查導覽連結是否已加入，避免重複建立，再補上回首頁與切換季節的連結
  function add() {
    //document.querySelector尋找頁面上是否已存在 class 為 .complete-return 的元素
    //​如存在→導覽連結先前加入過，return中止函數執行，避免重複建立相同連結
    if (document.querySelector(".complete-return")) return;
    //建立並加入「返回首頁」連結
    const a = document.createElement("a");//動態建立一個全新的 <a>標籤
    a.className = "complete-return";//設定a的class名稱，後續透過 CSS 設定樣式
    a.href = "../index.html";//a的連結 到上一層的index.html
    a.textContent = "✦ 返回四季星空總覽";//a顯示的文字
    document.body.appendChild(a);//將這個<a>標籤移到網頁<body> 最下方
    // 建立切換季節的連結容器，將四季連結一次加入頁面。
    const links = document.createElement("div");
    links.className = "complete-seasons";
    // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換
    links.innerHTML =
      '<span>切換季節</span><a href="../spring/index.html">🌸 春</a><a href="../summer/index.html">☀️ 夏</a><a href="../autumn/index.html">🍁 秋</a><a href="../winter/index.html">❄️ 冬</a>';
    document.body.appendChild(links);
  }
  if (document.readyState === "loading")
    // 頁面載入完成後啟動功能
    document.addEventListener("DOMContentLoaded", add);
  else add();
})();
