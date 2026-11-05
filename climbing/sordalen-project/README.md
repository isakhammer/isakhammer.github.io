# Sørdalsveggen-prosjektet: høydedata, bilder og prosjektrapport

Arbeidsmappe: `climbing/sordalen-project/`. Prosjektets vegg er **ubesteget**, etter
opplysning fra prosjektets eier. Originalbildene i `pics/` er bevart uendret.
`index.html` er den samlede nettsiderapporten, med bildene, interaktiv profil og
3D-visning. Passordet er `klatring`. Dette er en enkel visningssperre i nettleseren;
offentlige Git-filer og direkte lenker til data blir ikke private av denne.

Punkt: **68.0902051° N, 13.3967616° E**, Sørdalen, Flakstad.
Lastet ned og kontrollert **5. november 2026**. Arbeidet ligger på grenen
`codex/sordalen-elevation` i `isakhammer/isakhammer.github.io`.

## Filer og dekning

| Fil | Innhold |
| --- | --- |
| `data/33-135-175.tif` | Original DTM1-rute fra Kartverket/Geonorge, 608 490 831 byte. Lokal fil, holdes utenfor Git på grunn av størrelsen. |
| `data/sordalen_dtm1_2km.tif` | Tapsfritt komprimert utsnitt på 2 × 2 km, 2000 × 2000 celler à 1 meter. Følger med i Git. |
| `outputs/terrain_map.png` | Terrengkart med punktet og tre profillinjer. Nord opp. |
| `outputs/height_profiles.png` | Tre 1 km lange terrengprofiler og nærbilde av nord–sør-profilen. |
| `outputs/profile_*.csv` | Høyder for hver meter langs profilene, med UTM- og geografiske koordinater. |
| `outputs/transects.geojson` | Punkt og profillinjer i WGS84, for eksempel til QGIS. |
| `outputs/terrain_3d.html` | Selvstendig, interaktiv 3D-figur. Åpnes i nettleser uten internett. |
| `outputs/terrain_3d.png` | Statisk 3D-bilde av et område på 1 × 1 km. |
| `metadata/project_metadata.json` | Offisielle prosjektmetadata og prosjektavgrensninger. Avgrensningene er i EPSG:25833. |
| `metadata/analysis_summary.json` | Kontrollerte rasteregenskaper, høyder og SHA-256 for originalfilen. |
| `metadata/dtm1_tile.atom` | Kartverkets katalogoppføring for originalruten. |
| `metadata/sources.json` | Kilder, metadataforespørsel, lisens og nedlastingsdato. |

**Kontrollert:** Punktet ligger i originalruten, som har 1 meters celleavstand,
én kanal med flyttall og koordinatsystem **ETRS89 / UTM sone 33N (EPSG:25833)**.
Utsnittet har **100 % gyldige høydeceller**, altså ingen NoData-celler. Høydene
refererer til **NN2000 (EPSG:5941)**, slik laserprosjektets metadata angir.
At rasteret har en høydeverdi er ikke det samme som at hver celle har et målt laserpunkt.

UTM-koordinatet til punktet er øst **433244,231 m**, nord **7553788,005 m**.
Utsnittets yttergrenser er øst 432244–434244 og nord 7552788–7554788 meter.

## Hva profilene viser

Den bilineært interpolerte høyden ved koordinatet er **334,3 m NN2000**.
Den faktiske rastercellen som inneholder punktet, har verdien **332,1 m**.
Forskjellen skyldes prøvetakingsmetoden ved en svært bratt kant; den er ikke
en beregning av måleusikkerheten. Alle profilene bruker bilineær interpolasjon
av cellemidtpunktene med én meters horisontal prøveavstand.

Nordover fra punktet viser modellen:

| Horisontal avstand mot rutenettnord | Høyde, NN2000 |
| ---: | ---: |
| 0 m | 334,3 m |
| 10 m | 232,4 m |
| 20 m | 164,3 m |
| 30 m | 152,5 m |
| 50 m | 142,4 m |
| 100 m | 118,7 m |
| 300 m | 18,3 m |

