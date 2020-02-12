/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  projectRoot: path.resolve(__dirname, '../../'),
  resolver: {
    platforms: ['ios', 'android', 'server', 'browser'],
    resolverMainFields: ['react-native', 'commonjs', 'main'],
  },
  transformer: {
    // babelTransformerPath: require.resolve(
    //   'metro-react-native-babel-transformer',
    // ),
    // babelTransformerPath: require.resolve('../../transform-server-require'),
    getTransformOptions: async () => ({
      transform: {
        // envName: 'tezst',
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
