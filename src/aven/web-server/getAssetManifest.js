import fetch from 'node-fetch';
import fs from 'fs-extra';

const path = require('path');

const staticManifest =
  process.env.NODE_ENV === 'development'
    ? null
    : JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../AssetManifest.json')),
      );

const assetManifestURL =
  'http://localhost:8081/src/aven/wing-web/WingWebClient.js.assets?platform=web';

async function fetchManifest() {
  const result = await fetch(assetManifestURL).then(res => res.json());
  return result;
}

let manifestRequest = null;
let resolvedManifest = null;

export default async function getAssetManifest() {
  if (staticManifest) {
    return staticManifest;
  }
  if (resolvedManifest) {
    return resolvedManifest;
  }
  if (manifestRequest) {
    return await manifestRequest;
  }
  manifestRequest = fetchManifest();
  const result = await manifestRequest;
  resolvedManifest = result;
  return result;
}
