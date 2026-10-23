# Datenlieferung der Stabsstelle Klima – Sichtung

Stand der Sichtung: 23.10.2026. Grundlage sind die Dateien im lokalen Ordner
`input/` (nicht im Git) und die Antwort des Klimareferenten auf die
[Datenanfrage](datenanfrage.md). Die Dateien wurden nur gelesen. In diesem
Dokument stehen nur Summen und Kennzahlen, keine Rohdaten.

**Lizenz:** Für Teil A (Bilanz, Reduktionspfad, Ziele) ist CC BY 4.0
freigegeben. Für die Dateien aus Teil B (Verwaltung, Liegenschaften,
Wärmepumpen, Eignungsgebiete) liegt seit dem 23.10.2026 ebenfalls die
Freigabe unter CC BY 4.0 vor (mündlich im Gespräch bestätigt, noch nicht schriftlich in
`input/`). Umgesetzt sind alle Teil-B-Dateien: Wärmepumpen und Eignungsgebiete auf `waerme.html`,
Verwaltung und Liegenschaften auf `emissionen.html`.

**Ist und Prognose:** In allen Bilanz-Tabellen sind nur **2019 bis 2023**
gemessene Werte. Ab 2024 stehen dort Hochrechnungen oder Zielpfade, die
im Dashboard entsprechend gekennzeichnet werden müssen.

---

## 1. Was in welcher Datei steht

### 1.1 „Energie- und THG-Bilanz bis 2035.xlsx“ (Teil A, CC BY 4.0)

| Reiter | Inhalt | Jahre |
|---|---|---|
| `Energie_Emissionen_Gesamt` | Endenergie (MWh) und THG (t CO₂e) je Sektor Strom / Wärme / Verkehr mit Summe und Veränderung gegenüber 2019; Soll-Reduktionspfad nach IKSK (Spalte AK) mit 89.467 t Minderung pro Jahr | Ist 2019–2023, Hochrechnung 2024–2035 |
| `Energiebilanz_Strom` (A–P) | Stromverbrauch nach Haushalte, GHD, Industrie, Stadtverwaltung, öffentliche Einrichtungen, Verkehr, Sonstige; Bedarfssteigerung durch E-Mobilität und Wärmepumpen | Ist 2017–2023, Prognose 2024–2035 |
| `Energiebilanz_Strom` (ab T) | EE-Erzeugung in Ingolstadt: EEG-Einspeisung (Wasser, Biomasse, PV), Direktvermarktung (Wasserkraft), PV-Eigenverbrauch (Hochrechnung aus dem MaStR), EE-Anteil; Emissionen Strom gesamt / Industrie / ohne Industrie / Zielpfad | Ist 2017/2018–2023, Prognose bis 2035 |
| `Energiebilanz_Wärme` | Wärme-Endenergie nach Sektor × Energieträger (Gas, Fernwärme, Biomasse, Heizöl, Flüssiggas, Prozessgas Audi/Gunvor) | Ist 2017–2023, ab 2019 vollständig |
| `Energiebilanz_Wärme` (ab Z. 31) | Netzlänge Fernwärme (km) und Gas; Absatz Wärmepumpen **Bund** (BWP) | Fernwärme 2023–2035, WP 2005–2024 |
| `Emissionen_Wärme`, `…_ohne_Industrie` | THG Wärme nach Sektor × Energieträger | Ist 2019–2023, Pfad bis 2035 |
| `Energiebilanz_Verkehr` | Endenergie und THG nach MIV, ÖPNV, Straßengüter-, Schienenpersonen- und Schienengüterverkehr | Ist 2019–2023, Hochrechnung bis 2035 |
| `Strom_Bedarfssteigerung` | E-Pkw (2023: 6.050, Annahme +25 % pro Jahr → 88.039 im Jahr 2035), E-Busse (Annahme +6 pro Jahr → 72 im Jahr 2035), Wärmepumpen-Strombedarf | 2023–2035 |
| `Strom_Bundesstrommix` | CO₂-Faktor Bundesstrommix (UBA) mit und ohne Vorkette | 1990–2023, Prognose bis 2050 |
| `SWI_Strom`, `SWI_Gas`, `SWI_Fernwärme` | Transportmengen der Stadtwerke nach Kundengruppe (Quelldaten der Bilanz) | 2017–2023 bzw. 2019–2023 |
| `Grafiken` | nur Diagramme | – |

