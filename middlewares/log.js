const chalk = require("chalk");
const _ = require("lodash");
const {
	formatHrTime,
	getValueFromCache,
	setValueInCache
} = require("../utility/helpers");
const User = require("../models/User");
const { NODE_ENV } = require("../config");

module.exports.logRequestMiddleware = async (req, res, next) => {
	const startTime = new Date();
	const startTimeHrt = process.hrtime();
	res.on("finish", async () => {
		const requestDuration = formatHrTime(process.hrtime(startTimeHrt));
		const statusCode = res.statusCode < 400 ? 200 : res.statusCode;
		let body = {};
		let statusLogColor;
		if (statusCode < 400) {
			statusLogColor = chalk.green;
		} else if (statusCode < 500) {
			statusLogColor = chalk.yellow;
		} else {
			statusLogColor = chalk.red;
		}

		console.log(
			chalk.cyan(`[${startTime.toLocaleString()}]`),
			chalk.magenta(req.method),
			req.originalUrl,
			statusLogColor(statusCode),
			chalk.yellow(`${Math.round(requestDuration * 100) / 100} ms`)
		);
		if (req.body && Object.keys(req.body).length) {
			body = _.omit(req.body, [
				"password",
				"oldPassword",
				"newPassword",
				"pwd"
			]);
			console.log(chalk.blue(JSON.stringify(body, null, 2)));
		}

		const parsedPathName = req.originalUrl.split("?").shift();
		Log.create({
			route: `${req.method} ${
				parsedPathName[parsedPathName.length - 1] === "/"
					? parsedPathName.slice(0, -1)
					: parsedPathName
			}`,
			duration: requestDuration,
			time: startTime,
			context: {
				body,
				query: req.query,
				user: req.user
			},
			status: statusCode
		});
		if (req.user && req.user.id) {
			const isLastActiveTimeInCache = await getValueFromCache(
				`recent session: ${req.user.id}`
			);
			if (!isLastActiveTimeInCache) {
				await User.updateOne(
					{ _id: req.user.id },
					{ $set: { lastActiveAt: new Date().toISOString() } }
				);
				setValueInCache(
					`recent session: ${req.user.id}`,
					String(new Date().toISOString()),
					5 * 60
				);
			}
		}
	});
	next();
};
