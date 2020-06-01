const { toTitleCase } = require("./helpers");

const getReceiver = name => {
	if (name) {
		return toTitleCase(String(name).trim().split(" ")[0]);
	}
	return "";
};

const getFullHTML = (content, name) => {
	return `<html>

    <body>
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;width:100%!important;height:100%;line-height:1.6em;background-color:#f6f6f6;margin:0"
            bgcolor="#f6f6f6">
            <table
                style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;width:100%;background-color:#f6f6f6;margin:0"
                bgcolor="#f6f6f6">
                <tbody>
                    <tr
                        style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;margin:0">
                        <td style="box-sizing:border-box;vertical-align:top;margin:0" valign="top"></td>
                        <td width="600"
                            style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;vertical-align:top;display:block!important;max-width:600px!important;clear:both!important;margin:0 auto"
                            valign="top">
                            <div
                                style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;max-width:600px!important;display:block;margin:0 auto;padding:20px">
                                <table width="100%" cellpadding="0" cellspacing="0"
                                    style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;border-radius:6px;background-color:#fff;margin:0"
                                    bgcolor="#fff">
                                    <tbody>
                                        <tr
                                            style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;margin:0">
                                            <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:16px;vertical-align:top;font-weight:500;margin:0;padding:40px 40px 0 40px"
                                                valign="top"><img align="none"
                                                    src="https://raw.githubusercontent.com/goelaakash79/goelaakash79.github.io/master/images/dsckiet-logo.png"
                                                    style="widows:212px;height:40px;margin:0" width="212" height="40"
                                                    class="CToWUd"></td>
                                        </tr>
                                        <tr
                                            style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;margin:0">
                                            <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;vertical-align:top;margin:0;padding:20px 40px 40px 40px"
                                                valign="top" colspan="2">
                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                    style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;margin:0">
                                                    <tbody>
                                                        <tr
                                                            style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;margin:0">
                                                            <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:16px;line-height:24px;vertical-align:top;margin:0;word-wrap:break-word"
                                                                valign="top">Hi ${getReceiver(
																	name
																)}<br>Greetings from DSC KIET!<br>${content}<br />For
                                                                more information, please visit <a
                                                                    href="https://dsckiet.com">dsckiet.com</a><br /><br>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div
                                    style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;clear:both;color:#999;margin:0;padding:20px 40px">
                                    <table width="100%"
                                        style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;margin:0">
                                        <tbody>
                                            <tr
                                                style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:14px;margin:0">
                                                <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:12px;vertical-align:top;color:#888;margin:0"
                                                    valign="top">
                                                    <div><span class="il">Developer Student Clubs KIET - powered by Google
                                                            Developers</span></div><a href="mailto:dsckiet@gmail.com"
                                                        style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;box-sizing:border-box;font-size:12px;color:#888!important;text-decoration:underline!important;margin:0;display:block"
                                                        target="_blank"
                                                        data-saferedirecturl="https://www.google.com/url?q=mailto:dsckiet@gmail.com">Drop
                                                        us a query</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </td>
                        <td style="box-sizing:border-box;vertical-align:top;margin:0" valign="top"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
    
    </html>`;
};

module.exports.getMailTemplate = (data, type, content) => {
	if (type === "other" && content) {
		return getFullHTML(content, data.name);
	}
	let templates = {
		"login-creds": {
			subject: "[CREDS] DSCKIET Portal Credentials | DSC KIET",
			html: getFullHTML(
				`
            You have been registered as a ${data.role} on DSC KIET
            Portal. Here are your login
            credentials:<br /><b>${data.email}</b><br /><b>${data.password}</b>`,
				data.name
			)
		},
		"reset-pwd-link": {
			subject:
				"[FORGOT PWD] DSCKIET Portal Password reset link | DSC KIET",
			html: getFullHTML(
				`Someone (hopefully you) has requested a password reset for
                this account on DSC KIET Portal. Here is the reset
                link:<br /><b>${data.link}</b><br />This link is valid for 1
                hour only.If you did not requested this reset, you can
                simply ignore this email, your account will remain
                untouched:)`,
				data.name
			)
		},
		"reset-pwd-success": {
			subject: "[PASSWORD RESET] Success | DSC KIET",
			html: getFullHTML(
				`Your password has been successfully reset. 
                If you did not triggered this action, please contact us at 
                <a href="mailto:dsckiet@gmail.com">dsckiet@gmail.com</a></a>`,
				data.name
			)
		},
		"event-registered": {
			subject: "[EVENT] Registration success | DSC KIET",
			html: getFullHTML(
				`Thank you for registering in the event ${
					data.event ? data.event.title : ""
				} to be held on details... 
                please, content writer wale content de de:)`,
				data.name
			)
		},
		"event-reminder": {
			subject: "[REMINDER] Event Reminder | DSC KIET",
			html: getFullHTML(
				`Thank you for registering in the event ${
					data.event ? data.event.title : ""
				} to be held on details... 
                please, content writer wale content de de:)`,
				data.name
			)
		},
		"event-followup": {
			subject: "[FOLLOWUP] Event completed | DSC KIET",
			html: getFullHTML(
				`Thank you for registering in the event ${
					data.event ? data.event.title : ""
				} to be held on details... 
                Please visit the portal and feedback form if eligible, certificate could be downloaded!:)`,
				data.name
			)
		},
		"event-thanks": {
			subject: "[EVENt] Registration success | DSC KIET",
			html: getFullHTML(
				`Thank you for registering in the event ${
					data.event ? data.event.title : ""
				} to be held on details... 
                please, content writer wale content de de:)`,
				data.name
			)
		},
		"subscriber-welcome": {
			subject: "[SUBSCRIBED] Registration success | DSC KIET",
			html: getFullHTML(
				`Thank you for registering subscribing, baaki acha content:)`
			)
		}
	};
	return templates[type];
};
