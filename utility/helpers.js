const { OK } = require("./statusCodes");
const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);
const { SENTRY_DSN, NODE_ENV } = require("../config/index");

client.on("error", function (error) {
	console.error(error);
});

const log4js = require("log4js");
log4js.configure({
	appenders: {
		app: {
			type: "file",
			filename: "logs/app.log",
			maxLogSize: 10485760
		},
		errorFile: {
			type: "file",
			filename: "logs/errors.log"
		},
		errors: {
			type: "logLevelFilter",
			level: "ERROR",
			appender: "errorFile"
		}
	},
	categories: {
		default: { appenders: ["app", "errors"], level: "DEBUG" }
	}
});
let logger = log4js.getLogger();
logger.level = "debug";

const Sentry = require("@sentry/node");
Sentry.init({
	dsn: SENTRY_DSN,
	attachStacktrace: true,
	debug: true,
	environment: NODE_ENV
});

module.exports.sendError = (res, message, status) => {
	res.status(status).json({
		message,
		error: true,
		data: null
	});
};

module.exports.sendSuccess = (res, data, token) => {
	if (token) {
		res.status(OK).header("x-auth-token", token).json({
			message: "success",
			error: false,
			data
		});
	} else {
		res.status(OK).json({
			message: "success",
			error: false,
			data
		});
	}
};

module.exports.generateHash = length => {
	let chars =
		"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let code = "";
	for (let i = 0; i < length; i++) {
		code += chars[Math.round(Math.random() * (chars.length - 1))];
	}
	return code;
};

module.exports.toTitleCase = str => {
	return str
		.toLowerCase()
		.split(" ")
		.map(word => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
};

module.exports.formatHtmlDate = date => {
	let [yr, mn, dt] = date.split("-");
	return new Date(yr, mn - 1, dt);
};

module.exports.logger = (type, funcName, message) => {
	logger = log4js.getLogger(`Logs from ${funcName} function`);

	if (type === "error") {
		if (NODE_ENV === "production") {
			Sentry.captureException(message);
		}
		logger.error(message);
	} else if (type === "fatal") {
		if (NODE_ENV === "production") {
			Sentry.captureException(message);
		}
		logger.fatal(message);
	} else if (type === "info") logger.info(message);
	else if (type === "warn") logger.warn(message);
	else if (type === "debug") logger.debug(message);
	else if (type === "trace") logger.trace(message);
};

module.exports.escapeRegex = text => {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports.checkToken = async id => {
	// id:revalidate ->  (generate new token)
	// id:revoked ->  (log the user out)
	// id:token -> give access if token == providedToken
	// no id -> user account is deleted
	let response;
	try {
		response = await getAsync(id);
	} catch (err) {
		throw err;
	}
	return response;
};

module.exports.setToken = (id, value) => {
	if (value === "delete") {
		client.del(id);
	} else {
		client.set(id, value);
	}
};

module.exports.getImageKey = url => {
	let folder;
	if (url.includes("profile")) {
		folder = "users";
	} else if (url.includes("update_part")) {
		folder = "participants";
	} else {
		folder = "events";
	}
	return `${folder}/${Date.now()}${
		Math.floor(Math.random() * 900000) + 99999
	}.jpeg`;
};
