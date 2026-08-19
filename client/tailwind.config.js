/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep charcoal-blue base -- never pure black, keeps depth in photos/product images
        base: {
          900: '#0B0E14',
          800: '#111520',
          700: '#161B29',
          600: '#1E2434',
          500: '#2A3145',
        },
        border: '#242B3D',
        // Gold/amber = commission ("hoa hồng") signature accent
        gold: {
          400: '#FFC768',
          500: '#F5A623',
          600: '#D68A0F',
        },
        // Teal = affiliate link / trust / CTA
        teal: {
          400: '#3EEBD4',
          500: '#00D9C0',
          600: '#00B3A0',
        },
        hot: {
          500: '#FF4D4F',
          600: '#E23F41',
        },
        ink: {
          100: '#F4F6FA',
          300: '#C7CCDA',
          500: '#9BA3B4',
          700: '#6B7386',
        },
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 0 1px rgba(245,166,35,0.25), 0 8px 24px -8px rgba(245,166,35,0.35)',
        card: '0 4px 20px -4px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
