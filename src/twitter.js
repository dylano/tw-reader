const Twitter = require("twitter");

const client = new Twitter({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token_key: process.env.TW_TOKEN_KEY,
  access_token_secret: process.env.TW_TOKEN_SECRET
});

function log(msg) {
  console.log(msg);
}

function logError(error) {
  log(`**Error: ${error.message}`);
}

function formatTweet(tweet) {
  return `${tweet.user.name} (${tweet.user.id}):  <${tweet.id}>  ${tweet.text}`;
}

// Sample user timeline
const userParams = {
  screen_name: "dtoliver",
  count: 1,
  trim_user: 1,
  include_entities: 0
};

function getUserTimeline(params) {
  client
    .get("statuses/user_timeline", params)
    .then(tweets => {
      tweets.forEach(tweet => console.log(formatTweet(tweet)));
    })
    .catch(error => {
      logError(error);
    });
}

// Sample home timeline
const homeParams = {
  screen_name: "dtoliver",
  since_id: "949401650174840800",
  count: 5,
  trim_user: 0
};

function getHomeTimeline(params) {
  client
    .get("statuses/home_timeline", params)
    .then(tweets => {
      tweets.forEach(tweet => console.log(formatTweet(tweet)));
    })
    .catch(error => {
      logError(error);
    });
}

// Sample list of friends
const friendParams = {
  screen_name: "dtoliver",
  count: 20,
  next_cursor_str: -1
};

function getFriends(params) {
  client
    .get("friends/list", params)
    .then(fList => {
      fList.users.forEach(user => {
        log(user.name);
      });
    })
    .catch(error => {
      logError(error);
    });
}

getUserTimeline(userParams);
getHomeTimeline(homeParams);
getFriends(friendParams);
