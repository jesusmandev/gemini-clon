/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gemini-blue': '#4285F4',
        'gemini-purple': '#9B72CB',
        'gemini-red': '#D96570',
        'dark-bg': '#000000',
        'dark-surface': '#131314',
        'theme-bg': 'var(--bg)',
        'theme-text': 'var(--text)',
        'theme-sidebar': 'var(--sidebar)',
        'theme-card': 'var(--card)',
        'theme-border': 'var(--border)',
      },
      backgroundImage: {
        'gemini-gradient': "linear-gradient(16deg, #4285F4, #9B72CB, #D96570)",
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
