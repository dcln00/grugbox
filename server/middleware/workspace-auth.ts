/**
 * The real gate. Runs before the page renders, so an unauthenticated visitor
 * never receives workspace markup — the page HTML is never sent, not merely
 * hidden behind a client-side redirect.
 *
 * `app/middleware/workspace-auth.ts` covers client-side navigation; this file
 * is what actually protects the route.
 */

/** Page navigations get a redirect; data requests get a 401. */
const isDocumentRequest = (path: string): boolean => {
	if (path.startsWith('/api/')) return false
	// Nuxt's client-side navigation payload, e.g. /workspace/_payload.json
	if (path.endsWith('.json')) return false
	return true
}

export default defineEventHandler((event) => {
	const path = getRequestURL(event).pathname

	if (!isGuardedPath(path) || isPublicPath(path)) return

	const configured = isWorkspaceConfigured()
	const token = configured ? getCookie(event, WORKSPACE_COOKIE) : undefined

	if (token && verifySessionToken(token)) return

	if (isDocumentRequest(path)) {
		return sendRedirect(event, '/workspace/login', 302)
	}

	throw createError({
		statusCode: 401,
		statusMessage: configured
			? 'Workspace authentication required.'
			: 'Workspace is not configured.',
	})
})
