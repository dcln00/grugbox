import { MIN_SEGMENT_SECONDS, OUTPUT_FPS } from '~/utils/workspace/constants'
import { pickRecorderFormat } from '~/utils/workspace/mime'
import type { RecorderFormat, TrimRange } from '~/utils/workspace/types'

/**
 * Shared across every export in a session.
 *
 * `createMediaElementSource` may be called ONCE per element, ever — a second
 * call throws InvalidStateError. Since the studio uses a single <video> whose
 * src is swapped between slides, the source node is created once and lives for
 * the session. For the same reason the AudioContext is created once and never
 * closed: a source node is bound to the context that made it, so recreating the
 * context would invalidate the node.
 */
let audioContext: AudioContext | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let monitorGain: GainNode | null = null

const PROGRESS_INTERVAL_MS = 100
/** Backstop in case the video stalls and `currentTime` never reaches the out-point. */
const OVERSHOOT_ALLOWANCE_SECONDS = 5

const seeked = (video: HTMLVideoElement): Promise<void> =>
	new Promise(resolve => {
		const done = (): void => {
			video.removeEventListener('seeked', done)
			resolve()
		}
		video.addEventListener('seeked', done)
	})

const getAudioContext = (): AudioContext => {
	if (audioContext) return audioContext

	const Ctor =
		typeof AudioContext !== 'undefined'
			? AudioContext
			: (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

	if (!Ctor) throw new Error('Web Audio is not available in this browser.')
	audioContext = new Ctor()
	return audioContext
}

/**
 * Routes the element's audio into a MediaStream WITHOUT connecting it to
 * `audioContext.destination`, so the recording captures sound that the user
 * never hears. Silence is achieved by omission, not by `video.muted` — muting
 * the element can zero the PCM before it reaches the graph and produce a
 * valid-looking file with a completely silent audio track.
 */
const ensureAudioTap = (video: HTMLVideoElement): MediaStreamAudioDestinationNode => {
	const context = getAudioContext()

	if (!sourceNode) sourceNode = context.createMediaElementSource(video)

	const destination = context.createMediaStreamDestination()
	sourceNode.connect(destination)

	return destination
}

/** Connects the tap to the speakers so the team can hear the clip while previewing. */
export const setExportMonitor = (enabled: boolean): void => {
	if (!audioContext || !sourceNode) return

	if (enabled) {
		if (!monitorGain) {
			monitorGain = audioContext.createGain()
			sourceNode.connect(monitorGain)
			monitorGain.connect(audioContext.destination)
		}
		monitorGain.gain.value = 1
		return
	}

	if (monitorGain) monitorGain.gain.value = 0
}

export function useVideoExport() {
	const isRecording = ref(false)
	const progress = ref(0)
	const status = ref('')
	const format = ref<RecorderFormat | null>(null)

	const detectFormat = (): RecorderFormat | null => {
		if (typeof MediaRecorder === 'undefined') return null
		if (typeof MediaRecorder.isTypeSupported !== 'function') return null
		return pickRecorderFormat(mimeType => MediaRecorder.isTypeSupported(mimeType))
	}

	const refreshFormat = (): RecorderFormat | null => {
		format.value = detectFormat()
		return format.value
	}

	const record = async (
		canvas: HTMLCanvasElement,
		video: HTMLVideoElement,
		trim: TrimRange,
	): Promise<Blob | null> => {
		const chosen = refreshFormat()

		if (!chosen) {
			status.value = 'This browser cannot record video. Try Chrome or Safari on desktop.'
			return null
		}

		if (typeof canvas.captureStream !== 'function') {
			status.value = 'This browser cannot capture the canvas. Try Chrome or Safari on desktop.'
			return null
		}

		const duration = Math.max(trim.end - trim.start, MIN_SEGMENT_SECONDS)

		let audioDestination: MediaStreamAudioDestinationNode | null = null
		try {
			audioDestination = ensureAudioTap(video)
			if (audioContext?.state === 'suspended') await audioContext.resume()
		} catch (caught: unknown) {
			// Export video-only rather than failing outright, but say so.
			console.warn('[Workspace] audio tap unavailable, exporting silent', caught)
			audioDestination = null
		}

		const stream = canvas.captureStream(OUTPUT_FPS)

		if (audioDestination) {
			for (const track of audioDestination.stream.getAudioTracks()) stream.addTrack(track)
		}

		// Mute for the initial play() so autoplay policy cannot reject it, then
		// unmute once playback has actually started — the audio graph only sees
		// sound when the element is not muted.
		video.muted = true
		video.currentTime = trim.start
		await seeked(video)

		const chunks: Blob[] = []
		const recorder = new MediaRecorder(stream, { mimeType: chosen.mimeType })
		const finished = new Promise<void>(resolve => {
			recorder.onstop = () => resolve()
		})

		recorder.ondataavailable = (event: BlobEvent) => {
			if (event.data.size > 0) chunks.push(event.data)
		}

		try {
			await video.play()
		} catch (caught: unknown) {
			console.warn('[Workspace] playback blocked; the recording may be short', caught)
		}

		video.muted = false
		// Timeslicing keeps memory flat and gives a second progress signal.
		recorder.start(1000)
		isRecording.value = true
		progress.value = 0

		const startedAt = performance.now()

		await new Promise<void>(resolve => {
			const timer = window.setInterval(() => {
				const elapsed = (performance.now() - startedAt) / 1000
				progress.value = Math.min(elapsed / duration, 1)

				const reachedEnd =
					video.currentTime >= trim.end || video.ended || elapsed > duration + OVERSHOOT_ALLOWANCE_SECONDS

				if (reachedEnd) {
					window.clearInterval(timer)
					resolve()
				}
			}, PROGRESS_INTERVAL_MS)
		})

		if (recorder.state !== 'inactive') recorder.stop()
		await finished

		// Restore preview state.
		video.muted = true
		isRecording.value = false
		progress.value = 0

		for (const track of stream.getVideoTracks()) track.stop()
		if (audioDestination) {
			for (const track of audioDestination.stream.getAudioTracks()) track.stop()
			// Disconnect or repeated exports stack taps on the same source node.
			try {
				sourceNode?.disconnect(audioDestination)
			} catch {
				// Already disconnected — harmless.
			}
		}

		if (chunks.length === 0) {
			status.value = 'The recorder produced no data. Try a shorter clip.'
			return null
		}

		return new Blob(chunks, { type: recorder.mimeType || chosen.mimeType })
	}

	return { isRecording, progress, status, format, refreshFormat, record }
}
