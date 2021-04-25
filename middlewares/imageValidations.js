const Multer = require("multer");
const path = require("path");

const { sendError } = require("../utility/helpers");
const { BAD_REQUEST } = require("../utility/statusCodes");

const multer = Multer({
	storage: Multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024 // no larger than 5mb
	}
});

const fileFilter = (req, res, next) => {
	if (!req.files || !req.files.length) return next();
	const file = req.files[0];
	const ext = path.extname(file.originalname),
		type = file.mimetype.split("/");
	if (
		ext !== ".png" &&
		ext !== ".jpg" &&
		ext !== ".gif" &&
		ext !== ".jpeg" &&
		type[0] !== "image"
	)
		return sendError(res, "Only Images allowed", BAD_REQUEST);
	return next();
};

const certiFileFilter = (req, res, next) => {
	if (req.files && req.files.length === 2) {
		let file1 = req.files[0],
			file2 = req.files[1];
		let ext1 = path.extname(file1.originalname),
			ext2 = path.extname(file2.originalname);
		if (ext1 === ".pdf") {
			if ([".ttf", ".woff", ".woff2"].includes(ext2)) return next();
		} else if ([".ttf", ".woff", ".woff2"].includes(ext1)) {
			if (ext2 === ".pdf") return next();
		}

		return sendError(
			res,
			"Please upload one pdf and one font file",
			BAD_REQUEST
		);
	} else {
		return sendError(
			res,
			"Please upload both pdf and font files",
			BAD_REQUEST
		);
	}
};

module.exports = {
	multer,
	fileFilter,
	certiFileFilter
};
