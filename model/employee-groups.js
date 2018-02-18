var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var eSchema = new Schema({
  name: String,
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// the schema is useless so far
// we need to create a model using it
var EmployeeGroup = mongoose.model('EmployeeGroup', eSchema);

// make this available to our users in our Node applications
module.exports = EmployeeGroup;