const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String },
		taskAssignees: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "TaskAssignee" }
		],
		dueDate: { type: Date },
		assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
	},
	{ timestamps: true }
);

module.exports = Task = mongoose.model("Task", TaskSchema);
