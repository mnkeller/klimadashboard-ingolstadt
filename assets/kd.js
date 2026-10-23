/* Klimadashboard Ingolstadt
 *
 * Alle Seiten bestehen aus Bausteinen ("Module"): ein Element mit
 * data-modul="name" wird beim Laden mit dem passenden Modul gefuellt. Dieselben
 * Module laufen einzeln in einbetten.html?modul=name, zum Einbinden in
 * WordPress per iframe.
 *
 * Daten kommen aus data/klima.js (window.KLIMA_DATEN) und data/wetter.js
 * (window.WETTER_DATEN), erzeugt von scraper/klima_bauen.py und
 * scraper/wetter_holen.py. Die Seite selbst stellt keine Anfragen an fremde
 * Server.
 */
(function () {
  "use strict";

  var D = window.KLIMA_DATEN;
  var W = window.WETTER_DATEN;
  var B = D && D.bericht;
  var S = D && D.stadt;  // Bilanz und Pfade der Stabsstelle Klima, CC BY 4.0

  var FARBE = {
    blau: "#4c4dee", orange: "#e65c2a", lila: "#974cda", gelb: "#f0be50",
    dunkel: "#212121", gruen: "#c2f35e", hellgruen: "#e0fa7a", leise: "#4a4b8f",
    gitter: "rgba(76, 77, 238, .14)",
  };

  /* ---------------- Formatierung ---------------- */
  function zahl(n, stellen) {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: stellen || 0, maximumFractionDigits: stellen || 0,
    }).format(n);
  }
  function vz(n, stellen) { return (n > 0 ? "+" : n < 0 ? "−" : "±") + zahl(Math.abs(n), stellen); }
  function mwp(kw, stellen) { return zahl(kw / 1000, stellen === undefined ? 1 : stellen) + " MWp"; }
  function datum(iso) { return new Date(iso).toLocaleDateString("de-DE"); }
  function el(tag, klasse, html) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function link(url, text) {
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + "</a>";
  }

  /* ---------------- Daten vorbereiten ---------------- */
  var K, REF, volle, letztesVolles, laufend, solar, solarJetzt, speicher, aktuellesJahr;
  if (D) {
    K = D.klima;
    REF = K.referenz;
    volle = K.jahre.filter(function (z) { return z.vollstaendig; });
    letztesVolles = volle[volle.length - 1];
    laufend = K.jahre[K.jahre.length - 1].vollstaendig ? null : K.jahre[K.jahre.length - 1];
    solar = D.solar.reihe;
    solarJetzt = solar[solar.length - 1];
    speicher = D.speicher.reihe;
    aktuellesJahr = solarJetzt.jahr;
  }
  function jahr(reihe, j) { return reihe.filter(function (z) { return z.jahr === j; })[0]; }
  function pvZiel() { return S.fahrplan.ziele_2035.pv_dach_kwp + S.fahrplan.ziele_2035.pv_freiflaeche_kwp; }
  function bilanzJetzt() { return S.thg.werte[S.thg.werte.length - 1]; }
  // CC BY 4.0 verlangt Urheber und Lizenz bei jeder Verwendung.
  function quelleStadt(was) {
    return (was || "Energie- und THG-Bilanz") + " der " + S.quelle + " (" + link(S.lizenz_url, S.lizenz) + ")";
  }

  /* ---------------- ECharts im 2035-CI ---------------- */
  var THEMA = "kd2035";
  if (window.echarts) {
    echarts.registerTheme(THEMA, {
      color: [FARBE.blau, FARBE.orange, FARBE.lila, FARBE.gelb, FARBE.dunkel],
      backgroundColor: "transparent",
      textStyle: { fontFamily: "Poppins, Arial, sans-serif", color: FARBE.leise },
      categoryAxis: {
        axisLine: { lineStyle: { color: FARBE.blau } }, axisTick: { show: false },
        axisLabel: { color: FARBE.leise }, splitLine: { show: false },
      },
      valueAxis: {
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: FARBE.leise }, splitLine: { lineStyle: { color: FARBE.gitter } },
      },
      legend: { textStyle: { color: FARBE.blau }, icon: "roundRect", itemWidth: 14, itemHeight: 10, itemGap: 18 },
      tooltip: {
        backgroundColor: "#fff", borderColor: FARBE.blau, borderWidth: 1,
        textStyle: { color: FARBE.dunkel, fontFamily: "Poppins, Arial, sans-serif", fontSize: 13 },
      },
    });
  }
  var diagramme = [];
  function diagramm(container, option, klasse) {
    var box = el("div", "diagramm" + (klasse ? " " + klasse : ""));
    container.appendChild(box);
    var chart = echarts.init(box, THEMA, { renderer: "svg" });
    chart.setOption(option);
    diagramme.push(chart);
    return chart;
  }
  window.addEventListener("resize", function () { diagramme.forEach(function (c) { c.resize(); }); });

  // Schraffur fuer vorlaeufige Werte (laufendes Jahr), nicht nur ueber die Farbe erkennbar
  var SCHRAFFUR = {
    symbol: "rect", symbolSize: 1, rotation: -Math.PI / 4,
    dashArrayX: [1, 0], dashArrayY: [3, 4], color: "rgba(255,255,255,.7)",
  };
  function raster(extra) {
    var r = { left: 8, right: 16, top: 36, bottom: 8, containLabel: true };
    for (var k in extra) r[k] = extra[k];
    return r;
  }
  function umschalter(container, optionen, aktiv, beiWahl) {
    var leiste = el("div", "umschalter");
    leiste.setAttribute("role", "group");
    optionen.forEach(function (o) {
      var b = el("button", "", o.text);
      b.type = "button";
      b.setAttribute("aria-pressed", o.id === aktiv ? "true" : "false");
      b.addEventListener("click", function () {
        leiste.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        beiWahl(o.id);
      });
      leiste.appendChild(b);
    });
    container.appendChild(leiste);
  }

  /* ================================================================
     Module
     ================================================================ */
  var MODULE = {};

  /* ---------- Kennzahlen ---------- */
  MODULE.kennzahlen = {
    karte: false,
    bau: function (ziel) {
      var thg = S.thg;
      var kacheln = [
        ["Jahresmittel " + letztesVolles.jahr, zahl(letztesVolles.mitteltemperatur, 1) + " °C",
          vz(letztesVolles.abweichung, 1) + " °C gegenüber " + REF.von + "–" + REF.bis],
        ["Heiße Tage " + (laufend ? laufend.jahr + " bisher" : letztesVolles.jahr),
          zahl((laufend || letztesVolles).heisse_tage),
          "früher im Schnitt " + zahl(REF.heisse_tage) + " pro Jahr"],
        ["Solarleistung heute", mwp(solarJetzt.bestand_kw),
          zahl(solarJetzt.bestand_anzahl) + " Anlagen im Stadtgebiet"],
        ["Öffentliche Ladepunkte", zahl(D.laden.ladepunkte), "davon " + zahl(D.laden.schnell) + " Schnellladepunkte"],
        ["CO₂-Minderung pro Jahr", Math.round(thg.minderung_erreicht_t_pro_jahr / thg.minderung_noetig_t_pro_jahr * 100) + " %",
          "des nötigen Tempos für 2035 (Bilanz " + thg.bilanzjahr + ")"],
      ];
      var raster = el("div", "kennzahlen");
      kacheln.forEach(function (k) {
        var d = el("div", "kennzahl");
        d.appendChild(el("p", "k-label", k[0]));
        d.appendChild(el("p", "k-wert", k[1]));
        d.appendChild(el("p", "k-unter", k[2]));
        raster.appendChild(d);
      });
      ziel.appendChild(raster);
    },
  };

  /* ---------- Wetter aktuell ---------- */
  var SYMBOLE = {
    "clear-day": "klar", "clear-night": "klar", "partly-cloudy-day": "teils bewölkt",
    "partly-cloudy-night": "teils bewölkt", "cloudy": "bewölkt", "fog": "Nebel", "wind": "windig",
    "rain": "Regen", "sleet": "Schneeregen", "snow": "Schnee", "hail": "Hagel", "thunderstorm": "Gewitter",
  };
  MODULE.wetter = {
    titel: "Wetter aktuell",
    bau: function (ziel) {
      if (!W) { ziel.appendChild(el("p", "ladehinweis", "Keine Wetterdaten vorhanden.")); return; }
      ziel.appendChild(el("p", "unterzeile", "In Ingolstadt ist es gerade <strong>" + (SYMBOLE[W.symbol] || W.symbol || "") + "</strong>."));
      var box = el("div", "wetter");
      box.appendChild(el("div", "wetter-temp", zahl(W.temperatur, 1) + " °C"));
      var dl = el("dl", "wetter-werte");
      [["Niederschlag", zahl(W.niederschlag_mm_h || 0, 1) + " mm/h"],
       ["Wind", zahl(W.wind_kmh || 0) + " km/h"],
       ["Luftfeuchte", zahl(W.luftfeuchte || 0) + " %"],
       ["Bewölkung", zahl(W.bewoelkung || 0) + " %"]].forEach(function (p) {
        dl.appendChild(el("dt", "", p[0]));
        dl.appendChild(el("dd", "", p[1]));
      });
      box.appendChild(dl);
      ziel.appendChild(box);
      if (W.warnungen.length) {
        W.warnungen.forEach(function (w) {
          ziel.appendChild(el("div", "warnung", "<strong>" + w.ereignis + "</strong><br>" + (w.titel || "")));
        });
      } else {
        ziel.appendChild(el("p", "keine-warnung", "Keine amtlichen Unwetterwarnungen für Ingolstadt."));
      }
      ziel.appendChild(el("p", "fuss", "Stand " + new Date(W.zeitpunkt).toLocaleString("de-DE", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) +
        " Uhr, Station " + W.station + ". Quelle: Deutscher Wetterdienst über " + link(W.quelle, "Bright Sky") + "."));
    },
  };

  /* ---------- Temperatur: Abweichung / Klimastreifen ---------- */
  var STREIFEN = ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7",
    "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"];
  function streifenFarbe(abw) {
    return STREIFEN[Math.max(0, Math.min(STREIFEN.length - 1, Math.floor(abw / 0.35) + 8))];
  }
  MODULE.temperatur = {
    weiss: true,
    titel: "Es wird wärmer",
    bau: function (ziel, opt) {
      ziel.appendChild(el("p", "unterzeile", "Jahresmitteltemperatur im Vergleich zum Mittel " + REF.von + "–" + REF.bis +
        " (" + zahl(REF.mitteltemperatur, 1) + " °C). Blau: kälter, rot: wärmer."));
      var chart;
      function option(art) {
        var streifen = art === "streifen";
        return {
          grid: raster({ top: 10, left: streifen ? 0 : 8, right: streifen ? 0 : 16 }),
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) {
            var z = volle[p[0].dataIndex];
            return "<strong>" + z.jahr + "</strong><br>" + zahl(z.mitteltemperatur, 1) + " °C (" + vz(z.abweichung, 1) + " °C)";
          } },
          xAxis: { type: "category", data: volle.map(function (z) { return z.jahr; }),
            axisLine: { show: !streifen }, axisLabel: { interval: function (i, j) { return j % 10 === 0; } } },
          yAxis: { type: "value", show: !streifen, min: streifen ? 0 : undefined, max: streifen ? 1 : undefined,
            axisLabel: { formatter: function (v) { return vz(v, 1) + " °C"; } } },
          series: [{ type: "bar", barCategoryGap: streifen ? 0 : "20%",
            data: volle.map(function (z) {
              return { value: streifen ? 1 : z.abweichung, itemStyle: { color: streifenFarbe(z.abweichung) } };
            }),
          }],
        };
      }
      if (!opt.klein) {
        umschalter(ziel, [{ id: "balken", text: "Abweichung" }, { id: "streifen", text: "Klimastreifen" }], "balken",
          function (art) { chart.setOption(option(art), true); });
      }
      chart = diagramm(ziel, option(opt.klein ? "streifen" : "balken"), opt.klein ? "klein" : "");
      var waermste = volle.slice().sort(function (a, b) { return b.mitteltemperatur - a.mitteltemperatur; })
        .slice(0, 5).map(function (z) { return z.jahr; });
      ziel.appendChild(el("p", "fuss", "Die fünf wärmsten Jahre seit " + volle[0].jahr + ": " + waermste.join(", ") +
        ". Quelle: Deutscher Wetterdienst, Station " + K.station + " (dieselbe wie im Fortschrittsbericht der Stadt)."));
    },
  };

  /* ---------- Kenntage ---------- */
  var KENNTAGE = [
    { id: "heisse_tage", text: "Heiße Tage", erkl: "Höchsttemperatur 30 °C oder mehr", farbe: FARBE.orange },
    { id: "sommertage", text: "Sommertage", erkl: "Höchsttemperatur 25 °C oder mehr", farbe: FARBE.gelb },
    { id: "tropennaechte", text: "Tropennächte", erkl: "Tiefsttemperatur nicht unter 20 °C", farbe: FARBE.lila },
    { id: "frosttage", text: "Frosttage", erkl: "Tiefsttemperatur unter 0 °C", farbe: FARBE.blau },
  ];
  MODULE.kenntage = {
    weiss: true,
    titel: "Die Tage werden heißer",
    bau: function (ziel) {
      var unter = el("p", "unterzeile");
      ziel.appendChild(unter);
      var chart;
      function option(id) {
        var k = KENNTAGE.filter(function (x) { return x.id === id; })[0];
        unter.innerHTML = "<strong>" + k.text + "</strong> pro Jahr: " + k.erkl + ". Gestrichelt: Durchschnitt " + REF.von + "–" + REF.bis + ".";
        return {
          grid: raster({ bottom: 44 }),
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) {
            var z = K.jahre[p[0].dataIndex];
            return "<strong>" + z.jahr + "</strong>" + (z.vollstaendig ? "" : " (bis " + z.bis + ", vorläufig)") +
              "<br>" + k.text + ": " + z[id];
          } },
          dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 8, borderColor: "transparent",
            fillerColor: "rgba(76,77,238,.15)", handleStyle: { color: FARBE.blau }, textStyle: { color: FARBE.leise } }],
          xAxis: { type: "category", data: K.jahre.map(function (z) { return z.jahr; }) },
          yAxis: { type: "value", minInterval: 1 },
          series: [{
            type: "bar", name: k.text,
            data: K.jahre.map(function (z) {
              return { value: z[id], itemStyle: { color: k.farbe, decal: z.vollstaendig ? null : SCHRAFFUR } };
            }),
            markLine: { symbol: "none", silent: true, lineStyle: { color: FARBE.dunkel, type: "dashed" },
              label: { formatter: "Ø " + zahl(REF[id], 1), color: FARBE.dunkel, position: "insideStartTop",
                backgroundColor: "rgba(255,255,255,.9)", padding: [2, 5], borderRadius: 4 },
              data: [{ yAxis: REF[id] }] },
          }],
        };
      }
      umschalter(ziel, KENNTAGE.map(function (k) { return { id: k.id, text: k.text }; }), "heisse_tage",
        function (id) { chart.setOption(option(id), true); });
      chart = diagramm(ziel, option("heisse_tage"), "hoch");
      var rekord = volle.slice().sort(function (a, b) { return b.heisse_tage - a.heisse_tage; })[0];
      var neu = laufend && laufend.heisse_tage > rekord.heisse_tage;
      ziel.appendChild(el("p", "fuss",
        (neu ? laufend.jahr + " gab es bis zum " + laufend.bis + " schon " + laufend.heisse_tage +
          " heiße Tage, mehr als im bisherigen Rekordjahr " + rekord.jahr + " (" + rekord.heisse_tage + "). " : "") +
        "Schraffiert: laufendes Jahr, vom DWD teils noch nicht endgültig geprüft. Zum Zoomen ziehen oder scrollen. " +
        "Quelle: Deutscher Wetterdienst, Station " + K.station + "."));
    },
  };

  /* ---------- Emissionen: Tempo der Minderung ---------- */
  MODULE.reduktion = {
    titel: "Auf dem Weg zu 2035",
    bau: function (ziel) {
      var thg = S.thg;
      ziel.appendChild(el("p", "unterzeile", "Durchschnittliche CO₂-Minderung pro Jahr seit " + thg.basisjahr + ", in Tonnen."));
      var max = thg.minderung_noetig_t_pro_jahr;
      [["Nötig für Klimaneutralität 2035", thg.minderung_noetig_t_pro_jahr, "soll"],
       ["Tatsächlich erreicht", thg.minderung_erreicht_t_pro_jahr, ""]].forEach(function (z) {
        var zeile = el("div", "balken-zeile");
        zeile.appendChild(el("div", "b-text", "<span>" + z[0] + "</span><strong>" + zahl(z[1]) + " t</strong>"));
        var b = el("div", "balken " + z[2]);
        var s = el("span");
        s.style.width = (z[1] / max * 100) + "%";
        b.appendChild(s);
        zeile.appendChild(b);
        ziel.appendChild(zeile);
      });
      var w = bilanzJetzt();
      ziel.appendChild(el("p", "fuss", "Bilanz nach BISKO-Standard, Bilanzjahr " + thg.bilanzjahr +
        ". Ausstoß " + w.jahr + ": " + zahl(w.thg_t.summe / 1e6, 2) + " Mio. t CO₂e, davon " +
        Math.round(w.thg_industrie_t / w.thg_t.summe * 100) + " % aus der Industrie. Quelle: " + quelleStadt() + "."));
    },
  };

  /* ---------- Endenergie nach Sektor ---------- */
  MODULE.endenergie = {
    weiss: true,
    titel: "Wofür Energie gebraucht wird",
    bau: function (ziel, opt) {
      var w = bilanzJetzt();
      var e = [["Wärme", w.endenergie_mwh.waerme], ["Strom", w.endenergie_mwh.strom], ["Verkehr", w.endenergie_mwh.verkehr]];
      ziel.appendChild(el("p", "unterzeile", "Endenergieverbrauch " + w.jahr + ", rund " + zahl(w.endenergie_mwh.summe / 1000) + " GWh."));
      diagramm(ziel, {
        tooltip: { trigger: "item", formatter: function (p) { return p.name + ": " + zahl(p.value) + " GWh (" + Math.round(p.percent) + " %)"; } },
        legend: { bottom: 0 },
        color: [FARBE.orange, FARBE.gelb, FARBE.blau],
        series: [{
          type: "pie", radius: ["48%", "78%"], center: ["50%", "45%"], avoidLabelOverlap: true,
          itemStyle: { borderColor: "#fff", borderWidth: 3, borderRadius: 6 },
          label: { formatter: function (p) { return Math.round(p.percent) + " %"; }, color: FARBE.dunkel, fontWeight: 600 },
          data: e.map(function (s) { return { name: s[0], value: Math.round(s[1] / 1000) }; }),
        }],
      }, opt.klein ? "klein" : "");
      ziel.appendChild(el("p", "fuss", "Wärme umfasst Heizung, Warmwasser und Prozesswärme der Industrie. Quelle: " +
        quelleStadt() + "."));
    },
  };

  /* ---------- Photovoltaik ---------- */
  var PV_SERIEN = [
    { feld: "dach", name: "Dächer und Gebäude", farbe: FARBE.gelb },
    { feld: "freiflaeche", name: "Freiflächen", farbe: FARBE.orange },
    { feld: "stecker", name: "Balkonkraftwerke", farbe: FARBE.lila },
  ];
  function pvOption(reihe, art, einheit) {
    return {
      grid: raster({ top: window.innerWidth < 600 ? 62 : 40 }),
      legend: { top: 0, left: 0 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) {
        var z = reihe[p[0].dataIndex];
        var summe = 0;
        var zeilen = p.map(function (x) { summe += x.value; return x.marker + x.seriesName + ": " + zahl(x.value / (einheit === "MWp" ? 1000 : 1), einheit === "MWp" ? 1 : 0) + " " + einheit; });
        return "<strong>" + z.jahr + (z.jahr === aktuellesJahr ? " (bis heute)" : "") + "</strong><br>" + zeilen.join("<br>") +
          "<br><strong>Summe: " + zahl(summe / (einheit === "MWp" ? 1000 : 1), einheit === "MWp" ? 1 : 0) + " " + einheit + "</strong>";
      } },
      xAxis: { type: "category", data: reihe.map(function (z) { return z.jahr; }) },
      yAxis: { type: "value", axisLabel: { formatter: function (v) { return zahl(einheit === "MWp" ? v / 1000 : v); } } },
      series: PV_SERIEN.map(function (s) {
        return {
          type: "bar", stack: "pv", name: s.name, color: s.farbe,
          data: reihe.map(function (z) {
            return { value: z[art + "_kw_" + s.feld], itemStyle: { decal: z.jahr === aktuellesJahr ? SCHRAFFUR : null } };
          }),
        };
      }),
    };
  }
  MODULE["pv-bestand"] = {
    weiss: true,
    titel: "Strom von der Sonne",
    bau: function (ziel, opt) {
      var reihe = solar.filter(function (z) { return z.jahr >= 2005; });
      ziel.appendChild(el("p", "unterzeile", "Installierte Solarleistung am Jahresende in Megawatt-Peak (MWp). Legende anklicken, um Anlagentypen ein- oder auszublenden."));
      diagramm(ziel, pvOption(reihe, "bestand", "MWp"), opt.klein ? "klein" : "");
      var z19 = jahr(solar, 2019);
      ziel.appendChild(el("p", "fuss", "Seit Ende 2019 von " + mwp(z19.bestand_kw) + " auf " + mwp(solarJetzt.bestand_kw) +
        ", " + zahl(solarJetzt.bestand_anzahl) + " Anlagen. Zusätzlich " + mwp(D.solar.in_planung_kw) +
        " in Planung gemeldet. Schraffiert: laufendes Jahr. Quelle: " + link(D.solar.quelle, "Marktstammdatenregister") + "."));
    },
  };
  MODULE["pv-zubau"] = {
    weiss: true,
    titel: "Neue Solaranlagen pro Jahr",
    bau: function (ziel) {
      var reihe = solar.filter(function (z) { return z.jahr >= 2010; });
      ziel.appendChild(el("p", "unterzeile", "Neu in Betrieb genommene Leistung je Jahr, in Kilowatt-Peak."));
      diagramm(ziel, pvOption(reihe, "zubau", "kWp"));
      var stecker = reihe.reduce(function (s, z) { return s + z.zubau_anzahl_stecker; }, 0);
      ziel.appendChild(el("p", "fuss", "Seit 2010 wurden " + zahl(stecker) + " Balkonkraftwerke angemeldet: zahlreich, aber klein. " +
        "Quelle: " + link(D.solar.quelle, "Marktstammdatenregister") + "."));
    },
  };
  MODULE["pv-ziel"] = {
    titel: "Solarziel 2035",
    bau: function (ziel) {
      var z = pvZiel();
      var anteil = solarJetzt.bestand_kw / z;
      ziel.appendChild(el("p", "unterzeile", "Wie viel des Ausbauziels heute installiert ist."));
      [["Heute installiert", solarJetzt.bestand_kw, ""], ["Ziel 2035", z, "soll"]].forEach(function (r) {
        var zeile = el("div", "balken-zeile");
        zeile.appendChild(el("div", "b-text", "<span>" + r[0] + "</span><strong>" + mwp(r[1], 0) + "</strong>"));
        var b = el("div", "balken " + r[2]);
        var s = el("span");
        s.style.width = (r[1] / z * 100) + "%";
        b.appendChild(s);
        zeile.appendChild(b);
        ziel.appendChild(zeile);
      });
      ziel.appendChild(el("p", "fuss", Math.round(anteil * 100) + " % erreicht. Ziel laut " +
        quelleStadt("Reduktionsfahrplan") + ": " + mwp(S.fahrplan.ziele_2035.pv_dach_kwp, 0) + " auf Dächern und " +
        mwp(S.fahrplan.ziele_2035.pv_freiflaeche_kwp, 0) + " auf Freiflächen."));
    },
  };
  MODULE.speicher = {
    weiss: true,
    titel: "Stromspeicher",
    bau: function (ziel) {
      var reihe = speicher.filter(function (z) { return z.jahr >= 2013; });
      ziel.appendChild(el("p", "unterzeile", "Nutzbare Speicherkapazität am Jahresende, in Megawattstunden."));
      diagramm(ziel, {
        grid: raster(),
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) {
          var z = reihe[p[0].dataIndex];
          return "<strong>" + z.jahr + "</strong><br>" + zahl(z.bestand_anzahl) + " Speicher<br>" +
            zahl(z.bestand_kwh / 1000, 1) + " MWh Kapazität<br>" + zahl(z.bestand_kw / 1000, 1) + " MW Leistung";
        } },
        xAxis: { type: "category", data: reihe.map(function (z) { return z.jahr; }) },
        yAxis: { type: "value", axisLabel: { formatter: function (v) { return zahl(v / 1000); } } },
        series: [{ type: "bar", color: FARBE.lila, data: reihe.map(function (z) {
          return { value: z.bestand_kwh, itemStyle: { decal: z.jahr === aktuellesJahr ? SCHRAFFUR : null } };
        }) }],
      });
      var j = speicher[speicher.length - 1];
      ziel.appendChild(el("p", "fuss", zahl(j.bestand_anzahl) + " Speicher mit " + zahl(j.bestand_kw / 1000, 1) +
        " MW Leistung, fast alle Heimspeicher neben Solaranlagen. Quelle: " + link(D.speicher.quelle, "Marktstammdatenregister") + "."));
    },
  };

  /* ---------- Mobilitaet ---------- */
  MODULE.ladepunkte = {
    weiss: true,
    titel: "Laden statt tanken",
    bau: function (ziel, opt) {
      var L = D.laden;
      var reihe = L.reihe.filter(function (z) { return z.jahr >= 2012; });
      ziel.appendChild(el("p", "unterzeile", "Öffentliche Ladepunkte, die heute in Betrieb sind, nach Jahr der Inbetriebnahme."));
      diagramm(ziel, {
        grid: raster({ top: 44 }),
        legend: { top: 0, left: 0 },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        xAxis: { type: "category", data: reihe.map(function (z) { return z.jahr; }) },
        yAxis: { type: "value" },
        series: [
          { type: "bar", name: "Bestand", color: FARBE.blau, data: reihe.map(function (z) {
            return { value: z.bestand, itemStyle: { decal: z.jahr === aktuellesJahr ? SCHRAFFUR : null } };
          }) },
          { type: "bar", name: "Neu im Jahr", color: FARBE.orange, data: reihe.map(function (z) { return z.zubau; }) },
        ],
      }, opt.klein ? "klein" : "");
      ziel.appendChild(el("p", "fuss", zahl(L.ladepunkte) + " Ladepunkte an " + zahl(L.einrichtungen) +
        " Standorten, davon " + zahl(L.schnell) + " Schnellladepunkte. Der Sprung 2023 kommt vor allem aus öffentlichen Parkhäusern. " +
        "Quelle: " + link(L.quelle, "Ladesäulenregister der Bundesnetzagentur") + ", Stand " + L.stand + "."));
    },
  };
  MODULE.verkehr = {
    titel: "Verkehr in Zahlen",
    bau: function (ziel) {
      var v = B.verkehr, bus = B.busse;
      var raster = el("div", "kennzahlen");
      [["Zugelassene Pkw", zahl(v.pkw_bestand), "Stand " + v.pkw_bestand_stichtag],
       ["Fahrzeuge je 1.000 Einwohner", "~" + zahl(v.fahrzeuge_je_1000), "eine der höchsten Dichten in Deutschland"],
       ["Ziel E-Fahrzeuge 2035", zahl(v.e_fahrzeuge_ziel_2035), "laut Fortschrittsbericht"],
       ["E-Busse Stadtbus", bus.sbi_e_busse + " von " + bus.sbi_linienbusse,
         bus.sbi_e_busse_in_beschaffung + " weitere bestellt; mit Partnern " + bus.mit_partnern_e_busse + " von rund " + bus.mit_partnern_linienbusse_ca],
       ["Fahrradstraßen", zahl(B.rad.fahrradstrassen_km) + " km", "im Stadtgebiet"]].forEach(function (k) {
        var d = el("div", "kennzahl");
        d.style.background = "#fff";
        d.appendChild(el("p", "k-label", k[0]));
        d.appendChild(el("p", "k-wert", k[1]));
        d.appendChild(el("p", "k-unter", k[2]));
        raster.appendChild(d);
      });
      ziel.appendChild(raster);
      ziel.appendChild(el("p", "fuss", "Quelle: " + link(B.berichte["2025"].url, "Fortschrittsbericht 2025") +
        "; Busse und Fahrradstraßen: " + B.berichte.auskunft_2026.titel + ", " + B.berichte.auskunft_2026.stand +
        ". Ein aktueller Modal Split ist angekündigt, Fahrgastzahlen liegen bei der Stadt nicht vor."));
    },
  };

  /* ---------- Emissionen: Zeitreihe nach Sektor mit Pfad ---------- */
  MODULE["thg-zeitreihe"] = {
    weiss: true,
    titel: "Treibhausgase seit 2019",
    bau: function (ziel, opt) {
      var thg = S.thg;
      var jahre = thg.pfad.map(function (p) { return p.jahr; });
      function ist(feld) {
        return jahre.map(function (j) {
          var w = jahr(thg.werte, j);
          return w ? Math.round(w.thg_t[feld] / 1000) : null;
        });
      }
      ziel.appendChild(el("p", "unterzeile", "Ausstoß in Kilotonnen CO₂e (kt): gemessen bis " + thg.bilanzjahr +
        ", danach der Zielpfad und die Hochrechnung der Stadt."));
      var mobil = window.innerWidth < 600;
      diagramm(ziel, {
        grid: raster({ top: mobil ? 62 : 40 }),
        legend: { top: 0, left: 0 },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: function (v) { return v == null ? "–" : zahl(v) + " kt"; } },
        xAxis: { type: "category", data: jahre },
        yAxis: { type: "value", axisLabel: { formatter: function (v) { return zahl(v); } } },
        series: [
          { type: "bar", stack: "thg", name: "Wärme", color: FARBE.orange, data: ist("waerme") },
          { type: "bar", stack: "thg", name: "Strom", color: FARBE.gelb, data: ist("strom") },
          { type: "bar", stack: "thg", name: "Verkehr", color: FARBE.blau, data: ist("verkehr") },
          { type: "line", name: "Zielpfad (IKSK)", color: FARBE.dunkel, symbol: "none", lineStyle: { width: 2 },
            data: thg.pfad.map(function (p) { return Math.round(p.soll_t / 1000); }) },
          { type: "line", name: "Hochrechnung", color: FARBE.lila, symbol: "none", lineStyle: { width: 2, type: "dashed" },
            data: thg.pfad.map(function (p) { return p.hochrechnung_t == null ? null : Math.round(p.hochrechnung_t / 1000); }) },
        ],
      }, opt.klein ? "klein" : "");
      var p35 = jahr(thg.pfad, 2035);
      ziel.appendChild(el("p", "fuss", "Die Hochrechnung der Stadt liegt 2035 bei " + zahl(p35.hochrechnung_t / 1000) +
        " kt, der Zielpfad bei " + zahl(p35.soll_t / 1000) + " kt. Nur " + jahre[0] + " bis " + thg.bilanzjahr +
        " sind gemessene Werte. Quelle: " + quelleStadt() + "."));
    },
  };

  /* ---------- Erneuerbare: Stromverbrauch gegen lokale Erzeugung ---------- */
  MODULE["strom-ee"] = {
    weiss: true,
    titel: "Strom: Verbrauch und lokale Erzeugung",
    bau: function (ziel, opt) {
      var reihe = S.strom.werte;
      var jetzt = reihe[reihe.length - 1];
      ziel.appendChild(el("p", "unterzeile", "Stromverbrauch und Erzeugung aus erneuerbaren Quellen in Ingolstadt, in Gigawattstunden (GWh)."));
      function gwh(feld) { return reihe.map(function (z) { return Math.round(z.ee_mwh[feld] / 1000); }); }
      diagramm(ziel, {
        grid: raster({ top: window.innerWidth < 600 ? 62 : 40 }),
        legend: { top: 0, left: 0 },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: function (v) { return zahl(v) + " GWh"; } },
        xAxis: { type: "category", data: reihe.map(function (z) { return z.jahr; }) },
        yAxis: { type: "value", axisLabel: { formatter: function (v) { return zahl(v); } } },
        series: [
          { type: "bar", stack: "ee", name: "Wasserkraft", color: FARBE.blau, data: gwh("wasser") },
          { type: "bar", stack: "ee", name: "Solarstrom", color: FARBE.gelb, data: gwh("pv") },
          { type: "bar", stack: "ee", name: "Biomasse", color: FARBE.lila, data: gwh("biomasse") },
          { type: "line", name: "Stromverbrauch", color: FARBE.dunkel, symbolSize: 7, lineStyle: { width: 2 },
            data: reihe.map(function (z) { return Math.round(z.verbrauch_mwh / 1000); }) },
        ],
      }, opt.klein ? "klein" : "");
      ziel.appendChild(el("p", "fuss", jetzt.jahr + " deckten lokale erneuerbare Quellen " +
        String(jetzt.ee_anteil_prozent).replace(".", ",") + " % des Stromverbrauchs. " + S.strom.hinweis +
        " Quelle: " + quelleStadt() + "."));
    },
  };

  /* ================================================================
     Waerme (Daten der Stabsstelle Klima, CC BY 4.0)
     ================================================================ */
  var HEIZ = [
    { feld: "gas", name: "Gas", farbe: FARBE.orange },
    { feld: "oel", name: "Öl", farbe: FARBE.dunkel },
    { feld: "fernwaerme", name: "Fernwärme", farbe: FARBE.blau },
    { feld: "biomasse", name: "Biomasse", farbe: FARBE.gelb },
    { feld: "strom", name: "Strom", farbe: FARBE.lila },
  ];

  MODULE.fernwaerme = {
    weiss: true,
    titel: "Fernwärmenetz",
    bau: function (ziel, opt) {
      var f = S.fahrplan.fernwaerme.filter(function (z) { return z.jahr >= 2009; });
      var pfad = S.fahrplan.plan_ab;
      var letztIst = f.filter(function (z) { return z.art === "ist"; }).pop();
      ziel.appendChild(el("p", "unterzeile", "Länge der Fernwärmetrasse in Kilometern. Ab " + pfad + " zeigt das Diagramm den Ausbaupfad der Stadt."));
      diagramm(ziel, {
        grid: raster({ top: 16 }),
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) {
          var z = f[p[0].dataIndex];
          return "<strong>" + z.jahr + (z.art === "pfad" ? " (Pfad)" : "") + "</strong><br>" + zahl(z.km, 1) + " km" +
            (z.zubau_km ? "<br>+" + zahl(z.zubau_km, 1) + " km im Jahr" : "");
        } },
        xAxis: { type: "category", data: f.map(function (z) { return z.jahr; }) },
        yAxis: { type: "value", axisLabel: { formatter: function (v) { return zahl(v); } } },
        series: [{
          type: "bar", color: FARBE.blau,
          data: f.map(function (z) {
            return { value: z.km, itemStyle: z.art === "pfad" ? { decal: SCHRAFFUR, opacity: .75 } : {} };
          }),
        }],
      }, opt.klein ? "klein" : "");
      ziel.appendChild(el("p", "fuss", zahl(letztIst.km, 1) + " km im Jahr " + letztIst.jahr + ", Ziel " +
        zahl(S.fahrplan.ziele_2035.fernwaerme_km) + " km im Jahr 2035, also rund " +
        zahl((S.fahrplan.ziele_2035.fernwaerme_km - letztIst.km) / (2035 - letztIst.jahr), 1) +
        " km mehr pro Jahr. Schraffiert: Pfad, keine gemessenen Werte. Quelle: " + quelleStadt("Reduktionsfahrplan") + "."));
    },
  };

  MODULE.heizungsarten = {
    weiss: true,
    titel: "Womit Gebäude heizen",
    bau: function (ziel, opt) {
      var g = S.gebaeude;
      var spalten = [["Heute", g.heute.summe], ["Szenario 2035", g.ziel_2035.summe]];
      ziel.appendChild(el("p", "unterzeile", "Anzahl der Gebäude nach Heizungsart, heute und im Wärmenetzausbauplan der Stadt für 2035."));
      diagramm(ziel, {
        grid: raster({ top: 40, left: 8 }),
        legend: { top: 0, left: 0 },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: function (v) { return zahl(v) + " Gebäude"; } },
        xAxis: { type: "value", axisLabel: { formatter: function (v) { return zahl(v); } } },
        yAxis: { type: "category", inverse: true, data: spalten.map(function (s) { return s[0]; }) },
        series: HEIZ.map(function (h) {
          return { type: "bar", stack: "heiz", name: h.name, color: h.farbe, barMaxWidth: 56,
            data: spalten.map(function (s) { return s[1][h.feld]; }) };
        }),
      }, opt.klein ? "klein" : "");
      var ges = HEIZ.reduce(function (s, h) { return s + g.heute.summe[h.feld]; }, 0);
      ziel.appendChild(el("p", "fuss", "Heute heizen " + Math.round((g.heute.summe.gas + g.heute.summe.oel) / ges * 100) +
        " % der " + zahl(ges) + " Gebäude mit Gas oder Öl. Die Spalte 2035 ist ein Szenario mit Wärmenetzausbau, keine Prognose. " +
        "Quelle: " + quelleStadt("Reduktionsfahrplan, Gebäudeübersicht") + "."));
    },
  };

  var NEUBAU = [
    { feld: "waermepumpe", name: "Wärmepumpe", farbe: FARBE.lila },
    { feld: "fernwaerme", name: "Fernwärme", farbe: FARBE.blau },
    { feld: "gas", name: "Gas", farbe: FARBE.orange },
    { feld: "biomasse", name: "Biomasse", farbe: FARBE.gelb },
    { feld: "stromdirekt", name: "Stromdirektheizung", farbe: FARBE.leise },
    { feld: "solarthermie", name: "Solarthermie", farbe: FARBE.gruen },
    { feld: "oel", name: "Öl", farbe: FARBE.dunkel },
    { feld: "sonstige", name: "Sonstige", farbe: "#9a9ac8" },
  ];
  MODULE.neubau = {
    weiss: true,
    titel: "Heizung im Neubau",
    bau: function (ziel, opt) {
      ziel.appendChild(el("p", "unterzeile", "Anteil der Energieträger bei fertiggestellten Neubauten, in Prozent."));
      var chart;
      function option(wer) {
        var reihe = S.neubau[wer];
        return {
          grid: raster({ top: window.innerWidth < 600 ? 110 : 74 }),
          legend: { top: 0, left: 0 },
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: function (v) { return zahl(v, 1) + " %"; } },
          xAxis: { type: "category", data: reihe.map(function (z) { return z.jahr; }) },
          yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value} %" } },
          series: NEUBAU.map(function (n) {
            return { type: "bar", stack: "nb", name: n.name, color: n.farbe, data: reihe.map(function (z) { return z[n.feld]; }) };
          }),
        };
      }
      umschalter(ziel, [{ id: "ingolstadt", text: "Ingolstadt" }, { id: "bund", text: "Deutschland" }], "ingolstadt", function (wer) {
        chart.setOption(option(wer), true);
      });
      chart = diagramm(ziel, option("ingolstadt"), opt.klein ? "klein" : "");
      var i = S.neubau.ingolstadt[S.neubau.ingolstadt.length - 1];
      var b = S.neubau.bund[S.neubau.bund.length - 1];
      ziel.appendChild(el("p", "fuss", i.jahr + " bekamen " + zahl(i.waermepumpe + i.fernwaerme) + " % der neuen Gebäude in Ingolstadt eine Wärmepumpe oder Fernwärme" +
        " (Deutschland: " + zahl(b.waermepumpe + b.fernwaerme) + " %). Auswertung der Baufertigstellungen ohne Passivhäuser. " +
        "Quelle: " + quelleStadt("Reduktionsfahrplan") + "."));
    },
  };

  MODULE.waermepumpen = {
    weiss: true,
    titel: "Geförderte Wärmepumpen",
    bau: function (ziel, opt) {
      var wp = S.waermepumpen;
      var reihe = wp.werte;
      ziel.appendChild(el("p", "unterzeile", "Wärmepumpen, für die der Bund eine Förderung ausgezahlt hat, nach Jahr der Auszahlung."));
      diagramm(ziel, {
        grid: raster({ top: 16 }),
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) {
          var z = reihe[p[0].dataIndex];
          return "<strong>" + z.jahr + (z.bis ? " (" + z.bis + ")" : "") + "</strong><br>" + zahl(z.anzahl) + " geförderte Wärmepumpen";
        } },
        xAxis: { type: "category", data: reihe.map(function (z) { return z.jahr; }) },
        yAxis: { type: "value", minInterval: 1 },
        series: [{ type: "bar", color: FARBE.lila,
          data: reihe.map(function (z) { return { value: z.anzahl, itemStyle: { decal: z.bis ? SCHRAFFUR : null } }; }) }],
      }, opt.klein ? "klein" : "");
      var summe = reihe.reduce(function (s, z) { return s + z.anzahl; }, 0);
      ziel.appendChild(el("p", "fuss", "Zusammen " + zahl(summe) + " Förderfälle seit " + reihe[0].jahr + ". Das ist eine Untergrenze, kein Bestand: " +
        "Nicht geförderte Anlagen fehlen, und die Auswertung der BAFA nennt in der Überschrift nur die Postleitzahl " + wp.plz +
        ". Schraffiert: laufendes Jahr (" + reihe[reihe.length - 1].bis + "). Stand der Auswertung " + wp.stand + ". Quelle: " +
        quelleStadt("Auswertung der BAFA-Förderungen") + "."));
    },
  };

  /* ---------- Karte: Eignungsgebiete der Waermeplanung ---------- */
  var EIGNUNG_FARBEN = {
    waermenetz: "#e65c2a", waermenetz_gering: "#f0be50", gas_waermepumpe: "#974cda", waermepumpe: "#4c4dee",
  };
  var EIGNUNG_REIHE = ["waermepumpe", "gas_waermepumpe", "waermenetz_gering", "waermenetz"]; // spaeter = obenauf
  function ladeEignung(fertig) {
    if (window.KD_EIGNUNG) return fertig();
    var s = document.createElement("script");
    s.src = "data/eignungsgebiete.js";
    s.onload = fertig;
    s.onerror = function () { fertig(); };
    document.head.appendChild(s);
  }
  MODULE.eignungsgebiete = {
    weiss: true,
    titel: "Wo Wärmenetze und Wärmepumpen passen",
    bau: function (ziel, opt) {
      ziel.appendChild(el("p", "unterzeile", "Arbeitsstand der Stadt vom Januar 2025: Welche Gebiete sich für ein Wärmenetz eignen und wo Wärmepumpen oder Gas zu prüfen sind."));
      var platz = el("div", "karte-platz");
      ziel.appendChild(platz);
      ladeEignung(function () {
        var geo = window.KD_EIGNUNG;
        if (!geo) { platz.textContent = "Die Karte konnte nicht geladen werden."; return; }
        var infos = [];
        var features = geo.features.map(function (f, i) {
          infos.push(f.properties);
          return { type: "Feature", properties: { id: "g" + i, rang: EIGNUNG_REIHE.indexOf(f.properties.kategorie) }, geometry: f.geometry };
        });
        var sortiert = features.map(function (f, i) { return i; }).sort(function (a, b) { return features[a].properties.rang - features[b].properties.rang; });
        echarts.registerMap("eignung", { type: "FeatureCollection", features: sortiert.map(function (i) { return features[i]; }) });

        var leiste = el("ul", "legende");
        EIGNUNG_REIHE.slice().reverse().forEach(function (k) {
          var li = el("li", "", '<span class="punkt" style="background:' + EIGNUNG_FARBEN[k] + '"></span>' + geo.kategorien[k].name +
            " (" + geo.kategorien[k].anzahl + ")");
          leiste.appendChild(li);
        });
        platz.appendChild(leiste);
        diagramm(platz, {
          tooltip: { trigger: "item", formatter: function (p) {
            var i = infos[Number(String(p.name).slice(1))];
            if (!i) return "";
            return "<strong>" + (i.name || geo.kategorien[i.kategorie].name) + "</strong>" + (i.name ? "<br>" + geo.kategorien[i.kategorie].name : "");
          } },
          series: [{
            type: "map", map: "eignung", nameProperty: "id", aspectScale: 0.66, roam: false, top: 8, bottom: 8, left: 8, right: 8,
            itemStyle: { borderColor: "#fff", borderWidth: .6 },
            emphasis: { label: { show: false }, itemStyle: { borderColor: FARBE.dunkel, borderWidth: 1.5 } },
            select: { disabled: true },
            data: infos.map(function (i, n) {
              return { name: "g" + n, itemStyle: { areaColor: EIGNUNG_FARBEN[i.kategorie], opacity: i.kategorie.indexOf("waermenetz") === 0 ? .9 : .55 } };
            }),
          }],
        }, "karte-hoch");
        platz.appendChild(el("p", "fuss", "Das sind Prüfgebiete aus der laufenden Planung, kein beschlossener Wärmeplan und keine Zusage für einzelne Straßen. " +
          "Stand " + datum(geo.stand) + ". Quelle: " + quelleStadt("Eignungsgebiete") + "."));
      });
    },
  };

  /* ---------- Datenluecken ---------- */
  MODULE.luecken = {
    titel: "Was noch fehlt",
    bau: function (ziel, opt) {
      ziel.appendChild(el("p", "unterzeile", "Diese Themen kommen dazu, sobald Daten vorliegen oder freigegeben sind."));
      var alle = {
        emissionen: [["Klimaneutrale Verwaltung 2030", "Bilanz der Stadtverwaltung, Daten liegen vor, Darstellung folgt"],
          ["Städtische Gebäude", "Strom- und Wärmeverbrauch der Liegenschaften, Daten liegen vor, Darstellung folgt"]],
        waerme: [["Beschlossener Wärmeplan", "liegt noch nicht vor, die Karte zeigt den Arbeitsstand vom Januar 2025"],
          ["Wärmepumpen im Bestand", "bekannt sind nur geförderte Anlagen, keine Gesamtzahl"]],
        mobilitaet: [["Radverkehr", "Zählstellen bzw. Stadtradeln-Kilometer"],
          ["Kfz-Verkehr", "Zählstellen, Modal Split (neuere Erhebung angekündigt)"]],
        energie: [
          ["Strom nach 2023", "die Bilanz der Stadt reicht bis 2023, neuere Werte folgen mit der nächsten Bilanz"]],
      };
      var liste = el("ul", "luecken");
      (opt.thema ? alle[opt.thema] : [].concat(alle.emissionen, alle.energie, alle.waerme, alle.mobilitaet)).forEach(function (p) {
        liste.appendChild(el("li", "", "<strong>" + p[0] + "</strong> – " + p[1]));
      });
      ziel.appendChild(liste);
    },
  };

  /* ================================================================
     Rahmen: Kopf, Navigation, Fuss
     ================================================================ */
  var SEITEN = [
    ["index.html", "Übersicht"], ["klima.html", "Wetter & Klima"], ["emissionen.html", "Emissionen"],
    ["erneuerbare.html", "Erneuerbare"], ["waerme.html", "Wärme"], ["mobilitaet.html", "Mobilität"],
  ];
  function rahmen() {
    var hier = (location.pathname.split("/").pop() || "index.html");
    var kopf = document.querySelector("[data-kopf]");
    if (kopf) {
      kopf.className = "kopf";
      kopf.innerHTML = '<div class="huelle"><a class="marke" href="index.html">Klimadashboard<br>Ingolstadt' +
        "<small>Ingolstadt klimaneutral 2035</small></a>" +
        '<span class="kopf-platz"></span><span class="prototyp">Prototyp</span></div>';
    }
    var nav = document.querySelector("[data-themen]");
    if (nav) {
      nav.className = "themen";
      nav.setAttribute("aria-label", "Themen");
      SEITEN.forEach(function (s) {
        var a = el("a", "pille", s[1]);
        a.href = s[0];
        if (s[0] === hier) a.setAttribute("aria-current", "page");
        nav.appendChild(a);
      });
    }
    var fuss = document.querySelector("[data-fuss]");
    if (fuss && D) {
      fuss.className = "seitenfuss";
      var quellen = [
        ["Deutscher Wetterdienst, Station " + K.station, K.quelle],
        ["Marktstammdatenregister der Bundesnetzagentur", D.solar.quelle],
        ["Ladesäulenregister der Bundesnetzagentur", D.laden.quelle],
        [B.berichte["2025"].titel, B.berichte["2025"].url],
        [B.berichte["2023"].titel, B.berichte["2023"].url],
      ].map(function (q) { return "<li>" + link(q[1], q[0]) + "</li>"; }).join("") +
        "<li>" + quelleStadt("Energie- und THG-Bilanz, Reduktionsfahrplan, BAFA-Auswertung und Eignungsgebiete") + "</li>" +
        "<li>" + B.berichte.auskunft_2026.titel + ", " + B.berichte.auskunft_2026.stand + "</li>";
      fuss.innerHTML = '<div class="huelle">' +
        "<h2>Quellen</h2><ul>" + quellen + "</ul>" +
        '<p class="hinweis-privat">Ein Prototyp aus der Bürgerschaft in Zusammenarbeit mit der Stabsstelle Klima, ' +
        "angelehnt an das " + link("https://www.klimadashboard.ms", "Klimadashboard Münster") + ". " +
        "Kein offizielles Angebot der Stadt Ingolstadt. Daten zuletzt aktualisiert am " + datum(D.erzeugt_am) + ". " +
        link("https://github.com/mnkeller/klimadashboard-ingolstadt", "Quellcode") + " unter AGPL-3.0. " +
        "Klimaschutz der Stadt: " + link("https://2035.de", "2035.de") + ".</p></div>";
    }
  }

  /* ================================================================
     Module einhaengen
     ================================================================ */
  function baue(knoten) {
    var name = knoten.getAttribute("data-modul");
    var m = MODULE[name];
    if (!m) { knoten.textContent = "Unbekanntes Modul: " + name; return; }
    var opt = { klein: knoten.hasAttribute("data-klein"), thema: knoten.getAttribute("data-thema") };
    knoten.innerHTML = "";
    if (m.karte !== false && !knoten.classList.contains("karte")) knoten.classList.add("karte");
    if (m.weiss) knoten.classList.add("weiss");
    if (m.titel) knoten.appendChild(el("h3", "", knoten.getAttribute("data-titel") || m.titel));
    m.bau(knoten, opt);
    var mehr = knoten.getAttribute("data-mehr");
    if (mehr) {
      var a = el("a", "weiter", "Mehr dazu →");
      a.href = mehr;
      knoten.appendChild(a);
    }
  }

  // Erst zeichnen, wenn die Schriften da sind: ECharts misst Texte beim
  // Aufbau, mit der Ersatzschrift ueberlappen sonst die Legenden.
  function start() {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(zeichne);
    else zeichne();
  }
  function zeichne() {
    rahmen();
    var knoten = document.querySelectorAll("[data-modul]");
    if (!D || !window.echarts) {
      knoten.forEach(function (k) { k.innerHTML = '<p class="ladehinweis">Daten konnten nicht geladen werden.</p>'; });
      return;
    }
    knoten.forEach(baue);
  }

  /* Einbettung: einbetten.html?modul=name. Meldet die Hoehe an die
     einbettende Seite, damit der iframe ohne Scrollbalken auskommt. */
  function einbetten() {
    document.body.classList.add("eingebettet");
    var name = new URLSearchParams(location.search).get("modul") || "kennzahlen";
    var knoten = document.getElementById("modul");
    knoten.setAttribute("data-modul", name);
    zeichne();
    function melde() {
      parent.postMessage({ klimadashboard: true, modul: name, hoehe: document.documentElement.scrollHeight }, "*");
    }
    new ResizeObserver(melde).observe(document.body);
    melde();
  }

  window.Klimadashboard = { start: start, einbetten: einbetten, module: Object.keys(MODULE) };
})();
