const { sendError, logger } = require("../utility/helpers");
const { NOT_FOUND, SERVER_ERROR } = require("../utility/statusCodes");

module.exports.catchErrors = middlewareFunction => {
	return async (req, res, next) => {
		try {
			await middlewareFunction(req, res, next);
		} catch (err) {
			//log
			logger("error", "catchErrors", err);
			//send to next
			next(err);
		}
	};
};

// not found routes
module.exports.notFound = (req, res) => {
	logger("info", "Wrong endpoint request", `${req.params[0]} has been hit`);
	sendError(
		res,
		"Welcome to DSC KIET API!! This route does not exist",
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
	console.log(err.stack);
	logger("fatal", "sendErrors", errorDetailsToSend);
	logger("fatal", "sendErrors", err.stack);

	//sending error to frontend
	sendError(res, err.message, err.status || SERVER_ERROR);
};
