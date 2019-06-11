import React from 'react';
import Image, { loadImages } from './Image';

const md5 = require('crypto-js/md5');
const path = require('path');

export const HostContext = React.createContext();

export function HostContextContainer({ authority, useSSL, children }) {
  return (
    <HostContext.Provider value={{ authority, useSSL }}>
      {children}
    </HostContext.Provider>
  );
}

const AirtableImage = ({ image, style, resizeMode, tintColor }) => {
  const { authority, useSSL } = React.useContext(HostContext);
  const origUrl = image && image[0] && image[0].url;
  const ext = origUrl && path.extname(origUrl);
  const imageURI =
    ext &&
    `${
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

export function usePreloadedImages(loader, deps) {
  const { authority, useSSL } = React.useContext(HostContext);
  React.useEffect(() => {
    const images = loader();
    if (!images) return;
    preloadImages(images, authority, useSSL)
      .then(results => {})
      .catch(e => {
        console.warn('Images failed to preload.', e);
      });
  }, deps);
}

export async function preloadImages(images, authority, useSSL) {
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
