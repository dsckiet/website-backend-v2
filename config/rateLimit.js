const rateLimit = require("express-rate-limit");

module.exports.globalRateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: { message: "Too many requests.", error: true, data: null }
});

module.exports.addTodoRateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 20, // limit each IP to 20 requests per windowMs
	message: { message: "Temporarily blocked", error: true, data: null }
});

module.exports.loginRateLimiter = rateLimit({
	windowMs: 1 * 60 * 60 * 1000, // 1 hours
	max: 5, // limit each IP to 5 requests per windowMs
	message: {
		message: "Too many attempts! Try again in few hours",
		error: true,
		data: null
	}
});