Kernwerte (Ist):

| Jahr | Endenergie gesamt | Strom | Wärme | Verkehr | THG gesamt | THG Strom | THG Wärme | THG Verkehr | EE-Anteil Strom |
|---|---|---|---|---|---|---|---|---|---|
| 2019 | 5.588 GWh | 1.127 | 3.695 | 766 | 1.590.516 t | 539.788 | 857.469 | 193.259 | 16 % |
| 2020 | 5.170 GWh | 1.025 | 3.454 | 691 | 1.416.529 t | 445.952 | 799.424 | 171.153 | 18 % |
| 2021 | 5.146 GWh | 1.010 | 3.445 | 691 | 1.441.335 t | 481.823 | 786.921 | 172.591 | 18 % |
| 2022 | 4.887 GWh | 1.015 | 3.175 | 696 | 1.407.758 t | 510.792 | 723.040 | 173.925 | 19 % |
| 2023 | 4.668 GWh | 1.027 | 2.927 | 713 | 1.308.430 t | 461.256 | 672.105 | 175.069 | 20 % |

Die durchschnittliche Minderung von 2019 bis 2023 beträgt 70.522 t pro Jahr,
nötig wären 89.467 t pro Jahr. Der Soll-Pfad nach IKSK liegt 2023 bei
1.232.650 t, der Ist-Wert bei 1.308.430 t.

### 1.2 „2025_Reduktionsfahrplan Ingolstadt.xlsx“ (Teil A, CC BY 4.0)

| Reiter | Inhalt | Jahre |
|---|---|---|
| `Strom_Energie` | Ziele 2035: Dach-PV 425.362 MWh, Freiflächen-PV 260.000 MWh, PV auf städtischen Liegenschaften 5 MWp bis 2030, Freifläche Anumar 40 MWp; Mehrbedarf E-Pkw 255 GWh, E-Busse 4,7 GWh, Wärmepumpen 117 GWh | Zielwerte 2035 |
| `Strom_Emissionen` ab Z. 81 | **PV-Zubau und Speicherzubau**: Dach-PV kumuliert (kWp), Freiflächen-PV (linear 23.636 kWp pro Jahr ab 2025), nutzbare Speicherkapazität kumuliert (kWh, 2035: 360.033) | Ist 2000–2024, Pfad 2025–2035 |
| `Strom_Emissionen` (oben) | Maßnahmenpakete mit Einsparung: Bundesstrommix −334.778 t, PV −108.490 t, Speicher −121.062 t | 2035 |
| `Wärme_Emissionen` ab Z. 99 | **Fernwärmetrasse in km und jährlicher Zubau** (2023: 86,9 km, 2024: 92,3 km, danach +7 km pro Jahr bis 170 km im Jahr 2035) | Ist 2009–2024, Pfad 2025–2035 |
| `Wärme_Emissionen` ab Z. 99 (R–Z) | Anteile der Energieträger im Neubau, Ingolstadt und Bund | 2011–2024 |
| `Wärme_Emissionen` (oben) | Maßnahmenpakete Wärmenetz, Wärmepumpe, Biomasse, Prozesswärme, Verwaltung | 2035 |
| `Gebäudeübersicht` | Gebäude nach Heizungsart (Gas, Öl, Fernwärme, Biomasse, Strom) je Sektor, Status quo und Wärmenetzausbauplan 2035 | heute / 2035 |
| `Verkehr_Energie`, `Verkehr_Emissionen` | E-Mobilität, Verkehrsverlagerung, EU-Flottengrenzwerte; Annahme 139 Busse inkl. Subunternehmer, 6 E-Busse im Jahr 2024 (nur SBI) | 2035 |
| `Reduktionspfad` | Wasserfall 2019 → 2035: Wärme −863.219 t, Strom −642.863 t, Verkehr −198.009 t, Sonstige +113.574 t | 2019 / 2035 |
| `Grundstruktur`, `…_Grafik`, `Matrix_…` | Gliederung bzw. nur Grafik | – |

