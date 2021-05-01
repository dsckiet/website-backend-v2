const { uuid } = require("uuidv4");
const kue = require("../config/Scheduler/kue");
const worker = require("../config/Scheduler/worker");
const ObjectId = require("mongoose").Types.ObjectId;

const { NODE_ENV, AVATAR_URL, FRONTEND_URL } = require("../config/index");
const { formatHtmlDate } = require("../utility/helpers");

// import http status codes
const { BAD_REQUEST, FORBIDDEN } = require("../utility/statusCodes");
// import constants
const { USER_HASH_LENGTH } = require("../config/index");
// import helper functions
const {
	sendError,
	sendSuccess,
	generateHash,
	checkToken,
	setToken,
	getImageKey
} = require("../utility/helpers");
const { uploadImage, deleteImage } = require("../services/imageService");
const { checkAddUser } = require("../middlewares/validations");

module.exports.publicUsersList = async (req, res) => {
	const { uid, sortBy = "name", sortType = "asc" } = req.query;
	let users;
	if (uid) {
		users = await User.findById(uid).lean();
		return sendSuccess(res, users);
	}
	users = await User.find(
		{ showOnWebsite: true, isRevoked: false },
		{
			name: 1,
			email: 1,
			designation: 1,
			role: 1,
			github: 1,
			linkedin: 1,
			twitter: 1,
			portfolio: 1,
			image: 1,
			_id: 0
		}
	)
		.sort({
			role: "asc",
			[sortBy]: sortType
		})
		.lean();
	let leadIndex;
	users.forEach((user, index) => {
		if (user.role === "lead") {
			leadIndex = index;
			return;
		}
	});
	users.unshift(users.splice(leadIndex, 1)[0]);
	return sendSuccess(res, users);
};

module.exports.users = async (req, res) => {
	const { uid, sortBy = "name", sortType = "asc" } = req.query;
	let users;
	if (uid) {
		users = await User.findById(uid).lean();
		return sendSuccess(res, users);
	}
	users = await User.find({ role: { $in: ["lead", "core", "member"] } })
		.sort({
			role: "asc",
			[sortBy]: sortType
		})
		.lean();
	let leadIndex;
	users.forEach((user, index) => {
		if (user.role === "lead") {
			leadIndex = index;
			return;
		}
	});
	users.unshift(users.splice(leadIndex, 1)[0]);
	return sendSuccess(res, users);
};

module.exports.addUser = async (req, res) => {
	const { name, email, role, designation } = req.body;
	let user = await User.findOne({ email });
	if (user) return sendError(res, "User already registered.", BAD_REQUEST);
	if (req.user.role === "core" && (role === "lead" || role === "core"))
		return sendError(
			res,
			"Forbidden: Core members cannot add lead/core members",
			FORBIDDEN
		);
	if (req.user.role === "lead" && role === "lead")
		return sendError(
			res,
			"Forbidden: A lead cannot add another lead",
			FORBIDDEN
		);
	const password = generateHash(USER_HASH_LENGTH);
	user = new User({
		name,
		email,
		role,
		designation,
		password,
		showOnWebsite: ["lead", "graduate"].includes(role) ? true : false,
		image: `${AVATAR_URL}${Math.floor(Math.random() * 10000) + 9999}.svg`
	});
	user = await user.save();
	const token = user.generateAuthToken();
	setToken(String(user._id), token);
	const args = {
		jobName: "sendSystemEmailJob",
		time: Date.now(),
		params: {
			email,
			password,
			name,
			role,
			mailType: "login-creds"
		}
	};
	kue.scheduleJob(args);
	return sendSuccess(res, user);
};

