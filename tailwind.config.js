/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'desert-sand': '#E9CBA7',
        'wet-sand': '#C9A77D',
        'sand-dark': '#B8936A',
        'sand-light': '#F5E6D3',
      },
      fontFamily: {
        'sans': ['Open Sans', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'desert-gradient': 'linear-gradient(135deg, #E9CBA7 0%, #C9A77D 100%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(233, 203, 167, 0.9) 0%, rgba(201, 167, 125, 0.8) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        }
      }
    },
  },
  plugins: [],
} 