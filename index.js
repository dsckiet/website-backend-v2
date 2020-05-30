const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const helmet = require("helmet");
const { NODE_ENV, PORT } = require("./config/index");
const { notFound, sendErrors } = require("./config/errorHandler");
const kue = require("kue");
const app = express();

const cors = require("cors");
require("dotenv").config();
require("./config/dbconnection");

app.use(compression());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ exposedHeaders: "x-auth-token" }));
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

if (NODE_ENV === "production") {
	console.log = console.warn = console.error = () => {};
}

//load Schemas
const User = require("./models/User");
const Participant = require("./models/Participant");
const Event = require("./models/Event");
const Attendance = require("./models/Attendance");
const Feedback = require("./models/Feedback");
const ResetToken = require("./models/ResetToken");

//Routes
app.use("/api/v1", require("./routes/api/v1/index"));
app.use("/api/v1/users", require("./routes/api/v1/users"));
app.use("/api/v1/events", require("./routes/api/v1/events"));

app.use("*", notFound);

//Error Handlers
app.use(sendErrors);

// Allowing headers
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	res.header("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
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
