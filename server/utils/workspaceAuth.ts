import { createHmac, timingSafeEqual } from 'node:crypto'

export const WORKSPACE_COOKIE = 'grugbox_workspace'

/** Seven days. Long enough that the team is not retyping the password weekly. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

/**
 * Refuse to run at all on a short password. The password is the entire security
 * model here (see the rate-limiting note below), so length is the real defence.
 */
const MIN_PASSWORD_LENGTH = 12

const HMAC_ALGORITHM = 'sha256'
const TOKEN_SEPARATOR = '.'

/* -------------------------------------------------------------------------- */
/* Pure token crypto                                                          */
/*                                                                            */
/* The password is passed in rather than read from runtimeConfig, so these    */
/* functions can be unit-tested without Nitro, env vars or an H3Event.        */
/* -------------------------------------------------------------------------- */

export const safeEqual = (a: string, b: string): boolean => {
	const left = Buffer.from(a, 'utf8')
	const right = Buffer.from(b, 'utf8')
	// timingSafeEqual throws on a length mismatch, so bail before comparing.
	// The length leak is irrelevant: both operands here are fixed-width hashes
	// or the caller's own input against a server-side secret.
	if (left.length !== right.length) return false
	return timingSafeEqual(left, right)
}

const sign = (value: string, password: string): string =>
	createHmac(HMAC_ALGORITHM, password).update(value).digest('hex')

/**
 * `<expiryEpochSeconds>.<hexHmac>`. Keyed by the password itself, so rotating
 * WORKSPACE_PASSWORD invalidates every session that was previously issued.
 */
export const createToken = (password: string, nowSeconds: number, ttlSeconds: number): string => {
	const expiry = Math.floor(nowSeconds + ttlSeconds)
	return `${expiry}${TOKEN_SEPARATOR}${sign(String(expiry), password)}`
}

export const verifyToken = (token: string, password: string, nowSeconds: number): boolean => {
	const separatorIndex = token.indexOf(TOKEN_SEPARATOR)
	if (separatorIndex < 1) return false

	const expiryPart = token.slice(0, separatorIndex)
	const signature = token.slice(separatorIndex + 1)
	if (!expiryPart || !signature) return false

	const expiry = Number(expiryPart)
	if (!Number.isFinite(expiry) || expiry <= nowSeconds) return false

	return safeEqual(signature, sign(expiryPart, password))
}

/* -------------------------------------------------------------------------- */
/* Config-backed helpers                                                      */
/* -------------------------------------------------------------------------- */

const getPassword = (): string => {
	const config = useRuntimeConfig()
	const configured = (config.workspacePassword as string) || ''
	return configured.trim()
}

export const isWorkspaceConfigured = (): boolean => getPassword().length >= MIN_PASSWORD_LENGTH

export const verifyWorkspacePassword = (input: string): boolean => {
	const password = getPassword()
	if (!password) return false
	return safeEqual(input, password)
}

export const createSessionToken = (): string =>
	createToken(getPassword(), Date.now() / 1000, SESSION_TTL_SECONDS)

export const verifySessionToken = (token: string): boolean =>
	verifyToken(token, getPassword(), Date.now() / 1000)

/* -------------------------------------------------------------------------- */
/* Routing predicates                                                         */
/* -------------------------------------------------------------------------- */

const GUARDED_PREFIXES = ['/workspace', '/api/workspace'] as const

/** Reached without a session: the login page itself and the auth endpoints. */
const PUBLIC_PATHS = [
	'/workspace/login',
	'/api/workspace/login',
	'/api/workspace/logout',
	'/api/workspace/session',
] as const

const matchesPrefix = (path: string, prefix: string): boolean =>
	path === prefix || path.startsWith(`${prefix}/`)

export const isGuardedPath = (path: string): boolean =>
	GUARDED_PREFIXES.some(prefix => matchesPrefix(path, prefix))

export const isPublicPath = (path: string): boolean =>
	PUBLIC_PATHS.some(publicPath => matchesPrefix(path, publicPath))
