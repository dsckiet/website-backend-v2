const kue = require("../config/Scheduler/kue");
const worker = require("../config/Scheduler/worker");
const ObjectId = require("mongoose").Types.ObjectId;

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
	user.lastLogin = new Date(Date.now()).toISOString();
	await user.save();
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
	if (ENV === "prod") {
		return sendError(res, "Unavailable!!", BAD_REQUEST);
	}

	// create root lead user
	// let user = await new User({
	// 	name: "root",
	// 	email: "root@dsckiet.tech",
	// 	password: "root@dsckiet123",
	// 	role: "lead",
	// 	designation: "lead"
	// });
	// await user.save();

	// create random users
	// console.time("Participants Created in: ");
	// let branches = ["CS", "IT", "EC", "EN", "ME", "CE", "CO", "CSI", "MCA"],
	// 	years = [1, 2, 3, 4],
	// 	chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	// 	numbers = "1234567890";
	// let entries = 200;
	// for (let i = 0; i < entries; i++) {
	// 	let part = new Participant({
	// 		name: generateHash(10),
	// 		email: `${generateHash(8)}@gmail.com`,
	// 		branch: branches[Math.floor(Math.random() * branches.length)],
	// 		year: years[Math.floor(Math.random() * years.length)],
	// 		password: generateHash(USER_HASH_LENGTH),
	// 		phone: 9876543210
	// 	});
	// 	await part.save();
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
