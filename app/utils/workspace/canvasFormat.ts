import { PAGE_MARGIN } from './constants'
import type { CaptionMetrics, MediaKind } from './types'

/**
 * The two canvases the team publishes to: an Instagram feed portrait and a
 * vertical video for Reels/TikTok.
 *
 * A format is plain data. Every drawing primitive takes one as an argument
 * rather than reading a hardcoded frame size, so the whole pipeline — preview,
 * PNG export and video export — serves both through one code path.
 */
export type FormatId = 'feed' | 'reel'

export interface CanvasFormat {
	id: FormatId
	label: string
	/** Picker subtitle, e.g. `1080 × 1350`. */
	dimensionsLabel: string
	/** e.g. `4:5`. */
	aspectLabel: string
	/**
	 * Tailwind aspect utility for the preview element.
	 *
	 * A class rather than a CSS value so it stays greppable and Tailwind's
	 * scanner can see the literal — keep it a contiguous string, never built by
	 * concatenation, or the utility silently vanishes from the stylesheet.
	 */
	previewAspectClass: string
	width: number
	height: number
	/** The media kinds the deck accepts in this format. */
	accepts: readonly MediaKind[]
	/** `accept` for the file input. Kept in step with `accepts` by hand. */
	acceptAttribute: string
	/** e.g. `photos and videos`. Used when refusing a file. */
	mediaLabel: string
	/** What to attach, shown while the deck is empty. */
	emptyDeckHint: string
	/**
	 * Longest clip the platform accepts. Caps the trimmer AND a "full video"
	 * export, since a longer file is rejected on upload anyway.
	 */
	maxClipSeconds: number
	/** Shown when a source is longer than `maxClipSeconds`. */
	clipHint: string
	caption: CaptionMetrics
}

/** Both frames are this wide, which is what keeps the type scale identical. */
const PAGE_WIDTH = 1080
const FEED_HEIGHT = 1350
const REEL_HEIGHT = 1920

/**
 * Instagram draws its own UI over the bottom band of a Reel — username, caption,
 * audio, the button rail. A caption anchored where the feed's sits would sit
 * underneath it, so the Reel's block is raised clear of the band instead.
 *
 * Exported so the test asserting the caption clears it compares against the real
 * number rather than a copy that would go on passing after a change here.
 */
export const REEL_UI_BAND = 250

/**
 * The Reel action rail (like, comment, share, audio) occupies the right edge
 * over the same vertical stretch the caption now sits in, so the Reel's measure
 * stops short of it. The feed has no such rail.
 */
const REEL_ACTION_RAIL = 120

/**
 * Hard ceiling on lines, derived from the space actually available at the
 * smallest permitted font — NOT an arbitrary number.
 *
 * An earlier fixed budget of 8 silently dropped lines from a caption with 10
 * explicit breaks, even though those 10 lines fit comfortably. Deriving it from
 * geometry means truncation only happens when the text genuinely cannot fit —
 * and, because the two formats have different heights, each gets its own budget.
 */
export const lineBudgetFor = (metrics: Omit<CaptionMetrics, 'lineBudget'>): number =>
	Math.max(
		1,
		Math.floor(
			(metrics.baselineBottom - metrics.safeTop) / (metrics.minFontSize * metrics.lineHeight),
		),
	)

/** Fills in the derived budget, so no format can ship an arbitrary one. */
const captionMetricsFor = (metrics: Omit<CaptionMetrics, 'lineBudget'>): CaptionMetrics => ({
	...metrics,
	lineBudget: lineBudgetFor(metrics),
})

/**
 * Identical for both formats on purpose. Both frames are 1080 wide, so
 * Instagram renders them at the same scale and the type has to match to read
 * the same; only the height, and so the caption's bottom anchor, differs.
 */
const CAPTION_TYPE = {
	maxFontSize: 62,
	minFontSize: 28,
	lineHeight: 1.16,
	maxLines: 4,
} as const

/** The chip and logo band ends at PAGE_MARGIN + CHIP_HEIGHT (76). */
const CAPTION_SAFE_TOP = 140

export const FEED_FORMAT: CanvasFormat = {
	id: 'feed',
	label: 'Feed post',
	dimensionsLabel: '1080 × 1350',
	aspectLabel: '4:5',
	previewAspectClass: 'aspect-4/5',
	width: PAGE_WIDTH,
	height: FEED_HEIGHT,
	accepts: ['image', 'video'],
	acceptAttribute: 'image/*,video/*',
	mediaLabel: 'photos and videos',
	emptyDeckHint: 'Attach a photo, a video, or both. Photos export as PNG, videos as MP4.',
	maxClipSeconds: 60,
	clipHint: 'Instagram feed video caps at 60 seconds, so the export stops there.',
	caption: captionMetricsFor({
		...CAPTION_TYPE,
		safeTop: CAPTION_SAFE_TOP,
		// Leaves roughly 150px of photo beneath the text, matching the reference.
		baselineBottom: FEED_HEIGHT - 155,
		maxWidth: PAGE_WIDTH - PAGE_MARGIN * 2,
	}),
}

export const REEL_FORMAT: CanvasFormat = {
	id: 'reel',
	label: 'Reel',
	dimensionsLabel: '1080 × 1920',
	aspectLabel: '9:16',
	previewAspectClass: 'aspect-9/16',
	width: PAGE_WIDTH,
	height: REEL_HEIGHT,
	accepts: ['video'],
	acceptAttribute: 'video/*',
	mediaLabel: 'videos',
	emptyDeckHint: 'Attach a video. Reels export as MP4 or WebM.',
	maxClipSeconds: 180,
	clipHint: 'Reels cap at 3 minutes, so the export stops there.',
	caption: captionMetricsFor({
		...CAPTION_TYPE,
		safeTop: CAPTION_SAFE_TOP,
		baselineBottom: REEL_HEIGHT - REEL_UI_BAND,
		maxWidth: PAGE_WIDTH - PAGE_MARGIN * 2 - REEL_ACTION_RAIL,
	}),
}

export const CANVAS_FORMATS: Record<FormatId, CanvasFormat> = {
	feed: FEED_FORMAT,
	reel: REEL_FORMAT,
}

/** Picker order. */
export const FORMAT_OPTIONS: readonly CanvasFormat[] = [FEED_FORMAT, REEL_FORMAT]
