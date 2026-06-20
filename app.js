const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser=require('cookie-parser');
const port = process.env.PORT || 3000;
const connectDB = require("./config/db.js");
const fileRoute = require("./routes/files.js");
const cors=require('cors');
const loginRoute=require("./routes/user.js");
const errorMiddleware=require('./middlewares/error.middleware.js');
require("./utils/cron.js");
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // 👈 ADD THIS LINE HERE!
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-5tw7a.vercel.app",
  "https://project-5tw7a-plydefleu-paul12345.vercel.app",
];


app.use(cors({
    origin:allowedOrigins,
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/files", fileRoute);
app.use("/api/auth",loginRoute);
connectDB();
app.use(errorMiddleware);
app.listen(port, () => {
    console.log("listening to port", port);
});
