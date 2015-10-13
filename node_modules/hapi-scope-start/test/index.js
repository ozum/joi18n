'use strict';

var Code = require('code');
var ESLint = require('eslint');
var Lab = require('lab');
var HapiScopeStart = require('../lib');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;
var RuleTester = ESLint.RuleTester;

Code.settings.truncateMessages = false;

describe('ESLint Rule', function() {
  it('reports warning when function body does not begin with a blank line', function(done) {
    var ruleTester = new RuleTester();
    var fns = [
      function fn() {
        return;
      },
      function fn(foo, bar, baz) {
        var fizz = 1;
      },
      function fn(foo)

      {
          return 'foo';
      },
      function fn() {/*test*/
        return;
      },
      function fn() { return; },
      function fn(foo, bar, baz) { return; }
    ];

    ruleTester.run(HapiScopeStart.esLintRuleName, HapiScopeStart, {
      valid: [],
      invalid: fns.map(function(fn) {
        return {
          code: fn.toString(),
          errors: [{message: 'Missing blank line at beginning of function.'}]
        };
      })
    });
    done();
  });

  it('does not report anything when function body begins with a blank line', function(done) {
    var ruleTester = new RuleTester();
    var fns = [
      function fn() {

        return;
      },
      function fn(foo, bar, baz) {

        var fizz = 1;
      },
      function fn(foo)
      {

          return 'foo';
      },
      function fn() {/*test*/

        return;
      }
    ];

    ruleTester.run(HapiScopeStart.esLintRuleName, HapiScopeStart, {
      valid: fns.map(function(fn) {
        return {code: fn.toString()};
      }),
      invalid: []
    });
    done();
  });

  it('does not report anything when function is one line and allow-one-liners is set', function(done) {
    var ruleTester = new RuleTester();
    var fns = [
      function fn() { return; },
      function fn(foo, bar, baz) { return; }
    ];

    ruleTester.run(HapiScopeStart.esLintRuleName, HapiScopeStart, {
      valid: fns.map(function(fn) {
        return {
          code: fn.toString(),
          options: ['allow-one-liners']
        };
      }),
      invalid: []
    });
    done();
  });

  it('reports an error when function is allow-one-liners is set but function body contains too many statements', function(done) {
    var ruleTester = new RuleTester();
    var fns = [
      function fn() { var i = 0; i++; return; },
    ];

    ruleTester.run(HapiScopeStart.esLintRuleName, HapiScopeStart, {
      valid: [],
      invalid: fns.map(function(fn) {
        return {
          code: fn.toString(),
          options: ['allow-one-liners', 2],
          errors: [{message: 'Missing blank line at beginning of function.'}]
        };
      })
    });
    done();
  });

  it('allow-one-liners defaults to 1', function(done) {
    var ruleTester = new RuleTester();
    var fns = [
      function fn() { console.log('broken'); return; },
    ];

    ruleTester.run(HapiScopeStart.esLintRuleName, HapiScopeStart, {
      valid: [],
      invalid: fns.map(function(fn) {
        return {
          code: fn.toString(),
          options: ['allow-one-liners'],
          errors: [{message: 'Missing blank line at beginning of function.'}]
        };
      })
    });
    done();
  });

  it('does not report anything when function body is empty', function(done) {
    var ruleTester = new RuleTester();
    var fns = [
      function fn() {},
      function fn(foo, bar, baz) {},
      function fn(foo){

      },
      function fn() {/*test*/}
    ];

    ruleTester.run(HapiScopeStart.esLintRuleName, HapiScopeStart, {
      valid: fns.map(function(fn) {
        return {code: fn.toString()};
      }),
      invalid: []
    });
    done();
  });

  it('handles function expressions', function(done) {
    var ruleTester = new RuleTester();
    var fnExpr = 'var foo = ' + function() {

      return;
    }.toString();

    ruleTester.run(HapiScopeStart.esLintRuleName, HapiScopeStart, {
      valid: [{code: fnExpr}],
      invalid: []
    });
    done();
  });
});
