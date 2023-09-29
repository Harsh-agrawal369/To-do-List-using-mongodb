const Tasks = require("../models/Tasks");
const UserRoute = require("../routes/UserRoute");
const jwt = require("jsonwebtoken");

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


const AddTask = async (req,res) =>{
    
    try{
        const task = req.body.task;
        const usrId = await getUserId(req,res);
        if(task.length==0){
            return res.status(204).send();
        }else{
           
            const NewTask = new Tasks({
                user_id: usrId,
                task: task,
                completed: 0
            })

            const NTask = NewTask.save();
            res.status(201).redirect("/home");
        }

    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}

const EditTask = async (req,res) => {

    try{
        const {task, hid_id} = req.body;
        await Tasks.findOneAndUpdate(
            {_id: hid_id},
            {$set: {task: task}}
        );
        res.redirect("/home");

    }catch(err){
        console.log(err);
        res.render("login", {errorMessage: "Internal server error"});
    }
}


module.exports = {AddTask, EditTask, getUserId};