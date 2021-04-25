const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
	{
		route: { type: String, required: true },
		duration: { type: Number },
		time: { type: Date },
		user: { type: Object },
		status: { type: Number },
		context: { type: Object }
	},
	{ timestamps: true }
);

module.exports = Log = mongoose.model("Log", LogSchema);
