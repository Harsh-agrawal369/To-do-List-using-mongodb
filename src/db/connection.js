const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/mongo", {
    dbName: "To-do",
    serverSelectionTimeoutMS: 2000,
    directConnection: true,
  })
  .then(() => console.log("Connection established"))
  .catch((e) => console.error("Connection error:", e.message));