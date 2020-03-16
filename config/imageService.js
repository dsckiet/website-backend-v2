const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const { logger } = require("../utility/helpers");

const { AWS_KEY, AWS_SECRET, AWS_BUCKET_NAME } = require("./index");

// aws config
aws.config.update({
	accessKeyId: AWS_KEY,
	secretAccessKey: AWS_SECRET
});

const s3 = new aws.S3();

// upload file
module.exports.upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: AWS_BUCKET_NAME,
		acl: "public-read",
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function(req, file, cb) {
			cb(
				null,
				`${req.baseUrl.split("/")[3]}/${Date.now()}${Math.floor(
					Math.random() * 900000
				) + 99999}`
			);
		}
	})
});

// delete image
module.exports.deleteImage = async key => {
	try {
		await s3.deleteObject({
			Bucket: AWS_BUCKET_NAME,
			Key: "test"
		});
	} catch (err) {
		logger("error", "imageService", err);
		throw err;
	}
};
