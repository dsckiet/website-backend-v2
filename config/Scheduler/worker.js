const kue = require("kue");
const ObjectId = require("mongoose").Types.ObjectId;
const { catchErrors } = require("../errorHandler");

const Queue = kue.createQueue({
	redis: process.env.REDIS_URL
});
const { logger } = require("../../utility/helpers");
const { sendLoginCredsMail, sendPwdResetLinkMail } = require("../emailService");

Queue.process("sendLoginCreds", async (job, done) => {
	let { data } = job;
	let log =
		"Login Details sent to: " + data.email + " at " + Date(Date.now());
	logger("info", "scheduler", log);
	console.log(log);
	try {
		await sendLoginCredsMail(data.email, {
			name: data.name,
			password: data.password,
			role: data.role
		});
		done();
	} catch (err) {
		done(err);
	}
});

Queue.process("deleteEvent", async (job, done) => {
	let { data } = job;
	let id = data.eventId;
	let log = `Event Deletion scheduled for: ${id}`;
	logger("info", "scheduler", log);
	console.log(log);

	let promises = [
		Event.findByIdAndDelete(id),
		Attendance.deleteMany({ event: new ObjectId(id) }),
		Feedback.deleteMany({ event: new ObjectId(id) })
	];

	let participants = await Participant.find({
		"events.event": new ObjectId(id)
	});
	participants.map(part => {
		let eventInd = part.events
			.map(evnt => {
				return String(evnt.event);
			})
			.indexOf(String(id));
		part.events.splice(eventInd, 1);
		promises.push(part.save());
	});

	await Promise.all(promises);
	done();
});

Queue.process("sendPwdResetLink", async (job, done) => {
	let { data } = job;
	let log =
		"Password reset link sent to: " + data.email + " at " + Date(Date.now());
	logger("info", "scheduler", log);
	console.log(log);
	try {
		await sendPwdResetLinkMail(data.email, {
			name: data.name,
			link: data.link
		});
		done();
	} catch (err) {
		done(err);
	}
});