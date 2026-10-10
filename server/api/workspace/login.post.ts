/**
 * A fixed delay on failure. This is NOT rate limiting — see the note in
 * `workspaceAuth.ts`. On Vercel each invocation is isolated and module state is
 * per-instance, so any in-memory attempt counter would be theatre. This only
 * raises the cost of a guessing loop slightly; a long random password is the
 * real defence.
 */
const FAILURE_DELAY_MS = 250

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export default defineEventHandler(async (event) => {
	if (!isWorkspaceConfigured()) {
		throw createError({
			statusCode: 503,
			statusMessage: 'Workspace is not configured. Set WORKSPACE_PASSWORD and restart.',
		})
	}

	const body = await readBody(event)
	const password = typeof body?.password === 'string' ? body.password : ''

	if (!password) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Enter the team password.',
		})
	}

	if (!verifyWorkspacePassword(password)) {
		await delay(FAILURE_DELAY_MS)
		const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
		// Log the attempt, never the attempted password.
		console.warn(`[WorkspaceAuth] failed login ip=${ip}`)
		throw createError({
			statusCode: 401,
			statusMessage: 'That password is not correct.',
		})
	}

	setCookie(event, WORKSPACE_COOKIE, createSessionToken(), {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: SESSION_TTL_SECONDS,
	})

	return { ok: true }
})
