const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
	{
		taid: { type: mongoose.Schema.Types.ObjectId, ref: "TaskAssignee" },
		text: { type: String, required: true },
		uid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		isResolved: { type: Boolean, default: false },
		isThread: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

module.exports = Comment = mongoose.model("Comment", CommentSchema);
