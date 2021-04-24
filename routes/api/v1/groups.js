const express = require("express");
const router = express.Router();

// CONTROLLERS
const {
	addGroup,
	getGroups,
	deleteGroup,
	myGroups
} = require("../../../controllers/group_controller");

const { catchErrors } = require("../../../config/errorHandler");
const { allAuth, coreAuth, leadAuth } = require("../../../middlewares/auth");
const { addGroupValidation } = require("../../../middlewares/validations");

router.get("/", catchErrors(coreAuth), catchErrors(getGroups));
router.get("/my", catchErrors(allAuth), catchErrors(myGroups));
router.post(
	"/",
	catchErrors(leadAuth),
	catchErrors(addGroupValidation),
	catchErrors(addGroup)
);
// router.put("/:gid");
router.delete("/:gid", catchErrors(leadAuth), catchErrors(deleteGroup));

module.exports = router;
