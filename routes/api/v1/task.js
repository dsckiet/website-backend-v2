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
	getUserTasks
} = require("../../../controllers/task_controller");
const { allAuth, coreAuth } = require("../../../middlewares/auth");

// FETCH TASKS
router.get("/", catchErrors(allAuth), catchErrors(getTasks));
router.get("/:gid/my", catchErrors(allAuth), catchErrors(getMyTasks));
router.get("/:gid/:uid", catchErrors(coreAuth), catchErrors(getUserTasks));

// ADD TASK
router.post("/:gid", catchErrors(allAuth), catchErrors(addTask));

// UPDATE TASK
// router.put("/:tid", catchErrors(allAuth), catchErrors(updateTask));

// DELETE TASK
// router.delete("/:tid", catchErrors(allAuth), catchErrors(deleteTask));
// router.get(
// 	"/assignees/:tid",
// 	catchErrors(coreAuth),
// 	catchErrors(getTaskAssignees)
// );
module.exports = router;
