const csvtojson = require("csvtojson");
const { sendError } = require("../utility/helpers");
const { BAD_REQUEST } = require("../utility/statusCodes");

module.exports.getArrayFromCsv = async (req, res, next) => {
	try {
		let results = await csvtojson().fromString(
			req.files[0].buffer.toString()
		);
		req.entries = results;
		return next();
	} catch (err) {
		console.log(err);
		return sendError(
			res,
			"Something went wrong while processing file.",
			BAD_REQUEST
		);
	}
};
