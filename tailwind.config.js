/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // IRENA Official Colors
        'irena-blue': {
          DEFAULT: '#0078a7',
          dark: '#005a82',
          light: '#4da3c9',
        },
        'irena-orange': {
          DEFAULT: '#f7941d',
          dark: '#d47a15',
          light: '#fbb25a',
        },
        // Stakeholder Colors (from toolkit)
        'stakeholder': {
          'policy': '#0078a7',      // Blue
          'grid': '#00a651',        // Green
          'industry': '#f7941d',    // Orange
          'public': '#ffcd00',      // Yellow
          'cso': '#8cc63f',         // Light Green
          'science': '#662d91',     // Purple
          'finance': '#006837',     // Dark Green
          'regional': '#c1272d',    // Red
          'development': '#0033a0', // Dark Blue
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
