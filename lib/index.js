/*jslint node: true, nomen: true */
var Hoek = require("hoek"),
  Path = require("path");

function register(server, options) {
  "use strict";
  var defaults = {
    directory: __dirname + "/../locales",
    defaultLocale: "en_US",
    onEvent: "onPostAuth"
  };

  options = Hoek.applyToDefaults(defaults, options);

  server.ext(options.onEvent, function(request, h) {
    var locale = request.server.plugins["hapi-locale"].getLocale(request, h);
    try {
      request.route.settings.validate.options.language = require(Path.join(
        options.directory,
        locale + ".json"
      ));
    } catch (err) {
      // Logging should be implemented.
    }

    return h.continue;
  });
}

exports.plugin = {
  pkg: require("./../package.json"),
  dependencies: ["hapi-locale"],
  register
};
