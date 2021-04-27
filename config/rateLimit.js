const RateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");

/*
since global rate limiter is applied to all routes
to add route specific rate limiting,
double the max
*/

const constructRateLimitObj = (windowMs, max, message, opts) => {
	return {
		windowMs,
		max,
		message: { message, error: true, data: null },
		keyGenerator: req => (req.user ? req.user.id : req.ip),
		...opts
	};
};

const getAuthRateLimitObj = constructRateLimitObj(
	3600000,
	10,
	"Too many attempts! Try again in few hours",
	{ skipSuccessfulRequests: true }
);

module.exports.globalRateLimiter = new RateLimit({
	store: new RedisStore({ prefix: "rl:global" }),
	...constructRateLimitObj(60000, 100, "Too many requests.")
});

module.exports.addTodoRateLimiter = new RateLimit({
	store: new RedisStore({ prefix: "rl:addTodo" }),
	...constructRateLimitObj(60000, 40, "Temporarily blocked")
});

module.exports.loginRateLimiter = new RateLimit({
	store: new RedisStore({ prefix: "rl:login" }),
	...getAuthRateLimitObj
});

module.exports.changePasswordRateLimiter = new RateLimit({
	store: new RedisStore({ prefix: "rl:changePwd" }),
	...getAuthRateLimitObj
});

module.exports.forgotPasswordRateLimiter = new RateLimit({
	store: new RedisStore({ prefix: "rl:forgotPwd" }),
	...getAuthRateLimitObj
});

module.exports.resetPasswordRateLimiter = new RateLimit({
	store: new RedisStore({ prefix: "rl:resetPwd" }),
	...getAuthRateLimitObj
});

module.exports.updateProfileRateLimiter = new RateLimit({
	store: new RedisStore({ prefix: "rl:updateProfile" }),
	...constructRateLimitObj(
		86400000,
		6,
		"Too many attempts! Try again after 1 day",
		{ skipSuccessfulRequests: true }
	)
});
