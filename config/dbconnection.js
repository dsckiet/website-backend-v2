const mongoose = require("mongoose");
const { MONGO_URI } = require("./index");

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect

(connectDb = async () => {
	try {
		await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		console.info("MongoDB Connected");
	} catch (err) {
		console.info(err);
	}
})();
