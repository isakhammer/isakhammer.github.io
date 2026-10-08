# isakhammer.io

Personal website deployed to GitHub Pages. Pushing to `master` builds and publishes the site automatically.

## School content

Add lesson and example pages as Markdown files in `education/naturfag/oppgavesett/`. Files with the `lesson` layout are automatically rendered as web pages and listed on the oppgavesett index.

For example, create `education/naturfag/oppgavesett/lyd.md`:

```markdown
---
layout: lesson
title: Lyd
description: Oppgaver og eksempler om lyd.
permalink: /education/naturfag/oppgavesett/lyd/
---

## Oppgave

Skriv innholdet her. MathJax støtter formler som $v = f \cdot \lambda$.
```

The page will be available at `https://isakhammer.io/education/naturfag/oppgavesett/lyd/` after the Pages workflow finishes. Keep simulations as HTML pages in the relevant subject folder.
