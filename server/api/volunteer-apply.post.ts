import { setDefaultResultOrder } from 'node:dns'

import { getVolunteerRole } from '../../app/utils/volunteer'

// Reaching Resend over IPv6 is unreliable from some hosts — same workaround as
// `subscribe.post.ts`.
try {
	setDefaultResultOrder('ipv4first')
} catch {}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const RESEND_TIMEOUT_MS = 10_000
const MAX_TURNSTILE_TOKEN_LENGTH = 2048

interface TurnstileVerification {
	success?: boolean
	action?: string
	hostname?: string
	'error-codes'?: string[]
}

interface FetchFailure {
	status?: number
	statusText?: string
	message?: string
}

/**
 * Builds a log line from a failed `$fetch` without handing the error object
 * itself to the logger.
 *
 * ofetch attaches `options` to its errors, so `options.headers` holds the
 * Resend `Authorization` header and, on the Turnstile call, `options.body`
 * holds the Turnstile secret. Those properties are non-enumerable, which keeps
 * them out of a plain `console.error(error)` — but any sink that walks own
 * property names would pick them up. Status and the service's own message are
 * enough to act on.
 */
function describeFetchFailure(error: unknown): string {
	if (!error || typeof error !== 'object') {
		return String(error)
	}

	const { status, statusText, message } = error as FetchFailure

	return [`status ${status ?? 'unknown'}`, statusText, message].filter(Boolean).join(' — ')
}

/**
 * Cloudflare is a third party, so its failures are ours to absorb: anything the
 * verification call throws becomes a retryable 503 rather than a 500 with a
 * stack trace.
 */
async function verifyToken(event: H3Event, token: string): Promise<TurnstileVerification | undefined> {
	try {
		return (await verifyTurnstileToken(token, event)) as TurnstileVerification | undefined
	} catch (error) {
		console.error('[Volunteer] Could not reach Cloudflare to verify the token:', describeFetchFailure(error))
		throw createError({
			statusCode: 503,
			statusMessage: 'We could not verify the challenge. Please try again in a moment.',
		})
	}
}

/**
 * Verifies the Turnstile token whenever a secret is configured.
 *
 * Stricter than `subscribe.post.ts` on purpose: that route skips verification
 * when the token is absent, which leaves it open to anyone who simply omits the
 * field. Here a configured secret means a token is required.
 */
async function assertHumanSubmission(event: H3Event, rawToken: unknown): Promise<void> {
	const config = useRuntimeConfig(event)
	const secretKey = (config.turnstile?.secretKey as string) || process.env.NUXT_TURNSTILE_SECRET_KEY || ''

	// Unset locally, so the form still works without Cloudflare keys in dev.
	if (!secretKey) return

	const token = typeof rawToken === 'string' ? rawToken.trim() : ''
	if (!token || token.length > MAX_TURNSTILE_TOKEN_LENGTH) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Please complete the verification challenge and try again.',
		})
	}

	const result = await verifyToken(event, token)
	const allowedHostnames = parseHostnameAllowlist(process.env.TURNSTILE_HOSTNAMES)
	const actionMatches = !result?.action || result.action === TURNSTILE_ACTION
	const hostnameMatches = !result?.hostname || allowedHostnames.has(result.hostname)
	const contextMatches = actionMatches && hostnameMatches

	if (result?.success && (isTurnstileTestSecret(secretKey) || contextMatches)) {
		return
	}

	// Sanitised: the token and anything the applicant typed stay out of the logs.
	console.warn('[Volunteer] Turnstile rejected the token:', {
		success: result?.success,
		action: result?.action,
		hostname: result?.hostname,
		errorCodes: result?.['error-codes'],
	})

	throw createError({
		statusCode: 403,
		statusMessage: 'Verification failed. Please try again.',
	})
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event)

	const parsed = applicationSchema.safeParse(body)
	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: describeValidationError(parsed.error),
		})
	}

	const application = parsed.data

	await assertHumanSubmission(event, body?.token)

	// Resolved from the slug rather than trusted from the client, so the subject
	// line always names a role that actually exists.
	const role = getVolunteerRole(application.roleSlug)
	if (!role) {
		throw createError({
			statusCode: 400,
			statusMessage: 'That volunteer role is no longer open.',
		})
	}

	const config = useRuntimeConfig(event)
	const apiKey = (config.resendApiKey as string) || process.env.RESEND_API_KEY || ''

	// Deliberately louder than `subscribe.post.ts`, which reports success when
	// unconfigured. Telling an applicant their application was received when
	// nothing was sent is worse than asking them to email us directly.
	if (!apiKey) {
		console.error('[Volunteer] RESEND_API_KEY is not configured; application not delivered.')
		throw createError({
			statusCode: 503,
			statusMessage: `Applications are temporarily unavailable. Please email ${CAREERS_INBOX} directly.`,
		})
	}

	const message = buildApplicationEmail(application, role.title)

	try {
		await $fetch(RESEND_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: {
				from: APPLICATION_FROM,
				to: [CAREERS_INBOX],
				// So hitting Reply in Zoho answers the applicant, not noreply@.
				reply_to: application.email,
				subject: message.subject,
				html: message.html,
				text: message.text,
			},
			timeout: RESEND_TIMEOUT_MS,
		})
	} catch (error) {
		// The payload is an applicant's personal data and the request carries the
		// API key, so only a summarised failure is logged.
		console.error('[Volunteer] Resend rejected the application email:', describeFetchFailure(error))
		throw createError({
			statusCode: 502,
			statusMessage: `We could not submit your application. Please email ${CAREERS_INBOX} directly.`,
		})
	}

	return { ok: true }
})
