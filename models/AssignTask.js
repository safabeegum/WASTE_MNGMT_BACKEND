const Mongoose = require("mongoose");

// Schema for assigning tasks to workers
const assigntaskSchema = Mongoose.Schema({
    pickupId: { // Reference to the waste pickup model
        type: Mongoose.Schema.Types.ObjectId,
        ref: "wastepickup", // Reference the waste pickup model
        required: true
    },
    userId: { // Field to reference the assigned worker
        type: Mongoose.Schema.Types.ObjectId,
        ref: "users", // Reference to the user model (workers)
        required: true
    },
    date: { // Date and time when the task is scheduled
        type: Date,
        required: true
    }
    
});

// Create the assignment model
const assigntaskModel = Mongoose.model("assigntask", assigntaskSchema);
module.exports = assigntaskModel;
