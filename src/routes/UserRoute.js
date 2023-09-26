require("../Auth/Auth");
const express = require("express");
const UserRoute = express();
const path = require("path");
const bodyparser= require("body-parser");
const Register = require("../models/Register");
const Tasks= require("../models/Tasks");
const passport = require("passport");


UserRoute.use(bodyparser.json());
UserRoute.use(bodyparser.urlencoded({extended:true}));

const controller= require("../controllers/RegisterController");
const {isLogin, isLogout} = require("../middleware/Auth");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const config = require("../config/config");


//Creating session
UserRoute.use(cookieParser());
UserRoute.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.COOKIESESSIONKEY,
  cookie: {
    secure: false,
    maxAge: 2*60*60*1000 // Set the session cookie's max age
  }
}))


UserRoute.use(passport.initialize());
UserRoute.use(passport.session());

//Setting view Engine ejs
UserRoute.set('view engine', 'ejs');
UserRoute.set('views', path.join(__dirname, "../views"));



//Get Requests
//Rendering /
UserRoute.get("/",isLogout, (req,res) => {
    res.render("login", {errorMessage: null});
});

//Rendering Sign-up
UserRoute.get("/Sign-up", isLogout, (req,res) => {
    res.render("Sign-up", {errorMessage: null})
})

//Rendering login
UserRoute.get("/login", isLogout, (req,res) => {
    res.render("login", {errorMessage: null});
});

//Logout function
UserRoute.get("/logout", isLogin, (req,res) => {
    try{
      req.session.destroy();
      res.redirect('/');
    }catch(err){
      console.log(err);
    }
})

//Rendering Home
UserRoute.get("/home", isLogin, async (req,res)=>{
    try{
        const user = await Register.findOne({_id: req.session.user_id});
        const result = await Tasks.find({user_id: req.session.user_id});

        if(result!=null){
            let count=0;
            for(i=0; i<result.length; i++){
                if(result[i].completed == 0){
                    count++;
                }
            }
            res.render("home", {name: user.name, count: count, data: result, errorMessage: null})
        }else{
            res.render("home", {name: user.name, count: count, data: [], errorMessage: null});
        }    
        
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
})

//Rendering myProfile
UserRoute.get("/myprofile", isLogin,async  (req,res) =>{
    try{
        const user = await Register.findOne({_id: req.session.user_id});
        res.render("myprofile", {name: user.name, data: user});
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
})

//Rendering Backhome
UserRoute.get("/backhome", isLogin, (req,res) => {
    try{
        res.redirect("/home");
    }catch(err){
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
})

//Rendering ChangePassword
UserRoute.get("/changepassword", async  (req,res) =>{
    try{
        res.render("changepass", { error: null});
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
})

UserRoute.get("/forgotPassword", async (req,res) => {
    try{
        res.render("forgotPassword", {error: null});
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
})


UserRoute.get('/SignInWithGoogle',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

UserRoute.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/failure',
}));

UserRoute.get("/auth/failure", (req,res) => {
    res.redirect("/");
});

UserRoute.get('/auth/protected', isLogin,(req,res) => {
    res.redirect("/home");
})




//Post requests

//Rendering Sign-Up post Request
UserRoute.post('/signup', controller.InsertUser);

//Rendering Login Post Request
UserRoute.post("/login", controller.LoginUser);

//Rendering Update Password Post Request
UserRoute.post("/updatepass", controller.UpdatePassword);

//Rendering Edit Deatils Post Request
UserRoute.post("/editDetails", controller.Editdetails);

//Rendering Reset Password post Request
UserRoute.post("/resetPassword", controller.ResetPassword);

module.exports= UserRoute;
