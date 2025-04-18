import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: ["src/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    theme: {
    	extend: {
    		fontFamily: {
    			sans: [
    				'Inter',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif',
    				'Apple Color Emoji',
    				'Segoe UI Emoji',
    				'Segoe UI Symbol',
    				'Noto Color Emoji'
    			],
				herborn: ["Herborn"],
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
            container: {
                center: true
            },
    		colors: {
				"bonk-orange": "#2F343B",
				"bonk-yellow": "#F5F5DC",
				"bonk-white": "#F5F5DC",
				"bonk-blue": {
				dark: "#00243d",
				light: "#293f65",
				},
				"bonk-green": "#2dc48d",
				"bonk-gray": {
				light: "#2B3649",
				dark: "#000205",
				},
				"bonk-red": {
				light: "#D4A85A",
				dark: "#800000",
				},
                // Whiskey themed colors
                "whiskey": {
                    amber: "#D4A85A",     // Golden/amber whiskey color
                    caramel: "#C67D34",   // Rich caramel color
                    copper: "#B36A5E",    // Copper still color
                    mahogany: "#4E2728",  // Dark mahogany barrel color
                    oak: "#8B5A2B",       // Oak barrel color
                    cream: "#F5F5DC",     // Cream/label background
                    charcoal: "#2F343B",  // Dark charcoal for text
                    ruby: "#9B2335",      // Rich ruby accent (like in bourbon)
                    peat: "#615E59",      // Smoky peat color
                },
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		}
    	}
    },
    plugins: [tailwindAnimate],
} satisfies Config;
