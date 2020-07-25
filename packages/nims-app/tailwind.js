// by https://itnext.io/how-to-use-tailwind-css-with-react-16e9d478b8b1
module.exports = {
  prefix: 'tw-',
  theme: {
    extend: {},
    outlineColor: (theme) => ({
      ...theme('colors'),
    }),
    opacity: {
      // 25: '.25',
      // 75: '.75',
      0: '0',
      10: '.1',
      20: '.2',
      30: '.3',
      40: '.4',
      50: '.5',
      60: '.6',
      70: '.7',
      80: '.8',
      90: '.9',
      100: '1',
    },
  },
  variants: {
    outline: ['responsive', 'focus', 'hover'],
  },
  plugins: [
    require('tailwindcss-enhanced-outlines-plugin')
  ],
};
