/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#050b14',
          darker: '#02060d',
          card: '#0a1220',
          cardHover: '#0f1b2f',
        },
        primary: {
          DEFAULT: '#0ea5e9',
          light: '#38bdf8',
          dark: '#0284c7',
        },
        accent: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0891b2',
        },
        navy: {
          50: '#f0f5fa',
          100: '#dcebf5',
          200: '#bed9eb',
          300: '#8ebcdd',
          400: '#5698cb',
          500: '#357bb5',
          600: '#276296',
          700: '#214e7a',
          800: '#1e4367',
          900: '#1c3a57',
          950: '#0f1d2e',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.15)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.15)',
        'card-glow': '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
