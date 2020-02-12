function isTargetWeb(caller) {
  console.log(caller.name);
  return caller && caller.name === 'babel-loader';
}
module.exports = function(api) {
  const isWeb = api.caller(isTargetWeb);
  api.env(envName => {
    console.log({ envName });
    return true;
  });
  console.log({ isWeb });
  return {
    name: 'transform-server-require',
    visitor: {
      CallExpression(path, ...args) {
        // console.log('Zoom', path, args);
        // console.log('.');
        // if (path.node.callee.name === 'require') {
        //   const requireVal = path.node.arguments[0].value;
        //   if (
        //     !requireVal.match(/^\./) &&
        //     !requireVal.match(/^@aven/) &&
        //     // bad shit?:
        //     !requireVal.match(/^@babel/) &&
        //     requireVal !== 'react'
        //   ) {
        //     path.node.callee.name = 'globalRequire';
        //   }
        // }
      },
    },
  };
};
