import { z } from 'zod'

/**
 * Pure helpers for the volunteer application notification.
 *
 * Nothing here touches Nitro, Vue or the network, so the whole file can be unit
 * tested directly — the same split `workspaceAuth.ts` uses.
 */

/**
 * Applicant input ends up in an email body, so every field is capped. A story
 * pitch needs room to breathe; nothing else does.
 */
const SHORT_FIELD_MAX = 200
const LONG_FIELD_MAX = 4000
const URL_FIELD_MAX = 500

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i

/** The action Cloudflare hands the widget — a mismatch means a replayed token. */
export const TURNSTILE_ACTION = 'volunteer_apply'

export const CAREERS_INBOX = 'careers@grugbox.world'

/**
 * Only the domain has to be verified for sending; `noreply@` does not need a
 * mailbox, and replies are routed to the applicant instead.
 */
export const APPLICATION_FROM = 'Grugbox Applications <noreply@grugbox.world>'

export const DEFAULT_TURNSTILE_HOSTNAMES = 'grugbox.world,www.grugbox.world,localhost,127.0.0.1'

/**
 * Only http(s) values are ever rendered as anchors, so a `javascript:` URL in a
 * portfolio field cannot become a clickable link in the notification. An empty
 * string is allowed because the optional fields submit as `''`.
 */
export function isHttpUrl(value: string): boolean {
	return value === '' || HTTP_URL_PATTERN.test(value)
}

export function parseHostnameAllowlist(raw: string | undefined): Set<string> {
	return new Set(
		(raw || DEFAULT_TURNSTILE_HOSTNAMES)
			.split(',')
			.map(hostname => hostname.trim())
			.filter(Boolean)
	)
}

/**
 * Cloudflare's documented testing secrets (`1x…` passes, `2x…` fails, `3x…` is
 * already spent). Their mock response carries placeholder `action` and
 * `hostname` values, so those assertions have to be skipped when one is in use —
 * which is the case in local dev, where the Turnstile module defaults to the
 * always-pass key. A real secret is a long random string, so this cannot match
 * one in production.
 */
export function isTurnstileTestSecret(secretKey: string): boolean {
	return /^[123]x0+AA$/.test(secretKey)
}

const optionalText = (max: number) => z.string().trim().max(max).default('')

/**
 * Names are interpolated into the email subject, so line breaks are rejected
 * outright: a CRLF in a header value is injection, even if Resend would
 * normally sanitise it for us.
 */
const singleLineName = (max: number) =>
	z
		.string()
		.trim()
		.min(1)
		.max(max)
		.refine(value => !/[\r\n]/.test(value), { message: 'Line breaks are not allowed.' })

const optionalUrl = z
	.string()
	.trim()
	.max(URL_FIELD_MAX)
	.refine(isHttpUrl, { message: 'Links must start with http:// or https://' })
	.default('')

export const applicationSchema = z.object({
	firstName: singleLineName(SHORT_FIELD_MAX),
	lastName: singleLineName(SHORT_FIELD_MAX),
	email: z.string().trim().email().max(SHORT_FIELD_MAX),
	linkedinUrl: optionalUrl,
	portfolioUrl: z
		.string()
		.trim()
		.min(1)
		.max(URL_FIELD_MAX)
		.refine(isHttpUrl, { message: 'Links must start with http:// or https://' }),
	socialHandle: optionalText(SHORT_FIELD_MAX),
	areaOfInterest: z.string().trim().min(1).max(SHORT_FIELD_MAX),
	location: z.string().trim().min(1).max(SHORT_FIELD_MAX),
	storyPitch: z.string().trim().min(1).max(LONG_FIELD_MAX),
	visualConcept: optionalText(LONG_FIELD_MAX),
	followedWriters: optionalText(URL_FIELD_MAX),
	roleSlug: z.string().trim().min(1).max(SHORT_FIELD_MAX),
})

export type VolunteerApplication = z.infer<typeof applicationSchema>

