import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sc-primary': '#2D6A4F',
        'sc-secondary': '#F4A261',
        'sc-dark': '#1B2A3B',
      },
    },
  },
  plugins: [],
}

export default config
