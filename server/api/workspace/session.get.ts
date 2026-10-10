/**
 * Deliberately reachable without a session: the client-side route middleware
 * needs to ask "am I authenticated?" before it knows whether to redirect.
 * It reports a boolean and nothing else.
 */
export default defineEventHandler((event) => {
	const configured = isWorkspaceConfigured()
	const token = getCookie(event, WORKSPACE_COOKIE)

	return {
		authenticated: configured && !!token && verifySessionToken(token),
		configured,
	}
})
