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

export const pageBackgroundColor = '#f2f2ff';
export const highlightBackgroundColor = '#fff';
export const hairlineColor = '#bbb';
export const rowBorderWidth = StyleSheet.hairlineWidth;
export const rowStyle = {
  backgroundColor: highlightBackgroundColor,
  borderBottomWidth: rowBorderWidth,
  borderColor: hairlineColor,
  padding: 20,
};
export const linkRowStyle = {
  ...rowStyle,
};

export const genericPageStyle = {
  backgroundColor: pageBackgroundColor,
};
export const inputPageStyle = {
  backgroundColor: pageBackgroundColor,
};

export const rowSectionStyle = {
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
  backgroundColor: '#963',
  borderRadius: 42,
  padding: 20,
};

export const menuItemNameText = { ...genericText };
export const menuItemDescriptionText = { ...genericText };

export const keyboardAppearance = 'dark';
