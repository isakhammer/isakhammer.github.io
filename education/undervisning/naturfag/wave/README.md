# Bølgeverktøyet

Verktøyet har sju faner: «Én bølge», «Klikkekonkurranse», «Interferens», «Interferens 2» og «Elektromagnetiske bølger 1», «2» og «3», både på `/education/` og på denne bølgesiden.

«Klikkekonkurranse» kobler frekvens og periode til klikk. Etter tre sekunders nedtelling teller hver runde klikk i ti sekunder. Gjennomsnittlig periodetid anslås først som 10 s / antall klikk, og frekvensen beregnes deretter med f = 1 / T. Korteste og lengste målte intervall mellom påfølgende klikk vises separat, med tre desimaler i sekunder. Minst to klikk trengs for disse målingene. Korteste periode markeres i lilla og lengste i oransje mellom de aktuelle prikkene på tidslinjen, med tidsverdier. Ved like periodetider markeres den første forekomsten. En tidslinje viser klikkene, og de fem siste fullførte rundene kan sammenlignes. Ingen klikk gir 0 Hz og ingen beregnbar periodetid. Bytte av fane eller skjuling av nettleseren avbryter en pågående runde. Resultatene lagres bare mens siden er åpen.

«Interferens» viser to bølger med samme bølgelengde. I «Interferens 2» er radiosignalet en enkel sum av to sinuskomponenter (en grunnsvingning og en svakere svingning med dobbelt frekvens), normalisert til maksimalt utslag 1. Formen gjentas hver 10. meter. Støyen har fast bølgelengde 2,5 m. Amplitudene er faste: 1 for radiosignalet og 0,5 for støyen. Radioscenarioet bruker walkie-talkie. Elevene leser amplituder og anslår bølgelengder fra grafene. Y-aksene har trinn på 0,5, og x-aksene viser avstand fra 0 til 25 m, med merker og tall for hver 2,5 m. På store skjermer står innstillingene ved siden av grafene og følger med ved rulling. De fire grafene vises i et 2 × 2-rutenett når det er plass, og stables på smale skjermer. Eleven lager bølge 3 som et motsignal: amplitude skrives som et tall fra 0 til 1, bølgelengde som et tall fra 0,1 til 25 m, og forskyvning justeres fra 0 til én av motsignalets egne bølgelengder. Motsignalet starter med amplitude 0 og bølgelengde 1 m. Den grønne grafen viser summen av alle tre bølgene. Elevene sammenligner denne med radiosignalet for å vurdere kanselleringen. Tomme eller ugyldige tallfelt beholder siste gyldige verdi i grafen. Fanene har egne innstillinger og egen bevegelse. «Interferens 2» starter automatisk i bevegelse. Grafene der heter «Bølge 1 – Radiosignal», «Bølge 2 – Støy», «Bølge 3 – Motsignal» og «Mottatt radiosignal». I «Interferens» kan elevene skjule sumgrafen før de gjetter resultatet. I «Interferens 2» vises mottatt signal alltid; avkryssingen «Med motsignal» sammenligner med og uten bølge 3 uten å endre innstillingene. Avkryssingen står under motsignalgrafen, og en tydelig markering «MED MOTSIGNAL» eller «UTEN MOTSIGNAL» vises over mottatt signal. Forskyvningen starter på ¼ av bølge 1s bølgelengde i «Interferens» og er fast på samme verdi i «Interferens 2». Alle bølgene beveger seg med samme hastighet.

## Elektromagnetiske bølger

De tre fanene er utforskende. Hver åpner med en kort invitasjon og en interaktiv figur. Forklaringer og modellbegrensninger er skjult i en lukket «Hva viser modellen?»-seksjon som eleven kan åpne etter å ha undersøkt selv. Det er ingen obligatoriske oppgaver eller trinn.

**Elektromagnetiske bølger 1:** En enkel modell med tre negative ladninger: én stor rød (−2q) og to små lilla (−q hver). Den røde kan dras med mus eller finger eller flyttes med piltastene. Den store ladningen gir dobbelt så sterkt elektrisk felt og dobbelt så stor elektrisk kraft på en annen ladning ved samme avstand som en ladning på −q. Alle ladningene påvirker hverandre med ladningsvektede, myknede Coulomb-krefter; svake, dempede fjærer stabiliserer dem rundt en opprinnelig likevekt. «Vis elektrisk felt» er avslått fra start. Feltpilene er lengre og tydeligere, med større avstand mellom dem slik at de er lette å lese. Her er ingen synlig forplantningsforsinkelse og ingen svingnings- eller gnistkontroller. «Tilbakestill» gjenoppretter likevekten. Implementasjonen ligger i `ladninger.js`.

**Elektromagnetiske bølger 2:** Én negativ sender og én negativ mottaker i en isolerende føring med en svak fjær. Fanen åpner med 1 Hz; redusert bevegelse krever at eleven starter avspillingen selv. Senderen kan flyttes manuelt ved 0 Hz eller svinge med valgt frekvens og utslag. En oransje pil viser den elektriske kraften på mottakeren. Feltendringen bruker tid på å nå fram; mottakeren drives av feltet på sin egen posisjon. Avstand, pause og sakte film kan utforskes uten en mottakerring eller gnistterskel.

**Elektromagnetiske bølger 3:** Hertz-modellen med mottakerring og gnistgap. Detaljene nedenfor gjelder denne fanen. De to siste fanene deler feltberegningene i `elektromagnetisme.js`, men monteres med egne elementer, innstillinger, bevegelser og tid. Skjuling av en fane setter dens simulering på vent.

