import React, { Component } from "react";
import ToggleButton from "react-toggle-button";
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
      fetch(`/api/tweets`)
        .then(res => res.json())
        .then(json => {
          this.setState({ ...json });
        })
        .catch(err => this.onError(err));
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

  getFriend(friendId) {
    return friendId ? this.state.friends.find(friend => friend.friend._id === friendId).friend : null;
  }

  getTweetsByFriendId(friendId) {
    return friendId ? this.state.friends.find(friend => friend.friend._id === friendId).tweets : [];
  }

  onFriendSelect = friendId => {
    this.setState({ selectedFriend: friendId });
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
        <header className="app-header">
          <div className="app-error">{this.state.error}</div>
          <div className="new-tweet-toggle">
            <span className="toggle-label">Show read?</span>
            <ToggleButton
              classname="toggle-button"
              value={this.state.showAllTweets || false}
              activeLabel="Yes"
              inactiveLabel="No"
              onToggle={value => {
                this.setState({
                  showAllTweets: !this.state.showAllTweets
                });
              }}
            />
          </div>
        </header>
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
