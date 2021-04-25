const jwt = require("jsonwebtoken");
const { JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE } = require("../config");
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
	try {
		const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY, {
			algorithms: [JWT_ALGORITHM],
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE
		});
		if (
			!decodedPayload.id ||
			!decodedPayload.name ||
			!decodedPayload.email ||
			!decodedPayload.role
		)
			return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
		let prev_token = await checkToken(decodedPayload.id);
		if (!prev_token)
			return sendError(res, "Account Suspended, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revoke")
			return sendError(res, "Account Revoked, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revalidate" || prev_token !== token)
			return sendError(res, "Session Expired, Logout!", NOT_AUTHORIZED);
		req.user = decodedPayload;
		return next();
	} catch (err) {
		console.log(err.message);
		return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
	}
};

module.exports.leadAuth = async (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return sendError(
			res,
			"Access denied. No Token provided",
			NOT_AUTHORIZED
		);
	try {
		const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY, {
			algorithms: [JWT_ALGORITHM],
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE
		});
		if (
			!decodedPayload.id ||
			!decodedPayload.name ||
			!decodedPayload.email ||
			!decodedPayload.role
		)
			return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
		if (decodedPayload.role !== "lead")
			return sendError(res, "Forbidden", FORBIDDEN);
		let prev_token = await checkToken(decodedPayload.id);
		if (!prev_token)
			return sendError(res, "Account Suspended, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revoke")
			return sendError(res, "Account Revoked, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revalidate" || prev_token !== token)
			return sendError(res, "Session Expired, Logout!", NOT_AUTHORIZED);
		req.user = decodedPayload;
		return next();
	} catch (err) {
		console.log(err.message);
		return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
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
	try {
		const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY, {
			algorithms: [JWT_ALGORITHM],
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE
		});
		if (
			!decodedPayload.id ||
			!decodedPayload.name ||
			!decodedPayload.email ||
			!decodedPayload.role
		)
			return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
		if (!["core", "lead"].includes(decodedPayload.role))
			return sendError(res, "Forbidden", FORBIDDEN);
		let prev_token = await checkToken(decodedPayload.id);
		if (!prev_token)
			return sendError(res, "Account Suspended, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revoke")
			return sendError(res, "Account Revoked, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revalidate" || prev_token !== token)
			return sendError(res, "Session Expired, Logout!", NOT_AUTHORIZED);
		req.user = decodedPayload;
		return next();
	} catch (err) {
		console.log(err.message);
		return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
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
	try {
		const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY, {
			algorithms: [JWT_ALGORITHM],
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE
		});
		if (
			!decodedPayload.id ||
			!decodedPayload.name ||
			!decodedPayload.email ||
			!decodedPayload.role
		)
			return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
		if (decodedPayload.role !== "participant")
			return sendError(res, "Forbidden", FORBIDDEN);
		let prev_token = await checkToken(decodedPayload.id);
		if (!prev_token)
			return sendError(res, "Account Suspended, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revoke")
			return sendError(res, "Account Revoked, Logout!", NOT_AUTHORIZED);
		if (prev_token === "revalidate" || prev_token !== token)
			return sendError(res, "Session Expired, Logout!", NOT_AUTHORIZED);
		req.user = decodedPayload;
		return next();
	} catch (err) {
		console.log(err.message);
		return sendError(res, "Invalid Token, Logout!", NOT_AUTHORIZED);
	}
};
