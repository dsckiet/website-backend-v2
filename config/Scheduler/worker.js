const kue = require("kue");
const ObjectId = require("mongoose").Types.ObjectId;

const Queue = kue.createQueue({
	redis: process.env.REDIS_URL
});
const { logger } = require("../../utility/helpers");
const { sendLoginCredsMail } = require("../emailService");

Queue.process("sendLoginCreds", async (job, done) => {
	let { data } = job;
	let log =
		"Login Details sent to: " + data.email + " at " + Date(Date.now());
	logger("info", "scheduler", log);
	console.log(log);
	await sendLoginCredsMail(data.email, {
		name: data.name,
		password: data.password,
		role: data.role
	});
	done();
});

Queue.process("deleteEvent", async (job, done) => {
	let { data } = job;
	let id = data.eventId;
	let log = `Event Deletion scheduled for: ${id}`;
	logger("info", "scheduler", log);
	console.log(log);

	let promises = [
		Event.findByIdAndDelete(id),
		Attendance.deleteMany({ event: new ObjectId(id) })
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
