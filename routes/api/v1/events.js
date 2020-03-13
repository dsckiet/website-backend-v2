const express = require("express");
const router = express.Router();

// load controllers
const {
	getParticipants,
	registerParticipant,
	updateParticipant,
	participantLogin,
	registerForEvent,
	participantData,
	getEvents,
	addEvent,
	updateEvent,
	changeEventCode,
	changeEventRegistrationOpen,
	deleteEvent,
	getEventAttendanceReport,
	getEventAttendanceStats,
	getUserEventAttendance,
	markUserAttendance
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
	eventValidation
} = require("../../../middlewares/validations");

// routes for participants
router.get("/get_part", coreAuth, catchErrors(getParticipants));
router.post(
	"/register_part",
	participantValidation,
	catchErrors(registerParticipant)
);
router.put(
	"/update_part/:id",
	participantAuth,
	participantValidation,
	catchErrors(updateParticipant)
);
router.post("/part_login", catchErrors(participantLogin));
router.post(
	"/register_in_event",
	participantAuth,
	catchErrors(registerForEvent)
);
router.get("/part_data", allAuth, catchErrors(participantData));
// routes for event details and operations
router.get("/get_events", catchErrors(getEvents));
router.post("/add_event", leadAuth, eventValidation, catchErrors(addEvent));
router.post("/change_event_code", coreAuth, catchErrors(changeEventCode));
router.post(
	"/event_regist_open",
	leadAuth,
	catchErrors(changeEventRegistrationOpen)
);
router.put("/update_event/:id", coreAuth, catchErrors(updateEvent));
router.delete("/delete_event/:id", leadAuth, catchErrors(deleteEvent));
// routes for event attendance
// router.get(
// 	"/get_attend_report",
// 	coreAuth,
// 	catchErrors(getEventAttendanceReport)
// );
// router.get("/get_attend_stats", coreAuth, catchErrors(getEventAttendanceStats));
// router.get(
// 	"/get_user_attend",
// 	participantAuth,
// 	catchErrors(getUserEventAttendance)
// );
// router.post("/mark_attend", participantAuth, catchErrors(markUserAttendance));
// routes for event certificates
// routes for event feedbacks

// export router
module.exports = router;
