require("dotenv").config();

module.exports = {
	FRONTEND_URL: "http://localhost:3000",
	NODE_ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,
	MONGO_URI:
		process.env.NODE_ENV === "production"
			? process.env.MONGO_URI_PROD
			: process.env.MONGO_URI_DEV,
	JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
	REDIS_URL: process.env.REDIS_URL,
	EMAIL_USER: process.env.EMAIL_USER,
	EMAIL_PASS: process.env.EMAIL_PASS,
	EVENT_HASH_LENGTH: 10,
	USER_HASH_LENGTH: 8,
	AWS_KEY: process.env.AWS_KEY,
	AWS_SECRET: process.env.AWS_SECRET,
	AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
	AWS_REGION: process.env.AWS_REGION,
	AVATAR_URL: process.env.AVATAR_URL,
	GET_BIRTHDAYS_PROCESS_SECRET: process.env.GET_BIRTHDAYS_PROCESS_SECRET,
	SENTRY_DSN: process.env.SENTRY_DSN
};