Dette er et **modellert fall på omtrent 170 meter over 20 meter horisontalt**
rett nordover fra punktet. Det er et terrengprofilresultat, og **ingen bekreftet
måling av selve klippehøyden**: topp og fot er ikke identifisert uavhengig av
modellen eller sammenholdt med originalbildene fra den tidligere chatten.

Høydefallet gir **83,3° helning fra horisontalen** langs de første 20 meterne
nordover. Mellom 5 og 15 meter nord for punktet er profilhelningen **84,6°**.
Dette beskriver disse profilsegmentene, ikke en innmålt veggflate eller en
gjennomsnittsvinkel for hele klippen. Vinkelen kan variere med retning og sted.

Videre ned i dalen, fra punktet til 300 meter nordover, faller profilen fra
334,3 til 18,3 m NN2000: **316,0 meter totalt terrengfall** og **46,5°**
gjennomsnittlig profilhelning over denne strekningen. Det inkluderer det slakere
terrenget nedenfor veggen og er heller ikke en bekreftet klippehøyde eller taulengde.

## Geologi og adkomst

NGUs punktoppslag i Berggrunn N250 gir **anortositt**, med kartenheten
«Anortositt til lysnoritt med plagioklas (3–20 cm)» og gabbro som tilleggsbergart.
Dannelsesalderen er angitt til **1800–1770 Ma**. Regional kartmålestokk er
1:250 000; lokalt 1:50 000-lag returnerte ikke en enhet ved punktet.
Oppslag og forespørselslenker er bevart i `metadata/ngu_*.txt` og
`metadata/geology_sources.json`. Dette er en kartklassifisering, ikke en prøve
av bergarten i selve veggen. Nettsiderapporten har kildehenvisninger for den
regionale geologiske historien.

Prosjekteierens foretrukne idé er **Kilan → Ørnheia → oversiden av veggen**,
for rekognosering og mulig arbeid med topptau. Alternativet er Kilan ned i
Sørdalen for å se veggen fra foten. Ingen av variantene er et dokumentert GPS-spor;
nøyaktig trasé og innfesting er ikke kartlagt her.

Kartverkets SSR-referansepunkt ved Kilan (13.34669, 68.08038), via Ørnheia
(13.3987, 68.0858), til det oppgitte punktet gir omtrent **2,75 km** som summen
av to rette geodetiske linjer. Det er en nedre geometrisk referanse, ikke en
gangbar rute. Referansepunktene ved Kilan og Ørnheia har omtrent 22 og 338 m
i DTM1, men samlet stigning langs en faktisk gangrute er ikke målt.

Rapportens tidskalkulator bruker justerbare antakelser. Standardeksemplet er
3,5 km, 400 høydemeter, grunnfart 2,5 km/t og 20 minutters pause. Modellen
`distanse / grunnfart + stigning / 400 m per time + pauser` gir **2 t 44 min**
én vei og effektiv snittfart omtrent **1,3 km/t**. Dette er et planleggingsanslag,
ikke en målt tur. Retur og arbeid ved veggen kommer i tillegg.

Kartets vann, bekker og myrsymboler kan støtte valg av tørrere terreng. Det er
ikke hentet et aktuelt våthetsraster eller gjort feltkontroll; rapporten lover
derfor ingen tørr rute. `outputs/access_map.png` er Kartverkets originale WMS-kart,
og forespørselen er lagret i `metadata/access_map_request.json`. Stedsnavnene er
verifisert med Kartverkets punktoppslag i `metadata/nearby_place_names.json`.

En DTM er en terrengoverflate med én høyde per horisontal posisjon. Den kan
ikke gjengi overheng eller flere deler av en loddrett vegg ved samme posisjon.
Flybåren laser kan dessuten ha få treff på svært bratte vegger, der terrengmodellen
interpoleres mellom tilgjengelige punkter. Én meters rutenett betyr ikke én
meters høydenøyaktighet. Profillinjene følger rutenettnord/øst og 45° mellom dem,
og er ikke innmålte klatreruter.

