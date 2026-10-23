#!/usr/bin/env python3
"""
Liest die Excel-Dateien der Stabsstelle Klima ein und schreibt daraus
data/klima_stadt.json (nur Summen je Jahr, CC BY 4.0).

    python3 stadt_einlesen.py                 # Dateien aus ../input/
    python3 stadt_einlesen.py --ordner PFAD

Laeuft lokal, nicht in der GitHub Action: Die Rohdateien liegen nur im
Projektordner (input/ ist in .gitignore) und kommen nicht ins Repo. Ins
Repo kommt nur das Ergebnis. Danach klima_bauen.py laufen lassen, das die
Datei unter "stadt" in data/klima.json einbindet.

Eingelesen werden die beiden Dateien aus Teil A der Datenanfrage, fuer die
die Stadt CC BY 4.0 freigegeben hat:

- "Energie- und THG-Bilanz bis 2035.xlsx": Endenergie und THG je Sektor,
  Stromverbrauch und lokale EE-Erzeugung, Soll-Pfad nach IKSK.
- "…Reduktionsfahrplan….xlsx": Pfade fuer PV, Speicher und Fernwaerme bis
  2035.

Teil B (Verwaltung, Liegenschaften, Waermepumpen, Eignungsgebiete) folgt
erst nach Freigabe.

Reiter werden ueber den Namen, Spalten ueber ihre Ueberschrift gefunden,
nicht ueber feste Zellen. Fehlt eine Ueberschrift, bricht das Skript ab,
statt still falsche Zahlen zu schreiben. Nur Python-Standardbibliothek:
xlsx sind ZIP-Dateien mit XML.
"""

import argparse
import datetime as dt
import glob
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

HIER = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(HIER)
DATEN_VZ = os.path.join(PROJEKT, "data")

QUELLE = "Stabsstelle Klima der Stadt Ingolstadt"
LIZENZ = "CC BY 4.0"
LIZENZ_URL = "https://creativecommons.org/licenses/by/4.0/deed.de"

BILANZ_MUSTER = "*THG-Bilanz*.xlsx"
FAHRPLAN_MUSTER = "*Reduktionsfahrplan*.xlsx"

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
    "cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
    "dcterms": "http://purl.org/dc/terms/",
}


class Fehler(Exception):
    pass


# ---------------------------------------------------------------- xlsx lesen

def spalte_nr(buchstaben):
    n = 0
    for b in buchstaben:
        n = n * 26 + ord(b) - 64
    return n


class Mappe:
    """Eine xlsx-Datei. Liefert Reiter als {(zeile, spalte): wert}."""

    def __init__(self, pfad):
        self.pfad = pfad
        self.name = os.path.basename(pfad)
        self.zip = zipfile.ZipFile(pfad)
        self.texte = []
        if "xl/sharedStrings.xml" in self.zip.namelist():
            for si in ET.fromstring(self.zip.read("xl/sharedStrings.xml")).findall("m:si", NS):
                self.texte.append("".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])))
        mappe = ET.fromstring(self.zip.read("xl/workbook.xml"))
        ziele = {r.get("Id"): r.get("Target") for r in
                 ET.fromstring(self.zip.read("xl/_rels/workbook.xml.rels")).findall("pr:Relationship", NS)}
        self.reiter = {}
        for b in mappe.find("m:sheets", NS):
            ziel = ziele[b.get("{%s}id" % NS["r"])].lstrip("/")
            self.reiter[b.get("name")] = ziel if ziel.startswith("xl/") else "xl/" + ziel

    def stand(self):
        """Datum der letzten Aenderung laut Dokumenteigenschaften."""
        try:
            kern = ET.fromstring(self.zip.read("docProps/core.xml"))
            return kern.find("dcterms:modified", NS).text[:10]
        except (KeyError, AttributeError):
            return None

    def blatt(self, name):
        if name not in self.reiter:
            raise Fehler(f"{self.name}: Reiter '{name}' fehlt (vorhanden: {', '.join(self.reiter)})")
        zellen = {}
        for c in ET.fromstring(self.zip.read(self.reiter[name])).iter("{%s}c" % NS["m"]):
            m = re.match(r"([A-Z]+)(\d+)$", c.get("r"))
            v = c.find("m:v", NS)
            if c.get("t") == "s" and v is not None:
                wert = self.texte[int(v.text)]
            elif c.get("t") == "inlineStr":
                wert = "".join(t.text or "" for t in c.iter("{%s}t" % NS["m"]))
            elif c.get("t") in ("str", "e"):
                wert = v.text if v is not None else None
            elif v is not None:
                wert = float(v.text)
            else:
                continue
            if isinstance(wert, str):
                wert = " ".join(wert.split())
                if not wert:
                    continue
            zellen[(int(m.group(2)), spalte_nr(m.group(1)))] = wert
        return Blatt(f"{self.name} / {name}", zellen)


