/**
 * Constants that hold for BOTH canvas formats. Anything that depends on the
 * frame — its size, the caption metrics that fit it, which media it accepts and
 * the platform's clip cap — lives in `canvasFormat.ts` instead.
 */

/** Shared margin for the chip (top-left) and the logo (top-right). */
export const PAGE_MARGIN = 40

export const CHIP_HEIGHT = 48
export const CHIP_RADIUS = 6
export const CHIP_FONT_SIZE = 26
export const CHIP_PADDING_X = 10
export const CHIP_MAX_LABEL_LENGTH = 24

/**
 * Side of the square Grugbox mark in the top-right. Sized above CHIP_HEIGHT
 * (48) so the symbol reads at Instagram's display sizes — the previous
 * wordmark filled ~197px of this band at a 3.94:1 aspect, and a square mark
 * at chip height looked like a speck.
 */
export const LOGO_HEIGHT = 72

/** Where the scrim gradient begins, as a fraction of canvas height. */
export const SCRIM_START_RATIO = 0.55

export const CAPTION_FONT_WEIGHT = 700
export const CHIP_FONT_WEIGHT = 700

/**
 * Google Sans is loaded by @nuxt/fonts at 400–700. The fallback matters: canvas
 * text is measured and drawn synchronously, so a missing font must still produce
 * a sane layout rather than an empty frame.
 */
export const FONT_FAMILY = '"Google Sans", system-ui, sans-serif'

export const MAX_SLIDES = 10

/** Shortest segment the recorder will produce, so a near-empty clip is not attempted. */
export const MIN_SEGMENT_SECONDS = 0.5

/**
 * The predefined length of a "trimmed" export, the same on both canvases.
 *
 * The team picks between this and the whole clip; there is no in-point or
 * out-point to set, so this is the only number that decides a trimmed cut.
 */
export const TRIMMED_CLIP_SECONDS = 30

export const OUTPUT_FPS = 30

export const MIME_PNG = 'image/png'

/** Warn when a single attached file is big enough to risk the tab's memory. */
export const LARGE_FILE_WARNING_BYTES = 200 * 1024 * 1024
