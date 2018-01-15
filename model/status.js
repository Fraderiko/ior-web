var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var statusSchema = new Schema({
  name: String,
  state: String,
  updated: Number,
  fields: [{ type: Schema.Types.ObjectId, ref: 'Field' }],
  isFinal: Boolean
});

// the schema is useless so far
// we need to create a model using it
var Status = mongoose.model('Status', statusSchema);

// make this available to our users in our Node applications
module.exports = Status;