### 1.3 „2026_Auswertung_MaStR_PV.xlsx“ (Teil A)

| Reiter | Inhalt | Jahre |
|---|---|---|
| `MaStR fortlaufend` | Roh-Export aus dem MaStR mit 13.731 Einheiten, Anlagennamen, Adressen und Betreibernamen. **Nicht veröffentlichen.** Das Dashboard holt das MaStR ohnehin selbst. | – |
| `Auswertung PV` | Zubau und Bestand (kWp), Anzahl nach Größenklassen (< 2, 2–100, > 100 kWp), Zubauperspektive bis 2035 (2035: 435.536 kWp Dach), Dachpotenzial laut Solarkataster 655.916 kWp | 1957–2026, Prognose bis 2035 |
| `Detail 2023`, `Auswertung Registrierung`, `Auswertung Mini-Solaranlagen` | Monats- und Quartalsauswertung 2023, Balkonkraftwerke | 2023 |
| `Freiflächen PV` | Liste der Freiflächenanlagen, darunter falsch eingetragene Balkonkraftwerke | – |

### 1.4 „Auswertung geförderte Wärmepumpen … bis 31.05.2025_korrigiert.xlsx“ (Teil B)

Von der BAFA geförderte Wärmepumpen nach Auszahlungsjahr und Programm (MAP,
MAP20, BEG EM), 2007 bis 31.05.2025, insgesamt **158**. Zuletzt: 2022: 25,
2023: 23, 2024: 42, 2025 (bis Mai): 8. Die Überschrift nennt nur **PLZ
85049**, das muss noch geklärt werden. Diese Zahlen sind eine Untergrenze und
kein Bestand.

### 1.5 „2025 Jährliche Gesamtemissionen Verwaltung.xlsx“ (Teil B)

| Reiter | Inhalt | Jahre |
|---|---|---|
| `Ergebnisse Gesamt` | THG der Verwaltung nach Wärme/Kälte, Strom, Mobilität, Beschaffung, Abfall/Wasser; Wärme-Endenergie nach Energieträger | 2019, 2021, 2023; Hochrechnung 2025/2027/2030 |
| `Reduktionspfad` | Maßnahmen bis 2030 (Biogas −4.128 t, Fernwärme, Sanierung, E-Fuhrpark), PV städtisch 3,4 MWp in Betrieb, 1,5 MWp geplant, SWI-Stadtenergie 5 MWp | 2023 → 2030 |
| `Ergebnisse 2019/2021/2022/2023` | Carbon Footprint nach GHG-Protokoll, Scope 1–3, Verbräuche × Faktoren | je Jahr |
| `Diagramme_schr`, `Ergebnisse fortlaufend` | Scope-Tabelle 2019/2021, Grafikdaten | 2019, 2021 |
| `Emissionsfaktoren` | DEFRA-, UBA- und GEMIS-Faktoren | – |

Gesamtwerte: 2019: 15.615 t, 2021: 11.540 t, 2023: 9.699 t; Zielpfad 2025:
6.987 t, 2027: 4.274 t, 2030: 1.562 t. Der Anteil Wärme/Kälte lag 2023 bei
56 %, Mobilität einschließlich Pendeln bei 35 %.

