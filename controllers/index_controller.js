// import http status codes
const {
	BAD_REQUEST,
	NOT_AUTHORIZED,
	FORBIDDEN,
	NOT_FOUND,
	NOT_ACCEPTABLE
} = require("../utility/statusCodes");
// import helper functions
const { sendError, sendSuccess } = require("../utility/helpers");

module.exports.index = (req, res) => {
	sendSuccess(res, "Welcome to DSC-KIET API");
};
