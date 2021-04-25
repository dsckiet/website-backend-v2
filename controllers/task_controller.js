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
	let { gid, tid } = req.query;
	console.log(req.query);
	let groupFilter = {
		$match: {}
	};
	let taskIdFilter = {
		$match: {}
	};
	if (gid) {
		groupFilter["$match"] = { groupId: ObjectId(gid) };
	}
	if (tid) {
		taskIdFilter["$match"] = { _id: ObjectId(tid) };
	}
	let tasks = await Task.aggregate([
		groupFilter,
		taskIdFilter,
		{
			$lookup: {
				from: "taskassignees",
				localField: "taskAssignees",
				foreignField: "_id",
				as: "taskAssigneeData"
			}
		}
	]);
	return sendSuccess(res, tasks);
};

module.exports.getUserTasks = async (req, res) => {
	let { gid, uid } = req.params;
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
								{
									groupId: ObjectId(gid)
								},
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
								{
									groupId: ObjectId(gid)
								},
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

module.exports.getMyTasks = async (req, res) => {
	let { gid } = req.params;
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
								{
									groupId: ObjectId(gid)
								},
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
								{
									groupId: ObjectId(gid)
								},
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
	let { title, description, dueDate, assignees } = req.body;
	let { gid } = req.params;
	let assignedBy = req.user.id;
	assignedBy = ObjectId(assignedBy);
	let group = await Group.findById(gid);
	if (!group) return sendError(res, "Group not found!!", NOT_FOUND);
	if (!group.heads.includes(assignedBy))
		return sendError(res, "Not allowed to add tasks", FORBIDDEN);
	if (
		!((await User.count({ _id: { $in: assignees } })) === assignees.length)
	) {
		return sendError(res, "Invalid Assignees", BAD_REQUEST);
	}
	let taskAssigneeArray = [];
	for (assignee of assignees) {
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
	console.log(taskAssignees);
	console.log(taskAssigneeIdArray);
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

// module.exports.updateTask = async (req, res) => {
// 	// make only title,dueDate updatable
// 	let { tid } = req.params;
// 	let task = await Task.findById(tid);
// 	if (!task) return sendError(res, "Task not found!!", NOT_FOUND);
// 	let group = await Group.findById(task.groupId);
// 	if (!group.head.includes(req.user.id))
// 		return sendError(res, "Not allowed to update tasks", FORBIDDEN);

// 	task = await task.update({ $set: req.body }, { new: true });
// 	return sendSuccess(res, task);
// };

// module.exports.deleteTask = async (req, res) => {
// 	let { tid } = req.params;
// 	let task = await Task.findById(tid);
// 	if (!task) return sendError(res, "Task not found!!", NOT_FOUND);
// 	let group = await Group.findById(task.groupId);
// 	if (!group.heads.includes(req.user.id))
// 		return sendError(res, "Not allowed to delete tasks", FORBIDDEN);
// 	await task.delete();
// 	await TaskAssignee.deleteMany({ tid: task._id });
// 	return sendSuccess(res, null);
// };

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
