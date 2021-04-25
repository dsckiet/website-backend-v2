// import http status codes
const { BAD_REQUEST } = require("../utility/statusCodes");
// import helper functions
const { sendError, sendSuccess } = require("../utility/helpers");
const { GET_BIRTHDAYS_PROCESS_SECRET } = require("../config/index");

module.exports.index = (req, res) => {
	sendSuccess(res, "Welcome to DSC-KIET API");
};

module.exports.getTodayBirthdays = async (req, res) => {
	let secret = req.headers["x-access-token"];
	if (
		!secret ||
		String(secret).trim() !== String(GET_BIRTHDAYS_PROCESS_SECRET)
	)
		return sendError(res, "Unauthorized: Secret mismatch!", BAD_REQUEST);

	// current time
	let today = new Date();
	// converting local time to UTC
	const utc = today.getTime() + today.getTimezoneOffset() * 60000;
	// converting to GMT + 5.5 for timezone of India
	today = new Date(utc + 3600000 * 5.5);
	// get date and month
	const month = today.getMonth() + 1,
		day = today.getDate();

	const users = await User.aggregate([
		{
			$match: { dob: { $exists: true } }
		},
		{
			$project: {
				month: { $month: "$dob" },
				day: { $dayOfMonth: "$dob" },
				name: 1,
				email: 1,
				image: 1
			}
		},
		{ $match: { month, day } },
		{
			$project: {
				name: 1,
				email: 1,
				image: 1
			}
		}
	]);

	return sendSuccess(res, users);
};
