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

## Open the site locally

The assignment pages need Jekyll to turn Markdown and Liquid templates into HTML.
Install Ruby and Bundler, then run these commands from the repository folder:

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1
```

Open http://127.0.0.1:4000/ in your browser. The assignments are at
http://127.0.0.1:4000/education/naturfag/oppgavesett/ and the waves assignment is at
http://127.0.0.1:4000/education/naturfag/oppgavesett/bolger/.

Opening `index.html` directly or using a plain static file server does not build
Markdown pages or process the assignment list.

If the published site fails to open, check the latest run under GitHub Actions
and ensure Settings → Pages uses GitHub Actions. The custom domain
`isakhammer.io` also needs working DNS pointing to GitHub Pages.
