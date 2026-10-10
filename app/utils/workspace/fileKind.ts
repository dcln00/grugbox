import type { MediaKind } from './types'

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v', '.ogv', '.avi', '.mkv']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.heic', '.heif', '.bmp']

/**
 * MIME type first, extension as a fallback — some systems hand over an empty or
 * generic `file.type`, and a `.mov` that reports as `application/octet-stream`
 * would otherwise be rejected.
 *
 * The existing `~/utils/media.ts` `isVideo()` inspects a URL string, so it can't
 * be reused for a `File`.
 */
export const kindForFile = (file: File): MediaKind | null => {
	if (file.type.startsWith('video/')) return 'video'
	if (file.type.startsWith('image/')) return 'image'

	const name = file.name.toLowerCase()

	if (VIDEO_EXTENSIONS.some(extension => name.endsWith(extension))) return 'video'
	if (IMAGE_EXTENSIONS.some(extension => name.endsWith(extension))) return 'image'

	return null
}

export const acceptAttribute = (): string => 'image/*,video/*'
