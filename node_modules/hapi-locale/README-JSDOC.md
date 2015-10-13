hapi-locale
===========
Configurable plugin for determine request language in hapi.js applications.

**This module is in alpha version. Incompatible changes may happen in future versions. Providing options explicitly and not using default values may be a wise choice**

Description
===========
This plugin determines requested loclale and optionally adds functions to request object to get it. Examines incoming request by looking several criteria of the request. Every aspect of the plugin can be configured with options. Sensible defaults are tried to be provided.

It is also possible to prevent adding functions to request not to pollute request object. In this case hapi exposed functions can be used.

Synopsis
========

Create server

    ...
    var plugins = ['hapi-locale']
    ...
    server.register(plugins, function (err) {
        if (err) throw err;
        server.start(function () {
            console.log('Server started at: ' + server.info.uri);
        });
    });
    
In handlers:

    var locale = request.i18n.getLocale();


WHY
===
It is easy to determine locale in hapi.js. So why is this plugin wirtten? We construct hapi applications from modules and most of them deal with i18n or i18n related stuff. We are tired of writing repetitive code for every application and some modules and decided to export this functionality as a hapi plugin.

Also we make it tested and documented.

Options
=======
Please see all options below in hapiLocale~PluginOptions in API section 

How it works
============
The workflow of the plugin is as below:

Plugin

1. Determines which locales are available in application. This happens one time during plugin registration.
2. Tries to find which locale is prefered looking incoming request. This and other steps below happen in every request. Event for this step is configured by `options.onEvent` 
3. Matches requested locale with available locales. If no match is found uses default locale or throws 404 according to options. 
4. (Optional) Adds getter and setter methods in request object: `request.i18n.getLocale` and `request.i18n.setLocale`.
5. Callback is called.


### 1. Available locales

Available locales are determined with methods in the following order. If one of the methods succeeds no other methods are tried. One or more steps may be cancelled via `options`. Available locales are searched one time during plugin registration.

Plugin
 
1. Looks locales in plugin options `options.locales`.
2. Looks `package.json` or other json file set by `options.configFile` and `options.configKey`. Key may be set with nested format such as 'pref.of.my.app.locales'.
3. Scans path given by `options.scan.path` excluding files and directories given by `options.path.exclude`.


### 2. Requested locale(s)

One or more locale may be preferred in requests. To determine most wanted locale for every request following steps are taken in order set by `options.order`. One or more steps may be cancelled via setting null in related `options` or in `order`.

Plugin (in default order, which can be changed from `options.order`)

1. Looks path paramater such as `{lang}/member` for `/en_US/member`. Path parameter name can be set via `options.nameOf.param`.
2. Looks cookie. Cookie name can be set via `options.nameOf.cookie`, cookie key to look in cookie can be set `options.nameOf.cookieKey`.
3. Looks query paramater such as `/member?lang=en_US`. Query parameter name can be set via `options.nameOf.query`.
4. Looks `accept-language` header of request. Header name can be set via `options.nameOf.header`.


### 3. Match Requested locale

Plugin tries to find first preferred locale which is available in application:

1. If a match is found, locale is determined.
2. If no match is found plugin either throws 404 if `options.throw404` set true. If path parameter (url) is wrong, it always throws 404 overriding `options.throw404`
3. If no 404 is thrown, default locale is used as a result. Default locale may set via `options.default`, otherwise first available locale is used as default.


### 4. Getter and Setter Methods

Plugin uses getter and setter methods. It creates them if `options.createAccessorsIfNotExists` is true and they do not exist. Name of the methods are set via `options.getter` and `options.setter` options. Default values are `i18n.getLocale` and `i18n.setLocale`.


### 5. Callback is called

Callback is called with locale name as only parameter. Callback name is configured via `options.callback`. If callback name is given as a function reference, it is called directly. If it is given as string it is called as a chained method of request object. Default is "i18n.setLocale" which results as `request.i18n.setLocale`. It is possible to use a chained method name such as "i18n.setLocale" which results as `request.i18n.setLocale`.

Order & Prioritization
========================
By default this plugin looks URL Part (`request.params`), Cookie (`request.state`), Query String (`request.query`), Header (`request.headers`) in this order: 'params', 'cookie', 'query', 'headers'. If you wish to change this order you can set it with `options.order` array.  

Event Times
===========
Available locales are determined one time during server start plugin registration. Per request operations happens on event set by `options.onEvent`.

Exposed Functions & Attributes
==============================
This plugin exposes some functions and attributes using server.expose mechanism of hapi.js. They are documented under API section's exposed part. See there for details.

    // This function may be used to access requested locale manually without polluting request object.
    var locale  = request.server.plugins['hapi-locale'].getLocale(request, reply); // 'tr_TR'
        
    var locales = request.server.plugins['hapi-locale'].getLocales();   // ['tr_TR', 'en_US'] etc.
    
Examples
========

### Use with default options: 

    var server  = new hapi.Server(),
        path    = require('path');

    server.connection({
        host: 'localhost',
        port: 8080
    });

    var plugins = ['hapi-locale']

    server.route([
        {
            path: "/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        },
        {
            path: "/{lang}/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        }
    ]);


    server.register(plugins, function (err) {
        if (err) throw err;
        server.start(function () {
            console.log('Server started at: ' + server.info.uri);
        });
    });

### Providing options

    var server  = new hapi.Server(),
        path    = require('path');

    server.connection({
        host: 'localhost',
        port: 8080
    });

    var rootDir = __dirname;

    // Those are also default options:
    var plugins = [
        {
            register: 'hapi-locale',
            options: {
                 locales             : [],
                 default             : null,
                 configFile          : path.join(rootDir, 'package.json'),
                 configKey           : 'locales',
                 scan                : {
                     path        : path.join(rootDir, 'locales'),
                     fileType    : 'json',
                     directories : true,
                     exclude     : ['templates', 'template.json']
                 },
                 nameOf              : {
                     param       : 'lang',
                     query       : 'lang',
                     cookie      : 'lang',
                     cookieKey   : 'lang',
                     header      : 'accept-language'
                 },
                 order           : ['params', 'cookie', 'query', 'headers'],
                 throw404        : false,
                 getter          : 'i18n.getLocale',
                 setter          : 'i18n.setLocale',
                 createAccessorsIfNotExists: true,
                 callback            : 'i18n.setLocale',
                 onEvent             : 'onPreAuth'
             }
        }
    ];

    server.route([
        {
            path: "/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        },
        {
            path: "/{lang}/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        }
    ]);


    server.register(plugins, function (err) {
        if (err) throw err;
        server.start(function () {
            console.log('Server started at: ' + server.info.uri);
        });
    });


### Routes

| **ROUTE**           | **REQUEST**                   | **HEADER**                | **LOCALE**      | **REASON (Default Config)**
|---------------------|-------------------------------|---------------------------|-----------------|-----------------------|
| /{lang}/account     | GET /en_US/account            |                           | en_US           | Path                  |
| /{lang}/account     | GET /tr_TR/account?lang=fr_FR | accept-language=jp_JP     | tr_TR           | Path has more priority|
| /api/{lang}/account | GET api/en_US/account         |                           | en_US           | Path                  |
| /account            | GET /account?lang=en_US       |                           | en_US           | Query                 |
| /api/account        | GET api/account?lang=en_US    |                           | en_US           | Query                 |
| /account            | GET /account                  | accept-language=en_US     | en_US           | Header                |
| /{lang}/account     | GET /nonsense/account         |                           | *404*           | Not found URL         |
| /account            | GET account?lang=nonsense     |                           | *Default Locale*| Not found URL         |


API
===

