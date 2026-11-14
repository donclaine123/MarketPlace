import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { primary: '#1877F2' }, fontFamily: { sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'] } } },
  plugins: [],
} satisfies Config;
