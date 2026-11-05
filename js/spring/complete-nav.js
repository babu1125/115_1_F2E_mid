// 補齊季節頁面的導覽連結
(function () {
  // 先檢查導覽連結是否已加入，避免重複建立，再補上回首頁與切換季節的連結。
  function add() {
    if (document.querySelector(".complete-return")) return;
    const a = document.createElement("a");
    a.className = "complete-return";
    a.href = "../index.html";
    a.textContent = "✦ 返回四季星空總覽";
    document.body.appendChild(a);
    // 建立切換季節的連結容器，將四季連結一次加入頁面。
    const links = document.createElement("div");
    links.className = "complete-seasons";
    // 將組好的 HTML 字串寫入容器；動態資料需先經過適當的文字轉換。
    links.innerHTML =
      '<span>切換季節</span><a href="../spring/index.html">🌸 春</a><a href="../summer/index.html">☀️ 夏</a><a href="../autumn/index.html">🍁 秋</a><a href="../winter/index.html">❄️ 冬</a>';
    document.body.appendChild(links);
  }
  if (document.readyState === "loading")
    // 頁面載入完成後啟動功能
    document.addEventListener("DOMContentLoaded", add);
  else add();
})();
