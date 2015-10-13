'use strict';
module.exports = function(context) {
  var message = 'Imported module variable name not capitalized.';
  var globalScopeOnly = context.options[0] === 'global-scope-only';


  function isCapitalized(name) {
    var firstChar = name.charAt(0);

    return firstChar === firstChar.toUpperCase();
  }


  function isRequire(node) {
    return node !== null &&
           node.type === 'CallExpression' &&
           node.callee.type === 'Identifier' &&
           node.callee.name === 'require';
  }


  function check(node) {
    if (globalScopeOnly === true && context.getScope().type !== 'global') {
      return;
    }

    if (node.type === 'VariableDeclarator' &&
        isRequire(node.init) &&
        !isCapitalized(node.id.name)) {
        context.report(node, message);
    } else if (node.type === 'AssignmentExpression' &&
               isRequire(node.right) &&
               node.left.type === 'Identifier' &&
               !isCapitalized(node.left.name)) {
        context.report(node, message);
    }
  }


  return {
    AssignmentExpression: check,
    VariableDeclarator: check
  };
};


module.exports.esLintRuleName = 'hapi-capitalize-modules';
