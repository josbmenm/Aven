import React from 'react';
import FastImage from 'react-native-fast-image';
import { Image } from 'react-native';

const CustomImage = ({ imageURI, style, resizeMode, tintColor }) => {
  // special treatment for tintColor because FastImage does not support it
  if (tintColor) {
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
  }

  return (
    <FastImage
      style={style}
      resizeMode={resizeMode}
      source={{
        uri: imageURI,
      }}
    />
  );
};

export const loadImages = FastImage.preload;

export default CustomImage;
