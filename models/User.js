const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {
	JWT_PRIVATE_KEY,
	JWT_ISSUER,
	JWT_AUDIENCE,
	JWT_ALGORITHM
} = require("../config/index");
const { toTitleCase, generateHash } = require("../utility/helpers");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		role: {
			type: String,
			default: "member",
			enum: ["member", "core", "lead", "graduate"],
			required: true
		},
		contact: { type: Number },
		designation: { type: String, required: true },
		github: { type: String },
		linkedin: { type: String },
		twitter: { type: String },
		portfolio: { type: String },
		showOnWebsite: { type: Boolean, default: false },
		image: { type: String },
		dob: { type: Date },
		bio: { type: String },
		isRevoked: { type: Boolean, default: false },
		lastLogin: { type: Date, default: Date.now },
		lastActiveAt: { type: Date },
		year: { type: Number },
		branch: {
			type: String,
			enum: ["CS", "IT", "EC", "EN", "ME", "CE", "CO", "CSI", "MCA"]
		}
	},
	{ timestamps: true }
);

UserSchema.pre("save", async function (next) {
	this.name = toTitleCase(String(this.name));
	this.email = String(this.email).toLowerCase();
	if (!this.isModified("password")) return next();
	let salt = await bcrypt.genSalt(10);
	let hash = await bcrypt.hash(this.password, salt);
	this.password = hash;
	next();
});

UserSchema.methods.isValidPwd = async function (password) {
	let isMatchPwd = await bcrypt.compare(password, this.password);
	return isMatchPwd;
};

UserSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{
			id: this._id,
			name: this.name,
			email: this.email,
			role: this.role
		},
		JWT_PRIVATE_KEY,
		{
			algorithm: JWT_ALGORITHM,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
			jwtid: generateHash(10)
		}
	);
	return token;
};

module.exports = User = mongoose.model("User", UserSchema);
