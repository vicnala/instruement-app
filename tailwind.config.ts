import type { Config } from "tailwindcss";

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
		},
		extend: {
			borderRadius: {
				'button': 'var(--radius-button)',
				'tab': 'var(--radius-tab)',
				'section': 'var(--radius-section)',
			},
			fontSize: {
				'xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
				'sm': ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.5' }],
				'base': ['clamp(1rem, 0.9132rem + 0.3563vw, 1.1875rem)', { lineHeight: '1.5' }],
				'lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { lineHeight: '1.5' }],
				'xl': ['clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)', { lineHeight: '1.5' }],
				'2xl': ['clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem)', { lineHeight: '1.3' }],
				'3xl': ['clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem)', { lineHeight: '1.3' }],
				'4xl': ['clamp(2.25rem, 1.875rem + 1.875vw, 3rem)', { lineHeight: '1.2' }],
				'5xl': ['clamp(3rem, 2.5rem + 2.5vw, 3.75rem)', { lineHeight: '1.1' }],
				'6xl': ['clamp(3.75rem, 3rem + 3.75vw, 4.5rem)', { lineHeight: '1.1' }],
				'7xl': ['clamp(4.5rem, 3.75rem + 3.75vw, 6rem)', { lineHeight: '1' }],
				'8xl': ['clamp(6rem, 5rem + 5vw, 8rem)', { lineHeight: '1' }],
				'9xl': ['clamp(8rem, 6rem + 10vw, 12rem)', { lineHeight: '1' }],
			},
			colors: {
				// Base colors using semantic CSS variables (these switch with theme)
				contrast: "var(--bg-contrast)",
				tertiary: "var(--bg-tertiary)",
				canvas: "var(--bg-canvas)",
				// Scope-based tokens - automatically adapt based on data-theme scope and dark mode
				// Usage: <div data-theme="me"><div className="bg-scope-100">...</div></div>
				scope: {
					'25': 'var(--scope-25)',
					'50': 'var(--scope-50)',
					'100': 'var(--scope-100)',
					'200': 'var(--scope-200)',
					'300': 'var(--scope-300)',
					'400': 'var(--scope-400)',
					'500': 'var(--scope-500)',
					'600': 'var(--scope-600)',
					'700': 'var(--scope-700)',
					'800': 'var(--scope-800)',
					'900': 'var(--scope-900)',
					'950': 'var(--scope-950)',
					'1000': 'var(--scope-1000)',
				},
				// IT palette (orange/amber) - using CSS variables
				it: {
					'25': 'var(--color-it-25)',
					'50': 'var(--color-it-50)',
					'100': 'var(--color-it-100)',
					'200': 'var(--color-it-200)',
					'300': 'var(--color-it-300)',
					'400': 'var(--color-it-400)',
					'500': 'var(--color-it-500)',
					'600': 'var(--color-it-600)',
					'700': 'var(--color-it-700)',
					'800': 'var(--color-it-800)',
					'900': 'var(--color-it-900)',
					'950': 'var(--color-it-950)',
					'1000': 'var(--color-it-1000)'
				},
				// ME palette (green) - using CSS variables
				me: {
					'25': 'var(--color-me-25)',
					'50': 'var(--color-me-50)',
					'100': 'var(--color-me-100)',
					'200': 'var(--color-me-200)',
					'300': 'var(--color-me-300)',
					'400': 'var(--color-me-400)',
					'500': 'var(--color-me-500)',
					'600': 'var(--color-me-600)',
					'700': 'var(--color-me-700)',
					'800': 'var(--color-me-800)',
					'900': 'var(--color-me-900)',
					'950': 'var(--color-me-950)',
					'1000': 'var(--color-me-1000)'
				},
				// WE palette (purple) - using CSS variables
				we: {
					'25': 'var(--color-we-25)',
					'50': 'var(--color-we-50)',
					'100': 'var(--color-we-100)',
					'200': 'var(--color-we-200)',
					'300': 'var(--color-we-300)',
					'400': 'var(--color-we-400)',
					'500': 'var(--color-we-500)',
					'600': 'var(--color-we-600)',
					'700': 'var(--color-we-700)',
					'800': 'var(--color-we-800)',
					'900': 'var(--color-we-900)',
					'950': 'var(--color-we-950)',
					'1000': 'var(--color-we-1000)'
				},
				// US palette (neutral gray) - using CSS variables
				us: {
					'25': 'var(--color-us-25)',
					'50': 'var(--color-us-50)',
					'100': 'var(--color-us-100)',
					'200': 'var(--color-us-200)',
					'300': 'var(--color-us-300)',
					'400': 'var(--color-us-400)',
					'500': 'var(--color-us-500)',
					'600': 'var(--color-us-600)',
					'700': 'var(--color-us-700)',
					'800': 'var(--color-us-800)',
					'900': 'var(--color-us-900)',
					'950': 'var(--color-us-950)',
					'1000': 'var(--color-us-1000)'
				},
				// Gray palette (same as US) - using CSS variables
				gray: {
					'25': 'var(--color-gray-25)',
					'50': 'var(--color-gray-50)',
					'100': 'var(--color-gray-100)',
					'200': 'var(--color-gray-200)',
					'300': 'var(--color-gray-300)',
					'400': 'var(--color-gray-400)',
					'500': 'var(--color-gray-500)',
					'600': 'var(--color-gray-600)',
					'700': 'var(--color-gray-700)',
					'800': 'var(--color-gray-800)',
					'900': 'var(--color-gray-900)',
					'950': 'var(--color-gray-950)',
					'1000': 'var(--color-gray-1000)'
				},
				// Semantic tokens - available for direct use via CSS variables
				// These are accessible through Tailwind's arbitrary value syntax:
				// bg-[var(--bg-canvas)], text-[var(--text-primary)], etc.
			},
			backgroundImage: theme => ({
				'add-home-screen': "url('/images/add_to_home_screen.png')"
			}),
			minHeight: {
				'1/2': '50vh',
				'1/3': '33.333333vh',
				'2/3': '66.666667vh',
				'1/4': '25vh',
				'1/5': '20vh',
				'1/6': '16.666667vh',
				'1/7': '14.2857vh',
				'1/8': '12.5vh',
				'1/10': '10vh',
				'1/15': '6.666667vh',
				'1/20': '5vh',
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [
		require('tailwindcss-safe-area'),
		require("tailwindcss-animate")
	],
	corePlugins: {
		transitionDelay: true,
	},
} satisfies Config;

export default config;
