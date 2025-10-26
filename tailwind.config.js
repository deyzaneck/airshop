/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark backgrounds
        dark: {
          900: '#1a1625',
          800: '#231d2e',
          700: '#2d2538',
        },
        // Light text colors
        light: {
          100: '#f5f1e8',
          200: '#e8dfc8',
          300: '#d4c5a0',
          400: '#b8a980',
        },
        // Accent colors
        peach: {
          400: '#e8b4a0',
          500: '#d4a090',
          600: '#c08c80',
        },
        wine: {
          500: '#8b4f65',
          600: '#7a4557',
          700: '#693b49',
        },
        gold: {
          400: '#d4a574',
          500: '#c09564',
          600: '#ac8554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 8px 12px rgba(0, 0, 0, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3)',
        'peach': '0 4px 15px rgba(232, 180, 160, 0.3)',
        'peach-lg': '0 8px 25px rgba(232, 180, 160, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
