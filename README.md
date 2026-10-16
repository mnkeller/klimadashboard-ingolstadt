# Klimadashboard Ingolstadt

Ein offenes Klimadashboard für Ingolstadt, angelehnt an das
[Klimadashboard Münster](https://www.klimadashboard.ms), gestaltet im CI von
[2035.de](https://2035.de). Ein Projekt aus der Bürgerschaft in Abstimmung mit
der Stabsstelle Klima, **kein offizielles Angebot der Stadt Ingolstadt**.

**Stand:** Aufbau. Die Datenpipeline läuft, das Frontend entsteht gerade. Ein
erster Prototyp mit denselben Daten liegt beim
[PapierPanther](https://schanzer-papierpanther.de/klima.html).

## Ziel

- Kachel-Übersicht mit Themenseiten (Klima, Energie, Mobilität, Gebäude) wie
  in Münster, mit interaktiven Diagrammen
- Statische Dateien ohne Server: testbar auf GitHub Pages, einfach auf den
  2035.de-Webspace kopierbar oder per Shortcode in WordPress einbindbar
- Nur offene oder von der Stadt freigegebene Daten, jede Zahl mit Quelle

## Daten

```bash
cd scraper && python3 klima_bauen.py   # --neu, um den Cache zu umgehen
```

Nur Python-Standardbibliothek. Schreibt `data/klima.json` und `data/klima.js`.
Der erste Lauf lädt rund 110 MB und dauert etwa zwei Minuten.

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
