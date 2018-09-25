const TwData = require("./twdata");

const twData = new TwData();

exports.getFriends = async (req, res) => res.json(await twData.getFriends());

exports.getFriend = async (req, res) => {
  const getNewTweets = req.query.new === "1";
  console.log(`getNewTweets is ${getNewTweets}`);

  const friend = await twData.getFriend(req.params.id);
  const tweets = await twData.getTweetsByScreenName(
    friend.screenName,
    getNewTweets
  );

  return res.json({
    friend,
    tweets
  });
};

exports.getUserTweets = async (req, res) =>
  res.json(await twData.getUserTweets(process.env.TW_USERNAME));

exports.getTimeline = async (req, res) =>
  res.json(await twData.getTimelineTweets());

exports.updateTweet = async (req, res) => {
  const updatedTweet = await twData.markTweetAsRead(req.params.id);
  res.json(updatedTweet);
};

exports.updateFriend = async (req, res) => {
  await twData.markAllTweetsAsRead(req.params.screenName);
  res.status(204).json({});
};

module.exports = exports;
