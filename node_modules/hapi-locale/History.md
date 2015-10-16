
---------------------------------------

History & Notes
================
Note: Simple documentation updates are not listed here.

#### 1.0.0 / 2015-10-16
* Changed: node.js 4 (ES6) is used.
* Some changes are incompatible with 0.x versions.
* Changed: Internal structure of the plugin is completly changed. It is class based now.
* Added: JOI validations for plugin options.
* Changed: Code cleaned up to make it easily understandable.
* Changed: Documentation is updated.
* Changed: Option names are simplified.
* Changed: `options.throw404` only affects URL parameter now.
* Changed: `options.callback` is not used anymore. `options.setter` is used both as a setter and as a callback.
* Changed: Best match algorithm now tries every method until requested language is one of the available ones.

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