class Blatt:
    def __init__(self, name, zellen):
        self.name = name
        self.zellen = zellen

    def finde(self, text, zeilen=None, ab_spalte=1, ab_zeile=1):
        """Erste Zelle (zeile, spalte), deren Text mit `text` beginnt."""
        treffer = sorted(
            (z, s) for (z, s), w in self.zellen.items()
            if isinstance(w, str) and w.startswith(text) and s >= ab_spalte and z >= ab_zeile
            and (zeilen is None or z in zeilen))
        if not treffer:
            raise Fehler(f"{self.name}: Überschrift '{text}' nicht gefunden")
        return treffer[0]

    def zahl(self, zeile, spalte):
        w = self.zellen.get((zeile, spalte))
        return w if isinstance(w, float) else None

    def jahre(self, spalte, ab_zeile, bis_zeile=None):
        """{jahr: zeile} fuer alle Zeilen mit einer Jahreszahl in `spalte`."""
        out = {}
        for (z, s), w in sorted(self.zellen.items()):
            if s == spalte and z > ab_zeile and (bis_zeile is None or z <= bis_zeile) \
                    and isinstance(w, float) and 1990 <= w <= 2050 and w == int(w):
                out.setdefault(int(w), z)
        if not out:
            raise Fehler(f"{self.name}: keine Jahreszahlen in Spalte {spalte} ab Zeile {ab_zeile}")
        return out


def runde(x, stellen=0):
    if x is None:
        return None
    return round(x) if stellen == 0 else round(x, stellen)


# ---------------------------------------------------------------- Bilanz

