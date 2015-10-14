joi18n
======
hapi plugin for i18n and translation of default joi error messages.

Description
===========
Provides translated messages for joi default error messages. After registering this plugin default hapi error messages appears as translated.

Synopsis
========
    var server = new hapi.Server();
    var plugins = [
        {register: require('hapi-locale')},
        {register: require('joi18n')}
    ];
    
    server.connection();
    
    server.register(plugins, function (err) {
        if (err) throw err;
        server.start(function () {
            console.log('Server started at: ' + server.info.uri);
        });
    });

How it works?
=============
To be stay simple, this module does not use any 18n module for translation, it simply assigns language specific JSON to validation options via `route.settings.validate.options.language`. 

Contribution
============
I need help for translating json files located in locales directory. Please send pull request on [github repository](https://github.com/ozum/joi18n) for translated json files.

Currently available languages
-----------------------------
* English (en_US)
* Turkish (tr_TR)

---------------------------------------

History & Notes
================
### 1.0.0 / 2015-09-16
* Initial version

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

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.