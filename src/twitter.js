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

// Sample user timeline
const userParams = {
  screen_name: "dtoliver",
  count: 1,
  trim_user: 1,
  include_entities: 0
};

client
  .get("statuses/user_timeline", userParams)
  .then(tweets => {
    console.log(tweets);
  })
  .catch(error => {
    logError(error);
  });

// Sample home timeline
const homeParams = {
  screen_name: "dtoliver",
  since_id: "949401650174840800",
  count: 5,
  trim_user: 0
};

client
  .get("statuses/home_timeline", homeParams)
  .then(tweets => {
    for (tweet of tweets) {
      console.log(formatTweet(tweet));
    }
  })
  .catch(error => {
    logError(error);
  });

function formatTweet(tweet) {
  return `${tweet.user.name} (${tweet.user.id}):  <${tweet.id}>  ${tweet.text}`;
}

// Sample list of friends
const friendCursor = -1;
const friendParams = {
  screen_name: "dtoliver",
  count: 20,
  next_cursor_str: -1
};

friendParams.next_cursor_str = friendCursor;
getFriends(friendParams);
// update friendCursor and call for the next batch

function getFriends(params) {
  client
    .get("friends/list", params)
    .then(fList => {
      for (user of fList.users) {
        log(user.name);
      }
    })
    .catch(error => {
      logError(error);
    });
}
