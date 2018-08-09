const express = require("express");
const appHelper = require("../helpers/appHelper");

const router = express.Router();

router.get("/", (req, res) => res.redirect("main"));

router
  .route("/main")
  .get(appHelper.renderMain)
  .post(appHelper.refreshMain);
router
  .route("/timeline")
  .get(appHelper.renderTimeline)
  .post(appHelper.refreshTimeline);
router
  .route("/friends")
  .get(appHelper.renderFriends)
  .post(appHelper.refreshFriends);

router.get("/user", appHelper.renderUser);
router.get("/friends/:id", appHelper.renderFriend);

router.put("/tweets/:id", appHelper.updateTweet);
router.put("/friends/:screenName", appHelper.updateFriend);

module.exports = router;
