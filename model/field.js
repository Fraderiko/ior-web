var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var fieldSchema = new Schema({
  name: String,
  type: String,
  required: Boolean,
  recepientvisible: Boolean,
  media: [String],
  value: String
});

// the schema is useless so far
// we need to create a model using it
var Field = mongoose.model('Field', fieldSchema);

// make this available to our users in our Node applications
module.exports = Field;