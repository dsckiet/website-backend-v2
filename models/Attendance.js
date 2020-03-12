const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
	{
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event"
		},
		participant: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Participant"
		},
		attend: [
			{
				day: Date,
				present: { type: Boolean }
			}
		]
	},
	{ timestamps: true }
);

module.exports = Attendance = mongoose.model("Attendance", AttendanceSchema);
