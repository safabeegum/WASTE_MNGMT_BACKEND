const Mongoose = require("mongoose");

const completedTaskSchema =  Mongoose.Schema({
  userId: { type: Mongoose.Schema.Types.ObjectId, ref: 'users' },
  pickupId: { type: Mongoose.Schema.Types.ObjectId, ref: 'wastepickup' },
  date: Date
});

const CompletedTaskModel = Mongoose.model('CompletedTask', completedTaskSchema);
module.exports = CompletedTaskModel;
