const nodemailer = require("nodemailer");
var htmlToText = require("nodemailer-html-to-text").htmlToText;

let { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, SENDER_EMAIL } = require("./index");
let { getMailTemplate } = require("../utility/emailTemplates");
const { logger } = require("../utility/helpers");

const transporter = nodemailer.createTransport({
	type: "SMTP",
	host: EMAIL_HOST,
	secure: true,
	debug: true,
	port: 465,
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS
	}
});

module.exports.sendSystemEmail = async (email, data, type) => {
	let { subject, html } = getMailTemplate(data, type);
	let mailOptions = {
		from: `DSCKIET <${SENDER_EMAIL}>`,
		to: email,
		subject,
		html,
		headers: {
			"x-priority": "1",
			importance: "high"
		}
	};
	transporter.use("compile", htmlToText());
	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		logger("error", "emailService", err);
		throw err;
	}
};

module.exports.sendGeneralEmail = async (email, subject, content, name) => {
	let html = getMailTemplate({ name }, "other", content);
	let mailOptions = {
		from: `DSCKIET <${SENDER_EMAIL}>`,
		to: email,
		subject,
		html,
		headers: {
			"x-priority": "1",
			importance: "high"
		}
	};
	transporter.use("compile", htmlToText());
	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		logger("error", "emailService", err);
		throw err;
	}
};
