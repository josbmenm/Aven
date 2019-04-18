import React from 'react';
import Image, { loadImages } from './Image';

const md5 = require('crypto-js/md5');
const path = require('path');

let authority = 'www.onofood.co';
let useSSL = true;

export function setHostConfig(config) {
  useSSL = config.useSSL;
  authority = config.authority;
}

const AirtableImage = ({ image, style, resizeMode, tintColor }) => {
  const origUrl = image && image[0] && image[0].url;
  const ext = path.extname(origUrl);
  const imageURI = `${
    useSSL ? 'https' : 'http'
  }://${authority}/_/onofood.co/Airtable/files/${md5(
    origUrl,
  ).toString()}${ext}`;
  return (
    <Image
      style={style}
      imageURI={imageURI}
      resizeMode={resizeMode}
      tintColor={tintColor}
    />
  );
};

export async function preloadImages(images) {
  const imageSources = images.map(image => {
    const origUrl = image && image[0] && image[0].url;
    const ext = path.extname(origUrl);
    const uri = `${
      useSSL ? 'https' : 'http'
    }://${authority}/_/onofood.co/Airtable/files/${md5(
      origUrl,
    ).toString()}${ext}`;
    return { uri };
  });
  await loadImages(imageSources);
}

export default AirtableImage;
