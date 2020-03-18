const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_PRIVATE_KEY } = require("../config/index");
const { toTitleCase } = require("../utility/helpers");
const bcrypt = require("bcryptjs");

const ParticipantSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		branch: { type: String, required: true },
		year: { type: Number, required: true },
		phone: { type: Number, required: true },
		password: { type: String, required: true },
		isVerified: { type: Boolean, default: false },
		isRevoked: {type:Boolean,default:false},
		image: { type: String },
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
		lastLogin: { type: Date, default: Date.now }
	},
	{ timestamps: true }
);

ParticipantSchema.pre("save", async function(next) {
	this.name = toTitleCase(String(this.name));
	this.email = String(this.email).toLowerCase();
	if (!this.isModified("password")) return next();
	let salt = await bcrypt.genSalt(10);
	let hash = await bcrypt.hash(this.password, salt);
	this.password = hash;
	next();
});

ParticipantSchema.methods.isValidPwd = async function(password) {
	let isMatchPwd = await bcrypt.compare(password, this.password);
	return isMatchPwd;
};

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
