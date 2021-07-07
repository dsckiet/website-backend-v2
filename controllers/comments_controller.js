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

module.exports.getComments = async (req, res) => {
	/*
    Returns a list of comments for a particular taskAssignee
    */
	let { taid } = req.params;
	let taskAssignee = await TaskAssignee.findById(taid);
	if (!taskAssignee) {
		return sendError(res, "Not found!", NOT_FOUND);
	}
	let comments = await Comment.aggregate([
		{
			$match: { taid: ObjectId(taid) }
		},
		{
			$lookup: {
				from: "users",
				let: { userId: "$uid" },
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ["$_id", "$$userId"]
							}
						}
					},
					{
						$project: {
							_id: 1,
							role: 1,
							name: 1,
							designation: 1,
							image: 1,
							lastActiveAt: 1
						}
					}
				],
				as: "userData"
			}
		}
	]);

	return sendSuccess(res, comments);
};

module.exports.addComment = async (req, res) => {
	/*
    Add a new comment to a particular taskAssignee
    */
	let { taid } = req.params;
	let { text } = req.body;
	let taskAssignee = await TaskAssignee.findById(taid);
	if (!taskAssignee) {
		return sendError(res, "Not Found!!", NOT_FOUND);
	}
	let comment = new Comment({
		text: text,
		uid: ObjectId(req.user.id),
		taid: ObjectId(taid)
	});
	await comment.save();
	return sendSuccess(res, "Comment successfully created");
};

module.exports.deleteComment = async (req, res) => {
	/*
    Delete a particular comment
    Only the comment author or core members can do this.
    Note: Group Heads cannot delete comments of other people in the group unless they are core members
    */
	let { cid } = req.params;
	let comment = await Comment.findById(cid);
	if (!comment) {
		return sendError(res, "Not Found!!", NOT_FOUND);
	}
	if (
		comment.uid !== ObjectId(req.user.id) &&
		!["lead", "core"].includes(req.user.role)
	) {
		return sendError(res, "Cannot delete this comment", FORBIDDEN);
	}
	await comment.delete();
	return sendSuccess(res, null);
};

module.exports.updateComment = async (req, res) => {
	/*
    Resolve or Unresolve a comment
    a comment's text cannot be updated
    */
	let { cid } = req.params;
	let { isResolved } = req.body;
	let comment = await Comment.findById(cid);
	if (!comment) {
		return sendError(res, "Not Found!!", NOT_FOUND);
	}
	if (
		comment.uid !== ObjectId(req.user.id) &&
		!["lead", "core"].includes(req.user.role)
	) {
		return sendError(res, "Cannot update this comment", FORBIDDEN);
	}
	comment.isResolved = isResolved;
	await comment.save();
	return sendSuccess(res, "Comment successfully updated");
};
