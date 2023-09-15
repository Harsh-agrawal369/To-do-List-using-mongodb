const Tasks = require("../models/Tasks");
const UserRoute = require("../routes/UserRoute");

const AddTask = async (req,res) =>{
    
    try{
        const task = req.body.task;

        if(task.length==0){
            return res.status(204).send();
        }else{
           
            const NewTask = new Tasks({
                user_id: req.session.user_id,
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


module.exports = {AddTask, EditTask};