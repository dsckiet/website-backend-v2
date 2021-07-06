const Todo = require("../models/Todo");
const {
	sendSuccess,
	formatHtmlDate,
	sendError
} = require("../utility/helpers");
const { FORBIDDEN, NOT_FOUND } = require("../utility/statusCodes");

module.exports.getTodo = async (req, res) => {
	let todo = await Todo.find({ uid: req.user.id }).sort({
		createdAt: "desc"
	});
	sendSuccess(res, todo);
};

module.exports.addTodo = async (req, res) => {
	let { title, description, dueDate } = req.body;
	if (dueDate) {
		dueDate = formatHtmlDate(dueDate);
	}
	let todo = new Todo({
		title,
		description,
		dueDate,
		uid: req.user.id,
		status: "pending"
	});
	todo = await todo.save();
	sendSuccess(res, todo);
};

module.exports.updateTodo = async (req, res) => {
	let { tid } = req.params;
	let { dueDate } = req.body;
	if (dueDate) {
		req.body.dueDate = formatHtmlDate(dueDate);
	}
	let todo = await Todo.findOneAndUpdate(
		{ _id: tid, uid: req.user.id },
		{ $set: req.body },
		{ new: true }
	);
	if (!todo) {
		return sendError(res, "Todo not found!!", NOT_FOUND);
	}
	sendSuccess(res, todo);
};

module.exports.deleteTodo = async (req, res) => {
	let { tid } = req.params;
	let todo = await Todo.findOneAndDelete({
		_id: tid,
		uid: req.user.id
	}).lean();
	if (!todo) {
		return sendError(res, "Todo not found!!", NOT_FOUND);
	}
	sendSuccess(res, null);
};

module.exports.deleteAllTodo = async (req, res) => {
	await Todo.deleteMany({ uid: req.user.id });
	sendSuccess(res, null);
};
