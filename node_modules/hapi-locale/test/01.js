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

var Internal            = module.__get__('Internal');



var options = {
    configFile: path.join(__dirname, 'config-files', 'config-default.json'),
    scan: {
        path: path.join(__dirname, 'locales')
    }
};
var internal = new Internal(options);



describe('scan', function() {
    "use strict";
    it('should scan files and directories', function(done) {
        expect(internal.scan()).to.deep.equal(['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
        done();
    });

    it('should scan only files', function(done) {
        var localOptions = Hoek.applyToDefaults(options, {
            scan: {
                path: path.join(__dirname, 'locales'),
                directories: false
            }
        });
        var internal = new Internal(localOptions);

        expect(internal.scan()).to.deep.equal(['en', 'en_US', 'tr_TR' ]);
        done();
    })
});



describe('getAvailableLocales', function() {
    "use strict";
    it('should return for default config', function(done) {
        expect(internal.getAvailableLocales()).to.deep.equal(["en_US", "tr_TR", "fr_FR"]);
        done();
    });

    it('should return for deep config', function(done) {
        var localOptions = Hoek.applyToDefaults(options, {
            configFile: path.join(__dirname, 'config-files', 'config-deep.json'),
            configKey: 'options.locales'
        });
        var internal = new Internal(localOptions);
        expect(internal.getAvailableLocales()).to.deep.equal(["en_US", "tr_TR"]);
        done();
    });

    it('should return for empty config', function(done) {
        var localOptions = Hoek.applyToDefaults(options, {
            configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
        });
        var internal = new Internal(localOptions);
        expect(internal.getAvailableLocales()).to.deep.equal(['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
        done();
    });

    it('should prioritize options', function(done) {
        var localOptions = Hoek.applyToDefaults(options, {
            locales: ['tr_TR']
        });
        var internal = new Internal(localOptions);
        expect(internal.getAvailableLocales()).to.deep.equal(['tr_TR']);
        done();
    });
});