def bilanz(mappe):
    """Endenergie und THG je Sektor; Ist-Jahre und Pfad bis 2035."""
    g = mappe.blatt("Energie_Emissionen_Gesamt")
    _, sp_energie = g.finde("Energiebilanz")
    _, sp_thg = g.finde("Reale Entwicklung Emissionen")
    _, sp_soll = g.finde("Soll-Reduktionspfad")
    kopf, _ = g.finde("Strom", ab_spalte=sp_energie)
    sp = {}
    for gruppe, ab in (("energie", sp_energie), ("thg", sp_thg)):
        for sektor, text in (("strom", "Strom"), ("waerme", "Wärme"), ("verkehr", "Verkehr"), ("summe", "Summe")):
            sp[gruppe, sektor] = g.finde(text, zeilen={kopf}, ab_spalte=ab)[1]
    sp_soll_summe = g.finde("Summe", zeilen={kopf}, ab_spalte=sp_soll)[1]
    jahre_e = g.jahre(sp_energie - 1, kopf)
    jahre_t = g.jahre(sp_thg - 1, kopf)

    # Ist ist, wofuer die Verkehrsbilanz Werte hat. Danach stehen in der
    # Tabelle Hochrechnungen, in denen Verkehr 0 und Waerme konstant ist.
    v = mappe.blatt("Energiebilanz_Verkehr")
    vz, _ = v.finde("Jahr")
    v_summe = v.finde("Summe", zeilen={vz})[1]
    ist_jahre = sorted(j for j, z in v.jahre(v.finde("Jahr")[1], vz).items() if v.zahl(z, v_summe))

    # Industrie-Anteil: Strom (Summe Industrie) + Waerme (Summe Industrie)
    s = mappe.blatt("Energiebilanz_Strom")
    s_kopf, s_jahr = s.finde("Jahr")
    s_ind = s.finde("Summe Industrie")
    w = mappe.blatt("Emissionen_Wärme")
    w_kopf, w_jahr = w.finde("Jahr")
    w_ind = w.finde("Summe Industrie", zeilen={w_kopf})[1]
    s_jahre = s.jahre(s_jahr, s_kopf)
    w_jahre = w.jahre(w_jahr, w_kopf)

    werte = []
    for j in ist_jahre:
        ze, zt = jahre_e[j], jahre_t[j]
        z = {"jahr": j}
        z["endenergie_mwh"] = {k: runde(g.zahl(ze, sp["energie", k])) for k in ("strom", "waerme", "verkehr", "summe")}
        z["thg_t"] = {k: runde(g.zahl(zt, sp["thg", k])) for k in ("strom", "waerme", "verkehr", "summe")}
        ind = (s.zahl(s_jahre[j], s_ind[1]) or 0) + (w.zahl(w_jahre[j], w_ind) or 0)
        z["thg_industrie_t"] = runde(ind)
        werte.append(z)

    pfad = []
    for j, zt in sorted(jahre_t.items()):
        if j < ist_jahre[0]:
            continue
        pfad.append({
            "jahr": j,
            "soll_t": runde(g.zahl(zt, sp_soll_summe)),
            "hochrechnung_t": None if j in ist_jahre else runde(g.zahl(zt, sp["thg", "summe"])),
        })

    erstes, letztes = werte[0], werte[-1]
    jahre = letztes["jahr"] - erstes["jahr"]
    erreicht = (erstes["thg_t"]["summe"] - letztes["thg_t"]["summe"]) / jahre
    ziel = [p for p in pfad if p["jahr"] == 2035][0]["soll_t"]
    noetig = (erstes["thg_t"]["summe"] - ziel) / (2035 - erstes["jahr"])
    return {
        "methode": "BISKO",
        "basisjahr": erstes["jahr"],
        "bilanzjahr": letztes["jahr"],
        "werte": werte,
        "pfad": pfad,
        "minderung_erreicht_t_pro_jahr": runde(erreicht),
        "minderung_noetig_t_pro_jahr": runde(noetig),
    }


