const bcrypt = require("bcryptjs");

module.exports.users = async (req, res) => {
	let { id, sortBy, sortType } = req.query;
	let users;
	if (id) {
		users = await User.findById(id);
	} else {
		let role = ["core", "member"];
		sortBy ? sortBy : "name";
		sortType ? sortType : "asc";
		users = await User.find({ role: { $in: role } }).sort({
			"[sortBy]": sortType
		});
	}
	res.status(200).json({ message: "success", error: false, data: users });
};

module.exports.addUser = async (req, res) => {
	let { name, email, role } = req.body;
	let user = await User.findOne({ email });
	if (user) {
		res.status(400).json({
			message: "Already exist!!",
			error: true,
			data: null
		});
	} else {
		if (req.user.role === "core") {
			role = "member";
		}
		user = await User.create(req.body);
		let password = user._id.toString().slice(16, 24);
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);
		await user.save();
		// send details by email to user!!
		res.status(200).json({ message: "success", error: false, data: null });
	}
};

module.exports.login = async (req, res) => {
	let { email, password } = req.body;
	let user = await User.findOne({
		email: { $regex: `^${email}$`, $options: "i" }
	});
	if (!user)
		return res
			.status(406)
			.json({ message: "Invalid user.", error: true, data: null });
	const validPassword = await bcrypt.compare(password, user.password);
	if (!validPassword)
		return res
			.status(406)
			.json({ message: "Invalid Password.", error: true, data: null });
	const token = user.generateAuthToken();
	res.status(200)
		.header("x-auth-token", token)
		.json({ message: "success", error: false, data: user });
};

module.exports.updateUser = async (req, res) => {
	let { role, showOnWebsite } = req.body;
	let user = await User.findById(req.params.id);
	user.role = role;
	user.showOnWebsite = showOnWebsite;
	user = await user.save();
	res.status(200).json({ message: "success", error: false, data: user });
};

module.exports.deleteUser = async (req, res) => {
	let user = User.findById(req.params.id);
	if (req.user.role === "core" && user.role !== "member") {
		res.status(403).json({
			message: "Not Authorized.",
			error: true,
			data: null
		});
	} else {
		await user.delete();
		res.status(200).json({ message: "success", error: false, data: null });
	}
};

module.exports.profile = async (req, res) => {
	let profile;
	if (req.query.id) {
		profile = await User.findById(req.query.id);
	} else {
		profile = await User.findById(req.user.id);
	}
	res.status(200).json({ message: "success", error: false, data: profile });
};

module.exports.updateProfile = async (req, res) => {
	let {
		name,
		password,
		contact,
		designation,
		github,
		linkedin,
		twitter,
		portfolio
	} = req.body;
	let profile = await User.findById(req.query.id);
	profile.name = name;
	profile.contact = contact;
	profile.designation = designation;
	profile.github = github;
	profile.linkedin = linkedin;
	profile.twitter = twitter;
	profile.portfolio = portfolio;
	if (password) {
		const salt = await bcrypt.genSalt(10);
		profile.password = await bcrypt.hash(password, salt);
	}
	profile = await profile.save();
	res.status(200).json({ message: "success", error: false, data: profile });
};
