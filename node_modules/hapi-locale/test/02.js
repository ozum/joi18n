/*jslint node: true, nomen: true */

var Lab     = require('lab'),
    Code    = require('code'),
    Hoek    = require('hoek'),
    path    = require('path');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var expect      = Code.expect;

describe('hapi-locale with config file', function() {
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

    it('should determine language from query', function (done) {
        var options = {
            method: "GET",
            url: "/locale?lang=tr_TR"
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'tr_TR' });
            done();
        });
    });

    it('should determine language from parameter', function (done) {
        var options = {
            method: "GET",
            url: "/fr_FR/locale"
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal( { locale: 'fr_FR' });
            done();
        });
    });

    it('should determine language from header', function (done) {
        var options = {
            method: "GET",
            url: "/locale",
            headers: {
                "Accept-Language": "tr_TR"
            }
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'tr_TR' });
            done();
        });
    });

});



describe('hapi-locale with scan dir', function() {
    var plugins = [
        {
            register: require('../index.js'),
            options: {
                configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
                scan: {
                    path: path.join(__dirname, 'locales')
                }
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);


    "use strict";
    it('should determine language from query', function (done) {
        var options = {
            method: "GET",
            url: "/locale?lang=jp_JP"
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'jp_JP' });
            done();
        });
    });

    it('should determine language from parameter', function (done) {
        var options = {
            method: "GET",
            url: "/fr_FR/locale"
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'fr_FR' });
            done();
        });
    });

    it('should determine language from header', function (done) {
        var options = {
            method: "GET",
            url: "/locale",
            headers: {
                "accept-language": "tr_TR"
            }
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'tr_TR' });
            done();
        });
    });

});




describe('hapi-locale with options', function() {
    var plugins = [
        {
            register: require('../index.js'),
            options: {
                locales: ['fr_CA']
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);


    "use strict";
    it('should determine language from query', function (done) {
        var options = {
            method: "GET",
            url: "/locale?lang=fr_CA"
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'fr_CA' });
            done();
        });
    });
});


describe('hapi-locale with different order', function() {
    "use strict";
    var plugins = [
        {
            register: require('../index.js'),
            options: {
                order: ['query', 'params'],
                configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
                scan: {
                    path: path.join(__dirname, 'locales')
                }
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);

    it('should determine language from query', function (done) {
        var options = {
            method: "GET",
            url: "/tr_TR/locale?lang=fr_FR"
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'fr_FR' });
            done();
        });
    });


    it('should return default language', function (done) {
        var options = {
            method: "GET",
            url: "/tr_TR/locale?lang=NA_NA"
        };

        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'en' });
            done();
        });
    });

    it('should define setter', function (done) {
        var options = {
            method: "GET",
            url: "/getter-setter"
        };

        // Handler set locale as ru_RU.
        server.inject(options, function(response) {
            expect(response.result).to.deep.equal({ locale: 'ru_RU' });
            done();
        });
    });

    it('should throw 404', function (done) {
        var options = {
            method: "GET",
            url: "/NA_NA/locale"
        };

        server.inject(options, function(response) {
            expect(response.statusCode).to.equal(404);
            done();
        });
    });
});