const { sendError, formatHtmlDate } = require("../utility/helpers");
const { BAD_REQUEST } = require("../utility/statusCodes");

let emailRegex = /^\S+@\S+\.\S+/,
	passwordRegex = /^[\S]{8,}/,
	phoneRegex = /(^[6-9]{1}[0-9]{9}$)/;

module.exports.userValidation = (req, res, next) => {
	let { name, email, role, designation } = req.body;
	if (!name || !email || !role || !designation) {
		return sendError(res, "All field are mandatory!!", BAD_REQUEST);
	}
	if (!emailRegex.test(String(email))) {
		return sendError(res, "Email not Valid!!", BAD_REQUEST);
	} else if (!["core", "member"].includes(role)) {
		return sendError(res, "Role not valid", BAD_REQUEST);
	} else {
		return next();
	}
};

module.exports.userUpdateValidation = (req, res, next) => {
	let fields = Object.keys(req.body);
	let restrictedFields = [
			"role",
			"designation",
			"showOnWebsite",
			"lastLogin"
		],
		canUpdate = true;

	restrictedFields.map(restrictedField => {
		if (fields.includes(restrictedField)) canUpdate = false;
	});

	if (!canUpdate) {
		return sendError(res, "Cannot update a restricted field", BAD_REQUEST);
	} else if (req.body.email) {
		if (!emailRegex.test(String(req.body.email)))
			return sendError(res, "Email not Valid!!", BAD_REQUEST);
	}

	return next();
};

module.exports.participantValidation = (req, res, next) => {
	let { name, email, branch, year, phone } = req.body;
	if (!name || !email || !branch || !year || !phone) {
		return sendError(res, "All fields are mandatory!!", BAD_REQUEST);
	}
	if (emailRegex.test(String(email))) {
		if (phoneRegex.test(Number(phone))) {
			return next();
		} else {
			sendError(res, "Phone not valid!!", BAD_REQUEST);
		}
	} else {
		return sendError(res, "Email not Valid!!", BAD_REQUEST);
	}
};

module.exports.participantUpdateValidation = (req, res, next) => {
	let fields = Object.keys(req.body);
	let restrictedFields = ["isVerified", "isRevoked", "events", "lastLogin"],
		canUpdate = true;

	restrictedFields.map(restrictedField => {
		if (fields.includes(restrictedField)) canUpdate = false;
	});

	if (!canUpdate) {
		return sendError(res, "Cannot update a restricted field", BAD_REQUEST);
	} else if (req.body.email) {
		if (!emailRegex.test(String(req.body.email)))
			return sendError(res, "Email not valid", BAD_REQUEST);
	} else if (req.body.phone) {
		if (!phoneRegex.test(Number(req.body.phone)))
			return sendError(res, "Phone not valid", BAD_REQUEST);
	}

	return next();
};

module.exports.eventValidation = (req, res, next) => {
	let {
		title,
		description,
		startDate,
		endDate,
		time,
		venue,
		isRegistrationRequired,
		maxRegister
	} = req.body;

	if (!title || !description || !startDate || !endDate || !time || !venue) {
		return sendError(res, "All fields are mandatory!!", BAD_REQUEST);
	} else if (
		formatHtmlDate(startDate).toISOString() >
		formatHtmlDate(endDate).toISOString()
	) {
		return sendError(res, "Invalid dates", BAD_REQUEST);
	} else if (isRegistrationRequired && !maxRegister) {
		return sendError(
			res,
			"Maximum registerations value required",
			BAD_REQUEST
		);
	}
	return next();
};

module.exports.emailValidation = (req, res, next) => {
	let { email } = req.body;
	if (!email || !emailRegex.test(String(email))) {
		return sendError(res, "Please enter a valid email", BAD_REQUEST);
	}

	return next();
};
