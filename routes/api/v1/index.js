const express = require("express");
const router = express.Router();

// load controller
const { index } = require("../../../controllers/index_controller");

// middlewares
let { catchErrors } = require("../../../config/errorHandler");
let { allAuth } = require("../../../middlewares/auth");

// routes
router.get("/", catchErrors(index));

// export router
module.exports = router;
