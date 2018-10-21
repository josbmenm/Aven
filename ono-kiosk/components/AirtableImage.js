import React, { Component } from 'react';
import Image from './Image';

const AirtableImage = ({ image, style }) => {
  console.log(image);
  return (
    <Image
      style={style}
      imageURI={`https://www.onofood.co/_/airtable/files/11fff5f4ab94b9ed90538106055d3b38.jpg`}
    />
  );
};

export default AirtableImage;
