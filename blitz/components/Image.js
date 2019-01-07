import React, { Component } from 'react';
import { Image, View, TouchableOpacity } from 'react-native';

const OnoImage = ({ imageURI, style }) => {
  return (
    <Image
      style={style}
      source={{
        uri: imageURI,
      }}
    />
  );
};

export default OnoImage;