var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  author: String,
  type: String,
  value: String,
  date: Number,
});

// the schema is useless so far
// we need to create a model using it
var Message = mongoose.model('Message', schema);

// make this available to our users in our Node applications
module.exports = Message;