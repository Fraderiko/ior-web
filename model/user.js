var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  type: String,
  name: String,
  mail: String,
  phone: String,
  password: String,
  new_orders_notification: Boolean,
  new_status_notification: Boolean,
  new_chat_notification: Boolean,
  new_orders_push_notification: Boolean,
  new_status_push_notification: Boolean,
  permission_to_cancel_orders: Boolean,
  permission_to_edit_orders: Boolean,
  favorites: [String],
  mail_for_order: String,
  push_id: String
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
