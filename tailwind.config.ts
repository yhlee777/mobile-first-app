import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      colors: {
        brand: '#51a66f',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config