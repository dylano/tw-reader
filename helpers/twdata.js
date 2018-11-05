/* eslint class-methods-use-this: 0 */ // --> OFF
const stringSimilarity = require('string-similarity');
const Twitter = require('./twitter');
const Friend = require('../models/friend');
const Tweet = require('../models/tweet');
const AppData = require('../models/appdata');

const DEFAULT_MAX_TIMELINE_TWEETS = 250;
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
    return Friend.findById(friendId);
  }

  async getFriendByTwitterUserId(userId) {
    const friendArr = await Friend.find({ id: userId });
    if (friendArr.length) {
      return friendArr[0];
    }
    return null;
  }

  // get count most recent tweets by the logged in user
  async getUserTweets(screenName, count) {
    const tweets = await twitter.getUserTimeline(screenName, count);
    return tweets;
  }

  async getTimelineTweets(maxResults = DEFAULT_MAX_TIMELINE_TWEETS) {
    if (maxResults <= 0) {
      maxResults = DEFAULT_MAX_TIMELINE_TWEETS;
    }
    return Tweet.aggregate([{ $sort: { timestamp: -1 } }]).limit(maxResults);
  }

  async markTweetAsRead(tweetMongoId) {
    return Tweet.findByIdAndUpdate(tweetMongoId, { isRead: true }, { new: true });
  }

  async markAllTweetsAsRead(screenName) {
    // db.tweets.updateMany({ "userScreenName" : "TheAthleticSF","isRead":false }, {$set:{"isRead":true}} )
    await Tweet.updateMany(
      { userScreenName: screenName, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async getFriends() {
    const friends = await Friend.find();
    return friends.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
  }

  async loadFriends(screenName) {
    const friends = await twitter.getFriends(screenName);

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

  async getAppData(screenName) {
    return AppData.findOne({ screenName });
  }

  async loadTweets(screenName, count) {
    try {
      // get most recent timeline tweet seen for this user
      const userAppData = await this.getAppData(screenName);
      const sinceId = userAppData ? userAppData.mostRecentTweet : '1';

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

      const tweetCache = {};

      tweets.forEach(async tweet => {
        const tweetStr = tweet.full_text || tweet.text;

        // check against most recent tweets from this user and don't add if this is a duplicate of an earlier tweet
        const thisFriend = await this.getFriendByTwitterUserId(tweet.user.id_str);
        let maxSim = 0;

        if (true || thisFriend.checkForDuplicates) {
          //todo: remove true case
          console.log(`friend ${thisFriend.screenName} is flagged for duplicate check.`);

          if (!tweetCache[tweet.user.screen_name]) {
            console.log(`loading recent tweet cache for ${tweet.user.screen_name}`);
            tweetCache[tweet.user.screen_name] = await this.getTweetsByScreenName(
              tweet.user.screen_name,
              false,
              25
            );
          }

          let maxStr = '';
          tweetCache[tweet.user.screen_name].forEach(cmpTweet => {
            const simval = stringSimilarity.compareTwoStrings(tweetStr, cmpTweet.text);
            if (simval > maxSim) {
              maxSim = simval;
              maxStr = cmpTweet.text;
            }
          });
          if (maxSim > 0) {
            console.log(`maxSim for ${tweetStr} is ${maxSim} based on ${maxStr}`);
          }
          // todo: if max sim is too high (>.75?), do not add to Tweets table
        }

        // save new tweets to DB
        Tweet.update(
          { id: tweet.id_str },
          {
            id: tweet.id_str,
            text: tweetStr,
            timestamp: tweet.created_at,
            userId: tweet.user.id_str,
            userName: tweet.user.name,
            userScreenName: tweet.user.screen_name,
            isRead: false,
            similarity: maxSim.toFixed(2)
          },
          { upsert: true }
        ).then(() => {});
      });
    } catch (err) {
      console.error('loadTweets error:', err);
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
        { $match: { userScreenName: screenName, isRead: false } },
        { $sort: { timestamp: -1 } }
      ]).limit(maxResults);
    }
    return Tweet.aggregate([
      { $match: { userScreenName: screenName } },
      { $sort: { timestamp: -1 } }
    ]).limit(maxResults);
  }

  // (users with unread tweets)> db.tweets.aggregate([ {$match : {"isRead":false} }, {$group : {_id:"$userId", count:{$sum:1}}}, {$sort:{"count":-1}} ])
  async getFriendsWithTweets() {
    // get users with unread tweets
    const users = await Tweet.aggregate([
      { $match: { isRead: false } },
      { $group: { _id: '$userScreenName', count: { $sum: 1 } } }
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
