const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1' }],    // 14px
        'base': ['1rem', { lineHeight: '1.25' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.7' }],      // 18px
        'xl': ['1.25rem', { lineHeight: '1.25' }],      // 20px
        '2xl': ['1.5rem', { lineHeight: '1.25' }],          // 24px
        '3xl': ['2rem',     { lineHeight: '1.25' }],   // 32px
        '4xl': ['2.25rem', { lineHeight: '1.25' }],      // 36px
        '5xl': ['3rem', { lineHeight: '1.5' }],          // 48px
        '6xl': ['3.75rem', { lineHeight: '1.5' }],       // 60px
      },
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      fontFamily: {
        'sans': ['"Noto Sans TC"', '"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        'serif': ['"Playfair Display"', '"Noto Serif TC"', 'serif']
      },
    },
  },
  plugins: [],
};
