const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		heads: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		// change lead to head
		members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
	},
	{ timestamps: true }
);

module.exports = Group = mongoose.model("Group", GroupSchema);
