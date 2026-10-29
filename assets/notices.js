/* Parish notices: this week's banns of crowning, baptisms, the departed and the notices read after the Sunday
   Qurbana. The week (Sunday to Saturday, Irad Time) seeds the choice, so everyone sees the same sheet and it changes
   by itself every Sunday. Initials only, as the cathedral office publishes them. */
(function () {
  "use strict";
  var el = document.getElementById("notices");
  if (!el) return;
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAY = 86400000, now = Date.now() + 6 * 3600000, day = Math.floor(now / DAY), sunday = day - ((day + 4) % 7);   // 4 Jan 1970 was a Sunday
  var r = rng(sunday * 13 + 5);
  function pick(a) { return a[Math.floor(r() * a.length)]; }
  function ini() { var L = "AABBDEGGIJKKKLMMNNOPRSSSTTUZ"; return pick(L.split("")) + "." + pick(L.split("")) + "."; }
  function date(n) { var d = new Date(n * DAY); return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()]; }
  var PARISH = ["of this parish", "of this parish", "of this parish", "of the parish of St. Yuhanna, Talas", "of the parish of St. Tomas, Talas",
                "of the Lower Town", "of Kyzyl-Adyr", "of the parish in Nurzhan", "of Tash-Kömür", "now living in Almaty", "now living in Moscow"];
  var PLACE = ["Iyık Janyl", "Iyık Janyl", "the Lower Town", "Talas", "Kyzyl-Adyr", "Sary-Bulak", "Toktogul", "Kara-Buura"];
  var BANNS = ["first", "second", "third"];
  var NOTICES = [
    "The cathedral heating fund: the second collection today is for coal for the winter. Last year’s fund paid for 38 tonnes.",
    "Choir rehearsal on Thursday at 18:30 in the old library. New voices, especially men, are welcome.",
    "The parish walk to the Ruins of Old Iyık Janyl leaves from the esplanade on Saturday at 8:00. Bring water and a hat.",
    "Volunteers are needed at the Pilgrimage Hostel kitchen on weekday mornings. Please speak to the hostel warden after the Qurbana.",
    "Lost property: a child’s blue hat and a pair of reading glasses were found in the north aisle. Ask at the candle desk.",
    "Classes for adults preparing for baptism begin on the first Tuesday of the month at 18:30 in the seminary.",
    "The candle desk will be closed on Monday morning for stocktaking.",
    "Couples who intend to be crowned in the coming season are asked to see the rector at least three months before the date.",
    "The parish library is open after the 9:30 Qurbana. Please return books borrowed before the summer.",
    "A requiem Qurbana for all the departed of the parish is offered on the first Saturday of each month at 7:00.",
    "The road to Cathedral Hill will be closed to cars on Sunday morning for repairs; please use the steps from Cathedral Street.",
    "Sunday school meets after the 9:30 Qurbana in the crypt hall. Parents are asked to collect children by 12:00.",
    "The St. Ephrem Seminary thanks the parishioners of Kyzyl-Adyr for the gift of flour.",
    "Please do not leave offerings of milk or ribbons inside the church; the shrine trees are on the esplanade.",
    "Blessing of homes: families who wish a priest to bless their home this season may write their address in the book at the candle desk.",
    "The cathedral office will be closed on Friday afternoon. Urgent matters: the duty priest, +996-39-6-22-14-31.",
    "Thank you to everyone who helped to clean the cathedral before the feast. Next cleaning: Saturday at 14:00."
  ];
  var nb = 1 + Math.floor(r() * 3), banns = [];
  for (var i = 0; i < nb; i++) banns.push("<li>" + ini() + ", " + pick(PARISH) + ", and " + ini() + ", " + pick(PARISH) + ". For the " + pick(BANNS) + " time of asking.</li>");
  var bap = [], nbap = Math.floor(r() * 4);
  for (i = 0; i < nbap; i++) bap.push("<li>" + ini() + ", " + pick(["son", "daughter"]) + " of " + ini() + " and " + ini() + ", " + pick(PLACE) + "</li>");
  var dep = [], ndep = 1 + Math.floor(r() * 4);
  for (i = 0; i < ndep; i++) dep.push("<li>" + ini() + ", " + (58 + Math.floor(r() * 36)) + ", " + pick(PLACE) + "</li>");
  var pool = NOTICES.slice(), ns = [];
  for (i = 0; i < 4; i++) ns.push("<li>" + pool.splice(Math.floor(r() * pool.length), 1)[0] + "</li>");
  el.innerHTML =
    '<p class="small">Read after the Holy Qurbana on Sunday ' + date(sunday) + ". Published by the cathedral office.</p>" +
    "<h2>Banns of crowning</h2><p>If any of you knows a just cause why these persons should not be joined in Holy Crowning, you are to declare it to the rector.</p><ul>" + banns.join("") + "</ul>" +
    "<h2>Baptised this week</h2>" + (bap.length ? "<ul>" + bap.join("") + "</ul>" : "<p>None this week.</p>") +
    "<h2>Pray for the departed</h2><ul>" + dep.join("") + "</ul><p class=\"small\">Funerals are arranged through the cathedral office. Names are published by initials only.</p>" +
    "<h2>Notices</h2><ul>" + ns.join("") + "</ul>";
})();
