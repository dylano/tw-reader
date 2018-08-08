const express = require("express");
const apiHelper = require("../helpers/apiHelper");

const router = express.Router();

router.route("/friends").get(apiHelper.getFriends);
router.route("/timeline").get(apiHelper.getTimeline);

module.exports = router;
