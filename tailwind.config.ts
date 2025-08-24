import type { Config } from "tailwindcss";

/**
 * Hollow Knight: Silksong Design System for Next.js
 * 统一的 Tailwind CSS 配置，基于设计 Token 系统
 * 针对 Next.js App Router 进行优化
 */
export default {
  darkMode: ["class"],
  content: [
    // Next.js App Router 路径
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    // 新增路径支持
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			sm: '2rem',
  			lg: '4rem',
  			xl: '5rem',
  			'2xl': '6rem'
  		},
  		screens: {
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1400px'
  		}
  	},
  	screens: {
  		xs: '475px',
  		sm: '640px',
  		md: '768px',
  		lg: '1024px',
  		xl: '1280px',
  		'2xl': '1400px'
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': 'hsl(120 50% 95%)',
  				'100': 'hsl(120 50% 90%)',
  				'200': 'hsl(120 50% 80%)',
  				'300': 'hsl(120 50% 70%)',
  				'400': 'hsl(120 50% 60%)',
  				'500': 'hsl(110 50% 35%)',
  				'600': 'hsl(110 50% 30%)',
  				'700': 'hsl(110 50% 25%)',
  				'800': 'hsl(110 50% 20%)',
  				'900': 'hsl(110 50% 15%)',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				glow: 'hsl(110 60% 45%)'
  			},
  			secondary: {
  				'50': 'hsl(120 25% 95%)',
  				'100': 'hsl(120 25% 90%)',
  				'200': 'hsl(120 25% 80%)',
  				'300': 'hsl(120 25% 70%)',
  				'400': 'hsl(120 25% 60%)',
  				'500': 'hsl(120 25% 50%)',
  				'600': 'hsl(120 25% 40%)',
  				'700': 'hsl(120 25% 30%)',
  				'800': 'hsl(120 25% 20%)',
  				'900': 'hsl(120 25% 10%)',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				'50': 'hsl(45 85% 95%)',
  				'100': 'hsl(45 85% 90%)',
  				'200': 'hsl(45 85% 80%)',
  				'300': 'hsl(45 85% 70%)',
  				'400': 'hsl(45 85% 65%)',
  				'500': 'hsl(45 85% 60%)',
  				'600': 'hsl(45 85% 55%)',
  				'700': 'hsl(45 85% 50%)',
  				'800': 'hsl(45 85% 45%)',
  				'900': 'hsl(45 85% 40%)',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			neutral: {
  				'50': 'hsl(120 15% 95%)',
  				'100': 'hsl(120 15% 90%)',
  				'200': 'hsl(120 15% 80%)',
  				'300': 'hsl(120 15% 70%)',
  				'400': 'hsl(120 15% 60%)',
  				'500': 'hsl(120 15% 50%)',
  				'600': 'hsl(120 15% 40%)',
  				'700': 'hsl(120 15% 30%)',
  				'800': 'hsl(120 15% 20%)',
  				'900': 'hsl(120 15% 10%)',
  				'950': 'hsl(120 15% 5%)'
  			},
  			success: {
  				light: 'hsl(120 60% 70%)',
  				DEFAULT: 'hsl(120 60% 50%)',
  				dark: 'hsl(120 60% 30%)'
  			},
  			warning: {
  				light: 'hsl(45 90% 70%)',
  				DEFAULT: 'hsl(45 90% 60%)',
  				dark: 'hsl(45 90% 50%)'
  			},
  			error: {
  				light: 'hsl(0 75% 70%)',
  				DEFAULT: 'hsl(0 75% 50%)',
  				dark: 'hsl(0 75% 30%)'
  			},
  			info: {
  				light: 'hsl(200 90% 70%)',
  				DEFAULT: 'hsl(200 90% 50%)',
  				dark: 'hsl(200 90% 30%)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			fantasy: {
  				gold: 'hsl(45 85% 60%)',
  				silver: 'hsl(210 10% 85%)',
  				mystical: 'hsl(110 60% 45%)',
  				shadow: 'hsl(120 30% 2%)'
  			},
  			moss: {
  				light: 'hsl(110 40% 55%)',
  				dark: 'hsl(110 40% 25%)'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Poppins',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'Fira Code',
  				'JetBrains Mono',
  				'monospace'
  			],
  			poppins: [
  				'Poppins',
  				'system-ui',
  				'sans-serif'
  			],
  			heading: [
  				'Poppins',
  				'system-ui',
  				'sans-serif'
  			],
  			body: [
  				'Poppins',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'7xl': [
  				'4.5rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'8xl': [
  				'6rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'9xl': [
  				'8rem',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  			},
  			'glow-pulse': {
  				'0%, 100%': {
  					filter: 'drop-shadow(0 0 15px hsl(110 60% 45% / 0.4)) drop-shadow(0 0 30px hsl(45 85% 60% / 0.2))'
  				},
  				'50%': {
  					filter: 'drop-shadow(0 0 25px hsl(110 60% 45% / 0.7)) drop-shadow(0 0 50px hsl(45 85% 60% / 0.4))'
  				}
  			},
  			'mystical-float': {
  				'0%, 100%': {
  					transform: 'translateY(0) scale(1)',
  					opacity: '0.6'
  				},
  				'50%': {
  					transform: 'translateY(-20px) scale(1.1)',
  					opacity: '1'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0) rotate(0deg)'
  				},
  				'50%': {
  					transform: 'translateY(-10px) rotate(1deg)'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			'fade-out': {
  				'0%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-down': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
  			'mystical-float': 'mystical-float 4s ease-in-out infinite',
  			float: 'float 6s ease-in-out infinite',
  			'fade-in': 'fade-in 0.3s ease-out',
  			'fade-out': 'fade-out 0.3s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'slide-down': 'slide-down 0.3s ease-out'
  		},
  		aspectRatio: {
  			auto: 'auto',
  			square: '1 / 1',
  			video: '16 / 9',
  			'4/3': '4 / 3',
  			'3/2': '3 / 2',
  			'2/3': '2 / 3',
  			'9/16': '9 / 16'
  		},
  		gridTemplateColumns: {
  			'13': 'repeat(13, minmax(0, 1fr))',
  			'14': 'repeat(14, minmax(0, 1fr))',
  			'15': 'repeat(15, minmax(0, 1fr))',
  			'16': 'repeat(16, minmax(0, 1fr))'
  		}
  	}
  },
  // 插件配置
  plugins: [
    require("tailwindcss-animate"),
  ],
} satisfies Config;