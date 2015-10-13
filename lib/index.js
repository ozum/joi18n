/*jslint node: true, nomen: true */
var Hoek = require('hoek'),
    Path = require('path');



exports.register = function(server, options, next) {
    "use strict";
    var defaults = {
        directory       : __dirname + '/../locales',
        defaultLocale   : 'en_US',
        onEvent         : 'onPostAuth',
    };

    options = Hoek.applyToDefaults(defaults, options);

    server.ext(options.onEvent, function (request, reply) {
        var locale = request.server.plugins['hapi-locale'].getLocale(request, reply);
        try {
            request.route.settings.validate.options.language = require(Path.join(__dirname, '../locales/', locale + '.json'));
        } catch(err) {
            // Logging should be implemented.
        }

        reply.continue();
    });

    next();
};

exports.register.attributes = {
    pkg             : require('./../package.json'),
    dependencies    : ['hapi-locale']
};
