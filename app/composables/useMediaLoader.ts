export interface LoadedImage {
	kind: 'image'
	objectUrl: string
	image: HTMLImageElement
	width: number
	height: number
}

export interface LoadedVideo {
	kind: 'video'
	objectUrl: string
	width: number
	height: number
	duration: number
}

const loadImageElement = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => resolve(image)
		image.onerror = () => reject(new Error('image decode failed'))
		image.src = url
	})

/**
 * Fragmented files (some .mov, some webm) report `duration === Infinity`, which
 * would render as a NaN scrubber. The seekable range is the real length.
 */
const resolveDuration = (video: HTMLVideoElement): number => {
	if (Number.isFinite(video.duration) && video.duration > 0) return video.duration

	try {
		if (video.seekable.length > 0) return video.seekable.end(video.seekable.length - 1)
	} catch {
		// Not seekable yet; fall through to 0 rather than throwing.
	}

	return 0
}

export function useMediaLoader() {
	const loadImageFile = async (file: File): Promise<LoadedImage> => {
		const objectUrl = URL.createObjectURL(file)

		try {
			const image = await loadImageElement(objectUrl)
			return {
				kind: 'image',
				objectUrl,
				image,
				width: image.naturalWidth,
				height: image.naturalHeight,
			}
		} catch (caught: unknown) {
			// Revoke before rethrowing, or a rejected attach leaks the blob.
			URL.revokeObjectURL(objectUrl)
			console.warn('[Workspace] image load failed', caught)
			throw new Error(`Could not read “${file.name}” as an image.`)
		}
	}

	const loadVideoFile = async (file: File): Promise<LoadedVideo> => {
		const objectUrl = URL.createObjectURL(file)
		const probe = document.createElement('video')

		probe.preload = 'metadata'
		probe.muted = true
		probe.playsInline = true

		try {
			await new Promise<void>((resolve, reject) => {
				probe.onloadedmetadata = () => resolve()
				probe.onerror = () => reject(new Error('video decode failed'))
				probe.src = objectUrl
			})

			return {
				kind: 'video',
				objectUrl,
				width: probe.videoWidth,
				height: probe.videoHeight,
				duration: resolveDuration(probe),
			}
		} catch (caught: unknown) {
			URL.revokeObjectURL(objectUrl)
			console.warn('[Workspace] video load failed', caught)
			// HEVC .mov off an iPhone is the usual culprit in Chrome.
			throw new Error(
				`Could not read “${file.name}”. If it is an iPhone .mov, export it as an H.264 MP4 and try again.`,
			)
		} finally {
			probe.removeAttribute('src')
			probe.load()
		}
	}

	return { loadImageFile, loadVideoFile }
}