### 1.6 „Verbrauchsdaten 2024 aus Energiebericht 2025.xlsx“ (Teil B)

Reiter `spez. Kennwerte`: 143 Liegenschaften in 12 Gebäudegruppen (Schulen,
Kitas, Jugend, Museen, Kultur, Verwaltung, Feuerwehr, Friedhöfe,
Bezirkssportanlagen, Ballspielhallen, technische Betriebsstätten, WC) für
**2024**. Anders als angekündigt stehen dort nicht nur Werte je m², sondern
auch absolute Verbräuche: Nettoraumfläche, Strom (kWh), Wärme (MWh), Wasser,
Kennwerte je m², CO₂ in kg/m², Kosten und Vergleichswerte nach BWZK. Jede
Gruppe hat eine eigene Summenzeile, deshalb muss nichts hochgerechnet werden.
Zusammen sind es rund 390.000 m², 9,6 GWh Strom und 34,2 GWh Wärme. Die
Schulen haben daran den größten Anteil: 236.500 m², 5,0 GWh Strom und
20,3 GWh Wärme. Es gibt nur ein Jahr und noch keine Zeitreihe.

### 1.7 „2025-01-24 eignungsgebiete_ingolstadt.geojson“ (Teil B)

FeatureCollection in WGS84 mit 140 Polygonen, 226 KB. Kategorien:
Wärmepumpen-Prüfgebiet bzw. „individual heating“ (64),
Gas/Wärmepumpen-Prüfgebiet (56), Wärmenetz (12), Wärmenetz mit geringer
Priorität (8). Bei den Wärmenetzen stehen Namen wie „Altstadt“ und
„Monikaviertel“, teils mit Kommentar. Einige Titel sind Arbeitsstände, etwa
„Redundanz?“ oder „polygon 17“. Vor einer Veröffentlichung braucht es die
Freigabe und eine bereinigte Fassung.

### Nicht in den Dateien, nur in der Antwort

- **E-Busse:** SBI hat 10 E-Busse (4 weitere in Beschaffung) bei 98
  Linienbussen. Mit Partnern sind es 23 E-Busse bei rund 140 Linienbussen.
- **Fahrradstraßen:** 8 km.
- **Modal Split:** steht im IKSK; ein neuerer (etwa 2022) kommt noch.
- **Fahrgastzahlen:** liegen nicht vor.
- **Radlkilometer:** kommen vom Stadtradeln-iFrame und werden nachgereicht,
  die Zahlen sind unvollständig.

---

## 2. Widersprüche zu den bisherigen Werten

Verglichen mit `data/klima_bericht.json` (Handpflege aus den Berichten) und
`data/klima.json` (eigener Scraper).

