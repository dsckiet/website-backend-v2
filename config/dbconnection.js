const mongoose = require("mongoose");
require("dotenv").config();

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
const connectionString = process.env.MONGO_URI;

connectDb = async () => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.log(err);
    }
};
connectDb();
