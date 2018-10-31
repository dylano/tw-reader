import React, { Component } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TweetPanel from "./TweetPanel";
import EmptyPanel from "./EmptyPanel";
import { static_data } from "./static-data";
import "./App.css";

const USE_FAKE_DATA = 0;

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedFriend: null,
      isFetchingData: false,
      showAllTweets: false,
      error: `api`,
      friends: []
    };
  }

  onError(err) {
    console.log(`ERROR: ${err}`);
    this.setState({ error: "Error: " + err });
  }

  componentDidMount() {
    if (USE_FAKE_DATA) {
      this.setState({ ...static_data, error: "static-data" });
    } else {
      this.getTweetData();
    }
    // this.processTweetDataAfterFetch(tweetData.friends);
  }

  // reorganize data to easier(??) structure
  processTweetDataAfterFetch(friends) {
    let xFriends = friends.reduce((ob, friend) => {
      ob[friend.friend.screenName] = friend.friend;
      ob[friend.friend.screenName].tweets = friend.tweets;
      return ob;
    }, {});
    this.setState({ xFriends });
  }

  getTweetData = () => {
    fetch(`/api/tweets`)
      .then(res => res.json())
      .then(json => {
        this.setState({ ...json });
      })
      .catch(err => this.onError(err));
  };

  getFriend(friendId) {
    if (!friendId) {
      return null;
    }
    const friendObj = this.state.friends.find(friend => friend.friend._id === friendId);
    return friendObj ? friendObj.friend : null;
  }

  getTweetsByFriendId(friendId) {
    if (!friendId) {
      return null;
    }
    const friendObj = this.state.friends.find(friend => friend.friend._id === friendId);
    return friendObj ? friendObj.tweets : [];
  }

  onFriendSelect = friendId => {
    this.setState({ selectedFriend: friendId });
  };

  onChangeShowAllTweets = () => {
    this.setState({ showAllTweets: !this.state.showAllTweets });
  };

  onRefreshTweets = async () => {
    this.setState({ isFetchingData: !this.state.isFetchingData });
    await fetch(`/api/tweets`, { method: "POST" });
    await this.getTweetData();
    this.setState({ isFetchingData: !this.state.isFetchingData });
  };

  onTweetRead = async tweetId => {
    // find the tweet in state, change isRead, leave evrything else as is
    const newFriends = this.state.friends.map(friend => {
      const tweetIndex = friend.tweets.findIndex(tweet => tweet._id === tweetId);
      if (tweetIndex >= 0) {
        let updatedTweet = {};
        Object.assign(updatedTweet, friend.tweets[tweetIndex], { isRead: true });
        friend.tweets = [
          ...friend.tweets.slice(0, tweetIndex),
          updatedTweet,
          ...friend.tweets.slice(tweetIndex + 1, friend.tweets.length)
        ];
      }
      return friend;
    });
    this.setState({ friends: newFriends });

    // make the fetch call optimistically, don't await on result
    await fetch(`/api/tweets/${tweetId}`, { method: "PUT" });
  };

  onUserRead = async screenName => {
    this.setState({ isFetchingData: !this.state.isFetchingData, error: `read user ${screenName}` });
    await fetch(`/api/friends/${screenName}`, { method: "PUT" });
    await this.getTweetData();
    this.setState({ isFetchingData: !this.state.isFetchingData, selectedFriend: null });
  };

  chooseMainPanel() {
    if (this.state.selectedFriend) {
      return (
        <TweetPanel
          friend={this.getFriend(this.state.selectedFriend)}
          tweets={this.getTweetsByFriendId(this.state.selectedFriend)}
          showAllTweets={this.state.showAllTweets}
          onTweetRead={this.onTweetRead}
          onUserRead={this.onUserRead}
        />
      );
    } else {
      return <EmptyPanel />;
    }
  }

  buildSidebarFriendData() {
    return this.state.friends
      .map(friend => {
        let f = friend.friend;
        f.newTweetCount = friend.tweets.filter(tweet => !tweet.isRead).length;
        return f;
      })
      .sort((a, b) => {
        if (a.newTweetCount && b.newTweetCount) {
          return b.screenName.toLowerCase() < a.screenName.toLowerCase();
        } else if (a.newTweetCount) {
          return -1;
        } else if (b.newTweetCount) {
          return 1;
        }
        return b.screenName.toLowerCase() < a.screenName.toLowerCase();
      });
  }

  render() {
    const contentPanel = this.chooseMainPanel();
    return (
      <div className="App">
        <div className="app-error">{this.state.error}</div>
        <Header
          showAllTweets={this.state.showAllTweets}
          onChangeShowAllTweets={this.onChangeShowAllTweets}
          onRefreshTweets={this.onRefreshTweets}
          isFetchingData={this.state.isFetchingData}
        />
        <main className="app-main">
          <Sidebar
            friends={this.buildSidebarFriendData()}
            selectedFriend={this.state.selectedFriend}
            onFriendSelect={this.onFriendSelect}
          />
          {contentPanel}
        </main>
        <footer className="app-footer">
          <div className="app-footer-text">Footer stuff</div>
        </footer>
      </div>
    );
  }
}

export default App;
