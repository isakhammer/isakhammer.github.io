# Bølgeverktøyet

Verktøyet har tre faner: «Én bølge», «Interferens» og «Refleksjon». Hver fane har egne oppgaver, både på `/education/` og på denne bølgesiden.

## Legg til eller endre oppgaver

Rediger filen for den aktuelle fanen:

- `oppgaver-en-bolge.md`: amplitude, bølgelengde og hastighet.
- `oppgaver.md`: interferens, amplitudesum og forskyvning i bølgelengder.
- `oppgaver-refleksjon.md`: refleksjon ved fast og fri ende.

Hver overskrift med `##` blir en egen oppgave. Skriv vanlig tekst og spørsmål som punktliste under overskriften:

```markdown
## 5. Min nye oppgave

Prøv en innstilling i simuleringen.

- Hva ser du?
- Forklar med egne ord hvorfor det skjer.
```

Flytt avsnittene for å endre rekkefølgen. Ingen HTML eller JavaScript må endres. Formatet støtter oppgaveoverskrifter, vanlige avsnitt og punktlister; øvrig Markdown-formatering vises som vanlig tekst.

## Forhåndsvis lokalt

Kjør fra prosjektets rotmappe:

```sh
python3 -m http.server 8000
```

Åpne `http://localhost:8000/education/`. Oppgavefilene lastes av nettleseren, så bruk webserveren når du forhåndsviser.

Lenk direkte til en fane med `#en-bolge`, `#interferens` eller `#refleksjon`, for eksempel `http://localhost:8000/education/#interferens`.

Ved publisering følger Markdown- og JavaScript-filene med de øvrige statiske filene.
