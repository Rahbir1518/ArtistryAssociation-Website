/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* Design tokens — every value resolves to a custom property in index.css */
        violet: {
          600: 'rgb(var(--violet-600-rgb) / <alpha-value>)',
          500: 'rgb(var(--violet-500-rgb) / <alpha-value>)',
          300: 'rgb(var(--violet-300-rgb) / <alpha-value>)',
          50: 'rgb(var(--violet-050-rgb) / <alpha-value>)',
        },
        ink: {
          900: 'rgb(var(--ink-900-rgb) / <alpha-value>)',
          600: 'rgb(var(--ink-600-rgb) / <alpha-value>)',
          400: 'rgb(var(--ink-400-rgb) / <alpha-value>)',
        },
        magenta: 'rgb(var(--magenta-rgb) / <alpha-value>)',
        cyan: 'rgb(var(--cyan-rgb) / <alpha-value>)',
        scrim: 'rgb(var(--scrim-rgb) / <alpha-value>)',

        /* Semantic aliases kept for continuity with existing class names */
        artistry: {
          dark: 'rgb(var(--ink-900-rgb) / <alpha-value>)',
          cream: 'rgb(var(--white-rgb) / <alpha-value>)',
          muted: 'rgb(var(--ink-400-rgb) / <alpha-value>)',
          ink: 'rgb(var(--ink-900-rgb) / <alpha-value>)',
          gold: 'rgb(var(--violet-600-rgb) / <alpha-value>)',
        },
      },
      fontSize: {
        'step-0': ['12px', { lineHeight: '1.5' }],
        'step-1': ['14px', { lineHeight: '1.55' }],
        'step-2': ['16px', { lineHeight: '1.6' }],
        'step-3': ['20px', { lineHeight: '1.6' }],
        'step-4': ['28px', { lineHeight: '1' }],
        'step-5': ['40px', { lineHeight: '0.96' }],
        'step-6': ['64px', { lineHeight: '0.92' }],
        'step-7': ['96px', { lineHeight: '0.9' }],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(var(--ink-900-rgb) / 0.05)",
        pill: "0 8px 32px rgb(var(--ink-900-rgb) / 0.08)",
        card: "0 18px 44px rgb(var(--ink-900-rgb) / 0.1)",
        glow: "0 0 64px rgb(var(--cyan-rgb) / 0.2)",
      },
      fontFamily: {
        sans: ['Inter', 'Satoshi', 'General Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
        display: ['Archivo Black', 'Familjen Grotesk', 'Inter', 'sans-serif'],
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