Senderen er et negativt elektron. Ved 0 Hz kan det dras med mus eller finger i den venstre delen av figuren, eller flyttes med piltastene når figuren har fokus. Dra nærmere eller lengre fra mottakerringen for å utforske avstand og forsinkelse. En egen avstandskontroll fra 1 til 1,8 ganger minsteavstanden lar eleven sammenligne avstander med samme frekvens og utslag. Endret avstand starter målingen på nytt; ionene står på sine nye faste plasser. Senderen følger pekeren med utjevning og en hastighetsgrense under modellens lyshastighet. Pekerfangst holder draget aktivt utenfor figuren; avsluttede eller avbrutte drag og skjuling av siden frigjør den.

Frekvensen kan endres fra 0 til 2 Hz. Over 0 Hz svinger senderen automatisk. Utslaget kan justeres separat. Det vises som prosent av største tillatte utslag. Alle tillatte kombinasjoner er langsommere enn modellens lyshastighet. Pause, tilbakestilling og sakte film (¼ fart) gjør forplantningen lettere å følge. Tilbakestilling velger 0 Hz og setter sender og ring i ro. Tid og frekvens gjelder modellens tid; sakte film endrer bare avspillingsfarten. Brukere som foretrekker redusert bevegelse, starter automatisk svingning selv. Det finnes ingen nummererte trinn.

Mottakeren er en åpen metallring med 16 faste positive ioner og 16 bevegelige elektroner. Ionenes protoner er bundet i atomkjernene. Elektronenes samlede forskyvning vises som høyere tetthet ved den ene siden av gapet og lavere ved den andre. Når spenningen passerer terskelen, vises en gnist og et elektron over åpningen, ladningsforskjellen og strømmen reduseres, og gnisten markeres i figuren. Ringen er frekvensselektiv: høyest senderfrekvens er ikke automatisk best. Oppgaven er å få gnist med minst mulig risting. «Endre mottakerringen» inneholder en avstemming fra 0,6 til 1,4 Hz; senderen kan justeres i trinn på 0,1 Hz. Avkryssingsboksen «Perfekt egenfrekvens» stiller senderen til ringens valgte egenfrekvens og starter forsøket på nytt. Senderfrekvensen låses og følger endringer av ringens avstemming. Utslag og avstand beholdes; avkryssingen fjernes ved tilbakestilling. Senderen starter mykt over to modellsekunder, slik at en brå oppstart ikke gir et kunstig bredbåndspuls.

Feltlinjene beregnes fra det retarderte Liénard–Wiechert-feltet til et negativt elektron i to dimensjoner. Manuell bevegelse lagres med fast tidssteg, og tidligere posisjoner, hastigheter og akselerasjoner brukes til å finne feltet ved mottakeren. Endringer når først ringen etter modellens lysgangstid. Piler på feltlinjene peker inn mot det negative elektronet. Ladningsforskyvningen i ringen drives av det eksterne feltet integrert langs den åpne lederen i en RLC-modell med relative enheter: L = 1, R = 0,6 og C = 1 / (2πf₀)². Avstemmingen velger f₀. Gapspenningen beregnes som Q / C; gjennomslagsterskelen er valgt til 1,3 i modellens relative spenningsenheter. Ved utladning gjenstår 15 % av Q og 20 % av strømmen. Elektronprikkenes forskyvning er en begrenset visuell avbildning av spenningen; kretsens ladning klippes ikke. Ringens radius er fast i modellens lengdeenheter, slik at mobil og stor skjerm gir samme fysiske resultat. Den opprinnelige statiske likevekten trekkes fra. Ringens tilbakevirkning på senderen er utelatt.

Avstander, forplantningsfart, elektronenes bevegelse, kretsparametere og gnistterskel er illustrative. Gnisten er ikke en atommodell eller en beregning av luftas gjennomslagsspenning. Figurteksten avgrenser modellen med «Vi viser bare den elektriske delen». Magnetfelt innføres ikke som et eget undervisningstema. Modellen viser ikke en kvantitativ skala for feltstyrke. Simuleringen setter tiden på vent når fanen eller nettlesersiden er skjult. Bevegelseshistorikken er begrenset til det tidsrommet tegningen trenger.

Innholdet ligger i begge `index.html`-filene; stil og animasjon er felles i `elektromagnetisme.css` og `elektromagnetisme.js`. Kildelenker til OpenStax ligger nederst i fanen.

## Legg til eller endre oppgaver

Interferensoppgavene står øverst i begge interferensfanene. Rediger dem i `index.html` og i kopien på `education/index.html`. «Én bølge» viser simulering og forklaring uten kontrollspørsmål.

Alle fanene viser en liten KI-kreditering nederst til høyre.

## Forhåndsvis lokalt

Kjør fra prosjektets rotmappe:

```sh
python3 -m http.server 8000
```

Åpne `http://localhost:8000/education/` for å forhåndsvise siden.

Lenk direkte til en fane med `#en-bolge`, `#klikkekonkurranse`, `#interferens`, `#interferens-2` eller `#elektromagnetiske-bolger-1`, `#elektromagnetiske-bolger-2` og `#elektromagnetiske-bolger-3`, for eksempel `http://localhost:8000/education/#interferens`.

Den tidligere lenken `#elektromagnetiske-bolger` åpner fortsatt Hertz-modellen i fane 3.

Ved publisering følger JavaScript-filene med de øvrige statiske filene.
