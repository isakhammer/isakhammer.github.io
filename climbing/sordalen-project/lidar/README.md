# Sørdalsveggen — innledende inspeksjon av rå LiDAR

12. november 2026. Metode for den publiserte punktskyvisningen.

Råpunktene beskriver en tydelig, svært bratt flate ved det tidligere
DTM-referansepunktet. Leveransen er interessant for videre undersøkelse av
veggens større former og terrenget omkring. Den dokumenterer ikke små tak,
bergkvalitet, sikre ankerplasser eller en kontrollert adkomst.

## Kilde og dekning

Kartverkets eksport 1810966, NDH Lofoten 2pkt 2017. Den urørte LAZ-filen har
7 012 561 punkter og dekker omtrent 1 × 1 km. Horisontalt koordinatsystem er
EUREF89 UTM33 (EPSG:25833); prosjektmetadata angir NN2000 som høydereferanse.
LAS-skalaen på 0,01 m er koordinatlagring, ikke et mål på nøyaktighet.

Utsnittet ved 68.0902051 N, 13.3967616 E er 150 × 150 m og inneholder alle
154 406 originalpunkter innenfor XY-grensen. Makrovisningen dekker hele
leveransen. Ørnheia ligger ved søndre kant; hele anmarsjen fra Kilan dekkes ikke.

LAZ SHA256: `11ae6a0ee2a204368ef2dc0da7d6e2aa661ac5867f70c3c850443d6b94580d5c`.

## Hva råpunktene viser

I et uttrykkelig valgt undersøkelsesvolum, øst −50 til +50 m, nord −5 til
+30 m fra referansepunktet og høyde 150–370 m, er det 27 569 målinger:
15 482 i klasse 1, 12 079 i klasse 2 og 8 i klasse 7. Volumet er et
analyseutvalg, ikke en innmålt avgrensning av hele bergveggen.

56,2 % av klasse 1 og 2 i dette volumet er uklassifisert (klasse 1). Bare å
beholde klasse 2 ville derfor kaste mange observasjoner i veggområdet.
Uklassifisert betyr heller ikke automatisk berg; vegetasjon og andre returer
kan være med. [Klassedefinisjonene står i LAS 1.2-standarden](https://www.asprs.org/a/society/committees/lidar/Downloads/ASPRS_LAS%201_2.pdf).

I hele nærutsnittet ligger klasse 1 og 2 mellom 125,60 og 351,77 m NN2000.
De høyere punktene, opptil 511,45 m, er merket klasse 7 i leveransen. De er
beholdt i råvisningene og utelatt fra makrovisningene.

Råpunktsnittene viser den bratte formen og lokale variasjoner. Frontprojeksjonen
har både tette områder og hull. Hvite ruter i dekningsfiguren betyr at det ikke
er observert punkter innenfor valgt dybde; de angir ikke prosent manglende
bergflate. Flere høyder på samme XY-posisjon er heller ikke alene bevis på
overheng. Punktkilde-ID 28–31 forekommer; disse er ikke uavhengig bekreftet
som bestemte flystriper.

Den tidligere DTM1-profilen følger hovedformen i det viste sidesnittet.
Punktstripen er 5 m bred, mens rasterprøvene følger senterlinjen; forskjeller
kan skyldes geometri, vegetasjon, klassifisering og rasterets forenkling.
Dette er ikke en uavhengig validering eller en ny måling av total vegghøyde.

## Visningsnivåer og størrelser

| Visning | Punkter | HTML |
| --- | ---: | ---: |
| Makro, 4 m 3D-ruter | 126 767 | 3,24 MiB |
| Makro, 2 m 3D-ruter | 501 584 | 12,78 MiB |
| Klippen, alle punkter i 150 m-utsnitt | 154 406 | 3,95 MiB |

Størrelsene gjelder den nye WebGL2-visningen med dybdeskygge. De tidligere
Plotly-filene er bevart lokalt som referanse. Valgte punkter og kildeindekser
er de samme. Gråtoner fremhever form, høydefarger og 10 m-bånd gir høydereferanse,
og klassevisningen viser klassifiseringen. Intensitetsvisningen er en ukalibrert
2–98-persentilstrekking, ikke et fotografi. Skygger og store punktsymboler kan
påvirke inntrykket av flater og dekning; de er ikke nye målinger.

Makro velger ett faktisk punkt nærmest midten av hver opptatte romrute.
Ingen punkter blir gjennomsnittet, interpolert eller flyttet til en tilpasset
overflate. Bruk av 3D-ruter tillater flere høydenivåer ved samme XY-posisjon.
Begge makrovisningene bruker klasse 1 og 2; originalindeksen i LAZ er bevart.

Avstanden fra et utelatt punkt til representanten i samme rute er median
1,61 m og 95-persentil 2,68 m for 4 m-utvalget, og median 0,82 m og
95-persentil 1,41 m for 2 m-utvalget. Dette beskriver forenklingen av
visningen, ikke laserens nøyaktighet. Små former kan forsvinne i makro.

Filene er under GitHubs grense på 100 MiB per fil og trenger ikke LFS.
ZIP-en er 72,83 MiB og LAZ-en 23,90 MiB; råfilene og analysearbeidet
beholdes Git-ignorert lokalt. Nettsiden publiserer bare de tre utvalgte
punktvisningene og diagnostikkfigurene. [GitHubs filgrenser](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

## Videre behandling

Behold klasse 1 og 2 under videre inspeksjon, undersøk forskjeller mellom
punktkilder og avgrens bergflaten før eventuell modelltilpasning. En videre
modell bør kunne vise hull og usikkerhet. Automatisk utfylling eller en enkelt
høyde per XY-rute kan skjule relevant geometri i en så bratt vegg. Ingen slik
flate er laget i denne arbeidsrunden.
