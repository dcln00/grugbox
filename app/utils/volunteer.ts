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
		location: 'Remote (International)',
		type: 'Contract',
		shortDescription:
			"We are seeking writers who have a strong pulse on music, art, and cultural movements in Ghana and the diaspora. You'll contribute artist profiles, feature pieces, scene reports, and reviews across our five core pillars: Sound, Fashion, Screen, Visual, and Society.",
		about:
			"Editorial Contributors are the voice of Grugbox. We're looking for writers, interviewers, and reporters who are already embedded in the scenes they cover. We need people who know the culture from the inside out, move fast when a story breaks, and write with the authority that comes from being there. You'll be on the ground finding stories everyone else is missing while working with a global team to uncover Ghanaian stories and give them a high-end editorial treatment, helping build a new standard of global Ghanaian media.",
		responsibilities: [
			'Pitch and produce features, interviews, cultural commentary, and news pieces across our editorial pillars and in our editorial voice.',
			'Find emerging artists, designers, and musicians before they hit the mainstream.',
			'Attend studio visits, gallery openings, and events on assignment to get the full story.',
			'Pitch fresh ideas and help decide what the publication covers next.',
		],
		requirements: [
			'At least 2 years of experience in editorial writing, culture journalism, or digital storytelling.',
			'A published portfolio or personal archive that highlights your distinct voice and storytelling style.',
			'Deep engagement with your local creative community and a strong radar for emerging artists and movements.',
			'Proven ability to craft thoughtful, long-form cultural criticism as well as agile, timely news features.',
			'Self-discipline to manage an active editorial schedule and consistently meet deadlines on your own.',
			'An authentic connection to contemporary Ghanaian culture, the wider African diaspora, and their global impact.',
		],
		compensation: {
			intro:
				'We are an independent, grassroots publication, and our current compensation framework reflects our stage of growth. We operate on a flat-rate commission basis for all published editorial work.',
			items: [
				{
					label: 'Standard Editorial',
					detail: '$50 USD per published article, feature, or review.',
				},
				{
					label: 'Commissions',
					detail: 'Payment is guaranteed exclusively for formally commissioned pitches and pre-assigned briefs.',
				},
				{
					label: 'Creative Credit',
					detail: 'You will always receive clear bylines and author tags across our website, newsletters, and social platforms wherever your story is shared.',
				},
				{
					label: 'Project Funding',
					detail: 'For ambitious, high-impact stories requiring travel or dedicated on-the-ground reporting, we consider supplemental production expenses on a case-by-case basis. Prior editorial sign-off is required; pitching a concept does not guarantee funding.',
				},
				{
					label: 'Payment Terms',
					detail: 'All contributor fees and honorariums are disbursed following publication.',
				},
			],
		},
		diversity:
			'Grugbox is committed to a fair, inclusive, and transparent contributor process. We enthusiastically welcome applications from all backgrounds, no matter your location or past industry access. We place immense value on the distinct perspectives born of varied lived experiences and strive to cultivate a welcoming environment where every creative voice is heard and championed.',
	},
	{
		slug: 'photographer',
		title: 'Photographer',
		badge: 'Visual & Events · Volunteer',
		location: 'Accra / Global Diaspora',
		type: 'Volunteer',
		shortDescription:
			"We are seeking photographers based in Ghana or diaspora creative hubs (London, New York, Toronto, Berlin) to shoot live concerts, festivals, artist studio sessions, and photo essays. You'll gain press access and showcase your visual work to our growing audience.",
		about:
			"Visual storytellers and photographers define Grugbox's aesthetic world. We're looking for photographers who can capture concerts, festivals, artist studio sessions, and original photo essays showcasing creative talent across West Africa and the global diaspora. You'll work closely with our editorial team to create arresting, culturally authentic visual journalism.",
		responsibilities: [
			'Shoot live concerts, festivals, and cultural events on assignment across Accra and diaspora scenes.',
			'Conduct artist studio visits, backstage sessions, and portrait shoots with creative talent.',
			'Pitch and develop original photo essays, creative visual stories, and editorial features.',
			'Deliver high-resolution, edited photography ready for digital and editorial publication.',
		],
		requirements: [
			'At least 2 years of experience in documentary, music, portrait, or live event photography.',
			'A strong visual portfolio or archive illustrating your technical skill, compositional eye, and creative voice.',
			'Active immersion in local creative and cultural scenes across Accra or key diaspora creative hubs.',
			'Ability to deliver high-impact photo essays, festival coverage, and artist portraits under tight turnarounds.',
			'Reliable access to professional camera gear and standard photo editing software (Lightroom/Photoshop).',
			'A thoughtful perspective on visual storytelling rooted in contemporary African and diaspora culture.',
		],
		compensation: {
			intro:
				'We are an independent creative publication with a budget tailored to our current stage. We operate on a flat-rate commission system for all commissioned photography and visual features.',
			items: [
				{
					label: 'Standard Editorial',
					detail: '$50 USD flat rate per published photo essay, festival gallery, or artist shoot.',
				},
				{
					label: 'Commissions',
					detail: 'Payment is guaranteed exclusively for pre-assigned editorial briefs and commissioned shoots.',
				},
				{
					label: 'Creative Credit',
					detail: 'You will receive full visual credits, retain copyright ownership, and be tagged across all Grugbox digital platforms.',
				},
				{
					label: 'Project Funding',
					detail: 'Special travel or production expenses for high-impact visual series are reviewed and approved on an individual basis before shooting begins. Pitching a concept does not guarantee expense coverage.',
				},
				{
					label: 'Payment Terms',
					detail: 'All fees are processed immediately following the publication of your visual work.',
				},
			],
		},
		diversity:
			'Grugbox is committed to a fair, inclusive, and transparent contributor process. We enthusiastically welcome applications from all backgrounds, no matter your location or past industry access. We place immense value on the distinct perspectives born of varied lived experiences and strive to cultivate a welcoming environment where every creative voice is heard and championed.',
	},
]

export function getVolunteerRole(slug: string): VolunteerRole | undefined {
	return VOLUNTEER_ROLES.find(role => role.slug === slug)
}
