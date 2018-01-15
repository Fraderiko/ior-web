var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var orderTemplateSchema = new Schema({
  name: String,
  statuses: [{ type: Schema.Types.ObjectId, ref: 'Status' }],
});

// the schema is useless so far
// we need to create a model using it
var OrderTemplate = mongoose.model('OrderTemplate', orderTemplateSchema);

// make this available to our users in our Node applications
module.exports = OrderTemplate;