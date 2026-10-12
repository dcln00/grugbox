import { describe, expect, test } from 'vitest'

import {
	applicationSchema,
	buildApplicationEmail,
	describeValidationError,
	escapeHtml,
	isHttpUrl,
	isTurnstileTestSecret,
	parseHostnameAllowlist,
} from '../server/utils/volunteerApplication'

const VALID_APPLICATION = {
	firstName: 'Ama',
	lastName: 'Mensah',
	email: 'ama@example.com',
	linkedinUrl: 'https://linkedin.com/in/ama',
	portfolioUrl: 'https://ama.example.com/clips',
	socialHandle: '@ama',
	areaOfInterest: 'Music',
	location: 'Accra',
	storyPitch: 'A profile of the alté producers reshaping Accra nightlife.',
	visualConcept: '',
	followedWriters: '',
	roleSlug: 'writer',
}

describe('applicationSchema', () => {
	test('accepts a complete application and fills unset optional fields', () => {
		const result = applicationSchema.safeParse({ ...VALID_APPLICATION, visualConcept: undefined })

		expect(result.success).toBe(true)
		expect(result.data?.visualConcept).toBe('')
	})

	test('rejects a malformed email address', () => {
		const result = applicationSchema.safeParse({ ...VALID_APPLICATION, email: 'ama@example' })

		expect(result.success).toBe(false)
	})

	test('rejects a portfolio link that is not http(s)', () => {
		const result = applicationSchema.safeParse({
			...VALID_APPLICATION,
			portfolioUrl: 'javascript:alert(1)',
		})

		expect(result.success).toBe(false)
	})

	test('allows an empty optional LinkedIn link', () => {
		const result = applicationSchema.safeParse({ ...VALID_APPLICATION, linkedinUrl: '' })

		expect(result.success).toBe(true)
	})

	test('rejects a story pitch beyond the length cap', () => {
		const result = applicationSchema.safeParse({
			...VALID_APPLICATION,
			storyPitch: 'a'.repeat(4001),
		})

		expect(result.success).toBe(false)
	})

	test('trims surrounding whitespace before validating', () => {
		const result = applicationSchema.safeParse({ ...VALID_APPLICATION, firstName: '  Ama  ' })

		expect(result.data?.firstName).toBe('Ama')
	})

	test('rejects a line break in a name, which would reach the subject header', () => {
		const result = applicationSchema.safeParse({
			...VALID_APPLICATION,
			firstName: 'Ama\r\nBcc: someone@example.com',
		})

		expect(result.success).toBe(false)
	})

	test('keeps line breaks in the story pitch, which is a body field', () => {
		const result = applicationSchema.safeParse({
			...VALID_APPLICATION,
			storyPitch: 'First line.\nSecond line.',
		})

		expect(result.success).toBe(true)
	})
})

describe('describeValidationError', () => {
	test('names the offending field without echoing its value', () => {
		const result = applicationSchema.safeParse({ ...VALID_APPLICATION, email: 'nope' })

		expect(result.success).toBe(false)
		expect(describeValidationError(result.error)).toContain('email')
		expect(describeValidationError(result.error)).not.toContain('nope')
	})
})

describe('isHttpUrl', () => {
	test('accepts empty strings because optional links submit blank', () => {
		expect(isHttpUrl('')).toBe(true)
	})

	test('accepts http and https', () => {
		expect(isHttpUrl('http://example.com')).toBe(true)
		expect(isHttpUrl('https://example.com/work')).toBe(true)
	})

	test('rejects other schemes', () => {
		expect(isHttpUrl('javascript:alert(1)')).toBe(false)
		expect(isHttpUrl('data:text/html,<script>')).toBe(false)
	})
})

describe('escapeHtml', () => {
	test('escapes the characters that could break out of markup', () => {
		expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe(
			'&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;'
		)
	})

	test('leaves ordinary text untouched', () => {
		expect(escapeHtml('Accra nightlife')).toBe('Accra nightlife')
	})
})

describe('buildApplicationEmail', () => {
	test('names the role and applicant in the subject', () => {
		const email = buildApplicationEmail(VALID_APPLICATION, 'Writer')

		expect(email.subject).toBe('Volunteer application: Writer — Ama Mensah')
	})

	test('escapes applicant input in the HTML body', () => {
		const email = buildApplicationEmail(
			{ ...VALID_APPLICATION, storyPitch: '<script>alert(1)</script>' },
			'Writer'
		)

		expect(email.html).not.toContain('<script>alert(1)</script>')
		expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
	})

	test('omits rows for optional fields that were left blank', () => {
		const email = buildApplicationEmail(VALID_APPLICATION, 'Writer')

		expect(email.text).not.toContain('Visual or photo concept')
		expect(email.text).not.toContain('Publications and creators they follow')
		expect(email.text).toContain('Portfolio: https://ama.example.com/clips')
	})

	test('includes the optional LinkedIn row when a link was given', () => {
		const email = buildApplicationEmail(VALID_APPLICATION, 'Writer')

		expect(email.text).toContain('LinkedIn: https://linkedin.com/in/ama')
	})

	test('renders a validated link as an anchor', () => {
		const email = buildApplicationEmail(VALID_APPLICATION, 'Writer')

		expect(email.html).toContain('href="https://ama.example.com/clips"')
	})

	test('keeps manual line breaks in the plain text version', () => {
		const email = buildApplicationEmail(
			{ ...VALID_APPLICATION, storyPitch: 'First line.\nSecond line.' },
			'Writer'
		)

		expect(email.text).toContain('First line.\nSecond line.')
		expect(email.html).toContain('First line.<br>Second line.')
	})
})

describe('parseHostnameAllowlist', () => {
	test('falls back to the default allowlist when unset', () => {
		expect(parseHostnameAllowlist(undefined).has('grugbox.world')).toBe(true)
	})

	test('parses a comma separated override and drops empty entries', () => {
		const allowlist = parseHostnameAllowlist(' preview.grugbox.world , ,localhost ')

		expect(allowlist.has('preview.grugbox.world')).toBe(true)
		expect(allowlist.has('localhost')).toBe(true)
		expect(allowlist.has('')).toBe(false)
		expect(allowlist.has('grugbox.world')).toBe(false)
	})
})

describe('isTurnstileTestSecret', () => {
	test('matches the three documented testing secrets', () => {
		expect(isTurnstileTestSecret('1x0000000000000000000000000000000AA')).toBe(true)
		expect(isTurnstileTestSecret('2x0000000000000000000000000000000AA')).toBe(true)
		expect(isTurnstileTestSecret('3x0000000000000000000000000000000AA')).toBe(true)
	})

	test('does not match a real secret', () => {
		expect(isTurnstileTestSecret('0x4AAAAAAABkMYinukE8nzY0O4k7NcM')).toBe(false)
	})

	test('does not match an unrelated value of a similar shape', () => {
		expect(isTurnstileTestSecret('1x0000000000000000000000000000000BB')).toBe(false)
		expect(isTurnstileTestSecret('')).toBe(false)
	})
})
