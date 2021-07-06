const mongoose = require("mongoose");

const TaskAssigneeSchema = new mongoose.Schema(
	{
		assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		status: {
			type: String,
			default: "pending",
			enum: ["pending", "ongoing", "completed", "closed", "overdue"]
		},
		groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
	},
	{ timestamps: true }
);

module.exports = TaskAssignee = mongoose.model(
	"TaskAssignee",
	TaskAssigneeSchema
);
