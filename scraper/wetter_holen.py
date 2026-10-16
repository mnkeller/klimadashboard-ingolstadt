#!/usr/bin/env python3
"""
Holt das aktuelle Wetter und amtliche Unwetterwarnungen fuer Ingolstadt.

    python3 wetter_holen.py

Quelle: Bright Sky (https://brightsky.dev), freie JSON-Schnittstelle fuer die
offenen Daten des Deutschen Wetterdienstes. Der Abruf passiert hier im Skript
und nicht im Browser der Besucherinnen, damit die Seite keine Anfragen an
fremde Server stellt. Fuer "aktuell" muss das Skript regelmaessig laufen
(geplant: GitHub Action alle 30 Minuten).

Ergebnis: data/wetter.json und data/wetter.js (window.WETTER_DATEN).
"""

import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
DATEN_VZ = os.path.join(os.path.dirname(HIER), "data")

sys.path.insert(0, HIER)
from klima_bauen import USER_AGENT  # noqa: E402

# Ingolstadt, Rathausplatz
LAT, LON = 48.7665, 11.4258
BASIS = "https://api.brightsky.dev"
# Bright Sky liefert Stationsnamen ohne Umlaute.
STATIONEN = {"Koesching": "Kösching", "Ingolstadt (Flugplatz)": "Ingolstadt-Manching"}


def hole(pfad):
    url = f"{BASIS}/{pfad}?lat={LAT}&lon={LON}"
    anfrage = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(anfrage, timeout=30) as antwort:
            return json.load(antwort)
    except (urllib.error.URLError, TimeoutError) as fehler:
        sys.exit(f"Fehler beim Laden von {url}: {fehler}")


def main():
    wetter = hole("current_weather")
    w = wetter["weather"]
    quelle = (wetter.get("sources") or [{}])[0]
    warnungen = hole("alerts")

    daten = {
        "erzeugt_von": "scraper/wetter_holen.py",
        "abgerufen": dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes"),
        "zeitpunkt": w.get("timestamp"),
        "station": STATIONEN.get(quelle.get("station_name"), quelle.get("station_name")),
        "temperatur": w.get("temperature"),
        "symbol": w.get("icon"),
        "niederschlag_mm_h": w.get("precipitation_60"),
        "wind_kmh": w.get("wind_speed_10"),
        "luftfeuchte": w.get("relative_humidity"),
        "bewoelkung": w.get("cloud_cover"),
        "warnungen": [
            {
                "ereignis": a.get("event_de"),
                "stufe": a.get("severity"),
                "titel": a.get("headline_de"),
                "beschreibung": a.get("description_de"),
                "von": a.get("onset"),
                "bis": a.get("expires"),
            }
            for a in warnungen.get("alerts", [])
        ],
        "quelle": "https://brightsky.dev",
    }
    with open(os.path.join(DATEN_VZ, "wetter.json"), "w", encoding="utf-8") as f:
        json.dump(daten, f, ensure_ascii=False, indent=1)
    with open(os.path.join(DATEN_VZ, "wetter.js"), "w", encoding="utf-8") as f:
        f.write("window.WETTER_DATEN = " + json.dumps(daten, ensure_ascii=False) + ";\n")
    print(f"{daten['temperatur']} °C, {daten['symbol']}, {len(daten['warnungen'])} Warnung(en)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
