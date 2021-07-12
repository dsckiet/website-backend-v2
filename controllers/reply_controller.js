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

module.exports.getReplies = async (req, res) => {
	/*
    Returns a list of replies for a particular comment
    */
	let { cid } = req.params;
	let comment = await Comment.findById(cid);
	if (!comment) {
		return sendError(res, "Not found!", NOT_FOUND);
	}
	let replies = await Reply.aggregate([
		{
			$match: { cid: ObjectId(cid) }
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

	return sendSuccess(res, replies);
};

module.exports.addReply = async (req, res) => {
	/*
    Reply to a particular comment
    */
	let { cid } = req.params;
	let { text } = req.body;
	let comment = await Comment.findById(cid);
	if (!comment) {
		return sendError(res, "Not Found!!", NOT_FOUND);
	}
	if (!comment.isThread) {
		comment.isThread = true;
		await comment.save();
	}
	let reply = new Reply({
		text: text,
		uid: ObjectId(req.user.id),
		cid: ObjectId(cid)
	});
	await reply.save();
	return sendSuccess(res, "Reply successfully created");
};

module.exports.deleteReply = async (req, res) => {
	/*
    Delete a particular reply
    Only the reply author or core members can do this.
    Note: Group Heads cannot delete replies of other people in the group unless they are core members
    */
	let { rid } = req.params;
	let reply = await Reply.findById(rid);
	if (!reply) {
		return sendError(res, "Not Found!!", NOT_FOUND);
	}
	if (
		reply.uid !== ObjectId(req.user.id) &&
		!["lead", "core"].includes(req.user.role)
	) {
		return sendError(res, "Cannot delete this comment", FORBIDDEN);
	}
	await reply.delete();
	return sendSuccess(res, null);
};
