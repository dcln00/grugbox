/**
 * POST rather than GET so the logout cannot be triggered by a link or an image
 * tag on another site.
 */
export default defineEventHandler((event) => {
	deleteCookie(event, WORKSPACE_COOKIE, { path: '/' })
	return { ok: true }
})
