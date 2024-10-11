const Mongoose = require("mongoose")

const userfeedbackSchema = Mongoose.Schema(
    {
        userId : {
            type : Mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        
        feedback: String,

        postedDate : {
            type:Date,
            default: Date.now
        }
    }
)

var userfeedbackModel = Mongoose.model("userfeedback",userfeedbackSchema)
module.exports=userfeedbackModel