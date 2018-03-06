/* eslint class-methods-use-this: 0 */ // --> OFF
const Twitter = require("./twitter");

const twitter = new Twitter();

function formatTweet(tweet) {
  // console.log(tweet);
  const text = tweet.full_text || tweet.text;
  return `${tweet.user.name} (${tweet.user.id}):  <${tweet.id_str}>  ${text}`;
}

module.exports = class TwData {
  async getTweet(tweetId) {
    /*
    check db for tweet
    else retrieve from twitter & store
    return db.find()
    */
    const tweet = await twitter.getTweet(tweetId);
    console.log(formatTweet(tweet));
  }

  async getUserTweets(screenName, count) {
    /*
    look up most recent tweets 
    */
    const tweets = await twitter.getUserTimeline(screenName, count);
    return tweets;
  }

  async getHomeTweets(screenName, count) {
    /*
    look up most recent tweets 
    */
    const tweets = await twitter.getHomeTimeline(screenName, count);
    return tweets;
  }

  async markTweetAsRead(tweetId) {
    /*
    find tweet in db and update read=1
    */
    console.log("twdata.markTweetAsRead");
  }

  async getFriends(screenName) {
    /*
    call twitter to get friends list
    insert into db
    return db.find()
    */
    return twitter.getFriends(screenName);
  }

  async getTweetsByFriend(friendId) {
    /*
    read tweets from db
    return {new: [], unread:[]}
    */
    console.log("twdata.getTweetsByFriend");
  }

  async refreshTweets() {
    /*
    get most recent tweet ID from db
    call twitter for new tweets since
    store in db
    */
    console.log("twdata.refreshTweets");
  }
};
