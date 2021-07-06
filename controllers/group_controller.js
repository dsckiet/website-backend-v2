// import http status codes
const {
	BAD_REQUEST,
	NOT_AUTHORIZED,
	FORBIDDEN,
	NOT_FOUND,
	NOT_ACCEPTABLE
} = require("../utility/statusCodes");
// import helper functions
const { sendError, sendSuccess } = require("../utility/helpers");
const { ObjectId } = require("mongoose").Types.ObjectId;

module.exports.getGroups = async (req, res) => {
	/*
	Returns a list of groups logged in user is a part of.
	For core members also returns a list of all groups
	*/
	let groups;
	if (["lead", "core"].includes(req.user.role)) {
		groups = await Group.aggregate([
			{
				$facet: {
					"All Groups": [],
					"Head Groups": [
						{
							$match: { heads: { $in: [ObjectId(req.user.id)] } }
						},
						{
							$lookup: {
								from: "users",
								let: {
									member_list: "$members"
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$in: ["$_id", "$$member_list"]
											}
										}
									},
									{
										$sort: { lastActiveAt: -1 }
									},
									{
										$project: {
											name: 1,
											email: 1,
											designation: 1,
											image: 1
										}
									}
								],
								as: "membersData"
							}
						}
					],
					"Member Groups": [
						{
							$match: {
								members: { $in: [ObjectId(req.user.id)] }
							}
						},
						{
							$lookup: {
								from: "users",
								let: {
									member_list: "$members"
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$in: ["$_id", "$$member_list"]
											}
										}
									},
									{
										$sort: { lastActiveAt: -1 }
									},
									{
										$project: {
											name: 1,
											email: 1,
											designation: 1,
											image: 1
										}
									}
								],
								as: "membersData"
							}
						}
					]
				}
			}
		]);
	} else {
		groups = await Group.aggregate([
			{
				$facet: {
					"Head Groups": [
						{
							$match: { heads: { $in: [ObjectId(req.user.id)] } }
						},
						{
							$lookup: {
								from: "users",
								let: {
									member_list: "$members"
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$in: ["$_id", "$$member_list"]
											}
										}
									},
									{
										$sort: { lastActiveAt: -1 }
									},
									{
										$project: {
											name: 1,
											email: 1,
											designation: 1,
											image: 1
										}
									}
								],
								as: "membersData"
							}
						}
					],
					"Member Groups": [
						{
							$match: {
								members: { $in: [ObjectId(req.user.id)] }
							}
						},
						{
							$lookup: {
								from: "users",
								let: {
									member_list: "$members"
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$in: ["$_id", "$$member_list"]
											}
										}
									},
									{
										$sort: { lastActiveAt: -1 }
									},
									{
										$project: {
											name: 1,
											email: 1,
											designation: 1,
											image: 1
										}
									}
								],
								as: "membersData"
							}
						}
					]
				}
			}
		]);
	}
	return sendSuccess(res, groups);
};

module.exports.addGroup = async (req, res) => {
	/*
	creates a new group (only lead)
	*/
	let { name, heads, members } = req.body;
	heads = [...new Set(heads)];
	members = [...new Set(members)];
	let totalUsers = [...heads, ...members];
	if ((await User.count({ _id: { $in: totalUsers } })) !== totalUsers.length)
		return sendError(res, "Invalid user array", BAD_REQUEST);
	let group = new Group({ name, heads, members });
	await group.save();
	return sendSuccess(res, group);
};

// module.exports.updateGroup = async (req, res) => {};

module.exports.deleteGroup = async (req, res) => {
	/*
	deletes an existing group , associated tasks and taskassignees (only lead)
	*/
	let { gid } = req.params;
	let group = await Group.findByIdAndDelete(gid);
	if (!group) {
		return sendError(res, "Group Not found!!", NOT_FOUND);
	} else {
		await Task.deleteMany({ groupId: gid });
		await TaskAssignee.deleteMany({ groupId: gid });
		// task assignee comment udao
	}
	return sendSuccess(res, null);
};
