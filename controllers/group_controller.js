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

module.exports.getGroups = async (req, res) => {
	let { gid } = req.query;
	let groups;
	if (gid) {
		groups = await Group.findById(gid);
	} else {
		groups = await Group.find();
	}

	return sendSuccess(res, groups);
};

module.exports.myGroups = async (req, res) => {
	// USER Aggregation framework and single query
	let head_groups = await Group.find({
		heads: { $in: [req.user.id] }
	});
	let member_groups = await Group.find({
		members: { $in: [req.user.id] }
	});
	return sendSuccess(res, {
		"Head groups": head_groups,
		"Member groups": member_groups
	});
};

module.exports.addGroup = async (req, res) => {
	let { name, heads, members } = req.body;
	let group = new Group({ name, heads, members });
	await group.save();
	return sendSuccess(res, group);
};

// module.exports.updateGroup = async (req, res) => {};

module.exports.deleteGroup = async (req, res) => {
	let { gid } = req.params;
	let group = await Group.findByIdAndDelete(gid);
	if (!group) {
		return sendError(res, "Group Not found!!", NOT_FOUND);
	} else {
		await Task.deleteMany({ groupId: gid });
		// task assignee udao
		// task assignee comment udao
	}
	return sendSuccess(res, null);
};
