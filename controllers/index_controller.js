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
const { GET_BIRTHDAYS_PROCESS_SECRET } = require("../config/index");

module.exports.index = (req, res) => {
	sendSuccess(res, "Welcome to DSC-KIET API");
};

module.exports.getTodayBirthdays = async (req, res) => {
	// - for local (IST):
	// dob in schema is in UTC (1 day before @ 0:0)
	// so actually will fetch in UTC timezone, one day earlier;
	// - for production (UTC)
	// dob is in UTC,
	// today will be same @0:0
	// accurate results will be fetched

	// [IMPORTANT] for production: handle as per server timezone

	let secret = req.headers["x-access-token"];
	if (
		!secret ||
		String(secret).trim() !== String(GET_BIRTHDAYS_PROCESS_SECRET)
	) {
		return sendError(res, "Unauthorized: Secret mismatch!", BAD_REQUEST);
	}

	let today = new Date();
	let month = today.getMonth() + 1,
		day = today.getDate();

	let users = await User.aggregate([
		{
			$match: { dob: { $exists: true } }
		},
		{
			$project: {
				month: { $month: "$dob" },
				day: { $dayOfMonth: "$dob" },
				name: 1,
				email: 1
			}
		},
		{ $match: { month, day } },
		{
			$project: {
				name: 1,
				email: 1
			}
		}
	]);

	return sendSuccess(res, users);
};
