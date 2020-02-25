const mongoose = require("mongoose");
const { ENV, MONGO_URI_DEV, MONGO_URI_PROD } = require("./index");

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect

const connectionString = ENV === "dev" ? MONGO_URI_DEV : MONGO_URI_PROD;

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
