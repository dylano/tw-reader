/* eslint class-methods-use-this: 0 */ // --> OFF
const Twitter = require("./twitter");
const Friend = require("./models/friend");
const Tweet = require("./models/tweet");

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
    console.log(tweet);
  }

  async getFriend(friendId) {
    return Friend.findById(friendId);
  }

  async getUserTweets(screenName, count) {
    /*
    look up most recent tweets 
    */
    const tweets = await twitter.getUserTimeline(screenName, count);
    return tweets;
  }

  async getTimelineTweets() {
    /*
    look up most recent tweets 
    */
    return Tweet.find();
  }

  async markTweetAsRead(tweetMongoId) {
    await Tweet.findByIdAndUpdate(tweetMongoId, { isRead: true });
  }

  async getFriends() {
    return Friend.find();
  }

  async loadFriends(screenName) {
    const friends = await twitter.getFriends(screenName);

    // Clean out DB and re-load with new friend list.
    Friend.remove({}).then(() => {
      friends.forEach(friend => {
        Friend.create({
          id: friend.id_str,
          screenName: friend.screen_name,
          name: friend.name,
          imgUrl: friend.profile_image_url_https
        }).then(newFriend => {
          console.log(`Added friend ${newFriend.screenName}`);
        });
      });
    });
    return friends;
  }

  async loadTweets(screenName, count) {
    const tweets = await twitter.getHomeTimeline(screenName, count);

    // todo: implement since_id param so that we aren't getting duplicates
    // todo: don't insert duplicates
    Tweet.remove({}).then(() => {
      tweets.forEach(tweet => {
        Tweet.create({
          id: tweet.id_str,
          text: tweet.full_text || tweet.text,
          timestamp: tweet.created_at,
          userId: tweet.user.id_str,
          userName: tweet.user.name,
          userScreenName: tweet.user.screen_name,
          isRead: false
        }).then(newTweet => {
          console.log(`Added tweet ${newTweet.id}`);
        });
      });
    });
    return tweets;
  }

  async getTweetsByFriendId(friendId) {
    /*
    read tweets from db
    return {new: [], unread:[]}
    */
    console.log(`twdata.getTweetsByFriend ${friendId}`);
    return Tweet.find({ userId: friendId });
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
