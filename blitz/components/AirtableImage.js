import React from 'react';
import Image from './Image';
const md5 = require('crypto-js/md5');
const path = require('path');

let authority = 'www.onofood.co';
let useSSL = true;

export function setHostConfig(config) {
  useSSL = config.useSSL;
  authority = config.authority;
}

const AirtableImage = ({ image, style }) => {
  const origUrl = image && image[0] && image[0].url;
  const ext = path.extname(origUrl);
  const imageURI = `${
    useSSL ? 'https' : 'http'
  }://${authority}/_/kitchen.maui.onofood.co/Airtable/files/${md5(
    origUrl,
  ).toString()}${ext}`;
  return <Image style={style} imageURI={imageURI} />;
};

export default AirtableImage;
