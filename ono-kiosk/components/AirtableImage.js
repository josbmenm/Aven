import React from 'react';
import Image from './Image';
const md5 = require('crypto-js/md5');

const AirtableImage = ({ image, style }) => {
  const origUrl = image[0].url;
  return (
    <Image
      style={style}
      imageURI={`https://www.onofood.co/_/airtable/files/${md5(
        origUrl,
      ).toString()}.jpg`}
    />
  );
};

export default AirtableImage;
