const express = require("express");
const router = express.Router();

// load controller
const {
	users,
	addUser,
	toggleShowOnWeb,
	toggleRevoke,
	deleteUser,
	login,
	profile,
	updateProfile,
	forgotPassword,
	resetPassword,
	temp
} = require("../../../controllers/users_controller");

// middlewares
const { catchErrors } = require("../../../config/errorHandler");
const { allAuth, coreAuth, leadAuth } = require("../../../middlewares/auth");
const { userValidation } = require("../../../middlewares/validations");
const { multer, fileFilter } = require("../../../middlewares/imageValidations");

// routes
router.get("/", catchErrors(users));
router.post("/", catchErrors(coreAuth), userValidation, catchErrors(addUser));
router.put("/approve/:id", catchErrors(leadAuth), catchErrors(toggleShowOnWeb));
router.put("/revoke/:id", catchErrors(leadAuth), catchErrors(toggleRevoke));
router.delete("/:id", catchErrors(coreAuth), catchErrors(deleteUser));
router.post("/login", catchErrors(login));
router.get("/profile", catchErrors(allAuth), catchErrors(profile));
router.post(
	"/profile",
	catchErrors(allAuth),
	multer.any(),
	fileFilter,
	catchErrors(updateProfile)
);
router.post("/forgot", catchErrors(forgotPassword));
router.post("/reset", catchErrors(resetPassword));
router.post("/temp", catchErrors(temp)); // for dev purpose only

// export router
module.exports = router;
