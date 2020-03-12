const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_PRIVATE_KEY } = require("../config/index");
const { toTitleCase } = require("../utility/helpers");

const ParticipantSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		branch: { type: String, required: true },
		year: { type: Number, required: true },
		phone: { type: Number, required: true },
		code: { type: String, required: true },
		isVerified: { type: Boolean, default: true },
		events: [
			{
				event: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Event"
				},
				attendance: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Attendance"
				},
				status: {
					type: String,
					enum: ["not attended", "partially attended", "attended"],
					default: "not attended"
				}
			}
		],
		emailSent: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

ParticipantSchema.pre("save", async function(next) {
	this.name = toTitleCase(String(this.name));
	this.email = String(this.email).toLowerCase();
	next();
});

ParticipantSchema.methods.generateAuthToken = function() {
	const token = jwt.sign(
		{
			id: this._id,
			name: this.name,
			email: this.email,
			role: "participant"
		},
		JWT_PRIVATE_KEY
	);
	return token;
};

module.exports = Participant = mongoose.model("Participant", ParticipantSchema);