| # | Wert | bisher | neu (Stadt-Excel) | Bewertung |
|---|---|---|---|---|
| 1 | THG 2019 | 1.653.110 t (aus Bericht 2023 zurückgerechnet) | **1.590.516 t** | Neuberechnung (u. a. Gunvor territorial, neue Strommix-Faktoren). Excel übernehmen. |
| 2 | THG 2021 | 1.476.925 t | **1.441.335 t** | wie 1 |
| 3 | Endenergie 2021 | 4.984.248 MWh | **5.145.584 MWh** | wie 1 |
| 4 | EE-Anteil Strom 2021 | 3 % | **18 %** | Großer Unterschied, wahrscheinlich andere Definition im Bericht 2023. Excel übernehmen und nachfragen. |
| 5 | Anteil Industrie 2021 | 48 % | ≈ 50 % (Strom- und Wärme-Industrie / THG gesamt) | Abweichung klein, Abgrenzung nachfragen |
| 6 | E-Busse | „6 von 139 im Jahr 2023“ | Excel: 0 im Jahr 2023, 6 im Jahr 2024 (nur SBI); Antwort: **10 von 98 (SBI)** bzw. **23 von ≈140 (mit Partnern)** | Die Seite stellt bisher SBI-Busse der Gesamtflotte gegenüber, außerdem stimmt das Jahr nicht. Korrigieren. |
| 7 | Fernwärme-Netz 2035 | Ziel 170 km | Fahrplan: 170 km; Bilanz-Reiter Wärme: 155,6 km (86,4 + 69,2) | Widerspruch zwischen den beiden Stadt-Dateien, nachfragen. Bestand 2023: 86,9 bzw. 86,4 km. |
| 8 | PV-Ziel Dach 2035 | 425.000 kWp „aus Diagramm“ | Fahrplan 425.362 kWp ✓; neue Hochrechnung 2026: 435.536 kWp | Ziel bestätigt, `pv_ziel_aus_diagramm` kann auf `false`. Die Hochrechnung ist kein Ziel. |
| 9 | PV-Ziel Freifläche 2035 | 260.000 kWp | 260.000 kWp ✓ | bestätigt |
| 10 | PV-Bestand (MaStR) | klima.json: 2023 76.185, 2024 91.010, 2025 106.127 kWp | Stadt: 75.989, 89.189, 103.494 kWp | 0,3–2,5 % weniger, weil die Stadt nur „In Betrieb“ zählt und einen älteren Abzug nutzt. Kein Fehler. Im Fußtext erwähnen. |
| 11 | Speicher (MaStR) | klima.json: 2023 17.936, 2024 26.183, 2025 33.160 kWh | Stadt: 17.468, 25.346, ab 2025 Pfad (37.470) | Ist-Werte passen. Den Pfad bis 2035 (360 MWh) als Ziellinie nutzen. |
| 12 | Wärmepumpen-Anstieg 2023→24 | 67 % | BAFA-Förderfälle: 23 → 42 (+83 %) | Quelle der 67 % unklar, vermutlich eine andere Zählung |
| 13 | Wärmepumpen-Ziel 2035 | 18.500 | 18.476 Gebäude mit Strom-Heizung im Wärmenetzausbauplan 2035 (heute 1.142) | passt. Daraus ergeben sich ≈ 1.730 pro Jahr, im Einklang mit 1.700. |
| 14 | Minderung pro Jahr | 89.500 nötig / 70.500 erreicht | 89.467 / 70.522 | ✓ |
| 15 | Endenergie 2023 | 1.000 / 2.900 / 700 GWh | 1.027 / 2.927 / 713 GWh | ✓ gerundet, exakte Werte übernehmen |
| 16 | „witterungsbereinigt“ | steht im Fußtext | In der Excel ist keine Witterungskorrektur zu sehen | nachfragen, sonst den Hinweis streichen |
| 17 | Verwaltung 2019 | – | 15.615 t (`Ergebnisse Gesamt`) gegenüber 13.547 t bzw. 14.224 t mit 5 % Aufschlag (`Diagramme_schr`) | nachfragen, welcher Wert gilt; in 2021 Scope 3 stehen außerdem `#REF!`-Fehler |

**Datenqualität, auf der Seite zu erwähnen:**

- Verkehr: MIV 2020–2022 ist identisch (424.375 MWh), also fortgeschrieben
  und nicht neu erhoben.
- Heizöl und Biomasse bei Haushalten und GHD sind in allen Jahren
  gleich, also Platzhalter.
- Wasserkraft-Direktvermarktung: 131.500 MWh als langjähriges Mittel in allen
  Jahren. Das sind fast zwei Drittel des lokalen EE-Stroms (2023: 131,5 von
  207,7 GWh). PV liegt bei rund 69 GWh (EEG-Einspeisung und Eigenverbrauch).
- Fernwärme hat den Emissionsfaktor 0 laut Zertifikat SWI. Das senkt die
  Wärmeemissionen deutlich.
