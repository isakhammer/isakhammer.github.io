# Bølgeverktøyet

Verktøyet har tre faner: «Én bølge», «Interferens» og «Refleksjon». Hver fane har egne oppgaver, både på `/education/` og på denne bølgesiden.

I «Interferens» kan elevene skjule bølge 3 før de gjetter summen. Avkrysningsboksen «Ulik bølgelengde» aktiverer en skyveknapp fra 0,1 til 2 ganger den blå bølgens bølgelengde. Det kompakte bølgelengdefeltet skjules når boksen ikke er avkrysset. Begge bølgene beveger seg med samme hastighet, og forskyvningen måles i den blå bølgens bølgelengde. Når boksen ikke er avkrysset, har bølgene samme bølgelengde. Forskyvningen starter på ¼ bølgelengde.

## Legg til eller endre oppgaver

Interferensoppgavene står øverst i nettsiden. Rediger dem i `index.html` og i kopien på `education/index.html`. For de øvrige fanene, rediger oppgavefilen:

- `oppgaver-en-bolge.md`: amplitude, bølgelengde og hastighet.
- `oppgaver-refleksjon.md`: refleksjon ved fast og fri ende.

Hver overskrift med `##` blir en egen oppgave. Skriv vanlig tekst og spørsmål som punktliste under overskriften:

```markdown
## 5. Min nye oppgave

Prøv en innstilling i simuleringen.

- Hva ser du?
- Forklar med egne ord hvorfor det skjer.
```

Flytt avsnittene for å endre rekkefølgen. For disse oppgavefilene trenger du ikke å endre HTML eller JavaScript. Formatet støtter oppgaveoverskrifter, vanlige avsnitt og punktlister; øvrig Markdown-formatering vises som vanlig tekst.

## Forhåndsvis lokalt

Kjør fra prosjektets rotmappe:

```sh
python3 -m http.server 8000
```

Åpne `http://localhost:8000/education/`. Oppgavefilene lastes av nettleseren, så bruk webserveren når du forhåndsviser.

Lenk direkte til en fane med `#en-bolge`, `#interferens` eller `#refleksjon`, for eksempel `http://localhost:8000/education/#interferens`.

Ved publisering følger Markdown- og JavaScript-filene med de øvrige statiske filene.
