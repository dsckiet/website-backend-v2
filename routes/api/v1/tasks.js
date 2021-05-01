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
	getTaskAssignees,
	getUserTasks,
	updateTaskAssignee
} = require("../../../controllers/task_controller");
const { allAuth, coreAuth } = require("../../../middlewares/auth");
const {
	addTaskValidation,
	updateTaskValidation,
	updateTaskAssigneeValidation
} = require("../../../middlewares/validations");

router.get(
	"/assignees/:taid",
	catchErrors(coreAuth),
	catchErrors(getTaskAssignees)
);

router.put(
	"/assignees/:taid",
	catchErrors(allAuth),
	catchErrors(updateTaskAssigneeValidation),
	catchErrors(updateTaskAssignee)
);

// FETCH TASKS
router.get("/:gid", catchErrors(allAuth), catchErrors(getTasks));
router.get("/:gid/my", catchErrors(allAuth), catchErrors(getMyTasks));
router.get("/:gid/:uid", catchErrors(coreAuth), catchErrors(getUserTasks));

// ADD TASK
router.post(
	"/:gid",
	catchErrors(allAuth),
	catchErrors(addTaskValidation),
	catchErrors(addTask)
);

// UPDATE TASK
router.put(
	"/:tid",
	catchErrors(allAuth),
	catchErrors(updateTaskValidation),
	catchErrors(updateTask)
);

// DELETE TASK
router.delete("/:tid", catchErrors(allAuth), catchErrors(deleteTask));

module.exports = router;
