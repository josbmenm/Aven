const AssetRegistry = require('react-native-web/dist/cjs/modules/AssetRegistry');

if (window.rnAssets) {
  window.rnAssets.forEach(AssetRegistry.registerAsset);
}
