const TwData = require("./twdata");

const twData = new TwData();

exports.getFriends = async (req, res) => {
  const friends = await twData.getFriends();
  res.json(friends);
};

exports.getTimeline = (req, res) => {
  const tweet = {
    name: "bill",
    handle: "@billbo",
    tweet: "loving this ring!!"
  };
  const tweets = [tweet, tweet];
  res.json(tweets);
};

module.exports = exports;
