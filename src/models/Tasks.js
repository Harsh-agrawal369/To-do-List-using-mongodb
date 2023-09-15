const mongoose = require("mongoose");


//Creating Schema for Task
const TaskSchema = new mongoose.Schema({

    user_id: {
        type: String,
        required: true
    },

    task: {
        type: String,
        required: true
    },

    completed: {
        type: Number,
        required: true
    }
})

//Creating model
const Tasks = new mongoose.model("Tasks", TaskSchema);

module.exports= Tasks;