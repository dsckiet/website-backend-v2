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

const ObjectId = require("mongoose").Types.ObjectId;

module.exports.getTasks = async (req, res) => {
	/*
	Get tasks of a particular group along with all task assignees
	*/
	let { tid } = req.query;
	let { gid } = req.params;
	let taskIdFilter = {
		$match: {}
	};
	let group = await Group.findById(gid);
	if (!group) return sendError(res, "Group not found!!", NOT_FOUND);

	if (
		!group.heads.includes(ObjectId(req.user.id)) &&
		!["lead", "core"].includes(req.user.role)
	)
		return sendError(res, "Not allowed to fetch tasks!!", FORBIDDEN);
	if (tid) {
		taskIdFilter["$match"] = { _id: ObjectId(tid) };
	}
	let tasks = await Task.aggregate([
		taskIdFilter,
		{
			$match: { groupId: ObjectId(gid) }
		},
		{
			$lookup: {
				from: "taskassignees",
				let: { taskAssigneesArray: "$taskAssignees" },
				pipeline: [
					{
						$match: {
							$expr: {
								$in: ["$_id", "$$taskAssigneesArray"]
							}
						}
					},
					{
						$lookup: {
							from: "users",
							localField: "assigneeId",
							foreignField: "_id",
							as: "userData"
						}
					}
				],
				as: "taskAssigneeData"
			}
		}
	]);
	return sendSuccess(res, tasks);
};

module.exports.getUserTasks = async (req, res) => {
	/*
	Get tasks assigned to and by a certain user (only core)
	*/
	let { uid } = req.params;
	let tasks = await TaskAssignee.aggregate([
		{
			$lookup: {
				from: "tasks",
				localField: "_id",
				foreignField: "taskAssignees",
				as: "tasksData"
			}
		},
		{
			$facet: {
				"Assigned Tasks": [
					{
						$match: {
							assigneeId: ObjectId(uid)
						}
					}
				],
				"Created Tasks": [
					{
						$match: {
							assignedBy: ObjectId(uid)
						}
					}
				]
			}
		}
	]);
	return sendSuccess(res, tasks);
};

module.exports.getMyTasks = async (req, res) => {
	/*
	Get tasks assigned to and by logged in user
	*/
	let { gid } = req.query;
	let query = {};
	if (gid) {
		query["groupId"] = ObjectId(gid);
	}
	uid = req.user.id;
	let tasks = await TaskAssignee.aggregate([
		{
			$lookup: {
				from: "tasks",
				localField: "_id",
				foreignField: "taskAssignees",
				as: "tasksData"
			}
		},
		{
			$facet: {
				"Assigned Tasks": [
					{
						$match: {
							$and: [
								query,
								{
									assigneeId: ObjectId(uid)
								}
							]
						}
					}
				],
				"Created Tasks": [
					{
						$match: {
							$and: [
								query,
								{
									assignedBy: ObjectId(uid)
								}
							]
						}
					}
				]
			}
		}
	]);
	return sendSuccess(res, tasks);
};

module.exports.addTask = async (req, res) => {
	/*
	Create a new task
	*/
	let { title, description, dueDate, assignees } = req.body;
	let { gid } = req.params;
	let assignedBy = req.user.id;
	let group = await Group.findById(gid);
	if (!group) return sendError(res, "Group not found!!", NOT_FOUND);
	if (
		!group.heads.includes(ObjectId(assignedBy)) &&
		!["lead", "core"].includes(req.user.role)
	)
		return sendError(res, "Not allowed to add tasks", FORBIDDEN);
	assignees = [...new Set(assignees)];
	let taskAssigneeArray = [];
	for (assignee of assignees) {
		if (
			!group.members.includes(ObjectId(assignee)) &&
			!group.heads.includes(ObjectId(assignee))
		)
			return sendError(res, "Invalid Assignee list!!", BAD_REQUEST);
		taskAssigneeArray.push({
			assigneeId: assignee,
			assignedBy,
			status: "pending",
			groupId: gid
		});
	}
	let taskAssignees = await TaskAssignee.insertMany(taskAssigneeArray);
	let taskAssigneeIdArray = [];
	for (taskAssignee of taskAssignees) {
		taskAssigneeIdArray.push(taskAssignee._id);
	}
	let task = new Task({
		taskAssignees: taskAssigneeIdArray,
		title,
		description,
		dueDate: formatHtmlDate(dueDate),
		assignedBy,
		groupId: gid
	});
	task = await task.save();
	return sendSuccess(res, task);
};

module.exports.updateTask = async (req, res) => {
	/*
	Heads or Core can update title,dueDate,description
	*/
	let { tid } = req.params;
	let task = await Task.findById(tid);
	if (!task) return sendError(res, "Task not found!!", NOT_FOUND);
	let group = await Group.findById(task.groupId);
	if (
		!group.heads.includes(ObjectId(req.user.id)) &&
		!["lead", "core"].includes(req.user.role)
	)
		return sendError(res, "Not allowed to update tasks", FORBIDDEN);

	if (req.body.dueDate) {
		req.body.dueDate = formatHtmlDate(dueDate);
	}
	task = await task.update({ $set: req.body }, { new: true });
	return sendSuccess(res, task);
};

module.exports.deleteTask = async (req, res) => {
	/*
	Delete a certain task
	*/
	let { tid } = req.params;
	let task = await Task.findById(tid);
	if (!task) return sendError(res, "Task not found!!", NOT_FOUND);
	let group = await Group.findById(task.groupId);
	if (
		!group.heads.includes(ObjectId(req.user.id)) &&
		!["lead", "core"].includes(req.user.role)
	)
		return sendError(res, "Not allowed to delete tasks", FORBIDDEN);
	await TaskAssignee.deleteMany({ _id: { $in: task.taskAssignees } });
	await task.delete();

	return sendSuccess(res, null);
};

module.exports.getTaskAssignees = async (req, res) => {
	/*
	Get all task assignees for a certain task
	*/
	let { taid } = req.params;
	let taskAssignee = await TaskAssignee.findById(taid);
	if (!taskAssignee) return sendError(res, "Not Found!!", NOT_FOUND);
	let group = await Group.findById(taskAssignee.groupId);
	let userId = ObjectId(req.user.id);
	if (
		!group.members.includes(userId) &&
		!group.heads.includes(userId) &&
		!["lead", "core"].includes(req.user.role)
	)
		return sendError(res, "You cannot access this!!", FORBIDDEN);
	return sendSuccess(res, taskAssignee);
};

module.exports.updateTaskAssignee = async (req, res) => {
	/*
	Only status updatable.
	*/
	let { taid } = req.params;
	let taskAssignee = await TaskAssignee.findById(taid);
	if (!taskAssignee) return sendError(res, "Not Found!!", NOT_FOUND);

	if (!taskAssignee) {
		return sendError(res, "Not Found!!", NOT_FOUND);
	}
	let group = await Group.findById(taskAssignee.groupId);
	if (
		!group.heads.includes(ObjectId(req.user.id)) &&
		!["lead", "core"].includes(req.user.role) &&
		!taskAssignee.assigneeId === ObjectId(req.user.id)
	)
		return sendError(res, "You cannot update this!!", FORBIDDEN);
	taskAssignee = await taskAssignee.update(
		{
			$set: req.body
		},
		{ new: true }
	);
	return sendSuccess(res, taskAssignee);
};
