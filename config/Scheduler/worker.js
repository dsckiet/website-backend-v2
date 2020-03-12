const kue = require("kue");
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
