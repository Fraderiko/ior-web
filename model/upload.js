var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var uploadSchema = new Schema({
  link: String,
});

// the schema is useless so far
// we need to create a model using it
var Upload = mongoose.model('Upload', uploadSchema);

// make this available to our users in our Node applications
module.exports = Upload;