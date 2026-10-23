#!/usr/bin/env python3
"""
Prueft die erzeugten Daten auf Plausibilitaet, bevor sie committet werden.

    python3 pruefen.py klima [--alt ALTE_klima.json]
    python3 pruefen.py wetter

Exit-Code 0, wenn alles passt, sonst 1 mit einer Liste der Fehler. Die
GitHub Actions committen nur bei Exit-Code 0, damit ein kaputter Abruf
(leere Antwort, geaenderte Spalten, halbe Downloads) nicht auf der Seite
landet.

Mit --alt wird zusaetzlich gegen den bisherigen Stand verglichen: Anzahl
und Leistung der Solaranlagen und die Ladepunkte duerfen nicht stark
einbrechen.
"""

import argparse
import datetime as dt
import json
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
DATEN_VZ = os.path.join(os.path.dirname(HIER), "data")

# Fortschrittsbericht 2025: 8,2 °C Jahresmittel 1971-2000 in Koesching.
REFERENZ_SOLL, REFERENZ_TOLERANZ = 8.2, 0.3
# Groessenordnung fuer Ingolstadt (Stand 2026: ~9 600 Anlagen, ~124 MWp).
SOLAR_ANZAHL = (5000, 100000)
SOLAR_KW = (50000, 2000000)
# Hoechstens so viel Rueckgang gegenueber dem bisherigen Stand.
EINBRUCH_MAX = 0.05


def lies(pfad):
    with open(pfad, encoding="utf-8") as f:
        return json.load(f)


def pruefe_klima(d, alt):
    fehler = []
    k = d.get("klima", {})

    ref = k.get("referenz", {}).get("mitteltemperatur")
    if ref is None or abs(ref - REFERENZ_SOLL) > REFERENZ_TOLERANZ:
        fehler.append(f"Referenzmittel 1971-2000 ist {ref} °C, erwartet {REFERENZ_SOLL} ± {REFERENZ_TOLERANZ}")

    jahre = k.get("jahre", [])
    if len(jahre) < 60:
        fehler.append(f"nur {len(jahre)} Klimajahre (erwartet ab 1961)")
    vorjahr = dt.date.today().year - 1
    if not any(j["jahr"] == vorjahr and j["vollstaendig"] for j in jahre):
        # Im Januar liefert der DWD das Vorjahr evtl. noch nicht vollstaendig.
        if dt.date.today().month > 1:
            fehler.append(f"Klimajahr {vorjahr} fehlt oder ist unvollstaendig")
    for j in jahre:
        t = j.get("mitteltemperatur")
        if t is not None and not 5 <= t <= 14:
            fehler.append(f"Jahresmittel {j['jahr']}: {t} °C ist unplausibel")

    reihe = d.get("solar", {}).get("reihe", [])
    if not reihe:
        fehler.append("Solar: keine Reihe")
    else:
        for a, b in zip(reihe, reihe[1:]):
            for feld in ("bestand_anzahl", "bestand_kw"):
                if b[feld] < a[feld]:
                    fehler.append(f"Solar {feld} faellt von {a['jahr']} ({a[feld]}) auf {b['jahr']} ({b[feld]})")
        letzt = reihe[-1]
        if not SOLAR_ANZAHL[0] <= letzt["bestand_anzahl"] <= SOLAR_ANZAHL[1]:
            fehler.append(f"Solar: {letzt['bestand_anzahl']} Anlagen, erwartet {SOLAR_ANZAHL[0]}-{SOLAR_ANZAHL[1]}")
        if not SOLAR_KW[0] <= letzt["bestand_kw"] <= SOLAR_KW[1]:
            fehler.append(f"Solar: {letzt['bestand_kw']} kWp, erwartet {SOLAR_KW[0]}-{SOLAR_KW[1]}")
        if letzt["jahr"] != dt.date.today().year:
            fehler.append(f"Solar: Reihe endet {letzt['jahr']}, nicht im laufenden Jahr")

    if not d.get("speicher", {}).get("reihe"):
        fehler.append("Speicher: keine Reihe")

    laden = d.get("laden", {})
    if not laden.get("ladepunkte", 0) > 0:
        fehler.append(f"Ladepunkte: {laden.get('ladepunkte')}")
    elif laden.get("reihe") and laden["reihe"][-1]["bestand"] != laden["ladepunkte"]:
        fehler.append("Ladepunkte: Reihe und Summe passen nicht zusammen")

    fehler += pruefe_stadt(d.get("stadt") or {})

    if alt:
        def wert(daten, *pfad):
            try:
                for p in pfad:
                    daten = daten[p]
                return daten
            except (KeyError, IndexError, TypeError):
                return None
        for name, pfad in (("Solaranlagen", ("solar", "reihe", -1, "bestand_anzahl")),
                           ("Solar-kWp", ("solar", "reihe", -1, "bestand_kw")),
                           ("Ladepunkte", ("laden", "ladepunkte"))):
            vorher, jetzt = wert(alt, *pfad), wert(d, *pfad)
            if vorher and jetzt is not None and jetzt < vorher * (1 - EINBRUCH_MAX):
                fehler.append(f"{name}: Einbruch von {vorher} auf {jetzt}")
    return fehler


