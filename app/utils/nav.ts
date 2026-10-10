interface NavLink {
	href: string
	name: string
	target?: string
	external?: boolean
}

export interface FooterSection {
	title: string
	links: NavLink[]
}

export const NAV_LINKS: NavLink[] = [
	{ href: '/articles', name: 'Articles' },
	{ href: '/reviews', name: 'Reviews' },
	{ href: '/interviews', name: 'Interviews' },
	{ href: '/playlists', name: 'Playlists' },
	{ href: '/newsletter', name: 'Newsletter' },
]

export const FOOTER_SECTIONS: FooterSection[] = [
	{
		title: 'More from Grugbox',
		links: [
			{ href: '/submissions', name: 'Submissions' },
			{ href: '/volunteer', name: 'Volunteer' },
			{ href: '/newsletter', name: 'Subscribe' },
		],
	},
	{
		title: 'Events',
		links: [
			{ href: '#', name: 'Grugbox Live Accra' },
			{ href: '#', name: 'All Events' },
		],
	},
]

export const LEGAL_LINKS: NavLink[] = [
	{ href: '/user-agreement', name: 'User Agreement' },
	{ href: '/privacy-policy', name: 'Privacy Policy' },
	{ href: '/terms-of-use', name: 'Terms of Use' },
	{ href: '/newsletter', name: 'Newsletter' },
	{ href: '/contact', name: 'Contact' },
	{ href: '/advertising', name: 'Advertising' },
	{ href: '/sitemap.xml', name: 'Site Map', target: '_blank', external: true },
]
