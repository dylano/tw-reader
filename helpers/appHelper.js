const TwData = require("./twdata");

const twData = new TwData();

exports.getFriends = async () => twData.getFriends();

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
    const friends = await this.getFriends();
    res.render("friends", { friends });
  } catch (err) {
    console.log(err);
  }
};

exports.renderUser = async (req, res) => {
  try {
    const tweets = await twData.getUserTweets("dtoliver");
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

exports.renderFriend = (req, res) => {
  try {
    twData.getFriend(req.params.id).then(friend => {
      twData.getTweetsByScreenName(friend.screenName).then(tweets => {
        res.render("friend", { friend, tweets });
      });
    });
    // res.send(`tweets for user ${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = exports;
