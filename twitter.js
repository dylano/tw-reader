/* eslint class-methods-use-this: 0 */ // --> OFF
const Twitter = require("twitter");

const client = new Twitter({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token_key: process.env.TW_TOKEN_KEY,
  access_token_secret: process.env.TW_TOKEN_SECRET
});

module.exports = class TwData {
  async getTweet(tweetId) {
    try {
      const params = {
        tweet_mode: "extended",
        id: tweetId,
        trim_user: 0
      };
      return client.get("statuses/show", params);
    } catch (err) {
      throw new Error(err);
    }
  }

  async getUserTimeline(screenName, numTweets = 10) {
    const params = {
      screen_name: screenName,
      count: numTweets,
      tweet_mode: "extended",
      trim_user: 0
    };
    return client.get("statuses/user_timeline", params);
  }

  async getHomeTimeline(screenName, sinceId, numTweets = 10) {
    console.log("twitter since", sinceId);
    const params = {
      screen_name: screenName,
      count: numTweets,
      tweet_mode: "extended",
      since_id: sinceId,
      trim_user: 0
    };
    return client.get("statuses/home_timeline", params);
  }

  async getFriends(screenName) {
    let allFriends = [];
    const params = { screen_name: screenName, count: 50 };
    let cursor = "-1";
    try {
      while (cursor !== "0") {
        params.cursor = cursor;
        // eslint-disable-next-line no-await-in-loop, call depends on previous iteration
        const fList = await client.get("friends/list", params);
        allFriends = allFriends.concat(fList.users);
        cursor = fList.next_cursor_str;
      }

      return allFriends;
    } catch (err) {
      throw new Error(err);
    }
  }
};
