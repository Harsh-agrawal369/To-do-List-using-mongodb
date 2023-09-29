const Register = require("../models/Register");
const bcrypt = require("bcryptjs");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");
var url = require('url');
const http =  require("https");
const jwt = require("jsonwebtoken");
const { rejects } = require("assert");


const CreateToken = (id) => {
    console.log("Cookie Created SuccessFully");
    return jwt.sign({id}, process.env.COOKIESESSIONKEY, {
        expiresIn: 12 * 60 * 60
    });
}


const getUserId = (req, res) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies.jwt;

        if(token){
            jwt.verify(token, process.env.COOKIESESSIONKEY, async (err, decodedToken) => {
                try{
                    if(err){
                        console.log("Hi");
                        res.render("login", {errorMessage: "Internal server error"});
                        reject(err);
                    }
                    else{
                        console.log(decodedToken.id);
                        resolve(decodedToken.id);
                    }
                }catch(err){
                    console.log("Hello");
                    res.render("login", {errorMessage: "Internal server error"});
                    reject(err);
                }
            });
        } else {
            console.log("Hey");
            res.render("login", {errorMessage: "Session Expired"});
            reject(new Error("Session Expired"));
        }
    });
}


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
                const token = CreateToken(user._id);
                res.cookie('jwt', token, {httpOnly: true}, {maxAge: 12 * 60 * 60 * 1000});
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
        const token =  req.cookies.jwt;
        if(token){
            const {Password,confirmPassword} = req.body;
            const usrId = await getUserId(req,res);
            const user = await Register.findOne({_id: usrId});
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
                    {_id: usrId},
                    {$set: {password: newhashedpassword}}
                );
                res.cookie('jwt', '', {maxAge: 1});
                res.render("login", {errorMessage: "password Updated Successfully! please Login."})
            }
        }
        else{
            const {currentURL} = req.body;
            console.log(currentURL);
            const urlParams = currentURL.split('?')[1];
            const token = urlParams.split('=')[1];
            const tokenData = await Register.findOne({token: token});
            if(tokenData){
                const {Password,confirmPassword} = req.body;
                const user = await Register.findOne({_id: tokenData._id});
                // console.log(user._id);
                const token1 = CreateToken(user._id);
                res.cookie('jwt', token1, {httpOnly: true}, {maxAge: 12 * 60 * 60 * 1000});
                await Register.findOneAndUpdate(
                    {_id: user._id},
                    {$set: {token: ""}}
                );
                
                // console.log(user);
                if(Password!=confirmPassword){
                    return res.render("changepass", {error: "Passwords do not match!"});
                }
                const hashedPassword = user.password;

                const match = await bcrypt.compare(Password, hashedPassword);

                if(match){
                    return res.render("changepass", {error: "Password cannot be same as old password!" });
                }else{
                    let newhashedpassword = await bcrypt.hash(Password, 8);
                    await Register.findOneAndUpdate(
                        {_id: user._id},
                        {$set: {password: newhashedpassword, token: ""}}
                    );

                    res.render("login", {errorMessage: "password Updated Successfully! please Login."});
                }
            }else{
                res.render("changepass", {error: "This link has expired." });
            }
        }



    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

const Editdetails = async (req,res) => {
    try{
        const {name , contact, gender} = req.body;
        const usrId = await getUserId(req,res);

        if(name!=""){
            await Register.findOneAndUpdate(
                {_id: usrId},
                {$set: {name: name}}
            );
        }
        if(contact!=""){
            await Register.findOneAndUpdate(
                {_id: usrId},
                {$set: {contact: contact}}
            );
        }
        if(gender!="Gender"){
            await Register.findOneAndUpdate(
                {_id: usrId},
                {$set: {gender: gender}}
            );
        }
        const user = await Register.findOne({_id: usrId});
        res.render("myprofile",{name: user.name, data: user, Message: "Details Updated Successfully!"})
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

//Email Sending Function
const sendresetPasswordMail = async(name, email, token, currentURL) => {
    try{

        const transporter= nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH_GMAIL,
                pass: process.env.AUTH_PASSWORD
            },
            secure: false,
            requireTLS: true
        });

        var url_r = new URL(currentURL);
        var protocol = url_r.protocol;
        var host = url_r.host;

        const mailOptions = {
            from: process.env.AUTH_GMAIL,
            to: email,
            subject: 'Reset Password for your To-do List account.',
            html: '<p> Hello ' +name+ '!<br> Please use this link and <a href="'+protocol+'//'+host+'/changepassword?token='+token+'">' + 'reset your password.' + '<br><br><br><br><br>' + 'Best Regards<br>Harsh'
        }
        transporter.sendMail(mailOptions, (error, info) =>{
            if(error){
                console.log(error);
            }
            else{
                console.log("Mail has been sent!");
            }
        })

    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

const ResetPassword = async (req,res) => {
    try{

        const {email, currentURL} = req.body;

        const user = await Register.findOne({email: email});

        if(!user){
            return res.render("forgotPassword", {error: "Email is not registered! Please enter valid email."});
        }
        else{
            const randomstr = randomString.generate();
            const data = await Register.findOneAndUpdate({email: email}, {$set: {token: randomstr}});
            console.log(currentURL);
            sendresetPasswordMail(data.name,email,randomstr,currentURL);
            res.render("forgotPassword", {error: "Please check your inbox! A reset link has been sent."});
        }


    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}





module.exports = {
    InsertUser,
    LoginUser,
    UpdatePassword,
    Editdetails, 
    ResetPassword,
    CreateToken,
    getUserId
}