const mongoose = require("mongoose");
const { logger } = require("../utility/helpers");
const { MONGO_URI, NODE_ENV } = require("./index");
const { SERVER_ERROR } = require("../utility/statusCodes");

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect

if (NODE_ENV === "development") mongoose.set("debug", true);

connectDb = async () => {
	try {
		await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		console.info("MongoDB Connected");
	} catch (err) {
		console.info(err);
		logger(
			"error",
			"database",
			{
				message: err.message,
				stack: err.stack,
				status: err.status || SERVER_ERROR
			},
			err
		);
	}
};
connectDb();
