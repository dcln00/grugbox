interface NavLink {
	href: string
	name: string
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
	{ href: '/#newsletter', name: 'Newsletter' },
]

export const FOOTER_SECTIONS: FooterSection[] = [
	{
		title: 'More from Grugbox',
		links: [
			{ href: '#', name: 'Podcast' },
			{ href: '#', name: 'Site Map' },
			{ href: '#', name: 'FAQ' },
			{ href: '/#newsletter', name: 'Subscribe' },
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
	{ href: '#', name: 'User Agreement' },
	{ href: '#', name: 'Privacy Policy' },
	{ href: '#', name: 'Terms of Use' },
	{ href: '#', name: 'Newsletter' },
	{ href: '#', name: 'Contact' },
	{ href: '#', name: 'Advertising' },
]
