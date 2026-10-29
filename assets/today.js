/* The bar under the menu on every page: today's date in Irad Time, the season or feast from the church calendar
   (data/church.json), whether it is a fast or abstinence day, the next service today, and on Sundays the
   IradOne broadcast. */
(function () {
  "use strict";
  var bar = document.getElementById("todaybar");
  if (!bar) return;
  var rel = bar.getAttribute("data-rel") || "";
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  var now = new Date(Date.now() + 6 * 3600000), today = iso(now), dow = now.getUTCDay(), mins = now.getUTCHours() * 60 + now.getUTCMinutes();

  fetch(rel + "data/church.json").then(function (r) { return r.json(); }).then(function (d) {
    var on = d.calendar.filter(function (f) { return f.date <= today && (f.end || f.date) >= today; });
    var season = on.filter(function (f) { return f.kind === "season"; })[0];
    var feast = on.filter(function (f) { return f.kind !== "season"; })[0];
    var fastPeriod = on.some(function (f) { return f.kind === "fast"; });
    var great = d.calendar.filter(function (f) { return f.name.indexOf("Great Fast") >= 0; })[0];
    var kyamta = d.calendar.filter(function (f) { return f.name.indexOf("Resurrection") >= 0; })[0];
    var inLent = great && kyamta && today >= great.date && today < kyamta.date;
    var paschal = kyamta && today > kyamta.date && today <= iso(new Date(Date.parse(kyamta.date) + 49 * 86400000));
    var bits = ['<b>' + DAYS[dow] + " " + now.getUTCDate() + " " + MONTHS[now.getUTCMonth()] + "</b>"];
    if (feast) bits.push('<span class="tb-feast">' + esc(feast.name) + "</span>");
    if (season) bits.push(esc(season.name));
    if (fastPeriod || inLent) bits.push('<span class="tb-fast">Fast day</span>');
    else if ((dow === 3 || dow === 5) && !paschal && !(feast && feast.kind === "great")) bits.push('<span class="tb-fast">Day of abstinence</span>');
    // the bells (cathedral.html#bells): all five for the Solemn Qurbana; the great bell alone on 14 November;
    // silent, with the nakus beaten instead, at the start of the Great Fast and on Good Friday
    if (feast && (feast.name.indexOf("Good Friday") >= 0 || feast.name.indexOf("Great Fast") >= 0)) bits.push('<a href="' + rel + 'cathedral.html#bells">The bells are silent; the nakus is beaten</a>');
    else if (today.slice(5) === "11-14") bits.push('<a href="' + rel + 'cathedral.html#bells">The great bell tolls</a>');
    else if (dow === 0 || (feast && feast.kind !== "fast")) bits.push('<a href="' + rel + 'cathedral.html#bells">All five bells ring for the Solemn Qurbana</a>');

    var key = dow === 0 ? "Sunday" : dow === 6 ? "Saturday" : dow === 5 ? "Friday" : "Monday to Thursday";
    var day = d.services.filter(function (s) { return s.day === key; })[0], next = null;
    (day ? day.items : []).forEach(function (s) {
      var p = s.time.split(":"), m = +p[0] * 60 + +p[1];
      if (!next && m > mins) next = s;
    });
    if (next) bits.push('Next today: <a href="' + rel + 'liturgy.html#times">' + esc(next.time) + " " + esc(next.what.split(".")[0]) + "</a>");
    if (dow === 0 && mins < 9 * 60 + 30) bits.push('Sunday Qurbana on <a href="https://iradone.com/shows/sunday_qurbana.html">IradOne at 8:00</a>');
    bar.innerHTML = bits.join(' <span class="tb-sep">·</span> ');
    bar.hidden = false;
  }).catch(function () {});
})();
