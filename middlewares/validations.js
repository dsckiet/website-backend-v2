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

module.exports.eventValidation = (req, res, next) => {
	let {
		title,
		description,
		days,
		startDate,
		endDate,
		time,
		venue
	} = req.body;

	if (
		!title ||
		!description ||
		!days ||
		!startDate ||
		!endDate ||
		!time ||
		!venue
	) {
		return sendError(res, "All fields are mandatory!!", BAD_REQUEST);
	} else if (
		formatHtmlDate(startDate).toISOString() >
			formatHtmlDate(endDate).toISOString() ||
		(formatHtmlDate(endDate) - formatHtmlDate(startDate)) /
			(1000 * 3600 * 24) !==
			Number(days)
	) {
		return sendError(res, "Invalid dates", BAD_REQUEST);
	} else {
		return next();
	}
};
