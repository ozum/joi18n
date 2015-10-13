'use strict';

// Load modules

var Code = require('code');
var ESLint = require('eslint');
var Lab = require('lab');
var NoShadowRelaxed = require('../lib');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;
Code.settings.truncateMessages = false;

// Setup linter

internals.linter = ESLint.linter;
internals.linter.defineRule(NoShadowRelaxed.ruleName, NoShadowRelaxed);


describe('No-Shadow Relaxed', function () {

    it('reports warning when variable is shadowed', function (done) {

        var linterConfig = { rules: {} };
        linterConfig.rules[NoShadowRelaxed.ruleName] = 1;

        var invalids = [
            {
                code: "function a(x) { var b = function c() { var x = 'foo'; }; }",
                errors: [{
                    message: "x is already declared in the upper scope.",
                    nodeType: "Identifier",
                    line: 1,
                    column: 43
                }]
            },
            {
                code: "var a=3; function b() { var a=10; var b=0; }; setTimeout(function() { b(); }, 0);",
                errors: [{
                    message: "a is already declared in the upper scope.",
                    nodeType: "Identifier"
                },
                {
                    message: "b is already declared in the upper scope.",
                    nodeType: "Identifier"
                }]
            }
        ];

        invalids.forEach(function (invalid) {

            var result = internals.linter.verify(invalid.code, linterConfig);

            expect(result).to.be.an.array();
            expect(result.length).to.equal(invalid.errors.length);

            for (var i = 0, il = result.length; i < il; ++i) {
                var error = invalid.errors[i];

                var errorKeys = Object.keys(error);
                errorKeys.forEach(function (errorKey) {

                    expect(result[i][errorKey]).to.equal(error[errorKey]);
                })
            }
        });

        done();
    });

    it('reports warning when variable is shadowed and ignore option is null', function (done) {

        var linterConfig = { rules: {} };
        linterConfig.rules[NoShadowRelaxed.ruleName] = [1, { ignore: null }];

        var invalids = [
            {
                code: "function a(x) { var b = function c() { var x = 'foo'; }; }",
                errors: [{
                    message: "x is already declared in the upper scope.",
                    nodeType: "Identifier",
                    line: 1,
                    column: 43
                }]
            },
            {
                code: "var a=3; function b() { var a=10; var b=0; }; setTimeout(function() { b(); }, 0);",
                errors: [{
                    message: "a is already declared in the upper scope.",
                    nodeType: "Identifier"
                },
                {
                    message: "b is already declared in the upper scope.",
                    nodeType: "Identifier"
                }]
            }
        ];

        invalids.forEach(function (invalid) {

            var result = internals.linter.verify(invalid.code, linterConfig);

            expect(result).to.be.an.array();
            expect(result.length).to.equal(invalid.errors.length);

            for (var i = 0, il = result.length; i < il; ++i) {
                var error = invalid.errors[i];

                var errorKeys = Object.keys(error);
                errorKeys.forEach(function (errorKey) {

                    expect(result[i][errorKey]).to.equal(error[errorKey]);
                })
            }
        });

        done();
    });

    it('doesn\'t report warning when variable is shadowed and allowed by configuration', function (done) {

        var linterConfig = { rules: {} };
        linterConfig.rules[NoShadowRelaxed.ruleName] = [1, { ignore: ['a', 'b', 'x'] }];

        var invalids = [
            {
                code: "function a(x) { var b = function c() { var x = 'foo'; }; }"
            },
            {
                code: "var a=3; function b() { var a=10; var b=0; }; setTimeout(function() { b(); }, 0);"
            }
        ];

        invalids.forEach(function (invalid) {

            var result = internals.linter.verify(invalid.code, linterConfig);

            expect(result).to.be.an.array();
            expect(result.length).to.equal(0);
        });

        done();
    });

    it('does report warning on variable that can\'t be shadowed', function (done) {

        var linterConfig = { rules: {} };
        linterConfig.rules[NoShadowRelaxed.ruleName] = [1, { ignore: ['a'] }];

        var invalids = [{
                code: "var a=3; function b() { var a=10; var b=0; }; setTimeout(function() { b(); }, 0);"
            }
        ];

        invalids.forEach(function (invalid) {

            var result = internals.linter.verify(invalid.code, linterConfig);

            expect(result).to.be.an.array();
            expect(result.length).to.equal(1);
        });

        done();
    });
});
