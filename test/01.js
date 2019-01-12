/*jslint node:true */
"use strict";

const Code = require("code");
const hapi = require("hapi");
const Joi = require("joi");
const Lab = require("lab");

const lab = (exports.lab = Lab.script());
const before = lab.before;
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe("joi18n", function() {
  let server;

  before(async () => {
    server = new hapi.Server();

    server.route([
      {
        path: "/{lang}/{age}/{no}/joi18n",
        method: "GET",
        handler: async function(request, h) {
          return { locale: request.i18n.getLocale() };
        },
        config: {
          validate: {
            params: {
              lang: Joi.string(),
              age: Joi.number(),
              no: Joi.number()
            },
            failAction: function(request, h, error) {
              return error;
            },
            options: {
              abortEarly: false
            }
          }
        }
      }
    ]);

    await server.register([require("hapi-locale"), require("../index.js")]);
  });

  it("should return localized error.", async function() {
    const options = {
      method: "GET",
      url: "/tr_TR/1a/1/joi18n"
    };
    const response = await server.inject(options);

    expect(response.result.message).to.contain("sayı olmalı");
  });
});
