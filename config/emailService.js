const nodemailer = require("nodemailer");

let { EMAIL_USER, EMAIL_PASS } = require("./index");
let { getMailTemplate } = require("../utility/emailTemplates");
const { logger } = require("../utility/helpers");

const transporter = nodemailer.createTransport({
	service: "gmail",
	type: "SMTP",
	host: "smtp.gmail.com",
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS
	}
});

module.exports.sendSystemEmail = async (email, data, type) => {
	let { subject, html } = getMailTemplate(data, type);
	let mailOptions = {
		from: `DSCKIET <${EMAIL_USER}>`,
		to: email,
		subject,
		text: "",
		html,
		headers: {
			"x-priority": "1",
			"x-msmail-priority": "High",
			importance: "high"
		}
	};
	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		logger("error", "emailService", err);
		throw err;
	}
};

module.exports.sendGeneralEmail = async (email, subject, content) => {
	let html = getMailTemplate(null, "other", content);
	let mailOptions = {
		from: `DSCKIET <${EMAIL_USER}>`,
		to: email,
		subject,
		text: "",
		html,
		headers: {
			"x-priority": "1",
			"x-msmail-priority": "High",
			importance: "high"
		}
	};
	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		logger("error", "emailService", err);
		throw err;
	}
};
