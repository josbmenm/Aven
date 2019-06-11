import React from 'react';
import { Image } from 'react-native';

const CustomImage = ({ imageURI, style, resizeMode, tintColor }) => {
  return (
    <Image
      style={[style, { tintColor }]}
      tintColor={tintColor}
      resizeMode={resizeMode}
      source={{
        uri: imageURI,
      }}
    />
  );
};

export const loadImages = () => {};

export default CustomImage;
