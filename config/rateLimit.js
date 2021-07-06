const RateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const { NODE_ENV } = require(".");

const constructRateLimitObj = (windowMs, max, message, opts) => {
	return {
		windowMs,
		max,
		message: { message, error: true, data: null },
		keyGenerator: req =>
			req.user
				? req.user.id
				: req.headers["x-real-ip"] || req.headers["x-forwarded-for"],
		...opts
	};
};

const getAuthRateLimitObj = constructRateLimitObj(
	3600000,
	3,
	"Too many attempts! Try again in few hours"
);

module.exports.globalRateLimiter =
	NODE_ENV !== "production"
		? (req, res, next) => next()
		: new RateLimit({
				store: new RedisStore({ prefix: "rl:global" }),
				...constructRateLimitObj(60000, 100, "Too many requests.")
		  });

module.exports.addTodoRateLimiter =
	NODE_ENV !== "production"
		? (req, res, next) => next()
		: new RateLimit({
				store: new RedisStore({ prefix: "rl:addTodo" }),
				...constructRateLimitObj(60000, 20, "Temporarily blocked")
		  });

module.exports.loginRateLimiter =
	NODE_ENV !== "production"
		? (req, res, next) => next()
		: new RateLimit({
				store: new RedisStore({ prefix: "rl:login" }),
				...getAuthRateLimitObj
		  });

module.exports.changePasswordRateLimiter =
	NODE_ENV !== "production"
		? (req, res, next) => next()
		: new RateLimit({
				store: new RedisStore({ prefix: "rl:changePwd" }),
				...getAuthRateLimitObj
		  });

module.exports.forgotPasswordRateLimiter =
	NODE_ENV !== "production"
		? (req, res, next) => next()
		: new RateLimit({
				store: new RedisStore({ prefix: "rl:forgotPwd" }),
				...getAuthRateLimitObj
		  });

module.exports.resetPasswordRateLimiter =
	NODE_ENV !== "production"
		? (req, res, next) => next()
		: new RateLimit({
				store: new RedisStore({ prefix: "rl:resetPwd" }),
				...getAuthRateLimitObj
		  });

module.exports.updateProfileRateLimiter =
	NODE_ENV !== "production"
		? (req, res, next) => next()
		: new RateLimit({
				store: new RedisStore({ prefix: "rl:updateProfile" }),
				...constructRateLimitObj(
					86400000,
					3,
					"Too many attempts! Try again after 1 day"
				)
		  });
