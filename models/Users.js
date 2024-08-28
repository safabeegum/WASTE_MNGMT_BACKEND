const Mongoose = require("mongoose")

const userSchema = Mongoose.Schema(
    {
        first_name:
        {
            type:String,
            required:true
        },
        last_name:
        {
            type:String,
            required:true
        },
        address:
        {
            type:String,
            required:true
        },
        district:
        {
            type:String,
            required:true,
            enum:['Trivandrum','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Kannur','Wayanad','Kasargode']
        },
        lsgi_type:
        {
            type:String,
            required:true,
            enum:['Coorporation','Muncipality','Panchayat']
        },
        lsgi_name:
        {
            type:String,
            required:true
        },
        ward_name:
        {
            type:String,
            required:true
        },
        email:
        {
            type:String,
            required:true
        },
        phone:
        {
            type:String,
            required:true
        },
        password:
        {
            type:String,
            required:true
        }
    }
)

var userModel = Mongoose.model("users",userSchema)
module.exports = userModel