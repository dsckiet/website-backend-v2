const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const morgan = require("morgan");
const helmet = require("helmet");
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

//load Schemas
const User = require("./models/User");
const Participant = require("./models/Participant");
const Event = require("./models/Event");
const Attendance = require("./models/Attendance");

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

const { ENV, PORT } = require("./config/index");
//Setting up server
(startServer = async () => {
	try {
		await app.listen(PORT);
		console.log(
			`ENV: ${
				ENV == "dev" ? "Development" : "Production"
			}\nServer is up and running on Port ${PORT}`
		);
	} catch (err) {
		console.error("Error in running server.", err);
	}
})();