module.exports.addUsers = async (req, res) => {
	let invalidUsers = [];
	let users = req.entries;

	let allUsers = await User.find().lean();
	for (let i = 0; i < users.length; i++) {
		let user = users[i];
		let { name, email, role, designation, branch, year, contact } = user;
		let checkUserValid = checkAddUser(user);
		if (checkUserValid !== "success") {
			invalidUsers.push({
				index: i,
				user: email,
				error: checkUserValid
			});
			continue;
		}
		let alreadyAdded = allUsers.filter(user => {
			return (
				String(user.email).trim().toLowerCase() ===
				String(email).trim().toLowerCase()
			);
		});

		if (alreadyAdded.length) {
			invalidUsers.push({
				index: i,
				user: email,
				error: "user already registered."
			});
			continue;
		}
		const password = generateHash(USER_HASH_LENGTH);
		user = new User({
			name,
			email,
			role,
			designation,
			password,
			branch: branch || undefined,
			year: year ? Number(year) : undefined,
			contact,
			showOnWebsite: ["lead", "graduate"].includes(role) ? true : false,
			image: `${AVATAR_URL}${
				Math.floor(Math.random() * 10000) + 9999
			}.svg`
		});
		user = await user.save();
		const token = user.generateAuthToken();
		setToken(String(user._id), token);
		const args = {
			jobName: "sendSystemEmailJob",
			time: Date.now(),
			params: {
				email,
				password,
				name,
				role,
				mailType: "login-creds"
			}
		};
		kue.scheduleJob(args);
	}
	return sendSuccess(res, {
		totalAdded: users.length - invalidUsers.length,
		totalFailed: invalidUsers.length,
		invalidUsers
	});
};

module.exports.login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({
		email: { $regex: `^${email}$`, $options: "i" }
	});
	if (!user)
		return sendError(
			res,
			"You have entered an invalid email or password.",
			BAD_REQUEST
		);
	const validPassword = await user.isValidPwd(String(password).trim());
	if (!validPassword)
		return sendError(
			res,
			"You have entered an invalid email or password.",
			BAD_REQUEST
		);
	await User.updateOne(
		{ _id: user.id },
		{ $set: { lastLogin: new Date(Date.now()).toISOString() } }
	);
	let token = await checkToken(String(user._id));
	if (!token)
		return sendError(
			res,
			"Account suspended or deleted, Logout!",
			FORBIDDEN
		);
	if (token === "revoke")
		return sendError(res, "Account revoked, Logout!", FORBIDDEN);
	if (token === "revalidate") {
		token = user.generateAuthToken();
		setToken(String(user._id), token);
	}
	return sendSuccess(res, user, token);
};

module.exports.toggleShowOnWeb = async (req, res) => {
	const { uid } = req.params;
	const user = await User.findById(uid).lean();
	if (!user) return sendError(res, "Invalid User", BAD_REQUEST);
	let _user = await User.updateOne(
		{ _id: uid },
		{ $set: { showOnWebsite: Boolean(!user.showOnWebsite) } }
	);
	_user["showOnWebsite"] = Boolean(!user.showOnWebsite);
	return sendSuccess(res, _user);
};

module.exports.userUpdate = async (req, res) => {
	const { uid } = req.params;
	const { designation, role } = req.body;
	const user = await User.findById(uid).lean();
	if (!user) return sendError(res, "Invalid User", BAD_REQUEST);
	const updateObj = {};
	if (designation) updateObj["designation"] = designation;
	if (role) {
		if (
			role === "graduate" &&
			(user.year !== new Date().getFullYear() ||
				new Date().getMonth() < 4)
		)
			return sendError(res, "Operation not permitted.", BAD_REQUEST);
		updateObj["role"] = role;
		setToken(String(uid), "revalidate");
	}
	const _user = await User.findOneAndUpdate(
		{ _id: uid },
		{ $set: updateObj },
		{ $new: true }
	);
	return sendSuccess(res, _user);
};

module.exports.toggleRevoke = async (req, res) => {
	const { uid } = req.params;
	const user = await User.findById(uid).lean();

	if (!user) return sendError(res, "Invalid User", BAD_REQUEST);
	if (user.role === "lead")
		return sendError(res, "Cannot revoke lead token", BAD_REQUEST);
	//toggle the revoke status of user
	let _user = await User.updateOne(
		{ _id: uid },
		{ $set: { isRevoked: Boolean(!user.isRevoked) } }
	);
	_user["isRevoked"] = Boolean(!user.isRevoked);
	//change token status
	_user.isRevoked ? setToken(uid, "revoke") : setToken(uid, "revalidate");
	return sendSuccess(res, _user);
};

module.exports.deleteUser = async (req, res) => {
	const { uid } = req.params;
	const user = await User.findByIdAndDelete(uid).lean();
	if (!user) return sendError(res, "Invalid User", BAD_REQUEST);
	if (user.role === "lead")
		return sendError(
			res,
			"Forbidden: Cannot delete lead account",
			FORBIDDEN
		);
	if (user.image && user.image.includes("amazonaws")) {
		let key = `${user.image.split("/")[3]}/${user.image.split("/")[4]}`;
		await deleteImage(key);
	}
	await Todo.deleteMany({ uid });
	setToken(uid, "delete");
	return sendSuccess(res, null);
};

