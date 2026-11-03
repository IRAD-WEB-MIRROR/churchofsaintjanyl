/* Name days: looks a name up in data/namedays.json (folding case, Iradi letters and Cyrillic), gives the saint and
   the day, the next date it falls on in Irad Time, and the feast or season of data/church.json that day falls in.
   A name with no saint gets the nearest name, or the first saint after the birthday, as a parish priest would say.
   Nothing is sent anywhere. */
(function () {
  "use strict";
  var form = document.getElementById("nd-form"), out = document.getElementById("nd-out");
  if (!form) return;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var CYR = { "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "zh", "з": "z", "и": "i", "й": "y",
    "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh",
    "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya", "ө": "o",
    "ү": "u", "ң": "ng", "і": "i", "ї": "yi", "є": "ye" };
  var data = null, saints = null, cal = [];

  var dd = document.getElementById("nd-bd-d"), mm = document.getElementById("nd-bd-m");
  for (var i = 1; i <= 31; i++) dd.insertAdjacentHTML("beforeend", "<option>" + i + "</option>");
  MONTHS.forEach(function (m, j) { mm.insertAdjacentHTML("beforeend", '<option value="' + (j + 1) + '">' + m + "</option>"); });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fold(s) {
    s = String(s).toLowerCase().split(/[\s,.;-]+/)[0] || "";
    s = s.replace(/[Ѐ-ӿ]/g, function (c) { return CYR[c] != null ? CYR[c] : ""; });
    s = s.replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
    return s.replace(/dzh|dj|zh/g, "j").replace(/kh/g, "h").replace(/ph/g, "f").replace(/th/g, "t").replace(/w/g, "v")
      .replace(/(iy|ii|ey|y)$/, "i").replace(/(.)\1/g, "$1");
  }
  function lev(a, b) {
    var m = [], i, j;
    for (i = 0; i <= a.length; i++) m[i] = [i];
    for (j = 0; j <= b.length; j++) m[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function today() { var d = new Date(Date.now() + 6 * 3600000); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
  function iso(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function nextDate(md) {
    var t = today(), p = md.split("-"), d = new Date(Date.UTC(t.getUTCFullYear(), +p[0] - 1, +p[1]));
    if (d < t) d = new Date(Date.UTC(t.getUTCFullYear() + 1, +p[0] - 1, +p[1]));
    return d;
  }
  function nice(md) { var p = md.split("-"); return +p[1] + " " + MONTHS[+p[0] - 1]; }
  function longDate(d) { return DAYS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear(); }

  function lookup(n) {
    for (var i = 0; i < data.length; i++) for (var j = 0; j < data[i].n.length; j++) if (fold(data[i].n[j]) === n) return { row: data[i], how: "exact", as: data[i].n[j] };
    var best = null, bd = 99;
    data.forEach(function (r) {
      r.n.forEach(function (x) {
        var f = fold(x), d = lev(n, f), pre = 0;
        while (pre < n.length && pre < f.length && n[pre] === f[pre]) pre++;
        var ok = (d <= (n.length <= 5 ? 1 : 2)) || (pre >= 4 && Math.abs(n.length - f.length) <= 3);
        if (ok && d < bd) { bd = d; best = { row: r, how: "near", as: x }; }
      });
    });
    return best;
  }
  function afterBirthday(m, d) {
    var key = pad(m) + "-" + pad(d), also = {};
    data.forEach(function (r) { (r.also || []).forEach(function (a) { also[a[0]] = a[1]; }); });
    var days = Object.keys(saints).concat(data.map(function (r) { return r.d; }), Object.keys(also)).sort();
    var k = days.filter(function (x) { return x >= key; })[0] || days[0];
    var row = data.filter(function (r) { return r.d === k; })[0];
    if (row) return { row: row, how: "birthday" };
    return { row: saints[k] ? { d: k, s: saints[k][0], note: saints[k][1] || "" } : { d: k, s: also[k] }, how: "birthday" };
  }
  function feastOn(d) {
    var s = iso(d), hit = [];
    cal.forEach(function (c) {
      if (c.end ? (s >= c.date && s <= c.end) : s === c.date) hit.push(c);
    });
    return hit;
  }

  function show(res, typed) {
    var r = res.row, d = nextDate(r.d), h = "";
    if (res.how === "near") h += "<p><i>There is no saint " + esc(typed) + " in our calendar. As our priests would say, " + esc(typed) + " is near enough to " + esc(r.n[0]) + ": keep the day of that saint.</i></p>";
    if (res.how === "birthday") h += "<p><i>There is no saint " + esc(typed) + " in our calendar, and no name near it. As our priests would say: take the saint whose day comes first after your birthday.</i></p>";
    h += '<p style="font-size:1.25em;margin:6px 0"><b>' + esc(r.s) + "</b>, " + nice(r.d) + "</p>";
    if (r.note) h += "<p>" + esc(r.note) + "</p>";
    var t = today(), wait = Math.round((d - t) / 86400000);
    h += "<p>Your next name day: <b>" + longDate(d) + "</b>" + (wait === 0 ? " (today! Many happy returns)" : wait === 1 ? " (tomorrow)" : " (in " + wait + " days)") + ".</p>";
    var f = feastOn(d);
    f.forEach(function (c) {
      if (c.kind === "season") h += "<p>It falls in the season of <b>" + esc(c.name) + "</b>.</p>";
      else if (c.kind === "fast") h += "<p>It falls on a fast day (" + esc(c.name) + "): keep the meal without meat, or move it to the next day.</p>";
      else if (r.s.indexOf(c.name.replace(/^(St\.|The) /, "")) < 0 && (c.name.indexOf("Janyl") < 0 || r.d !== "08-24")) h += "<p>That day is also <b>" + esc(c.name) + "</b>" + (c.kind === "great" ? ": your saint gives way to the great feast, and the family keeps the name day the next day." : ".") + "</p>";
    });
    if (r.d === "08-24") h += "<p>The Feast of St. Janyl is the great feast of this cathedral: come to Iyık Janyl for it if you can (see <a href=\"visit.html\">Visit &amp; Pilgrimage</a>).</p>";
    if (r.also && r.also.length && res.how === "exact")
      h += '<p class="small">Named for another saint of this name? ' + r.also.map(function (a) { return esc(a[1]) + ", " + nice(a[0]); }).join("; ") + ".</p>";
    h += '<p><a class="btn" href="candle.html">Light a candle for your name day</a></p>';
    out.innerHTML = h;
  }

  function run(e) {
    if (e) e.preventDefault();
    var typed = document.getElementById("nd-name").value.trim().split(/\s+/)[0] || "", n = fold(typed);
    if (!n) return;
    var res = lookup(n);
    if (!res) {
      var m = +mm.value, d = +dd.value;
      if (m && d) res = afterBirthday(m, d);
      else {
        out.innerHTML = "<p><i>There is no saint " + esc(typed) + " in our calendar. Was this the name you were baptised with? Many people have a church name besides their everyday one, and the name day follows the church name. If " + esc(typed) + " is your baptismal name, give your birthday above: as our priests would say, the saint whose day comes first after your birthday is yours.</i></p>";
        return;
      }
    }
    show(res, typed);
    try { history.replaceState(null, "", "#" + encodeURIComponent(typed)); } catch (x) {}
  }

  Promise.all([
    fetch("data/namedays.json").then(function (r) { return r.json(); }),
    fetch("data/saints.json").then(function (r) { return r.json(); }),
    fetch("data/church.json").then(function (r) { return r.json(); }).catch(function () { return { calendar: [] }; })
  ]).then(function (a) {
    data = a[0].names; saints = a[1].days; cal = a[2].calendar || [];
    form.addEventListener("submit", run);
    var hsh = decodeURIComponent(location.hash.slice(1));
    if (hsh) { document.getElementById("nd-name").value = hsh; run(); }
  }).catch(function () {
    out.innerHTML = '<p class="small">The calendar of saints could not be loaded. Please try again later.</p>';
  });
})();
