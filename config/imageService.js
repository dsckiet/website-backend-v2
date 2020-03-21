const aws = require("aws-sdk");
const { promisify } = require("util");

const { logger } = require("../utility/helpers");

const { AWS_KEY, AWS_SECRET, AWS_BUCKET_NAME, AWS_REGION } = require("./index");

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
		ServerSideEncryption: "AES256"
	};
	try {
		let resp = await uploadObjectAsync(params);
		return resp.Location;
	} catch (err) {
		console.log(err);
		logger("error", "imageService", err);
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
