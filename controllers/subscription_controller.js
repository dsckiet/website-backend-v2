const kue = require("../config/Scheduler/kue");
const worker = require("../config/Scheduler/worker");

// import helper functions
const { sendError, sendSuccess } = require("../utility/helpers");
const { BAD_REQUEST } = require("../utility/statusCodes");

const scheduleMailsInBatches = (users, jobName, props) => {
	let batchSize = 20;
	let initial = 0,
		i = 0;
	while (initial < users.length) {
		let currentBatch = users.slice(initial, initial + batchSize);
		let start_time = Date.now() + i * 2 * 1000;
		//do stuff with currentbatch
		currentBatch.map((user, index) => {
			let args = {
				jobName,
				time: start_time + index,
				params: {
					email: user.email,
					...props
				}
			};
			kue.scheduleJob(args);
		});

		i = i + 1;
		initial = initial + batchSize;
	}
	return;
};

module.exports.subscribers = async (req, res) => {
	let subscribers = await Subscriber.find().sort({ createdAt: "desc" });
	return sendSuccess(res, subscribers);
};

module.exports.subscribe = async (req, res) => {
	let { email } = req.body;
	email = String(email).trim().toLowerCase();
	let subscriber = await Subscriber.findOne({ email });
	if (!subscriber) {
		subscriber = new Subscriber({
			email
		});
		await subscriber.save();
		let args = {
			jobName: "sendSystemEmailJob",
			time: Date.now(),
			params: {
				email: email,
				mailType: "subscriber-welcome"
			}
		};
		kue.scheduleJob(args);
	}
	return sendSuccess(res, null);
};

module.exports.unsubscribe = async (req, res) => {
	let { sid } = req.params;
	await Subscriber.findByIdAndDelete(sid);
	return sendSuccess(res, null);
};

module.exports.subscriptions = async (req, res) => {
	let subscriptions = await Subscription.find().sort({ createdAt: "desc" });
	return sendSuccess(res, subscriptions);
};

module.exports.sendSubscription = async (req, res) => {
	let { subject, content } = req.body;

	if (!subject || !content) {
		return sendError(res, "Please enter subject and content.", BAD_REQUEST);
	}
	let subscription = new Subscription({
		subject,
		content
	});

	let [subscribers, save] = await Promise.all([
		Subscriber.find(),
		subscription.save()
	]);

	let params = {
			mailType: "subscription",
			subject,
			content
		},
		jobname = "sendGeneralEmailJob";

	scheduleMailsInBatches(subscribers, jobname, params);
	return sendSuccess(res, null);
};
