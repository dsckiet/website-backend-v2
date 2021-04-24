// import http status codes
const {
	BAD_REQUEST,
	NOT_AUTHORIZED,
	FORBIDDEN,
	NOT_FOUND,
	NOT_ACCEPTABLE
} = require("../utility/statusCodes");
// import helper functions
const {
	sendError,
	sendSuccess,
	formatHtmlDate
} = require("../utility/helpers");

module.exports.getTasks = async (req, res) => {
	let { gid } = req.params;
	let { tid } = req.query;
	let tasks;
	if (tid) tasks = await Task.findById(tid);
	else tasks = await Task.find({ groupId: gid });

	return sendSuccess(res, tasks);
};

module.exports.getUserTasks = async (req, res) => {
	let { gid, uid } = req.params;
	let tasks = await Task.find({
		groupId: gid,
		assignees: { $in: [uid] }
	});
	return sendSuccess(res, tasks);
};

module.exports.getMyTasks = async (req, res) => {
	let { gid } = req.params;
	let tasks = await Task.find({
		groupId: gid,
		assignees: { $in: [req.user.id] }
	});
	return sendSuccess(res, tasks);
};

module.exports.addTask = async (req, res) => {
	let { title, dueDate, assignees } = req.body;
	let { gid } = req.params;
	let assignedBy = req.user.id;
	let group = await Group.findById(gid);
	if (!group) return sendError(res, "Group not found!!", NOT_FOUND);
	if (!group.heads.includes(assignedBy))
		return sendError(res, "Not allowed to add tasks", FORBIDDEN);
	let flag;
	for (assignee of assignees) {
		assignee = ObjectId(assignee);
		flag = true;
		// for (member of group.members) {
		// 	if (member.equals(assignee)) {
		// 		flag = false;
		// 		break;
		// 	}
		// }
		// if (flag) return sendError(res, "Invalid Assignee List!!", BAD_REQUEST);
		if (!group.members.includes(assignee))
			return sendError(res, "Invalid assignee list!!", BAD_REQUEST);
	}
	dueDate = formatHtmlDate(dueDate);
	let task = await new Task({
		title,
		dueDate,
		assignees,
		assignedBy,
		groupId: gid
	});
	task = await task.save();
	// also create TaskAssignee documents
	// if(!assignees.length====User.count({_id:{$in:assignees}}))
	for (assignee of assignees) {
		let newTaskAssignee = await new TaskAssignee({
			groupId: gid,
			taskId: task._id,
			assignedBy,
			assigneeId: assignee,
			status: "pending",
			isComplete: "false"
		});
		await newTaskAssignee.save();
	}
	return sendSuccess(res, task);
};

module.exports.updateTask = async (req, res) => {
	// make only title,dueDate updatable
	let { tid } = req.params;
	let task = await Task.findById(tid);
	if (!task) return sendError(res, "Task not found!!", NOT_FOUND);
	let group = await Group.findById(task.groupId);
	if (!group.head.includes(req.user.id))
		return sendError(res, "Not allowed to update tasks", FORBIDDEN);

	task = await task.update({ $set: req.body }, { new: true });
	return sendSuccess(res, task);
};

module.exports.deleteTask = async (req, res) => {
	let { tid } = req.params;
	let task = await Task.findById(tid);
	if (!task) return sendError(res, "Task not found!!", NOT_FOUND);
	let group = await Group.findById(task.groupId);
	if (!group.head.includes(req.user.id))
		return sendError(res, "Not allowed to delete tasks", FORBIDDEN);
	await task.delete();
	await TaskAssignee.deleteMany({ tid: task._id });
	return sendSuccess(res, null);
};

module.exports.getTaskAssignees = async (req, res) => {
	let { tid } = req.params;
	let { uid } = req.query;
	let taskAssignees;
	if (uid)
		taskAssignees = await TaskAssignee.findOne({
			taskId: tid,
			assignee: uid
		});
	else
		taskAssignees = await TaskAssignee.find({
			taskId: tid
		});
	return sendSuccess(res, taskAssignees);
};
