import React from 'react';
import Image from './Image';
const md5 = require('crypto-js/md5');

let authority = 'www.onofood.co';
let useSSL = true;

export function setHostConfig(config) {
  useSSL = config.useSSL;
  authority = config.authority;
}

const AirtableImage = ({ image, style }) => {
  const origUrl = image[0].url;
  const imageURI = `${
    useSSL ? 'https' : 'http'
  }://${authority}/_/kitchen.maui.onofood.co/Airtable/files/${md5(
    origUrl,
  ).toString()}.jpg`;
  console.log({ imageURI });
  return <Image style={style} imageURI={imageURI} />;
};

export default AirtableImage;
