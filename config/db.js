const mongoose = require("mongoose");
async function connectDB() {
    try {
        const url = process.env.MONGODB_URL;
        const connection=await mongoose.connect(url);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (err) {
        console.log("error", err);
        process.exit(1);
    }
}
module.exports=connectDB
