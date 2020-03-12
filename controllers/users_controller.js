const kue = require("../config/Scheduler/kue");
const worker = require("../config/Scheduler/worker");

const { ENV } = require("../config/index");

// import http status codes
const {
	BAD_REQUEST,
	NOT_AUTHORIZED,
	NOT_ACCEPTABLE
} = require("../utility/statusCodes");
// import constants
const { USER_HASH_LENGTH } = require("../config/index");
// import helper functions
const { sendError, sendSuccess, generateHash } = require("../utility/helpers");

module.exports.users = async (req, res) => {
	let { id, sortBy, sortType } = req.query;
	let users;
	if (id) {
		users = await User.findById(id);
	} else {
		let role = ["core", "member"];
		sortBy ? sortBy : "name";
		sortType ? sortType : "asc";
		users = await User.find({ role: { $in: role } }).sort({
			[sortBy]: sortType
		});
	}
	sendSuccess(res, users);
};

module.exports.addUser = async (req, res) => {
	let { name, email, role, designation } = req.body;
	let user = await User.findOne({ email });
	if (user) {
		sendError(res, "Already exist!!", BAD_REQUEST);
	} else {
		if (req.user.role === "core" && (role === "lead" || role === "core")) {
			sendError(
				res,
				"Forbidden: Core members cannot add lead/core members",
				NOT_AUTHORIZED
			);
		} else if (req.user.role === "lead" && role === "lead") {
			sendError(
				res,
				"Forbidden: A lead cannot add another lead",
				NOT_AUTHORIZED
			);
		} else {
			let password = generateHash(USER_HASH_LENGTH);
			user = new User({
				name,
				email,
				role,
				designation,
				password
			});
			user = await user.save();
			let args = {
				jobName: "sendLoginCreds",
				time: Date.now(),
				params: {
					email,
					password,
					name,
					role
				}
			};
			kue.scheduleJob(args);
			sendSuccess(res, user);
		}
	}
};

module.exports.login = async (req, res) => {
	let { email, password } = req.body;
	let user = await User.findOne({
		email: { $regex: `^${email}$`, $options: "i" }
	});
	if (!user) return sendError(res, "Invalid User", NOT_ACCEPTABLE);
	const validPassword = await user.isValidPwd(String(password).trim());
	if (!validPassword)
		return sendError(res, "Invalid Password", NOT_ACCEPTABLE);
	const token = user.generateAuthToken();
	sendSuccess(res, user, token);
};

module.exports.approveUser = async (req, res) => {
	let { role, showOnWebsite } = req.body;
	let user = await User.findById(req.params.id);
	user.role = role;
	user.showOnWebsite = showOnWebsite;
	user = await user.save();
	sendSuccess(res, user);
};

module.exports.deleteUser = async (req, res) => {
	let user = User.findById(req.params.id);
	if (req.user.role === "core" && user.role !== "member") {
		sendError(
			res,
			"Forbidden: Core members cannot delete lead/core members",
			NOT_AUTHORIZED
		);
	} else {
		await user.delete();
		sendSuccess(res, null);
	}
};

module.exports.profile = async (req, res) => {
	let profile;
	if (req.query.id) {
		profile = await User.findById(req.query.id);
	} else {
		profile = await User.findById(req.user.id);
	}
	sendSuccess(res, profile);
};

module.exports.updateProfile = async (req, res) => {
	let {
		name,
		password,
		contact,
		designation,
		github,
		linkedin,
		twitter,
		portfolio
	} = req.body;
	let profile = await User.findById(req.query.id);
	profile.name = name;
	profile.contact = contact;
	profile.designation = designation;
	profile.github = github;
	profile.linkedin = linkedin;
	profile.twitter = twitter;
	profile.portfolio = portfolio;
	profile.password = password;
	profile = await profile.save();
	sendSuccess(res, profile);
};

module.exports.temp = async (req, res) => {
	if(ENV === "prod") {
		return sendError(res, "Unavailable!!", BAD_REQUEST)
	}

	let user = await new User({
		name: "root",
		email: "root@dsckiet.tech",
		password: "root@dsckiet123",
		role: "lead",
		designation: "lead"
	});
	await user.save();
	sendSuccess(res, null)
}