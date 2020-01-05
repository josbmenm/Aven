module.exports = function() {
  return {
    name: 'server-require-transform',
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name === 'require') {
          const requireVal = path.node.arguments[0].value;
          if (!requireVal.match(/^\./) && !requireVal.match(/^@aven-cloud/)) {
            path.node.callee.name = 'globalRequire';
          }
        }
      },
    },
  };
};
