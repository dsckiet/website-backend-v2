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
	let { eid } = data;
	let log = `Event Deletion scheduled for: ${eid}`;
	logger("info", "scheduler", log);
	console.log(log);

	let promises = [
		Event.findByIdAndDelete(eid),
		Attendance.deleteMany({ eid: new ObjectId(eid) }),
		Feedback.deleteMany({ eid: new ObjectId(eid) })
	];

	let participants = await Participant.find({
		"events.eid": new ObjectId(eid)
	});
	participants.map(part => {
		let eventInd = part.events
			.map(evnt => {
				return String(evnt.eid);
			})
			.indexOf(String(eid));
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
		await sendGeneralEmail(
			data.email,
			data.subject,
			data.content,
			data.name
		);
		done();
	} catch (err) {
		console.log(err);
		logger("error", "scheduler", err);
		done(err);
	}
});
