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
        'xs': ['0.75rem', { lineHeight: '1.125rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.3125rem' }],    // 14px
        'base': ['1rem', { lineHeight: '1.625rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],      // 18px
        'xl': ['1.25rem', { lineHeight: '1.875rem' }],      // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],          // 24px
        '3xl': ['2rem',     { lineHeight: '2.5rem' }],   // 32px
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],      // 36px
        '5xl': ['3rem', { lineHeight: '3.5rem' }],          // 48px
        '6xl': ['3.75rem', { lineHeight: '4.5rem' }],       // 60px
      },
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
    },
  },
  plugins: [],
};
