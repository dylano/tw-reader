import React, {Component} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TweetPanel from "./TweetPanel";
import EmptyPanel from "./EmptyPanel";
import {static_data} from "./static-data";
import "./App.css";

const USE_FAKE_DATA = 0;
const URL_BASE = process.env.REACT_APP_URL_BASE || ""; // if not defined, will proxy calls to localhost:5000

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedFriend: null,
      isFetchingData: false,
      showAllTweets: false,
      error: ``,
      friends: []
    };
  }

  onError(err) {
    console.log(`ERROR: ${err}`);
    this.setState({error: `Error: ${err}`});
  }

  componentDidMount() {
    if (USE_FAKE_DATA) {
      this.setState({...static_data, error: "static-data"});
    } else {
      this.getTweetData();
    }
  }

  getTweetData = () => {
    fetch(`${URL_BASE}/api/tweets`)
      .then(res => res.json())
      .then(json => {
        this.setState({...json});
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
    this.setState({selectedFriend: friendId});
  };

  onChangeShowAllTweets = () => {
    this.setState({showAllTweets: !this.state.showAllTweets});
  };

  onRefreshTweets = async () => {
    this.setState({isFetchingData: !this.state.isFetchingData});
    await fetch(`${URL_BASE}/api/tweets`, {method: "POST"});
    await this.getTweetData();
    this.setState({isFetchingData: !this.state.isFetchingData});
  };

  onTweetRead = async tweetId => {
    // find the tweet in state, change isRead, leave evrything else as is
    const newFriends = this.state.friends.map(friend => {
      const tweetIndex = friend.tweets.findIndex(tweet => tweet._id === tweetId);
      if (tweetIndex >= 0) {
        let updatedTweet = {};
        Object.assign(updatedTweet, friend.tweets[tweetIndex], {isRead: true});
        friend.tweets = [
          ...friend.tweets.slice(0, tweetIndex),
          updatedTweet,
          ...friend.tweets.slice(tweetIndex + 1, friend.tweets.length)
        ];
      }
      return friend;
    });
    this.setState({friends: newFriends});

    // make the fetch call optimistically, don't await on result
    await fetch(`${URL_BASE}/api/tweets/${tweetId}`, {method: "PUT"});
  };

  onUserRead = async screenName => {
    this.setState({isFetchingData: !this.state.isFetchingData});
    const body = JSON.stringify({action: "markRead"});
    await fetch(`${URL_BASE}/api/friends/${screenName}`, {
      method: "PUT",
      body,
      headers: {"Content-Type": "application/json"}
    });
    await this.getTweetData();
    this.setState({isFetchingData: !this.state.isFetchingData});
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
    const sortedFriends = this.state.friends
      .map(friend => {
        let f = friend.friend;
        f.newTweetCount = friend.tweets.filter(tweet => !tweet.isRead).length;
        return f;
      })
      .sort((a, b) => {
        if (a.newTweetCount && !b.newTweetCount) {
          return -1;
        } else if (b.newTweetCount && !a.newTweetCount) {
          return 1;
        }
        return a.screenName.toLowerCase().localeCompare(b.screenName.toLowerCase());
      });

    // select the first friend in list
    if (!this.state.selectedFriend && sortedFriends.length > 0) {
      this.setState({selectedFriend: sortedFriends[0]._id});
    }

    return sortedFriends;
  }

  render() {
    const contentPanel = this.chooseMainPanel();
    return (
      <div className="App">
        <div className="app-error">{this.state.error}</div>
        <Header
          className="app-header"
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
      </div>
    );
  }
}

export default App;
