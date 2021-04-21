const { sendSuccess } = require("../utility/helpers");
const { FORBIDDEN } = require("../utility/statusCodes");

module.exports.getTodo = async (req, res) => {
	let todo = await Todo.find({ uid: req.user.id }).sort({
		createdAt: "desc"
	});
	sendSuccess(res, todo);
};

module.exports.addTodo = async (req, res) => {
	let { title, description } = req.body;
	todo = new Todo({
		title,
		description,
		uid: req.user.id,
		status: "pending"
	});
	todo = await todo.save();
	sendSuccess(res, todo);
};

module.exports.updateTodo = async (req, res) => {
	let { tid } = req.params;
	let todo = await Todo.findById(tid);
	if (!todo.uid.equals(req.user.id)) {
		return sendError(
			res,
			"You cannot delete someone else's todo",
			FORBIDDEN
		);
	}
	todo = await todo.update({ $set: req.body }, { new: true });
	sendSuccess(res, todo);
};

module.exports.deleteTodo = async (req, res) => {
	let { tid } = req.params;
	let todo = await Todo.findById(tid);
	if (!todo.uid.equals(req.user.id)) {
		return sendError(
			res,
			"You cannot delete someone else's todo",
			FORBIDDEN
		);
	}
	await todo.delete();
	sendSuccess(res, null);
};

module.exports.deleteAllTodo = async (req, res) => {
	await Todo.deleteMany({ uid: req.user.id });
	sendSuccess(res, null);
};
