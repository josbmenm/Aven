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
};

const fontFamily = {
  heading: 'Maax-Bold',
  title: 'Maax-Bold',
  body: 'Lora',
  footnote: 'Maax',
  button: 'Maax-Bold',
};

const textSpacing = {
  marginBottom: 8,
};

const textDefaults = {
  color: colors.primary,
};

const textStyles = {
  heading: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 38,
    lineHeight: 64,
    fontFamily: fontFamily.heading,
  },
  title: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 28,
    lineHeight: 48,
    fontFamily: fontFamily.title,
  },
  body: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 18,
    lineHeight: 32,
    fontFamily: fontFamily.body,
  },
  footnote: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fontFamily.footnote,
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
  fontFamily,
  fontSizes: [12, 18, 20, 28, 38],
  textStyles,
  shadows,
  radii: [0, 2, 4, 8],
  breakpoints: [768],
  layouts: {
    small: 640,
    large: 1280
  },
  space: [0, 4, 8, 12, 16, 20, 24, 28, 32]
};
