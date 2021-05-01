const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const Sentry = require("@sentry/node");
const kue = require("kue");

const {
	NODE_ENV,
	PORT,
	SENTRY_DSN,
	ALLOWED_ORIGINS
} = require("./config/index");
const { notFound, sendErrors } = require("./config/errorHandler");
const { logRequestMiddleware } = require("./middlewares/log");
const { globalRateLimiter } = require("./config/rateLimit");

const app = express();

require("dotenv").config();
require("./config/dbconnection");

module.exports = () => {
	Sentry.init({
		dsn: SENTRY_DSN,
		attachStacktrace: true,
		debug: true,
		environment: NODE_ENV
	});
	if (NODE_ENV !== "development") app.use(Sentry.Handlers.requestHandler());

	app.use(compression());
	app.use(helmet());
	app.set("trust proxy", true);
	app.use(cors({ exposedHeaders: "x-auth-token", origin: ALLOWED_ORIGINS }));
	app.use(globalRateLimiter);
	app.use(express.static(path.join(__dirname, "public")));
	app.use(
		bodyParser.urlencoded({
			limit: "50mb",
			extended: true,
			parameterLimit: 1000000
		})
	);
	app.use(
		bodyParser.json({
			limit: "50mb",
			extended: true,
			parameterLimit: 1000000
		})
	);
	app.use("/kue-cli", kue.app);
	app.use(logRequestMiddleware);

	//load Schemas
	const Log = require("./models/Log");
	const User = require("./models/User");
	const Participant = require("./models/Participant");
	const Event = require("./models/Event");
	const Attendance = require("./models/Attendance");
	const Feedback = require("./models/Feedback");
	const ResetToken = require("./models/ResetToken");
	const Subscriber = require("./models/Subscriber");
	const Subscription = require("./models/Subscription");
	const Todo = require("./models/Todo");
	const Group = require("./models/Group");
	const Task = require("./models/Task");
	const TaskAssignee = require("./models/TaskAssignee");

	//Routes
	app.use("/api/v1", require("./routes/api/v1/index"));
	app.use("/api/v1/users", require("./routes/api/v1/users"));
	app.use("/api/v1/events", require("./routes/api/v1/events"));
	app.use("/api/v1/group", require("./routes/api/v1/groups"));
	app.use("/api/v1/task", require("./routes/api/v1/task"));
	app.use("/api/v1/subscriptions", require("./routes/api/v1/subscriptions"));
	app.use("/api/v1/todos", require("./routes/api/v1/todos"));

	app.use("*", notFound);

	//Error Handlers
	app.use(sendErrors);

	// Allowing headers
	app.use((req, res, next) => {
		let origin = req.headers.origin;
		if (
			ALLOWED_ORIGINS.includes(origin) ||
			(ALLOWED_ORIGINS[2] && ALLOWED_ORIGINS[2].test(origin))
		)
			res.header("Access-Control-Allow-Origin", origin);
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, x-auth-token"
		);
		res.header("Access-Control-Allow-Credentials", true);
		res.header(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, PATCH, OPTIONS"
		);
		next();
	});

	//Setting up server
	(async () => {
		try {
			await app.listen(PORT);
			console.info(
				`NODE_ENV: ${NODE_ENV}\nServer is up and running on Port ${PORT}`
			);
		} catch (err) {
			console.info("Error in running server.", err);
		}
	})();
};
