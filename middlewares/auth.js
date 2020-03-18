const jwt = require("jsonwebtoken");
const { sendError, checkToken } = require("../utility/helpers");
const { NOT_AUTHORIZED, FORBIDDEN } = require("../utility/statusCodes");

module.exports.allAuth = async (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);

	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

	let prev_token = await checkToken(decodedPayload.id);

	if (prev_token) {
		if (prev_token === "revoked") {
			return sendError(res, "Account Revoked, Logout!", FORBIDDEN);
		} else if (prev_token === "revalidate" || prev_token !== token) {
			return sendError(res, "Session Expired, Logout!", FORBIDDEN);
		}
	} else {
		return sendError(res, "Account Suspended, Logout!", FORBIDDEN);
	}

	req.user = decodedPayload;
	return next();
};

module.exports.leadAuth = async (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

	let prev_token = await checkToken(decodedPayload.id);

	if (prev_token) {
		if (prev_token === "revoked") {
			return sendError(res, "Account Revoked, Logout!", FORBIDDEN);
		} else if (prev_token === "revalidate" || prev_token !== token) {
			return sendError(res, "Session Expired, Logout!", FORBIDDEN);
		}
	} else {
		return sendError(res, "Account Suspended, Logout!", FORBIDDEN);
	}

	if (decodedPayload.role === "lead") {
		req.user = decodedPayload;
		return next();
	} else {
		return sendError(res, "Forbidden", NOT_AUTHORIZED);
	}
};

module.exports.coreAuth = async (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

	let prev_token = await checkToken(decodedPayload.id);

	if (prev_token) {
		if (prev_token === "revoked") {
			return sendError(res, "Account Revoked, Logout!", FORBIDDEN);
		} else if (prev_token === "revalidate" || prev_token !== token) {
			return sendError(res, "Session Expired, Logout!", FORBIDDEN);
		}
	} else {
		return sendError(res, "Account Suspended, Logout!", FORBIDDEN);
	}

	if (decodedPayload.role === "core" || decodedPayload.role === "lead") {
		req.user = decodedPayload;
		return next();
	} else {
		return sendError(res, "Forbidden", NOT_AUTHORIZED);
	}
};

module.exports.participantAuth = async (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

	let prev_token = await checkToken(decodedPayload.id);

	if (prev_token) {
		if (prev_token === "revoked") {
			return sendError(res, "Account Revoked, Logout!", FORBIDDEN);
		} else if (prev_token === "revalidate" || prev_token !== token) {
			return sendError(res, "Session Expired, Logout!", FORBIDDEN);
		}
	} else {
		return sendError(res, "Account Suspended, Logout!", FORBIDDEN);
	}

	if (decodedPayload.role === "participant") {
		req.user = decodedPayload;
		return next();
	} else {
		return sendError(res, "Forbidden", NOT_AUTHORIZED);
	}
};
