let emailRegex = /^\S+@\S+\.\S+/,
    passwordRegex = /^[\S]{8,}/;

module.exports.userValidation = (req, res, next) => {
    let { name, email, password } = req.body;
    if (!name | !email) {
        return res.status(400).json({
            message: "Email and name are mandatory!!",
            error: true,
            data: req.body
        });
    }
    if (emailRegex.test(String(email))) {
        return next();
    } else {
        res.status(400).json({
            message: "EmailID is not valid",
            error: true,
            data: req.body
        });
    }
};
