import React from "react";
import PropTypes from "prop-types";
import "./TweetPanel.css";

const TweetPanel = ({ friend, tweets, onTweetRead, onUserRead, showAllTweets = false }) => {
  if (!showAllTweets) {
    tweets = tweets.filter(tweet => !tweet.isRead);
  }

  let content;
  if (tweets.length === 0) {
    content = <div className="tweet-panel-tweet tweet-panel-tweet-content">No tweetz :(</div>;
  } else {
    content = tweets.sort((a, b) => a.timestamp.localeCompare(b.timestamp)).map(tweet => {
      const className = tweet.isRead
        ? "tweet-panel-tweet-content"
        : "tweet-panel-tweet-content tweet-panel-tweet-new";
      const tweetLink = `https://twitter.com/${friend.screenName}/status/${tweet.id}`;
      return (
        <div className="tweet-panel-tweet" key={tweet._id}>
          <span className="tweet-action action-open action-left">
            <a href={tweetLink} target="_blank" rel="noopener noreferrer">
              <i class="fas fa-dove" />
            </a>
          </span>
          <div className={className}>{tweet.text}</div>
          <span
            className="tweet-action action-close action-right"
            onClick={() => onTweetRead(tweet._id)}
          >
            <i class="far fa-times-circle" />
          </span>
        </div>
      );
    });
  }
  return (
    <div className="tweet-panel">
      <header className="tweet-panel-header">
        <span className="tweet-panel-header-title">{friend.name}</span>
        <span className="tweet-panel-header-action" onClick={() => onUserRead(friend.screenName)}>
          Mark All Read
        </span>
      </header>
      {content}
    </div>
  );
};
TweetPanel.propTypes = {
  tweets: PropTypes.array.isRequired,
  friend: PropTypes.object.isRequired,
  onTweetRead: PropTypes.func.isRequired,
  onUserRead: PropTypes.func.isRequired,
  showAllTweets: PropTypes.bool
};

export default TweetPanel;
