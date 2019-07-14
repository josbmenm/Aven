const colors = {
  white: '#fff',
  lightGrey: '#F8F8F8',
  lighterGrey: '#EFEFEF',
  border: 'rgba(0,0,0,0.1)',
  monsterra: 'hsl(180, 100%, 16%)',
  monsterras: [
    'hsla(180, 100%, 16%, 0.8)',
    'hsla(180, 100%, 16%, 0.4)',
    'hsla(180, 100%, 16%, 0.3)',
    'hsla(180, 100%, 16%, 0.2)',
    'hsla(180, 100%, 16%, 0.1)',
  ],
};

const fonts = {
  normal: 'Maax',
  bold: 'Maax-Bold',
  serif: 'Lora',
};

const headingStyles = {
  small: {
    fontSize: [24, 28],
    lineHeight: [32, 48],
    letterSpacing: ['auto', 0.44],
  },
  mmedium: {
    fontSize: [24, 36],
    lineHeight: [32, 44],
  },
  large: {
    fontSize: [24, 38],
    lineHeight: [32, 48],
    letterSpacing: ['auto', 0.5],
  },
};

const textStyles = {
  small: {
    fontSize: [10, 10],
    lineHeight: [12, 12]
  },
  medium: {
    fontSize: [13, 13],
    lineHeight: [20, 20]
  },
  large: {
    fontSize: [15, 18],
    lineHeight: [24, 28],
    letterSpacing: [0.25, 0.3]
  }
}

const shadows = {
  large: {
    shadowOffset: { width: 0, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  medium: {
    shadowOffset: { width: 0, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  small: {
    shadowOffset: { width: 0, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
};



export const theme = {
  colors,
  fonts,
  fontSizes: [24, 28, 36, 38],
  lineHeights: [28, 44, 48],
  headingStyles,
  textStyles,
  shadows,
  radii: [0, 2, 4, 8],
  breakpoints: [768, 1024],
  layouts: {
    small: 640 + 56, // 56 is the padding horizontal on the container
    large: 1280 + 56,
  },
  space: [
    0,
    2,
    3,
    4,
    5,
    6,
    8,
    9,
    10,
    11,
    12,
    14,
    15,
    16,
    20,
    22,
    24,
    25,
    27,
    28,
    30,
    32,
    35,
    36,
    40,
    45,
    48,
    50,
    52,
    56,
    60,
    68,
    70,
    80,
    90,
    100,
    116,
    120,
    128,
    132,
    160,
    180,
    184,
    220,
    240,
    520,
    640,
  ],
};
