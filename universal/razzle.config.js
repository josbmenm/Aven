'use strict';

module.exports = {
  modifyBabelOptions: options => ({
    ...options,
    babelrc: false,
    plugins: [require('babel-plugin-react-native-web')],
    presets: [require('babel-preset-razzle')],
  }),
  // modify: webpack => {
  //   const rules = webpack.module.rules.map(r => {
  //     // if (
  //     //   r.include &&
  //     //   r.use &&
  //     //   r.use[0] &&
  //     //   r.use[0].loader &&
  //     //   r.use[0].loader.match(/babel-loader/)
  //     // ) {
  //     //   return {
  //     //     ...r,
  //     //     include: [...r.include, 'node_modules/react-native-web'],
  //     //   };
  //     // }
  //     return r;
  //   });
  //   // console.log(rules);
  //   return {
  //     ...webpack,
  //     module: {
  //       ...webpack.module,
  //       rules,
  //     },
  //     resolve: {
  //       ...webpack.resolve,
  //       mainFields: ['browser', 'module', 'main'],
  //       // modules: [...webpack.resolve.modules, 'node_modules/react-native-web'],
  //     },
  //   };
  // },
};
