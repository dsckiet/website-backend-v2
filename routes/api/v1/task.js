const express = require("express");
const router = express.Router();

// CONTROLLERS

const { catchErrors } = require("../../../config/errorHandler");
const {
	getTasks,
	addTask,
	updateTask,
	getMyTasks,
	deleteTask,
	getTaskAssignees
} = require("../../../controllers/task_controller");
const { allAuth, coreAuth } = require("../../../middlewares/auth");

router.get("/:gid", catchErrors(allAuth), catchErrors(getTasks));

router.get("/:gid/my", catchErrors(allAuth), catchErrors(getMyTasks));
router.post("/:gid", catchErrors(allAuth), catchErrors(addTask));
router.put("/:tid", catchErrors(allAuth), catchErrors(updateTask));
router.delete("/:tid", catchErrors(allAuth), catchErrors(deleteTask));
router.get(
	"/assignees/:tid",
	catchErrors(coreAuth),
	catchErrors(getTaskAssignees)
);
module.exports = router;
