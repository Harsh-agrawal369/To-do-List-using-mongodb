const express = require("express");
const TaskRoute = express();
const path = require("path");
const bodyparser= require("body-parser");
const Tasks = require("../models/Tasks");


TaskRoute.use(bodyparser.json());
TaskRoute.use(bodyparser.urlencoded({extended:true}));

const controller= require("../controllers/TasksController");
const {isLogin, isLogout} = require("../middleware/Auth");

// const session = require("express-session");
const cookieParser = require("cookie-parser");



//Creating session
TaskRoute.use(cookieParser());


//Setting view Engine ejs
TaskRoute.set('view engine', 'ejs');
TaskRoute.set('views', path.join(__dirname, "../views"));


//Get Requests

//Rendering Add-Task get Request
TaskRoute.get("/Add-task", isLogin, async (req,res) => {
    try{
        res.redirect("/home");
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
});

//Rendering Edit-Task Get Request
TaskRoute.get("/edit", isLogin, async (req,res) => {
    try{
        res.redirect("/home");
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
});

//Handeling Delete Request for a Task
TaskRoute.get("/delete/:id", isLogin, async (req,res) =>{
    try{
        const {id} = req.params;

        await Tasks.deleteOne({_id: id});
        res.redirect("/home");

    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
})

//Handeling Completed Task
TaskRoute.get("/comp/:id", isLogin, async (req,res) => {

    try{
        const {id} = req.params;

        await Tasks.findOneAndUpdate(
            {_id: id},
            {$set: {completed: 1}}
        );
        res.redirect("/home");

    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
})

//Handeling InCompleted Task
TaskRoute.get("/incomp/:id", isLogin, async (req,res) => {

    try{
        const {id} = req.params;

        await Tasks.findOneAndUpdate(
            {_id: id},
            {$set: {completed: 0}}
        );
        res.redirect("/home");
        
    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error!"});
    }
})



//Post Requests

//Rendering Add-Task Post request
TaskRoute.post("/Add-task", controller.AddTask);

//Rendering Edit Task Post Request
TaskRoute.post("/edit", controller.EditTask);

module.exports = TaskRoute;