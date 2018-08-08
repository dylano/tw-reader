const express = require("express");
const appHelper = require("../helpers/appHelper");

const router = express.Router();

router.get("/", (req, res) => res.redirect("/main"));
router.get("/main", appHelper.renderMain);
router.get("/user", appHelper.renderUser);
router.get("/timeline", appHelper.renderTimeline);
router.get("/friends", appHelper.renderFriends);
router.get("/friends/:id", appHelper.renderFriend);

module.exports = router;
