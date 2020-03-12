const kue = require("kue");
const Queue = kue.createQueue({
	redis: process.env.REDIS_URL
});

module.exports.scheduleJob = data => {
	if (data.time !== 1000) {
		console.log(`${data.jobName} job scheduled at: ${new Date(data.time)}`);
	}
	Queue.createJob(data.jobName, data.params)
		.attempts(3)
		.delay(data.time - Date.now()) // relative to now.
		.save();
};
