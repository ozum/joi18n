hapi-locale
===========
Configurable plugin to determine request language in hapi.js applications.

Description
===========
This plugin determines requested loclale by looking followings: (Order can be changed or skipped via `options.order`)

* URL parameter,
* Cookie,
* Query parameter,
* HTTP header.

Optionally creates getter and setters or uses already available ones in request. Calls setter method with requested locale. Also provide plugin methods such as `server.plugins['hapi-locale'].getLocale()`;

Nearly every aspect of the plugin can be configured with options. Sensible defaults are tried to be provided.

Synopsis
========

Create server

    ...
    var plugins = [{ 
        register: 'hapi-locale'
        options: {
            createAccessors: true,
            getter: 'i18n.getLocale',
            setter: 'i18n.setLocale'
        }
    }]
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
It is easy to determine locale in hapi.js. So why is this plugin wirtten? We are tired of writing repetitive code for every application/module and decided to export this functionality as a hapi plugin.

Also we make it tested and documented.

Most Important Options:
=======================

The options below are most important ones, because they change/write to request object and may cause undesirable results if configured unsutiable to your needs.   

| Option            | Default Value  | Description
|-------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `createAccessors` | true           | Enables creating getter and setter methods in request object. If set to false it is assumed getter and setter methods are already available. |
| `getter`          | i18n.getLocale | Getter method in request object to get current locale. (Created if `options.createAccessors` is true.                                        |
| `setter`          | i18n.setLocale | Setter method in request object to set current locale. (Created if `options.createAccessors` is true.                                        |
| `attribute`       | i18n.locale    | Key in request object which will be used to store locale name. (Created if `options.createAccessors` is true.                                |

Please see all options below in hapiLocale~PluginOptions in API section 

How it works
============
The workflow of the plugin is as below:

Plugin

1. Determines which locales are available in application. This happens one time during plugin registration.
2. Tries to find which locale is prefered looking incoming request. This and other steps below happen in every request. Event for this step is configured by `options.onEvent` 
3. Matches requested locale with available locales. If no match is found:
        a. If `options.throw404` is true and URL param has a locale which is not available. 
        b. Sets default locale.
4. (Optional) Adds getter and setter methods in request object. By deafult `request.i18n.getLocale` and `request.i18n.setLocale`.
5. Setter is called.


### 1. Available locales

Available locales are determined with methods in the following order. If one of the methods succeeds no other methods are tried. One or more steps may be cancelled via `options`. Available locales are searched one time during plugin registration.

Plugin
 
1. Looks locales in plugin options `options.locales`. Set empty `[]` to skip.
2. Looks `package.json` or other json file set by `options.configFile` and `options.configKey`. Key may be set with nested format such as 'pref.of.my.app.locales'. Set `null` to skip.
3. Scans path given by `options.scan.path` excluding files and directories given by `options.path.exclude`. Set `null` to skip.


### 2. Requested locale(s)

One or more locale may be preferred in requests. To determine most wanted locale for every request following steps are taken in order set by `options.order`. One or more steps may be cancelled via setting null in related `options` or not including to `options.order`.

Plugin (in default order, which can be changed from `options.order`)

1. `params` looks path paramater such as `{lang}/member` for `/en_US/member`. Path parameter name can be set via `options.param`.
2. `cookie` looks cookie. Cookie name can be set via `options.cookie`, cookie key to look in cookie can be set `options.cookieKey`.
3. `query` looks query paramater such as `/member?lang=en_US`. Query parameter name can be set via `options.query`.
4. `header` looks `accept-language` header of request. Header name can be set via `options.header`.


### 3. Match Requested locale

Plugin tries to find first preferred locale which is available in application:

1. If a match is found, locale is determined.
2. If no match is found plugin either throws 404 for URL parameter if `options.throw404` set true.
3. If no 404 is thrown, default locale is used as a result. Default locale may set via `options.default`, otherwise first available locale is used as default.


### 4. Getter and Setter Methods

Plugin uses getter and setter methods. It creates them if `options.createAccessors` is true and they do not exist. Name of the methods are set via `options.getter` and `options.setter` options. Default values are `i18n.getLocale` and `i18n.setLocale`.


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

    // This function may be used to access requested locale manually.
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

Options below are also default options.

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
                locales         : [],
                configFile      : path.join(rootDir, 'package.json'),
                configKey       : 'locales',
                scan            : {
                    path        : path.join(rootDir, 'locales'),
                    fileType    : 'json',
                    directories : true,
                    exclude     : ['templates', 'template.json']
                },
                param           : 'lang',
                query           : 'lang',
                cookie          : 'lang',
                cookieKey       : 'lang',
                header          : 'accept-language',
                order           : ['params', 'cookie', 'query', 'headers'],
                throw404        : true,
                getter          : 'i18n.getLocale',
                setter          : 'i18n.setLocale',
                createAccessors : true,
                attribute       : 'i18n.locale',
                callback        : 'setLocale',
                onEvent         : 'onPreAuth'
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

| **ROUTE**           | **REQUEST**                   | **HEADER**                     | **LOCALE**      | **REASON (Default Config)**
|---------------------|-------------------------------|--------------------------------|-----------------|-----------------------|
| /{lang}/account     | GET /en_US/account            |                                | en_US           | Path                  |
| /{lang}/account     | GET /tr_TR/account?lang=fr_FR | accept-language=jp_JP;jp;q=0.8 | tr_TR           | Path has more priority|
| /api/{lang}/account | GET api/en_US/account         |                                | en_US           | Path                  |
| /account            | GET /account?lang=en_US       |                                | en_US           | Query                 |
| /api/account        | GET api/account?lang=en_US    |                                | en_US           | Query                 |
| /account            | GET /account                  | accept-language=en_US;en;q=0.8 | en_US           | Header                |
| /{lang}/account     | GET /nonsense/account         |                                | *404*           | Not found URL         |
| /account            | GET account?lang=nonsense     |                                | *Default Locale*| Not found URL         |


API
===

