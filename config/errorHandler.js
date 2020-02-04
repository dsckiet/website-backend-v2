const log4js = require("log4js");
log4js.configure({
	appenders: { cheese: { type: "file", filename: "server-logs.log" } },
	categories: { default: { appenders: ["cheese"], level: "error" } }
});
let logger = log4js.getLogger();
logger.level = "debug";

module.exports.catchErrors = middlewareFunction => {
	return (req, res, next) => {
		middlewareFunction(req, res, next).catch(err => {
			//log
			logger = log4js.getLogger("Logs from catchErrors middleware");
			logger.error(err);
			//send to next
			next(err);
		});
	};
};

// not found routes
module.exports.notFound = (req, res) => {
	logger = log4js.getLogger("Wrong endpoint request");
	logger.info(`${req.params[0]} has been hit`);
	res.status(404).json({
		message: "Welcome to DSC-KIET API!! This route does not exist"
	});
};

module.exports.sendErrors = (err, req, res, next) => {
	const errorDetailsToSend = {
		message: err.message,
		status: err.status || 500,
		error: true
	};
	//logging error for backend console
	console.log(errorDetailsToSend);
	console.log(err.stack);
	logger = log4js.getLogger("Logs from sendErrors middleware");
	logger.error(errorDetailsToSend);
	//sending error to frontend
	res.status(err.status || 500).json(errorDetailsToSend);
};
