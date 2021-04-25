const Todo = require("../models/Todo");
const {
	sendSuccess,
	formatHtmlDate,
	sendError
} = require("../utility/helpers");
const { NOT_FOUND } = require("../utility/statusCodes");

module.exports.getTodos = async (req, res) => {
	const todos = await Todo.find({ uid: req.user.id })
		.sort({
			createdAt: "desc"
		})
		.lean();
	return sendSuccess(res, todos);
};

module.exports.addTodo = async (req, res) => {
	const { title, description, dueDate } = req.body;
	if (dueDate) dueDate = formatHtmlDate(dueDate);
	const newTodo = new Todo({
		title,
		description,
		dueDate,
		uid: req.user.id,
		status: "pending"
	});
	const _todo = await newTodo.save();
	return sendSuccess(res, _todo);
};

module.exports.updateTodo = async (req, res) => {
	const { tid } = req.params;
	const { dueDate, title, description, status } = req.body;
	const updateObj = {};
	if (dueDate) updateObj["dueDate"] = dueDate;
	if (title) updateObj["title"] = title;
	if (description) updateObj["description"] = description;
	if (status) updateObj["status"] = status;
	const todo = await Todo.findOneAndUpdate(
		{ _id: tid, uid: req.user.id },
		{ $set: updateObj },
		{ new: true }
	);
	if (!todo) return sendError(res, "Todo not found", NOT_FOUND);
	return sendSuccess(res, todo);
};

module.exports.deleteTodo = async (req, res) => {
	const { tid } = req.params;
	const todo = await Todo.findOneAndDelete({
		_id: tid,
		uid: req.user.id
	}).lean();
	if (!todo) return sendError(res, "Todo not found", NOT_FOUND);
	return sendSuccess(res, null);
};

module.exports.deleteAllTodos = async (req, res) => {
	await Todo.deleteMany({ uid: req.user.id });
	return sendSuccess(res, null);
};
