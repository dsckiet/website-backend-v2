const kue = require("kue");
const ObjectId = require("mongoose").Types.ObjectId;
const { catchErrors } = require("../errorHandler");

const Queue = kue.createQueue({
	redis: process.env.REDIS_URL
});
const { logger } = require("../../utility/helpers");
const { sendSystemEmail, sendGeneralEmail } = require("../emailService");

Queue.process("sendSystemEmailJob", async (job, done) => {
	let { data } = job;
	let log = `${data.mailType} email sent to ${data.email} at ${Date(
		Date.now()
	)}`;
	logger("info", "scheduler", log);
	console.log(log);
	try {
		await sendSystemEmail(data.email, data, data.mailType);
		done();
	} catch (err) {
		console.log(err);
		logger("error", "scheduler", err);
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

Queue.process("sendGeneralEmailJob", async (job, done) => {
	let { data } = job;
	let log = `${data.mailType} email sent to ${data.email} at ${Date(
		Date.now()
	)}`;
	logger("info", "scheduler", log);
	console.log(log);
	try {
		await sendGeneralEmail(data.email, data.subject, data.content);
		done();
	} catch (err) {
		console.log(err);
		logger("error", "scheduler", err);
		done(err);
	}
});
