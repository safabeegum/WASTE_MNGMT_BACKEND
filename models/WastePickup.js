const Mongoose = require("mongoose")

const wastepickupSchema = Mongoose.Schema(
    {
        userId : {
            type : Mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        
        quantity: String,
        addinfo: String,

        postedDate : {
            type:Date,
            default: Date.now
        }
    }
)

var wastepickupModel = Mongoose.model("wastepickup",wastepickupSchema)
module.exports=wastepickupModel