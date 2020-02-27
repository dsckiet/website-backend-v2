const log4js = require("log4js");
const { sendError } = require("../utility/helpers");
const { NOT_FOUND, SERVER_ERROR } = require("../utility/statusCodes");

log4js.configure({
	appenders: { cheese: { type: "file", filename: "server-logs.log" } },
	categories: { default: { appenders: ["cheese"], level: "error" } }
});
let logger = log4js.getLogger();
logger.level = "debug";

module.exports.catchErrors = middlewareFunction => {
	return async (req, res, next) => {
		try {
			await middlewareFunction(req, res, next);
		} catch (err) {
			//log
			logger = log4js.getLogger("Logs from catchErrors middleware");
			logger.error(err);
			//send to next
			next(err);
		}
	};
};

// not found routes
module.exports.notFound = (req, res) => {
	logger = log4js.getLogger("Wrong endpoint request");
	logger.info(`${req.params[0]} has been hit`);
	sendError(
		res,
		"Welcome to DSC-KIET API!! This route does not exist",
		NOT_FOUND
	);
};

module.exports.sendErrors = (err, req, res, next) => {
	const errorDetailsToSend = {
		message: err.message,
		status: err.status || SERVER_ERROR,
		error: true
	};
	//logging error for backend console
	console.log(errorDetailsToSend);
	logger = log4js.getLogger("Logs from sendErrors middleware");
	logger.error(errorDetailsToSend);
	logger.error(err.stack);
	//sending error to frontend
	sendError(res, errorDetailsToSend, err.status || SERVER_ERROR);;
};
