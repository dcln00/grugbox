import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
			},
		},
		extend: {
			fontFamily: {
				custom: ['League Spartan']
			}
		}
	}
}