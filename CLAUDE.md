# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # the only way to preview this app locally
npm test             # vitest run, one pass (test/**/*.spec.ts)
npm run build        # production build → .vercel/output
npm run generate
npm run postinstall  # nuxt prepare; regenerates .nuxt/ and the generated tsconfigs
```

There is **no linter and no typecheck script** — `vue-tsc` is not installed, so nothing catches
type errors but the build. `npm run preview` **does not work**: `nitro.preset: 'vercel'` makes
Nitro write the Build Output API layout to `.vercel/output/` rather than `.output/`, and
`nuxt preview` exits with *"Preview is not supported for this build."* Use `npm run dev` to verify
changes. There is no CI, no `.github/` and no `vercel.json` — deployment config is entirely
`nitro.preset` in `nuxt.config.ts`.

## Content pipeline

Publishing spans files that must be kept in sync — the main thing here that requires reading across
files to understand:

1. **`public/admin/index.html`** loads Sveltia CMS from a CDN; the editor UI lives at `/admin`.
2. **`public/admin/config.yml`** defines what editors can create: a GitHub-backed backend (repo
   `dcln00/grugbox`, branch `main`) authenticated through a Cloudflare Worker OAuth proxy, with
   `publish_mode: editorial_workflow` (drafts go through PRs) and `open_authoring: true`.
3. **`content/*.md`** holds the markdown, with frontmatter matching the CMS fields.
4. **`content.config.ts`** (repo root, not `app/`) declares the Zod schemas that
   `queryCollection()` validates against at build time.
5. **`nuxt.config.ts`**'s `site.url` feeds the sitemap and canonical URLs. Keep it in step with the
   CMS `site_url` — these currently disagree on the `www` host (`nuxt.config.ts` has no `www`).

Collections `post`, `review`, `interview` and `playlist` exist in both the CMS and
`content.config.ts`; `legal` has a schema but no CMS collection (those files are hand-written).
**Adding a collection means touching both**, or editors cannot create it and the sitemap will not
know about it. Every collection also carries a `defineSitemapSchema` whose `onUrl` sets `lastmod`
from `date`; `legal` rewrites `/legal/` out of the path so those pages serve at the root.

Every collection extends Nuxt Content's `PageCollectionItemBase`, so `title` and `description` are
queryable even where a schema does not redeclare them. Generated types land in
`.nuxt/content/types.d.ts` after `npm run postinstall` — read that file rather than guessing whether
a field survived validation. Featured images use `/content/...`, resolving to `public/content/`
(the CMS sets `media_folder: public/content`, `public_folder: /content`).

Three schema fields have no CMS widget, so they can only be set by editing frontmatter directly:
`articles.video` (rendered by `isVideo()`), `interviews.description`, `playlists.tags`.

**The filename is the slug.** A route comes from the basename, not a `slug:` field in frontmatter,
and nothing in `app/` or `server/` hardcodes article paths — the listing pages read `path` off the
collection result, so renaming a file updates every internal link automatically. Renaming therefore
breaks only **external** URLs, and `nuxt.config.ts` has no redirects, so an old slug 404s the moment
it changes.

Slug conventions, which the CMS does **not** reproduce — its `slug: '{{slug}}'` derives the filename
from the title, emitting things like `profile-alorg-the-rebel-who-wont-pretend`, so rename the
generated file after saving: **`articles/`** artist-plus-subject kebab-case, no `profile-` prefix
(the category lives in frontmatter); **`interviews/`** artist + `-interview`; **`reviews/`**
`album-review-<artist>-<album>`; **`playlists/`** descriptive kebab-case, no prefix.

## App structure

`srcDir` is `app/`, set explicitly in `nuxt.config.ts` (Nuxt infers it from the directory's
*contents*, so an empty or half-populated `app/` would silently fall back to the repo root and drop
routes). `content/`, `public/`, `server/` and `content.config.ts` deliberately stay outside it.

**There is no `app/layouts/`.** `app/app.vue` is the single shell, and it gates the chrome —
`SubscriptionModal`, the back-to-top button, `AppHeader`, `AppDrawer` and `AppFooter` are all
`v-if="!isWorkspaceRoute"`, so `/workspace/**` renders bare. A new global element belongs there
behind the same guard.

**Every `.vue` file uses `<template lang="pug">`**, and `pug` is a load-bearing devDependency —
`compiler-sfc` resolves it at build time, so removing it breaks every component at once. Do not use
Pug's dot-notation class shorthand (`.photo(...)`, `article.featured(...)`); write an explicit tag
with a `class` attribute instead. The rendered `class` is identical either way — this is purely
about keeping templates readable and greppable.

Navigation lives in **`app/utils/nav.ts`** — `NAV_LINKS`, `FOOTER_SECTIONS` and `LEGAL_LINKS`
(note: `FOOTER_SECTIONS`, not `FOOTER_LINKS`). **`AppDrawer.vue` is the exception**: it redeclares
its own `primaryLinks` / `secondaryLinks`, so editing `nav.ts` does not update the drawer — fix the
drawer's copy rather than adding a fourth list. `AppHeader.vue` renders **two** headers itself (one
in flow, one `fixed` copy that slides in on scroll), the fixed one swapping the wordmark for the
`currentArticleTitle` `useState` that the four slug pages set and clear. The drawer is
`Teleport`ed to `body` and opened via the `isMenuOpen` `useState` shared with the header; there is
no `Aside.vue` and no `HeaderBar.vue`, and `app.vue` does not own the open state.

**Icons are SVG components in `app/components/svg/`**, auto-imported and used as `<svg-hamburger>`,
`<svg-socials-x>`. They paint with `currentColor`, so the surrounding `text-*` class drives their
colour. There is no icon module and no `app/assets/icons/`; `nuxt-svgo` was removed deliberately —
add a small `.vue` for a new glyph rather than reintroducing a module. `app/utils/logo.ts` is the
**single source for the wordmark** as raw SVG path data; `svg-logo.vue` and the workspace canvas
renderer (via `Path2D`) both read it. Do not inline a second copy.

### Styling

Tailwind 4 via `@nuxtjs/tailwindcss` v7 (beta), configured entirely in CSS — there is no
`tailwind.config.js`. `app/assets/css/tailwind.css` uses `@theme` (the `--color-brand-accent`
token), `@plugin` (typography) and `@utility`. `<style>` blocks exist in exactly four files
(`app.vue`, `AppHeader`, `AppDrawer`, `SubscriptionModal`) and only ever define Vue `<Transition>`
classes, which Tailwind cannot express — that is the one sanctioned reason for a style block;
everything else is utilities.

## The workspace (`/workspace`)

A password-gated internal tool: the team attaches photos and videos, and the app composites each
into an Instagram feed portrait or a vertical Reel with a category chip, the Grugbox mark and a
bottom caption, then exports PNG or MP4/WebM. Attachments are **in-memory only** — a refresh loses
them.

**Auth.** The real gate is **`server/middleware/workspace-auth.ts`**, which runs before render, so
an unauthenticated visitor never receives workspace markup (302 for documents, 401 for data).
`app/middleware/workspace-auth.ts` is documented defence in depth for client-side navigation only.
The session is a **stateless HMAC token** keyed by the password itself, so **rotating
`WORKSPACE_PASSWORD` invalidates every issued session**. Crypto and routing predicates live in
`server/utils/workspaceAuth.ts`, with the password passed in rather than read from `runtimeConfig`
so it unit-tests without Nitro; `MIN_PASSWORD_LENGTH` is 12 and refuses to run below it. The login
route's fixed 250 ms failure delay is deliberately **not** rate limiting — Vercel isolates
invocations, so an in-memory counter would be theatre.

The internals — canvas formats, caption fitting, the clip window, the export pipeline — are
documented in the files themselves (`app/utils/workspace/`, `useCanvasRenderer`, `useVideoExport`).
Read those before editing. What follows is only what is easy to break from outside:

- **Two canvas formats** — `FEED_FORMAT` 1080×1350 (photos and videos) and `REEL_FORMAT` 1080×1920
  (**video only**), both 1080 wide so they share one type scale. `canvasFormat.ts` is the single
  descriptor of both; a third format is one new descriptor, not edits to `draw.ts`, and nothing
  else hardcodes a frame size.
- **A photo cannot render on the 9:16 canvas**, so switching to a Reel while photo slides are
  attached is **refused** (`blockedFormats` holds the reason), never silently dropped.
- **`clipMode` is a predefined choice, not a trim UI** — no in-point or out-point exists anywhere.
  `effectiveClip` resolves which range is real, and **both the preview loop and the export read
  it**, which is what keeps the looping preview showing exactly the section that downloads.
- **A slide with no decoded frame is skipped, not drawn** — `drawScene` fills black first, so
  painting an undecoded video shows a black rectangle with the caption floating on it.
- **The `AudioContext` and `createMediaElementSource` node are session singletons** — the source may
  be created only once per element, ever. The shared `<video>` element stays rendered at 1px, never
  `display:none`, so the decoder keeps producing frames; rendering uses a coalesced rAF loop, not
  `requestVideoFrameCallback`, which never fires for a compositor-hidden element.
- **A canvas resize clears the 2D state and the backing store**, so a format switch redraws after
  `nextTick` — and the picker is disabled mid-export, because resizing a canvas `captureStream` is
  sampling would wreck the recording.
- **`app/utils/workspace/`'s pure half** (`geometry`, `caption`, `mark`, `mime`, `format`,
  `categories`, `canvasFormat`, `clip`, `fileKind`) injects every browser dependency (`measureText`,
  `isSupported`), which is exactly what makes it testable. Only `draw.ts` and `download.ts` need a
  real canvas and DOM.
- **`useWorkspaceFonts.ts` treats an empty resolved array as failure** — `fonts.load` resolves empty
  rather than rejecting when no face matches. Fonts are load-bearing: the canvas measures in Google
  Sans, so a fallback changes every caption's fit.

## Server routes

`server/` is outside `srcDir` and holds only API routes and middleware:

- `api/subscribe.post.ts` — the newsletter backend. Forwards to a Google Apps Script webhook
  (`GOOGLE_APPS_SCRIPT_URL`) both as query params and a JSON body so either style works, and returns
  `ok: true` with a warning rather than failing when the URL is unset, so the form still succeeds
  in local dev. The `setDefaultResultOrder('ipv4first')` is deliberate, not cruft — it works around
  IPv6 resolution trouble reaching Google.
- `api/workspace/*` — login, logout and session. `session.get.ts` is deliberately reachable without
  a session, because the client middleware must ask before it knows whether to redirect; it reports
  booleans and nothing else. Logout is POST so a link or image tag cannot trigger it.
- `api/volunteer-apply.post.ts` — the volunteer backend. Validates with the zod schema in
  `server/utils/volunteerApplication.ts`, verifies the Turnstile token, resolves the role title from
  the slug server-side, and emails to `careers@grugbox.world` through the Resend REST API
  (`RESEND_API_KEY`) — no SDK, just `$fetch`. Sender is `noreply@grugbox.world` with the applicant
  as `reply_to`, so replying in Zoho answers them. Three behaviours worth not "fixing" by accident:
  it **requires** a token whenever a Turnstile secret is configured (unlike `subscribe.post.ts`,
  which skips verification when the token is absent), it refuses to skip the action/hostname
  assertions except for Cloudflare's documented test secrets, and it **fails loudly** with a 503
  when `RESEND_API_KEY` is unset rather than reporting success — telling an applicant their
  application was received when nothing was sent is the worse failure.

`GOOGLE_APPS_SCRIPT_URL`, `WORKSPACE_PASSWORD` and `RESEND_API_KEY` are read through
`runtimeConfig` and are **server-only** — no `NUXT_PUBLIC_` prefix, nothing exposed to the client.
The Resend key is sending-only and scoped to the `grugbox.world` domain.

## Testing

`npm test` runs Vitest (`vitest.config.ts`, standalone — `environment: 'node'`, no Nuxt plugin, no
jsdom) over `test/**/*.spec.ts`. **Only pure functions are covered, by design:** the workspace
utilities, `server/utils/workspaceAuth.ts` and `server/utils/volunteerApplication.ts`. Nothing under
test imports Vue, Nuxt or Nitro, and the config comment says so explicitly.

That means no `.vue` file, no composable, no API route and no middleware is covered, and a test
needing a component mount or a Nuxt runtime would require changing the environment and pulling in
the Nuxt test plugin. Extending coverage means extending the injection seams (`measureText`,
`isSupported`) rather than mocking globals.

## Gotchas

**`better-sqlite3` must stay in `dependencies`.** `@nuxt/content` declares it as an *optional peer
dependency*, so npm will not install it automatically, but Content fails at runtime without it — a
fresh `npm install` yields *"Nuxt Content requires better-sqlite3 module to operate"* from
`nuxt prepare`. It works via its bundled prebuilds.

**`@nuxtjs/tailwindcss`'s npm `latest` tag is `6.14.0` (Tailwind 3).** The `^7.0.0-beta.1` range in
`package.json` is what keeps Tailwind 4. A bare `npm i @nuxtjs/tailwindcss` silently downgrades and
breaks the `@theme` / `@utility` CSS.

**Node:** `engines` is `^22.19.0 || ^24.11.0 || >=26.0.0` (Nuxt excludes odd-numbered non-LTS
releases) with `.nvmrc` at `24`. This machine runs Node 25 — a global Homebrew install, no version
manager — which is outside that range and produces `npm warn EBADENGINE` on install. Builds work
regardless.

**npm ≥11.19 gates install scripts.** Four packages here have unapproved install scripts
(`better-sqlite3`, `esbuild` ×2, `fsevents`); everything still works because they fall back to
prebuilds. A native dependency *without* prebuilds would install "successfully" and then fail at
runtime with no build error — use `npm install-scripts approve <pkg>` if that happens.

**og:image is the editor's featured photo, served exactly as uploaded — and no size is declared.**
`resolveOgImage` in `app/utils/media.ts` only absolutises the `/content/...` frontmatter path
against `site.url`; videos, missing values and protocol-relative URLs fall back to the Cloudinary
`grugbox-og.jpg`.

Featured images run from **544×680 portraits to 2048×1152 stills**, so link previews inherit
whatever shape the photo has, and the same article shared to iMessage can preview shorter or taller
than the next one. **That is a deliberate trade-off, not a bug to fix.** Normalising it means
cropping every image to one frame, which was tried, worked, and was removed on purpose: it costs a
build-time sharp module plus a generated directory, and it crops the editors' photos to do it. Do
not reintroduce it without asking.

Never declare `og:image:width` / `og:image:height` here. There is no single true value, and a fixed
1200×630 over a 544×680 photo is a declaration that lies — the mismatch is exactly what made the
preview height unpredictable in the first place. Let crawlers read the real image.

**Why no image provider can crop for us**, if this comes up again: `@nuxt/image` picks Vercel's
optimiser when Vercel builds (`/_vercel/image`) and ipx when built locally (`/_ipx/`), so any
hardcoded provider URL breaks in the other environment — shipped once, and article OG images 404'd
in production while working in dev. Vercel's optimiser also **cannot crop**: it resizes by width
only, and its `h` parameter is silently ignored (verified: `w=1536&h=630` returned the source at
2000×1333). Cloudinary's remote-fetch is disabled on this account (401).

**`twitterCard` is `summary_large_image`** in `app/app.vue`, so a shared link shows its photo at
full card width. A page's `useSeoMeta` registers deeper in the tree and wins over that, so a page
wanting the small card has to say so; the listing pages set it explicitly.

**`@nuxtjs/robots` owns `/robots.txt`, and no `public/robots.txt` should come back.** The rules live
in the `robots` key of `nuxt.config.ts`; `@nuxtjs/sitemap` appends the `Sitemap:` line via the
`robots:config` hook. A `public/robots.txt` is not served as-is — the module renames it to
`public/_robots.txt` and merges it — so re-adding one duplicates the config rules instead of
overriding them. `nuxt-ai-ready` must stay **above** `@nuxtjs/robots` in the `modules` array: it
injects the `Content-Signal` group by pushing onto `nuxt.options.robots.groups`, which robots reads
during its own setup, so listed after it the line silently never appears.

**`/about` 404s on purpose.** `.nuxtignore` lists `app/pages/about.vue`, so the page is never
registered and `/about` falls through to the `(legal)` catch-all `/:slug()`, which finds no
`content/legal/about` and throws a fatal 404. The file stays on disk — do not "fix" it by re-adding
the route.

**`/workspace` is kept out of the build three separate ways** in `nuxt.config.ts` — `routeRules`
`prerender: false`, `nitro.prerender.ignore`, and `sitemap.exclude` — and both workspace pages set
`robots: 'noindex, nofollow'`. Removing only one of these will not un-exclude it.

## Deployment

Vercel, via `nitro.preset: 'vercel'`; `.vercel/output/` is the artifact `vercel deploy --prebuilt`
uploads. Prefer letting Vercel build from git: a local build bundles **darwin-arm64** sharp binaries
and warns to deploy to the same architecture, so a Mac-built artifact shipped to Vercel's Linux
runtime would break image optimisation (`/_ipx`).

Content-only changes can be shipped through the CMS at `/admin`, which commits to `main`.
