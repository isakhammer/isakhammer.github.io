# Klima og byrdefordeling

Interaktivt undervisningsverktøy med befolkning, BNP per innbygger,
årlige CO₂-utslipp, CO₂ per innbygger og kumulative CO₂-utslipp.
Perioden er 1980–2024; BNP-data går til 2022.

`index.html` er en selvstendig side uten eksterne skript eller biblioteker.
Den kan også åpnes direkte i en nettleser uten internett.

## Data

Kilde: [Our World in Data](https://github.com/owid/co2-data), basert på
Global Carbon Budget (2025) og Maddison Project Database 2023.
Definisjoner og underliggende kilder finnes i
[kodeboken](https://github.com/owid/co2-data/blob/master/owid-co2-codebook.csv).

Originalfilen ligger i `data/co2/owid-co2-data.csv` og er uendret.
Folketall for samme år brukes i alle beregninger per innbygger.
EU + UK er dagens EU-27 pluss Storbritannia for hele tidsserien.
Tall per innbygger er totalen delt på samlet befolkning.

Slovakias manglende BNP i 1980–1984 er anslått med gjennomsnittet for
1985–1989. Disse punktene er merket som anslag i EU + UK-serien.
Verdens BNP-serie er utelatt på grunn av store hull. Maldivene har ingen
BNP-serie i datakilden. Manglende verdier blir ikke satt til null.

## Gjenskape diagramdata

Kjør fra prosjektmappen:

```sh
python3 data/co2/prepare_chart_data.py
```

Skriptet leser den lokale originalfilen og oppdaterer dataene inne i
`index.html`. Det laster ikke ned nyere data. Oppdater originalfil,
kildereferanser og dokumentasjon samlet når en ny dataversjon tas i bruk.

Årlig befolkningsvekst beregnes som (folketall i året / folketall året før − 1) × 100. Verdien for 1980 bruker folketallet fra 1979. For EU + UK beregnes veksten fra gruppens samlede folketall. Vekstfanen bruker lineær skala slik at negative verdier vises.