/**
 * Rejection copy for crafted requests that skip the client checks. It names the
 * field so a failure is diagnosable, and nothing else — never the value.
 */
export function describeValidationError(error: z.ZodError): string {
	const field = error.issues[0]?.path.join('.')

	return field
		? `Please check the "${field}" field and try again.`
		: 'Please check your application details and try again.'
}

const HTML_ENTITIES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
}

/** Every interpolated value is escaped: an applicant is untrusted input. */
export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, character => HTML_ENTITIES[character] ?? character)
}

export interface ApplicationEmail {
	subject: string
	html: string
	text: string
}

interface EmailRow {
	label: string
	value: string
	url?: boolean
	multiline?: boolean
}

function toRows(application: VolunteerApplication): EmailRow[] {
	const rows: EmailRow[] = [
		{ label: 'Name', value: `${application.firstName} ${application.lastName}` },
		{ label: 'Email', value: application.email },
		{ label: 'Based in', value: application.location },
		{ label: 'Area of interest', value: application.areaOfInterest },
		{ label: 'Portfolio', value: application.portfolioUrl, url: true },
		{ label: 'LinkedIn', value: application.linkedinUrl, url: true },
		{ label: 'Social handle', value: application.socialHandle },
		{ label: 'Story or topic they want to cover', value: application.storyPitch, multiline: true },
		{ label: 'Visual or photo concept', value: application.visualConcept, multiline: true },
		{ label: 'Publications and creators they follow', value: application.followedWriters, multiline: true },
	]

	// Optional fields submit as empty strings; a blank row is just noise.
	return rows.filter(row => row.value.trim() !== '')
}

function renderValue(row: EmailRow): string {
	const escaped = escapeHtml(row.value.trim())

	if (row.url) {
		return `<a href="${escaped}" style="color:#18181b;">${escaped}</a>`
	}

	return row.multiline ? escaped.replace(/\n/g, '<br>') : escaped
}

function renderHtml(rows: EmailRow[], roleTitle: string, applicantName: string): string {
	const body = rows
		.map(
			row => `
									<tr>
										<td style="padding:6px 12px 6px 0;font:600 13px/1.5 Arial,Helvetica,sans-serif;color:#71717a;vertical-align:top;">${escapeHtml(row.label)}</td>
										<td style="padding:6px 0;font:400 14px/1.5 Arial,Helvetica,sans-serif;color:#18181b;">${renderValue(row)}</td>
									</tr>`
		)
		.join('')

	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body style="margin:0;padding:0;background:#f4f4f5;">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
			<tr>
				<td align="center" style="padding:24px 12px;">
					<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;">
						<tr>
							<td style="padding:24px 24px 4px;">
								<p style="margin:0 0 6px;font:700 11px/1.5 Arial,Helvetica,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#71717a;">Volunteer application</p>
								<h1 style="margin:0;font:600 22px/1.3 Arial,Helvetica,sans-serif;color:#18181b;">${escapeHtml(roleTitle)}</h1>
							</td>
						</tr>
						<tr>
							<td style="padding:12px 24px 24px;">
								<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}
								</table>
								<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e4e4e7;font:400 12px/1.5 Arial,Helvetica,sans-serif;color:#71717a;">Reply to this email to answer ${escapeHtml(applicantName)} directly.</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`
}

function renderText(rows: EmailRow[], roleTitle: string): string {
	const lines = rows.map(row => `${row.label}: ${row.value.trim()}`)

	return [`Volunteer application — ${roleTitle}`, '', ...lines, '', 'Reply to this email to answer the applicant directly.'].join('\n')
}

export function buildApplicationEmail(application: VolunteerApplication, roleTitle: string): ApplicationEmail {
	const rows = toRows(application)
	const applicantName = `${application.firstName} ${application.lastName}`

	return {
		subject: `Volunteer application: ${roleTitle} — ${applicantName}`,
		html: renderHtml(rows, roleTitle, applicantName),
		text: renderText(rows, roleTitle),
	}
}
