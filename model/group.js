var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var groupSchema = new Schema({
  type: String,
  name: String,
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  canworkwith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  orders: [{ type: Schema.Types.ObjectId, ref: 'OrderTemplate' }]
});

// the schema is useless so far
// we need to create a model using it
var Group = mongoose.model('Group', groupSchema);

// make this available to our users in our Node applications
module.exports = Group;