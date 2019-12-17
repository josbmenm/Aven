// const withCustomBabelConfigFile = require('next-plugin-custom-babel-config');
// const withTranspileModules = require('next-transpile-modules');
// const path = require('path');

// const config = withTranspileModules(
//   withCustomBabelConfigFile({
//     babelConfigFile: path.resolve('./babel.config.js'),
//     transpileModules: ['@aven-cloud/dash'],
//   }),
// );

// config.resolve = config.resolve || {
//   extensions: [],
// };

// // Alias all `react-native` imports to `react-native-web`
// config.resolve.alias = {
//   ...(config.resolve.alias || {}),
//   'react-native$': 'react-native-web',
// };
// config.resolve.mainFields = ['src', 'react-native', 'main'];
// config.resolve.extensions.push('.web.js', '.web.ts', '.web.tsx');

// module.exports = config;

const { withExpo } = require('@expo/next-adapter');
const withImages = require('next-images');
const withFonts = require('next-fonts');
const withOffline = require('next-offline');

module.exports = withExpo(
  withOffline(
    withFonts(
      withImages({
        projectRoot: __dirname,
        workboxOpts: {
          swDest: 'workbox-service-worker.js',

          /* changing any value means you'll have to copy over all the defaults  */
          /* next-offline */
          globPatterns: ['static/**/*'],
          globDirectory: '.',
          runtimeCaching: [
            {
              urlPattern: /^https?.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'offlineCache',
                expiration: {
                  maxEntries: 200,
                },
              },
            },
          ],
        },
      }),
    ),
  ),
);
