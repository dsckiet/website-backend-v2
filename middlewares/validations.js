const { sendError, formatHtmlDate } = require("../utility/helpers");
const { BAD_REQUEST } = require("../utility/statusCodes");

let emailRegex = /^\S+@\S+\.\S+/,
	passwordRegex = /^[\S]{8,}/,
	phoneRegex = /(^[6-9]{1}[0-9]{9}$)/,
	urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

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
			"lastLogin",
			"name",
			"email",
			"password"
		],
		canUpdate = true;

	restrictedFields.map(restrictedField => {
		if (fields.includes(restrictedField)) canUpdate = false;
	});

	if (!canUpdate) {
		return sendError(res, "Cannot update a restricted field", BAD_REQUEST);
	} else {
		if (req.body.branch) {
			if (
				![
					"CS",
					"IT",
					"EC",
					"EN",
					"ME",
					"CE",
					"CO",
					"CSI",
					"MCA"
				].includes(req.body.branch)
			) {
				return sendError(res, "Branch not Valid!!", BAD_REQUEST);
			}
		}
		if (req.body.year) {
			if (![1, 2, 3, 4].includes(req.body.year)) {
				return sendError(res, "Year not valid!!", BAD_REQUEST);
			}
		}
		if (req.body.contact) {
			if (!phoneRegex.test(String(req.body.contact))) {
				return sendError(
					res,
					"Contact number not Valid!!",
					BAD_REQUEST
				);
			}
		}
		if (req.body.linkedin) {
			if (!urlRegex.test(String(req.body.linkedin))) {
				return sendError(res, "Linkedin url invalid", BAD_REQUEST);
			}
		}
		if (req.body.github) {
			if (!urlRegex.test(String(req.body.github))) {
				return sendError(res, "Github url invalid", BAD_REQUEST);
			}
		}
		if (req.body.twitter) {
			if (!urlRegex.test(String(req.body.linkedin))) {
				return sendError(res, "Twitter url invalid", BAD_REQUEST);
			}
		}
		if (req.body.portfolio) {
			if (!urlRegex.test(String(req.body.portfolio))) {
				return sendError(res, "Portfolio url invalid", BAD_REQUEST);
			}
		}
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

module.exports.updateTodo = (req, res, next) => {
	let { status } = req.body;
	if (req.body.uid) {
		return sendError(res, "Restricted field!!", BAD_REQUEST);
	}
	if (!["pending", "complete"].includes(status)) {
		return sendError(res, "Invalid status!!", BAD_REQUEST);
	}
	return next();
};

module.exports.changePasswordValidation = (req, res, next) => {
	let { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		return sendError(res, "Required fields not sent!!", BAD_REQUEST);
	}

	if (oldPassword === newPassword)
		return sendError(
			res,
			"New Password cannot be same as old password",
			BAD_REQUEST
		);
};
