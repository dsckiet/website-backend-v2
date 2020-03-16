const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		img: { type: String },
		days: { type: Number, default: 1 },
		startDate: Date,
		endDate: Date,
		time: { type: String, required: true },
		venue: { type: String, requried: true },
		isRegistrationRequired: { type: Boolean, default: true },
		isRegistrationOpened: { type: Boolean, default: false },
		code: { type: String, required: true }
	},
	{ timestamps: true }
);

module.exports = Event = mongoose.model("Event", EventSchema);