module.exports.profile = async (req, res) => {
	const pid = req.query.uid || req.user.id;
	const profile = await User.findById(pid).lean();
	if (!profile) return sendError(res, "Invalid User", BAD_REQUEST);
	return sendSuccess(res, profile);
};

module.exports.updateProfile = async (req, res) => {
	const {
		dob,
		branch,
		year,
		github,
		linkedin,
		twitter,
		portfolio,
		contact,
		bio
	} = req.body;
	const profile = await User.findById(req.user.id).lean();
	if (!profile) return sendError(res, "Invalid user", BAD_REQUEST);
	const updateObj = {};
	if (req.files && req.files.length !== 0) {
		let key;
		if (profile.image && profile.image.includes("amazonaws")) {
			key = `${profile.image.split("/")[3]}/${
				profile.image.split("/")[4]
			}`;
			await deleteImage(key);
		}

		key = getImageKey(req.originalUrl);
		const file = req.files[0];
		const uploaded = await uploadImage(file, key);
		if (uploaded) updateObj["image"] = uploaded;
	}

	if (dob) updateObj["dob"] = formatHtmlDate(dob);
	if (branch) updateObj["branch"] = branch;
	if (year) updateObj["year"] = year;
	if (github) updateObj["github"] = github;
	if (linkedin) updateObj["linkedin"] = linkedin;
	if (twitter) updateObj["twitter"] = twitter;
	if (portfolio) updateObj["portfolio"] = portfolio;
	if (contact) updateObj["contact"] = Number(contact);
	if (bio) updateObj["bio"] = bio;
	const _profile = await User.findByIdAndUpdate(
		req.user.id,
		{ $set: updateObj },
		{ new: true }
	).lean();
	return sendSuccess(res, _profile);
};

module.exports.forgotPassword = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email }).lean();
	const resetToken = await ResetToken.findOne({ email }).lean();
	if (!user) return sendError(res, "Invalid user", BAD_REQUEST);
	if (resetToken) await ResetToken.deleteOne({ _id: resetToken._id });
	const newResetToken = new ResetToken({
		email,
		id: user._id,
		token: uuid(),
		expires: Date.now() + 3600000
	});
	await newResetToken.save();
	const args = {
		jobName: "sendSystemEmailJob",
		time: Date.now(),
		params: {
			email,
			name: user.name,
			link: `${FRONTEND_URL}/reset/${user._id}/${newResetToken.token}`,
			mailType: "reset-pwd-link"
		}
	};
	kue.scheduleJob(args);
	return sendSuccess(res, null);
};

module.exports.resetPassword = async (req, res) => {
	const { token, id, pwd } = req.body;
	const user = await User.findById(id);
	const resetToken = await ResetToken.findOne({
		$and: [{ id }, { token }, { expires: { $gte: Date.now() } }]
	}).lean();
	if (!user || !resetToken)
		return sendError(
			res,
			"Reset link is not valid or expired.",
			BAD_REQUEST
		);

	user.password = String(pwd).trim();
	let args = {
		jobName: "sendSystemEmailJob",
		time: Date.now(),
		params: {
			email: user.email,
			name: user.name,
			mailType: "reset-pwd-success"
		}
	};
	kue.scheduleJob(args);
	await user.save();
	await ResetToken.deleteOne({ _id: resetToken._id });
	setToken(id, "revalidate");
	return sendSuccess(res, null);
};

module.exports.changePassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const user = await User.findById(req.user.id);
	const validPassword = await user.isValidPwd(String(oldPassword).trim());
	if (!validPassword)
		return sendError(res, "Invalid old password", BAD_REQUEST);
	user.password = newPassword;
	await user.save();
	setToken(req.user.id, "revalidate");
	let args = {
		jobName: "sendSystemEmailJob",
		time: Date.now(),
		params: {
			email: user.email,
			name: user.name,
			mailType: "change-pwd-success"
		}
	};
	kue.scheduleJob(args);
	return sendSuccess(res, null);
};

