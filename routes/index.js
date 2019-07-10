const express = require("express");
const router = express.Router();

const { index } = require("../controllers/index_controller");

router.get("/", index);

module.exports = router;
