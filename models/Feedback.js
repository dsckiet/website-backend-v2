const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
	{
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event"
		},
		participant: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Participant"
		},
		feedback: []
	},
	{ timestamps: true }
);

module.exports = Feedback = mongoose.model("Feedback", FeedbackSchema);
