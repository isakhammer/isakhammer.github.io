# CO₂-data til prosjektet om byrdefordeling

`landutvalg.csv` inneholder de seks valgte landene. Filen har 1 200 rader,
med én rad per land og år. Alle kolonnene og originalverdiene fra OWID er
bevart. To kolonner er lagt til: `land` med norsk navn og `landgruppe` med
prosjektets inndeling. Gruppene er oppgitt av brukeren og er ikke en
klassifisering fra OWID.

| Land | Landgruppe | Navn i originaldata | År med rader |
| --- | --- | --- | --- |
| USA | Industriland | United States | 1800–2024 |
| Norge | Industriland | Norway | 1750–2024 |
| Brasil | Overgangsland | Brazil | 1850–2024 |
| Kina | Overgangsland | China | 1850–2024 |
| Mosambik | Utviklingsland | Mozambique | 1850–2024 |
| Maldivene | Utviklingsland | Maldives | 1850–2024 |

Årsintervallene viser hvilke rader filen inneholder. Datadekningen varierer
mellom indikatorer. Tomme felt betyr manglende data, ikke null utslipp.

## Filer og kilde

- `owid-co2-data.csv`: eksisterende, fullstendig lokal kildefil fra Our World in Data.
- `landutvalg.csv`: landutvalget, satt opp 26. oktober 2026 fra den lokale kildefilen.
- `prepare_project_data.py`: gjenskaper landutvalget og kontrollerer at originalverdiene er bevart.

Kilde og dokumentasjon: https://github.com/owid/co2-data

Definisjoner, enheter og underliggende kilder per indikator:
https://github.com/owid/co2-data/blob/master/owid-co2-codebook.csv

Ved bruk bør både Our World in Data og de underliggende datakildene oppgis,
slik det beskrives i kildens dokumentasjon.

SHA-256 for den lokale originalfilen:
`7f78e2b218ce4bb8c538bbec04fdc9a7982e8d40bff972e650df603899edd5f6`

## Aktuelle indikatorer

| Kolonne | Innhold | Enhet |
| --- | --- | --- |
| `co2` | Årlige CO₂-utslipp fra fossile brensler og industri, uten arealbruksendringer | Millioner tonn CO₂ |
| `co2_per_capita` | Tilsvarende årlige utslipp per innbygger | Tonn CO₂ per person |
| `cumulative_co2` | Akkumulerte CO₂-utslipp uten arealbruksendringer fra første tilgjengelige år | Millioner tonn CO₂ |
| `co2_including_luc` | Årlige CO₂-utslipp inkludert arealbruksendringer | Millioner tonn CO₂ |
| `cumulative_co2_including_luc` | Akkumulerte CO₂-utslipp inkludert arealbruksendringer fra første tilgjengelige år | Millioner tonn CO₂ |
| `consumption_co2_per_capita` | Forbruksbaserte CO₂-utslipp per innbygger | Tonn CO₂ per person |
| `population` | Folketall | Personer |

I denne lokale kopien finnes årlige CO₂-utslipp, utslipp per innbygger og
akkumulerte CO₂-utslipp til og med 2024 for alle seks land.
Forbruksbaserte utslipp per innbygger finnes til og med 2023 for fem av landene,
men mangler for Maldivene. CO₂ og samlede klimagassutslipp er forskjellige mål.

## Filformat og oppdatering

CSV-filen bruker komma som skilletegn, punktum som desimaltegn og UTF-8 med
BOM for norske bokstaver. Ved import i et regneark velges disse innstillingene
dersom programmet ikke gjenkjenner dem automatisk.

For å gjenskape utvalget fra den lokale originalfilen:

```bash
python3 data/co2/prepare_project_data.py
```

Skriptet laster ikke ned nye data. Hvis originalfilen oppdateres, må
årsintervaller, datadekning og kontrollsummen i denne beskrivelsen også oppdateres.
