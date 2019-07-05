const primaryColor = "#005151";

const colors = {
  primary: primaryColor,
  primary5: `${primaryColor}0D`,
  primary8: `${primaryColor}14`,
  primary10: `${primaryColor}20`,
  primary30: `${primaryColor}4C`,
  primary40: `${primaryColor}66`,
  primary50: `${primaryColor}80`,
  primary60: `${primaryColor}99`,
  primary70: `${primaryColor}B2`,
  primary80: `${primaryColor}CC`,
  primaryLight: '#669797',
  white: '#fff',
  lightGrey: '#F8F8F8',
  lighterGrey: "#EFEFEF",
  border: 'rgba(0,0,0,0.1)',
  monsterra: 'hsl(180, 100%, 16%)',
  monsterras: [
    'hsla(180, 100%, 16%, 0.8)',
    'hsla(180, 100%, 16%, 0.4)'
  ]
};

const fontFamily = { // TODO: DEPRECATE
  heading: 'Maax-Bold',
  title: 'Maax-Bold',
  body: 'Lora',
  footnote: 'Maax',
  button: 'Maax-Bold',
};

const fonts = {
  normal: "Maax",
  bold: "Maax-Bold",
  serif: "Lora"
}

const textStyles = {
  heading: {
    color: colors.monsterra,
    fontFamily: fonts.bold,
  },
  title: {
    color: colors.monsterra,
    fontFamily: fonts.bold,
  },
  body: {
    color: colors.monsterra,
    fontSize: 18,
    lineHeight: 32,
    letterSpacing: 0.3,
    fontFamily: fonts.serif,
  },
  footnote: {
    color: colors.monsterra,
    fontSize: 13,
    lineHeight: 28,
    fontFamily: fonts.normal,
    letterSpacing: 0.3
  },
};

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
  fontFamily, // DEPRECATE
  fonts,
  fontSizes: [12, 18, 20, 28, 38],
  textStyles,
  shadows,
  radii: [0, 2, 4, 8],
  breakpoints: [768],
  layouts: {
    small: 640 + 56, // 56 is the padding horizontal on the container
    large: 1280 + 56
  },
  space: [0, 4, 8, 12, 16, 20, 24, 28, 32]
};
