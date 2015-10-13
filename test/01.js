/*jslint node:true */

var hapi    = require('hapi'),
    Joi     = require('joi'),
    Lab     = require('lab'),
    Code    = require('code');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var expect      = Code.expect;

var server = new hapi.Server();
var plugins = [
    {register: require('hapi-locale')},
    {register: require('../index.js')}
];

server.connection();

server.route([
    {
        path: "/{lang}/{age}/{no}/joi18n",
        method: "GET",
        handler: function (request, reply) {
            "use strict";
            reply({ locale: request.i18n.getLocale() });
        },
        config: {
            validate: {
                params: {
                    lang: Joi.string(),
                    age: Joi.number(),
                    no: Joi.number()
                },
                failAction: function (request, reply, source, error) {
                    reply(error);
                },
                options: {
                    abortEarly: false
                }
            },
        }
    }
]);


server.register(plugins, function (err) {
    "use strict";
    if (err) { throw err; }
});


describe('joi18n', function() {
    "use strict";
    it('should return localized error.', function (done) {
        var options = {
            method: "GET",
            url: "/tr_TR/1a/1/joi18n"
        };

        server.inject(options, function (response) {
            expect(response.result.message).to.contain('sayı olmalı');
            done();
        });
    });
});