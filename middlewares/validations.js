const { sendError } = require("../utility/helpers");
const { BAD_REQUEST } = require("../utility/statusCodes");

let emailRegex = /^\S+@\S+\.\S+/,
	passwordRegex = /^[\S]{8,}/;

module.exports.userValidation = (req, res, next) => {
	let { name, email, password } = req.body;
	if (!name | !email) {
		return sendError(res, "Email and name are mandatory!!", BAD_REQUEST);
	}
	if (emailRegex.test(String(email))) {
		return next();
	} else {
		return sendError(res, "Email not Valid!!", BAD_REQUEST);
	}
};
