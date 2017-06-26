var mongoose = require('mongoose');

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

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
        mongoose.connect("mongodb://lolkek:cheburek@ds139322.mlab.com:39322/kek");
    } catch (err) {
        console.log(err);
    }
};