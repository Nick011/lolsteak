import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wow: {
          warrior: '#C79C6E',
          paladin: '#F58CBA',
          hunter: '#ABD473',
          rogue: '#FFF569',
          priest: '#FFFFFF',
          'death-knight': '#C41F3B',
          shaman: '#0070DE',
          mage: '#69CCF0',
          warlock: '#9482C9',
          druid: '#FF7D0A',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
