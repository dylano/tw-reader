const Twitter = require("twitter");

const methods = {};

const client = new Twitter({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token_key: process.env.TW_TOKEN_KEY,
  access_token_secret: process.env.TW_TOKEN_SECRET
});

function formatTweet(tweet) {
  // console.log(tweet);
  return `${tweet.user.name} (${tweet.user.id}):  <${tweet.id_str}>  ${
    tweet.full_text
  }`;
}

methods.getUserTimeline = async () => {
  const params = {
    screen_name: "dtoliver",
    count: 5,
    trim_user: 1
  };
  const tweets = await client.get("statuses/user_timeline", params);
  tweets.forEach(tweet => console.log(formatTweet(tweet)));
};

methods.getTweet = async tweetId => {
  try {
    const params = {
      tweet_mode: "extended",
      id: tweetId,
      trim_user: 1
    };
    const tweet = await client.get("statuses/show", params);
    console.log(tweet);
  } catch (err) {
    console.log(err);
  }
};

methods.getHomeTimeline = async () => {
  const params = {
    screen_name: "dtoliver",
    since_id: "949401650174840800",
    tweet_mode: "extended",
    count: 5,
    trim_user: 0
  };
  const tweets = await client.get("statuses/home_timeline", params);
  tweets.forEach(tweet => console.log(formatTweet(tweet)));
};

methods.getFriends = async screenName => {
  let allFriends = [];
  const params = { screen_name: screenName, count: 50 };
  let cursor = "-1";
  try {
    while (cursor !== "0") {
      params.cursor = cursor;
      console.log(`** Cursor = ${cursor}`);
      // eslint-disable-next-line no-await-in-loop, call depends on previous iteration
      const fList = await client.get("friends/list", params);
      allFriends = allFriends.concat(fList.users);
      cursor = fList.next_cursor_str;
    }

    return allFriends;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

module.exports = methods;
