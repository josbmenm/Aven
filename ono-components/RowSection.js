import React from 'react';
import { View } from 'react-native';
import { rowSectionStyle, rowSectionInnerStyle } from './Styles';

const RowSection = ({ children }) => {
  return (
    <View style={{ ...rowSectionStyle }}>
      <View style={{ ...rowSectionInnerStyle }}>{children}</View>
    </View>
  );
};

export default RowSection;
