require("dotenv").config();

module.exports = {
	FRONTEND_URL: "https://portal.dsckiet.com",
	PARTICIPANT_URL: "https://events.dsckiet.com",
	NODE_ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,
	MONGO_URI:
		process.env.NODE_ENV === "production"
			? process.env.MONGO_URI_PROD
			: process.env.MONGO_URI_DEV,
	JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
	JWT_ALGORITHM: process.env.JWT_ALGORITHM,
	JWT_ISSUER: process.env.JWT_ISSUER,
	JWT_AUDIENCE: process.env.JWT_AUDIENCE,
	REDIS_URL: process.env.REDIS_URL,
	EMAIL_USER: process.env.EMAIL_USER,
	EMAIL_PASS: process.env.EMAIL_PASS,
	EMAIL_HOST: process.env.EMAIL_HOST,
	SENDER_EMAIL: process.env.SENDER_EMAIL,
	EVENT_HASH_LENGTH: 10,
	USER_HASH_LENGTH: 8,
	AWS_KEY: process.env.AWS_KEY,
	AWS_SECRET: process.env.AWS_SECRET,
	AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
	AWS_REGION: process.env.AWS_REGION,
	AVATAR_URL: process.env.AVATAR_URL,
	GET_BIRTHDAYS_PROCESS_SECRET: process.env.GET_BIRTHDAYS_PROCESS_SECRET,
	SENTRY_DSN: process.env.SENTRY_DSN,
	ALLOWED_ORIGINS:
		process.env.NODE_ENV === "production"
			? [
					"https://portal.dsckiet.com",
					"https://dsckiet.com",
					"https://events.dsckiet.com"
			  ]
			: [
					"https://dsckiet-admin.netlify.app",
					"https://dsckietportal.netlify.app",
					/https?:\/\/localhost:[0-9]{4,4}/,
					/[^.\s]+deploy\-preview\-([\d]{1,})--dsckiet-admin\.netlify\.app/,
					/[^.\s]+deploy\-preview\-([\d]{1,})--dsckietportal\.netlify\.app/
			  ]
};
