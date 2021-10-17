const nodemailer = require("nodemailer");
var htmlToText = require("nodemailer-html-to-text").htmlToText;

let {
	EMAIL_USER,
	EMAIL_PASS,
	EMAIL_HOST,
	SENDER_EMAIL
} = require("../config/index");
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
		from: `Developer Student Circuit KIET <${SENDER_EMAIL}>`,
		replyTo: `Developer Student Circuit KIET <dsckiet@gmail.com>`,
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
		throw err;
	}
};

module.exports.sendGeneralEmail = async (email, subject, content) => {
	let mailOptions = {
		from: `Developer Student Circuit KIET <${SENDER_EMAIL}>`,
		replyTo: `Developer Student Circuit KIET <dsckiet@gmail.com>`,
		to: email,
		subject,
		html: content,
		headers: {
			"x-priority": "1",
			importance: "high"
		}
	};
	transporter.use("compile", htmlToText());
	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		throw err;
	}
};
