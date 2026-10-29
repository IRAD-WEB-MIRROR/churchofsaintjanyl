/* Light a candle: the candle stand shows today's candles (the same for everyone, drawn from the date and the hour in
   Irad Time) and the visitor's own, which is kept in this browser until it burns down (one day, or three for a large
   candle). Nothing is sent anywhere. */
(function () {
  "use strict";
  var stand = document.getElementById("stand"), count = document.getElementById("stand-count");
  var form = document.getElementById("candle-form"), mine = document.getElementById("candle-mine");
  if (!stand) return;
  var KEY = "stjanyl-candles";

  var FOR = ["the sick", "a safe journey", "one far from home", "the soul of the departed", "an exam or new work",
             "peace in the family", "thanksgiving", "a private intention"];
  var FROM = ["Iyık Janyl", "Iyık Janyl", "Iyık Janyl", "Talas", "Talas", "Nurzhan", "Tash-Kömür", "Toktogul", "Kyzyl-Adyr",
              "Sary-Bulak", "Almaty", "Moscow", "Chicago", "Bishkek", "Istanbul", "Seoul", "Kara-Buura", "Lower Town"];
  var LET = "AABBDEGGIJKKKLMMNNOPRSSSTTUZ";

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function irt() { return new Date(Date.now() + 6 * 3600000); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function today() {
    var now = irt(), day = Math.floor(now.getTime() / 86400000), hour = now.getUTCHours(), r = rng(day * 31 + 7);
    var dow = now.getUTCDay(), base = dow === 0 ? 70 : dow === 6 ? 48 : 30;   // more on Sundays and Saturdays
    var total = base + Math.floor(r() * 25), lit = [];
    for (var i = 0; i < total; i++) {
      var h = 7 + Math.floor(r() * 13);   // lit between 7:00 and 19:59
      var c = { ini: LET[Math.floor(r() * LET.length)] + "." + LET[Math.floor(r() * LET.length)] + ".",
                forr: FOR[Math.floor(r() * FOR.length)], from: FROM[Math.floor(r() * FROM.length)], h: h, large: r() < .15 };
      if (h <= hour) lit.push(c);
    }
    return lit;
  }
  function load() {
    try {
      var L = JSON.parse(localStorage.getItem(KEY) || "[]");
      return L.filter(function (c) { return c.until > Date.now(); });
    } catch (e) { return []; }
  }
  function save(L) { try { localStorage.setItem(KEY, JSON.stringify(L)); } catch (e) {} }

  function candle(c, own) {
    return '<div class="cdl' + (c.large ? " cdl-l" : "") + (own ? " cdl-own" : "") + '" title="' + esc(c.ini + " · for " + c.forr + (c.from ? " · " + c.from : "")) + '">' +
      '<span class="flame"></span><span class="wax"></span><span class="lab">' + esc(c.ini) + "</span></div>";
  }
  function draw() {
    var own = load(), lit = today();
    stand.innerHTML = '<div class="cdl-row">' + own.map(function (c) { return candle(c, true); }).join("") + lit.slice().reverse().map(function (c) { return candle(c, false); }).join("") + "</div>";
    var n = own.length + lit.length;
    count.textContent = n ? n + (n === 1 ? " candle" : " candles") + " lit today before the icon of St. Janyl. Hover over a candle to see its intention." : "The stand was cleared at dawn. Be the first to light a candle today.";
    if (own.length) {
      var c = own[0], left = Math.max(1, Math.round((c.until - Date.now()) / 3600000));
      mine.hidden = false;
      mine.innerHTML = '<p class="notice">Your candle for ' + esc(c.forr) + " is burning. It will burn for about " + left + (left === 1 ? " more hour" : " more hours") +
        ". Your intention will be read, as “" + esc(c.ini) + "”, at the Sunday Qurbana.</p>";
    }
  }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ini = document.getElementById("c-ini").value.replace(/[^A-Za-zÀ-ž. ]/g, "").trim().slice(0, 5).toUpperCase();
    if (!ini) return;
    var large = document.getElementById("c-large").checked;
    var L = load();
    L.unshift({ ini: ini, forr: document.getElementById("c-for").value, text: document.getElementById("c-text").value.slice(0, 280),
                large: large, until: Date.now() + (large ? 72 : 24) * 3600000 });
    save(L.slice(0, 5));
    form.reset();
    draw();
    stand.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  draw();
  setInterval(draw, 10 * 60000);
})();
