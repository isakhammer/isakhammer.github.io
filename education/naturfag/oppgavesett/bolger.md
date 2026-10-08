---
layout: lesson
title: Bølger
description: Oppgaver og eksempler om fart, frekvens og bølgelengde.
permalink: /education/naturfag/oppgavesett/bolger/
---

Denne siden kan brukes til forklaringer, regneeksempler, formler og bilder fra forsøk eller tavle.

Du kan skrive vanlig tekst, bruke LaTeX for matematikk og lime inn eller lenke til screenshots som bilder.

## Sammenhengen mellom fart, frekvens og bølgelengde

For en bølge gjelder sammenhengen

$$
v = f \cdot \lambda
$$

der

- $v$ er bølgefart
- $f$ er frekvens
- $\lambda$ er bølgelengde

## Oppgave 1

En bølge har bølgelengde $\lambda = 2.5\ \mathrm{m}$ og frekvens $f = 4.0\ \mathrm{Hz}$.

1. Finn bølgefarten.
2. Forklar hva som skjer med bølgefarten dersom frekvensen dobles og bølgelengden er den samme.

## Løsning

Vi bruker formelen

$$
v = f \cdot \lambda
$$

Setter inn verdiene:

$$
v = 4.0\ \mathrm{Hz} \cdot 2.5\ \mathrm{m}
$$

$$
v = 10.0\ \mathrm{m/s}
$$

Bølgefarten er derfor

$$
\boxed{10.0\ \mathrm{m/s}}
$$

Hvis frekvensen dobles mens bølgelengden er den samme, dobles bølgefarten.

## Løsning med Python

```python
bolgelengde = 2.5
frekvens = 4.0

bolgefart = frekvens * bolgelengde

print(f"Bolgefarten er {bolgefart:.1f} m/s")
```

Forventet utskrift:

```text
Bolgefarten er 10.0 m/s
```

## Visualisering

Koden under tegner en enkel bølge. Prøv å endre `amplitude`, `bolgelengde` og `fase`.

```python
import numpy as np
import matplotlib.pyplot as plt

amplitude = 1.0
bolgelengde = 2.5
fase = 0.0

x = np.linspace(0, 10, 500)
y = amplitude * np.sin(2 * np.pi * x / bolgelengde + fase)

plt.figure(figsize=(9, 3))
plt.plot(x, y)
plt.axhline(0, color="black", linewidth=0.8)
plt.title("Bølge")
plt.xlabel("Avstand")
plt.ylabel("Utslag")
plt.grid(True)
plt.show()
```

Hvis du har et screenshot av grafen eller en tavleløsning, kan det legges inn slik:

```markdown
![Kort beskrivelse av bildet](images/bolge-eksempel.png)
```

## Ny oppgave

Skriv neste oppgave her.

### Gitt

-

### Finn

-

### Løsning

$$

$$

### Screenshot eller figur

```markdown
![Kort beskrivelse av bildet](images/filnavn.png)
```
