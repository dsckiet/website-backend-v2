const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
	{
		eid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event"
		},
		pid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Participant"
		},
		daysAttended: []
	},
	{ timestamps: true }
);

module.exports = Attendance = mongoose.model("Attendance", AttendanceSchema);
