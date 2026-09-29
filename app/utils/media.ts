export const isVideo = (url?: string | null): boolean => {
	if (!url) return false
	const clean = url.split('?')[0].toLowerCase()
	return (
		clean.endsWith('.webm') ||
		clean.endsWith('.mp4') ||
		clean.endsWith('.ogg') ||
		clean.endsWith('.mov')
	)
}
