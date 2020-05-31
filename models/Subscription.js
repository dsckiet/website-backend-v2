const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
	{
		subject: { type: String, required: true },
		content: { type: String, required: true }
	},
	{ timestamps: true }
);

module.exports = Subscription = mongoose.model(
	"Subscription",
	SubscriptionSchema
);
