# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server — the only way to preview this app locally
npm test           # vitest run, one pass (test/**/*.spec.ts)
npm run build      # production build → .vercel/output
npm run generate
npm run postinstall  # nuxt prepare; regenerates .nuxt/ and the generated tsconfigs
```

There is **no linter and no typecheck script** — `vue-tsc` is not installed, so nothing here
catches type errors but the build. `npm test` exists but is narrow: see **Testing** below.

`npm run preview` **does not work here.** Because `nitro.preset` is `vercel`, Nitro writes to
Vercel's Build Output API layout (`.vercel/output/`) rather than the default `.output/`, and
`nuxt preview` exits with *"Preview is not supported for this build."* Use `npm run dev` to
verify changes. (`.vercel/` is ~63 MB and `.output/` is a vestigial empty shell; both are
gitignored and rebuilt from scratch.)

There is no CI, no `.github/` directory and no `vercel.json` — deployment config is entirely
`nitro.preset` in `nuxt.config.ts`.

## Content pipeline

Publishing flows through files that must be kept in sync — this is the main thing that
requires reading across files to understand:

1. **`public/admin/index.html`** loads Sveltia CMS from a CDN. The editor UI lives at `/admin`.
2. **`public/admin/config.yml`** defines what editors can create: a GitHub-backed backend
   (repo `dcln00/grugbox`, branch `main`) authenticated through a Cloudflare Worker OAuth proxy
   at `base_url`, with `publish_mode: editorial_workflow` (drafts go through PRs) and
   `open_authoring: true` — anyone who reaches the CMS can propose an edit, but nothing lands on
   `main` without merging the PR.
3. **`content/*.md`** holds the markdown, with frontmatter matching the CMS fields.
4. **`content.config.ts`** (repo root, not `app/`) declares the Zod schemas that
   `queryCollection()` validates against at build time.
5. **`nuxt.config.ts`**'s `site.url` feeds the sitemap and canonical URLs. Keep it in step with
   `public/admin/config.yml`'s `site_url` — these currently disagree on the `www` host
   (`nuxt.config.ts` has no `www`, the CMS does).

The CMS and `content.config.ts` agree on collections: `post`, `review`, `interview` and
`playlist` exist in both, and both are authorable through `/admin`. (`legal` has a schema but no
CMS collection — those files are hand-written.)

Every collection also carries a `defineSitemapSchema` entry whose `onUrl` sets `lastmod` from
`date`; the `legal` collection rewrites `/legal/` out of the path so those pages serve at the
root. Adding a collection means touching **both** `content.config.ts` and the CMS config, or
editors cannot create it and the sitemap will not know about it.

Three schema fields have no CMS widget, so they can only be set by editing frontmatter directly:

- **`articles.video`** — the frontend renders it (`isVideo()` in `pages/index.vue` and
  `pages/articles/index.vue`), but the CMS post collection has no video field.
- **`interviews.description`** — optional in the schema and read by `pages/interviews/index.vue`
  and `[slug].vue` for the listing blurb and Open Graph tags, but absent from the CMS interview
  fields.
- **`playlists.tags`** — optional in the schema, with no tags field in the CMS playlist
  collection.

Every collection extends Nuxt Content's `PageCollectionItemBase`, so `title` and `description`
are queryable on any collection even where its schema does not redeclare them. Generated types
land in `.nuxt/content/types.d.ts` after `npm run postinstall` — read that file rather than
guessing whether a field survived validation.

Featured images use `/content/...` paths, which resolve to `public/content/` (the CMS sets
`media_folder: public/content` and `public_folder: /content`).

**The filename is the slug.** A content file's route comes from its basename, not from a
`slug:` field in frontmatter — `content/articles/alorg-rebel-who-wont-pretend.md` serves at
`/articles/alorg-rebel-who-wont-pretend`. Nothing in `app/` or `server/` hardcodes article
paths; the listing pages read `path` off the collection result, so renaming a file updates
every internal link automatically. Renaming therefore breaks only **external** URLs, and
`nuxt.config.ts` has no redirects configured, so an old slug 404s the moment it changes.

Slug conventions by collection, which the CMS will **not** reproduce on create (its
`slug: '{{slug}}'` derives the filename from the title, so it emits things like
`profile-alorg-the-rebel-who-wont-pretend` for a profile titled "Profile: AlorG, the Rebel Who
Won't Pretend" — rename the generated file after saving):

- **`articles/`** — descriptive kebab-case built from artist plus subject, matching the rest of
  the collection (`black-sherif-iron-boy-tour`, `jude-dontoh-featured-on-kanye-west-bully-deluxe-album`).
  Profiles carry no `profile-` prefix; the category lives in frontmatter (`category: profile`),
  not in the filename.
- **`interviews/`** — artist name plus a type suffix (`amaarae-interview`, `guiltybeatz-interview`).
- **`reviews/`** — `album-review-<artist>-<album>` or `ep-review-<artist>-<album>`, with one
  holdout (`the-sound-of-after-midnight.md`).
- **`playlists/`** — descriptive kebab-case, no prefix (`grugbox-essentials-alte-highlife`).

## App structure

`srcDir` is `app/`, set explicitly in `nuxt.config.ts` (Nuxt's auto-detection infers it from the
directory's *contents*, so an empty or half-populated `app/` would silently fall back to the repo
root and drop routes). `content/`, `public/`, `server/` and `content.config.ts` deliberately stay
outside it.

**There is no `app/layouts/`.** `app/app.vue` is the single shell, and it gates the chrome —
`SubscriptionModal`, the back-to-top button, `AppHeader`, `AppDrawer` and `AppFooter` are all
`v-if="!isWorkspaceRoute"`, so `/workspace/**` renders bare. A new global element belongs there
behind the same guard.

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

### Header, drawer and nav

`AppHeader.vue` renders **two** headers itself — one in flow, and a `fixed` copy inside a
`<Transition name="nav">` that slides in once scrolled — both inlined in that one component.
The fixed copy swaps the wordmark for the current article title on a slug route, reading the
`currentArticleTitle` `useState` that the four slug pages set and clear. The in-flow header
renders the section links; the fixed one has an identical `nav` block commented out.

The drawer is **`AppDrawer.vue`**, `Teleport`ed to `body`, opened via the `isMenuOpen` `useState`
(shared with `AppHeader`, which also sets `isDynamicHeaderHidden` to slide the fixed header away
first). There is no `Aside.vue` and no `HeaderBar.vue`; `app.vue` does not own the open state.

Navigation lives in **`app/utils/nav.ts`** — `NAV_LINKS`, `FOOTER_SECTIONS` and `LEGAL_LINKS`
(note: `FOOTER_SECTIONS`, not `FOOTER_LINKS`), auto-imported into `AppHeader` and `AppFooter`.
`AppDrawer.vue` is the exception: it redeclares its own `primaryLinks` / `secondaryLinks` arrays,
so editing `nav.ts` does not update the drawer. Keep `nav.ts` the source and fix the drawer's
copy rather than adding a fourth list.

### Icons

Icons are **SVG components in `app/components/svg/`** (`hamburger`, `close`, `chevron-right`,
`chevron-down`, `arrow-up`, `logo`, and `socials/*`), auto-imported and used as `<svg-hamburger>`,
`<svg-socials-x>`. They paint with `currentColor`, so the surrounding `text-*` class drives their
colour. There is no icon module and no `app/assets/icons/` directory; `nuxt-svgo` was removed
deliberately — add a small `.vue` here for a new glyph rather than reintroducing a module.

`app/utils/logo.ts` is the **single source for the wordmark** as raw SVG path data. `svg-logo.vue`
and the workspace canvas renderer both read it, the latter via `Path2D`, which takes SVG path data
directly — no rasterising, no async image load, no canvas tainting. Do not inline a second copy.

### Styling

Tailwind 4 via `@nuxtjs/tailwindcss` v7 (beta), configured entirely in CSS — there is no
`tailwind.config.js`. See `app/assets/css/tailwind.css`, which uses `@theme` (the
`--color-brand-accent` token), `@plugin` (typography), and `@utility`.

`<style>` blocks exist in exactly four files (`app.vue`, `AppHeader`, `AppDrawer`,
`SubscriptionModal`) and only ever define Vue `<Transition>` classes, which Tailwind cannot
express. That is the one sanctioned reason for a style block; everything else is utilities.

## The workspace (`/workspace`)

A password-gated internal tool under `app/pages/workspace/`: the team attaches photos and videos,
and the app composites each into an Instagram feed portrait or a vertical Reel with a category
chip, the Grugbox mark and a bottom caption, then exports PNG or MP4/WebM. Attachments are
**in-memory only** — a refresh loses them.

**Auth.** The real gate is **`server/middleware/workspace-auth.ts`**, which runs before render, so
an unauthenticated visitor never receives workspace markup: document requests get a 302 to
`/workspace/login`, data requests a 401. `app/middleware/workspace-auth.ts` (applied by
`definePageMeta({ middleware: 'workspace-auth' })` on `index.vue`) is documented defence in depth
for client-side navigation only. The session is a **stateless HMAC token** —
`<expiryEpoch>.<hmac-sha256(password, expiry)>`, 7-day TTL, `httpOnly`/`lax`/`secure` cookie —
keyed by the password itself, so **rotating `WORKSPACE_PASSWORD` invalidates every issued
session**. `server/utils/workspaceAuth.ts` holds the crypto and the routing predicates, with the
password passed in rather than read from `runtimeConfig` so it can be unit-tested without Nitro.
`MIN_PASSWORD_LENGTH` is 12 and refuses to run below it. The login route's fixed 250 ms failure
delay is deliberately **not** rate limiting — Vercel isolates invocations, so an in-memory counter
would be theatre; the long random password is the defence.

**Two canvas formats.** `app/utils/workspace/canvasFormat.ts` is the single description of both
frames and everything that differs between them: size, which media they accept, the platform's
clip cap and the caption metrics. `FEED_FORMAT` is 1080×1350 (4:5, photos and videos, 60s) and
`REEL_FORMAT` is 1080×1920 (9:16, **video only**, 180s). Both frames are 1080 wide on purpose, so
they share one type scale — only the height, the caption's bottom anchor and the Reel's narrower
measure differ. Adding a third format means adding one descriptor, not editing `draw.ts`.

Nothing else hardcodes a frame size: the draw primitives take a format (typed down to just the
fields they read — `Frame` for the ones that only need width/height, `CaptionMetrics` for the
caption), and the caption fitter takes that format's metrics rather than defaulting to one
format's numbers. The Reel's caption is anchored **250px above the bottom edge** so Instagram's
own Reel UI (username, audio, the button rail) does not cover it, and its measure stops short of
the right-hand action rail — the feed, which has neither, keeps its ~155px bottom margin and
full-width measure.

**Media policy and the clip window.** A photo cannot render on the 9:16 canvas, so switching to a
Reel is **refused while photo slides are attached** (`blockedFormats` in the studio holds the
reason; the picker disables the button and prints it) rather than silently dropping the team's
work.

Clip length is a **predefined choice, not a trim UI.** Each video slide carries a `clipMode` of
`'trim'` (the default) or `'full'`, and the team sets no in-point or out-point — there are no
sliders anywhere. `'trim'` is the opening `TRIMMED_CLIP_SECONDS` (30s, deliberately the same on
both canvases); `'full'` is the whole clip, capped at the format's limit. `effectiveClip` in
`clip.ts` resolves which range is real, and **both the preview loop and the export read it** —
that is what keeps the looping preview showing exactly the section that downloads. Nothing about
the range is stored per slide, so a canvas change cannot leave a stale selection behind and there
is nothing to re-fit.

**Canvas and the pure core.** PNG export does no rescaling — the canvas backing store *is* the
export resolution in both formats; the preview `<canvas>` is sized by CSS only. `coverRect` in
`geometry.ts` returns a *destination* rect, not a source crop — `drawImage` accepts negative
x/y — so callers draw straight in with no clipping, and zero/negative source dims return a
full-frame rect to stop an undecoded video producing `NaN`. The caption block is bottom-anchored
and grows upward, its line budget *derived* from each frame's own space; the font shrinks 62→28,
manual line breaks are inviolable, and an over-long caption reports `atMinimumFont` separately
from genuinely dropped lines (`truncated`). The fitter checks the block's **height** as well as its
line count — a stack of short manual lines can satisfy the budget while standing taller than the
frame — so the font shrinks until the block fits the space above the baseline.

**Nothing without a drawable frame is painted.** A slide whose video has no decoded frame is
skipped rather than drawn: `drawScene` fills the frame black first, so painting it produced the
black rectangle with the caption floating on it — visible while a clip loaded, and for a moment on
every seek, which a trimmed clip makes as it loops back to its start. Skipping leaves the last good
frame in place, and a loading panel in `index.vue` covers the gap until the first frame lands
(`isPreparingFrame`). An empty deck still paints, so the chip and caption stay previewable with no
media attached.

A format switch resizes the canvas, which clears the 2D state and the backing store, so it is
redrawn after `nextTick` rather than through the coalescing rAF (`flush: 'sync'` would draw the new
size into the old store) — and the picker is disabled mid-export, because resizing a canvas that
`captureStream` is sampling would wreck the recording.

`app/utils/workspace/` splits cleanly: `geometry`, `caption`, `mark`, `mime`, `format`,
`categories`, `canvasFormat`, `clip` and `fileKind` are **pure** — every browser dependency is
injected (`fitCaption` takes a `measureText` function, `pickRecorderFormat` takes an `isSupported`
predicate), which is exactly what makes them testable. `draw.ts` and `download.ts` need a real
canvas and DOM.

**Export.** Video export is real-time `MediaRecorder` over `canvas.captureStream(30)` — no
WebCodecs, no Worker, no OffscreenCanvas. Consequences worth knowing before touching it: exports
stall if the tab is backgrounded (the rAF loop stops on `visibilitychange`); MP4 is preferred and
Firefox falls back to WebM, which the UI warns is unreliable for Instagram; the `AudioContext` and
`createMediaElementSource` node are **session singletons** because the source may be created only
once per element, ever; and the single shared `<video>` element stays rendered at 1px rather than
`display:none` so the decoder keeps producing frames. Rendering uses a coalesced rAF loop, not
`requestVideoFrameCallback`, because rVFC never fires for a compositor-hidden element.

Only the recent-categories list and the shared mark colourway persist. `useWorkspaceFonts.ts`
probes for Google Sans and treats an **empty resolved array as failure** — `fonts.load` resolves
empty rather than rejecting when no face matches. Fonts are load-bearing: the canvas measures in
`Google Sans` (loaded globally by `@nuxt/fonts`), so a fallback changes every caption's fit.

## Server routes

`server/` is outside `srcDir` and holds only API routes and middleware:

- `api/subscribe.post.ts` — the newsletter form's backend. Validates the email, then forwards to
  a Google Apps Script webhook (`GOOGLE_APPS_SCRIPT_URL`) both as query params and a JSON body so
  either style of Apps Script works. Returns `ok: true` with a warning rather than failing when
  the URL is unset, so the form still succeeds in local dev. The `setDefaultResultOrder('ipv4first')`
  at the top is deliberate, not cruft — it works around IPv6 resolution trouble reaching Google.
- `api/workspace/*` — login, logout and session. `session.get.ts` is deliberately reachable
  without a session because the client middleware must ask before it knows whether to redirect;
  it reports booleans and nothing else. Logout is POST so a link or image tag cannot trigger it.
- `api/volunteer-apply.post.ts` — the volunteer form's backend. Validates with the zod schema in
  `server/utils/volunteerApplication.ts`, verifies the Turnstile token, resolves the role title
  from the slug server-side, and emails the application to `careers@grugbox.world` through the
  Resend REST API (`RESEND_API_KEY`) — no SDK dependency, just `$fetch`. Sender is
  `noreply@grugbox.world` with the applicant as `reply_to`, so replying in Zoho answers them.
  Three behaviours worth not "fixing" by accident: it **requires** a token whenever a Turnstile
  secret is configured (unlike `subscribe.post.ts`, which skips verification when the token is
  absent), it refuses to skip the action/hostname assertions except for Cloudflare's documented
  test secrets (local dev runs on them and they return placeholder metadata), and it **fails
  loudly** with a 503 when `RESEND_API_KEY` is unset rather than reporting success — telling an
  applicant their application was received when nothing was sent is the worse failure.

`GOOGLE_APPS_SCRIPT_URL`, `WORKSPACE_PASSWORD` and `RESEND_API_KEY` are read through
`runtimeConfig` and are **server-only** — no `NUXT_PUBLIC_` prefix, nothing exposed to the client.
The Resend key is sending-only and scoped to the `grugbox.world` domain.

## Testing

`npm test` runs Vitest (`vitest.config.ts`, standalone — `environment: 'node'`, no Nuxt plugin,
no jsdom) over `test/**/*.spec.ts`. **Only pure functions are covered, by design:** the workspace
utilities, `server/utils/workspaceAuth.ts` and `server/utils/volunteerApplication.ts`. Nothing
under test imports Vue, Nuxt or Nitro, and the config comment says so explicitly.

That means no `.vue` file, no composable, no API route and no middleware is covered, and adding a
test that needs a component mount or a Nuxt runtime would require changing the environment and
pulling in the Nuxt test plugin. Extending coverage means extending the injection seams
(`measureText`, `isSupported`) rather than mocking globals.

## Gotchas

**`better-sqlite3` must stay in `dependencies`.** `@nuxt/content` declares it as an *optional peer
dependency*, so npm will not install it automatically, but Content fails at runtime without it —
a fresh `npm install` yields *"Nuxt Content requires better-sqlite3 module to operate"* from
`nuxt prepare`. It works via its bundled prebuilds.

**`@nuxtjs/tailwindcss`'s npm `latest` tag is `6.14.0` (Tailwind 3).** The `^7.0.0-beta.1` range
in `package.json` is what keeps Tailwind 4. A bare `npm i @nuxtjs/tailwindcss` silently downgrades
and breaks the `@theme` / `@utility` CSS.

**Node:** `engines` is `^22.19.0 || ^24.11.0 || >=26.0.0` (Nuxt excludes odd-numbered non-LTS
releases) with `.nvmrc` at `24`. This machine runs Node 25 — a global Homebrew install, no version
manager — which is outside that range and produces `npm warn EBADENGINE` on install. Builds work
regardless.

**npm ≥11.19 gates install scripts.** Four packages here have unapproved install scripts
(`better-sqlite3`, `esbuild` ×2, `fsevents`); everything still works because they fall back to
prebuilds. A native dependency *without* prebuilds would install "successfully" and then fail at
runtime with no build error — use `npm install-scripts approve <pkg>` if that happens.

**Open Graph images resolved from frontmatter are relative, and crawlers drop them.** Content
stores `image: /content/foo.jpg`, and the slug pages pass that straight to `ogImage`, so posts
*with* a featured image get no social preview at all while posts without one fall back correctly.
The fallback is the absolute Cloudinary `grugbox-og.jpg`, which is why this hides. Fixing it means
absolutising against `site.url` from `useSiteConfig()` before it reaches `useSeoMeta`.

**`twitterCard` must be set per page.** `app/app.vue` declares `twitterCard: 'summary'` globally;
a page's `useSeoMeta` registers deeper in the tree and wins, so any page wanting a large card has
to say so itself. The four listing pages (`articles|reviews|interviews|playlists/index.vue`)
currently do not, and inherit the small card.

**`/workspace` is kept out of the build three separate ways** in `nuxt.config.ts` —
`routeRules` `prerender: false`, `nitro.prerender.ignore`, and `sitemap.exclude` — and both
workspace pages set `robots: 'noindex, nofollow'`. Removing only one of these will not un-exclude
it.

## Deployment

Vercel, via `nitro.preset: 'vercel'`; `.vercel/output/` is the artifact `vercel deploy --prebuilt`
uploads. Prefer letting Vercel build from git: a local build bundles **darwin-arm64** sharp
binaries and warns to deploy to the same architecture, so a Mac-built artifact shipped to Vercel's
Linux runtime would break image optimisation (`/_ipx`).

Content-only changes can be shipped through the CMS at `/admin`, which commits to `main`.
