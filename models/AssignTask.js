const Mongoose = require("mongoose")

const assigntaskSchema = Mongoose.Schema(
    {
        userId : {
            type : Mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        
        name: String,
        date: Date,
        time: String,
        addinfo: String,

    }
)

var assigntaskModel = Mongoose.model("assigntask",assigntaskSchema)
module.exports=assigntaskModel