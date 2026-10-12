export interface VolunteerCompensationItem {
	label: string
	detail: string
}

export interface VolunteerCompensation {
	intro: string
	items: VolunteerCompensationItem[]
}

export interface VolunteerRole {
	slug: string
	title: string
	badge: string
	location: string
	type: string
	shortDescription: string
	about: string
	responsibilities: string[]
	requirements: string[]
	compensation: VolunteerCompensation
	diversity: string
}

export const VOLUNTEER_ROLES: VolunteerRole[] = [
	{
		slug: 'writer',
		title: 'Writer',
		badge: 'Editorial & Culture · Volunteer',
		location: 'Remote (Global)',
		type: 'Volunteer',
		shortDescription:
			"We are looking for writers and culture lovers passionate about music, art, and storytelling across Ghana and the diaspora. You'll contribute artist spotlights, reviews, and cultural features across our core pillars: Sound, Fashion, Screen, Visual, and Society.",
		about:
			"Editorial contributors help shape the voice of Grugbox. We're looking for curious writers, interviewers, and cultural observers excited to spotlight Ghanaian creativity and the wider African diaspora. Whether you're an aspiring writer looking to build your portfolio or someone who simply loves the culture, you'll collaborate with a supportive editorial team to pitch ideas you care about, interview inspiring artists, and share your perspective with a global audience.",
		responsibilities: [
			'Pitch and write features, artist interviews, album reviews, or cultural reflections on topics you care about.',
			'Help spotlight emerging musicians, designers, visual artists, and community builders.',
			'Collaborate with our editors to shape your drafts and develop your storytelling voice.',
			'Bring fresh ideas to brainstorms and help decide what stories we cover next.',
		],
		requirements: [
			'A genuine love for writing and storytelling—prior published clips are great, but enthusiasm and a unique perspective matter most.',
			'A couple of writing samples (published articles, blog posts, essays, or personal drafts) that show your voice.',
			'An interest in contemporary Ghanaian culture, music, arts, and diaspora scenes.',
			'Curiosity, openness to feedback, and a friendly, collaborative attitude.',
			'Reliable communication to keep in touch as you work on pieces at your own pace.',
		],
		compensation: {
			intro:
				'Grugbox is an independent, grassroots publication run by a community of creatives. All contributor roles are voluntary and unpaid—there is no financial compensation or contributor fee at this stage.',
			items: [
				{
					label: 'Unpaid Volunteer',
					detail: 'This is an unpaid volunteer position. We do not currently offer fees, stipends, or monetary compensation.',
				},
				{
					label: 'Byline & Creative Credit',
					detail: 'You receive full bylines and author profile tags across our website, newsletters, and social platforms for every piece you write.',
				},
				{
					label: 'Editorial Mentorship',
					detail: 'Hands-on editing, guidance, and constructive feedback from our team to help refine your craft and build confidence.',
				},
				{
					label: 'Portfolio & Global Reach',
					detail: 'A respected editorial platform to showcase your published work to an engaged worldwide audience.',
				},
				{
					label: 'Flexible Pace',
					detail: 'Contribute when your schedule allows—we fully support balancing your contributions with your studies, day job, or personal life.',
				},
			],
		},
		diversity:
			"We warmly welcome writers of all experience levels and backgrounds. You don't need formal journalism degrees or industry connections to write with us—if you love the culture and have something thoughtful to say, we want to hear from you.",
	},
	{
		slug: 'photographer',
		title: 'Photographer',
		badge: 'Visual & Events · Volunteer',
		location: 'Accra / Global Diaspora',
		type: 'Volunteer',
		shortDescription:
			"We are looking for photographers and visual storytellers in Ghana and diaspora hubs (London, New York, Toronto, Berlin, and beyond) to capture concerts, festivals, artist sessions, and photo essays. You'll gain press opportunities and share your visual voice with our community.",
		about:
			"Visual storytellers help bring Grugbox to life. We're looking for photographers who love documenting the energy of live music, cultural gatherings, and creative communities. Whether you enjoy shooting concerts, taking artist portraits, or creating documentary photo essays, you'll have opportunities to showcase your style, build your portfolio, and gain press access to events.",
		responsibilities: [
			'Capture live concerts, festivals, exhibitions, and cultural gatherings in your area.',
			'Shoot artist portraits, studio visits, or behind-the-scenes moments with emerging talent.',
			'Pitch and produce original photo essays exploring cultural themes and local creative scenes.',
			'Provide a curated selection of edited images for publication on the site and social channels.',
		],
		requirements: [
			'A keen eye and passion for visual storytelling—formal photography experience or degrees are never required.',
			'A link to your photos (an Instagram page, portfolio site, VSCO, or Google Drive folder) showing your visual style.',
			'An interest in music, arts, and cultural life in Ghana or diaspora communities.',
			'Access to a camera that works for you (DSLR, mirrorless, film, or high-quality smartphone camera) and basic editing tools.',
			'Good communication when taking on event coverage or assignments.',
		],
		compensation: {
			intro:
				'Grugbox is an independent, grassroots publication run by a community of creatives. All contributor roles are voluntary and unpaid—there is no financial compensation or contributor fee at this stage.',
			items: [
				{
					label: 'Unpaid Volunteer',
					detail: 'This is an unpaid volunteer position. We do not currently offer fees, stipends, or monetary compensation.',
				},
				{
					label: 'Full Visual Credit & Rights',
					detail: 'You retain full copyright ownership of your work, and you receive prominent credits and social tags whenever your images are published.',
				},
				{
					label: 'Press & Media Credentials',
					detail: 'Opportunities to receive official Grugbox media credentials and press passes for events, concerts, and exhibitions.',
				},
				{
					label: 'Portfolio & Audience',
					detail: 'Showcase your photography to a worldwide community dedicated to African and diaspora arts.',
				},
				{
					label: 'Flexible Projects',
					detail: 'Pick up assignments and photo series that fit your personal schedule and creative interests.',
				},
			],
		},
		diversity:
			"We welcome visual creators of all backgrounds and technical styles. You don't need years of professional experience or expensive gear to get involved—if you have an eye for a good shot and love the culture, we'd love to connect.",
	},
]

export function getVolunteerRole(slug: string): VolunteerRole | undefined {
	return VOLUNTEER_ROLES.find(role => role.slug === slug)
}
