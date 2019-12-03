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
  // resolver: {
  //   blacklistRE: blacklist([
  //     /\/admin\/.*/,
  //     /\/aven-io\/.*/,
  //     /\/aven-web\/.*/,
  //     /\/cloud-auth\/.*/,
  //     /\/cloud-auth-email\/.*/,
  //     /\/cloud-auth-message\/.*/,
  //     /\/cloud-auth-root\/.*/,
  //     /\/cloud-auth-sms\/.*/,
  //     /\/cloud-browser\/.*/,
  //     /\/cloud-core\/.*/,
  //     /\/cloud-fs\/.*/,
  //     /\/cloud-native\/.*/,
  //     /\/cloud-network\/.*/,
  //     /\/cloud-postgres\/.*/,
  //     /\/cloud-react\/.*/,
  //     /\/cloud-schema\/.*/,
  //     /\/cloud-server\/.*/,
  //     /\/cloud-utils\/.*/,
  //     /\/dashboard\/.*/,
  //     /\/debug-views\/.*/,
  //     /\/email-agent-sendgrid\/.*/,
  //     /\/logger\/.*/,
  //     /\/navigation-core\/.*/,
  //     /\/navigation-fade-navigator\/.*/,
  //     /\/navigation-hooks\/.*/,
  //     /\/navigation-stack\/.*/,
  //     /\/navigation-transitioner\/.*/,
  //     /\/navigation-web\/.*/,
  //     /\/playground-auth\/.*/,
  //     /\/playground-expo\/.*/,
  //     /\/playground-web\/.*/,
  //     /\/react-utils\/.*/,
  //     /\/runway\/.*/,
  //     /\/sms-agent-twilio\/.*/,
  //     /\/todo-app\/.*/,
  //     /\/todo-native\/.*/,
  //     /\/utils\/.*/,
  //     /\/views\/.*/,
  //   ]),
  // },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
