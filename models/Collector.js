const Mongoose = require("mongoose")

const collectSchema = Mongoose.Schema(
    {
        username:String,
        password:String
    }
)

const collectModel = Mongoose.model("collector",collectSchema)
module.exports = collectModel