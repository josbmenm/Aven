import { StyleSheet } from 'react-native';

export const genericText = {
  color: '#111',
};
export const titleFontSize = 60;
export const textInputLargeStyle = {
  fontSize: titleFontSize,
};

export const titleFontStyle = {
  fontSize: titleFontSize,
  textAlign: 'center',
  color: '#111',
};

export const prettyShadow = {
  shadowOffset: { width: 0, height: 0 },
  shadowColor: 'black',
  shadowOpacity: 0.1,
  shadowRadius: 30,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: '#e5e5e5',
};

export const highlightPrimaryColor = '#0B5151';
export const mutedPrimaryColor = '#88ACAC';
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
  borderBottomWidth: rowBorderWidth,
  borderColor: hairlineColor,
  padding: 20,
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

export const genericPageStyle = {
  backgroundColor: pageBackgroundColor,
};
export const inputPageStyle = {
  backgroundColor: pageBackgroundColor,
};

export const rowSectionStyle = {
  marginBottom: 15,
  paddingHorizontal: 20,
};

export const linkRowIconTextStyle = {
  marginRight: 28,
  fontSize: 42,
};
export const linkRowTitleTextStyle = {
  fontSize: 42,
};

export const rowSectionInnerStyle = {
  borderTopWidth: rowBorderWidth,
  borderLeftWidth: rowBorderWidth,
  borderRightWidth: rowBorderWidth,
  borderColor: hairlineColor,
};

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

export const boldPrimaryFontFace = {
  fontFamily: 'Maax-Bold',
};

export const titleStyle = {
  color: highlightPrimaryColor,
  ...boldPrimaryFontFace,
};

export const buttonTitleStyle = {
  ...fontMedium,
  textAlign: 'center',
  color: 'white',
  fontSize: 42,
  fontFamily: 'Maax-Bold',
};

export const buttonStyle = {
  backgroundColor: highlightPrimaryColor,
  borderRadius: 10,
  padding: 10,
  paddingHorizontal: 20,
  marginHorizontal: 10,
  marginVertical: 10,
  justifyContent: 'center',
};

export const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: null,
  borderColor: highlightPrimaryColor,
  borderWidth: 5,
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

export const heroViewStyle = { padding: 20, paddingVertical: 60 };
export const heroIconStyle = { fontSize: 100, textAlign: 'center' };
export const heroSubtitleStyle = { fontSize: 50 };
