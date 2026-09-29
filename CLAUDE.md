# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # dev server — the only way to preview this app locally
npm run build  # production build → .vercel/output
npm run generate
npm run postinstall  # nuxt prepare; regenerates .nuxt/ and the generated tsconfigs
```

There is **no test suite, no linter, and no typecheck script**. `vue-tsc` is not installed.

`npm run preview` **does not work here.** Because `nitro.preset` is `vercel`, Nitro writes to
Vercel's Build Output API layout (`.vercel/output/`) rather than the default `.output/`, and
`nuxt preview` exits with *"Preview is not supported for this build."* Use `npm run dev` to
verify changes. (`.vercel/` is ~63 MB and `.output/` is a vestigial empty shell; both are
gitignored and rebuilt from scratch.)

## Content pipeline

Publishing flows through four files that must be kept in sync — this is the main thing that
requires reading across files to understand:

1. **`public/admin/index.html`** loads Sveltia CMS from a CDN. The editor UI lives at `/admin`.
2. **`public/admin/config.yml`** defines what editors can create: a GitHub-backed backend
   (repo `dcln00/grugbox`, branch `main`) authenticated through a Cloudflare Worker OAuth proxy
   at `base_url`, with `publish_mode: editorial_workflow` (drafts go through PRs).
3. **`content/*.md`** holds the markdown, with frontmatter matching the CMS fields.
4. **`content.config.ts`** (repo root, not `app/`) declares the Zod schemas that
   `queryCollection()` validates against at build time.

The CMS and `content.config.ts` agree on collections: `post`, `review`, `interview` and
`playlist` exist in both, and both are authorable through `/admin`. (`legal` has a schema but no
CMS collection — those files are hand-written.)

Three schema fields have no CMS widget, so they can only be set by editing frontmatter directly:

- **`articles.video`** — the frontend renders it (`isVideo()` in `pages/index.vue` and
  `pages/articles/index.vue`), but the CMS post collection has no video field.
- **`interviews.description`** — optional in the schema and read by `pages/interviews/index.vue`
  and `[slug].vue` for the listing blurb and Open Graph tags, but absent from the CMS interview
  fields.
- **`playlists.tags`** — optional in the schema, with no tags field in the CMS playlist collection.

Every collection extends Nuxt Content's `PageCollectionItemBase`, so `title` and `description`
are queryable on any collection even where its schema does not redeclare them. Generated types
land in `.nuxt/content/types.d.ts` after `npm run postinstall` — read that file rather than
guessing whether a field survived validation.

Featured images use `/content/...` paths, which resolve to `public/content/` (the CMS sets
`media_folder: public/content` and `public_folder: /content`). A few components fall back to a
hardcoded Cloudinary URL for Open Graph images.

## App structure

`srcDir` is `app/`, set explicitly in `nuxt.config.ts` (Nuxt's auto-detection infers it from the
directory's *contents*, so an empty or half-populated `app/` would silently fall back to the repo
root and drop routes). `content/`, `public/`, and `content.config.ts` deliberately stay outside it.

**Every `.vue` file uses `<template lang="pug">`.** `pug` is a devDependency and is load-bearing —
Vue's `compiler-sfc` resolves it at build time, and removing it breaks all components at once.

**Do not use Pug's dot-notation class shorthand.** Write an explicit tag with a `class` attribute
instead of `.photo(...)`, `div.photo(...)`, or `article.featured(...)`:

```pug
//- No
.photo(class="aspect-video bg-gray-200")
article.featured(v-for="p in posts" :key="p.path")

//- Yes
div(class="photo aspect-video bg-gray-200")
article(v-for="p in posts" :key="p.path" class="featured")
```

The shorthand class goes first in the attribute, so the rendered `class` value is identical either
way — this is purely about keeping the template readable and greppable.

Navigation lives in **`app/utils/nav.ts`** (`NAV_LINKS`, `FOOTER_LINKS`), auto-imported into
`Aside` and `AppFooter`. It was previously duplicated across three components, which is how dead
links drifted apart — keep it single-source. The desktop header carries no section links; the
drawer (`Aside`) is the nav at every breakpoint.

`AppHeader.vue` renders **two** headers: one in flow at the top of the page, and a `fixed` copy
that slides in via `<Transition>` once you scroll past 200px. Both render the same markup, which
lives in **`HeaderBar.vue`** — restyle that component, not its two call sites, and note that both
call sites forward `toggleShow` up to `app.vue`, which owns the drawer's open state.

Icons are **inline `<svg>`** in whichever component needs one — there is no icon module. The
hamburger (`AppHeader.vue`), drawer close (`Aside.vue`) and back-to-top caret (`app.vue`) each carry
their own `<path>`, all using `currentColor` so the surrounding `text-*` class drives their colour.
`app/assets/icons/hamburger.svg` is retained as the source for that path but is not imported at
runtime. `nuxt-svgo` was removed deliberately; don't reintroduce an icon module for a handful of
one-off glyphs.

Styling is **Tailwind 4 via `@nuxtjs/tailwindcss` v7 (beta)**, configured entirely in CSS — there
is no `tailwind.config.js`. See `app/assets/css/tailwind.css`, which uses `@theme` (the
`--color-brand-accent` token), `@plugin` (typography), and `@utility`.

## Gotchas

**`better-sqlite3` must stay in `dependencies`.** `@nuxt/content` declares it as an *optional peer
dependency*, so npm will not install it automatically, but Content fails at runtime without it —
a fresh `npm install` yields *"Nuxt Content requires better-sqlite3 module to operate"* from
`nuxt prepare`. It works via its bundled prebuilds.

**`@nuxtjs/tailwindcss`'s npm `latest` tag is `6.14.0` (Tailwind 3).** The `^7.0.0-beta.1` range
in `package.json` is what keeps Tailwind 4. A bare `npm i @nuxtjs/tailwindcss` silently downgrades
and breaks the `@theme` / `@utility` CSS.

**Node:** `engines` is `^22.19.0 || ^24.11.0 || >=26.0.0` (Nuxt excludes odd-numbered non-LTS
releases) with `.nvmrc` at `24`. The machine this was set up on runs Node 25 — outside that range —
which produces `npm warn EBADENGINE` on install. Builds work regardless.

**npm ≥11.19 gates install scripts.** Four packages here have unapproved install scripts
(`better-sqlite3`, `esbuild` ×2, `fsevents`); everything still works because they fall back to
prebuilds. A native dependency *without* prebuilds would install "successfully" and then fail at
runtime with no build error — use `npm install-scripts approve <pkg>` if that happens.

**`nuxt.config.ts` strips `.DS_Store` from the build.** Nuxt copies everything under `public/`
into the output verbatim, and `.gitignore` cannot stop that (the file never reaches git). A
`nitro:build:public-assets` hook removes them from `output.publicDir` so they are never published.

## Deployment

Vercel, via `nitro.preset: 'vercel'`; `.vercel/output/` is the artifact `vercel deploy --prebuilt`
uploads. Prefer letting Vercel build from git: a local build bundles **darwin-arm64** sharp
binaries and warns to deploy to the same architecture, so a Mac-built artifact shipped to Vercel's
Linux runtime would break image optimisation (`/_ipx`).

Content-only changes can be shipped through the CMS at `/admin`, which commits to `main`.
