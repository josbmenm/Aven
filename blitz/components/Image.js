import React, { Component } from 'react';
import Image from 'react-native-fast-image';
import { View, TouchableOpacity } from 'react-native';

const OnoImage = ({ imageURI, style, resizeMode }) => {
  return (
    <Image
      style={style}
      resizeMode={resizeMode}
      source={{
        uri: imageURI,
      }}
    />
  );
};

export default OnoImage;
