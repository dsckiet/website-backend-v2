const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const { logger } = require("../utility/helpers");

const { AWS_KEY, AWS_SECRET, AWS_BUCKET_NAME, AWS_REGION } = require("./index");

// aws config
aws.config.update({
	accessKeyId: AWS_KEY,
	secretAccessKey: AWS_SECRET
});
aws.config.region = AWS_REGION;

const s3 = new aws.S3();

// upload file
module.exports.upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: AWS_BUCKET_NAME,
		acl: "public-read",
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function(req, file, cb) {
			let url = req.originalUrl;
			let folder;
			if (url.includes("profile")) {
				folder = "users";
			} else if (url.includes("update_part")) {
				folder = "participants";
			} else {
				folder = "events";
			}
			cb(
				null,
				`${folder}/${Date.now()}${Math.floor(Math.random() * 900000) +
					99999}`
			);
		}
	})
});

// delete image
module.exports.deleteImage = async key => {
	try {
		await s3.deleteObject({
			Bucket: AWS_BUCKET_NAME,
			Key: key
		});
	} catch (err) {
		console.log(err);
		logger("error", "imageService", err);
		throw err;
	}
};
