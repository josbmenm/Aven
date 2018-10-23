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

export const pageBackgroundColor = '#fef2f2';
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

export const buttonTitleStyle = {
  color: 'white',
  fontSize: 42,
};

export const buttonStyle = {
  backgroundColor: '#333',
  borderRadius: 10,
  padding: 10,
  paddingHorizontal: 20,
  marginHorizontal: 10,
};

export const menuItemNameText = { ...genericText };
export const menuItemDescriptionText = { ...genericText };

export const keyboardAppearance = 'dark';

export const heroViewStyle = { padding: 20, paddingVertical: 60 };
export const heroIconStyle = { fontSize: 100, textAlign: 'center' };
