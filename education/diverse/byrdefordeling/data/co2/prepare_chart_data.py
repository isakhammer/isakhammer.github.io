"""Oppdater innebygde diagramdata fra den uendrede lokale OWID-filen."""

import csv
import json
import re
from decimal import Decimal
from pathlib import Path

BASE = Path(__file__).resolve().parent
CHART = BASE.parent.parent / "klimaansvar.html"
if not CHART.exists():
    CHART = BASE.parent.parent / "index.html"
COUNTRIES = {
    "USA": "United States", "Kina": "China",
    "Norge": "Norway", "Brasil": "Brazil",
    "Maldivene": "Maldives", "Mosambik": "Mozambique",
}
# Fast geografisk gruppe: dagens EU-27 pluss Storbritannia, for hele perioden.
EU_MEMBERS = "Austria Belgium Bulgaria Croatia Cyprus Czechia Denmark Estonia Finland France Germany Greece Hungary Ireland Italy Latvia Lithuania Luxembourg Malta Netherlands Poland Portugal Romania Slovakia Slovenia Spain Sweden".split()
MEMBERS = EU_MEMBERS + ["United Kingdom"]


def main():
    with (BASE / "owid-co2-data.csv").open(encoding="utf-8-sig", newline="") as source:
        lookup = {(r["country"], int(r["year"])): r for r in csv.DictReader(source)}
    assert len(MEMBERS) == 28
    # Brukeren har bedt om gjennomsnitt for å fylle de fem manglende årene.
    slovakia_average = sum(Decimal(lookup[("Slovakia", y)]["gdp"]) for y in range(1985, 1990)) / 5
    data = []
    for label, source_name in COUNTRIES.items():
        values = []
        for year in range(1940, 2025):
            row = lookup[(source_name, year)]
            pop = int(row["population"])
            gdp = float(row["gdp"]) if row["gdp"] else None
            annual = float(row["co2"]) if row["co2"] else None
            per_capita = float(row["co2_per_capita"]) if row["co2_per_capita"] else None
            if annual is not None and per_capita is not None:
                assert abs(annual * 1e6 / pop - per_capita) <= .0005 * 1e6 / pop + .0005 + 1e-9
            values.append([year, annual, gdp / 1e9 if gdp is not None else None,
                           float(row["cumulative_co2"]) if row["cumulative_co2"] else None,
                           per_capita, pop, gdp / pop if gdp is not None else None, False])
        data.append({"name": label, "values": values})

    values = []
    for year in range(1940, 2025):
        rows = [lookup[(name, year)] for name in MEMBERS]
        published = [lookup[(name, year)] for name in ["European Union (27)", "United Kingdom"]]
        emissions_rows = rows if year >= 1980 else published
        pop = sum(int(row["population"]) for row in published)
        annual = float(sum(Decimal(row["co2"]) for row in emissions_rows))
        cumulative = float(sum(Decimal(row["cumulative_co2"]) for row in emissions_rows))
        components, estimated = [], False
        for name, row in zip(MEMBERS, rows):
            if row["gdp"]:
                components.append(Decimal(row["gdp"]))
            elif name == "Slovakia" and 1980 <= year <= 1984:
                components.append(slovakia_average)
                estimated = True
        gdp = float(sum(components)) if len(components) == len(MEMBERS) else None
        published = [lookup[(name, year)] for name in ["European Union (27)", "United Kingdom"]]
        assert pop == sum(int(row["population"]) for row in published)
        assert abs(annual - sum(float(row["co2"]) for row in published)) < .1
        assert abs(cumulative - sum(float(row["cumulative_co2"]) for row in published)) < .1
        values.append([year, annual, gdp / 1e9 if gdp is not None else None,
                       cumulative, annual * 1e6 / pop, pop,
                       gdp / pop if gdp is not None else None, estimated])
    data.append({"name": "EU + UK", "values": values})
    assert sum(row[7] for row in values) == 5
    world = []
    for year in range(1940, 2025):
        row = lookup[("World", year)]
        pop = int(row["population"])
        gdp = float(row["gdp"]) if row["gdp"] else None
        annual = float(row["co2"])
        per_capita = float(row["co2_per_capita"])
        assert abs(annual * 1e6 / pop - per_capita) < .001
        world.append([year, annual, gdp / 1e9 if gdp is not None else None,
                      float(row["cumulative_co2"]), per_capita, pop,
                      gdp / pop if gdp is not None else None, False])
    assert all(row[i] is not None for row in world for i in [1, 3, 4])
    assert sum(row[6] is not None for row in world) == 16
    # Store BNP-hull: behold originaltallene, men utelat serien i BNP-fanen.
    data.append({"name": "Verden", "values": world, "omitMetrics": ["gdp"]})
    # Prosentvis vekst fra året før; 1940 bruker faktisk folketall fra 1939.
    for country in data:
        names = ["European Union (27)", "United Kingdom"] if country["name"] == "EU + UK" else ["World" if country["name"] == "Verden" else COUNTRIES[country["name"]]]
        previous = sum(int(lookup[(name, 1939)]["population"]) for name in names)
        for row in country["values"]:
            row.append((row[5] / previous - 1) * 100)
            previous = row[5]
    source_keys = ["coal_co2", "oil_co2", "gas_co2", "cement_co2", "flaring_co2", "other_industry_co2"]
    for country in data:
        names = ["European Union (27)", "United Kingdom"] if country["name"] == "EU + UK" else ["World" if country["name"] == "Verden" else COUNTRIES[country["name"]]]
        country["sources"] = []
        for year in range(1940, 2025):
            if country["name"] == "EU + UK":
                names = MEMBERS if year >= 1980 else ["European Union (27)", "United Kingdom"]
            parts = []
            for key in source_keys:
                available = [Decimal(lookup[(name, year)][key]) for name in names if lookup[(name, year)][key]]
                parts.append(float(sum(available)) if available else None)
            total = next(row[1] for row in country["values"] if row[0] == year)
            if total is not None:
                assert abs(sum(value for value in parts if value is not None) - total) < .05
            country["sources"].append([year, *parts])
    html = CHART.read_text()
    pattern = r'(<script id="chart-data" type="application/json">)(.*?)(</script>)'
    match = re.search(pattern, html, re.S)
    assert match
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    CHART.write_text(html[:match.start(2)] + payload + html[match.end(2):])
    print(f"Oppdatert {len(data)} serier, 1940–2024. EU + UK: 28 land.")
    print(f"Slovakia BNP, gjennomsnitt 1985–1989: {slovakia_average} internasjonale dollar.")
    for country in data:
        last = next((row for row in reversed(country["values"]) if row[6] is not None), None)
        if last:
            print(f"{country['name']}: BNP per innbygger {last[0]} = {last[6]:.1f}")
        else:
            print(f"{country['name']}: BNP-data mangler.")


if __name__ == "__main__":
    main()
