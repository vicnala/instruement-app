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
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
			colors: {
				it: {
					'25': '#FCF6F0',
					'50': '#FCF0E3',
					'100': '#FCEAD7',
					'200': '#FCD7B1',
					'300': '#FCB165',
					'400': '#FC9126',
					'500': '#FB7C0D',
					'600': '#EC7309',
					'700': '#C36009',
					'800': '#9D4D10',
					'900': '#7E4010',
					'950': '#462206',
					'1000': '#471F00'
				},
				me: {
					'25': '#F2FFF9',
					'50': '#E5FFF2',
					'100': '#D9FFEC',
					'200': '#B3FFD9',
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
					'25': '#F6EFFC',
					'50': '#F4EBFC',
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
					'50': '#F7F6F5',
					'100': '#EDEAE8',
					'200': '#D9D3CE',
					'300': '#BCB1A9',
					'400': '#A79A90',
					'500': '#958579',
					'600': '#89796C',
					'700': '#72645A',
					'800': '#61554C',
					'900': '#50463E',
					'1000': '#332D28',
					'1100': '#171412',
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
