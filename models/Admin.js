const Mongoose = require("mongoose")

const adminSchema = Mongoose.Schema(
    {
        username:String,
        password:String
    }
)

const adminModel = Mongoose.model("admin",adminSchema)
module.exports = adminModel