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
