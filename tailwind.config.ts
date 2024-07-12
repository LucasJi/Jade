import { nextui } from '@nextui-org/theme';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      'obsidian-purple': '#A88BFA',
      'jade-green': '#A4CAB6',
    },
  },
  plugins: [nextui(), require('@tailwindcss/typography')],
};

export default config;