def strom(mappe, ab_jahr):
    """Stromverbrauch nach Sektor und lokale EE-Erzeugung je Ist-Jahr.
    Erst ab dem Basisjahr der Bilanz: 2017 steckt Audi noch unter Sonstige,
    und die EEG-Einspeisung fehlt."""
    s = mappe.blatt("Energiebilanz_Strom")
    kopf, sp_jahr = s.finde("Jahr")
    sektoren = {}
    for feld, text in (("haushalte", "Haushalte"), ("ghd", "GHD"), ("industrie", "Industrie"),
                       ("stadtverwaltung", "Stadtverwaltung"), ("oeffentlich", "Öffentl. Einrichtungen"),
                       ("verkehr", "Verkehr"), ("sonstige", "Sonstige")):
        sektoren[feld] = s.finde(text, zeilen={kopf})[1]
    sp_summe = s.finde("Summe", zeilen={kopf})[1]

    ee_z, ee_sp = s.finde("Erneuerbare Energien in Ingolstadt")
    eeg = s.finde("EEG-Einspeisung", ab_spalte=ee_sp)
    direkt = s.finde("Direktvermarktung", zeilen={eeg[0]}, ab_spalte=ee_sp)
    eigen = s.finde("PV Eigenverbrauch", zeilen={eeg[0]}, ab_spalte=ee_sp)
    ee_summe = s.finde("Summe", zeilen={eeg[0]}, ab_spalte=ee_sp)
    ee_anteil = s.finde("Anteil EE in Ingolstadt", zeilen={eeg[0]}, ab_spalte=ee_sp)
    traeger_zeile = eeg[0] + 1

    def traeger(ab, bis, text):
        for spalte in range(ab, bis):
            w = s.zellen.get((traeger_zeile, spalte))
            if isinstance(w, str) and w.startswith(text):
                return spalte
        raise Fehler(f"{s.name}: Energieträger '{text}' zwischen Spalte {ab} und {bis} fehlt")

    sp_eeg = {"wasser": traeger(eeg[1], direkt[1], "Wasserkraft"),
              "biomasse": traeger(eeg[1], direkt[1], "Biomasse"),
              "pv": traeger(eeg[1], direkt[1], "Solar")}
    sp_direkt = {"wasser": traeger(direkt[1], eigen[1], "Wasserkraft"),
                 "pv": traeger(direkt[1], eigen[1], "Solar")}

    werte = []
    for j, z in sorted(s.jahre(sp_jahr, traeger_zeile).items()):
        if j < ab_jahr or s.zahl(z, sektoren["haushalte"]) is None:
            continue  # vor dem Basisjahr bzw. ab hier Prognose
        n = lambda sp: s.zahl(z, sp) or 0  # noqa: E731
        werte.append({
            "jahr": j,
            "verbrauch_mwh": runde(s.zahl(z, sp_summe)),
            "sektoren_mwh": {k: runde(s.zahl(z, sp)) for k, sp in sektoren.items()},
            "ee_mwh": {
                "wasser": runde(n(sp_eeg["wasser"]) + n(sp_direkt["wasser"])),
                "biomasse": runde(n(sp_eeg["biomasse"])),
                "pv": runde(n(sp_eeg["pv"]) + n(sp_direkt["pv"]) + n(eigen[1])),
            },
            "ee_summe_mwh": runde(s.zahl(z, ee_summe[1])),
            "ee_anteil_prozent": runde((s.zahl(z, ee_anteil[1]) or 0) * 100, 1),
        })
    return {"werte": werte,
            "hinweis": "Wasserkraft in der Direktvermarktung als langjähriges Mittel, PV-Eigenverbrauch hochgerechnet aus dem Marktstammdatenregister."}


# ---------------------------------------------------------------- Fahrplan

def fahrplan(mappe):
    """Pfade PV, Speicher, Fernwaerme. Ist-Werte nimmt das Dashboard aus dem
    MaStR, hier zaehlt vor allem der Pfad ab dem ersten Planjahr."""
    p = mappe.blatt("Strom_Emissionen")
    pz, _ = p.finde("PV-Zubau", ab_zeile=60)
    kopf, sp_jahr = p.finde("Jahr", ab_zeile=pz)
    sp_dach = p.finde("Dach-PV kumuliert", zeilen={kopf})[1]
    sp_ff = p.finde("Freiflächen-PV", zeilen={kopf})[1]
    sp_sp_jahr = p.finde("Speicher", zeilen={kopf})[1]
    sp_kap = p.finde("Nutzbare Kapazität kumuliert", zeilen={kopf})[1]

    pv = []
    for j, z in sorted(p.jahre(sp_jahr, kopf).items()):
        pv.append({"jahr": j, "dach_kwp": runde(p.zahl(z, sp_dach)), "freiflaeche_kwp": runde(p.zahl(z, sp_ff))})
    # Freiflaechen stehen erst ab dem ersten Planjahr in der Tabelle.
    plan_ab = min(x["jahr"] for x in pv if x["freiflaeche_kwp"])
    pv = [dict(x, art="pfad" if x["jahr"] >= plan_ab else "ist") for x in pv]
    speicher = [{"jahr": j, "kwh": runde(p.zahl(z, sp_kap)), "art": "pfad" if j >= plan_ab else "ist"}
                for j, z in sorted(p.jahre(sp_sp_jahr, kopf).items())]

    w = mappe.blatt("Wärme_Emissionen")
    wz, _ = w.finde("Wärmenetzausbau")
    w_kopf, w_jahr = w.finde("Geschäftsjahr", ab_zeile=wz)
    w_km = w.finde("Fernwärmetrasse in km", zeilen={w_kopf})[1]
    w_zubau = w.finde("Jährlicher Zubau", zeilen={w_kopf})[1]
    fw = [{"jahr": j, "km": runde(w.zahl(z, w_km), 1), "zubau_km": runde(w.zahl(z, w_zubau), 1),
           "art": "pfad" if j >= plan_ab else "ist"}
          for j, z in sorted(w.jahre(w_jahr, w_kopf).items())]
    # Plausibel nur, wenn der Zubau ab dem Planjahr gleichmaessig ist.
    plan_zubau = {x["zubau_km"] for x in fw if x["art"] == "pfad"}
    if len(plan_zubau) != 1:
        raise Fehler(f"{w.name}: Fernwärme-Zubau ab {plan_ab} nicht gleichmäßig ({sorted(plan_zubau)})")

    ziel = pv[-1]
    return {
        "plan_ab": plan_ab,
        "pv": pv,
        "speicher": speicher,
        "fernwaerme": fw,
        "ziele_2035": {
            "pv_dach_kwp": ziel["dach_kwp"],
            "pv_freiflaeche_kwp": ziel["freiflaeche_kwp"],
            "speicher_kwh": speicher[-1]["kwh"],
            "fernwaerme_km": fw[-1]["km"],
        },
    }


