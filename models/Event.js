const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		image: { type: String },
		days: { type: Number, default: 1 },
		startDate: Date,
		endDate: Date,
		time: { type: String, required: true },
		venue: { type: String, requried: true },
		isRegistrationRequired: { type: Boolean, default: true },
		isRegistrationOpened: { type: Boolean, default: false },
		registrations: { type: Number, default: 0 },
		maxRegister: { type: Number, default: 100 },
		code: { type: String, required: true },
		certificateMeta: {
			pdfFileName: { type: String, required: true },
			fontFileName: { type: String, required: true },
			x: { type: String, required: true },
			y: { type: String, required: true },
			size: { type: String, required: true },
			red: { type: String, required: true },
			green: { type: String, required: true },
			blue: { type: String, required: true }
		}
	},
	{ timestamps: true }
);

module.exports = Event = mongoose.model("Event", EventSchema);
