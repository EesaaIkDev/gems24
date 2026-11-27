/** @type {import('tailwindcss').Config} */
const c = (token) => `oklch(var(--${token}) / <alpha-value>)`;

module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xs: 'calc(var(--radius) - 6px)'
  		},
  		/* 100vh misbehaves in mobile Safari; screen heights use dvh. */
  		height: { screen: '100dvh' },
  		minHeight: { screen: '100dvh' },
  		maxHeight: { screen: '100dvh' },
  		colors: {
  			background: c('background'),
  			foreground: c('foreground'),
  			card: {
  				DEFAULT: c('card'),
  				foreground: c('card-foreground')
  			},
  			popover: {
  				DEFAULT: c('popover'),
  				foreground: c('popover-foreground')
  			},
  			primary: {
  				DEFAULT: c('primary'),
  				foreground: c('primary-foreground')
  			},
  			welcome: {
  				green: c('welcome-green'),
  				'green-bright': c('welcome-green-bright'),
  				ink: c('welcome-ink'),
  				panel: c('welcome-panel'),
  				border: c('welcome-border'),
  				text: c('welcome-text'),
  				muted: c('welcome-muted'),
  				subtle: c('welcome-subtle'),
  				pattern: c('welcome-pattern')
  			},
  			secondary: {
  				DEFAULT: c('secondary'),
  				foreground: c('secondary-foreground')
  			},
  			muted: {
  				DEFAULT: c('muted'),
  				foreground: c('muted-foreground')
  			},
  			accent: {
  				DEFAULT: c('accent'),
  				foreground: c('accent-foreground')
  			},
  			destructive: {
  				DEFAULT: c('destructive'),
  				foreground: c('destructive-foreground')
  			},
  			/* Alpha borders: a tinted ink at low opacity blends into any surface. */
  			border: 'oklch(var(--border) / calc(var(--border-alpha) * <alpha-value>))',
  			input: 'oklch(var(--input) / calc(var(--input-alpha) * <alpha-value>))',
  			disabled: c('disabled'),
  			'switch-off': c('switch-off'),
  			ring: c('ring'),
  			chart: {
  				'1': c('chart-1'),
  				'2': c('chart-2'),
  				'3': c('chart-3'),
  				'4': c('chart-4'),
  				'5': c('chart-5')
  			},
  			sidebar: {
  				DEFAULT: c('sidebar-background'),
  				foreground: c('sidebar-foreground'),
  				primary: c('sidebar-primary'),
  				'primary-foreground': c('sidebar-primary-foreground'),
  				accent: c('sidebar-accent'),
  				'accent-foreground': c('sidebar-accent-foreground'),
  				border: c('sidebar-border'),
  				ring: c('sidebar-ring')
  			}
  		},
  		boxShadow: {
  			float: '0 1px 3px rgba(0, 0, 0, 0.06)'
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
