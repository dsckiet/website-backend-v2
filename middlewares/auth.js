const jwt = require("jsonwebtoken");

module.exports.allAuth = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token)
        return res.status(401).json({
            message: "Access denied. No Token provided",
            error: true,
            data: null
        });
    const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decodedPayload;
    return next();
};

module.exports.leadAuth = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token)
        return res
            .status(401)
            .json({ message: "Access denied. No Token provided", error: true });
    const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    if (decodedPayload.role === "lead") {
        req.user = decodedPayload;
        return next();
    } else {
        return res
            .status(403)
            .json({ message: "forbidden", error: true, data: null });
    }
};

module.exports.coreAuth = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token)
        return res
            .status(401)
            .json({ message: "Access denied. No Token provided", error: true });

    const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    if (decodedPayload.role === "core" || decodedPayload.role === "lead") {
        req.user = decodedPayload;
        return next();
    } else {
        return res
            .status(403)
            .json({ message: "forbidden", error: true, data: null });
    }
};
