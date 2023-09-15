const mongoose = require("mongoose");


//Creating Schema for Registration Database
const UserSchema = mongoose.Schema({
    name: {
        type:String,
        required:true
    },

    email: {
        type: String,
        required: true,
        unique:true
    },

    gender: {
        type: String,
        required: true
    },

    contact: {
        type: Number,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }

})

//Creating Collection 
const Register = new mongoose.model("Register", UserSchema);

module.exports= Register;