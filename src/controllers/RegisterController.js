const Register = require("../models/Register");
const bcrypt = require("bcryptjs");


const InsertUser= async(req,res) => {

    const {name, email, gender, contact, password, confirmPassword} = req.body;

    try{
        const users = await Register.findOne({email: email});
        if(users!=null){
            res.render("Sign-up", {errorMessage: "Email already in use"});
        } else if(password!=confirmPassword){
            res.render("Sign-up", {errorMessage: "Passwords does not match"});
        } else{
            let hashedpassword = await bcrypt.hash(password, 8);
            const user= new Register({
                name: name,
                email: email,
                gender: gender,
                contact: contact,
                password: hashedpassword
            })

            const Nuser = await user.save();
            res.status(201).render("login", {errorMessage: "User Registered! Log in to continue"})

        }

    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

const LoginUser = async (req,res) => {
    const { email, password } = req.body;
    try{
        const user = await Register.findOne({email: email});
        if(user!=null){
            const hashedPassword = user.password;
            const match = await bcrypt.compare(password, hashedPassword);
            if (match) {
                req.session.user_id = user._id;
                return res.redirect("/home");
            } else {
                return res.render("login", { errorMessage: "Wrong Password!" });
            }
        }else{
            return res.render("login", { errorMessage: "Account does not exist! Sign-up to continue" });
        }
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

const UpdatePassword = async (req,res) => {

    try{
        const {Password,confirmPassword} = req.body;
        const user = await Register.findOne({_id: req.session.user_id});
        if(Password!=confirmPassword){
            return res.render("changepass", {name: user.name, error: "Passwords do not match!"});
        }
        const hashedPassword = user.password;

        const match = await bcrypt.compare(Password, hashedPassword);

        if(match){
            return res.render("changepass", { name: user.name,error: "Password cannot be same as old password!" });
        }else{
            let newhashedpassword = await bcrypt.hash(Password, 8);
            await Register.findOneAndUpdate(
                {_id: req.session.user_id},
                {$set: {password: newhashedpassword}}
            );
            res.render("changepass", {name: user.name, error: "password Updated Successfully!"});
        }



    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

const Editdetails = async (req,res) => {
    try{
        const {name , contact, gender} = req.body;

        if(name!=""){
            await Register.findOneAndUpdate(
                {_id: req.session.user_id},
                {$set: {name: name}}
            );
        }
        if(contact!=""){
            await Register.findOneAndUpdate(
                {_id: req.session.user_id},
                {$set: {contact: contact}}
            );
        }
        if(gender!="Gender"){
            await Register.findOneAndUpdate(
                {_id: req.session.user_id},
                {$set: {gender: gender}}
            );
        }
        const user = await Register.findOne({_id: req.session.user_id});
        res.render("myprofile",{name: user.name, data: user, Message: "Details Updated Successfully!"})
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

module.exports = {
    InsertUser,
    LoginUser,
    UpdatePassword,
    Editdetails
}