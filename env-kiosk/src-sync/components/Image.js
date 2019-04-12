import React from 'react';
// import FastImage from 'react-native-fast-image';
import { Image } from 'react-native';

const OnoImage = ({ imageURI, style, resizeMode, tintColor }) => {
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
