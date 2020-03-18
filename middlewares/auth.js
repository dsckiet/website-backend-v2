const jwt = require("jsonwebtoken");
const { sendError } = require("../utility/helpers");
const { NOT_AUTHORIZED } = require("../utility/statusCodes");

module.exports.allAuth = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
	req.user = decodedPayload;
	return next();
};

module.exports.leadAuth = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
	if (decodedPayload.role === "lead") {
		req.user = decodedPayload;
		return next();
	} else {
		return sendError(res, "Forbidden", NOT_AUTHORIZED);
	}
};

module.exports.coreAuth = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
	if (decodedPayload.role === "core" || decodedPayload.role === "lead") {
		req.user = decodedPayload;
		return next();
	} else {
		return sendError(res, "Forbidden", NOT_AUTHORIZED);
	}
};

module.exports.participantAuth = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
	if (decodedPayload.role === "participant") {
		req.user = decodedPayload;
		return next();
	} else {
		return sendError(res, "Forbidden", NOT_AUTHORIZED);
	}
};
