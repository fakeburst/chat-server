var mongoose = require('mongoose');

var MsgSchema = new mongoose.Schema({
	username: {
		type: String,
		require: true 
	},
	content: {
		type: String,
		require: true 
	},
	created: Date
});

module.exports = mongoose.model('Message', MsgSchema);