# Bølgeverktøyet

Verktøyet har fire faner: «Én bølge», «Klikkekonkurranse», «Interferens» og «Interferens 2», både på `/education/` og på denne bølgesiden.

«Klikkekonkurranse» kobler frekvens og periode til klikk. Etter tre sekunders nedtelling teller hver runde klikk i ti sekunder. Gjennomsnittlig periodetid anslås først som 10 s / antall klikk, og frekvensen beregnes deretter med f = 1 / T. Korteste og lengste målte intervall mellom påfølgende klikk vises separat, med tre desimaler i sekunder. Minst to klikk trengs for disse målingene. Korteste periode markeres i lilla og lengste i oransje mellom de aktuelle prikkene på tidslinjen, med tidsverdier. Ved like periodetider markeres den første forekomsten. En tidslinje viser klikkene, og de fem siste fullførte rundene kan sammenlignes. Ingen klikk gir 0 Hz og ingen beregnbar periodetid. Bytte av fane eller skjuling av nettleseren avbryter en pågående runde. Resultatene lagres bare mens siden er åpen.

«Interferens» viser to bølger med samme bølgelengde. I «Interferens 2» er radiosignalet en enkel sum av to sinuskomponenter (en grunnsvingning og en svakere svingning med dobbelt frekvens), normalisert til maksimalt utslag 1. Formen gjentas hver 10. meter. Støyen har fast bølgelengde 2,5 m. Amplitudene er faste: 1 for radiosignalet og 0,5 for støyen. Radioscenarioet bruker walkie-talkie. Elevene leser amplituder og anslår bølgelengder fra grafene. Y-aksene har trinn på 0,5, og x-aksene viser avstand fra 0 til 25 m, med merker og tall for hver 2,5 m. På store skjermer står innstillingene ved siden av grafene og følger med ved rulling. De fire grafene vises i et 2 × 2-rutenett når det er plass, og stables på smale skjermer. Eleven lager bølge 3 som et motsignal: amplitude skrives som et tall fra 0 til 1, bølgelengde som et tall fra 0,1 til 25 m, og forskyvning justeres fra 0 til én av motsignalets egne bølgelengder. Motsignalet starter med amplitude 0 og bølgelengde 1 m. Den grønne grafen viser summen av alle tre bølgene. Elevene sammenligner denne med radiosignalet for å vurdere kanselleringen. Tomme eller ugyldige tallfelt beholder siste gyldige verdi i grafen. Fanene har egne innstillinger og egen bevegelse. «Interferens 2» starter automatisk i bevegelse. Grafene der heter «Bølge 1 – Radiosignal», «Bølge 2 – Støy», «Bølge 3 – Motsignal» og «Mottatt radiosignal». I «Interferens» kan elevene skjule sumgrafen før de gjetter resultatet. I «Interferens 2» vises mottatt signal alltid; avkryssingen «Med motsignal» sammenligner med og uten bølge 3 uten å endre innstillingene. Avkryssingen står under motsignalgrafen, og en tydelig markering «MED MOTSIGNAL» eller «UTEN MOTSIGNAL» vises over mottatt signal. Forskyvningen starter på ¼ av bølge 1s bølgelengde i «Interferens» og er fast på samme verdi i «Interferens 2». Alle bølgene beveger seg med samme hastighet.

## Legg til eller endre oppgaver

Interferensoppgavene står øverst i begge interferensfanene. Rediger dem i `index.html` og i kopien på `education/index.html`. «Én bølge» viser simulering og forklaring uten kontrollspørsmål.

Alle fanene viser en liten KI-kreditering nederst til høyre.

## Forhåndsvis lokalt

Kjør fra prosjektets rotmappe:

```sh
python3 -m http.server 8000
```

Åpne `http://localhost:8000/education/` for å forhåndsvise siden.

Lenk direkte til en fane med `#en-bolge`, `#klikkekonkurranse`, `#interferens` eller `#interferens-2`, for eksempel `http://localhost:8000/education/#interferens`.

Ved publisering følger JavaScript-filene med de øvrige statiske filene.
