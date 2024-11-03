const Mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const transactionSchema = Mongoose.Schema({
    transactionId: {
        type: String,
        unique: true,
        default: uuidv4, // Automatically generates a unique transaction ID
    },
    userId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true, // Ensure userId is always provided
    },
    amount: {
        type: Number,
        required: true, // Ensure every transaction has an amount
        min: [0, "Amount must be a positive number"], // Validate that amount is positive
    },
    date: {
        type: Date,
        default: Date.now, // Automatically sets date to the current date and time
    },
    month: {  // Add this new field
        type: String,
        required: true,
        enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    },
    description: {
        type: String,
        maxlength: 500, // Limits description length
        default: "", // Optional: makes description field optional by setting a default
    },
});

// Model for the transaction schema
var transactionModel = Mongoose.model("transaction", transactionSchema);
module.exports = transactionModel;