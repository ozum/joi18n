'use strict';
var Fs = require('fs');
var Path = require('path');
var Code = require('code');
var ESLint = require('eslint');
var Lab = require('lab');
var Config = require('../lib');
var CLIEngine = ESLint.CLIEngine;

// Test shortcuts
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

Code.settings.truncateMessages = false;

function getLinter() {
  return new CLIEngine({
    useEslintrc: false,
    baseConfig: Config
  });
}

function lintFile(file) {
  var cli = getLinter();
  var data = Fs.readFileSync(Path.join(__dirname, file), 'utf8');

  return cli.executeOnText(data);
}

function lintString(str) {
  var cli = getLinter();

  return cli.executeOnText(str);
}

describe('eslint-config-hapi', function () {
  it('enforces four space indentation', function (done) {
    var output = lintFile('fixtures/indent.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 4 space characters but found 2.');
    expect(msg.line).to.equal(3);
    expect(msg.column).to.equal(3);
    expect(msg.nodeType).to.equal('ReturnStatement');
    expect(msg.source).to.equal('  return value + 1;');
    done();
  });

  it('enforces case indentation in switch statements', function (done) {
    var output = lintFile('fixtures/indent-switch-case.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(5);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(5);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 4 space characters but found 0.');
    expect(msg.line).to.equal(9);
    expect(msg.column).to.equal(1);
    expect(msg.nodeType).to.equal('SwitchCase');
    expect(msg.source).to.equal('case \'bar\':');

    msg = results.messages[1];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(10);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('ExpressionStatement');
    expect(msg.source).to.equal('    result = 2;');

    msg = results.messages[2];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(11);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('BreakStatement');
    expect(msg.source).to.equal('    break;');

    msg = results.messages[3];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(13);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('ExpressionStatement');
    expect(msg.source).to.equal('    result = 3;');

    msg = results.messages[4];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(14);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('BreakStatement');
    expect(msg.source).to.equal('    break;');

    done();
  });

  it('enforces semicolon usage', function (done) {
    var output = lintFile('fixtures/semi.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('semi');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Missing semicolon.');
    expect(msg.line).to.equal(3);
    expect(msg.column).to.equal(14);
    expect(msg.nodeType).to.equal('ReturnStatement');
    expect(msg.source).to.equal('    return 42');
    done();
  });

  it('enforces hapi/hapi-scope-start', function (done) {
    var output = lintFile('fixtures/hapi-scope-start.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('hapi/hapi-scope-start');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('Missing blank line at beginning of function.');
    expect(msg.line).to.equal(1);
    expect(msg.column).to.equal(11);
    expect(msg.nodeType).to.equal('FunctionExpression');
    expect(msg.source).to.equal('var foo = function () {');
    done();
  });

  it('enforces hapi/no-shadow-relaxed', function (done) {
    var output = lintFile('fixtures/no-shadow-relaxed.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('hapi/no-shadow-relaxed');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('res is already declared in the upper scope.');
    expect(msg.line).to.equal(27);
    expect(msg.column).to.equal(31);
    expect(msg.nodeType).to.equal('Identifier');
    expect(msg.source).to.equal('        var inner = function (res) {');
    done();
  });

  it('enforces no-unused-vars', function (done) {
    var output = lintFile('fixtures/no-unused-vars.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('no-unused-vars');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('"internals2" is defined but never used');
    expect(msg.line).to.equal(2);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('Identifier');
    expect(msg.source).to.equal('var internals2 = {};');
    done();
  });

  it('uses the node environment', function (done) {
    var output = lintFile('fixtures/node-env.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(0);
    expect(results.messages).to.deep.equal([]);
    done();
  });

  it('uses the ES6 environment', function (done) {
    // Do this as a string to prevent problems during testing on old versions of Node
    var output = lintString('module.exports = `__filename = ${__filename}`;\n');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(0);
    expect(results.messages).to.deep.equal([]);
    done();
  });

  it('does not enforce the camelcase lint rule', function (done) {
    var output = lintFile('fixtures/camelcase.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(0);
    expect(results.messages).to.deep.equal([]);
    done();
  });
});
