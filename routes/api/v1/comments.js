const express = require("express");
const router = express.Router();

// CONTROLLERS
const {
	getComments,
	addComment,
	updateComment,
	deleteComment
} = require("../../../controllers/comments_controller");

const { catchErrors } = require("../../../config/errorHandler");
const { allAuth, coreAuth, leadAuth } = require("../../../middlewares/auth");
const {
	addCommentValidation,
	updateCommentValidation
} = require("../../../middlewares/validations");

router.get("/:taid", catchErrors(allAuth), catchErrors(getComments));
router.post(
	"/:taid",
	catchErrors(allAuth),
	catchErrors(addCommentValidation),
	catchErrors(addComment)
);
router.put(
	"/:cid",
	catchErrors(allAuth),
	catchErrors(updateCommentValidation),
	catchErrors(updateComment)
);
router.delete("/:cid", catchErrors(allAuth), catchErrors(deleteComment));

module.exports = router;
