var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fieldsSchema = new Schema({
    name: String,
    type: String,
    value: String,
    media: [String],
    required: Boolean,
    recepientvisible: Boolean
})

var discussionSchema = new Schema({
   date: Number,
   message: String,
   image_media: [String],
   video_media: [String],
   author: String
})

var messageSchema = new Schema({
  order: String,
  username: String,
  type: String,
  value: String,
  date: Number,
});

// create a schema
var orderSchema = new Schema({
  number: String,
  date: Number,
  updated: Number,
  type: { type: Schema.Types.ObjectId, ref: 'OrderTemplate' },
  currentstatus: String,
  comment: String,
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  statuses: [{
    name: String,
    state: String,
    isFinal: Boolean,
    fields: [fieldsSchema]
  }],
  recipientmail: String,
  recipientphone: String,
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  cancelReason: String,
  discussion: [discussionSchema],
  isArchived: Boolean,
  messages: [messageSchema]
});

// the schema is useless so far
// we need to create a model using it
var Order = mongoose.model('Order', orderSchema);

// make this available to our users in our Node applications
module.exports = Order;