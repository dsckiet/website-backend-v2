const express = require("express");
const router = express.Router();

// load controller
const {
	subscribers,
	subscribe,
	unsubscribe,
	subscriptions,
	sendSubscription
} = require("../../../controllers/subscription_controller");

// middlewares
const { catchErrors } = require("../../../config/errorHandler");
const { leadAuth } = require("../../../middlewares/auth");
const { emailValidation } = require("../../../middlewares/validations");

// routes
router.get("/", catchErrors(leadAuth), catchErrors(subscribers));
router.post("/", emailValidation, catchErrors(subscribe));
router.delete("/:id", catchErrors(unsubscribe));
router.get("/mail", catchErrors(leadAuth), catchErrors(subscriptions));
router.post("/mail", catchErrors(leadAuth), catchErrors(sendSubscription));

// export router
module.exports = router;
