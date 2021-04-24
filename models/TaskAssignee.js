const mongoose = require("mongoose");

const TaskAssigneeSchema = new mongoose.Schema(
	{
		assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		isComplete: { type: Boolean, default: false, required: true },
		assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		status: { type: String, default: "pending" },
		groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
	},
	{ timestamps: true }
);

module.exports = TaskAssignee = mongoose.model(
	"TaskAssignee",
	TaskAssigneeSchema
);
