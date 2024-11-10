const Mongoose = require("mongoose")
const assigntaskSchema =  Mongoose.Schema({
    pickupId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "wastepickup",
        required: true,
    },
    userId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
});

const assigntaskModel = Mongoose.model("assigntask", assigntaskSchema);
module.exports = assigntaskModel;
