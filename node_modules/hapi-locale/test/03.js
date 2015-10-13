/*jslint node: true, nomen: true */
/*global describe, it, before, beforeEach, after, afterEach */

var Lab     = require('lab'),
    Code    = require('code'),
    Hoek    = require('hoek'),
    path    = require('path');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var expect      = Code.expect;

describe('hapi-locale', function() {
    "use strict";

    var plugins = [
        {
            register: require('../index.js'),
            options: {
                configFile: path.join(__dirname, 'config-files', 'config-default.json'),
                scan: {
                    path: path.join(__dirname, 'locales')
                }
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);

    it('should expose functions', function (done) {
        var options = {
            method: "GET",
            url: "/exposed?lang=tr_TR"
        };

        server.inject(options, function (response) {
            expect(response.result).to.deep.equal({
                getLocales: ['en_US', 'tr_TR', 'fr_FR'],
                getLocale: 'tr_TR',
                getDefaultLocale: 'en_US',
            });
            done();
        });
    });
});

describe('hapi-locale', function() {
        "use strict";

    var plugins = [
        {
            register: require('../index.js'),
            options: {
                configFile: path.join(__dirname, 'config-files', 'config-default.json'),
                scan: {
                    path: path.join(__dirname, 'locales')
                },
                createGetterOn: null,
                createSetterOn: null,
                callback: null
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);

    it('should expose function without poolluting request object', function (done) {
        var options = {
            method: "GET",
            url: "/exposed?lang=tr_TR",
        };

        server.inject(options, function (response) {
            expect(response.result).to.deep.equal(response.result, {
                getLocales: [ 'en_US', 'tr_TR', 'fr_FR' ],
                getLocale: 'tr_TR',
                getDefaultLocale: 'en_US',
            });
            done();
        });
    });

    it('should return undef for wrong locale', function (done) {
        var options = {
            method: "GET",
            url: "/NA_NA/exposed",
        };

        server.inject(options, function (response) {
            expect(response.result.getLocale).to.equal(undefined);
            done();
        });
    });
});