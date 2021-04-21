const express = require("express");
const router = express.Router();

// load controllers
const {
	getParticipants,
	registerParticipant,
	updateParticipant,
	forgotPassword,
	resetPassword,
	participantLogin,
	toggleRevoke,
	registerForEvent,
	participantData,
	deleteParticipant,
	getEvents,
	addEvent,
	updateEvent,
	changeEventCode,
	changeEventRegistrationOpen,
	deleteEvent,
	getEventAttendanceReport,
	getEventAttendanceStats,
	getUserEventAttendance,
	markUserAttendance,
	submitFeedback,
	getFeedbackReport,
	previewCerti,
	addCerti,
	generateCerti,
	sendEventMails
} = require("../../../controllers/events_controller");

// middlewares
const { catchErrors } = require("../../../config/errorHandler");
const {
	coreAuth,
	allAuth,
	leadAuth,
	participantAuth
} = require("../../../middlewares/auth");
const {
	participantValidation,
	participantUpdateValidation,
	eventValidation,
	emailValidation
} = require("../../../middlewares/validations");
const {
	multer,
	fileFilter,
	certiFileFilter
} = require("../../../middlewares/imageValidations");

// routes for participants
router.get(
	"/participants",
	catchErrors(coreAuth),
	catchErrors(getParticipants)
);
router.post(
	"/participants",
	participantValidation,
	catchErrors(registerParticipant)
);
router.put(
	"/participants",
	catchErrors(participantAuth),
	participantUpdateValidation,
	catchErrors(updateParticipant)
);
router.delete(
	"/participants/:pid",
	catchErrors(leadAuth),
	catchErrors(deleteParticipant)
);
router.post("/participants/login", catchErrors(participantLogin));
router.post(
	"/participants/forgot-pwd",
	emailValidation,
	catchErrors(forgotPassword)
);
router.post("/participants/reset-pwd", catchErrors(resetPassword));
router.put(
	"/participants/revoke/:pid",
	catchErrors(leadAuth),
	catchErrors(toggleRevoke)
);
router.get(
	"/participants/profile",
	catchErrors(allAuth),
	catchErrors(participantData)
);

// routes for event attendance
router.get(
	"/attendance/report",
	catchErrors(coreAuth),
	catchErrors(getEventAttendanceReport)
);
router.get(
	"/attendance/stats",
	catchErrors(coreAuth),
	catchErrors(getEventAttendanceStats)
);
router.get(
	"/attendance/user",
	catchErrors(participantAuth),
	catchErrors(getUserEventAttendance)
);
router.post(
	"/attendance/mark",
	catchErrors(participantAuth),
	catchErrors(markUserAttendance)
);

// routes for event feedbacks
router.post(
	"/feedback",
	catchErrors(participantAuth),
	catchErrors(submitFeedback)
);
router.get(
	"/feedback/:eid",
	catchErrors(coreAuth),
	catchErrors(getFeedbackReport)
);

// routes for event certificates
// router.get(
// 	"/certificate/:eid",
// 	catchErrors(participantAuth),
// 	catchErrors(generateCerti)
// );
// router.post(
// 	"/certificate/preview",
// 	catchErrors(coreAuth),
// 	multer.any(),
// 	certiFileFilter,
// 	catchErrors(previewCerti)
// );
// router.post(
// 	"/certificate/:eid",
// 	catchErrors(coreAuth),
// 	multer.any(),
// 	certiFileFilter,
// 	catchErrors(addCerti)
// );

// send emails regarding event route
router.post("/email", catchErrors(leadAuth), catchErrors(sendEventMails));

// routes for event details and operations
router.get("/", catchErrors(getEvents));
router.post(
	"/",
	catchErrors(leadAuth),
	multer.any(),
	eventValidation,
	fileFilter,
	catchErrors(addEvent)
);
router.put(
	"/:eid",
	catchErrors(coreAuth),
	multer.any(),
	eventValidation,
	fileFilter,
	catchErrors(updateEvent)
);
router.delete("/:eid", catchErrors(leadAuth), catchErrors(deleteEvent));
router.post(
	"/change-code",
	catchErrors(coreAuth),
	catchErrors(changeEventCode)
);
router.post(
	"/toggle-reg",
	catchErrors(leadAuth),
	catchErrors(changeEventRegistrationOpen)
);

router.post(
	"/register",
	catchErrors(participantAuth),
	catchErrors(registerForEvent)
);

// export router
module.exports = router;
