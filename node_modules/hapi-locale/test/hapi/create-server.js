var hapi        = require('hapi'),
    rewire      = require('rewire'),
    plugin      = rewire('../../lib/index.js'),
    lodash      = require('lodash');

var defaultOptions  = plugin.__get__('defaultOptions'),
    getter          = defaultOptions.getter,
    setter          = defaultOptions.setter;



module.exports = function defineRoutes(plugins) {
    "use strict";
    var server = new hapi.Server();

    server.connection({
        host: 'localhost',
        port: 8080
    });

    server.route([
        {
            path: "/locale",
            method: "GET",
            handler: function(request, reply) {
                var getLocale = lodash.get(request, getter);
                reply({ locale: getLocale() });
            }
        },
        {
            path: "/{lang}/locale",
            method: "GET",
            handler: function(request, reply) {
                var getLocale = lodash.get(request, getter);
                reply({ locale: getLocale() });
            }
        },
        {
            path: "/getter-setter",
            method: "GET",
            handler: function(request, reply) {
                var getLocale = lodash.get(request, getter);
                var setLocale = lodash.get(request, setter);
                setLocale('ru_RU');
                reply({
                    locale: getLocale()
                });
            }
        },
        {
            path: "/exposed",
            method: "GET",
            handler: function(request, reply) {
                var plugin = request.server.plugins['hapi-locale'];
                return reply({
                    getLocales: plugin.getLocales(),
                    getLocale: plugin.getLocale(request, reply),
                    getDefaultLocale: plugin.getDefaultLocale()
                });

            }
        },
        {
            path: "/{lang}/exposed",
            method: "GET",
            handler: function(request, reply) {
                var plugin = request.server.plugins['hapi-locale'];
                return reply({
                    getLocales: plugin.getLocales(),
                    getLocale: plugin.getLocale(request, reply),
                    getDefaultLocale: plugin.getDefaultLocale()
                });

            }
        }
    ]);


    server.register(plugins, function (err) {
        if (err) throw err;
        if (!module.parent) {
            server.start(function () {
                console.log('Server started at: ' + server.info.uri);
            });
        }
    });

    return server;
};