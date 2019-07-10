require("dotenv").config();

module.exports.index = (req, res) => {
    return res.render("index", {
        message: ""
    });
};
