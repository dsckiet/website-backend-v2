const express = require("express");
const router = express.Router();

// CONTROLLERS
const {
	getReplies,
	addReply,
	deleteReply
} = require("../../../controllers/reply_controller");

const { catchErrors } = require("../../../config/errorHandler");
const { allAuth, coreAuth, leadAuth } = require("../../../middlewares/auth");
const { addCommentValidation } = require("../../../middlewares/validations");

router.get("/:cid", catchErrors(allAuth), catchErrors(getReplies));
router.post(
	"/:cid",
	catchErrors(allAuth),
	catchErrors(addCommentValidation),
	catchErrors(addReply)
);

router.delete("/:rid", catchErrors(allAuth), catchErrors(deleteReply));

module.exports = router;
