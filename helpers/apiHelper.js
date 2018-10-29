const TwData = require("./twdata");

const twData = new TwData();

exports.getAllTweets = async (req, res) => {
  console.log("API getTweets");
  // get all the current friends
  const friends = await twData.getFriends();

  // get all the tweets for current friends
  const MAX_TWEETS_PER_USER = 25;
  const promArray = [];
  friends.forEach(friend => {
    promArray.push(twData.getTweetsByScreenName(friend.screenName, false, MAX_TWEETS_PER_USER));
  });
  const usertweets = await Promise.all(promArray);

  // stick them together
  const newfr = friends.map((friend, idx) => ({
    friend,
    tweets: usertweets[idx]
  }));

  return res.json({ friends: newfr });
};

exports.refreshTweets = async (req, res) => {
  console.log("API refreshTweets");
  await twData.loadTweets(process.env.TW_USERNAME, 100);
  res.status(204).json({});
};

exports.getFriends = async (req, res) => res.json(await twData.getFriends());

exports.getFriend = async (req, res) => {
  const getNewTweets = req.query.new === "1";
  console.log(`getNewTweets is ${getNewTweets}`);

  const friend = await twData.getFriend(req.params.id);
  const tweets = await twData.getTweetsByScreenName(friend.screenName, getNewTweets);

  return res.json({
    friend,
    tweets
  });
};

exports.getUserTweets = async (req, res) => res.json(await twData.getUserTweets(process.env.TW_USERNAME));

exports.getTimeline = async (req, res) => res.json(await twData.getTimelineTweets());

exports.updateTweet = async (req, res) => {
  const updatedTweet = await twData.markTweetAsRead(req.params.id);
  res.json(updatedTweet);
};

exports.updateFriend = async (req, res) => {
  await twData.markAllTweetsAsRead(req.params.screenName);
  res.status(204).json({});
};

module.exports = exports;
