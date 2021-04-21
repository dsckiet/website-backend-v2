const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
	{
		uid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		title: { type: String, required: true },
		description: { type: String },
		status: {
			type: String,
			required: true,
			default: "pending",
			enum: ["pending", "complete"]
		}
	},
	{ timestamps: true }
);

module.exports = Todo = mongoose.model("Todo", TodoSchema);
