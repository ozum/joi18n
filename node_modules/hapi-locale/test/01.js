/*jslint node: true, nomen: true */

var Lab     = require('lab'),
    Code    = require('code'),
    Hoek    = require('hoek'),
    path    = require('path'),
    rewire  = require('rewire'),
    module  = rewire('../lib/index.js');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var expect      = Code.expect;

var scan                = module.__get__('scan');
var getAvailableLocales = module.__get__('getAvailableLocales');
var defaultOptions      = module.__get__('defaultOptions');
var options             = Hoek.applyToDefaults(defaultOptions, {
    configFile: path.join(__dirname, 'config-files', 'config-default.json'),
    scan: {
        path: path.join(__dirname, 'locales')
    }
});


describe('scan', function() {
    "use strict";
    it('should scan files and directories', function(done) {
        expect(scan(options.scan)).to.deep.equal(['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
        done();
    });

    it('should scan only files', function(done) {
        var localOptions = Hoek.applyToDefaults(options, {
            scan: {
                path: path.join(__dirname, 'locales'),
                directories: false
            }
        });
        expect(scan(localOptions.scan)).to.deep.equal(['en', 'en_US', 'tr_TR' ]);
        done();
    })
});



describe('getAvailableLocales', function() {
    "use strict";
    it('should return for default config', function(done) {
        expect(getAvailableLocales(options)).to.deep.equal(["en_US", "tr_TR", "fr_FR"]);
        done();
    });

    it('should return for deep config', function(done) {
        var localOptions = Hoek.applyToDefaults(options, {
            configFile: path.join(__dirname, 'config-files', 'config-deep.json'),
            configKey: 'options.locales'
        });
        expect(getAvailableLocales(localOptions)).to.deep.equal(["en_US", "tr_TR"]);
        done();
    });

    it('should return for empty config', function(done) {
        var localOptions = Hoek.applyToDefaults(options, {
            configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
        });
        expect(getAvailableLocales(localOptions)).to.deep.equal(['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
        done();
    });

    it('should prioritize options', function(done) {
        expect(getAvailableLocales({locales: ['tr_TR']})).to.deep.equal(['tr_TR']);
        done();
    });
});