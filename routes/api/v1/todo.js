const express = require("express");
const router = express.Router();

const {
	getTodo,
	addTodo,
	deleteTodo,
	deleteAllTodo,
	updateTodo
} = require("../../../controllers/todo_controller");
const { catchErrors } = require("../../../config/errorHandler");
const { allAuth } = require("../../../middlewares/auth");
const { updateTodoValidation } = require("../../../middlewares/validations");

router.get("/", catchErrors(allAuth), catchErrors(getTodo));
router.post("/", catchErrors(allAuth), catchErrors(addTodo));
router.put(
	"/:tid",
	catchErrors(allAuth),
	catchErrors(updateTodoValidation),
	catchErrors(updateTodo)
);
router.delete("/all", catchErrors(allAuth), catchErrors(deleteAllTodo));
router.delete("/:tid", catchErrors(allAuth), catchErrors(deleteTodo));

module.exports = router;
