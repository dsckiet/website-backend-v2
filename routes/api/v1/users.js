const express = require("express");
const router = express.Router();

// load controller
const {
	users,
	publicUsersList,
	addUser,
	addUsers,
	toggleShowOnWeb,
	toggleRevoke,
	deleteUser,
	login,
	profile,
	updateProfile,
	forgotPassword,
	resetPassword,
	userUpdate,
	temp,
	changePassword
} = require("../../../controllers/users_controller");

// middlewares
const { catchErrors } = require("../../../config/errorHandler");
const { allAuth, coreAuth, leadAuth } = require("../../../middlewares/auth");
const {
	userValidation,
	updateUserValidation,
	emailValidation,
	profileUpdateValidation,
	changePasswordValidation
} = require("../../../middlewares/validations");
const {
	multer,
	fileFilter,
	csvFileFilter
} = require("../../../middlewares/imageValidations");
const { getArrayFromCsv } = require("../../../middlewares/convertToJson");
const {
	loginRateLimiter,
	forgotPasswordRateLimiter,
	resetPasswordRateLimiter,
	changePasswordRateLimiter,
	updateProfileRateLimiter
} = require("../../../config/rateLimit");

// routes
router.get("/", catchErrors(allAuth), catchErrors(users));
router.get("/public", catchErrors(publicUsersList));
router.post("/", catchErrors(coreAuth), userValidation, catchErrors(addUser));
router.post(
	"/bulk",
	catchErrors(leadAuth),
	multer.any(),
	csvFileFilter,
	getArrayFromCsv,
	catchErrors(addUsers)
);
router.put(
	"/approve/:uid",
	catchErrors(leadAuth),
	catchErrors(toggleShowOnWeb)
);
router.put("/revoke/:uid", catchErrors(leadAuth), catchErrors(toggleRevoke));
router.put(
	"/:uid",
	catchErrors(leadAuth),
	catchErrors(updateUserValidation),
	catchErrors(userUpdate)
);
router.delete("/:uid", catchErrors(coreAuth), catchErrors(deleteUser));
router.post("/login", loginRateLimiter, catchErrors(login));
router.get("/profile", catchErrors(allAuth), catchErrors(profile));
router.post(
	"/profile",
	catchErrors(allAuth),
	updateProfileRateLimiter,
	multer.any(),
	profileUpdateValidation,
	fileFilter,
	catchErrors(updateProfile)
);
router.post(
	"/forgot-pwd",
	forgotPasswordRateLimiter,
	emailValidation,
	catchErrors(forgotPassword)
);
router.post("/reset-pwd", resetPasswordRateLimiter, catchErrors(resetPassword));
router.post(
	"/change-pwd",
	changePasswordRateLimiter,
	catchErrors(allAuth),
	catchErrors(changePasswordValidation),
	catchErrors(changePassword)
);
router.post("/temp", catchErrors(temp)); // for dev purpose only

// export router
module.exports = router;
