const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema(
	{
		email: { type: String, required: true }
	},
	{ timestamps: true }
);

module.exports = Subscriber = mongoose.model("Subscriber", SubscriberSchema);
