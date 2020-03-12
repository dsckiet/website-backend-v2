const kue = require("../config/Scheduler/kue");
const worker = require("../config/Scheduler/worker");

const ObjectId = require("mongoose").Types.ObjectId;

// import http status codes
const { BAD_REQUEST, NOT_ACCEPTABLE } = require("../utility/statusCodes");
// import constants
const { USER_HASH_LENGTH } = require("../config/index");
// import helper functions
const {
	sendError,
	sendSuccess,
	generateHash,
	escapeRegex
} = require("../utility/helpers");

module.exports.getParticipants = async (req, res) => {
	let { eventId, query, branch, year, sortBy } = req.query;
    let filters = {};
    
    if(eventId){
		filters["events.event"] = new ObjectId(eventId)
	};

	if (query) {
		const regex = new RegExp(escapeRegex(query), "gi");
		filters.$or = [{ name: regex }, { email: regex }, { branch: regex }];
	}
	if (branch) {
		filters.branch = branch;
	}
	if (year) {
		filters.year = Number(year);
	}

	let sortObj = {};
	if (sortBy) {
		sortBy.map(sort => {
			if (sort === "createdAt") {
				sortObj[sort] = "desc";
			} else {
				sortObj[sort] = "asc";
			}
		});
	} else {
		sortObj = {
			createdAt: "desc",
			branch: "asc",
			year: "asc",
			name: "asc"
		};
	}

	let participants = await Participant.find(filters).sort(sortObj);
	sendSuccess(res, participants);
};

module.exports.registerParticipant = async (req, res) => {
	let { name, email, branch, year, phone } = req.body;
	let participant = await Participant.findOne({
		$or: [
			{ email: { $regex: `^${email}$`, $options: "i" } },
			{
				$and: [
					{ name: { $regex: `^${name}$`, $options: "i" } },
					{ branch },
					{ year },
					{
						$or: [
							{ email: { $regex: `^${email}$`, $options: "i" } },
							{ phone }
						]
					}
				]
			}
		]
	});

	if (participant) {
		sendError(res, "Already Registered!!", BAD_REQUEST);
	} else {
		let password = await generateHash(USER_HASH_LENGTH);
		participant = new Participant({
			name,
			email,
			branch,
			year,
			phone,
			password,
			events: []
		});
		participant = await participant.save();
		let args = {
			jobName: "sendLoginCreds",
			time: Date.now(),
			params: {
				email,
				password,
				name,
				role: "Participant"
			}
		};
		kue.scheduleJob(args);
		sendSuccess(res, participant);
	}
};

module.exports.updateParticipant = async (req, res) => {
	let { name, email, branch, year, phone } = req.body;
	let updateObj = {
		name,
		email,
		branch,
		year,
		phone
	};
	participant = await Participant.findByIdAndUpdate(
		req.params.id,
		{ $set: updateObj },
		{ new: true }
	);
	if (participant) {
		sendSuccess(res, participant);
	} else {
		sendError(res, "Participant not found!!", BAD_REQUEST);
	}
};

module.exports.participantLogin = async (req, res) => {
	let { email, password } = req.body;
	let participant = await Participant.findOne({
		email: { $regex: `^${email}$`, $options: "i" }
	});
	if (!participant) return sendError(res, "Invalid User", NOT_ACCEPTABLE);
	const validPassword = await participant.isValidPwd(String(password).trim());
	if (!validPassword)
		return sendError(res, "Invalid Password", NOT_ACCEPTABLE);
	const token = participant.generateAuthToken();
	sendSuccess(res, participant, token);
};

module.exports.registerForEvent = async (req, res) => {
	let { participantId, eventId } = req.body;
	if (!participantId || !eventId) {
		return sendError(res, "Invalid Parameters!!", BAD_REQUEST);
	}

	let [participant, event] = await Promise.all([
		Participant.findById(participantId),
		Event.findById(eventID)
	]);

	if (!participant || !event) {
		return sendError(res, "Invalid Request!!", BAD_REQUEST);
	}

	let eventIndex = participant.events
		.map(evnt => {
			return String(evnt.event);
		})
		.indexOf(String(eventId));

	if (eventIndex !== -1) {
		return sendSuccess(res, "Already Registered!!", BAD_REQUEST);
	}

	let attendance = new Attendance({
		participant: new ObjectId(participantId),
		event: new ObjectId(eventID),
		attend: []
	});

	for (let i = 0; i < event.days; i++) {
		let attendObj = {
			day: new Date(event.startDate.getTime() + i * 24 * 60 * 60 * 1000),
			present: false
		};
		attendance.attend.push(attendObj);
	}
	participant.events.push({
		event: new ObjectId(eventID),
		attendance: new ObjectId(attendance._id),
		status: "not attended"
	});
	[participant, attendance] = await Promise.all([
		participant.save(),
		attendance.save()
	]);
	sendSuccess(res, event);
};

module.exports.participantData = async (req, res) => {
	let matchObj = {};

	if (req.user.role === "participant") {
		matchObj._id = new ObjectId(req.user.id);
	} else if (req.query.participantId) {
		matchObj._id = new ObjectId(req.query.participantId);
	} else {
		return sendError(res, "Invalid Request!!", BAD_REQUEST);
	}

	let [participant] = await Participant.aggregate([
		{
			$match: matchObj
		},
		{
			$lookup: {
				from: "events",
				localField: "events.event",
				foreignField: "_id",
				as: "eventsList"
			}
		},
		{
			$project: {
				"eventsList.title": 1,
				"eventsList.description": 1,
				"eventsList.img": 1,
				"eventsList.days": 1,
				"eventsList.startDate": 1,
				"eventsList.endDate": 1,
				"eventsList.venue": 1,
				"eventsList.time": 1,
				"eventsList._id": 1,
				events: 1,
				name: 1,
				email: 1,
				branch: 1,
				year: 1,
				phone: 1
			}
		}
	]);

	if (!participant) {
		return sendError(res, "Participant not found!!", BAD_REQUEST);
	}

	let profileData = {
		name: participant.name,
		email: participant.email,
		branch: participant.branch,
		year: participant.year,
		phone: participant.phone
	};

	let eventsArray = [];
	participant.events.map(event => {
		let eventListIndex = participant.eventsList
			.map(ev => {
				return String(ev._id);
			})
			.indexOf(String(event.event));
		eventsArray.push({
			...event,
			details: participant.eventsList[eventListIndex]
		});
	});

	let data = {
		profileData,
		events: eventsArray
	};

	sendSuccess(res, data);
};
