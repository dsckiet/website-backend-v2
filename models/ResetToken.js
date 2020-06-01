const mongoose = require("mongoose");

const ResetTokenSchema = new mongoose.Schema(
	{
		id: { type: mongoose.Schema.Types.ObjectId, required: true },
		email: { type: String, required: true },
		token: { type: String, required: true },
		expires: { type: Date, required: true }
	},
	{ timestamps: true }
);

module.exports = ResetToken = mongoose.model("ResetToken", ResetTokenSchema);
