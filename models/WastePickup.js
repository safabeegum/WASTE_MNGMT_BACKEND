const Mongoose = require("mongoose");

// Function to generate a unique pickup ID
const generatePickupId = () => {
    return 'PICKUP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const wastepickupSchema = Mongoose.Schema(
    {
        userId: {
            type: Mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true // Ensure userId is always provided
        },
        pickupId: {
            type: String,
            unique: true // Ensures that the generated ID is unique
        },
        requestedDate: {
            type: Date,
            default: Date.now // Automatically set to the current date/time
        },
        assignedWorker: { 
            type: Mongoose.Schema.Types.ObjectId,
             ref: 'Worker', default: null }, // Add this line
    }
);

// Pre-save hook to automatically generate pickupId before saving
wastepickupSchema.pre('save', function(next) {
    if (!this.pickupId) {
        this.pickupId = generatePickupId();
    }
    next();
});

// Create the waste pickup model
var wastepickupModel = Mongoose.model("wastepickup", wastepickupSchema);
module.exports = wastepickupModel;
