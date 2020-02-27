module.exports.sendError = (res, message, status) => {
	res.status(status).json({
		message,
		error: true,
		data: null
	});
};

module.exports.sendSuccess = (res, data) => {
	res.status(OK).json({
		message: "success",
		error: false,
		data
	});
};
