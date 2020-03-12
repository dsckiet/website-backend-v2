const express = require("express");
const router = express.Router();

// load controller
const {
	users,
	addUser,
	approveUser,
	deleteUser,
	login,
	profile,
	updateProfile,
	temp
} = require("../../../controllers/users_controller");

// middlewares
const { catchErrors } = require("../../../config/errorHandler");
const { allAuth, coreAuth, leadAuth } = require("../../../middlewares/auth");
const { userValidation } = require("../../../middlewares/validations");

// routes
router.get("/", catchErrors(users));
router.post("/", coreAuth, userValidation, catchErrors(addUser));
router.put("/:id", leadAuth, catchErrors(approveUser));
router.delete("/:id", coreAuth, catchErrors(deleteUser));
router.post("/login", catchErrors(login));
router.get("/profile", allAuth, catchErrors(profile));
router.post("/profile", allAuth, catchErrors(updateProfile));
router.post("/temp", catchErrors(temp)); // for dev purpose only

// export router
module.exports = router;
