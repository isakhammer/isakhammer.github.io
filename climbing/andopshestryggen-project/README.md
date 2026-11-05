# Andopshestrygg-prosjektet

Referansepunkt: **68.10012 N, 13.37244 E**, Flakstad. Rapport og data ble laget
5. november 2026. Originalfotoet er bevart i denne mappen. Rute, rutelengde,
gradering og bestigningshistorikk er ikke fastslått i dette datagrunnlaget.

`index.html` er nettsiderapporten. Passord: `klatring`. Dette er en enkel
visningssperre; direkte filer i et offentlig repo er fortsatt tilgjengelige.
Rapporten bruker felles stilark fra naboprosjektet `../sordalen-project/`.

## Terrengdata

Offisiell kilde: [Kartverket DTM1 33-135-175](https://nedlasting.geonorge.no/hoydedata/DTM1/33-135-175.tif).
Originalen på 608 MB ligger lokalt i Sørdalen-mappen og holdes utenfor Git.
En lokal symbolsk lenke gjør den tilgjengelig for analyseskriptet uten å kopiere den.
Det separate GeoTIFF-utsnittet i `data/` dekker 2 × 2 km ved dette prosjektet.
Oppløsningen er kontrollert til 1 m, EPSG:25833 og 100 % gyldige høydeceller.
Høydereferansen er NN2000, EPSG:5941.

Interpolert punkthøyde er **641,7 m NN2000**. Rapporten fokuserer på én valgt
fallprofil, **33° fra rutenettnord**, funnet ved å undersøke størst netto fall
over 20 horisontale meter i 360 retninger med 1° intervall. Over dette strekket
er fallet **118,2 m**, tilsvarende **80,4°**. Videre langs samme profil er fallet
**261,4 m over 100 m** (69,1°) og **339,0 m over 300 m** (48,5°).
En annen målelengde kan gi en annen bratteste retning. Dette er en rett
terrengprofil, ikke måling av hele vegghøyden, klatreruten eller taulengden.
De tre opprinnelige kompassprofilene er beholdt som supplerende CSV-filer;
nettsiden, kartet og 3D viser `profile_steepest.csv`.

Prosjekteieren opplyser at fotoet er **tatt fra Andopen**. Nøyaktig kameraposisjon
er ukjent. Startvinkelen i 3D er omtrent fra Andopen-siden, basert på retningen
mot et representativt stedsnavnpunkt, ikke en kalibrert rekonstruksjon av fotoet.

3D-visningen dekker 1 × 1 km med 2 meters visningsnett og uten vertikal
overdrivelse. DTM kan ikke gjengi overheng eller flere høyder på samme posisjon.

## Geologi

NGU Berggrunn N250 klassifiserer punktet som **monzonitt**, i en enhet av
monzonitt, syenitt til kvartsmonzonitt, stedvis deformert til gneis. Den inngår
i Lofotmangeritten og har angitt dannelsesalder **1800–1770 Ma**. Kildeoppslaget
er lagret i `metadata/geology.txt`, med forespørselslenke i `metadata/sources.json`.
Målestokken er 1:250 000; dette er ingen bestemmelse av en bergartsprøve fra ryggen.

## Gjenskape figurer

Bruk Python-miljøet beskrevet i Sørdalen-prosjektets `requirements.txt` og kjør
`scripts/analyze.py`. Analysen kan også bruke det vedlagte utsnittet dersom
originalfilen mangler, men originalens kontrollsum blir da ikke beregnet på nytt.
Alle høydeprofiler, kart, 3D-figurer og kontrollverdier ligger i `outputs/` og `metadata/`.
Kartverket krediteres etter NLOD 2.0.

Inngangssiden og klatreoversikten har ingen prosjektbilder. Alle bildeelementer
i rapportene bruker `data-src` og får først `src` etter godkjent passord.
Dette hindrer automatisk innlasting før åpning, men beskytter ikke direkte
filer eller eldre Git-historikk i det offentlige repoet.