3D-visningen dekker 1 × 1 km og viser et nett med 2 meters avstand. Den eksporterte
GeoTIFF-filen beholder 1 meters oppløsning. Ingen vertikal overdrivelse er brukt.
Punkt og profillinje er løftet 1–3 meter i 3D-figuren for å være synlige; beregningene
og CSV-filene bruker de uendrede terrenghøydene.

## Laserdata

Kartverkets metadatasøk ved punktet returnerer:

- **NDH Lofoten 2pkt 2017**, prosjekt-ID 819, prosjektnummer LACH0009,
  laserskanning, oppgitt punkttetthet 2 punkt/m², siste flydato 21. juli 2017,
  prosjektraster 0,5 m, NN2000. Dette prosjektet står også som kilde i DTM1-rutens katalogoppføring.
- **Bilde Nordland Nord 2022 Del 1 av 6**, prosjekt-ID 6046, er **bildematching**,
  og skal ikke forveksles med LiDAR fra 2017.

LAZ-eksport **1810966** er registrert for et kvadrat på 1 × 1 km rundt punktet,
øst 432744–433744 og nord 7553288–7554288, i EPSG:25833. E-postmottakeren lagres
ikke i Git. Status ved første analyse: registrert og deretter under produksjon.
Eksportstatus og eventuelle laserfiler ligger lokalt og holdes utenfor Git.
Se `metadata/lidar_export_status.json` for sist kontrollerte status.

**En eksportbestilling er ikke en fullført nedlasting.** Originale LAZ-punkter
er først tilgjengelige lokalt når `data/` inneholder den faktiske leveransen.

## Kilder og vilkår

- [Original DTM1 GeoTIFF](https://nedlasting.geonorge.no/hoydedata/DTM1/33-135-175.tif)
- [Offisiell DTM1 Atom-katalog](https://nedlasting.geonorge.no/geonorge/ATOM/hoydedata/datasett/DTM1.atom)
- [Kartverkets prosjektmetadata-API](https://hoydedata.no/laserservices/rest/projectMetadata.ashx)
- [Dokumentasjon for metadata og eksport](https://hoydedata.no/LaserInnsyn2/dok/webtjenester.pdf)
- [Kartverkets informasjon om høydedata](https://www.kartverket.no/api-og-data/terrengdata)
- [NLOD 2.0](https://data.norge.no/nlod/no/2.0/), oppgitt lisens i Atom-katalogen. Kreditering: **Kartverket**.

Katalogen oppga 606 829 546 byte for originalruten, mens serveren leverte
608 490 831 byte. Faktisk fil er åpnet som GeoTIFF, utsnittet er dekodet og
kontrollert, og kontrollsummen er lagret i `metadata/analysis_summary.json`.

Den første nedlastingen ble blokkert av miljøets nettverksbegrensning.
Nedlasting med nettverkstilgang lyktes. Den fullførte DTM1-nedlastingen er
derfor verifisert, ikke bare utledet fra en tilgjengelig lenke.

## Gjenskape resultatet

Fra denne mappen, med Python 3.12 eller nyere:

```bash
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/download.py
.venv/bin/python scripts/analyze.py
```

`analyze.py` kan også kjøres med bare utsnittet i Git; det trenger ikke internett.
Hvis originalruten mangler, blir kontrollsum/størrelse for originalen `null` i
den nygenererte oppsummeringen. For å følge opp en eksisterende lokal laserjobb:

```bash
.venv/bin/python scripts/download.py --poll-lidar
```

For en ny eksport, bare dersom lokal jobbreferanse mangler:

```bash
.venv/bin/python scripts/download.py --lidar-email DIN_ADRESSE
```

Det oppretter en eksport hos Kartverket og sender deres statusmeldinger til den
oppgitte adressen. Ikke bruk dette til å opprette duplikatbestillinger.
