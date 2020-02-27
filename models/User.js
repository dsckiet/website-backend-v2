const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_PRIVATE_KEY } = require("../config/index");

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String },
		role: {
			type: String,
			default: "member",
			enum: ["member", "core", "lead"],
			required: true
		},
		contact: { type: Number },
		img: { type: String },
		designation: { type: String, required: true },
		github: { type: String },
		linkedin: { type: String },
		twitter: { type: String },
		portfolio: { type: String },
		showOnWebsite: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

UserSchema.methods.generateAuthToken = function() {
	const token = jwt.sign(
		{
			id: this._id,
			name: this.name,
			email: this.email,
			role: this.role
		},
		JWT_PRIVATE_KEY
	);
	return token;
};

module.exports = User = mongoose.model("User", UserSchema);
