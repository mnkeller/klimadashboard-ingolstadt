# Klimadashboard Ingolstadt

Ein offenes Klimadashboard für Ingolstadt, angelehnt an das
[Klimadashboard Münster](https://www.klimadashboard.ms), gestaltet im CI von
[2035.de](https://2035.de). Ein Projekt aus der Bürgerschaft in Abstimmung mit
der Stabsstelle Klima, **kein offizielles Angebot der Stadt Ingolstadt**.

**Stand:** Prototyp. Übersicht und vier Themenseiten (Wetter & Klima,
Emissionen, Erneuerbare, Mobilität) mit interaktiven Diagrammen auf Basis
offener Daten. Weitere Module folgen, sobald die Stadt Daten freigibt.

## Ziel

- Kachel-Übersicht mit Themenseiten (Klima, Energie, Mobilität, Gebäude) wie
  in Münster, mit interaktiven Diagrammen
- Statische Dateien ohne Server: testbar auf GitHub Pages, einfach auf den
  2035.de-Webspace kopierbar oder per iframe in WordPress einbindbar
- Nur offene oder von der Stadt freigegebene Daten, jede Zahl mit Quelle

## Aufbau

```
index.html, klima.html, emissionen.html, erneuerbare.html, mobilitaet.html
einbetten.html        ein einzelner Baustein, zum Einbinden per iframe
assets/kd.js          alle Bausteine (Module), Rahmen, ECharts-Theme im 2035-CI
assets/style.css      Gestaltung nach 2035.de (Unbounded, Poppins, Farben)
assets/fonts/         Schriften lokal (SIL Open Font License)
assets/vendor/        Apache ECharts 5.5.1 (Apache-2.0)
data/                 erzeugte Daten (klima.js, wetter.js) und Handgepflegtes
scraper/              Skripte, die data/ füllen
```

Ohne Build-Schritt: Die Dateien lassen sich so, wie sie sind, auf jeden
Webspace kopieren, zum Beispiel nach `2035.de/klimadashboard/`. Die Seiten
laden nichts von fremden Servern (keine Google Fonts, kein CDN, keine Wetter-API
im Browser).

Lokal ansehen:

```bash
python3 -m http.server 8000
```

## In WordPress einbetten

Jeder Baustein läuft auch einzeln: `einbetten.html?modul=NAME`. Verfügbar:
`kennzahlen`, `wetter`, `temperatur`, `kenntage`, `reduktion`, `endenergie`,
`pv-bestand`, `pv-zubau`, `pv-ziel`, `speicher`, `ladepunkte`, `verkehr`,
`luecken`.

In einen WordPress-Block „Individuelles HTML“:

```html
<iframe class="klimadashboard" src="https://DOMAIN/klimadashboard/einbetten.html?modul=pv-bestand"
        style="width:100%;border:0;height:420px" title="Klimadashboard: Solarstrom" loading="lazy"></iframe>
<script>
window.addEventListener("message", function (e) {
  if (!e.data || !e.data.klimadashboard) return;
  document.querySelectorAll("iframe.klimadashboard").forEach(function (f) {
    if (f.contentWindow === e.source) f.style.height = e.data.hoehe + "px";
  });
});
</script>
```

Der Baustein meldet seine Höhe, der iframe passt sich ohne Scrollbalken an.

## Daten

```bash
cd scraper && python3 klima_bauen.py   # --neu, um den Cache zu umgehen
```

Nur Python-Standardbibliothek. Schreibt `data/klima.json` und `data/klima.js`.
Der erste Lauf lädt rund 110 MB und dauert etwa zwei Minuten.

Aktuelles Wetter und Unwetterwarnungen (Deutscher Wetterdienst über
[Bright Sky](https://brightsky.dev)):

```bash
python3 scraper/wetter_holen.py
```

| Quelle | Inhalt |
|---|---|
| Deutscher Wetterdienst, Station Kösching (02700) | Jahresmittel, heiße Tage, Tropennächte, Frosttage seit 1961; Referenz 1971–2000 wie im Fortschrittsbericht |
| Marktstammdatenregister (Gemeindeschlüssel 09161000) | Solaranlagen und Stromspeicher, nur Jahressummen |
| Ladesäulenregister der Bundesnetzagentur | öffentliche Ladepunkte |
| `data/klima_bericht.json` | von Hand gepflegte Werte aus den Fortschrittsberichten der Stabsstelle Klima |

Was wir zusätzlich bei der Stadt anfragen: [docs/datenanfrage.md](docs/datenanfrage.md).

## Lizenz

Code unter [AGPL-3.0](LICENSE), wie das Klimadashboard Münster
([OpenCoDE](https://gitlab.opencode.de/smart-city-muenster/klimadashboard-muenster/klimadashboard-muenster)),
damit Bausteine von dort übernommen werden dürfen. Übernommene Teile werden
im Code mit Herkunft gekennzeichnet. Daten gehören den jeweiligen Quellen.
