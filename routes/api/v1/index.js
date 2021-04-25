const express = require("express");
const router = express.Router();

// load controller
const {
	index,
	getTodayBirthdays
} = require("../../../controllers/index_controller");

// middlewares
let { catchErrors } = require("../../../config/errorHandler");
let { allAuth } = require("../../../middlewares/auth");

// routes
router.get("/", catchErrors(index));
router.post("/", catchErrors(index));
router.get("/birthdays", catchErrors(getTodayBirthdays));

// export router
module.exports = router;
