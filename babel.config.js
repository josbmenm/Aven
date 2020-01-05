const fs = require('fs');
fs.writeFileSync('/Users/demo/procenv.json', JSON.stringify(process.env));
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['./transform-server-require.js'],
};
