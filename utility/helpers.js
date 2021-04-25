const log4js = require("log4js");
const { promisify } = require("util");
const redis = require("redis");
const Sentry = require("@sentry/node");
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);

const { SENTRY_DSN, NODE_ENV } = require("../config/index");
const { OK } = require("./statusCodes");

client.on("error", function (error) {
	console.error(error);
});

log4js.configure({
	appenders: {
		server: { type: "file", filename: "logs/server.log" },
		database: { type: "file", filename: "logs/database.log" },
		app: { type: "file", filename: "logs/app.log" },
		email: { type: "file", filename: "logs/email.log" },
		storage: { type: "file", filename: "logs/storage.log" }
	},
	categories: {
		server: { appenders: ["server"], level: "DEBUG" },
		database: { appenders: ["database"], level: "DEBUG" },
		app: { appenders: ["app"], level: "DEBUG" },
		email: { appenders: ["email"], level: "DEBUG" },
		storage: { appenders: ["storage"], level: "DEBUG" },
		default: { appenders: ["app"], level: "DEBUG" }
	}
});
let logger = log4js.getLogger();
logger.level = "debug";

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
	return new Date(yr, mn - 1, dt).toISOString();
};

Sentry.init({
	dsn: SENTRY_DSN,
	attachStacktrace: true,
	debug: true,
	environment: NODE_ENV
});

module.exports.logger = (type, category, logObject, err) => {
	logger = log4js.getLogger(category);
	if (NODE_ENV !== "development" && err) Sentry.captureException(err);
	if (type === "error") logger.error(logObject);
	else if (type === "fatal") logger.fatal(logObject);
	else if (type === "info") logger.info(logObject);
	else if (type === "warn") logger.warn(logObject);
	else if (type === "debug") logger.debug(logObject);
	else if (type === "trace") logger.trace(logObject);
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

module.exports.getValueFromCache = async key => {
	let response;
	try {
		response = await getAsync(key);
	} catch (err) {
		throw err;
	}
	return response;
};

module.exports.setValueInCache = (key, value, exp) => {
	if (exp) client.setex(key, exp, value);
	else client.set(key, value);
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

const NS_PER_SEC = 1e9;
const NS_TO_MS = 1e6;

module.exports.formatHrTime = hrt => {
	return (hrt[0] * NS_PER_SEC + hrt[1]) / NS_TO_MS;
};

module.exports.getMissingFieldError = key => `Please provide a valid ${key}`;
