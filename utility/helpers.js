const { OK } = require("./statusCodes");

module.exports.sendError = (res, message, status) => {
	res.status(status).json({
		message,
		error: true,
		data: null
	});
};

module.exports.sendSuccess = (res, data, token) => {
	if (token) {
		res.status(OK)
			.header("x-auth-token", token)
			.json({
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