- Hochrechnungsjahre 2024–2035 in `Energie_Emissionen_Gesamt`: Verkehr-Energie
  ist 0, Wärme bleibt konstant, 2031–2034 fehlt die Wärme in der Summe. Diese
  Spalten sind nicht nutzbar, nur die THG-Hochrechnung (AD) und der Soll-Pfad (AK).
- Stadtwerke und Energiemanagement: laut Kommentar in der Excel passen die
  Zahlen „nicht ganz zusammen“. Verwaltungswärme 2023: Bilanz 37,4 GWh,
  Verwaltungs-CCF 35,6 GWh, Liegenschaften 2024: 34,2 GWh.

---

## 3. Platz im Dashboard

| Quelle | Seite | Modul (neu ✚ / geändert ✎) |
|---|---|---|
| Bilanz `Energie_Emissionen_Gesamt` | Übersicht, emissionen.html | ✎ Kennzahl „CO₂-Minderung“ mit exakten Werten; ✚ **THG-Zeitreihe** 2019–2023 gestapelt nach Strom/Wärme/Verkehr, dazu IKSK-Soll-Pfad bis 2035 als Linie und die Hochrechnung gestrichelt; ✎ `reduktion` mit Ist gegen Soll 2023 |
| Bilanz Strom/Wärme/Verkehr nach Sektor | emissionen.html | ✎ `endenergie` als Zeitreihe statt Ring; ✚ „Wer verbraucht“ (Haushalte, GHD, Industrie, Verwaltung …) und Wärme nach Energieträger |
| Fahrplan `Reduktionspfad` | emissionen.html | ✚ Wasserfall 2019 → 2035 (Wärme, Strom, Verkehr) |
| Bilanz `Energiebilanz_Strom` ab T | erneuerbare.html, Übersicht | ✚ **Stromverbrauch gegen lokale EE-Erzeugung** 2018–2023 nach Wasser/PV/Biomasse; Kennzahl EE-Anteil 20 % |
| Fahrplan PV-Pfad + PV-Auswertung | erneuerbare.html | ✎ `pv-ziel`: Ziel bestätigt, Pfad Dach/Freifläche bis 2035 gegen MaStR-Ist; Hinweis auf Dachpotenzial 656 MWp |
| Fahrplan Speicherpfad | erneuerbare.html | ✎ `speicher`: Ziellinie bis 360 MWh im Jahr 2035 |
| Verwaltung | emissionen.html (oder eigene Seite) | ✚ **Klimaneutrale Verwaltung 2030**: 2019/2021/2023 nach Bereich, Pfad bis 2030 |
| Liegenschaften 2024 | emissionen.html bzw. Verwaltung | ✚ Kennzahlen je Gebäudegruppe (Fläche, Strom, Wärme, kWh/m² gegen BWZK-Vergleichswert), nur Gruppensummen |
| Bilanz `Energiebilanz_Verkehr` | mobilitaet.html | ✚ Verkehrs-Endenergie und THG nach MIV/ÖPNV/Güter |
| Antwort (E-Busse, Fahrradstraße) | mobilitaet.html | ✎ `verkehr`: E-Busse 10/98 bzw. 23/≈140, 8 km Fahrradstraße; ✎ `luecken` (Modal Split folgt, Fahrgastzahlen fehlen) |
| `Strom_Bedarfssteigerung` | mobilitaet.html | E-Pkw 2023: 6.050 gegenüber Ziel 88.000 (Kennzahl) |
| Fernwärme-km, Gebäudeübersicht, Neubau-Energieträger | **neu: waerme.html** | ✚ Fernwärmenetz 2009–2024 und Pfad bis 170 km; ✚ Heizungsarten heute gegen 2035; ✚ Neubau Ingolstadt gegen Bund |
| BAFA-Wärmepumpen | waerme.html | ✚ geförderte WP pro Jahr, deutlich als Untergrenze markiert |
| Eignungsgebiete GeoJSON | waerme.html | ✚ Karte mit dem schon eingebundenen ECharts (`registerMap`), ohne Kachelserver und ohne externe Anfragen |
| `Energiebilanz_Wärme` (Bund-WP) | – | nicht übernehmen (Bundeswerte) |
| klima.html | – | keine der Dateien betrifft Wetter und Klima |

