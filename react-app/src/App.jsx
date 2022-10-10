/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TweetPanel from './components/TweetPanel';
import EmptyPanel from './components/EmptyPanel';
import './App.css';

const URL_BASE = process.env.REACT_APP_URL_BASE || '';

function App() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [showAllTweets, setShowAllTweets] = useState(false);
  const [error, setError] = useState(``);
  const [friends, setFriends] = useState([]);

  const onError = (err) => {
    setError(`Error: ${err}`);
  };

  const getTweetData = useCallback(async () => {
    const response = await fetch(`${URL_BASE}/api/tweets`);
    const friendData = await response.json();
    setFriends(friendData.friends);
  }, []);

  useEffect(() => {
    if (process.env.REACT_APP_USE_MOCK_SERVER === 'true') {
      setError(`mock data`);
    }
    getTweetData().catch(onError);
  }, [getTweetData]);

  const getFriend = (friendId) => {
    if (!friendId) {
      return null;
    }
    const friendObj = friends.find((friend) => friend.friend._id === friendId);
    return friendObj ? friendObj.friend : null;
  };

  const getTweetsByFriendId = (friendId) => {
    if (!friendId) {
      return null;
    }
    const friendObj = friends.find((friend) => friend.friend._id === friendId);
    return friendObj ? friendObj.tweets : [];
  };

  const onFriendSelect = (friendId) => {
    setSelectedFriend(friendId);
  };

  const onChangeShowAllTweets = () => {
    setShowAllTweets(!showAllTweets);
  };

  const onRefreshTweets = async () => {
    try {
      setIsFetchingData(true);
      await fetch(`${URL_BASE}/api/tweets`, { method: 'POST' });
      await getTweetData();
    } catch (err) {
      onError(err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const modifyTweetState = (tweetId, change) => {
    // find the tweet in state and apply the change
    const newFriends = friends.map((friend) => {
      const tweetIndex = friend.tweets.findIndex(
        (tweet) => tweet._id === tweetId
      );
      if (tweetIndex >= 0) {
        const updatedTweet = {};
        Object.assign(updatedTweet, friend.tweets[tweetIndex], change);
        friend.tweets = [
          ...friend.tweets.slice(0, tweetIndex),
          updatedTweet,
          ...friend.tweets.slice(tweetIndex + 1, friend.tweets.length),
        ];
      }
      return friend;
    });
    setFriends(newFriends);
  };

  const sendTweetChangeAction = async (tweetId, action) =>
    fetch(`${URL_BASE}/api/tweets/${tweetId}`, {
      method: 'PUT', // todo: this should be PATCH
      body: JSON.stringify({ action }),
      headers: { 'Content-Type': 'application/json' },
    });

  const onTweetRead = async (tweetId) => {
    modifyTweetState(tweetId, { isRead: true });
    await sendTweetChangeAction(tweetId, 'read');
  };

  const onTweetSave = async (tweetId, newState) => {
    modifyTweetState(tweetId, { isSaved: newState });
    await sendTweetChangeAction(tweetId, 'save');
  };

  const onUserRead = async (screenName) => {
    try {
      setIsFetchingData(true);
      const body = JSON.stringify({ action: 'markRead' });
      await fetch(`${URL_BASE}/api/friends/${screenName}`, {
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' },
      });
      await getTweetData();
    } catch (err) {
      onError(err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const buildSidebarFriendData = () => {
    const sortedFriends = friends
      .map((friend) => {
        const f = friend.friend;
        f.newTweetCount = friend.tweets.filter((tweet) => !tweet.isRead).length;
        return f;
      })
      .sort((a, b) => {
        if (a.newTweetCount && !b.newTweetCount) {
          return -1;
        }
        if (b.newTweetCount && !a.newTweetCount) {
          return 1;
        }
        return a.screenName
          .toLowerCase()
          .localeCompare(b.screenName.toLowerCase());
      });

    // select the first friend in list
    if (!selectedFriend && sortedFriends.length > 0) {
      setSelectedFriend(sortedFriends[0]._id);
    }

    return sortedFriends;
  };

  return (
    <div className="App">
      <div className="app-error">{error}</div>
      <Header
        className="app-header"
        showAllTweets={showAllTweets}
        onChangeShowAllTweets={onChangeShowAllTweets}
        onRefreshTweets={onRefreshTweets}
        isFetchingData={isFetchingData}
      />
      <main className="app-main">
        <Sidebar
          friends={buildSidebarFriendData()}
          selectedFriend={selectedFriend}
          onFriendSelect={onFriendSelect}
        />
        {selectedFriend ? (
          <TweetPanel
            friend={getFriend(selectedFriend)}
            tweets={getTweetsByFriendId(selectedFriend)}
            showAllTweets={showAllTweets}
            onTweetRead={onTweetRead}
            onTweetSave={onTweetSave}
            onUserRead={onUserRead}
          />
        ) : (
          <EmptyPanel />
        )}
      </main>
    </div>
  );
}

export default App;
