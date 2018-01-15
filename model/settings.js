var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var schema = new Schema({
  archivePeriod: Number
});

// the schema is useless so far
// we need to create a model using it
var Settings = mongoose.model('Settings', schema);

// make this available to our users in our Node applications
module.exports = Settings;