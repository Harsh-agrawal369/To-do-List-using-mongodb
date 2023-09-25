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
        type: String
    },

    contact: {
        type: Number,
        required: true,
        unique: true,
        default: 0
    },

    password: {
        type: String,
    },
    token: {
        type: String,
        default: ""
    }

})

//Creating Collection 
const Register = new mongoose.model("Register", UserSchema);

module.exports= Register;