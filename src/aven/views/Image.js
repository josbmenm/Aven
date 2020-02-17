import React from 'react';
import { Image } from '@rn';
import { getAssetManifest } from '@aven/web-server';

const assetHashLookup = {};
getAssetManifest().then(assets => {
  assets.forEach(asset => {
    assetHashLookup[asset.hash] = asset;
  });
});
// this is the SERVER implementation of Image
export default function WebImage({ source, ...props }) {
  const sourceMatch = source.match(/\/([^\/.]*)\.(.*)/);
  if (!sourceMatch) {
    return null;
  }
  const hash = sourceMatch[1];
  const asset = assetHashLookup[hash];
  if (!asset) {
    return null;
  }
  const { httpServerLocation, name, type } = asset;
  return (
    <Image
      source={{ uri: `${httpServerLocation}/${name}.${type}` }}
      {...props}
    />
  );
}
