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
				contrast: "#171412",
				tertiary: "#F6F6F6",
				canvas: "#FAFAFB",
				it: {
					'25': '#FFF9F3',
					'50': '#FCF2E8',
					'100': '#FCEAD7',
					'200': '#FCD7B1',
					'300': '#FCB165',
					'400': '#FC9F42',
					'500': '#FA870D',
					'600': '#EC7309',
					'700': '#C36009',
					'800': '#9D4D10',
					'900': '#7E4010',
					'950': '#462206',
					'1000': '#471F00'
				},
				me: {
					'25': '#EDFFF7',
					'50': '#E3FFF1',
					'100': '#D1FFE8',
					'200': '#A3FFD1',
					'300': '#66FFB0',
					'400': '#32F593',
					'500': '#0BDC62',
					'600': '#01B74D',
					'700': '#058F3F',
					'800': '#0A712C',
					'900': '#0A5C25',
					'950': '#004015',
					'1000': '#003311',
				},
				we: {
					'25': '#FAF5FF',
					'50': '#F5EDFC',
					'100': '#F0E3FC',
					'200': '#E4CFFC',
					'300': '#D4B1FC',
					'400': '#B97FFC',
					'500': '#AC65FC',
					'600': '#8B2BF3',
					'700': '#781AD5',
					'800': '#661AAD',
					'900': '#56178C',
					'950': '#370269',
					'1000': '#250147',
				},
				gray: {
					'25': '#F6F4F3',
					'50': '#E5E0DB',
					'100': '#D4CBC4',
					'200': '#C2B6AD',
					'300': '#AFA297',
					'400': '#9C8D81',
					'500': '#89796C',
					'600': '#74665A',
					'700': '#5F5349',
					'800': '#493F38',
					'900': '#332C27',
					'950': '#1D1916',
					'1000': '#070605',
				}
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
