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
	let groups = await Group.aggregate([
		{
			$facet: {
				"Head Groups": [
					{
						$match: { heads: { $in: [ObjectId(req.user.id)] } }
					}
				],
				"Member Groups": [
					{
						$match: { members: { $in: [ObjectId(req.user.id)] } }
					}
				]
			}
		}
	]);
	return sendSuccess(res, groups);
};

module.exports.addGroup = async (req, res) => {
	let { name, heads, members } = req.body;
	heads = [...new Set(heads)];
	members = [...new Set(members)];
	if ((await User.count({ _id: { $in: heads } })) !== heads.length)
		return sendError(res, "Heads array invalid!!", BAD_REQUEST);
	if ((await User.count({ _id: { $in: members } })) !== members.length)
		return sendError(res, "Members array invalid!!", BAD_REQUEST);
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
		await TaskAssignee.deleteMany({ groupId: gid });
		// task assignee comment udao
	}
	return sendSuccess(res, null);
};
