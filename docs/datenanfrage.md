# Datenanfrage an die Stabsstelle Klima

Was wir von der Stadt brauchen, damit das Dashboard über offene Daten
(Wetter, Solaranlagen, Ladepunkte) hinausgeht. Wunschformat jeweils Excel
oder CSV, eine Zeile pro Jahr bzw. Objekt.

## A. Kern

1. **THG- und Endenergiebilanz (BISKO)** – alle vorhandenen Jahre (1990, 2019,
   2021, 2023), aufgeteilt nach Sektor (Haushalte, GHD, Industrie, Verkehr,
   Verwaltung) und Energieträger (Strom, Erdgas, Heizöl, Fernwärme, Biomasse,
   Kraftstoffe …), in MWh und t CO₂e.
   *Warum:* das Herzstück, wie bei Münster. Bisher gibt es die Zahlen nur als
   Grafik im Fortschrittsbericht, wir haben daraus zwei Einzelwerte.
2. **Reduktionspfad bis 2035** – Zielwert in t CO₂e pro Jahr (Abbildung 3 im
   Bericht 2023).
   *Warum:* zeigt Soll gegen Ist, die wichtigste Aussage des Dashboards.
3. **Ziele als exakte Zahlen** – PV 2035 (Dach / Freifläche), Wärmepumpen,
   E-Fahrzeuge, Fernwärme-Ausbau, Speicher.
   *Warum:* das PV-Ziel haben wir aus einem Diagramm abgelesen, das muss
   bestätigt werden.
4. **Nutzungsrecht** – Freigabe zur Veröffentlichung mit Quellenangabe, am
   besten unter CC BY 4.0 oder dl-de/by-2-0.
   *Warum:* ohne Freigabe dürfen wir die Rohdaten nicht ins offene Repo legen.

## B. Wie die Münster-Module

5. **Städtische Gebäude** – Strom- und Wärmeverbrauch je Liegenschaft und
   Jahr (Energiemanagement), dazu PV auf städtischen Dächern (Bestand und
   Planung).
   *Warum:* Münster zeigt das als eigenes Modul, es betrifft direkt das
   Handeln der Stadt.
6. **Klimaneutrale Verwaltung 2030** – Bilanz nach GHG-Protokoll (Scope 1–3)
   pro Jahr.
   *Warum:* das zweite Ziel neben 2035, bisher nirgends als Zahlenreihe.
7. **Mobilität**
   - Radzählstellen, falls vorhanden; sonst die Quelle der „Radlkilometer“ auf
     der Testseite (Stadtradeln?)
   - Kfz-Zählstellen bzw. Ampeldaten (dafür gibt es einen
     Datenüberlassungsvertrag)
   - Modal Split
   - E-Busse und Fahrgastzahlen pro Jahr (Stadtbus / INVG)
   - Kilometer Fahrradstraßen, Lastenradförderung

   *Warum:* der Verkehr ist bisher die größte Lücke, es gibt dazu keine
   offenen Daten.
8. **Wärme** – Wärmepumpen pro Jahr, Fernwärme (Netz-km, Anschlüsse;
   Stadtwerke), Ergebnisse des Wärmeplans als Geodaten.
   *Warum:* die Wärme ist der größte Sektor (rund 63 % der Endenergie).
9. **Stromverbrauch und lokale Einspeisung** pro Jahr (SWI Netze bzw.
   Bayernwerk).
   *Warum:* damit lässt sich der Anteil Erneuerbarer selbst ausrechnen,
   statt ihn nur zu zitieren.

## C. Optional

10. **Maßnahmenliste aus dem Klimaschutzkonzept mit Umsetzungsstand**
    *Warum:* für einen Maßnahmen-Monitor wie in Bayreuth oder Neuss.
11. **Klimaanpassung** – Baumkataster, Hitzeaktionsplan, Entsiegelung.

## Organisatorisches

- Ansprechpartner und Aktualisierungsrhythmus je Datenquelle
- CI-Dateien von 2035.de: Logo als SVG, Farbcodes, Schriftnutzung
- Zugang zum 2035-Webspace (FTP oder WordPress-Admin) für das spätere Einbinden