---

## 4. Vorschlag für die Datenpipeline

Die Rohdateien bleiben lokal in `input/`. Ins Repo kommen nur abgeleitete
Summen. Die GitHub Action hat keinen Zugriff auf `input/`. Deshalb läuft das
Einlesen lokal, sobald neue Dateien kommen, und das Ergebnis wird committet.
Das passt zum Rhythmus der Bilanz (alle zwei Jahre).

1. **`scraper/stadt_einlesen.py`** (nur Standardbibliothek: `zipfile` und
   `xml.etree`, wie beim Sichten erprobt)
   - liest die drei Teil-A-Dateien und, sobald freigegeben, die Teil-B-Dateien;
   - findet Reiter **über den Namen** und Spalten **über die Kopfzeile**
     (z. B. „Jahr“, „Summe“, „Anteil EE in Ingolstadt“), nicht über feste
     Zellen, und bricht ab, wenn eine erwartete Überschrift fehlt;
   - übernimmt nur Ist-Jahre bis zum letzten Bilanzjahr und Pfade
     ausdrücklich als `"art": "pfad"`;
   - schreibt `data/klima_stadt.json` mit `quelle`, `lizenz: "CC BY 4.0"`,
     Dateiname und Stand je Block.
2. **`scraper/klima_bauen.py`** bindet `klima_stadt.json` wie bisher
   `klima_bericht.json` unter `stadt` ein.
3. **`data/klima_bericht.json`** bleibt für Einzelangaben ohne Tabelle:
   E-Busse, Fahrradstraßen-km, Modal Split, Pkw-Bestand. Die Felder, die die
   Bilanz ersetzt (`thg.werte`, `endenergie`, `ee_anteil_*`), fallen weg oder
   verweisen auf `stadt`.
4. **`scraper/pruefen.py`**: Summe der Sektoren gleich Gesamt (±1 t),
   Ist-Jahre lückenlos 2019 bis zum letzten Bilanzjahr, EE-Anteil zwischen 0
   und 100 %, Minderung pro Jahr gleich (2019 − letztes Jahr) / Jahre.
5. **GeoJSON:** nach Freigabe bereinigt (nur Kategorie und Name) als
   `data/eignungsgebiete.json` ablegen, mit gerundeten Koordinaten, damit die
   Datei kleiner wird.
6. **`.gitignore`:** `input/` ergänzen. Im Moment zeigt `git status` den
   Ordner als unversioniert, ein `git add .` würde die Rohdateien also
   mitnehmen.

---

## 5. Offene Fragen an die Stabsstelle

1. Gilt die Neuberechnung (2019: 1,59 Mio. t, 2021: 1,44 Mio. t) als
   offizieller Stand statt der Werte aus dem Bericht 2023?
2. Ist die Bilanz witterungsbereinigt?
3. Warum lag der EE-Anteil 2021 im Bericht 2023 bei 3 % und in der Excel bei 18 %?
4. Welches Fernwärme-Ziel gilt für 2035: 170 km oder 155,6 km?
5. Gilt die Wärmepumpen-Auswertung nur für PLZ 85049 oder für das ganze
   Stadtgebiet? Woher kommen die 67 % Anstieg?
6. Welcher Gesamtwert der Verwaltung gilt für 2019: 15.615 t oder 13.547 t?
7. Gilt CC BY 4.0 auch für die Teil-B-Dateien (Verwaltung, Liegenschaften,
   Wärmepumpen, Eignungsgebiete)? Dürfen Liegenschaften einzeln gezeigt
   werden oder nur als Gruppensummen?
8. Wann kommt der Modal Split 2022, und gibt es ihn als Tabelle?
