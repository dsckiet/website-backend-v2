const kue = require("kue");

const Queue = kue.createQueue({
	redis: process.env.REDIS_URL
});
const { logger } = require("../../utility/helpers");
const {
	sendSystemEmail,
	sendGeneralEmail
} = require("../../services/emailService");
const { NODE_ENV } = require("..");

Queue.process("sendSystemEmailJob", async (job, done) => {
	let { data } = job;
	try {
		await sendSystemEmail(data.email, data, data.mailType);
		logger("info", "email", {
			type: "success",
			to: data.email,
			mailType: data.mailType,
			data: NODE_ENV !== "production" ? data : undefined
		});
		console.log(
			`${data.mailType} email sent to ${data.email} at ${Date(
				Date.now()
			)}`
		);
		done();
	} catch (err) {
		console.log(err);
		logger(
			"error",
			"email",
			{
				type: "failure",
				to: email,
				mailType: data.mailType,
				data: NODE_ENV !== "production" ? data : undefined,
				message: err.message,
				status: err.status || SERVER_ERROR,
				stack: err.stack
			},
			err
		);
		done(err);
	}
});

Queue.process("sendGeneralEmailJob", async (job, done) => {
	let { data } = job;
	try {
		await sendGeneralEmail(data.email, data.subject, data.content);
		logger("info", "email", {
			type: "success",
			to: data.email,
			subject: data.subject,
			data: NODE_ENV !== "production" ? data.content : undefined
		});
		console.log(
			`${data.mailType} email sent to ${data.email} at ${Date(
				Date.now()
			)}`
		);
		done();
	} catch (err) {
		console.log(err);
		logger(
			"error",
			"email",
			{
				type: "failure",
				to: data.email,
				subject: data.subject,
				data: NODE_ENV !== "production" ? data.content : undefined,
				message: err.message,
				status: err.status || SERVER_ERROR,
				stack: err.stack
			},
			err
		);
		done(err);
	}
});
