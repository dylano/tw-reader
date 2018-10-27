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

  getTweetData = () => {
    fetch(`/api/tweets`)
      .then(res => res.json())
      .then(json => {
        this.setState({ ...json });
      })
      .catch(err => this.onError(err));
  };

  // reorganize data to easier(??) structure
  processTweetDataAfterFetch(friends) {
    let xFriends = friends.reduce((ob, friend) => {
      ob[friend.friend.screenName] = friend.friend;
      ob[friend.friend.screenName].tweets = friend.tweets;
      return ob;
    }, {});
    this.setState({ xFriends });
  }

  getFriend(friendId) {
    return friendId ? this.state.friends.find(friend => friend.friend._id === friendId).friend : null;
  }

  getTweetsByFriendId(friendId) {
    return friendId ? this.state.friends.find(friend => friend.friend._id === friendId).tweets : [];
  }

  onFriendSelect = friendId => {
    this.setState({ selectedFriend: friendId });
  };

  onChangeShowAllTweets = () => {
    this.setState({ showAllTweets: !this.state.showAllTweets });
  };

  onRefreshTweets = () => {
    this.setState({ isFetchingData: !this.state.isFetchingData });
    //todo: trigger API server to update tweets and then call to getTweetData() (?)
  };

  chooseMainPanel() {
    if (this.state.selectedFriend) {
      return (
        <TweetPanel
          friend={this.getFriend(this.state.selectedFriend)}
          tweets={this.getTweetsByFriendId(this.state.selectedFriend)}
          showAllTweets={this.state.showAllTweets}
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
