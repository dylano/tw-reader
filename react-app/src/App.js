import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TweetPanel from './components/TweetPanel';
import EmptyPanel from './components/EmptyPanel';
import { staticData } from './static-data';
import './App.css';

const USE_FAKE_DATA = 0;
const URL_BASE = process.env.REACT_APP_URL_BASE ?? ''; // if not defined, will proxy calls to localhost:5000

const App = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [showAllTweets, setShowAllTweets] = useState(false);
  const [error, setError] = useState(``);
  const [friends, setFriends] = useState([]);


  const onError = (err) => {
    console.log(`ERROR: ${err}`);
    setError(`Error: ${err}`);
  }

  const getTweetData = () => {
    fetch(`${URL_BASE}/api/tweets`)
      .then((res) => res.json())
      .then((json) => {
        setFriends(json.friends);
      })
      .catch((err) => onError(err));
  };

  useEffect(() => {
    if (USE_FAKE_DATA) {
      setFriends(staticData.friends);
      setError(`static-data`);
    } else {
      getTweetData();
    }
  }, []);

  const getFriend = (friendId) => {
    if (!friendId) {
      return null;
    }
    const friendObj = friends.find((friend) => friend.friend._id === friendId);
    return friendObj ? friendObj.friend : null;
  }

  const getTweetsByFriendId = (friendId) => {
    if (!friendId) {
      return null;
    }
    const friendObj = friends.find((friend) => friend.friend._id === friendId);
    return friendObj ? friendObj.tweets : [];
  }

  const onFriendSelect = (friendId) => {
    setSelectedFriend(friendId);
  };

  const onChangeShowAllTweets = () => {
    setShowAllTweets(!showAllTweets);
  };

  const onRefreshTweets = async () => {
    setIsFetchingData(!isFetchingData);
    await fetch(`${URL_BASE}/api/tweets`, { method: 'POST' });
    await getTweetData();
    setIsFetchingData(!isFetchingData);
  };

  const modifyTweetState = (tweetId, change) => {
    // find the tweet in state and apply the change
    const newFriends = friends.map((friend) => {
      const tweetIndex = friend.tweets.findIndex((tweet) => tweet._id === tweetId);
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
  }

  const sendTweetChangeAction = async (tweetId, action) => fetch(`${URL_BASE}/api/tweets/${tweetId}`, {
    method: 'PUT',  // todo: this should be PATCH
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
  }

  const onUserRead = async (screenName) => {
    setIsFetchingData(!isFetchingData);
    const body = JSON.stringify({ action: 'markRead' });
    await fetch(`${URL_BASE}/api/friends/${screenName}`, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    await getTweetData();
    setIsFetchingData(!isFetchingData);
  };

  const ContentPanel = () => {
    if (selectedFriend) {
      return (
        <TweetPanel
          friend={getFriend(selectedFriend)}
          tweets={getTweetsByFriendId(selectedFriend)}
          showAllTweets={showAllTweets}
          onTweetRead={onTweetRead}
          onTweetSave={onTweetSave}
          onUserRead={onUserRead}
        />
      );
    }

    return <EmptyPanel />;
  }

  const buildSidebarFriendData = () => {
    const sortedFriends = friends.map((friend) => {
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
        return a.screenName.toLowerCase().localeCompare(b.screenName.toLowerCase());
      });

    // select the first friend in list
    if (!selectedFriend && sortedFriends.length > 0) {
      setSelectedFriend(sortedFriends[0]._id);
    }

    return sortedFriends;
  }

  return (
    <div className='App'>
      <div className='app-error'>{error}</div>
      <Header
        className='app-header'
        showAllTweets={showAllTweets}
        onChangeShowAllTweets={onChangeShowAllTweets}
        onRefreshTweets={onRefreshTweets}
        isFetchingData={isFetchingData}
      />
      <main className='app-main'>
        <Sidebar
          friends={buildSidebarFriendData()}
          selectedFriend={selectedFriend}
          onFriendSelect={onFriendSelect}
        />
        <ContentPanel />
      </main>
    </div>
  );

}

export default App;
