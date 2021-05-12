// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
module.exports.config = {
	app_name: [process.env.NEW_RELIC_APP_NAME],
	license_key: process.env.NEW_RELIC_LICENSE,
	distributed_tracing: {
		enabled: true
	},
	logging: {
		level: "info"
	},
	audit_log: true,
	allow_all_headers: true,
	attributes: {
		exclude: [
			"request.headers.cookie",
			"request.headers.authorization",
			"request.headers.proxyAuthorization",
			"request.headers.setCookie*",
			"request.headers.x*",
			"response.headers.cookie",
			"response.headers.authorization",
			"response.headers.proxyAuthorization",
			"response.headers.setCookie*",
			"response.headers.x*"
		]
	}
};
