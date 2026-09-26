interface NavLink {
	href: string
	name: string
}

export const NAV_LINKS: NavLink[] = [
	{ href: '/articles', name: 'Articles' },
	{ href: '/interviews', name: 'Interviews' },
	{ href: '/playlists', name: 'Playlists' },
	{ href: '/#newsletter', name: 'Newsletter' },
]

export const FOOTER_LINKS: NavLink[] = [
	{ href: '/about', name: 'About' },
]
