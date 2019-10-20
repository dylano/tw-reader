/* eslint class-methods-use-this: 0 */ // --> OFF
const stringSimilarity = require("string-similarity");
const Twitter = require("./twitter");
const Friend = require("../models/friend");
const Tweet = require("../models/tweet");
const AppData = require("../models/appdata");

const DEFAULT_MAX_TIMELINE_TWEETS = 250;
const NUM_TWEETS_DUPE_LOOKBACK = 50;
const SIMILARITY_THRESHOLD = 0.7;
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

  async getFriend(databaseId) {
    return Friend.findById(databaseId);
  }

  async getFriendByTwitterUserId(twitterUserId) {
    const friendArr = await Friend.find({id: twitterUserId});
    if (friendArr.length) {
      return friendArr[0];
    }
    return null;
  }

  // get count most recent tweets by the logged in user
  async getUserTweets(twitterAccountUsername, count) {
    const tweets = await twitter.getUserTimeline(twitterAccountUsername, count);
    return tweets;
  }

  async getTimelineTweets(maxResults = DEFAULT_MAX_TIMELINE_TWEETS) {
    if (maxResults <= 0) {
      maxResults = DEFAULT_MAX_TIMELINE_TWEETS;
    }
    return Tweet.aggregate([{$sort: {timestamp: -1}}]).limit(maxResults);
  }

  async markTweetAsRead(databaseId) {
    return Tweet.findByIdAndUpdate(databaseId, {isRead: true}, {new: true});
  }

  async markAllTweetsAsRead(screenName) {
    // db.tweets.updateMany({ "userScreenName" : "TheAthleticSF","isRead":false }, {$set:{"isRead":true}} )
    await Tweet.updateMany({userScreenName: screenName, isRead: false}, {$set: {isRead: true}});
  }

  async updateFriendDuplicateCheck(screenName, checkForDuplicates) {
    console.log(`updateFriendDuplicateCheck: ${screenName}/${checkForDuplicates}`);
    return Friend.updateOne({screenName}, {checkForDuplicates});
  }

  async getFriends() {
    const friends = await Friend.find();
    return friends.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
  }

  async loadFriends(twitterAccountUsername) {
    const friends = await twitter.getFriends(twitterAccountUsername);

    // Clean out DB and re-load with new friend list.
    await Friend.deleteMany({});
    const promArr = [];
    friends.forEach(friend => {
      promArr.push(
        Friend.create({
          id: friend.id_str,
          screenName: friend.screen_name,
          name: friend.name,
          imgUrl: friend.profile_image_url_https,
          checkForDuplicates: false
        })
      );
    });
    await Promise.all(promArr);
    return this.getFriends();
  }

  async getAppData(twitterAccountUsername) {
    return AppData.findOne({screenName: twitterAccountUsername});
  }

  async loadTweets(twitterAccountUsername, count) {
    try {
      // get most recent timeline tweet seen for this user
      const userAppData = await this.getAppData(twitterAccountUsername);
      const sinceId = userAppData ? userAppData.mostRecentTweet : "1";

      // get tweets
      const newTweets = await twitter.getHomeTimeline(twitterAccountUsername, sinceId, count);
      console.log(`Retrived ${newTweets.length} tweets from twitter`);

      // save the latest tweet ID from new tweets
      if (newTweets && newTweets.length) {
        await AppData.update(
          {screenName: twitterAccountUsername},
          {screenName: twitterAccountUsername, mostRecentTweet: newTweets[0].id_str},
          {upsert: true}
        );
      }

      const tweetCache = {};

      newTweets.forEach(async newTweet => {
        if (newTweet.retweeted_status) {
          console.log("retweet? ", {newTweet});
        }
        const newTweetStr = newTweet.retweeted_status
          ? `(RT @${newTweet.retweeted_status.user.screen_name}) ${
              newTweet.retweeted_status.full_text
            }`
          : newTweet.full_text || newTweet.text;

        const newTweetFriend = await this.getFriendByTwitterUserId(newTweet.user.id_str);
        let maxSimScore = 0;
        let maxSimStr = "";

        // for known double tweet offenders, check for recent duplicate tweets
        if (newTweetFriend.checkForDuplicates) {
          console.log(`friend ${newTweetFriend.screenName} is flagged for duplicate check.`);

          // todo: cache doesn't appear to be working, multiple tweets from one user result in multiple DB queries to load
          // load cache with most recent tweets from this user
          if (!tweetCache[newTweet.user.screen_name]) {
            tweetCache[newTweet.user.screen_name] = await this.getTweetsByScreenName(
              newTweet.user.screen_name,
              false,
              NUM_TWEETS_DUPE_LOOKBACK
            );
          }

          // compare against all tweets in the lookback window
          tweetCache[newTweet.user.screen_name].forEach(existingTweet => {
            const simval = stringSimilarity.compareTwoStrings(newTweetStr, existingTweet.text);
            if (simval > maxSimScore) {
              maxSimScore = simval.toFixed(2);
              maxSimStr = existingTweet.text;
            }
          });
        }

        // save new tweets to DB
        Tweet.update(
          {id: newTweet.id_str},
          {
            id: newTweet.id_str,
            text: newTweetStr,
            timestamp: newTweet.created_at,
            userId: newTweet.user.id_str,
            userName: newTweet.user.name,
            userScreenName: newTweet.user.screen_name,
            isRead: maxSimScore > SIMILARITY_THRESHOLD,
            similarity: maxSimScore,
            similarityString: maxSimStr
          },
          {upsert: true}
        ).then(() => {});
      });
    } catch (err) {
      console.error("loadTweets error:", err);
    }
  }

  async getTweetsByScreenName(
    screenName,
    unreadOnly = false,
    maxResults = DEFAULT_MAX_TIMELINE_TWEETS
  ) {
    if (maxResults <= 0) {
      maxResults = DEFAULT_MAX_TIMELINE_TWEETS;
    }

    // db.tweets.aggregate([{$match: {userScreenName: "TheAthleticSF"}},{ $sort: { timestamp: -1 } }])
    if (unreadOnly) {
      return Tweet.aggregate([
        {$match: {userScreenName: screenName, isRead: false}},
        {$sort: {timestamp: -1}}
      ]).limit(maxResults);
    }
    return Tweet.aggregate([
      {$match: {userScreenName: screenName}},
      {$sort: {timestamp: -1}}
    ]).limit(maxResults);
  }

  // (users with unread tweets)> db.tweets.aggregate([ {$match : {"isRead":false} }, {$group : {_id:"$userId", count:{$sum:1}}}, {$sort:{"count":-1}} ])
  async getFriendsWithTweets() {
    // get users with unread tweets
    const users = await Tweet.aggregate([
      {$match: {isRead: false}},
      {$group: {_id: "$userScreenName", count: {$sum: 1}}}
    ]);
    /*
    [ { _id: 'AandGShow', count: 6 },
      { _id: 'Deadspin', count: 6 },
      { _id: 'FrankHowarth', count: 2 }]
    */

    // get tweets for each user
    const promArray = [];
    users.forEach(async (user, i) => {
      promArray.push(this.getTweetsByScreenName(users[i]._id, true));
    });
    const usertweets = await Promise.all(promArray);

    return users
      .map((user, idx) => ({
        name: user._id,
        tweets: usertweets[idx]
      }))
      .sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
  }
};
