/** Canvas geometry — Instagram feed portrait, 4:5. */
export const CANVAS_WIDTH = 1080
export const CANVAS_HEIGHT = 1350

/** Shared margin for the chip (top-left) and the logo (top-right). */
export const PAGE_MARGIN = 28

export const CHIP_HEIGHT = 48
export const CHIP_RADIUS = 6
export const CHIP_FONT_SIZE = 28
export const CHIP_PADDING_X = 22
export const CHIP_MAX_LABEL_LENGTH = 24

export const LOGO_HEIGHT = 50

/** Where the scrim gradient begins, as a fraction of canvas height. */
export const SCRIM_START_RATIO = 0.55

export const CAPTION_MAX_FONT_SIZE = 62
export const CAPTION_MIN_FONT_SIZE = 28
export const CAPTION_LINE_HEIGHT = 1.16
export const CAPTION_MAX_LINES = 4
/**
 * The highest the caption block may reach. Anything above this would collide
 * with the chip and logo band, which ends at PAGE_MARGIN + CHIP_HEIGHT (76).
 */
export const CAPTION_SAFE_TOP = 140
/**
 * Baseline of the LAST caption line. The block grows upward from here, so the
 * gap below the caption stays constant regardless of line count — matching the
 * reference, which leaves roughly 150px of photo beneath the text.
 */
export const CAPTION_BASELINE_BOTTOM = 1195
/**
 * Hard ceiling on lines, derived from the space actually available at the
 * smallest permitted font — NOT an arbitrary number.
 *
 * An earlier fixed budget of 8 silently dropped lines from a caption with 10
 * explicit breaks, even though those 10 lines fit comfortably. Deriving it from
 * geometry means truncation only happens when the text genuinely cannot fit.
 *
 * Declared after CAPTION_BASELINE_BOTTOM: `const` bindings are not hoisted for
 * initialisation, so referencing it above would throw at module load.
 */
export const CAPTION_LINE_BUDGET = Math.max(
	1,
	Math.floor((CAPTION_BASELINE_BOTTOM - CAPTION_SAFE_TOP) / (CAPTION_MIN_FONT_SIZE * CAPTION_LINE_HEIGHT)),
)

/** Full-width measure for the caption, inset by the page margin on both sides. */
export const CAPTION_MAX_WIDTH = CANVAS_WIDTH - PAGE_MARGIN * 2

export const CAPTION_FONT_WEIGHT = 700
export const CHIP_FONT_WEIGHT = 700

/**
 * Google Sans is loaded by @nuxt/fonts at 400–700. The fallback matters: canvas
 * text is measured and drawn synchronously, so a missing font must still produce
 * a sane layout rather than an empty frame.
 */
export const FONT_FAMILY = '"Google Sans", system-ui, sans-serif'

export const MAX_SLIDES = 10
export const MAX_CLIP_SECONDS = 60

export const OUTPUT_FPS = 30

export const MIME_PNG = 'image/png'

/** Warn when a single attached file is big enough to risk the tab's memory. */
export const LARGE_FILE_WARNING_BYTES = 200 * 1024 * 1024
