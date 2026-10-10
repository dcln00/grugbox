/**
 * Covers client-side navigation, which server middleware never sees. Defence in
 * depth only — `server/middleware/workspace-auth.ts` is the real gate, and it
 * has already rejected this request before SSR if there is no session.
 */
export default defineNuxtRouteMiddleware(async () => {
	const requestFetch = useRequestFetch()

	const session = await requestFetch<{ authenticated: boolean }>('/api/workspace/session')

	if (!session?.authenticated) {
		return navigateTo('/workspace/login')
	}
})
