/* eslint class-methods-use-this: 0 */ // --> OFF
const Twitter = require("./twitter");
const Friend = require("./models/friend");
const Tweet = require("./models/tweet");
const AppData = require("./models/appdata");

const twitter = new Twitter();

function formatTweet(tweet) {
  // console.log(tweet);
  const text = tweet.full_text || tweet.text;
  return `${tweet.user.name} (${tweet.user.id}):  <${tweet.id_str}>  ${text}`;
}

module.exports = class TwData {
  async getTweet(tweetId) {
    /*
    todo: check db for tweet
    else retrieve from twitter & store
    return db.find()
    */
    const tweet = await twitter.getTweet(tweetId);
    console.log(formatTweet(tweet));
    console.log(tweet);
  }

  async getFriend(friendId) {
    // todo: if not in local db, retrieve from twitter and insert
    return Friend.findById(friendId);
  }

  async getFriendByTwitterUserId(userId) {
    return Friend.find({ id: userId });
  }

  // get count most recent tweets by the logged in user
  async getUserTweets(screenName, count) {
    const tweets = await twitter.getUserTimeline(screenName, count);
    return tweets;
  }

  async getTimelineTweets() {
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

  async getMostRecentTweet(screenName) {
    return AppData.findOne({ screenName });
  }

  async loadTweets(screenName, count) {
    // get most recent timeline tweet seen for this user
    const recentTweetId = await this.getMostRecentTweet(screenName);
    const sinceId = recentTweetId ? recentTweetId.mostRecentTweet : "0";

    // get tweets
    const tweets = await twitter.getHomeTimeline(screenName, sinceId, count);
    console.log(`Retrived ${tweets.length} tweets from twitter`);

    // save the latest tweet ID from new tweets
    if (tweets && tweets.length) {
      await AppData.update(
        { screenName },
        { screenName, mostRecentTweet: tweets[0].id_str },
        { upsert: true }
      );
    }

    // save new tweets to DB
    tweets.forEach(tweet => {
      Tweet.update(
        { id: tweet.id_str },
        {
          id: tweet.id_str,
          text: tweet.full_text || tweet.text,
          timestamp: tweet.created_at,
          userId: tweet.user.id_str,
          userName: tweet.user.name,
          userScreenName: tweet.user.screen_name,
          isRead: false
        },
        { upsert: true }
      ).then(() => {});
    });
  }

  async getTweetsByFriendId(friendId, unreadOnly = false) {
    console.log(`twdata.getTweetsByFriend ${friendId}`);
    if (unreadOnly) {
      return Tweet.find({ userId: friendId, isRead: false });
    }
    return Tweet.find({ userId: friendId });
  }

  // (users with unread tweets)> db.tweets.aggregate([ {$match : {"isRead":false} }, {$group : {_id:"$userId", count:{$sum:1}}}, {$sort:{"count":-1}} ])
  async getFriendsWithTweets() {
    const result = [];

    // get users with unread tweets
    const users = await Tweet.aggregate([
      { $match: { isRead: false } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // get tweets for each user
    // todo: figure out how to clean this up with Promise.all() and get rid of the parallel arrays
    const usertweets = [];
    for (let i = 0; i < users.length; i++) {
      usertweets.push(await this.getTweetsByFriendId(users[i]._id, true));
    }

    let count = 0;
    users.forEach(async user => {
      result.push({ name: user._id, tweets: usertweets[count++] });
    });

    return result;
  }
};
