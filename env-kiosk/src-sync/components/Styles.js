import { StyleSheet } from 'react-native';

// Base Fonts

export const fontSmall = {
  fontSize: 22,
};

export const fontMedium = {
  fontSize: 28,
};

export const fontLarge = {
  fontSize: 36,
};

export const primaryFontFace = {
  fontFamily: 'Maax',
};

export const proseFontFace = {
  fontFamily: 'Lora',
};

export const boldPrimaryFontFace = {
  fontFamily: 'Maax-Bold',
};

// -----------

// Colors

export const black8 = '#00000014';
export const black10 = '#00000020';
export const monsterra = '#005151';
export const monsterraLight = '#669797';
export const monsterra8 = monsterra + '14';
export const monsterra10 = monsterra + '20';
export const monsterra30 = monsterra + '4C';
export const monsterra40 = monsterra + '66';
export const monsterra60 = monsterra + '99';
export const monsterra70 = monsterra + 'B2';
export const monsterra80 = monsterra + 'CC';

export const highlightPrimaryColor = monsterra;
export const mutedPrimaryColor = monsterra60;

// -----------

// Fonts with Colors

export const titleStyle = {
  color: highlightPrimaryColor,
  ...boldPrimaryFontFace,
};

export const genericText = {
  color: '#111',
  ...primaryFontFace,
};

export const descriptionTextStyle = {
  color: highlightPrimaryColor,
  ...proseFontFace,
  fontSize: 18,
};

export const detailTextStyle = {
  color: highlightPrimaryColor,
  ...primaryFontFace,
  fontSize: 12,
};

export const titleFontSize = 60;
export const textInputLargeStyle = {
  fontSize: titleFontSize,
};

export const prettyShadow = {
  shadowOffset: { width: 0, height: 0 },
  shadowColor: 'black',
  shadowOpacity: 0.08,
  shadowRadius: 22,
};

export const prettyShadowSmall = {
  shadowOffset: { width: 0, height: 0 },
  shadowColor: 'black',
  shadowOpacity: 0.06,
  shadowRadius: 11,
};

export const pagePaddingTop = 84;

export const menuZoneTopInset = 160;
export const menuZonePaddingBottom = 116;
export const largeHorizontalPadding = 60;
export const midPageHorizPadding = 30; // the page is responsible for the additional 30, because of shadow
export const rightSidebarWidth = 280;
export const cardLargeWidth = 340;
// export const prettyExtraShadow = {
//   shadowOffset: { width: 0, height: 0 },
//   shadowColor: 'black',
//   shadowOpacity: 0.04,
//   shadowRadius: 8,
// };

export const splashText = {
  color: highlightPrimaryColor,
  fontSize: 28,
  fontFamily: 'Maax-Bold',
};

export const pageBackgroundColor = '#fff';
export const highlightBackgroundColor = '#fff';
export const hairlineColor = '#bbb';
export const rowBorderWidth = StyleSheet.hairlineWidth;
export const rowStyle = {
  backgroundColor: highlightBackgroundColor,
  // borderBottomWidth: rowBorderWidth,
  // borderColor: hairlineColor,
  padding: 20,
  paddingHorizontal: 30,
  marginVertical: 10,
  overflow: 'hidden',
  ...prettyShadow,
};
export const rowTitleStyle = {
  fontSize: 26,
  fontWeight: 'bold',
  color: '#444',
  marginBottom: 15,
};
export const linkRowStyle = {
  ...rowStyle,
};
export const bitRowStyle = {
  ...rowStyle,
};
export const intRowStyle = {
  ...rowStyle,
};

export const cardTopInset = 200;
export const pageInset = 80;

export const genericPageStyle = {};
export const inputPageStyle = {
  backgroundColor: pageBackgroundColor,
};

export const rowSectionStyle = {
  marginBottom: 15,
  paddingHorizontal: 20,
  ...prettyShadow,
};

export const linkRowIconTextStyle = {
  fontSize: 42,
};
export const linkRowTitleTextStyle = {
  ...primaryFontFace,
  flex: 1,
  color: monsterra80,
  paddingLeft: 30,
  fontSize: 42,
};

export const rowSectionInnerStyle = {
  // borderTopWidth: rowBorderWidth,
  // borderLeftWidth: rowBorderWidth,
  // borderRightWidth: rowBorderWidth,
  // borderColor: hairlineColor,
};

export const buttonTitleStyle = {
  ...fontMedium,
  textAlign: 'center',
  color: 'white',
  fontSize: 24,
  lineHeight: 26,
  fontFamily: 'Maax-Bold',
};
export const headerHeight = 66;
export const prettyShadowRespectedRadius = 30;
export const buttonHeight = 56;
export const actionPagePadding = 20;

export const buttonStyle = {
  backgroundColor: monsterra80,
  borderRadius: 4,
  paddingTop: 15,
  paddingBottom: 15,
  paddingHorizontal: 16,
  margin: 10,
  minHeight: buttonHeight,
  justifyContent: 'center',
};

export const textInputHorizPadding = 20;
export const textInputStyle = {
  minHeight: 56,
  paddingHorizontal: textInputHorizPadding,
  ...boldPrimaryFontFace,
  color: highlightPrimaryColor,
};

export const textInputLabelStyle = {
  paddingHorizontal: textInputHorizPadding,
  ...primaryFontFace,
  color: monsterra40,
};

export const blockFormMessageTextStyle = {
  marginVertical: 3,
  ...proseFontFace,
  fontSize: 26,
  color: highlightPrimaryColor,
};

export const blockFormTitleTextStyle = {
  marginBottom: 4,
  fontSize: 38,
  ...titleStyle,
};

export const secondaryButtonStyle = {
  ...buttonStyle,
  paddingTop: 12,
  backgroundColor: null,
  borderColor: highlightPrimaryColor,
  borderWidth: 3,
};

export const secondaryButtonTitleStyle = {
  ...buttonTitleStyle,
  color: highlightPrimaryColor,
};

export const textButtonStyle = {
  ...boldPrimaryFontFace,
  ...fontSmall,
  color: highlightPrimaryColor,
};
export const textButtonContainerStyle = {
  padding: 20,
};

export const menuItemNameText = { ...genericText };
export const menuItemDescriptionText = { ...genericText };

export const keyboardAppearance = 'dark';

export const heroViewStyle = {
  padding: 35,
  paddingTop: 80,
  paddingBottom: 40,
  flexDirection: 'row',
  alignItems: 'center',
};
export const heroIconStyle = { top: 15, fontSize: 64 };
export const heroSubtitleStyle = { fontSize: 50 };