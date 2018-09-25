const TwData = require("./twdata");

const twData = new TwData();
const TW_USER = process.env.TW_USERNAME;

exports.renderMain = async (req, res) => {
  try {
    const data = await twData.getFriendsWithTweets();
    res.render("main", { data });
  } catch (err) {
    console.log(err);
  }
};

exports.renderFriends = async (req, res) => {
  try {
    const friends = await twData.getFriends();
    res.render("friends", { friends });
  } catch (err) {
    console.log(err);
  }
};

exports.renderUser = async (req, res) => {
  try {
    const tweets = await twData.getUserTweets(TW_USER);
    res.render("user", { tweets });
  } catch (err) {
    console.log(err);
  }
};

exports.renderTimeline = async (req, res) => {
  try {
    const tweets = await twData.getTimelineTweets();
    res.render("timeline", { tweets });
  } catch (err) {
    console.log(err);
  }
};

exports.renderFriend = async (req, res) => {
  try {
    const friend = await twData.getFriend(req.params.id);
    const tweets = await twData.getTweetsByScreenName(friend.screenName);
    const data = { friend, tweets };
    res.render("friend", { data });
  } catch (err) {
    console.log(err);
  }
};

exports.updateTweet = async (req, res) => {
  try {
    await twData.markTweetAsRead(req.params.id);
    if (req.query.dest) {
      res.redirect(`/${req.query.dest}`);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.updateFriend = async (req, res) => {
  try {
    console.log(`mark read ${req.params.screenName}`);
    await twData.markAllTweetsAsRead(req.params.screenName);

    if (req.query.dest) {
      res.redirect(`/${req.query.dest}`);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.refreshMain = async (req, res) => {
  try {
    await twData.loadTweets(TW_USER, 100);
    res.redirect("/main");
  } catch (err) {
    console.log(err);
  }
};

exports.refreshFriends = async (req, res) => {
  try {
    await twData.loadFriends(TW_USER);
    res.redirect("/friends");
  } catch (err) {
    console.log(err);
  }
};

exports.refreshTimeline = async (req, res) => {
  try {
    await twData.loadTweets(TW_USER, 100);
    res.redirect("/timeline");
  } catch (err) {
    console.log(err);
  }
};

module.exports = exports;