# ---------------------------------------------------------------- main

def eine_datei(ordner, muster):
    treffer = sorted(glob.glob(os.path.join(ordner, muster)))
    treffer = [t for t in treffer if not os.path.basename(t).startswith("~$")]
    if len(treffer) != 1:
        raise Fehler(f"{muster} in {ordner}: {len(treffer)} Treffer, erwartet genau einer")
    return Mappe(treffer[0])


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--ordner", default=os.path.join(PROJEKT, "input"), help="Ordner mit den Excel-Dateien der Stadt")
    args = ap.parse_args()

    try:
        b = eine_datei(args.ordner, BILANZ_MUSTER)
        f = eine_datei(args.ordner, FAHRPLAN_MUSTER)
        daten = {
            "_hinweis": "Erzeugt von scraper/stadt_einlesen.py aus Excel-Dateien der Stabsstelle Klima. "
                        "Nicht von Hand ändern, sondern neu einlesen.",
            "erzeugt_am": dt.date.today().isoformat(),
            "quelle": QUELLE,
            "lizenz": LIZENZ,
            "lizenz_url": LIZENZ_URL,
            "dateien": [{"name": m.name, "stand": m.stand()} for m in (b, f)],
            "thg": bilanz(b),
        }
        daten.update({
            "strom": strom(b, daten["thg"]["basisjahr"]),
            "fahrplan": fahrplan(f),
        })
    except Fehler as e:
        print(f"FEHLER: {e}")
        return 1

    ziel = os.path.join(DATEN_VZ, "klima_stadt.json")
    with open(ziel, "w", encoding="utf-8") as fh:
        json.dump(daten, fh, ensure_ascii=False, indent=1)
        fh.write("\n")

    t = daten["thg"]
    letzt = t["werte"][-1]
    print(f"THG {t['basisjahr']}–{t['bilanzjahr']}: {letzt['thg_t']['summe']:,} t im Jahr {letzt['jahr']}, "
          f"Minderung {t['minderung_erreicht_t_pro_jahr']:,} t/Jahr (nötig {t['minderung_noetig_t_pro_jahr']:,})")
    s = daten["strom"]["werte"][-1]
    print(f"Strom {s['jahr']}: {s['verbrauch_mwh']:,} MWh, EE-Anteil {s['ee_anteil_prozent']} %")
    z = daten["fahrplan"]["ziele_2035"]
    print(f"Ziele 2035: PV {z['pv_dach_kwp']:,} + {z['pv_freiflaeche_kwp']:,} kWp, "
          f"Speicher {z['speicher_kwh']:,} kWh, Fernwärme {z['fernwaerme_km']} km")
    print("Geschrieben: data/klima_stadt.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
