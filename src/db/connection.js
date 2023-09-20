const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_URL, {
    dbName: "To-do",
    serverSelectionTimeoutMS: 2000,
  })
  .then(() => console.log("Connection established"))
  .catch((e) => console.error("Connection error:", e.message));