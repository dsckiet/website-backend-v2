const {
	sendError,
	formatHtmlDate,
	getMissingFieldError,
	toTitleCase
} = require("../utility/helpers");
const { BAD_REQUEST } = require("../utility/statusCodes");

const emailRegex = /^\S+@\S+\.\S+/,
	passwordRegex = /^[\S]{8,}/,
	phoneRegex = /(^[6-9]{1}[0-9]{9}$)/,
	urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)$/,
	githubUrlRegex = /^https?:\/\/(www\.)?github.com\b([-a-zA-Z0-9()!@:%_\+.~#?&\/=]*)$/,
	linkedinUrlRegex = /^https?:\/\/(www\.)?linkedin.com\/in\b([-a-zA-Z0-9()!@:%_\+.~#?&\/=]*)$/,
	twitterUrlRegex = /^https?:\/\/(www\.)?twitter.com\b([-a-zA-Z0-9()!@:%_\+.~#?&\/=]*)$/;
const branchesArray = ["CS", "IT", "EC", "EN", "ME", "CE", "CO", "CSI", "MCA"];
module.exports.userValidation = (req, res, next) => {
	const { name, email, role, designation } = req.body;
	if (!name) return sendError(res, getMissingFieldError("name"));
	if (!email || !emailRegex.test(String(email).trim()))
		return sendError(res, getMissingFieldError("email"));
	if (!role || !["core", "member", "graduate"].includes(role))
		return sendError(res, getMissingFieldError("role"));
	if (!designation)
		return sendError(res, getMissingFieldError("designation"));
	req.body.name = toTitleCase(String(name).trim());
	req.body.email = String(email).trim().toLowerCase();
	req.body.role = String(role).trim().toLowerCase();
	req.body.designation = toTitleCase(String(designation).trim());
	return next();
};

module.exports.checkAddUser = user => {
	const { name, email, role, designation, branch, year, contact } = user;
	if (!name) return getMissingFieldError("name");
	if (!email || !emailRegex.test(String(email).trim()))
		return getMissingFieldError("email");
	if (!role || !["core", "member", "graduate"].includes(role))
		return getMissingFieldError("role");
	if (!designation) return getMissingFieldError("designation");
	if (branch && !branchesArray.includes(branch))
		return getMissingFieldError("branch");
	if (
		year &&
		(Number(year) < new Date().getFullYear() - 5 ||
			Number(year) > new Date().getFullYear() + 5)
	)
		return getMissingFieldError("year");
	if (contact && !phoneRegex.test(String(contact)))
		return getMissingFieldError("contact");
	return "success";
};

module.exports.profileUpdateValidation = (req, res, next) => {
	const {
		branch,
		year,
		github,
		linkedin,
		twitter,
		portfolio,
		contact
	} = req.body;
	if (branch && !branchesArray.includes(branch))
		return sendError(res, getMissingFieldError("branch"), BAD_REQUEST);
	if (
		year &&
		(Number(year) < new Date().getFullYear() - 5 ||
			Number(year) > new Date().getFullYear() + 5)
	)
		return sendError(res, getMissingFieldError("year"), BAD_REQUEST);
	if (contact && !phoneRegex.test(String(contact)))
		return sendError(res, getMissingFieldError("contact"), BAD_REQUEST);
	if (linkedin && !linkedinUrlRegex.test(String(req.body.linkedin)))
		return sendError(
			res,
			getMissingFieldError("linkedin url"),
			BAD_REQUEST
		);
	if (twitter && !twitterUrlRegex.test(String(req.body.twitter)))
		return sendError(res, getMissingFieldError("twitter url"), BAD_REQUEST);
	if (github && !githubUrlRegex.test(String(req.body.github)))
		return sendError(res, getMissingFieldError("github url"), BAD_REQUEST);
	if (portfolio && !urlRegex.test(String(req.body.portfolio)))
		return sendError(
			res,
			getMissingFieldError("portfolio url"),
			BAD_REQUEST
		);
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

module.exports.updateUserValidation = (req, res, next) => {
	const { role, designation } = req.body;
	if (role && !["core", "member", "graduate"].includes(req.body.role))
		return sendError(res, getMissingFieldError("role"), BAD_REQUEST);
	if (designation)
		req.body.designation = toTitleCase(String(designation).trim());
	return next();
};
module.exports.updateTodo = (req, res, next) => {
	const { status, title, description, dueDate } = req.body;
	if (status && !["pending", "complete"].includes(status))
		return sendError(res, getMissingFieldError("status"), BAD_REQUEST);
	if (title) req.body.title = String(title).trim();
	if (description) req.body.description = String(description).trim();
	if (dueDate) req.body.dueDate = formatHtmlDate(dueDate);
	return next();
};

module.exports.changePasswordValidation = (req, res, next) => {
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !passwordRegex.test(String(oldPassword).trim()))
		return sendError(
			res,
			getMissingFieldError("old password"),
			BAD_REQUEST
		);
	if (!newPassword || !passwordRegex.test(String(newPassword).trim()))
		return sendError(
			res,
			getMissingFieldError("new password"),
			BAD_REQUEST
		);
	if (oldPassword === newPassword)
		return sendError(
			res,
			"New Password cannot be same as old password",
			BAD_REQUEST
		);
	req.body.oldPassword = String(oldPassword).trim();
	req.body.newPassword = String(newPassword).trim();
	return next();
};