def pruefe_stadt(st):
    """data/klima_stadt.json, eingebunden unter "stadt"."""
    fehler = []
    werte = st.get("thg", {}).get("werte", [])
    if not werte:
        return ["Stadt: keine THG-Bilanz"]
    jahre = [w["jahr"] for w in werte]
    if jahre != list(range(jahre[0], jahre[-1] + 1)):
        fehler.append(f"Stadt: THG-Jahre nicht lückenlos: {jahre}")
    for w in werte:
        for art in ("thg_t", "endenergie_mwh"):
            x = w[art]
            teile = x["strom"] + x["waerme"] + x["verkehr"]
            if abs(teile - x["summe"]) > 2:
                fehler.append(f"Stadt {w['jahr']}: {art} Sektoren {teile} ≠ Summe {x['summe']}")
        if not 0 < w["thg_industrie_t"] < w["thg_t"]["summe"]:
            fehler.append(f"Stadt {w['jahr']}: Industrie-THG {w['thg_industrie_t']} unplausibel")
    t = st["thg"]
    erreicht = (werte[0]["thg_t"]["summe"] - werte[-1]["thg_t"]["summe"]) / (jahre[-1] - jahre[0])
    if abs(erreicht - t.get("minderung_erreicht_t_pro_jahr", 0)) > 1:
        fehler.append(f"Stadt: Minderung pro Jahr {t.get('minderung_erreicht_t_pro_jahr')} passt nicht zu {round(erreicht)}")
    for s in st.get("strom", {}).get("werte", []):
        if not 0 <= s["ee_anteil_prozent"] <= 100:
            fehler.append(f"Stadt {s['jahr']}: EE-Anteil {s['ee_anteil_prozent']} %")
    z = st.get("fahrplan", {}).get("ziele_2035", {})
    for feld in ("pv_dach_kwp", "pv_freiflaeche_kwp", "speicher_kwh", "fernwaerme_km"):
        if not z.get(feld):
            fehler.append(f"Stadt: Ziel 2035 {feld} fehlt")
    g = st.get("gebaeude")
    if g:
        for zeit in ("heute", "ziel_2035"):
            teile = sum(sum(v.values()) for v in g[zeit]["sektoren"].values())
            if abs(teile - sum(g[zeit]["summe"].values())) > 1:
                fehler.append(f"Stadt: Gebäude {zeit} Summe passt nicht")
        if not 10000 < sum(g["heute"]["summe"].values()) < 100000:
            fehler.append("Stadt: Gebäudezahl unplausibel")
    nb = st.get("neubau")
    if nb:
        for wer in ("ingolstadt", "bund"):
            for z in nb[wer]:
                summe = sum(v for k, v in z.items() if k != "jahr")
                if abs(summe - 100) > 2:
                    fehler.append(f"Stadt: Neubau {wer} {z['jahr']} summiert sich auf {summe:.1f} %")
    wp = st.get("waermepumpen")
    if wp:
        jahre = [w["jahr"] for w in wp["werte"]]
        if jahre != list(range(jahre[0], jahre[-1] + 1)):
            fehler.append(f"Stadt: Wärmepumpen-Jahre nicht lückenlos: {jahre}")
        if any(w["anzahl"] < 0 for w in wp["werte"]):
            fehler.append("Stadt: negative Wärmepumpen-Zahl")
    return fehler


def pruefe_wetter(d):
    fehler = []
    t = d.get("temperatur")
    if t is None or not -40 <= t <= 45:
        fehler.append(f"Temperatur {t} °C ist unplausibel")
    if not d.get("station"):
        fehler.append("keine Station")
    if not isinstance(d.get("warnungen"), list):
        fehler.append("Warnungen fehlen")
    try:
        zeit = dt.datetime.fromisoformat(d["zeitpunkt"])
        alter = dt.datetime.now(dt.timezone.utc) - zeit
        if alter > dt.timedelta(hours=6):
            fehler.append(f"Messwert ist {alter} alt")
    except (KeyError, TypeError, ValueError):
        fehler.append(f"Zeitpunkt fehlt oder ist kaputt: {d.get('zeitpunkt')}")
    return fehler


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("was", choices=("klima", "wetter"))
    ap.add_argument("--alt", help="bisherige klima.json zum Vergleich")
    args = ap.parse_args()

    try:
        d = lies(os.path.join(DATEN_VZ, f"{args.was}.json"))
        alt = lies(args.alt) if args.alt and os.path.getsize(args.alt) else None
    except (OSError, ValueError) as e:
        print(f"FEHLER: {e}")
        return 1

    fehler = pruefe_klima(d, alt) if args.was == "klima" else pruefe_wetter(d)
    for f in fehler:
        print(f"FEHLER: {f}")
    if not fehler:
        print(f"{args.was}: in Ordnung")
    return 1 if fehler else 0


if __name__ == "__main__":
    sys.exit(main())
