'use strict';
var HapiCapitalizeModules = require('hapi-capitalize-modules');
var HapiScopeStart = require('hapi-scope-start');
var NoShadowRelaxed = require('no-shadow-relaxed');


module.exports = {
  rules: {
    'hapi-capitalize-modules': HapiCapitalizeModules,
    'hapi-scope-start': HapiScopeStart,
    'no-shadow-relaxed': NoShadowRelaxed
  }
};
