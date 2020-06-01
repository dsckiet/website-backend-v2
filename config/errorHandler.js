const { sendError, logger } = require("../utility/helpers");
const { NOT_FOUND, SERVER_ERROR } = require("../utility/statusCodes");

module.exports.catchErrors = middlewareFunction => {
	return async (req, res, next) => {
		try {
			await middlewareFunction(req, res, next);
		} catch (err) {
			//send to next handler for logging
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
	//logging error for backend console
	console.error(err.stack);
	logger("fatal", "sendErrors", err);
	//sending error to frontend
	sendError(res, err.message, err.status || SERVER_ERROR);
};
