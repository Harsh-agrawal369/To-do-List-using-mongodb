require('dotenv').config()
const express = require("express");
const app = express();
const path = require("path");
require("./db/connection")
const UserRoute = require("./routes/UserRoute");
const TaskRoute = require("./routes/TaskRoute");

//Creating port variable 5000
const PORT= process.env.PORT || 5000;


//Creating static path for public folder
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));

//Setting view Engine ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "../views"));


//Transfering Request to Routes
app.use("/", UserRoute);
app.use("/", TaskRoute);


//Listening the Port
app.listen(PORT, () => {
    console.log(`server running at port ${PORT}`);
})