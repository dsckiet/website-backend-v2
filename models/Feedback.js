const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
	{
		eid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event"
		},
		pid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Participant"
		},
		feedback: []
	},
	{ timestamps: true }
);

module.exports = Feedback = mongoose.model("Feedback", FeedbackSchema);
