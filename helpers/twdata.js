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

  async getFriend(databaseId) {
    return Friend.findById(databaseId);
  }

  async getFriendByTwitterUserId(twitterUserId) {
    const friendArr = await Friend.find({ id: twitterUserId });
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
    return Tweet.aggregate([{ $sort: { timestamp: -1 } }]).limit(maxResults);
  }

  async markTweetAsRead(databaseId) {
    return Tweet.findByIdAndUpdate(databaseId, { isRead: true }, { new: true });
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
    return AppData.findOne({ screenName: twitterAccountUsername });
  }

  async loadTweets(twitterAccountUsername, count) {
    try {
      // get most recent timeline tweet seen for this user
      const userAppData = await this.getAppData(twitterAccountUsername);
      const sinceId = userAppData ? userAppData.mostRecentTweet : '1';

      // get tweets
      const newTweets = await twitter.getHomeTimeline(twitterAccountUsername, sinceId, count);
      console.log(`Retrived ${newTweets.length} tweets from twitter`);

      // save the latest tweet ID from new tweets
      if (newTweets && newTweets.length) {
        await AppData.update(
          { screenName: twitterAccountUsername },
          { screenName: twitterAccountUsername, mostRecentTweet: newTweets[0].id_str },
          { upsert: true }
        );
      }

      const tweetCache = {};

      newTweets.forEach(async newTweet => {
        const newTweetStr = newTweet.full_text || newTweet.text;

        // check against most recent tweets from this user and don't add if this is a duplicate of an earlier tweet
        const newTweetFriend = await this.getFriendByTwitterUserId(newTweet.user.id_str);
        let maxSimScore = 0;

        if (true || newTweetFriend.checkForDuplicates) {
          //todo: remove true case
          console.log(`friend ${newTweetFriend.screenName} is flagged for duplicate check.`);

          if (!tweetCache[newTweet.user.screen_name]) {
            console.log(`loading recent tweet cache for ${newTweet.user.screen_name}`);
            tweetCache[newTweet.user.screen_name] = await this.getTweetsByScreenName(
              newTweet.user.screen_name,
              false,
              25
            );
          }

          let maxSimStr = '';
          tweetCache[newTweet.user.screen_name].forEach(existingTweet => {
            const simval = stringSimilarity.compareTwoStrings(newTweetStr, existingTweet.text);
            if (simval > maxSimScore) {
              maxSimScore = simval.toFixed(2);
              maxSimStr = existingTweet.text;
            }
          });
          if (maxSimScore > 0) {
            console.log(
              `${maxSimScore} maxSimScore for '${newTweetStr}' -- based on '${maxSimStr}'`
            );
          }
          // todo: if max sim is too high (>.75?), do not add to Tweets table
        }

        // save new tweets to DB
        Tweet.update(
          { id: newTweet.id_str },
          {
            id: newTweet.id_str,
            text: newTweetStr,
            timestamp: newTweet.created_at,
            userId: newTweet.user.id_str,
            userName: newTweet.user.name,
            userScreenName: newTweet.user.screen_name,
            isRead: false,
            similarity: maxSimScore
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
