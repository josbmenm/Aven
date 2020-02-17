import React from 'react';
import { Image } from '@rn';
import { getAssetByID } from 'react-native-web/dist/cjs/modules/AssetRegistry';

export default function WebImage({ source, ...props }) {
  let finalSource = source;
  if (typeof source === 'number') {
    const asset = getAssetByID(source);
    const uriSource = {
      uri: `http://localhost:8081${asset.httpServerLocation}/${asset.name}.${asset.type}`,
    };
    finalSource = uriSource;
  }
  return <Image source={finalSource} {...props} />;
}
