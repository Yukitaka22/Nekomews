/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#FFFBF5',
          100: '#FFF4E0',
          200: '#FEE8B7',
          300: '#FCD786',
          400: '#FBBF48',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        coral: { 400: '#FB923C', 500: '#F97316', 600: '#EA580C' },
        emerald: { 50: '#F0FDF4', 400: '#34D399', 500: '#10B981', 600: '#059669' },
        ink: '#1F2937',
        whisker: '#6B7280',
        fur: '#E5E7EB',
        snow: '#FFFFFF',
        cream: '#FFFBF5',
      },
      borderRadius: { 'xl': '12px', '2xl': '16px', '3xl': '20px' },
    },
  },
  plugins: [],
};
