const stringSimilarity = require("string-similarity");
const TwData = require("./twdata");

const twData = new TwData();

exports.getAllTweets = async (req, res) => {
  console.log("API getTweets");
  // get all the current friends
  const friends = await twData.getFriends();

  // get all the tweets for current friends
  const MAX_TWEETS_PER_USER = 50;
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

  return res.json({friends: newfr});
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

exports.getUserTweets = async (req, res) =>
  res.json(await twData.getUserTweets(process.env.TW_USERNAME));

exports.getTimeline = async (req, res) => res.json(await twData.getTimelineTweets());

exports.updateTweet = async (req, res) => {
  const updatedTweet = await twData.markTweetAsRead(req.params.id);
  res.json(updatedTweet);
};

exports.updateFriend = async (req, res) => {
  const {action} = req.body;
  if (action) {
    if (action === "markRead") {
      await twData.markAllTweetsAsRead(req.params.screenName);
      res.status(200).json({action: `${action}`});
    } else if (action === "checkDuplicates") {
      const shouldCheck = !!req.body.value;
      await twData.updateFriendDuplicateCheck(req.params.screenName, shouldCheck || false);
      res.status(200).json({action: `${action}`});
    } else {
      res.status(400).json({error: `Unknown action: ${action}`});
    }
  } else {
    res.status(400).json({error: `'action' parameter required in request body`});
  }
};

exports.testSimilarity = async (req, res) => {
  const {tweet1} = req.body;
  const comps = [];
  for (let i = 0; i < 50; i++) {
    comps.push("Hue Jackson: If only the Browns had listened more to Hue Jackson: ");
  }

  let maxSim = 0;
  if (tweet1) {
    comps.forEach(str => {
      const simval = stringSimilarity.compareTwoStrings(tweet1, str);
      maxSim = simval > maxSim ? simval : maxSim;
    });
  }

  res.json({sim: maxSim});
};

module.exports = exports;
