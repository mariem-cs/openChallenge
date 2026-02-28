/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      colors: {
        // Sunset palette
        'sunset': {
          50: '#FFF1F0',
          100: '#FFE3E0',
          200: '#FFC7C0',
          300: '#FF9F9F',
          400: '#FF8E72',
          500: '#FF6B6B',
          600: '#FF5252',
          700: '#FF3838',
        },
        // Ocean palette
        'ocean': {
          50: '#F0FCFA',
          100: '#E0F9F5',
          200: '#C2F3EB',
          300: '#9BE7DF',
          400: '#4ECDC4',
          500: '#45B7D1',
          600: '#3A9FBD',
          700: '#2F87A9',
        },
        // Purple palette
        'purple': {
          50: '#F0EEFD',
          100: '#E1DCFB',
          200: '#C3B9F7',
          300: '#A596F3',
          400: '#6C5CE7',
          500: '#5B4BC4',
          600: '#4A3FA1',
          700: '#39337E',
        },
        // Forest palette
        'forest': {
          50: '#F0F9F0',
          100: '#E1F3E1',
          200: '#C3E7C3',
          300: '#A2E3A0',
          400: '#6BCB77',
          500: '#4CAF50',
          600: '#388E3C',
          700: '#2E7D32',
        },
        // Berry palette
        'berry': {
          50: '#FFF0F2',
          100: '#FFE0E6',
          200: '#FFC2CE',
          300: '#FF9F9F',
          400: '#FF6B8B',
          500: '#D65DB1',
          600: '#B44A97',
          700: '#92377D',
        },
        // Neutral light colors
        'background': {
          DEFAULT: '#F8FAFF',
          dark: '#F0F4FF',
          card: '#FFFFFF',
        },
        'text': {
          DEFAULT: '#1A1F2E',
          light: '#4A5568',
          lighter: '#718096',
        }
      },
      fontFamily: {
        'display': ['DM Sans', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}