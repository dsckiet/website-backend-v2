const aws = require("aws-sdk");
const { promisify } = require("util");

const { logger } = require("../utility/helpers");

const {
	AWS_KEY,
	AWS_SECRET,
	AWS_BUCKET_NAME,
	AWS_REGION
} = require("../config/index");

// aws config
aws.config.update({
	accessKeyId: AWS_KEY,
	secretAccessKey: AWS_SECRET
});
aws.config.region = AWS_REGION;

const s3 = new aws.S3();

// upload image
module.exports.uploadImage = async (file, key) => {
	const uploadObjectAsync = promisify(s3.upload).bind(s3);
	let params = {
		Bucket: AWS_BUCKET_NAME,
		Key: key,
		Body: file.buffer,
		acl: "public-read",
		ServerSideEncryption: "AES256",
		ContentDisposition: "inline",
		ContentType: "image/jpeg"
	};
	try {
		let resp = await uploadObjectAsync(params);
		console.log(`Upload succeed: ${result}`);
		logger("error", "storage", {
			type: "success",
			key,
			folder
		});
		return resp.Location;
	} catch (err) {
		console.log(err);
		logger(
			"error",
			"storage",
			{
				type: "failure",
				message: err.message,
				status: err.status || SERVER_ERROR,
				stack: err.stack
			},
			err
		);
		return;
	}
};

// delete image
module.exports.deleteImage = async key => {
	const deleteObjectAsync = promisify(s3.deleteObject).bind(s3);

	try {
		await deleteObjectAsync({
			Bucket: AWS_BUCKET_NAME,
			Key: key
		});
	} catch (err) {
		console.log(err);
		logger("error", "imageService", err);
		return;
	}
};
