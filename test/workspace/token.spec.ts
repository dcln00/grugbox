import { describe, expect, test } from 'vitest'

import {
	createToken,
	safeEqual,
	verifyToken,
} from '../../server/utils/workspaceAuth'

const PASSWORD = 'a-long-enough-team-password'
const OTHER_PASSWORD = 'a-completely-different-password'
const NOW = 1_700_000_000
const TTL = 100

describe('safeEqual', () => {
	test('accepts identical strings', () => {
		expect(safeEqual('abc', 'abc')).toBe(true)
	})

	test('rejects different strings of equal length', () => {
		expect(safeEqual('abc', 'abd')).toBe(false)
	})

	test('rejects strings of different length without throwing', () => {
		// timingSafeEqual throws on a length mismatch, so this must short-circuit.
		expect(() => safeEqual('short', 'a-much-longer-value')).not.toThrow()
		expect(safeEqual('short', 'a-much-longer-value')).toBe(false)
	})

	test('handles multi-byte characters', () => {
		expect(safeEqual('café', 'café')).toBe(true)
		expect(safeEqual('café', 'cafe')).toBe(false)
	})
})

describe('createToken / verifyToken', () => {
	test('round-trips a token it just issued', () => {
		const token = createToken(PASSWORD, NOW, TTL)

		expect(verifyToken(token, PASSWORD, NOW)).toBe(true)
	})

	test('accepts the token one second before it expires', () => {
		const token = createToken(PASSWORD, NOW, TTL)

		expect(verifyToken(token, PASSWORD, NOW + TTL - 1)).toBe(true)
	})

	test('rejects the token at the exact expiry second', () => {
		const token = createToken(PASSWORD, NOW, TTL)

		expect(verifyToken(token, PASSWORD, NOW + TTL)).toBe(false)
	})

	test('rejects an expired token', () => {
		const token = createToken(PASSWORD, NOW, TTL)

		expect(verifyToken(token, PASSWORD, NOW + TTL + 1)).toBe(false)
	})

	test('is deterministic, so sessions survive a server restart', () => {
		// The signing key is derived from the password, not from per-process
		// randomness. If this ever regresses, every deploy would log the team out.
		expect(createToken(PASSWORD, NOW, TTL)).toBe(createToken(PASSWORD, NOW, TTL))
	})

	test('rejects a token signed with a different password', () => {
		const token = createToken(OTHER_PASSWORD, NOW, TTL)

		expect(verifyToken(token, PASSWORD, NOW)).toBe(false)
	})

	test('invalidates issued sessions when the password is rotated', () => {
		const token = createToken(PASSWORD, NOW, TTL)
		// Same token, checked against the new password after a rotation.
		expect(verifyToken(token, OTHER_PASSWORD, NOW)).toBe(false)
	})

	test('rejects a tampered signature', () => {
		const [expiry] = createToken(PASSWORD, NOW, TTL).split('.')
		const forged = `${expiry}.${'0'.repeat(64)}`

		expect(verifyToken(forged, PASSWORD, NOW)).toBe(false)
	})

	test('rejects an extended expiry carried over with the old signature', () => {
		// The attack this design exists to stop: push your own session out to
		// 2286 by editing the expiry, keeping the signature that validated it.
		const segments = createToken(PASSWORD, NOW, TTL).split('.')
		const signature = segments[1] ?? ''
		const forged = `9999999999.${signature}`

		expect(verifyToken(forged, PASSWORD, NOW)).toBe(false)
	})

	test.each([
		['empty string', ''],
		['no separator', 'nodothere'],
		['separator only', '.'],
		['missing expiry', '.abcdef'],
		['missing signature', '1700000100.'],
		['non-numeric expiry', 'soon.abcdef'],
		['infinite expiry', 'Infinity.abcdef'],
		['leading separator', '.1700000100.abcdef'],
		['negative expiry', '-1.abcdef'],
	])('rejects a malformed token: %s', (_label, token) => {
		expect(verifyToken(token, PASSWORD, NOW)).toBe(false)
	})

	test('produces a token in expiry.signature form', () => {
		const token = createToken(PASSWORD, NOW, TTL)
		const [expiry, signature] = token.split('.')

		expect(expiry).toBe(String(NOW + TTL))
		expect(signature).toMatch(/^[0-9a-f]{64}$/)
	})
})
