const express = require("express");
const app = express();
require("dotenv").config();
const port = 3000 | process.env.PORT;
const connectDB = require("./config/db.js");
const fileRoute = require("./routes/files.js");
require("./utils/cron.js");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/files", fileRoute);
connectDB();
app.listen(port, () => {
    console.log("listening to port", port);
});
