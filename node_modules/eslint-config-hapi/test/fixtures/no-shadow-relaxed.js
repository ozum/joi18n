/* eslint-disable no-unused-vars */


// Declare internals

var internals = {};


module.exports.foo = function (value) {

    var top = function (err) {

        var inner = function (err) {

            return value;
        };
    };

    top();
};


module.exports.bar = function (value) {

    var top = function (res) {

        var inner = function (res) {

            return value;
        };
    };

    top();
};
