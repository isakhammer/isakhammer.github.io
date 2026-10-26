"""Lag prosjektets landutvalg uten å endre OWIDs originaldata."""

import csv
import hashlib
from pathlib import Path

BASE = Path(__file__).resolve().parent
SOURCE = BASE / "owid-co2-data.csv"
OUTPUT = BASE / "landutvalg.csv"
COUNTRIES = {
    "United States": ("USA", "Industriland"),
    "Norway": ("Norge", "Industriland"),
    "Brazil": ("Brasil", "Overgangsland"),
    "China": ("Kina", "Overgangsland"),
    "Mozambique": ("Mosambik", "Utviklingsland"),
    "Maldives": ("Maldivene", "Utviklingsland"),
}


def main():
    with SOURCE.open(encoding="utf-8-sig", newline="") as source_file:
        reader = csv.DictReader(source_file)
        original_fields = reader.fieldnames
        assert original_fields and not {"land", "landgruppe"} & set(original_fields)
        records = [row for row in reader if row["country"] in COUNTRIES]

    assert {row["country"] for row in records} == set(COUNTRIES)
    assert len({(row["country"], row["year"]) for row in records}) == len(records)
    order = {name: index for index, name in enumerate(COUNTRIES)}
    records.sort(key=lambda row: (order[row["country"]], int(row["year"])))

    with OUTPUT.open("w", encoding="utf-8-sig", newline="") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=["land", "landgruppe", *original_fields])
        writer.writeheader()
        for row in records:
            name, group = COUNTRIES[row["country"]]
            writer.writerow({"land": name, "landgruppe": group, **row})

    with OUTPUT.open(encoding="utf-8-sig", newline="") as output_file:
        exported = list(csv.DictReader(output_file))
    assert len(exported) == len(records)
    assert all(
        all(result[field] == original[field] for field in original_fields)
        and (result["land"], result["landgruppe"]) == COUNTRIES[original["country"]]
        for result, original in zip(exported, records)
    )

    print(f"Lagret {len(records)} land–år i {OUTPUT}")
    print(f"Originalfil SHA-256: {hashlib.sha256(SOURCE.read_bytes()).hexdigest()}")
    for country, (name, group) in COUNTRIES.items():
        years = [int(row["year"]) for row in records if row["country"] == country]
        print(f"{name} ({group}): {min(years)}–{max(years)}, {len(years)} rader")


if __name__ == "__main__":
    main()
