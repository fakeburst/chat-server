var mongoose = require('mongoose');

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var assert = require('assert');
var util = require('util');

var cfenv = require('cfenv');
var appenv = cfenv.getAppEnv();
var services = appenv.services;
var mongodb_services = services["compose-for-mongodb"];
assert(!util.isUndefined(mongodb_services), "Must be bound to compose-for-mongodb services");
var credentials = mongodb_services[0].credentials;
var ca = [new Buffer(credentials.ca_certificate_base64, 'base64')];


var models = require('require_tree').require_tree('./db/models/');

module.exports = function() {

    mongoose.connection.on('open', function() {
        console.log('Connected to mongo server!');
    });

    mongoose.connection.on('error', function(err) {
        console.log('Could not connect to mongo server!');
        console.log(err.message);
    });

    try {
        mongoose.connect(credentials.uri, {
                mongos: {
                    ssl: true,
                    sslValidate: true,
                    sslCA: ca,
                    poolSize: 1,
                    reconnectTries: 1
                }
            },
            function(err, db) {
                if (err) {
                    console.log(err);
                } else {
                    mongoose.useDb("chat");
                }
            });
    } catch (err) {
        console.log(err);
    }
};