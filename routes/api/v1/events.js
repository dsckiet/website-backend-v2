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
	eventValidation,
	emailValidation
} = require("../../../middlewares/validations");
const {
	multer,
	fileFilter,
	certiFileFilter
} = require("../../../middlewares/imageValidations");

// routes for participants
router.get("/get_part", catchErrors(coreAuth), catchErrors(getParticipants));
router.post(
	"/register_part",
	participantValidation,
	catchErrors(registerParticipant)
);
router.put(
	"/update_part",
	catchErrors(participantAuth),
	participantValidation,
	catchErrors(updateParticipant)
);
router.post("/forgot", emailValidation, catchErrors(forgotPassword));
router.post("/reset", catchErrors(resetPassword));
router.post("/part_login", catchErrors(participantLogin));
router.put(
	"/revoke_part/:pid",
	catchErrors(leadAuth),
	catchErrors(toggleRevoke)
);
router.delete(
	"/delete_part/:pid",
	catchErrors(leadAuth),
	catchErrors(deleteParticipant)
);
router.post(
	"/register_in_event",
	catchErrors(participantAuth),
	catchErrors(registerForEvent)
);
router.get("/part_data", catchErrors(allAuth), catchErrors(participantData));

// routes for event details and operations
router.get("/get_events", catchErrors(getEvents));
router.post(
	"/add_event",
	catchErrors(leadAuth),
	multer.any(),
	eventValidation,
	fileFilter,
	catchErrors(addEvent)
);
router.post(
	"/change_event_code",
	catchErrors(coreAuth),
	catchErrors(changeEventCode)
);
router.post(
	"/event_regist_open",
	catchErrors(leadAuth),
	catchErrors(changeEventRegistrationOpen)
);
router.put(
	"/update_event/:eid",
	catchErrors(coreAuth),
	multer.any(),
	eventValidation,
	fileFilter,
	catchErrors(updateEvent)
);
router.delete(
	"/delete_event/:eid",
	catchErrors(leadAuth),
	catchErrors(deleteEvent)
);

// routes for event attendance
router.get(
	"/get_attend_report",
	catchErrors(coreAuth),
	catchErrors(getEventAttendanceReport)
);
router.get(
	"/get_attend_stats",
	catchErrors(coreAuth),
	catchErrors(getEventAttendanceStats)
);
router.get(
	"/get_user_attend",
	catchErrors(participantAuth),
	catchErrors(getUserEventAttendance)
);
router.post(
	"/mark_attend",
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
router.post(
	"/certificate/preview",
	catchErrors(coreAuth),
	multer.any(),
	certiFileFilter,
	catchErrors(previewCerti)
);
router.post(
	"/certificate/add/:eid",
	catchErrors(coreAuth),
	multer.any(),
	certiFileFilter,
	catchErrors(addCerti)
);
router.get(
	"/certificate/generate/:eid",
	catchErrors(participantAuth),
	catchErrors(generateCerti)
);

// send emails regarding event route
router.post("/email", catchErrors(leadAuth), catchErrors(sendEventMails));

// export router
module.exports = router;
