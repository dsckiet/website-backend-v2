const { sendError } = require("../utility/helpers");
const { NOT_FOUND, SERVER_ERROR } = require("../utility/statusCodes");
const { logger } = require("../utility/helpers");

module.exports.catchErrors = middlewareFunction => {
	return async (req, res, next) => {
		try {
			await middlewareFunction(req, res, next);
		} catch (err) {
			next(err);
		}
	};
};

// not found routes
module.exports.notFound = (req, res) => {
	sendError(res, "Welcome to API!! This route does not exist", NOT_FOUND);
};

module.exports.sendErrors = (err, req, res, next) => {
	//logging error for backend console
	console.log(err);
	logger("error", "server", {
		message: err.message,
		status: err.status || SERVER_ERROR,
		stack: err.stack,
		path: req.originalUrl,
		user: req.user ? ({ id, name, email, role } = req.user) : undefined
	});
	//sending to frontend
	sendError(res, "Oops! Something went wrong.", err.status || SERVER_ERROR);
};
