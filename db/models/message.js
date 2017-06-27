var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

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

MsgSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Message', MsgSchema);