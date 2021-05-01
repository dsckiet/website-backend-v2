const express = require("express");
const router = express.Router();

const {
	getTodos,
	addTodo,
	deleteTodo,
	deleteAllTodos,
	updateTodo
} = require("../../../controllers/todos_controller");
const { catchErrors } = require("../../../config/errorHandler");
const { allAuth } = require("../../../middlewares/auth");
const { updateTodoValidation } = require("../../../middlewares/validations");
const { addTodoRateLimiter } = require("../../../config/rateLimit");


router.put(
	"/:tid",
	catchErrors(allAuth),
	catchErrors(updateTodoValidation),
	catchErrors(updateTodo)
);

router.get("/", catchErrors(allAuth), catchErrors(getTodos));
router.post(
	"/",
	catchErrors(allAuth),
	addTodoRateLimiter,
	catchErrors(addTodo)
);
router.put("/:tid", catchErrors(allAuth), catchErrors(updateTodo));
router.delete("/all", catchErrors(allAuth), catchErrors(deleteAllTodos));
router.delete("/:tid", catchErrors(allAuth), catchErrors(deleteTodo));

module.exports = router;
