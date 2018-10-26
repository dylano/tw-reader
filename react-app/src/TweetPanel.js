import React from "react";
import PropTypes from "prop-types";
import "./TweetPanel.css";

const TweetPanel = ({ friend, tweets, showAllTweets = false }) => {
  if (!showAllTweets) {
    tweets = tweets.filter(tweet => tweet.isRead === false);
  }

  let content;
  if (tweets.length === 0) {
    content = <div className="tweet-panel-message">No tweetz :(</div>;
  } else {
    content = tweets.sort((a, b) => a.timestamp.localeCompare(b.timestamp)).map(tweet => {
      const className = tweet.isRead ? "tweet-panel-tweet" : "tweet-panel-tweet tweet-panel-tweet-new";
      return (
        <div className={className} key={tweet._id}>
          {tweet.text}
        </div>
      );
    });
  }
  return (
    <div className="tweet-panel">
      <header className="tweet-panel-header">{friend.name}</header>
      {content}
    </div>
  );
};
TweetPanel.propTypes = {
  tweets: PropTypes.array.isRequired,
  friend: PropTypes.object.isRequired,
  showAllTweets: PropTypes.bool
};

export default TweetPanel;
