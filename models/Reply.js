const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema(
	{
		cid: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
		text: { type: String, required: true },
		uid: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
	},
	{ timestamps: true }
);

module.exports = Reply = mongoose.model("Reply", ReplySchema);
