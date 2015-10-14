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

## Modules
<dl>
<dt><a href="#module_'hapi-locale'">'hapi-locale'</a></dt>
<dd><p>Configurable plugin for determine request language in hapi.js applications.</p>
</dd>
<dt><a href="#module_exposed">exposed</a></dt>
<dd><p>Exposed functions and attributes are listed under exposed name.
To access those attributes <code>request.server.plugins[&#39;hapi-locale&#39;]</code> can be used.</p>
</dd>
</dl>
<a name="module_'hapi-locale'"></a>
## 'hapi-locale'
Configurable plugin for determine request language in hapi.js applications.


* ['hapi-locale'](#module_'hapi-locale')
  * _static_
    * [.register(server, options, next)](#module_'hapi-locale'.register)
  * _inner_
    * [~PluginOptions](#module_'hapi-locale'..PluginOptions) : <code>Object</code>

<a name="module_'hapi-locale'.register"></a>
### &#x27;hapi-locale&#x27;.register(server, options, next)
Hapi plugin function which adds i18n support to request and response objects.

**Kind**: static method of <code>[&#x27;hapi-locale&#x27;](#module_'hapi-locale')</code>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>server</td><td><code>Object</code></td><td><p>Hapi server object</p>
</td>
    </tr><tr>
    <td>options</td><td><code>PluginOptions</code></td><td><p>Plugin configuration options.</p>
</td>
    </tr><tr>
    <td>next</td><td><code>function</code></td><td><p>Callback function.</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_'hapi-locale'..PluginOptions"></a>
### &#x27;hapi-locale&#x27;~PluginOptions : <code>Object</code>
Plugin configuration options.

**Kind**: inner typedef of <code>[&#x27;hapi-locale&#x27;](#module_'hapi-locale')</code>  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>locales</td><td><code>Array.&lt;string&gt;</code></td><td></td><td>List of locales to use in application.</td>
    </tr><tr>
    <td>default</td><td><code>string</code></td><td><code>&quot;1st Locale&quot;</code></td><td>Default locale to use if no locale is given.</td>
    </tr><tr>
    <td>configFile</td><td><code>string</code></td><td><code>&quot;package.json&quot;</code></td><td>Configuration file to get available locales.</td>
    </tr><tr>
    <td>configKey</td><td><code>string</code></td><td><code>&quot;locales&quot;</code></td><td>Key to look in configuration file to get available locales. May be nested key such as 'a.b.c'.</td>
    </tr><tr>
    <td>scan</td><td><code>Object</code></td><td></td><td>Scanning options to get available locales</td>
    </tr><tr>
    <td>scan.path</td><td><code>string</code></td><td><code>&quot;locale&quot;</code></td><td>Path or paths to scan locale files to get available locales.</td>
    </tr><tr>
    <td>scan.fileTypes</td><td><code>string</code></td><td><code>&quot;json&quot;</code></td><td>File types to scan. ie. "json" for en_US.json, tr_TR.json</td>
    </tr><tr>
    <td>scan.directories</td><td><code>boolean</code></td><td><code>true</code></td><td>whether to scan directory names to get available locales.</td>
    </tr><tr>
    <td>scan.exclude</td><td><code>Array.&lt;string&gt;</code></td><td><code>[templates]</code></td><td>Directory or file names to exclude from scan results.</td>
    </tr><tr>
    <td>nameOf</td><td><code>Object</code></td><td></td><td>Name of the parameters to determine language.</td>
    </tr><tr>
    <td>nameOf.param</td><td><code>string</code></td><td><code>&quot;lang&quot;</code></td><td>Name of the path parameter to determine language. ie. /{lang}/account</td>
    </tr><tr>
    <td>nameOf.query</td><td><code>string</code></td><td><code>&quot;lang&quot;</code></td><td>Name of the query parameter to determine language. ie. /account?lang=tr_TR</td>
    </tr><tr>
    <td>nameOf.cookie</td><td><code>string</code></td><td><code>&quot;lang&quot;</code></td><td>Name of the cookie to determine language.</td>
    </tr><tr>
    <td>nameOf.cookieKey</td><td><code>string</code></td><td><code>&quot;lang&quot;</code></td><td>Name of the key to look inside cookie to determine language. May be nested key such as 'a.b.c'.</td>
    </tr><tr>
    <td>nameOf.header</td><td><code>Object</code></td><td><code>accept-language</code></td><td>Name of the header parameter to determine language.</td>
    </tr><tr>
    <td>order</td><td><code>Array.&lt;string&gt;</code></td><td><code>[&#x27;params&#x27;, &#x27;cookie&#x27;, &#x27;query&#x27;, &#x27;headers&#x27;]</code></td><td>Order in which language determination process follows. First successful method returns requested language.</td>
    </tr><tr>
    <td>throw404</td><td><code>boolean</code></td><td></td><td>Whether to throw 404 not found if locale is not found. Does not apply path parameters, it always throws 404.</td>
    </tr><tr>
    <td>getter</td><td><code>function</code> | <code>string</code></td><td><code>getLocale</code></td><td>Getter method to get current locale. May be nested path such as 'a.b.c'.</td>
    </tr><tr>
    <td>setter</td><td><code>function</code> | <code>string</code></td><td><code>setLocale</code></td><td>Setter method to set current locale. May be nested path such as 'a.b.c'.</td>
    </tr><tr>
    <td>(boolean)</td><td></td><td></td><td>[createAccessorsIfNotExists=true] - Creates getter and setter if they do not exist. To be created they must be given as string.</td>
    </tr><tr>
    <td>callback</td><td><code>function</code> | <code>string</code></td><td><code>setLocale</code></td><td>Callback method to set locale. If given as function called directly. If given as string called as a method of request object. May be nested path such as 'a.b.c'.</td>
    </tr><tr>
    <td>onEvent</td><td><code>string</code></td><td><code>&quot;onPreAuth&quot;</code></td><td>Event on which locale determination process is fired.</td>
    </tr>  </tbody>
</table>

<a name="module_exposed"></a>
## exposed
Exposed functions and attributes are listed under exposed name.
To access those attributes `request.server.plugins['hapi-locale']` can be used.

**Example**  
```js
var locales = request.server.plugins['hapi-locale'].getLocales(); // ['tr_TR', 'en_US'] etc.
```

* [exposed](#module_exposed)
  * [~getLocales()](#module_exposed..getLocales) ⇒ <code>Array.&lt;string&gt;</code>
  * [~getDefaultLocale()](#module_exposed..getDefaultLocale) ⇒ <code>string</code>
  * [~getLocale(request, reply)](#module_exposed..getLocale) ⇒ <code>string</code>

<a name="module_exposed..getLocales"></a>
### exposed~getLocales() ⇒ <code>Array.&lt;string&gt;</code>
Returns all available locales as an array.

**Kind**: inner method of <code>[exposed](#module_exposed)</code>  
**Returns**: <code>Array.&lt;string&gt;</code> - - Array of locales.  
**Example**  
```js
var locales = request.server.plugins['hapi-locale'].getLocales(); // ['tr_TR', 'en_US'] etc.
```
<a name="module_exposed..getDefaultLocale"></a>
### exposed~getDefaultLocale() ⇒ <code>string</code>
Returns default locale.

**Kind**: inner method of <code>[exposed](#module_exposed)</code>  
**Returns**: <code>string</code> - - Default locale  
<a name="module_exposed..getLocale"></a>
### exposed~getLocale(request, reply) ⇒ <code>string</code>
Returns requested language. Can be used if developer does not want to pollute request object and want to get locale manually.
If no getLocale or similar method is available on request object, it may be best interest to store result elsewhere and use it during request's life instead of calling this function repetitively to prevent repeated calculations.
If getMethod or similar method is available and set via `options.getter` this function uses it.

**Kind**: inner method of <code>[exposed](#module_exposed)</code>  
**Returns**: <code>string</code> - Locale  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>request</td><td><code>Object</code></td><td><p>Hapi.js request object</p>
</td>
    </tr><tr>
    <td>reply</td><td><code>Object</code></td><td><p>Hapi.js reply object</p>
</td>
    </tr>  </tbody>
</table>


---------------------------------------

History & Notes
================
Note: Simple documentation updates are not listed here.

#### 0.4.4 / 2015-10-14
* Fixed: Accept language header parsed wrong.

#### 0.4.3 / 2015-10-13
* Changed: Tests ported from Mocha/Chai to Lab/Code.
* Fixed: Created setter function does not work.

#### 0.4.0 / 2015-10-09

* Changed: `options.createGetterOn` and `options.createSetterOn` are renamed as `options.getter` and `options.setter`.
* Added: `options.createAccessorsIfNotExists` added.
* Fixed: Wrong path parameter caused reply called twice. Fixed. 

#### 0.3.0 / 2015-10-07
* Added: Cookie support. `options.order` to change order of process to determine locale. It is possible to proritize query etc. over url parameters now. 

#### 0.2.1 / 2015-10-07
* Changed: `options.createGetter` and `options.createSetter` are renamed as `options.createGetterOn` and `options.createSetterOn`

#### 0.2.0 / 2015-10-07
* Added: `getDefaultLocale()` exposed function.

#### 0.1.0 / 2015-10-07
* Added: `getLocale()` and `getLocales()` exposed functions. 

#### 0.0.1 / 2015-10-06
* Initial version.

LICENSE
=======

The MIT License (MIT)

Copyright (c) 2015 Özüm Eldoğan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.