module.exports.temp = async (req, res) => {
	if (NODE_ENV === "production") {
		return sendError(res, "Unavailable!!", BAD_REQUEST);
	}

	// // flush users collection
	// await User.remove();

	// // create root lead user
	// let user = await new User({
	// 	name: "Admin User",
	// 	email: "lead@dsckiet.com",
	// 	password: "root@dsckiet123",
	// 	role: "lead",
	// 	designation: "lead",
	// 	image: "https://avatars.dicebear.com/v2/identicon/12718.svg"
	// });
	// const token = user.generateAuthToken();
	// setToken(String(user._id), token);
	// await user.save();

	// create random users
	// console.time("Participants Created in: ");
	// let branches = ["CS", "IT", "EC", "EN", "ME", "CE", "CO", "CSI", "MCA"],
	// 	years = [1, 2, 3, 4],
	// 	chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	// 	numbers = "1234567890";
	// let entries = 200;
	// for (let i = 0; i < entries; i++) {
	// let part = new Participant({
	// 	name: generateHash(10),
	// 	email: `${generateHash(8)}@gmail.com`,
	// 	branch: branches[Math.floor(Math.random() * branches.length)],
	// 	year: years[Math.floor(Math.random() * years.length)],
	// 	password: generateHash(USER_HASH_LENGTH),
	// 	phone: 9876543210
	// });
	// await part.save();
	// 	console.log(`Partcipant ${i} created...`);
	// }
	// console.timeEnd("Participants Created in: ");

	// register random participants in event
	// console.time("Participants Registered in event in: ");
	// // let entries = 200;
	// let eventId = new ObjectId("5e6fe1b985e811179472ca44");
	// let participants = await Participant.find()
	// 	.sort({ name: "asc" })
	// 	.limit(entries);

	// for (let i = 0; i < entries; i++) {
	// 	let attendance = new Attendance({
	// 		participant: new ObjectId(participants[i]._id),
	// 		event: new ObjectId(eventId),
	// 		attend: []
	// 	});

	// 	participants[i].events.push({
	// 		event: new ObjectId(eventId),
	// 		attendance: new ObjectId(attendance._id),
	// 		status: "not attended"
	// 	});
	// 	[part, attendance] = await Promise.all([
	// 		participants[i].save(),
	// 		attendance.save()
	// 	]);
	// 	console.log(`Participant ${i} registered in event`);
	// }
	// console.timeEnd("Participants Registered in event in: ");

	// mark random attendences
	// console.time("Marked in: ");
	// let code = "AyI89CdiIUbWnlWtGMNO",
	// 	eventId = "5e6dfb7caad4441a9ceb5b2e",
	// 	entries = 49;
	// let [event, participants] = await Promise.all([
	// 	Event.findOne({ code }),
	// 	Participant.find({ "events.event": new ObjectId(eventId) }).limit(
	// 		entries
	// 	)
	// ]);
	// if (!event) {
	// 	return sendError(res, "Invalid Code!!", BAD_REQUEST);
	// }
	// let cnt = 0;
	// for (let i = 0; i < entries; i++) {
	// 	let attendance = await Attendance.findOne({
	// 		$and: [{ event: event._id }, { participant: participants[i]._id }]
	// 	});
	// 	if (!attendance) {
	// 		continue;
	// 	}
	// 	let dates = [15, 16, 17, 18, 19];

	// 	let currTime = new Date(Date.now());
	// 	let today = new Date(
	// 		currTime.getFullYear(),
	// 		currTime.getMonth(),
	// 		dates[Math.floor(Math.random() * 5)]
	// 	).toISOString();

	// 	if (
	// 		today < new Date(event.startDate).toISOString() ||
	// 		today > new Date(event.endDate).toISOString()
	// 	) {
	// 		continue;
	// 	}

	// 	let attendIndex = attendance.attend
	// 		.map(attend => {
	// 			return new Date(attend).toISOString();
	// 		})
	// 		.indexOf(today);

	// 	if (attendIndex !== -1) {
	// 		continue;
	// 	} else {
	// 		attendance.attend.push(today);
	// 		let eventInd = participants[i].events
	// 			.map(event => {
	// 				return String(event.event);
	// 			})
	// 			.indexOf(String(event._id));
	// 		let daysPresent = attendance.attend.length;
	// 		if (daysPresent < event.days) {
	// 			participants[i].events[eventInd].status = "partially attended";
	// 		} else {
	// 			participants[i].events[eventInd].status = "attended";
	// 		}
	// 		await Promise.all([attendance.save(), participants[i].save()]);
	// 		console.log(`Attendance Marked for Part ${i} of ${today}`);
	// 		cnt++;
	// 	}
	// }
	// console.log(`Attendences Marked: ${cnt}`);
	// console.timeEnd("Marked in: ");
	sendSuccess(res, null);
};
