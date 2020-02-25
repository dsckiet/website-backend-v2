require("dotenv").config();

module.exports = {
	ENV: process.env.ENV,
	PORT: process.env.PORT,
	MONGO_URI_DEV: process.env.MONGO_URI_DEV,
	MONGO_URI_PROD: process.env.MONGO_URI_PROD,
	JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY
};
