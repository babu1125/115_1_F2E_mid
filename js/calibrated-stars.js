// 依星座代號分組；index 對應介紹資料，ra／dec 是 J2000 座標（度），mag 是視星等。
// 校準後的星座示意圖座標
/* Named-star coordinates from existing V3 subset, J2000 approximate; missing stars intentionally not invented. */
window.XINGXU_CALIBRATED = {
  // 獅子座資料
  leo: [
    // 軒轅十四資料
    {
      index: 0,
      en: "Regulus",
      cn: "軒轅十四",
      ra: 152.093,
      dec: 11.967,
      mag: 1.35,
    },
    // 軒轅十二資料
    {
      index: 1,
      en: "Algieba",
      cn: "軒轅十二",
      ra: 154.993,
      dec: 19.841,
      mag: 2.08,
    },
    // 五帝座一資料
    {
      index: 2,
      en: "Denebola",
      cn: "五帝座一",
      ra: 177.265,
      dec: 14.572,
      mag: 2.14,
    },
  ],
  // 室女座資料
  virgo: [
    // 角宿一資料
    {
      index: 0,
      en: "Spica",
      cn: "角宿一",
      ra: 201.298,
      dec: -11.161,
      mag: 0.98,
    },
  ],
  // 牧夫座資料
  bootes: [
    // 大角星資料
    {
      index: 0,
      en: "Arcturus",
      cn: "大角星",
      ra: 213.915,
      dec: 19.182,
      mag: -0.05,
    },
  ],
  // 巨蟹座資料
  cancer: [],
  // 天琴座資料
  lyra: [
    // 織女星資料
    { index: 0, en: "Vega", cn: "織女星", ra: 279.235, dec: 38.784, mag: 0.03 },
  ],
  // 天鷹座資料
  aquila: [
    // 牛郎星資料
    {
      index: 0,
      en: "Altair",
      cn: "牛郎星",
      ra: 297.696,
      dec: 8.868,
      mag: 0.77,
    },
  ],
  // 天鵝座資料
  cygnus: [
    // 天津四資料
    { index: 0, en: "Deneb", cn: "天津四", ra: 310.358, dec: 45.28, mag: 1.25 },
  ],
  // 天蠍座資料
  scorpius: [
    // 心宿二資料
    {
      index: 0,
      en: "Antares",
      cn: "心宿二",
      ra: 247.352,
      dec: -26.432,
      mag: 1.06,
    },
    // 尾宿八資料
    {
      index: 1,
      en: "Shaula",
      cn: "尾宿八",
      ra: 263.402,
      dec: -37.104,
      mag: 1.62,
    },
  ],
  // 仙女座資料
  andromeda: [
    // 壁宿二資料
    {
      index: 0,
      en: "Alpheratz",
      cn: "壁宿二",
      ra: 2.097,
      dec: 29.091,
      mag: 2.06,
    },
    // 奎宿九資料
    {
      index: 1,
      en: "Mirach",
      cn: "奎宿九",
      ra: 17.433,
      dec: 35.621,
      mag: 2.05,
    },
    // 天大將軍一資料
    {
      index: 2,
      en: "Almach",
      cn: "天大將軍一",
      ra: 30.975,
      dec: 42.33,
      mag: 2.1,
    },
  ],
  // 飛馬座資料
  pegasus: [
    // 危宿三資料
    { index: 0, en: "Enif", cn: "危宿三", ra: 333.366, dec: 9.875, mag: 2.38 },
    // 室宿一資料
    {
      index: 1,
      en: "Markab",
      cn: "室宿一",
      ra: 346.19,
      dec: 15.205,
      mag: 2.49,
    },
    // 室宿二資料
    {
      index: 2,
      en: "Scheat",
      cn: "室宿二",
      ra: 345.943,
      dec: 28.083,
      mag: 2.42,
    },
    // 壁宿一資料
    {
      index: 3,
      en: "Algenib",
      cn: "壁宿一",
      ra: 3.309,
      dec: 15.184,
      mag: 2.84,
    },
  ],
  // 仙后座資料
  cassiopeia: [
    // 王良四資料
    {
      index: 0,
      en: "Schedar",
      cn: "王良四",
      ra: 10.127,
      dec: 56.537,
      mag: 2.24,
    },
    // 王良一資料
    { index: 1, en: "Caph", cn: "王良一", ra: 2.295, dec: 59.15, mag: 2.28 },
    // 閣道三資料
    {
      index: 3,
      en: "Ruchbah",
      cn: "閣道三",
      ra: 21.454,
      dec: 60.235,
      mag: 2.68,
    },
    // 閣道二資料
    { index: 4, en: "Segin", cn: "閣道二", ra: 28.598, dec: 63.67, mag: 3.35 },
  ],
  // 英仙座資料
  perseus: [
    // 天船三資料
    {
      index: 0,
      en: "Mirfak",
      cn: "天船三",
      ra: 51.081,
      dec: 49.861,
      mag: 1.79,
    },
    // 大陵五資料
    { index: 1, en: "Algol", cn: "大陵五", ra: 47.042, dec: 40.956, mag: 2.12 },
  ],
  // 獵戶座資料
  orion: [
    // 參宿七資料
    { index: 0, en: "Rigel", cn: "參宿七", ra: 78.634, dec: -8.202, mag: 0.13 },
    // 參宿四資料
    {
      index: 1,
      en: "Betelgeuse",
      cn: "參宿四",
      ra: 88.793,
      dec: 7.407,
      mag: 0.5,
    },
    // 參宿一資料
    {
      index: 2,
      en: "Alnitak",
      cn: "參宿一",
      ra: 85.19,
      dec: -1.943,
      mag: 1.74,
    },
    // 參宿二資料
    {
      index: 3,
      en: "Alnilam",
      cn: "參宿二",
      ra: 84.053,
      dec: -1.202,
      mag: 1.69,
    },
    // 參宿三資料
    {
      index: 4,
      en: "Mintaka",
      cn: "參宿三",
      ra: 83.002,
      dec: -0.299,
      mag: 2.25,
    },
  ],
  // 金牛座資料
  taurus: [
    // 畢宿五資料
    {
      index: 0,
      en: "Aldebaran",
      cn: "畢宿五",
      ra: 68.98,
      dec: 16.509,
      mag: 0.86,
    },
    // 五車五資料
    {
      index: 1,
      en: "Elnath",
      cn: "五車五",
      ra: 81.573,
      dec: 28.608,
      mag: 1.65,
    },
  ],
  // 雙子座資料
  gemini: [
    // 北河三資料
    {
      index: 0,
      en: "Pollux",
      cn: "北河三",
      ra: 116.329,
      dec: 28.026,
      mag: 1.14,
    },
    // 北河二資料
    {
      index: 1,
      en: "Castor",
      cn: "北河二",
      ra: 113.65,
      dec: 31.888,
      mag: 1.58,
    },
    // 井宿三資料
    {
      index: 2,
      en: "Alhena",
      cn: "井宿三",
      ra: 99.428,
      dec: 16.399,
      mag: 1.93,
    },
  ],
  // 大犬座資料
  canis_major: [
    // 天狼星資料
    {
      index: 0,
      en: "Sirius",
      cn: "天狼星",
      ra: 101.287,
      dec: -16.716,
      mag: -1.46,
    },
    // 弧矢七資料
    {
      index: 1,
      en: "Adhara",
      cn: "弧矢七",
      ra: 104.656,
      dec: -28.972,
      mag: 1.5,
    },
  ],
};
